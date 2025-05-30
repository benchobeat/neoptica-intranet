import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { registrarAuditoria } from '../utils/auditoria';

/**
 * Cliente Prisma para interacción con la base de datos.
 * Se inicializa una única instancia para todo el controlador.
 */
const prisma = new PrismaClient();

/**
 * Controlador para crear una nueva sucursal.
 * 
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Respuesta con la sucursal creada o mensaje de error
 */
export const crearSucursal = async (req: Request, res: Response) => {
  try {
    const { nombre, direccion, latitud, longitud, telefono, email, estado } = req.body;
    const userId = (req as any).usuario?.id || (req as any).user?.id;

    // Validación estricta del nombre
    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'El nombre es obligatorio y debe ser una cadena de texto.' 
      });
    }
    
    // Validar longitud del nombre
    const nombreLimpio = nombre.trim();
    if (nombreLimpio.length < 3 || nombreLimpio.length > 100) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'El nombre debe tener al menos 3 caracteres.' 
      });
    }
    
    // Validar teléfono si se proporciona
    if (telefono && (typeof telefono !== 'string' || !/^\d{10}$/.test(telefono))) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'El teléfono debe tener 10 dígitos.' 
      });
    }
    
    // Validar email si se proporciona
    if (email) {
      if (typeof email !== 'string' || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.status(400).json({ 
          ok: false, 
          data: null, 
          error: 'El email tiene formato inválido.' 
        });
      }
    }
    
    // Validar coordenadas geográficas si se proporcionan
    const latitudParsed = latitud ? parseFloat(latitud) : null;
    const longitudParsed = longitud ? parseFloat(longitud) : null;
    
    if (latitud && (isNaN(latitudParsed) || latitudParsed < -90 || latitudParsed > 90)) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'La latitud debe ser un número entre -90 y 90.' 
      });
    }
    
    if (longitud && (isNaN(longitudParsed) || longitudParsed < -180 || longitudParsed > 180)) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'La longitud debe ser un número entre -180 y 180.' 
      });
    }
    
    // Verificar si ya existe una sucursal con el mismo nombre
    const sucursalExistente = await prisma.sucursal.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: 'insensitive', // Búsqueda case-insensitive
        },
        anulado_en: null, // Solo sucursales no anuladas
      },
    });
    
    if (sucursalExistente) {
      return res.status(409).json({ 
        ok: false, 
        data: null, 
        error: 'Ya existe una sucursal con ese nombre.' 
      });
    }
    
    // Verificar si ya existe una sucursal con el mismo email (si se proporciona)
    if (email) {
      const emailExistente = await prisma.sucursal.findFirst({
        where: {
          email: {
            equals: email.trim(),
            mode: 'insensitive', // Búsqueda case-insensitive
          },
          anulado_en: null, // Solo sucursales no anuladas
        },
      });
      
      if (emailExistente) {
        return res.status(409).json({ 
          ok: false, 
          data: null, 
          error: 'Ya existe una sucursal con ese email.' 
        });
      }
    }

    // Crear la nueva sucursal
    const nuevaSucursal = await prisma.sucursal.create({
      data: {
        nombre: nombreLimpio,
        direccion: direccion?.trim() || null,
        latitud: latitudParsed,
        longitud: longitudParsed,
        telefono: telefono?.trim() || null,
        email: email?.trim().toLowerCase() || null,
        estado: estado !== undefined ? estado : true,
        creado_por: userId || null,
        creado_en: new Date(),
      },
    });
    
    // Registrar auditoría de creación exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'crear_sucursal_exitoso',
      descripcion: `Sucursal creada: ${nuevaSucursal.nombre}`,
      ip: req.ip,
      entidadTipo: 'sucursal',
      entidadId: nuevaSucursal.id,
      modulo: 'sucursales',
    });

    return res.status(201).json({ 
      ok: true, 
      data: nuevaSucursal, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al crear sucursal:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: (req as any).usuario?.id || (req as any).user?.id,
      accion: 'crear_sucursal_fallido',
      descripcion: error.message || 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'sucursal',
      modulo: 'sucursales',
    });
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al crear la sucursal.' 
    });
  }
};

/**
 * Controlador para listar todas las sucursales con filtros opcionales.
 * 
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista de sucursales o mensaje de error
 */
export const listarSucursales = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    // Preparar filtros
    const filtro: any = {
      anulado_en: null, // Solo sucursales no anuladas (soft delete)
    };
    
    // Filtro adicional por estado si se proporciona en la consulta
    if (req.query.estado !== undefined) {
      filtro.estado = req.query.estado === 'true';
    }
    
    // Buscar sucursales según filtros y ordenar alfabéticamente
    const sucursales = await prisma.sucursal.findMany({
      where: filtro,
      orderBy: {
        nombre: 'asc', // Ordenar alfabéticamente
      },
    });
    
    // Registrar auditoría de listado exitoso
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_sucursales',
      descripcion: `Se listaron ${sucursales.length} sucursales`,
      ip: req.ip,
      entidadTipo: 'sucursal',
      modulo: 'sucursales',
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: sucursales, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al listar sucursales:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_sucursales_fallido',
      descripcion: error.message || 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'sucursal',
      modulo: 'sucursales',
    });
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al obtener el listado de sucursales.' 
    });
  }
};

