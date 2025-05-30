import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { registrarAuditoria } from '../utils/auditoria';

/**
 * Cliente Prisma para interacción con la base de datos.
 * Se inicializa una única instancia para todo el controlador.
 */
const prisma = new PrismaClient();

/**
 * Controlador para listar registros de auditoría con filtros y paginación.
 * Este endpoint permite ver los registros de actividad en el sistema.
 * IMPORTANTE: No se permite eliminar registros de auditoría por seguridad.
 * 
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista de registros de auditoría o mensaje de error
 */
export const listarAuditoria = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).usuario?.id || (req as any).user?.id;
    
    // Extraer parámetros de consulta para filtrado
    const { 
      modulo, 
      accion, 
      usuarioId, 
      entidadTipo, 
      entidadId,
      fechaInicio, 
      fechaFin,
      page = '1',
      limit = '10' 
    } = req.query;
    
    // Convertir parámetros de paginación a números
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Validar que los parámetros de paginación sean valores válidos
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'Parámetros de paginación inválidos. Página debe ser >= 1 y límite entre 1 y 100.' 
      });
    }
    
    // Calcular offset para paginación
    const skip = (pageNum - 1) * limitNum;
    
    // Construir filtro de búsqueda
    const where: any = {};
    
    if (modulo) where.modulo = modulo as string;
    if (accion) where.accion = accion as string;
    if (usuarioId) where.usuarioId = usuarioId as string;
    if (entidadTipo) where.entidadTipo = entidadTipo as string;
    if (entidadId) where.entidadId = entidadId as string;
    
    // Filtrar por rango de fechas si se proporciona
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      
      if (fechaInicio) {
        const fechaInicioDate = new Date(fechaInicio as string);
        if (isNaN(fechaInicioDate.getTime())) {
          return res.status(400).json({ 
            ok: false, 
            data: null, 
            error: 'Formato de fecha de inicio inválido' 
          });
        }
        where.fecha.gte = fechaInicioDate;
      }
      
      if (fechaFin) {
        const fechaFinDate = new Date(fechaFin as string);
        if (isNaN(fechaFinDate.getTime())) {
          return res.status(400).json({ 
            ok: false, 
            data: null, 
            error: 'Formato de fecha de fin inválido' 
          });
        }
        // Ajustar la fecha de fin para incluir todo el día
        fechaFinDate.setHours(23, 59, 59, 999);
        where.fecha.lte = fechaFinDate;
      }
    }
    
    // Obtener el total de registros que coinciden con los filtros
    const totalRegistros = await prisma.log_auditoria.count({ where });
    
    // Obtener registros con paginación y filtrado
    const registros = await prisma.log_auditoria.findMany({
      where,
      orderBy: {
        fecha: 'desc', // Ordenar por fecha descendente (más recientes primero)
      },
      skip,
      take: limitNum,
      include: {
        usuario: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
          },
        },
      },
    });
    
    // Calcular el total de páginas
    const totalPaginas = Math.ceil(totalRegistros / limitNum);
    
    // Registrar esta consulta en la auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_auditoria',
      descripcion: `Se consultaron ${registros.length} registros de auditoría con filtros`,
      ip: req.ip,
      entidadTipo: 'log_auditoria',
      modulo: 'auditoria',
    });
    
    // Enviar respuesta con metadatos de paginación
    return res.status(200).json({
      ok: true,
      data: {
        registros,
        paginacion: {
          total: totalRegistros,
          pagina: pageNum,
          limite: limitNum,
          paginas: totalPaginas,
        },
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Error al listar registros de auditoría:', error);
    
    // Registrar error en auditoría
    await registrarAuditoria({
      usuarioId: (req as any).usuario?.id || (req as any).user?.id,
      accion: 'listar_auditoria_fallido',
      descripcion: error.message || 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'log_auditoria',
      modulo: 'auditoria',
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al obtener registros de auditoría',
    });
  }
};

/**
 * Controlador para obtener un registro de auditoría específico por su ID.
 * 
 * @param {Request} req - Objeto de solicitud Express con ID en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Registro de auditoría o mensaje de error
 */
export const obtenerAuditoriaPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).usuario?.id || (req as any).user?.id;
    
    // Validación del ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'ID inválido' 
      });
    }
    
    // Buscar el registro de auditoría por ID
    const registro = await prisma.log_auditoria.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
          },
        },
      },
    });
    
    // Verificar si se encontró el registro
    if (!registro) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Registro de auditoría no encontrado' 
      });
    }
    
    // Registrar esta consulta en la auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'obtener_auditoria',
      descripcion: `Se consultó el registro de auditoría con ID: ${id}`,
      ip: req.ip,
      entidadTipo: 'log_auditoria',
      entidadId: id,
      modulo: 'auditoria',
    });
    
    return res.status(200).json({
      ok: true,
      data: registro,
      error: null,
    });
  } catch (error: any) {
    console.error('Error al obtener registro de auditoría por ID:', error);
    
    // Registrar error en auditoría
    await registrarAuditoria({
      usuarioId: (req as any).usuario?.id || (req as any).user?.id,
      accion: 'obtener_auditoria_fallido',
      descripcion: error.message || 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'log_auditoria',
      entidadId: req.params.id,
      modulo: 'auditoria',
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
      error: 'Error al obtener el registro de auditoría',
    });
  }
};

