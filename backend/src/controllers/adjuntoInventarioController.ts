import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { registrarAuditoria } from '../utils/auditoria';

const prisma = new PrismaClient();

// Subir uno o varios archivos adjuntos a un movimiento de inventario
export const subirAdjuntos = async (req: Request, res: Response) => {
  const movimientoId = req.params.movimientoId;
  const userId = (req as any).user?.id;
  const files = req.files as Express.Multer.File[];
  
  try {
    // Verificar que el movimiento existe
    const movimiento = await prisma.movimiento_inventario.findUnique({
      where: { id: movimientoId }
    });
    
    if (!movimiento) {
      await registrarAuditoria({
        usuarioId: userId,
        accion: 'ADJUNTO_ERROR',
        descripcion: `Error al subir adjunto: Movimiento de inventario no encontrado (ID: ${movimientoId})`,
        ip: req.ip,
        entidadTipo: 'movimiento_inventario',
        entidadId: movimientoId,
        modulo: 'inventario'
      });
      
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Movimiento de inventario no encontrado'
      });
    }
    
    // Procesar cada archivo
    const adjuntosCreados = [];
    
    for (const file of files) {
      // Crear el registro del archivo adjunto
      const archivoAdjunto = await prisma.archivo_adjunto.create({
        data: {
          nombre_archivo: file.originalname,
          url: file.path,
          tipo: file.mimetype,
          tamanio: file.size,
          extension: path.extname(file.originalname).substring(1),
          subido_por: userId,
          creado_por: userId,
          creado_en: new Date()
        }
      });
      
      // Vincular el archivo con el movimiento de inventario
      const archivoEntidad = await prisma.archivo_entidad.create({
        data: {
          archivo_id: archivoAdjunto.id,
          entidad_tipo: 'movimiento_inventario',
          entidad_id: movimientoId,
          creado_por: userId,
          creado_en: new Date()
        }
      });
      
      adjuntosCreados.push({
        id: archivoAdjunto.id,
        nombre: archivoAdjunto.nombre_archivo,
        tipo: archivoAdjunto.tipo,
        tamanio: archivoAdjunto.tamanio,
        extension: archivoAdjunto.extension,
        fecha: archivoAdjunto.creado_en
      });
      
      // Registrar en auditoría
      await registrarAuditoria({
        usuarioId: userId,
        accion: 'SUBIR_ADJUNTO',
        descripcion: `Archivo adjunto subido para movimiento de inventario (ID: ${movimientoId}, Archivo: ${file.originalname})`,
        ip: req.ip,
        entidadTipo: 'archivo_adjunto',
        entidadId: archivoAdjunto.id,
        modulo: 'inventario'
      });
    }
    
    return res.status(201).json({
      ok: true,
      data: adjuntosCreados,
      error: null
    });
    
  } catch (error: any) {
    console.error(error);
    
    // Registrar el error en auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'ADJUNTO_ERROR',
      descripcion: `Error al subir adjunto: ${error.message}`,
      ip: req.ip,
      entidadTipo: 'movimiento_inventario',
      entidadId: movimientoId,
      modulo: 'inventario'
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al subir archivos adjuntos: ' + error.message
    });
  }
};

// Listar los adjuntos de un movimiento de inventario
export const listarAdjuntos = async (req: Request, res: Response) => {
  const movimientoId = req.params.movimientoId;
  const userId = (req as any).user?.id;
  
  try {
    // Verificar que el movimiento existe
    const movimiento = await prisma.movimiento_inventario.findUnique({
      where: { id: movimientoId }
    });
    
    if (!movimiento) {
      await registrarAuditoria({
        usuarioId: userId,
        accion: 'LISTAR_ADJUNTOS_ERROR',
        descripcion: `Error al listar adjuntos: Movimiento de inventario no encontrado (ID: ${movimientoId})`,
        ip: req.ip,
        entidadTipo: 'movimiento_inventario',
        entidadId: movimientoId,
        modulo: 'inventario'
      });
      
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Movimiento de inventario no encontrado'
      });
    }
    
    // Buscar todas las relaciones archivo_entidad para este movimiento
    const archivosEntidad = await prisma.archivo_entidad.findMany({
      where: {
        entidad_tipo: 'movimiento_inventario',
        entidad_id: movimientoId,
        anulado_en: null // Solo los no anulados
      },
      include: {
        archivo_adjunto: {
          include: {
            usuario: {
              select: {
                nombre_completo: true
              }
            }
          }
        }
      }
    });
    
    // Mapear los resultados para devolver información relevante
    const adjuntos = archivosEntidad.map(ae => {
      const archivo = ae.archivo_adjunto;
      if (!archivo) return null;
      
      return {
        id: archivo.id,
        nombre: archivo.nombre_archivo,
        tipo: archivo.tipo,
        tamanio: archivo.tamanio,
        extension: archivo.extension,
        fecha: archivo.creado_en,
        subidoPor: archivo.usuario?.nombre_completo || 'Usuario desconocido'
      };
    }).filter(Boolean);
    
    // Registrar en auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'LISTAR_ADJUNTOS',
      descripcion: `Listado de adjuntos para movimiento de inventario (ID: ${movimientoId})`,
      ip: req.ip,
      entidadTipo: 'movimiento_inventario',
      entidadId: movimientoId,
      modulo: 'inventario'
    });
    
    return res.status(200).json({
      ok: true,
      data: adjuntos,
      error: null
    });
    
  } catch (error: any) {
    console.error(error);
    
    // Registrar el error en auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'LISTAR_ADJUNTOS_ERROR',
      descripcion: `Error al listar adjuntos: ${error.message}`,
      ip: req.ip,
      entidadTipo: 'movimiento_inventario',
      entidadId: movimientoId,
      modulo: 'inventario'
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al listar archivos adjuntos: ' + error.message
    });
  }
};