/**
 * Controlador para obtener una sucursal por su ID.
 * 
 * @param {Request} req - Objeto de solicitud Express con ID de sucursal en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos de la sucursal o mensaje de error
 */
export const obtenerSucursalPorId = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  const { id } = req.params;
  try {
    const { id } = req.params;
    
    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'ID inválido' 
      });
    }
    
    // Buscar la sucursal por ID
    const sucursal = await prisma.sucursal.findUnique({
      where: {
        id,
        anulado_en: null, // Solo sucursales no anuladas (soft delete)
      },
    });
    
    // Verificar si se encontró la sucursal
    if (!sucursal) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Sucursal no encontrada.' 
      });
    }
    
    // Registrar auditoría de consulta exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'obtener_sucursal',
      descripcion: `Se consultó la sucursal: ${sucursal.nombre}`,
      ip: req.ip,
      entidadTipo: 'sucursal',
      entidadId: id,
      modulo: 'sucursales',
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: sucursal, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al obtener sucursal por ID:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'obtener_sucursal_fallido',
      descripcion: error.message || 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'sucursal',
      entidadId: id,
      modulo: 'sucursales',
    });
    
    // Manejo detallado de errores
    if (error instanceof Error && typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2023') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido'
      });
    }
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al obtener la sucursal.' 
    });
  }
};

/**
 * Controlador para actualizar una sucursal existente.
 * 
 * @param {Request} req - Objeto de solicitud Express con ID en params y datos en body
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos de la sucursal actualizada o mensaje de error
 */
export const actualizarSucursal = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  const { id } = req.params;
  try {
    const { nombre, direccion, latitud, longitud, telefono, email, estado } = req.body;
    
    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido'
      });
    }
    
    // Verificar si la sucursal existe
    const sucursalExistente = await prisma.sucursal.findUnique({
      where: {
        id,
        anulado_en: null, // Solo sucursales no anuladas
      },
    });
    
    if (!sucursalExistente) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Sucursal no encontrada.' 
      });
    }
    
    // Preparar objeto de datos a actualizar
    const datosActualizados: any = {
      // Agregar campos de auditoría
      modificado_por: userId || null,
      modificado_en: new Date(),
    };
    
    // Validar y procesar nombre si se proporcionó
    if (nombre !== undefined) {
      if (!nombre || typeof nombre !== 'string') {
        return res.status(400).json({ 
          ok: false, 
          data: null, 
          error: 'El nombre debe ser una cadena de texto válida.'
        });
      }
      
      const nombreLimpio = nombre.trim();
      
      // Validar longitud
      if (nombreLimpio.length < 3 || nombreLimpio.length > 100) {
        return res.status(400).json({ 
          ok: false, 
          data: null, 
          error: 'El nombre debe tener al menos 3 caracteres.' 
        });
      }
      
      // Verificar que no exista otra sucursal con el mismo nombre (excepto la actual)
      const nombreDuplicado = await prisma.sucursal.findFirst({
        where: {
          nombre: {
            equals: nombreLimpio,
            mode: 'insensitive', // Búsqueda case-insensitive
          },
          id: {
            not: id, // Excluir la sucursal actual de la búsqueda
          },
          anulado_en: null, // Solo sucursales no anuladas
        },
      });
      
      if (nombreDuplicado) {
        return res.status(409).json({ 
          ok: false, 
          data: null, 
          error: 'Ya existe otra sucursal con ese nombre.' 
        });
      }
      
      datosActualizados.nombre = nombreLimpio;
    }
    
    // Validar y procesar dirección si se proporcionó
    if (direccion !== undefined) {
      datosActualizados.direccion = direccion === null ? null : direccion.trim();
    }
    
    // Validar y procesar teléfono si se proporcionó
    if (telefono !== undefined) {
      if (telefono !== null) {
        if (typeof telefono !== 'string' || !/^\d{10}$/.test(telefono)) {
          return res.status(400).json({ 
            ok: false, 
            data: null, 
            error: 'El teléfono debe tener 10 dígitos.' 
          });
        }
        datosActualizados.telefono = telefono.trim();
      } else {
        datosActualizados.telefono = null;
      }
    }
    
    // Validar y procesar email si se proporcionó
    if (email !== undefined) {
      if (email !== null) {
        if (typeof email !== 'string' || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
          return res.status(400).json({ 
            ok: false, 
            data: null, 
            error: 'El email tiene formato inválido.' 
          });
        }
        
        // Verificar que no exista otra sucursal con el mismo email (excepto la actual)
        const emailDuplicado = await prisma.sucursal.findFirst({
          where: {
            email: {
              equals: email.trim(),
              mode: 'insensitive', // Búsqueda case-insensitive
            },
            id: {
              not: id, // Excluir la sucursal actual de la búsqueda
            },
            anulado_en: null, // Solo sucursales no anuladas
          },
        });
        
        if (emailDuplicado) {
          return res.status(409).json({ 
            ok: false, 
            data: null, 
            error: 'Ya existe otra sucursal con ese email.' 
          });
        }
        
        datosActualizados.email = email.trim();
      } else {
        datosActualizados.email = null;
      }
    }
    
    // Validar y procesar coordenadas si se proporcionaron
    if (latitud !== undefined) {
      if (latitud !== null) {
        const latitudParsed = parseFloat(latitud);
        if (isNaN(latitudParsed) || latitudParsed < -90 || latitudParsed > 90) {
          return res.status(400).json({ 
            ok: false, 
            data: null, 
            error: 'La latitud debe ser un número entre -90 y 90.' 
          });
        }
        datosActualizados.latitud = latitudParsed;
      } else {
        datosActualizados.latitud = null;
      }
    }
    
    if (longitud !== undefined) {
      if (longitud !== null) {
        const longitudParsed = parseFloat(longitud);
        if (isNaN(longitudParsed) || longitudParsed < -180 || longitudParsed > 180) {
          return res.status(400).json({ 
            ok: false, 
            data: null, 
            error: 'La longitud debe ser un número entre -180 y 180.' 
          });
        }
        datosActualizados.longitud = longitudParsed;
      } else {
        datosActualizados.longitud = null;
      }
    }
    
    // Procesar estado si se proporcionó
    if (estado !== undefined) {
      datosActualizados.estado = estado;
    }
    
    // Si no hay datos para actualizar, retornar error
    if (Object.keys(datosActualizados).length === 0) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'No se proporcionaron datos para actualizar.' 
      });
    }
    
    // Actualizar la sucursal en la base de datos
    const sucursalActualizada = await prisma.sucursal.update({
      where: { id },
      data: datosActualizados,
    });
    
    // Registrar auditoría de actualización exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'actualizar_sucursal',
      descripcion: `Se actualizó la sucursal: ${sucursalActualizada.nombre}`,
      ip: req.ip,
      entidadTipo: 'sucursal',
      entidadId: id,
      modulo: 'sucursales',
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: sucursalActualizada, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al actualizar sucursal:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'actualizar_sucursal_fallido',
      descripcion: error.message || 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'sucursal',
      entidadId: id,
      modulo: 'sucursales',
    });
    
    // Manejo detallado de errores de Prisma
    if (error instanceof Error && typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2023') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido'
      });
    }
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al actualizar la sucursal.' 
    });
  }
};

