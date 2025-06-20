import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

import { logSuccess, logError } from '../utils/audit';

/**
 * Cliente Prisma para interacción con la base de datos.
 * Se inicializa una única instancia para todo el controlador.
 */
const prisma = new PrismaClient();

/**
 * Controlador para crear una nueva marca.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Respuesta con la marca creada o mensaje de error
 */
export const crearMarca = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion } = req.body;
    // Verificar si se intenta modificar el campo activo, que no está permitido
    if (req.body.activo !== undefined) {
      await logError({
        userId: (req as any).usuario?.id || (req as any).user?.id,
        ip: req.ip,
        entityType: 'marca',
        entityId: null,
        module: 'crearMarca',
        action: 'error_crear_marca',
        message: 'Error al crear la marca',
        error: 'No está permitido modificar el campo activo. 400',
        context: {
          nombre,
          descripcion
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'No está permitido modificar el campo activo.',
      });
    }
    const userId = (req as any).usuario?.id || (req as any).user?.id;

    // Validación estricta y avanzada de datos de entrada
    if (!nombre || typeof nombre !== 'string') {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: null,
        module: 'crearMarca',
        action: 'error_crear_marca',
        message: 'Error al crear la marca',
        error: 'El nombre es obligatorio y debe ser una cadena de texto. 400',
        context: {
          nombre,
          descripcion
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
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: null,
        module: 'crearMarca',
        action: 'error_crear_marca',
        message: 'Error al crear la marca',
        error: 'El nombre debe tener entre 2 y 100 caracteres. 400',
        context: {
          nombre,
          descripcion
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
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: null,
        module: 'crearMarca',
        action: 'error_crear_marca',
        message: 'Error al crear la marca',
        error: 'El nombre contiene caracteres no permitidos. 400',
        context: {
          nombre,
          descripcion
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El nombre contiene caracteres no permitidos.',
      });
    }

    // Verificar si ya existe una marca con el mismo nombre (case-insensitive)
    const marcaExistente = await prisma.marca.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: 'insensitive', // Búsqueda case-insensitive
        },
        anuladoEn: null, // Solo marcas no anuladas
      },
    });

    if (marcaExistente) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: null,
        module: 'crearMarca',
        action: 'error_crear_marca',
        message: 'Error al crear la marca',
        error: 'Ya existe una marca con ese nombre. 409',
        context: {
          nombre,
          descripcion
        },
      });
      return res.status(409).json({
        ok: false,
        data: null,
        error: 'Ya existe una marca con ese nombre.',
      });
    }

    // Crear la nueva marca en la base de datos
    const nuevaMarca = await prisma.marca.create({
      data: {
        nombre: nombreLimpio,
        descripcion: descripcion?.trim() || null,
        activo: true, // Siempre se crea como activo
        creadoPor: userId || null,
        creadoEn: new Date(),
      },
    });

    // Registrar auditoría de creación exitosa
    logSuccess({
      userId,
      ip: req.ip,
      entityType: 'marca',
      entityId: nuevaMarca.id,
      module: 'crearMarca',
      action: 'crear_marca_exitoso',
      message: 'Marca creada exitosamente',
      details: {
        nombre: nuevaMarca.nombre,
        descripcion: nuevaMarca.descripcion || null,
        activo: nuevaMarca.activo,
      },
    });
    return res.status(201).json({
      ok: true,
      data: nuevaMarca,
      error: null,
    });
  } catch (error: any) {
    console.error('Error al crear marca:', error);

    // Registrar error usando logError
    await logError({
      userId: (req as any).usuario?.id || (req as any).user?.id,
      ip: req.ip,
      entityType: 'marca',
      module: 'crearMarca',
      action: 'crear_marca_fallido',
      message: 'Error al crear la marca',
      error,
      context: {
        datosSolicitud: req.body,
        error: error instanceof Error ? error.message : 'Error desconocido',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al crear la marca',
    });
  }
};

/**
 * Controlador para listar todas las marcas con filtros opcionales.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista de marcas o mensaje de error
 */
/**
 * Controlador para listar marcas con paginación y filtros opcionales.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista paginada de marcas o mensaje de error
 */
