import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { registrarAuditoria } from '../utils/audit';

const prisma = new PrismaClient();

/**
 * Controlador para crear un nuevo color.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Respuesta con el color creado o mensaje de error
 */
export const crearColor = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría y campos de control
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  
  // Log temporal para verificar recarga
  // console.log('✅ Llamada a crearColor recibida -', new Date().toISOString());
  // console.log('📝 Datos recibidos:', JSON.stringify(req.body, null, 2));
  
  // No se necesitan logs de depuración en producción
  try {
    const { nombre, descripcion, activo, codigoHex } = req.body;

    // Validación estricta y avanzada de datos de entrada
    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El nombre es obligatorio y debe ser una cadena de texto.',
      });
    }

    // Validar longitud y caracteres permitidos
    const nombreLimpio = nombre.trim();
    if (nombreLimpio.length < 2 || nombreLimpio.length > 100) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El nombre debe tener al menos 2 caracteres.',
      });
    }

    // Validar caracteres permitidos: alfanuméricos, espacios y algunos especiales
    const nombreRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.,'&()]+$/;
    if (!nombreRegex.test(nombreLimpio)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El nombre contiene caracteres no permitidos.',
      });
    }

    // Verificar si ya existe un color con el mismo nombre (case-insensitive)
    const colorExistente = await prisma.color.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: 'insensitive', // Búsqueda case-insensitive
        },
        anuladoEn: null, // Solo colores no anulados
      },
    });

    if (colorExistente) {
      return res.status(409).json({
        ok: false,
        data: null,
        error: 'Ya existe un color con ese nombre.',
      });
    }

    // Validar el código hexadecimal si está presente
    let codigoHexLimpio = null;
    if (codigoHex) {
      if (typeof codigoHex !== 'string') {
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El código hexadecimal debe ser una cadena de texto.',
        });
      }

      // Eliminar espacios y asegurar formato correcto
      codigoHexLimpio = codigoHex.trim();

      // Asegurar que tiene el prefijo #
      if (!codigoHexLimpio.startsWith('#')) {
        codigoHexLimpio = `#${codigoHexLimpio}`;
      }

      // Validar formato hexadecimal: #RRGGBB o #RGB
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexRegex.test(codigoHexLimpio)) {
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'Formato de código hexadecimal inválido. Debe ser #RRGGBB o #RGB.',
        });
      }
    }

    // Crear el nuevo color en la base de datos directamente con los valores individuales
    const nuevoColor = await prisma.color.create({
      data: {
        nombre: nombreLimpio,
        // Garantizar que codigoHex se pase explícitamente
        codigoHex: codigoHexLimpio, 
        descripcion: descripcion?.trim() || null,
        activo: activo !== undefined ? activo : true,
        creadoPor: userId || null,
        creadoEn: new Date(),
      },
    });

    // Registro de auditoría implícito en el bloque try

    // Registrar auditoría de creación exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'crear_color_exitoso',
      descripcion: `Color creado: ${nuevoColor.nombre} | código_hex: ${nuevoColor.codigoHex || 'N/A'}`,
      ip: req.ip,
      entidadTipo: 'color',
      entidadId: nuevoColor.id,
      modulo: 'colores',
    });

    return res.status(201).json({
      ok: true,
      data: nuevoColor,
      error: null,
    });
  } catch (error) {
    console.error('Error al crear color:', error);

    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'crear_color_fallido',
      descripcion: error instanceof Error ? error.message : 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'color',
      modulo: 'colores',
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al crear color',
    });
  }
};

/**
 * Controlador para listar todos los colores con filtros opcionales.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista de colores o mensaje de error
 */
