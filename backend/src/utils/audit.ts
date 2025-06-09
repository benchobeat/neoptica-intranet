import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AuditoriaParams = {
  accion: string;
  entidadTipo?: string;
  entidadId?: string;
  descripcion: string;
  ip?: string;
  modulo: string;
  usuarioId?: string;
  datosAdicionales?: Record<string, unknown>;
};

/**
 * Registra una acción en el sistema de auditoría.
 * Si no se puede guardar en la base de datos, registra el error en la consola.
 */
export const registrarAuditoria = async (params: AuditoriaParams): Promise<void> => {
  const {
    accion,
    entidadTipo,
    entidadId,
    descripcion,
    ip,
    modulo,
    usuarioId = 'sistema',
    datosAdicionales,
  } = params;

  try {
    await prisma.logAuditoria.create({
      data: {
        accion,
        entidadTipo: entidadTipo || null,
        entidadId: entidadId || null,
        descripcion: datosAdicionales ? JSON.stringify(datosAdicionales) : descripcion,
        ip: ip || null,
        modulo,
        usuarioId,
      },
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
      descripcion: typeof r.descripcion === 'string' 
        ? JSON.parse(r.descripcion) 
        : r.descripcion
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
