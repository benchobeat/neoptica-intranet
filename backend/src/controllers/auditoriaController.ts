import { PrismaClient, Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

import { logSuccess, logError } from '../utils/audit';
import { success, fail } from '../utils/response';

/**
 * Cliente Prisma para interacción con la base de datos.
 * Se inicializa una única instancia para todo el controlador.
 */
const prisma = new PrismaClient();

// Tipos para el controlador de auditoría
type SortOrder = 'asc' | 'desc';
type FilterParams = {
  [key: string]: any;
};

/**
 * Controlador unificado para obtener registros de auditoría con opciones avanzadas de filtrado y paginación.
 * Este endpoint permite consultar, filtrar y paginar los registros de auditoría del sistema.
 * 
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista paginada y filtrada de registros de auditoría o mensaje de error
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    // Obtener ID del usuario actual para auditoría
    const userId = (req as any).usuario?.id || (req as any).user?.id;

    // Parámetros de paginación
    const page = parseInt(req.query.page as string || '1', 10);
    const perPage = parseInt(req.query.perPage as string || '20', 10);
    
    // Parámetros de ordenamiento
    const sortBy = (req.query.sortBy as string) || 'fecha';
    const sortOrder = ((req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc') as SortOrder;

    // Validación de parámetros de paginación
    if (isNaN(page) || isNaN(perPage) || page < 1 || perPage < 1 || perPage > 100) {
      return res.status(400).json(
        fail('Parámetros de paginación inválidos. Página debe ser >= 1 y registros por página entre 1 y 100.')
      );
    }

    // Calcular offset para paginación
    const skip = (page - 1) * perPage;
    
    // Construir objeto where para filtros dinámicos
    const where: FilterParams = {};
    
    // Procesar todos los posibles filtros
    const allowedFilters = [
      'id',
      'usuarioId',
      'accion',
      'ip',
      'tipoCorreo',
      'correoDestino',
      'usuarioDestino',
      'entidadTipo',
      'entidadId',
      'estadoEnvio',
      'mensajeError',
      'enviadoPor',
      'origenEnvio',
      'intentos',
      'modulo',
      'movimientoId',
      'resultado'
    ];

    // Aplicar los filtros permitidos desde query params
    for (const filter of allowedFilters) {
      if (req.query[filter] !== undefined && req.query[filter] !== '') {
        // Para campos de ID, asegurar que sea un string
        if (filter.endsWith('Id')) {
          where[filter] = req.query[filter] as string;
        } 
        // Para campos numéricos
        else if (filter === 'intentos') {
          where[filter] = parseInt(req.query[filter] as string, 10);
        } 
        // Para campos que requieren igualdad exacta
        else if (filter === 'resultado' || filter === 'accion') {
          where[filter] = req.query[filter] as string;
        }
        // Para el resto, aplicar filtro de texto con contains para búsqueda parcial
        else {
          where[filter] = {
            contains: req.query[filter] as string,
            mode: 'insensitive'
          };
        }
      }
    }

    // Manejo especial para filtros de fecha
    if (req.query.fechaInicio || req.query.fechaFin) {
      where.fecha = {};

      if (req.query.fechaInicio) {
        const fechaInicio = new Date(req.query.fechaInicio as string);
        if (!isNaN(fechaInicio.getTime())) {
          where.fecha.gte = fechaInicio;
        } else {
          return res.status(400).json(fail('Formato de fecha de inicio inválido. Use YYYY-MM-DD.'));
        }
      }

      if (req.query.fechaFin) {
        const fechaFin = new Date(req.query.fechaFin as string);
        if (!isNaN(fechaFin.getTime())) {
          // Ajustar la fecha final para incluir todo el día
          fechaFin.setHours(23, 59, 59, 999);
          where.fecha.lte = fechaFin;
        } else {
          return res.status(400).json(fail('Formato de fecha de fin inválido. Use YYYY-MM-DD.'));
        }
      }
    }

    // Manejo de ordenamiento dinámico
    const orderBy: { [key: string]: SortOrder } = {};
    if (allowedFilters.includes(sortBy) || sortBy === 'fecha') {
      orderBy[sortBy] = sortOrder;
    } else {
      // Si el campo de ordenamiento no es válido, usar fecha por defecto
      orderBy.fecha = sortOrder;
    }

    // Obtener el total de registros que coinciden con los filtros
    const totalItems = await prisma.logAuditoria.count({ where });

    // Obtener registros con paginación, filtros y ordenamiento
    const logs = await prisma.logAuditoria.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    // Calcular el total de páginas
    const totalPages = Math.ceil(totalItems / perPage);

    // Registrar esta acción en la auditoría
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'log_auditoria',
      module: 'auditoria',
      action: 'consultar_auditoria_exitoso',
      message: `Consulta de registros de auditoría (${logs.length} registros) con filtros aplicados`,
      details: {
        ipSolicitante: req.ip,
        totalRegistros: logs.length,
        filtrosAplicados: where,
      },
    });
    
    // Enviar respuesta con metadatos de paginación
    return res.status(200).json(
      success({
        items: logs,
        meta: {
          page,
          perPage,
          totalItems,
          totalPages
        }
      })
    );
  } catch (error: any) {
    console.error('Error al consultar registros de auditoría:', error);

    // Registrar error en auditoría
    await logError({
      userId: (req as any).usuario?.id || (req as any).user?.id,
      ip: req.ip,
      entityType: 'log_auditoria',
      module: 'auditoria',
      action: 'error_consultar_auditoria',
      message: 'Error al consultar registros de auditoría',
      error: error instanceof Error ? error : new Error(error.message) + '. 500',
      context: {
        ipSolicitante: req.ip,
        totalRegistros: req.query.perPage,
        filtrosAplicados: req.query,
      },
    });

    return res.status(500).json(fail('Error al consultar registros de auditoría'));
  }
};

export default {
  getAuditLogs
};
