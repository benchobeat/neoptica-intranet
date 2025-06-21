import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
interface JsonArray extends Array<JsonValue> {}

export type AuditoriaParams = {
  accion: string;
  entidadTipo?: string;
  entidadId?: string | null;
  descripcion: string | Record<string, unknown>;
  ip?: string;
  modulo: string;
  usuarioId?: string;
  mensajeError?: string;
  resultado?: 'exitoso' | 'fallido' | 'pendiente';
  datosAdicionales?: Record<string, unknown>;
};

type SuccessAuditParams = {
  userId?: string;
  ip?: string;
  entityType: string;
  entityId?: string | null;
  module: string;
  action: string;
  message: string;
  details?: Record<string, unknown>;
};

type ErrorAuditParams = {
  userId?: string;
  ip?: string;
  entityType: string;
  entityId?: string | null;
  module: string;
  action: string;
  message: string;
  error: unknown;
  context?: Record<string, unknown>;
};

/**
 * Helper function to log successful operations
 */
export const logSuccess = async (params: SuccessAuditParams): Promise<void> => {
  const { userId, ip, entityType, entityId, module, action, message, details } = params;

  await registrarAuditoria({
    usuarioId: userId,
    accion: action,
    resultado: 'exitoso',
    descripcion: {
      mensaje: message,
      timestamp: new Date().toISOString(),
      ...(details && { detalles: details }),
    },
    ip,
    entidadTipo: entityType,
    entidadId: entityId,
    modulo: module,
  });
};

/**
 * Helper function to log errors
 */
export const logError = async (params: ErrorAuditParams): Promise<void> => {
  const { userId, ip, entityType, entityId, module, action, message, error, context } = params;
  const errorObj = error as Error;

  const errorMessage = error instanceof Error ? error.message : String(error);
  await registrarAuditoria({
    usuarioId: userId,
    accion: action,
    resultado: 'fallido',
    mensajeError: errorMessage,
    descripcion: {
      mensaje: message,
      timestamp: new Date().toISOString(),
      ...(context && { contexto: context }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: errorObj.stack,
        error: errorMessage,
      }),
    },
    ip,
    entidadTipo: entityType,
    entidadId: entityId,
    modulo: module,
  });
};

/**
 * Registra una acción en el sistema de auditoría.
 * Si no se puede guardar en la base de datos, registra el error en la consola.
 */
export const registrarAuditoria = async (params: AuditoriaParams): Promise<void> => {
  const {
    accion,
    resultado,
    mensajeError,
    entidadTipo,
    entidadId,
    descripcion,
    ip,
    modulo,
    usuarioId = 'sistema',
    datosAdicionales,
  } = params;

  try {
    // Ensure we have a valid JSON object
    const descripcionJson: Prisma.InputJsonValue = {
      timestamp: new Date().toISOString(),
      ...(typeof descripcion === 'string'
        ? { mensaje: descripcion, ...(datosAdicionales || {}) }
        : { ...(descripcion as Record<string, unknown>), ...(datosAdicionales || {}) }),
    };

    // Prepare the data for creation
    const auditData: any = {
      accion,
      resultado,
      mensajeError: mensajeError || null,
      entidadTipo: entidadTipo || null,
      entidadId: entidadId || null,
      descripcion: descripcionJson,
      ip: ip || null,
      modulo,
    };

    // Only include usuarioId if it's a valid UUID
    if (
      usuarioId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usuarioId)
    ) {
      auditData.usuarioId = usuarioId;
    } else {
      // If no valid usuarioId, set it to null
      auditData.usuarioId = null;
    }

    await prisma.logAuditoria.create({
      data: auditData,
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
    // No lanzamos el error para no interrumpir el flujo principal
  }
};

/**
 * Obtiene registros de auditoría con filtros opcionales.
 */
export const obtenerRegistrosAuditoria = async (filtros: {
  accion?: string;
  entidadTipo?: string;
  entidadId?: string;
  modulo?: string;
  usuarioId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  mensajeError?: string;
  ip?: string;
  pagina?: number;
  porPagina?: number;
}) => {
  const {
    accion,
    entidadTipo,
    entidadId,
    modulo,
    usuarioId,
    fechaInicio,
    fechaFin,
    pagina = 1,
    porPagina = 20,
  } = filtros;

  const skip = (pagina - 1) * porPagina;

  const where: any = {};

  if (accion) where.accion = accion;
  if (entidadTipo) where.entidad_tipo = entidadTipo;
  if (entidadId) where.entidad_id = entidadId;
  if (modulo) where.modulo = modulo;
  if (usuarioId) where.usuarioId = usuarioId;

  if (fechaInicio || fechaFin) {
    where.fecha = {};
    if (fechaInicio) where.fecha.gte = fechaInicio;
    if (fechaFin) {
      // Ajustar la fecha final para incluir todo el día
      const finDia = new Date(fechaFin);
      finDia.setHours(23, 59, 59, 999);
      where.fecha.lte = finDia;
    }
  }

  const [registros, total] = await Promise.all([
    prisma.logAuditoria.findMany({
      where,
      skip,
      take: porPagina,
      orderBy: { fecha: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    }),
    prisma.logAuditoria.count({ where }),
  ]);

  return {
    data: registros.map((r) => ({
      ...r,
      // Convertimos la descripción JSON si existe
      descripcion: typeof r.descripcion === 'string' ? JSON.parse(r.descripcion) : r.descripcion,
    })),
    meta: {
      total,
      pagina,
      porPagina,
      paginas: Math.ceil(total / porPagina),
    },
  };
};

/**
 * Limpia registros de auditoría más antiguos que la fecha especificada.
 * @param fecha Limite de fecha para borrar registros más antiguos
 * @returns Número de registros eliminados
 */
export const limpiarRegistrosAntiguos = async (fecha: Date): Promise<number> => {
  try {
    const result = await prisma.logAuditoria.deleteMany({
      where: {
        fecha: {
          lt: fecha,
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error('Error al limpiar registros de auditoría:', error);
    return 0;
  }
};