/**
 * Controlador para filtrar registros de auditoría por módulo.
 * 
 * @param {Request} req - Objeto de solicitud Express con módulo en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista de registros de auditoría filtrados por módulo
 */
export const filtrarAuditoriaPorModulo = async (req: Request, res: Response) => {
  try {
    const { modulo } = req.params;
    const userId = (req as any).usuario?.id || (req as any).user?.id;
    const { 
      page = '1',
      limit = '10' 
    } = req.query;
    
    // Convertir parámetros de paginación a números
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Validar que los parámetros de paginación sean valores válidos
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'Parámetros de paginación inválidos. Página debe ser >= 1 y límite entre 1 y 100.' 
      });
    }
    
    // Calcular offset para paginación
    const skip = (pageNum - 1) * limitNum;
    
    // Validación del módulo
    if (!modulo || typeof modulo !== 'string') {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'Módulo inválido' 
      });
    }
    
    // Obtener el total de registros para este módulo
    const totalRegistros = await prisma.log_auditoria.count({
      where: { modulo },
    });
    
    // Buscar registros de auditoría filtrados por módulo
    const registros = await prisma.log_auditoria.findMany({
      where: { modulo },
      orderBy: {
        fecha: 'desc',
      },
      skip,
      take: limitNum,
      include: {
        usuario: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
          },
        },
      },
    });
    
    // Calcular el total de páginas
    const totalPaginas = Math.ceil(totalRegistros / limitNum);
    
    // Registrar esta consulta en la auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'filtrar_auditoria_por_modulo',
      descripcion: `Se filtraron registros de auditoría para el módulo: ${modulo}`,
      ip: req.ip,
      entidadTipo: 'log_auditoria',
      modulo: 'auditoria',
    });
    
    return res.status(200).json({
      ok: true,
      data: {
        registros,
        modulo,
        paginacion: {
          total: totalRegistros,
          pagina: pageNum,
          limite: limitNum,
          paginas: totalPaginas,
        },
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Error al filtrar registros de auditoría por módulo:', error);
    
    // Registrar error en auditoría
    await registrarAuditoria({
      usuarioId: (req as any).usuario?.id || (req as any).user?.id,
      accion: 'filtrar_auditoria_por_modulo_fallido',
      descripcion: error.message || 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'log_auditoria',
      modulo: 'auditoria',
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al filtrar registros de auditoría por módulo',
    });
  }
};

/**
 * Controlador para filtrar registros de auditoría por usuario.
 * 
 * @param {Request} req - Objeto de solicitud Express con ID de usuario en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista de registros de auditoría filtrados por usuario
 */
export const filtrarAuditoriaPorUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).usuario?.id || (req as any).user?.id;
    const { 
      page = '1',
      limit = '10' 
    } = req.query;
    
    // Convertir parámetros de paginación a números
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Validar que los parámetros de paginación sean valores válidos
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'Parámetros de paginación inválidos. Página debe ser >= 1 y límite entre 1 y 100.' 
      });
    }
    
    // Calcular offset para paginación
    const skip = (pageNum - 1) * limitNum;
    
    // Validación del ID de usuario
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'ID de usuario inválido' 
      });
    }
    
    // Verificar si el usuario existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre_completo: true },
    });
    
    if (!usuarioExiste) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Usuario no encontrado' 
      });
    }
    
    // Obtener el total de registros para este usuario
    const totalRegistros = await prisma.log_auditoria.count({
      where: { usuarioId: id },
    });
    
    // Buscar registros de auditoría filtrados por usuario
    const registros = await prisma.log_auditoria.findMany({
      where: { usuarioId: id },
      orderBy: {
        fecha: 'desc',
      },
      skip,
      take: limitNum,
      include: {
        usuario: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
          },
        },
      },
    });
    
    // Calcular el total de páginas
    const totalPaginas = Math.ceil(totalRegistros / limitNum);
    
    // Registrar esta consulta en la auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'filtrar_auditoria_por_usuario',
      descripcion: `Se filtraron registros de auditoría para el usuario: ${usuarioExiste.nombre_completo} (${id})`,
      ip: req.ip,
      entidadTipo: 'log_auditoria',
      entidadId: id,
      modulo: 'auditoria',
    });
    
    return res.status(200).json({
      ok: true,
      data: {
        registros,
        usuario: usuarioExiste,
        paginacion: {
          total: totalRegistros,
          pagina: pageNum,
          limite: limitNum,
          paginas: totalPaginas,
        },
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Error al filtrar registros de auditoría por usuario:', error);
    
    // Registrar error en auditoría
    await registrarAuditoria({
      usuarioId: (req as any).usuario?.id || (req as any).user?.id,
      accion: 'filtrar_auditoria_por_usuario_fallido',
      descripcion: error.message || 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'log_auditoria',
      entidadId: req.params.id,
      modulo: 'auditoria',
    });
    
    // Manejo detallado de errores
    if (error instanceof Error && typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2023') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID de usuario inválido'
      });
    }
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al filtrar registros de auditoría por usuario',
    });
  }
};