export const listarMarcasPaginadas = async (req: Request, res: Response) => {
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    // Extraer parámetros de paginación y búsqueda
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchText = (req.query.searchText as string) || '';

    // Calcular offset para la paginación
    const skip = (page - 1) * pageSize;

    // Preparar filtros
    const filtro: any = {
      anuladoEn: null, // Solo marcas no anuladas (soft delete)
    };

    // Filtro adicional por nombre si se proporciona en la búsqueda
    if (searchText) {
      filtro.nombre = {
        contains: searchText,
        mode: 'insensitive',
      };
    }

    // Filtro adicional por activo si se proporciona en la consulta
    if (req.query.activo !== undefined) {
      filtro.activo = req.query.activo === 'true';
    }

    // Consulta para obtener el total de registros
    const total = await prisma.marca.count({
      where: filtro,
    });

    // Buscar marcas según filtros, con paginación y ordenar alfabéticamente
    const marcas = await prisma.marca.findMany({
      where: filtro,
      orderBy: {
        nombre: 'asc', // Ordenar alfabéticamente
      },
      skip,
      take: pageSize,
    });

    // Registrar auditoría de listado exitoso
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'marca',
      module: 'listarMarcasPaginadas',
      action: 'listar_marcas_paginadas_exitoso',
      message: 'Listado de marcas paginado obtenido exitosamente',
      details: {
        totalRegistros: marcas.length,
        paginaActual: page,
        totalPaginas: Math.ceil(total / pageSize),
        filtrosAplicados: {
          activo: req.query.activo !== undefined ? req.query.activo === 'true' : null,
          busqueda: req.query.search || null,
        },
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        items: marcas,
        total,
        page,
        pageSize,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Error al listar marcas paginadas:', error);

    // Registrar error usando logError
    await logError({
      userId,
      ip: req.ip,
      entityType: 'marca',
      module: 'listarMarcasPaginadas',
      action: 'listar_marcas_paginadas',
      message: 'Error al obtener el listado paginado de marcas',
      error,
      context: {
        pagina: req.query.page || 1,
        pageSize: req.query.pageSize || 10,
        searchText: req.query.searchText || null,
        error: error instanceof Error ? error.message : 'Error desconocido',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al obtener el listado de marcas',
    });
  }
};

/**
 * Controlador para listar todas las marcas con filtros opcionales.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista de marcas o mensaje de error
 */
export const listarMarcas = async (req: Request, res: Response) => {
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    // Preparar filtros
    const filtro: any = {
      anuladoEn: null, // Solo marcas no anuladas (soft delete)
    };

    // Filtro adicional por ID si se proporciona en la consulta
    if (req.query.id) {
      filtro.id = req.query.id as string;
    }

    // Filtro adicional por nombre si se proporciona en la consulta
    if (req.query.nombre) {
      filtro.nombre = {
        contains: req.query.nombre as string,
        mode: 'insensitive',
      };
    }

    // Filtro adicional por activo si se proporciona en la consulta
    if (req.query.activo !== undefined) {
      filtro.activo = req.query.activo === 'true';
    }

    // Buscar marcas según filtros y ordenar alfabéticamente
    const marcas = await prisma.marca.findMany({
      where: filtro,
      orderBy: {
        nombre: 'asc', // Ordenar alfabéticamente
      },
    });

    // Registrar auditoría de listado exitoso
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'marca',
      module: 'listarMarcas',
      action: 'listar_marcas',
      message: 'Listado de marcas obtenido exitosamente',
      details: {
        totalRegistros: marcas.length,
        filtrosAplicados: {
          id: req.query.id || null,
          nombre: req.query.nombre || null,
          activo: req.query.activo !== undefined ? req.query.activo === 'true' : null,
        },
      },
    });

    return res.status(200).json({
      ok: true,
      data: marcas,
      error: null,
    });
  } catch (error: any) {
    console.error('Error al listar marcas:', error);

    // Registrar error usando logError
    await logError({
      userId,
      ip: req.ip,
      entityType: 'marca',
      module: 'listarMarcas',
      action: 'error_listar_marcas',
      message: 'Error al listar las marcas',
      error,
      context: {
        filtrosAplicados: {
          id: req.query.id || null,
          nombre: req.query.nombre || null,
          activo: req.query.activo !== undefined ? req.query.activo === 'true' : null,
        },
        error: error instanceof Error ? error.message : 'Error desconocido',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al listar marcas',
    });
  }
};

/**
 * Controlador para obtener una marca por su ID.
 *
 * @param {Request} req - Objeto de solicitud Express con ID de marca en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos de la marca o mensaje de error
 */