/**
 * Controlador para eliminar (soft delete) una sucursal.
 * Marca la sucursal como inactiva en lugar de eliminarla físicamente.
 * 
 * @param {Request} req - Objeto de solicitud Express con ID en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Confirmación de eliminación o mensaje de error
 */
export const eliminarSucursal = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  const { id } = req.params;
  try {
    // Ya tenemos el id y userId del bloque superior
    
    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido'
      });
    }
    
    // Verificar si la sucursal existe y no está anulada
    const sucursalExistente = await prisma.sucursal.findUnique({
      where: {
        id,
        anulado_en: null, // Solo sucursales no anuladas
      },
    });
    
    if (!sucursalExistente) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Sucursal no encontrada.' 
      });
    }
    
    // Verificar si la sucursal tiene elementos asociados que impidan su eliminación
    // Ejemplo: citas, inventarios, etc.
    const citasAsociadas = await prisma.cita.count({
      where: {
        sucursal_id: id,
        anulado_en: null, // Solo citas no anuladas
      },
    });
    
    if (citasAsociadas > 0) {
      return res.status(409).json({ 
        ok: false, 
        data: null, 
        error: `No se puede eliminar la sucursal porque tiene ${citasAsociadas} cita(s) asociada(s).` 
      });
    }
    
    // Realizar soft delete (actualizando el campo anulado_en)
    const fechaActual = new Date();
    const sucursalAnulada = await prisma.sucursal.update({
      where: { id },
      data: {
        anulado_en: fechaActual,
        anulado_por: userId || null,
        estado: false, // También marcar como inactivo
      },
    });
    
    // Registrar auditoría de eliminación exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'eliminar_sucursal',
      descripcion: `Se eliminó (soft delete) la sucursal con ID: ${id}`,
      ip: req.ip,
      entidadTipo: 'sucursal',
      entidadId: id,
      modulo: 'sucursales',
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: 'Sucursal eliminada correctamente.', 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al eliminar sucursal:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'eliminar_sucursal_fallido',
      descripcion: error.message || 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'sucursal',
      entidadId: id,
      modulo: 'sucursales',
    });
    
    // Manejo detallado de errores de Prisma
    if (error instanceof Error && typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2023') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido'
      });
    }
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al eliminar la sucursal.' 
    });
  }
};