export const listarColores = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    // Preparar filtros
    const filtro: any = {
      anuladoEn: null, // Solo colores no anulados (soft delete)
    };

    // Filtro adicional por activo si se proporciona en la consulta
    if (req.query.activo !== undefined) {
      filtro.activo = req.query.activo === 'true';
    }

    // Filtro por término de búsqueda (nombre)
    const searchTerm = req.query.search as string;
    if (searchTerm && searchTerm.trim() !== '') {
      filtro.nombre = {
        contains: searchTerm.trim(),
        mode: 'insensitive', // Búsqueda case-insensitive
      };
      // console.log(`Buscando colores que contengan: "${searchTerm}"`);
    }

    // Buscar colores según filtros y ordenar alfabéticamente
    const colores = await prisma.color.findMany({
      where: filtro,
      orderBy: {
        nombre: 'asc', // Ordenar alfabéticamente
      },
    });

    // Registrar auditoría de listado exitoso
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_colores',
      descripcion: `Se listaron ${colores.length} colores`,
      ip: req.ip,
      entidadTipo: 'color',
      modulo: 'colores',
    });

    return res.status(200).json({
      ok: true,
      data: colores,
      error: null,
    });
  } catch (error) {
    console.error('Error al listar colores:', error);

    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_colores_fallido',
      descripcion: error instanceof Error ? error.message : 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'color',
      modulo: 'colores',
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al obtener colores',
    });
  }
};

/**
 * Controlador para listar colores con paginación y búsqueda.
 *
 * @param {Request} req - Objeto de solicitud Express con query params para paginación
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista paginada de colores o mensaje de error
 */
export const listarColoresPaginados = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;

  try {
    // Obtener parámetros de paginación y búsqueda
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchTerm = (req.query.search as string) || '';

    // Validar parámetros
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Parámetros de paginación inválidos',
      });
    }

    // Calcular offset para paginación
    const skip = (page - 1) * pageSize;

    // Preparar filtros
    const filtro: any = {
      anuladoEn: null, // Solo colores no anulados (soft delete)
    };

    // Filtro adicional por activo si se proporciona
    if (req.query.activo !== undefined) {
      filtro.activo = req.query.activo === 'true';
    }

    // Filtro por término de búsqueda en nombre
    if (searchTerm && searchTerm.trim() !== '') {
      filtro.nombre = {
        contains: searchTerm.trim(),
        mode: 'insensitive', // Búsqueda case-insensitive
      };
      console.log(`Buscando colores paginados que contengan: "${searchTerm}"`);
    }

    // Ejecutar consulta con count para obtener total
    const [colores, total] = await Promise.all([
      prisma.color.findMany({
        where: filtro,
        orderBy: {
          nombre: 'asc',
        },
        skip,
        take: pageSize,
      }),
      prisma.color.count({ where: filtro }),
    ]);

    // Registrar auditoría de listado exitoso
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_colores_paginados',
      descripcion: `Se listaron ${colores.length} colores (página ${page}, búsqueda: "${searchTerm || 'ninguna'}")`,
      ip: req.ip,
      entidadTipo: 'color',
      modulo: 'colores',
    });

    // Devolver resultados con formato estándar de paginación
    return res.status(200).json({
      ok: true,
      data: {
        items: colores,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      error: null,
    });
  } catch (error) {
    console.error('Error al listar colores paginados:', error);

    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_colores_paginados_fallido',
      descripcion: error instanceof Error ? error.message : 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'color',
      modulo: 'colores',
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al listar colores paginados',
    });
  }
};

/**
 * Controlador para obtener un color por su ID.
 *
 * @param {Request} req - Objeto de solicitud Express con ID de color en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos del color o mensaje de error
 */