export const obtenerMarcaPorId = async (req: Request, res: Response) => {
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    const { id } = req.params;

    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: null,
        module: 'obtenerMarcaPorId',
        action: 'error_obtener_marca_por_id',
        message: 'Error al obtener la marca',
        error: 'ID inválido. 400',
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

    // Buscar la marca por ID
    const marca = await prisma.marca.findUnique({
      where: {
        id,
        anuladoEn: null, // Solo marcas no anuladas (soft delete)
      },
    });

    // Verificar si se encontró la marca
    if (!marca) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: null,
        module: 'obtenerMarcaPorId',
        action: 'error_obtener_marca_por_id',
        message: 'Error al obtener la marca',
        error: 'Marca no encontrada. 404',
        context: {
          id,
        },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Marca no encontrada',
      });
    }

    // Registrar auditoría de consulta exitosa
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'marca',
      entityId: id,
      module: 'obtenerMarcaPorId',
      action: 'obtener_marca_exitoso',
      message: 'Marca obtenida exitosamente',
      details: {
        id: marca.id,
        nombre: marca.nombre,
        activo: marca.activo,
        creadoEn: marca.creadoEn.toISOString(),
        modificadoEn: marca.modificadoEn?.toISOString() || null,
      },
    });

    return res.status(200).json({
      ok: true,
      data: marca,
      error: null,
    });
  } catch (error: any) {
    console.error('Error al obtener marca por ID:', error);

    // Registrar error usando logError
    await logError({
      userId,
      ip: req.ip,
      entityType: 'marca',
      entityId: req.params.id,
      module: 'obtenerMarcaPorId',
      action: 'error_obtener_marca_por_id',
      message: 'Error al obtener la marca',
      error,
      context: {
        idSolicitado: req.params.id,
        error: error instanceof Error ? error.message : 'Error desconocido',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    // Manejo detallado de errores
    if (error.code === 'P2023') {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: req.params.id,
        module: 'obtenerMarcaPorId',
        action: 'error_obtener_marca_por_id',
        message: 'Error al obtener la marca',
        error,
        context: {
          idSolicitado: req.params.id,
          error: error instanceof Error ? error.message : 'Error desconocido',
          ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido',
      });
    }

    logError({
      userId,
      ip: req.ip,
      entityType: 'marca',
      entityId: req.params.id,
      module: 'obtenerMarcaPorId',
      action: 'error_obtener_marca_por_id',
      message: 'Error al obtener la marca',
      error,
      context: {
        idSolicitado: req.params.id,
        error: error instanceof Error ? error.message : 'Error desconocido',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener la marca.',
    });
  }
};

/**
 * Controlador para actualizar una marca existente.
 *
 * @param {Request} req - Objeto de solicitud Express con ID en params y datos en body
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos de la marca actualizada o mensaje de error
 */
export const actualizarMarca = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const userId = (req as any).usuario?.id || (req as any).user?.id;
    
    // Verificar si se intenta modificar el campo activo, que no está permitido
    if (req.body.activo !== undefined) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: id,
        module: 'actualizarMarca',
        action: 'error_actualizar_marca',
        message: 'Error al actualizar la marca',
        error: 'No está permitido modificar el campo activo. 400',
        context: {
          idSolicitado: id,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'No está permitido modificar el campo activo.',
      });
    }

    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: id,
        module: 'actualizarMarca',
        action: 'error_actualizar_marca',
        message: 'Error al actualizar la marca',
        error: 'ID inválido. 400',
        context: {
          idSolicitado: id,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido',
      });
    }

    // Verificar si la marca existe
    const marcaExistente = await prisma.marca.findUnique({
      where: {
        id,
        anuladoEn: null, // Solo marcas no anuladas
      },
    });

    if (!marcaExistente) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: id,
        module: 'actualizarMarca',
        action: 'error_actualizar_marca',
        message: 'Error al actualizar la marca',
        error: 'Marca no encontrada. 404',
        context: {
          idSolicitado: id,
        },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Marca no encontrada.',
      });
    }

    // Preparar objeto de datos a actualizar
    const datosActualizados: any = {};

    // Validar y procesar nombre si se proporcionó
    if (nombre !== undefined) {
      if (!nombre || typeof nombre !== 'string') {
        logError({
          userId,
          ip: req.ip,
          entityType: 'marca',
          entityId: id,
          module: 'actualizarMarca',
          action: 'error_actualizar_marca',
          message: 'Error al actualizar la marca',
          error: 'El nombre debe ser una cadena de texto válida. 400',
          context: {
            idSolicitado: id,
            nombre,
          },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El nombre debe ser una cadena de texto válida.',
        });
      }

      const nombreLimpio = nombre.trim();

      // Validar longitud
      if (nombreLimpio.length < 2 || nombreLimpio.length > 100) {
        logError({
          userId,
          ip: req.ip,
          entityType: 'marca',
          entityId: id,
          module: 'actualizarMarca',
          action: 'error_actualizar_marca',
          message: 'Error al actualizar la marca',
          error: 'El nombre debe tener al menos 2 caracteres. 400',
          context: {
            idSolicitado: id,
            nombre,
          },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El nombre debe tener al menos 2 caracteres.',
        });
      }

      // Validar caracteres permitidos
      const nombreRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.,'&()]+$/;
      if (!nombreRegex.test(nombreLimpio)) {
        logError({
          userId,
          ip: req.ip,
          entityType: 'marca',
          entityId: id,
          module: 'actualizarMarca',
          action: 'error_actualizar_marca',
          message: 'Error al actualizar la marca',
          error: 'El nombre contiene caracteres no permitidos. 400',
          context: {
            idSolicitado: id,
            nombre,
          },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El nombre contiene caracteres no permitidos.',
        });
      }

      // Verificar que no exista otra marca con el mismo nombre (excepto la actual)
      const nombreDuplicado = await prisma.marca.findFirst({
        where: {
          nombre: {
            equals: nombreLimpio,
            mode: 'insensitive', // Búsqueda case-insensitive
          },
          id: {
            not: id, // Excluir la marca actual de la búsqueda
          },
          anuladoEn: null, // Solo marcas no anuladas
        },
      });

      if (nombreDuplicado) {
        logError({
          userId,
          ip: req.ip,
          entityType: 'marca',
          entityId: id,
          module: 'actualizarMarca',
          action: 'error_actualizar_marca',
          message: 'Error al actualizar la marca',
          error: 'Ya existe otra marca con ese nombre. 409',
          context: {
            idSolicitado: id,
            nombre,
          },
        });
        return res.status(409).json({
          ok: false,
          data: null,
          error: 'Ya existe otra marca con ese nombre.',
        });
      }

      datosActualizados.nombre = nombreLimpio;
    }

    // Procesar descripción si se proporcionó
    if (descripcion !== undefined) {
      datosActualizados.descripcion = descripcion === null ? null : descripcion.trim();
    }

    // Ya no se permite procesar el campo activo

    // Si no hay datos para actualizar, retornar error
    if (Object.keys(datosActualizados).length === 0) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: id,
        module: 'actualizarMarca',
        action: 'error_actualizar_marca',
        message: 'Error al actualizar la marca',
        error: 'No se proporcionaron datos para actualizar. 400',
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

    // Agregar información de auditoría
    datosActualizados.modificadoEn = new Date();
    datosActualizados.modificadoPor = userId || null;

    // Actualizar la marca en la base de datos
    const marcaActualizada = await prisma.marca.update({
      where: { id },
      data: datosActualizados,
    });

    // Registrar auditoría de actualización exitosa
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'marca',
      entityId: id,
      module: 'actualizarMarca',
      action: 'actualizar_marca',
      message: 'Marca actualizada exitosamente',
      details: {
        id: marcaActualizada.id,
        cambios: Object.keys(datosActualizados)
          .filter((key) => !['modificadoPor', 'modificadoEn'].includes(key))
          .reduce(
            (obj, key) => ({
              ...obj,
              [key]: {
                anterior: marcaExistente[key as keyof typeof marcaExistente],
                nuevo: marcaActualizada[key as keyof typeof marcaActualizada],
              },
            }),
            {}
          ),
      },
    });

    return res.status(200).json({
      ok: true,
      data: marcaActualizada,
      error: null,
    });
  } catch (error: any) {
    console.error('Error al actualizar marca:', error);

    // Registrar error usando logError
    await logError({
      userId: (req as any).usuario?.id || (req as any).user?.id,
      ip: req.ip,
      entityType: 'marca',
      entityId: req.params.id,
      module: 'actualizarMarca',
      action: 'error_actualizar_marca',
      message: 'Error al actualizar la marca. 500',
      error,
      context: {
        idSolicitado: req.params.id,
        datosSolicitud: req.body,
        error: error instanceof Error ? error.message : 'Error desconocido',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    // Manejo detallado de errores de Prisma
    if (error.code === 'P2023') {
      logError({
        userId: (req as any).usuario?.id || (req as any).user?.id,
        ip: req.ip,
        entityType: 'marca',
        entityId: req.params.id,
        module: 'actualizarMarca',
        action: 'error_actualizar_marca',
        message: 'ID inválido',
        error: 'ID inválido. 400',
        context: {
          idSolicitado: req.params.id,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido',
      });
    }
    logError({
      userId: (req as any).usuario?.id || (req as any).user?.id,
      ip: req.ip,
      entityType: 'marca',
      entityId: req.params.id,
      module: 'actualizarMarca',
      action: 'error_actualizar_marca',
      message: 'Error al actualizar la marca',
      error: 'Error interno del servidor al actualizar la marca. 500',
      context: {
        idSolicitado: req.params.id,
      },
    });
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al actualizar la marca',
    });
  }
};

/**
 * Controlador para eliminar (soft delete) una marca.
 * Marca la marca como inactiva en lugar de eliminarla físicamente.
 *
 * @param {Request} req - Objeto de solicitud Express con ID en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Confirmación de eliminación o mensaje de error
 */
export const eliminarMarca = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).usuario?.id || (req as any).user?.id;

    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: id,
        module: 'eliminarMarca',
        action: 'error_eliminar_marca',
        message: 'Error al eliminar la marca',
        error: 'ID inválido. 400',
        context: {
          idSolicitado: id,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido',
      });
    }

    // Verificar si la marca existe y no está anulada
    const marcaExistente = await prisma.marca.findUnique({
      where: {
        id,
        anuladoEn: null, // Solo marcas no anuladas
      },
    });

    if (!marcaExistente) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: id,
        module: 'eliminarMarca',
        action: 'error_eliminar_marca',
        message: 'Error al eliminar la marca',
        error: 'Marca no encontrada. 404',
        context: {
          idSolicitado: id,
        },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Marca no encontrada.',
      });
    }

    // Verificar si la marca tiene productos asociados
    const productosAsociados = await prisma.producto.count({
      where: {
        marcaId: id,
        anuladoEn: null, // Solo productos no anulados
      },
    });

    if (productosAsociados > 0) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'marca',
        entityId: id,
        module: 'eliminarMarca',
        action: 'error_eliminar_marca',
        message: 'Error al eliminar la marca',
        error: 'No se puede eliminar la marca porque tiene productos asociados. 409',
        context: {
          idSolicitado: id,
        },
      });
      return res.status(409).json({
        ok: false,
        data: null,
        error: `No se puede eliminar la marca porque tiene ${productosAsociados} producto(s) asociado(s).`,
      });
    }

    // Realizar soft delete (actualizando el campo anuladoEn)
    const fechaActual = new Date();
    await prisma.marca.update({
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
      entityType: 'marca',
      entityId: id,
      module: 'eliminarMarca',
      action: 'eliminar_marca',
      message: 'Marca eliminada exitosamente',
      details: {
        id,
        tipo: 'soft_delete',
        anuladoEn: fechaActual.toISOString(),
      },
    });

    return res.status(200).json({
      ok: true,
      data: 'Marca eliminada correctamente.',
      error: null,
    });
  } catch (error: any) {
    console.error('Error al eliminar marca:', error);

    // Registrar error usando logError
    await logError({
      userId: (req as any).usuario?.id || (req as any).user?.id,
      ip: req.ip,
      entityType: 'marca',
      entityId: req.params.id,
      module: 'marcas',
      action: 'error_eliminar_marca',
      message: 'Error al eliminar la marca',
      error,
      context: {
        idSolicitado: req.params.id,
        error: error instanceof Error ? error.message : 'Error desconocido P2023',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    // Manejo detallado de errores de Prisma
    if (error.code === 'P2023') {
      logError({
        userId: (req as any).usuario?.id || (req as any).user?.id,
        ip: req.ip,
        entityType: 'marca',
        entityId: req.params.id,
        module: 'eliminarMarca',
        action: 'error_eliminar_marca',
        message: 'Error al eliminar la marca',
        error: 'ID inválido. 400',
        context: {
          idSolicitado: req.params.id,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido',
      });
    }

    logError({
      userId: (req as any).usuario?.id || (req as any).user?.id,
      ip: req.ip,
      entityType: 'marca',
      entityId: req.params.id,
      module: 'eliminarMarca',
      action: 'error_eliminar_marca',
      message: 'Error al eliminar la marca',
      error: 'Error interno del servidor al eliminar la marca. 500',
      context: {
        idSolicitado: req.params.id,
      },
    });
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al eliminar la marca',
    });
  }
};