// Descargar un adjunto por su ID
export const descargarAdjunto = async (req: Request, res: Response) => {
  const adjuntoId = req.params.adjuntoId;
  const userId = (req as any).user?.id;
  
  try {
    // Buscar el archivo adjunto
    const adjunto = await prisma.archivo_adjunto.findUnique({
      where: { id: adjuntoId }
    });
    
    if (!adjunto || adjunto.anulado_en) {
      await registrarAuditoria({
        usuarioId: userId,
        accion: 'DESCARGAR_ADJUNTO_ERROR',
        descripcion: `Error al descargar adjunto: Archivo no encontrado o anulado (ID: ${adjuntoId})`,
        ip: req.ip,
        entidadTipo: 'archivo_adjunto',
        entidadId: adjuntoId,
        modulo: 'inventario'
      });
      
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Archivo adjunto no encontrado o anulado'
      });
    }
    
    // Comprobar que el archivo existe físicamente
    const filePath = adjunto.url;
    if (!fs.existsSync(filePath)) {
      await registrarAuditoria({
        usuarioId: userId,
        accion: 'DESCARGAR_ADJUNTO_ERROR',
        descripcion: `Error al descargar adjunto: Archivo físico no encontrado (ID: ${adjuntoId}, Path: ${filePath})`,
        ip: req.ip,
        entidadTipo: 'archivo_adjunto',
        entidadId: adjuntoId,
        modulo: 'inventario'
      });
      
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'El archivo físico no se encuentra en el sistema'
      });
    }
    
    // Registrar en auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'DESCARGAR_ADJUNTO',
      descripcion: `Descarga de archivo adjunto (ID: ${adjuntoId}, Nombre: ${adjunto.nombre_archivo})`,
      ip: req.ip,
      entidadTipo: 'archivo_adjunto',
      entidadId: adjuntoId,
      modulo: 'inventario'
    });
    
    // Enviar el archivo como respuesta
    res.download(filePath, adjunto.nombre_archivo);
    
  } catch (error: any) {
    console.error(error);
    
    // Registrar el error en auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'DESCARGAR_ADJUNTO_ERROR',
      descripcion: `Error al descargar adjunto: ${error.message}`,
      ip: req.ip,
      entidadTipo: 'archivo_adjunto',
      entidadId: adjuntoId,
      modulo: 'inventario'
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al descargar archivo adjunto: ' + error.message
    });
  }
};

// Eliminar (soft delete) un adjunto por su ID
export const eliminarAdjunto = async (req: Request, res: Response) => {
  const adjuntoId = req.params.adjuntoId;
  const userId = (req as any).user?.id;
  
  try {
    // Buscar el archivo adjunto
    const adjunto = await prisma.archivo_adjunto.findUnique({
      where: { id: adjuntoId }
    });
    
    if (!adjunto || adjunto.anulado_en) {
      await registrarAuditoria({
        usuarioId: userId,
        accion: 'ELIMINAR_ADJUNTO_ERROR',
        descripcion: `Error al eliminar adjunto: Archivo no encontrado o ya anulado (ID: ${adjuntoId})`,
        ip: req.ip,
        entidadTipo: 'archivo_adjunto',
        entidadId: adjuntoId,
        modulo: 'inventario'
      });
      
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Archivo adjunto no encontrado o ya anulado'
      });
    }
    
    // Realizar soft delete (anulación lógica)
    const adjuntoAnulado = await prisma.archivo_adjunto.update({
      where: { id: adjuntoId },
      data: {
        anulado_en: new Date(),
        anulado_por: userId
      }
    });
    
    // También anular la relación en archivo_entidad
    await prisma.archivo_entidad.updateMany({
      where: { archivo_id: adjuntoId },
      data: {
        anulado_en: new Date(),
        anulado_por: userId
      }
    });
    
    // Registrar en auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'ELIMINAR_ADJUNTO',
      descripcion: `Eliminación lógica de archivo adjunto (ID: ${adjuntoId}, Nombre: ${adjunto.nombre_archivo})`,
      ip: req.ip,
      entidadTipo: 'archivo_adjunto',
      entidadId: adjuntoId,
      modulo: 'inventario'
    });
    
    return res.status(200).json({
      ok: true,
      data: {
        id: adjuntoAnulado.id,
        nombre: adjuntoAnulado.nombre_archivo,
        mensaje: 'Archivo adjunto eliminado correctamente'
      },
      error: null
    });
    
  } catch (error: any) {
    console.error(error);
    
    // Registrar el error en auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'ELIMINAR_ADJUNTO_ERROR',
      descripcion: `Error al eliminar adjunto: ${error.message}`,
      ip: req.ip,
      entidadTipo: 'archivo_adjunto',
      entidadId: adjuntoId,
      modulo: 'inventario'
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al eliminar archivo adjunto: ' + error.message
    });
  }
};