export const obtenerColorPorId = async (req: Request, res: Response) => {
  // Capturar ID de usuario e ID de entidad para auditoría
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
        error: 'ID inválido',
      });
    }

    // Buscar el color por ID
    const color = await prisma.color.findUnique({
      where: {
        id,
        anuladoEn: null, // Solo colores no anulados (soft delete)
      },
    });

    // Verificar si se encontró el color
    if (!color) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Color no encontrado.',
      });
    }

    // Registrar auditoría de consulta exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'obtener_color',
      descripcion: `Se consultó el color: ${color.nombre}`,
      ip: req.ip,
      entidadTipo: 'color',
      entidadId: id,
      modulo: 'colores',
    });

    return res.status(200).json({
      ok: true,
      data: color,
      error: null,
    });
  } catch (error) {
    console.error('Error al obtener color por ID:', error);

    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'obtener_color_fallido',
      descripcion: error instanceof Error ? error.message : 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'color',
      entidadId: id,
      modulo: 'colores',
    });

    if (error instanceof Error && typeof error === 'object' && error !== null && 'code' in error) {
      switch (error.code) {
        case 'P2023':
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'ID inválido',
          });
        default:
          return res.status(500).json({
            ok: false,
            data: null,
            error: 'Error al obtener color',
          });
      }
    } else {
      return res.status(500).json({
        ok: false,
        data: null,
        error: 'Error al obtener color',
      });
    }
  }
};

/**
 * Controlador para actualizar un color existente.
 *
 * @param {Request} req - Objeto de solicitud Express con ID en params y datos en body
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos del color actualizado o mensaje de error
 */
export const actualizarColor = async (req: Request, res: Response) => {
  // Capturar ID de usuario e ID de entidad para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  const { id } = req.params;
  try {
    const { nombre, descripcion, activo, codigoHex } = req.body;

    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido',
      });
    }

    // Verificar si el color existe
    const colorExistente = await prisma.color.findUnique({
      where: {
        id,
        anuladoEn: null, // Solo colores no anulados
      },
    });

    if (!colorExistente) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Color no encontrado.',
      });
    }

    // Preparar objeto de datos a actualizar
    const datosActualizados: any = {
      // Agregar campos de auditoría
      modificado_por: userId || null,
      modificado_en: new Date(),
    };

    if (nombre !== undefined) {
      if (typeof nombre !== 'string') {
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El nombre debe ser una cadena de texto.',
        });
      }

      const nombreLimpio = nombre.trim();
      if (nombreLimpio.length < 2 || nombreLimpio.length > 100) {
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El nombre debe tener entre 2 y 100 caracteres.',
        });
      }

      // Validar caracteres permitidos: alfanuméricos, espacios y algunos especiales
      const nombreRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.,'&()]+$/;
      if (!nombreRegex.test(nombreLimpio)) {
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El nombre contiene caracteres no permitidos.',
        });
      }

      // Verificar si ya existe otro color con el mismo nombre (case-insensitive)
      const colorExistenteNombre = await prisma.color.findFirst({
        where: {
          nombre: {
            equals: nombreLimpio,
            mode: 'insensitive', // Búsqueda case-insensitive
          },
          id: {
            not: id, // Excluir el color actual
          },
          anuladoEn: null, // Solo colores no anulados
        },
      });

      if (colorExistenteNombre) {
        return res.status(409).json({
          ok: false,
          data: null,
          error: 'Ya existe otro color con ese nombre.',
        });
      }

      datosActualizados.nombre = nombreLimpio;
    }

    // Validar y actualizar el código hexadecimal si fue proporcionado
    if (codigoHex !== undefined) {
      // Si es null, se permite eliminar el código hexadecimal
      if (codigoHex === null) {
        datosActualizados.codigoHex = null;
      } else {
        if (typeof codigoHex !== 'string') {
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'El código hexadecimal debe ser una cadena de texto.',
          });
        }

        // Eliminar espacios y asegurar formato correcto
        let codigoHexLimpio = codigoHex.trim();

        // Asegurar que tiene el prefijo #
        if (!codigoHexLimpio.startsWith('#')) {
          codigoHexLimpio = `#${codigoHexLimpio}`;
        }

        // Validar formato hexadecimal: #RRGGBB o #RGB
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(codigoHexLimpio)) {
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'Formato de código hexadecimal inválido. Debe ser #RRGGBB o #RGB.',
          });
        }

        datosActualizados.codigoHex = codigoHexLimpio;
      }
    }

    if (descripcion !== undefined) {
      datosActualizados.descripcion = descripcion === null ? null : descripcion.trim();
    }

    // Procesar estado activo si se proporcionó
    if (activo !== undefined) {
      datosActualizados.activo = activo;
    }

    // Si no hay datos para actualizar, retornar error
    if (Object.keys(datosActualizados).length === 0) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'No se proporcionaron datos para actualizar.',
      });
    }

    // Actualizar el color en la base de datos
    const colorActualizado = await prisma.color.update({
      where: { id },
      data: datosActualizados,
    });

    // Registrar auditoría de actualización exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'actualizar_color',
      descripcion: `Se actualizó el color: ${colorActualizado.nombre}`,
      ip: req.ip,
      entidadTipo: 'color',
      entidadId: id,
      modulo: 'colores',
    });

    return res.status(200).json({
      ok: true,
      data: colorActualizado,
      error: null,
    });
  } catch (error) {
    console.error('Error al actualizar color:', error);

    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'actualizar_color_fallido',
      descripcion: error instanceof Error ? error.message : 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'color',
      entidadId: id,
      modulo: 'colores',
    });

    if (error instanceof Error && typeof error === 'object' && error !== null && 'code' in error) {
      switch (error.code) {
        case 'P2023':
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'ID inválido',
          });
        default:
          return res.status(500).json({
            ok: false,
            data: null,
            error: 'Error al actualizar color',
          });
      }
    } else {
      return res.status(500).json({
        ok: false,
        data: null,
        error: 'Error al actualizar color',
      });
    }
  }
};

