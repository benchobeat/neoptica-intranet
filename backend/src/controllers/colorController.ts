import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

import { logError, logSuccess } from '../utils/audit';

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

  try {
    const { nombre, descripcion, activo, codigoHex } = req.body;

    // Validación estricta y avanzada de datos de entrada
    if (!nombre || typeof nombre !== 'string') {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'crearColor',
        action: 'error_crear_color',
        message: 'Se presento un error durante la creacion del color',
        error: new Error('El nombre es obligatorio y debe ser una cadena de texto. 400'),
        context: {
          nombre,
          descripcion,
          activo,
          codigoHex,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El nombre es obligatorio y debe ser una cadena de texto.',
      });
    }

    // Validar longitud y caracteres permitidos
    const nombreLimpio = nombre.trim();
    if (nombreLimpio.length < 2 || nombreLimpio.length > 100) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'crearColor',
        action: 'error_crear_color',
        message: 'Se presento un error durante la creacion del color',
        error: new Error('El nombre debe tener entre 2 y 100 caracteres. 400'),
        context: {
          nombre,
          descripcion,
          activo,
          codigoHex,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El nombre debe tener al menos 2 caracteres.',
      });
    }

    // Validar caracteres permitidos: alfanuméricos, espacios y algunos especiales
    const nombreRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.,'&()]+$/;
    if (!nombreRegex.test(nombreLimpio)) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'crearColor',
        action: 'error_crear_color',
        message: 'Se presento un error durante la creacion del color',
        error: new Error('El nombre contiene caracteres no permitidos. 400'),
        context: {
          nombre,
          descripcion,
          activo,
          codigoHex,
        },
      });
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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'crearColor',
        action: 'error_crear_color',
        message: 'Se presento un error durante la creacion del color',
        error: new Error('Ya existe un color con ese nombre. 409'),
        context: {
          nombre,
          descripcion,
          activo,
          codigoHex,
          colorExistenteId: colorExistente.id,
        },
      });
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
        await logError({
          userId,
          ip: req.ip,
          entityType: 'color',
          module: 'crearColor',
          action: 'error_crear_color',
          message: 'Se presento un error durante la creacion del color',
          error: new Error('El código hexadecimal debe ser una cadena de texto. 400'),
          context: {
            nombre,
            codigoHex,
            activo,
            descripcion,
          },
        });
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
        await logError({
          userId,
          ip: req.ip,
          entityType: 'color',
          module: 'crearColor',
          action: 'error_crear_color',
          message: 'Se presento un error durante la creacion del color',
          error: new Error('Formato de código hexadecimal inválido. Debe ser #RRGGBB o #RGB. 400'),
          context: {
            nombre: nombreLimpio,
            codigoHex: codigoHexLimpio,
            activo: activo !== undefined ? activo : true,
            descripcion: descripcion?.trim() || null,
          },
        });
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
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'color',
      entityId: nuevoColor.id,
      module: 'crearColor',
      action: 'crear_color_exitoso',
      message: 'Color creado exitosamente',
      details: {
        id: nuevoColor.id,
        nombre: nuevoColor.nombre,
        codigoHex: nuevoColor.codigoHex || null,
        activo: nuevoColor.activo,
        descripcion: nuevoColor.descripcion || null,
      },
    });

    return res.status(201).json({
      ok: true,
      data: nuevoColor,
      error: null,
    });
  } catch (error) {
    console.error('Error al crear color:', error);

    // Registrar auditoría de error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    await logError({
      userId,
      ip: req.ip,
      entityType: 'color',
      module: 'crearColor',
      action: 'error_crear_color',
      message: 'Se presento un error durante la creacion del color',
      error: new Error(errorMessage + ' - Error al crear color. 500'),
      context: {
        errorStack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        nombre: req.body.nombre || 'No disponible',
        codigoHex: req.body.codigoHex || 'No proporcionado',
        activo: req.body.activo !== undefined ? req.body.activo : 'No especificado',
        descripcion: req.body.descripcion || 'No proporcionada',
      },
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: `Error al crear color: ${errorMessage}`,
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
    }

    // Buscar colores según filtros y ordenar alfabéticamente
    const colores = await prisma.color.findMany({
      where: filtro,
      orderBy: {
        nombre: 'asc', // Ordenar alfabéticamente
      },
    });

    // Registrar auditoría de listado exitoso
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'color',
      entityId: null,
      module: 'listarColores',
      action: 'listar_colores_exitoso',
      message: 'Listado de colores obtenido exitosamente',
      details: {
        totalRegistros: colores.length,
        filtrosAplicados: {
          activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
          busqueda: req.query.search || null,
        },
      },
    });

    return res.status(200).json({
      ok: true,
      data: colores,
      error: null,
    });
  } catch (error) {
    console.error('Error al listar colores:', error);

    // Registrar auditoría de error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    await logError({
      userId,
      ip: req.ip,
      entityType: 'color',
      module: 'listarColores',
      action: 'error_listar_colores',
      message: 'Error al listar colores',
      error: new Error(errorMessage + ' - Error al listar colores. 500'),
      context: {
        errorStack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        filtrosAplicados: {
          activo: req.query.activo,
          busqueda: req.query.search,
        },
      },
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
    const pageRaw = parseInt(req.query.pagina as string);
    const pageSizeRaw = parseInt(req.query.limite as string);

    // Verificar si los valores son NaN (entrada no numérica)
    const page = !isNaN(pageRaw) ? pageRaw : 1;
    const pageSize = !isNaN(pageSizeRaw) ? pageSizeRaw : 10;
    const searchTerm = (req.query.search as string) || '';

    // Verificar si los parámetros originales eran no-numéricos
    if ((req.query.pagina && isNaN(pageRaw)) || (req.query.limite && isNaN(pageSizeRaw))) {
      const errorMsg = `Parámetros de paginación inválidos: valores no numéricos (pagina=${req.query.pagina}, limite=${req.query.limite})`;
      console.error(errorMsg);

      // Registrar auditoría de error de validación
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'listarColoresPaginados',
        action: 'validacion_paginacion_fallido',
        message: 'Error de validación en parámetros de paginación',
        error: new Error('Error de validación en parámetros de paginación. 500'),
        context: {
          error: errorMsg,
          parametros: {
            page: req.query.page,
            pageSize: req.query.pageSize,
          },
        },
      });

      return res.status(500).json({
        ok: false,
        data: null,
        error: 'Error al listar colores paginados',
      });
    }

    // Validar parámetros
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      const errorMsg = `Parámetros de paginación inválidos: página=${page}, pageSize=${pageSize}`;
      console.error(errorMsg);

      // Registrar auditoría de error de validación
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'listarColoresPaginados',
        action: 'validacion_paginacion_fallido',
        message: 'Error de validación en parámetros de paginación',
        error: new Error('Error de validación en parámetros de paginación. 500'),
        context: {
          error: errorMsg,
          parametros: {
            page,
            pageSize,
          },
        },
      });

      return res.status(500).json({
        ok: false,
        data: null,
        error: 'Error al listar colores paginados',
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
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'color',
      entityId: null,
      module: 'listarColoresPaginados',
      action: 'listar_colores_paginados_exitoso',
      message: 'Listado paginado de colores obtenido exitosamente',
      details: {
        total,
        pagina: page,
        porPagina: pageSize,
        totalPaginas: Math.ceil(total / pageSize),
        filtros: {
          activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
          busqueda: searchTerm || null,
        },
      },
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
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    await logError({
      userId,
      ip: req.ip,
      entityType: 'color',
      module: 'listarColoresPaginados',
      action: 'listar_colores_paginados_fallido',
      message: 'Error al listar colores paginados',
      error: new Error(errorMessage + ' - Error al listar colores paginados. 500'),
      context: {
        errorStack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        filtros: {
          pagina: req.query.page,
          porPagina: req.query.pageSize,
          activo: req.query.activo,
          busqueda: req.query.search,
        },
      },
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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'obtenerColorPorId',
        action: 'error_obtener_color_por_id',
        message: 'Se presento un error durante la obtencion del color',
        error: new Error('ID inválido. 400'),
        context: {
          id,
        },
      });
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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'obtenerColorPorId',
        action: 'error_obtener_color_por_id',
        message: 'Se presento un error durante la obtencion del color',
        error: new Error('Color no encontrado. 404'),
        context: {
          id,
        },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Color no encontrado.',
      });
    }

    // Registrar auditoría de consulta exitosa
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'color',
      entityId: color.id,
      module: 'obtenerColorPorId',
      action: 'obtener_color_exitoso',
      message: 'Color obtenido exitosamente',
      details: {
        nombre: color.nombre,
        activo: color.activo,
        tieneCodigoHex: color.codigoHex !== null,
      },
    });

    return res.status(200).json({
      ok: true,
      data: color,
      error: null,
    });
  } catch (error) {
    console.error('Error al obtener color por ID:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorCode =
      error && typeof error === 'object' && 'code' in error ? (error as any).code : undefined;

    // Log the error with appropriate context
    await logError({
      userId,
      ip: req.ip,
      entityType: 'color',
      module: 'obtenerColorPorId',
      action: 'error_obtener_color',
      message: 'Error al obtener el color',
      error: new Error(errorMessage),
      context: {
        idSolicitado: id,
        errorCode,
        ...(process.env.NODE_ENV === 'development' && errorStack ? { stack: errorStack } : {}),
      },
    });

    // Handle specific error cases
    if (errorCode === 'P2023') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido',
      });
    }

    // Default error response
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al obtener color',
    });
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
    await logError({
      userId,
      ip: req.ip,
      entityType: 'color',
      module: 'actualizarColor',
      action: 'error_actualizar_color',
      message: 'Se presento un error durante la actualizacion del color',
      error: new Error('ID inválido. 400'),
      context: {
        idSolicitado: id,
      },
    });

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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'actualizarColor',
        action: 'error_actualizar_color',
        message: 'Color no encontrado.',
        context: {
          id,
          datosSolicitud: req.body,
        },
        error: new Error('Color no encontrado. 404'),
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Color no encontrado.',
      });
    }

    // Preparar objeto de datos a actualizar
    const datosActualizados: any = {
      // Agregar campos de auditoría
      modificadoPor: userId || null,
      modificadoEn: new Date(),
    };

    if (nombre !== undefined) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'actualizarColor',
        action: 'error_actualizar_color',
        message: 'Se presento un error durante la actualizacion del color',
        error: new Error('El nombre debe ser una cadena de texto. 400'),
        context: {
          idSolicitado: id,
        },
      });
      if (typeof nombre !== 'string') {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'color',
          module: 'actualizarColor',
          action: 'error_actualizar_color',
          message: 'Se presento un error durante la actualizacion del color',
          error: new Error('El nombre debe ser una cadena de texto. 400'),
          context: {
            idSolicitado: id,
          },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El nombre debe ser una cadena de texto.',
        });
      }

      const nombreLimpio = nombre.trim();
      if (nombreLimpio.length < 2 || nombreLimpio.length > 100) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'color',
          module: 'actualizarColor',
          action: 'error_actualizar_color',
          message: 'Se presento un error durante la actualizacion del color',
          error: new Error('El nombre debe tener entre 2 y 100 caracteres. 400'),
          context: {
            idSolicitado: id,
          },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El nombre debe tener entre 2 y 100 caracteres.',
        });
      }

      // Validar caracteres permitidos: alfanuméricos, espacios y algunos especiales
      const nombreRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.,'&()]+$/;
      if (!nombreRegex.test(nombreLimpio)) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'color',
          module: 'actualizarColor',
          action: 'error_actualizar_color',
          message: 'Se presento un error durante la actualizacion del color',
          error: new Error('El nombre contiene caracteres no permitidos. 400'),
          context: {
            idSolicitado: id,
          },
        });
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
        await logError({
          userId,
          ip: req.ip,
          entityType: 'color',
          module: 'actualizarColor',
          action: 'error_actualizar_color',
          message: 'Se presento un error durante la actualizacion del color',
          error: new Error('Ya existe otro color con ese nombre. 409'),
          context: {
            idSolicitado: id,
          },
        });
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
          await logError({
            userId,
            ip: req.ip,
            entityType: 'color',
            module: 'actualizarColor',
            action: 'error_actualizar_color',
            message: 'Se presento un error durante la actualizacion del color',
            error: new Error('El código hexadecimal debe ser una cadena de texto. 400'),
            context: {
              idSolicitado: id,
            },
          });
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
          await logError({
            userId,
            ip: req.ip,
            entityType: 'color',
            module: 'actualizarColor',
            action: 'error_actualizar_color',
            message: 'Se presento un error durante la actualizacion del color',
            error: new Error(
              'Formato de código hexadecimal inválido. Debe ser #RRGGBB o #RGB. 400'
            ),
            context: {
              idSolicitado: id,
            },
          });
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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'actualizarColor',
        action: 'error_actualizar_color',
        message: 'Se presento un error durante la actualizacion del color',
        error: new Error('No se proporcionaron datos para actualizar. 400'),
        context: {
          idSolicitado: id,
        },
      });
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
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'color',
      module: 'actualizarColor',
      action: 'actualizar_color_exitoso',
      message: 'Color actualizado exitosamente',
      entityId: colorActualizado.id,
      details: {
        cambios: Object.keys(datosActualizados)
          .filter((key) => !['modificadoPor', 'modificadoEn'].includes(key))
          .reduce((obj: Record<string, any>, key) => {
            obj[key] = {
              anterior: colorExistente[key as keyof typeof colorExistente],
              nuevo: colorActualizado[key as keyof typeof colorActualizado],
            };
            return obj;
          }, {}),
      },
    });

    return res.status(200).json({
      ok: true,
      data: colorActualizado,
      error: null,
    });
  } catch (error) {
    console.error('Error al actualizar color:', error);

    // Registrar auditoría de error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido. 500';
    const errorStack = error instanceof Error && error.stack ? { stack: error.stack } : {};

    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2023':
          await logError({
            userId,
            ip: req.ip,
            entityType: 'color',
            module: 'actualizarColor',
            action: 'error_actualizar_color',
            message: 'Error al actualizar color',
            error: new Error('ID inválido. 400'),
            context: {
              id,
              datosSolicitud: req.body,
              ...errorStack,
            },
          });
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'ID inválido',
          });
        default:
          await logError({
            userId,
            ip: req.ip,
            entityType: 'color',
            module: 'actualizarColor',
            action: 'error_actualizar_color',
            message: 'Error al actualizar color',
            error: new Error(errorMessage),
            context: {
              id,
              datosSolicitud: req.body,
              ...errorStack,
            },
          });
          return res.status(500).json({
            ok: false,
            data: null,
            error: 'Error al actualizar color',
          });
      }
    } else {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'actualizarColor',
        action: 'error_actualizar_color',
        message: 'Error al actualizar color',
        error: new Error(errorMessage),
        context: {
          id,
          datosSolicitud: req.body,
          ...errorStack,
        },
      });
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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'eliminarColor',
        action: 'error_eliminar_color',
        message: 'Error al eliminar color',
        error: new Error('ID inválido. 400'),
        context: {
          id,
          datosSolicitud: req.body,
        },
      });
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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'eliminarColor',
        action: 'error_eliminar_color',
        message: 'Error al eliminar color',
        error: new Error('Color no encontrado. 404'),
        context: {
          id,
          datosSolicitud: req.body,
        },
      });
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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'eliminarColor',
        action: 'error_eliminar_color',
        message: 'Error al eliminar color',
        error: new Error('Color tiene productos asociados. 409'),
        context: {
          id,
          datosSolicitud: req.body,
          productosAsociados,
        },
      });
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
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'color',
      module: 'colores',
      action: 'eliminar_color_exitoso',
      message: 'Color eliminado exitosamente',
      entityId: id,
      details: {
        nombre: colorExistente.nombre,
        tipo: 'soft_delete',
        fechaEliminacion: fechaActual.toISOString(),
      },
    });

    return res.status(200).json({
      ok: true,
      data: 'Color eliminado correctamente.',
      error: null,
    });
  } catch (error) {
    console.error('Error al eliminar color:', error);

    // Registrar auditoría de error
    const errorObj = error as any;
    const tieneProductosAsociados = errorObj?.productosAsociados || 0;
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido. 500';
    const errorStack = error instanceof Error && error.stack ? { stack: error.stack } : {};

    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2023':
          await logError({
            userId,
            ip: req.ip,
            entityType: 'color',
            module: 'eliminarColor',
            action: 'error_eliminar_color',
            message: 'Error al eliminar el color',
            error: new Error('ID inválido. 400'),
            context: {
              id,
              datosSolicitud: req.body,
              ...errorStack,
            },
          });
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'ID inválido',
          });
        default:
          await logError({
            userId,
            ip: req.ip,
            entityType: 'color',
            module: 'eliminarColor',
            action: 'error_eliminar_color',
            message: 'Error al eliminar el color',
            error: new Error(errorMessage),
            context: {
              id,
              datosSolicitud: req.body,
              tieneProductosAsociados,
              ...errorStack,
            },
          });
          return res.status(500).json({
            ok: false,
            data: null,
            error: 'Error al eliminar el color',
          });
      }
    } else {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'color',
        module: 'eliminarColor',
        action: 'error_eliminar_color',
        message: 'Error al eliminar el color',
        error: new Error(errorMessage),
        context: {
          id,
          datosSolicitud: req.body,
          tieneProductosAsociados,
          ...errorStack,
        },
      });
      return res.status(500).json({
        ok: false,
        data: null,
        error: 'Error al eliminar el color',
      });
    }
  }
};