/**
 * Controlador para eliminar (soft delete) un color.
 * Marca el color como inactivo en lugar de eliminarlo físicamente.
 *
 * @param {Request} req - Objeto de solicitud Express con ID en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Confirmación de eliminación o mensaje de error
 */
export const eliminarColor = async (req: Request, res: Response) => {
  // Capturar ID de usuario e ID de entidad para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  const { id } = req.params;
  try {
    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido',
      });
    }

    // Verificar si el color existe y no está anulado
    const colorExistente = await prisma.color.findUnique({
      where: {
        id,
        anuladoEn: null, // Solo colores no anulados
      },
    });

    if (!colorExistente) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Color no encontrado.',
      });
    }

    // Verificar si el color tiene productos asociados
    const productosAsociados = await prisma.producto.count({
      where: {
        colorId: id,
        anuladoEn: null, // Solo productos no anulados
      },
    });

    if (productosAsociados > 0) {
      return res.status(409).json({
        ok: false,
        data: null,
        error: `No se puede eliminar el color porque tiene ${productosAsociados} producto(s) asociado(s).`,
      });
    }

    // Realizar soft delete (actualizando el campo anuladoEn)
    const fechaActual = new Date();
    await prisma.color.update({
      where: { id },
      data: {
        anuladoEn: fechaActual,
        anuladoPor: userId || null,
        activo: false, // También marcar como inactivo
      },
    });

    // Registrar auditoría de eliminación exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'eliminar_color',
      descripcion: `Se eliminó (soft delete) el color con ID: ${id}`,
      ip: req.ip,
      entidadTipo: 'color',
      entidadId: id,
      modulo: 'colores',
    });

    return res.status(200).json({
      ok: true,
      data: 'Color eliminado correctamente.',
      error: null,
    });
  } catch (error) {
    console.error('Error al eliminar color:', error);

    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'eliminar_color_fallido',
      descripcion: error instanceof Error ? error.message : 'Error desconocido',
      ip: req.ip,
      entidadTipo: 'color',
      entidadId: id,
      modulo: 'colores',
    });

    if (error instanceof Error && typeof error === 'object' && error !== null && 'code' in error) {
      switch (error.code) {
        case 'P2023':
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'ID inválido',
          });
        default:
          return res.status(500).json({
            ok: false,
            data: null,
            error: 'Error al eliminar color',
          });
      }
    } else {
      return res.status(500).json({
        ok: false,
        data: null,
        error: 'Error al eliminar color',
      });
    }
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al eliminar color',
    });
  }
};
