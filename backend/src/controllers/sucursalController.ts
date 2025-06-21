import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

import { logSuccess, logError } from '../utils/audit';

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
    const { nombre, direccion, latitud, longitud, telefono, email } = req.body;
    // El campo activo ya no se acepta del cliente
    const userId = (req as any).usuario?.id || (req as any).user?.id;

    // Validación estricta del nombre
    if (!nombre || typeof nombre !== 'string') {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        module: 'crearSucursal',
        action: 'error_crear_sucursal',
        message: 'Error al crear la sucursal',
        error: 'El nombre es obligatorio y debe ser una cadena de texto. 400',
        context: {
          nombre,
          direccion,
          latitud,
          longitud,
          telefono,
          email,
          activo: true, // Siempre activo en la creación
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El nombre es obligatorio y debe ser una cadena de texto.',
      });
    }

    // Validar longitud del nombre
    const nombreLimpio = nombre.trim();
    if (nombreLimpio.length < 3 || nombreLimpio.length > 100) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        module: 'crearSucursal',
        action: 'error_crear_sucursal',
        message: 'Error al crear la sucursal',
        error: 'El nombre debe tener al menos 3 caracteres. 400',
        context: {
          nombre,
          direccion,
          latitud,
          longitud,
          telefono,
          email,
          activo: true, // Siempre activo en la creación
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El nombre debe tener al menos 3 caracteres.',
      });
    }

    // Validar teléfono si se proporciona
    if (telefono && (typeof telefono !== 'string' || !/^\d{10}$/.test(telefono))) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        module: 'crearSucursal',
        action: 'error_crear_sucursal',
        message: 'Error al crear la sucursal',
        error: 'El teléfono debe tener 10 dígitos. 400',
        context: {
          nombre,
          direccion,
          latitud,
          longitud,
          telefono,
          email,
          activo: true, // Siempre activo en la creación
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El teléfono debe tener 10 dígitos.',
      });
    }

    // Validar email si se proporciona
    if (email) {
      if (typeof email !== 'string' || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        logError({
          userId,
          ip: req.ip,
          entityType: 'sucursal',
          module: 'crearSucursal',
          action: 'error_crear_sucursal',
          message: 'Error al crear la sucursal',
          error: 'El email tiene formato inválido. 400',
          context: {
            nombre,
            direccion,
            latitud,
            longitud,
            telefono,
            email,
            activo: true, // Siempre activo en la creación
          },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El email tiene formato inválido.',
        });
      }
    }

    // Validar coordenadas geográficas si se proporcionan
    const latitudParsed = latitud ? parseFloat(latitud) : null;
    const longitudParsed = longitud ? parseFloat(longitud) : null;

    if (latitud && (isNaN(latitudParsed) || latitudParsed < -90 || latitudParsed > 90)) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        module: 'crearSucursal',
        action: 'error_crear_sucursal',
        message: 'Error al crear la sucursal',
        error: 'La latitud debe ser un número entre -90 y 90. 400',
        context: {
          nombre,
          direccion,
          latitud,
          longitud,
          telefono,
          email,
          activo: true, // Siempre activo en la creación
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'La latitud debe ser un número entre -90 y 90.',
      });
    }

    if (longitud && (isNaN(longitudParsed) || longitudParsed < -180 || longitudParsed > 180)) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        module: 'crearSucursal',
        action: 'error_crear_sucursal',
        message: 'Error al crear la sucursal',
        error: 'La longitud debe ser un número entre -180 y 180. 400',
        context: {
          nombre,
          direccion,
          latitud,
          longitud,
          telefono,
          email,
          activo: true, // Siempre activo en la creación
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'La longitud debe ser un número entre -180 y 180.',
      });
    }

    // Verificar si ya existe una sucursal con el mismo nombre (activa o inactiva)
    // Primero buscamos solo por nombre sin importar si está anulada
    const sucursalMismoNombre = await prisma.sucursal.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: 'insensitive', // Búsqueda case-insensitive
        },
      },
    });

    // Caso 1: Existe una sucursal con el mismo nombre y está activa
    if (sucursalMismoNombre && sucursalMismoNombre.activo === true && sucursalMismoNombre.anuladoEn === null) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        module: 'crearSucursal',
        action: 'error_crear_sucursal',
        message: 'Error al crear la sucursal',
        error: 'Ya existe una sucursal activa con ese nombre.',
        context: {
          nombre,
          direccion,
          latitud,
          longitud,
          telefono,
          email,
          activo: true, // Siempre activo en la creación
          error: 'Ya existe una sucursal activa con ese nombre.',
        },
      });
      return res.status(409).json({
        ok: false,
        data: null,
        error: 'Ya existe una sucursal activa con ese nombre.',
      });
    }
    
    // Caso 2: Existe una sucursal con el mismo nombre pero está inactiva (reactivar)
    if (sucursalMismoNombre && (sucursalMismoNombre.activo === false || sucursalMismoNombre.anuladoEn !== null)) {
      try {
        // Reactivar la sucursal y actualizar sus datos
        const sucursalReactivada = await prisma.sucursal.update({
          where: { id: sucursalMismoNombre.id },
          data: {
            activo: true,
            anuladoEn: null,
            anuladoPor: null,
            direccion: direccion || sucursalMismoNombre.direccion,
            latitud: latitud !== undefined ? latitudParsed : sucursalMismoNombre.latitud,
            longitud: longitud !== undefined ? longitudParsed : sucursalMismoNombre.longitud,
            telefono: telefono || sucursalMismoNombre.telefono,
            email: email || sucursalMismoNombre.email,
            modificadoEn: new Date(),
            modificadoPor: userId
          },
        });
        
        // Registrar éxito de reactivación
        await logSuccess({
          userId,
          ip: req.ip,
          entityType: 'sucursal',
          entityId: sucursalReactivada.id,
          module: 'crearSucursal',
          action: 'reactivar_sucursal_exitoso',
          message: 'Sucursal reactivada exitosamente',
          details: {
            id: sucursalReactivada.id,
            nombre: sucursalReactivada.nombre,
            estadoAnterior: {
              activo: false,
              modificadoEn: sucursalMismoNombre.modificadoEn,
              anuladoEn: sucursalMismoNombre.anuladoEn
            },
            estadoNuevo: {
              activo: true,
              modificadoEn: sucursalReactivada.modificadoEn,
              anuladoEn: null
            }
          }
        });
        
        return res.status(200).json({
          ok: true,
          data: {
            id: sucursalReactivada.id,
            nombre: sucursalReactivada.nombre,
            mensaje: 'Sucursal reactivada exitosamente'
          },
          error: null
        });
      } catch (error: any) {
        logError({
          userId,
          ip: req.ip,
          entityType: 'sucursal',
          entityId: sucursalMismoNombre.id,
          module: 'crearSucursal',
          action: 'error_reactivar_sucursal',
          message: 'Error al reactivar la sucursal',
          error: error instanceof Error ? error.message : 'Error desconocido',
          context: {
            nombre,
            direccion,
            latitud,
            longitud,
            telefono,
            email
          },
        });
        return res.status(500).json({
          ok: false,
          data: null,
          error: 'Error al reactivar la sucursal.'
        });
      }
    }

    // Verificar si ya existe una sucursal con el mismo email (si se proporciona)
    if (email) {
      const emailExistente = await prisma.sucursal.findFirst({
        where: {
          email: {
            equals: email.trim(),
            mode: 'insensitive', // Búsqueda case-insensitive
          },
          anuladoEn: null, // Solo sucursales no anuladas
        },
      });

      if (emailExistente) {
        logError({
          userId,
          ip: req.ip,
          entityType: 'sucursal',
          module: 'crearSucursal',
          action: 'error_crear_sucursal',
          message: 'Error al crear la sucursal',
          error: 'Ya existe una sucursal con ese email. 409',
          context: {
            nombre,
            direccion,
            latitud,
            longitud,
            telefono,
            email,
            activo: true, // Siempre activo en la creación
          },
        });
        return res.status(409).json({
          ok: false,
          data: null,
          error: 'Ya existe una sucursal con ese email.',
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
        activo: true, // Siempre se crea activa
        creadoPor: userId || null,
        creadoEn: new Date(),
      },
    });

    // Registrar éxito de creación
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      entityId: nuevaSucursal.id,
      module: 'crearSucursal',
      action: 'crear_sucursal_exitoso',
      message: 'Sucursal creada exitosamente',
      details: {
        nombre: nuevaSucursal.nombre,
        direccion: nuevaSucursal.direccion,
        email: nuevaSucursal.email,
        telefono: nuevaSucursal.telefono,
        activo: nuevaSucursal.activo,
        latitud: nuevaSucursal.latitud,
        longitud: nuevaSucursal.longitud,
      },
    });

    return res.status(201).json({
      ok: true,
      data: nuevaSucursal,
      error: null,
    });
  } catch (error: any) {
    console.error('Error al crear sucursal:', error);

    // Registrar error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    await logError({
      userId: (req as any).usuario?.id || (req as any).user?.id,
      ip: req.ip,
      entityType: 'sucursal',
      module: 'crearSucursal',
      action: 'error_crear_sucursal',
      message: 'Error al crear sucursal',
      error,
      context: {
        datosSolicitud: {
          nombre: req.body.nombre,
          email: req.body.email,
        },
        error: errorMessage,
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: `Error al crear sucursal: ${errorMessage}`,
    });
  }
};

/**
 * Controlador para listar sucursales con paginación y filtros opcionales.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista paginada de sucursales o mensaje de error
 */
export const listarSucursalesPaginadas = async (req: Request, res: Response) => {
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  // Extraer parámetros de paginación y búsqueda
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const searchText = (req.query.searchText as string) || '';

  try {
    // Calcular offset para la paginación
    const skip = (page - 1) * pageSize;

    // Preparar filtros
    const filtro: any = {
      anuladoEn: null, // Solo sucursales no anuladas (soft delete)
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
    const total = await prisma.sucursal.count({
      where: filtro,
    });

    // Buscar sucursales según filtros, con paginación y ordenar alfabéticamente
    const sucursales = await prisma.sucursal.findMany({
      where: filtro,
      orderBy: {
        nombre: 'asc', // Ordenar alfabéticamente
      },
      skip,
      take: pageSize,
    });

    // Registrar éxito de listado paginado
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      module: 'listarSucursalesPaginadas',
      action: 'listar_sucursales_paginadas_exitoso',
      message: 'Consulta de sucursales paginada exitosa',
      details: {
        totalRegistros: total,
        registrosDevueltos: sucursales.length,
        paginaActual: page,
        tamanoPagina: pageSize,
        parametrosBusqueda: {
          searchText: searchText || 'No aplica',
          activo: req.query.activo !== undefined ? req.query.activo : 'No filtrado',
        },
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        items: sucursales,
        total,
        page,
        pageSize,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Error al listar sucursales paginadas:', error);

    // Registrar error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    await logError({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      module: 'listarSucursalesPaginadas',
      action: 'error_listar_sucursales_paginadas',
      message: 'Error al listar sucursales paginadas',
      error,
      context: {
        paginaSolicitada: page,
        tamanoPagina: pageSize,
        parametrosBusqueda: {
          searchText: searchText || 'No aplica',
          activo: req.query.activo !== undefined ? req.query.activo : 'No filtrado',
        },
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && error instanceof Error
          ? { stack: error.stack }
          : {}),
      },
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener el listado paginado de sucursales.',
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
      anuladoEn: null, // Solo sucursales no anuladas (soft delete)
    };

    // Filtro adicional por activo si se proporciona en la consulta
    if (req.query.activo !== undefined) {
      filtro.activo = req.query.activo === 'true';
    }

    // Buscar sucursales según filtros y ordenar alfabéticamente
    const sucursales = await prisma.sucursal.findMany({
      where: filtro,
      orderBy: {
        nombre: 'asc', // Ordenar alfabéticamente
      },
    });

    // Registrar éxito de listado
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      module: 'listarSucursales',
      action: 'listar_sucursales_exitoso',
      message: 'Listado de sucursales obtenido exitosamente',
      details: {
        total: sucursales.length,
        filtrosAplicados: {
          activo: req.query.activo !== undefined ? req.query.activo : null,
          soloActivas: true,
        },
        ordenamiento: 'nombre (ascendente)',
      },
    });

    return res.status(200).json({
      ok: true,
      data: sucursales,
      error: null,
    });
  } catch (error: any) {
    console.error('Error al listar sucursales:', error);

    // Registrar error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    await logError({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      module: 'listarSucursales',
      action: 'error_listar_sucursales',
      message: 'Error al listar sucursales',
      error,
      context: {
        filtrosAplicados: {
          activo: req.query.activo !== undefined ? req.query.activo : null,
          soloActivas: true,
        },
        error: errorMessage,
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error:
        'Error al listar sucursales: ' +
        (error instanceof Error ? error.message : 'Error desconocido'),
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
        error: 'ID inválido',
      });
    }

    // Buscar la sucursal por ID
    const sucursal = await prisma.sucursal.findUnique({
      where: {
        id,
        anuladoEn: null, // Solo sucursales no anuladas (soft delete)
      },
    });

    // Verificar si se encontró la sucursal
    if (!sucursal) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        module: 'obtenerSucursalPorId',
        action: 'error_obtener_sucursal',
        message: 'Error al obtener la sucursal',
        error: 'Sucursal no encontrada. 404',
        context: {
          id,
        },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Sucursal no encontrada.',
      });
    }

    // Registrar éxito de consulta
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      entityId: id,
      module: 'obtenerSucursalPorId',
      action: 'obtener_sucursal_exitoso',
      message: 'Consulta de sucursal exitosa',
      details: {
        id: sucursal.id,
        nombre: sucursal.nombre,
        activo: sucursal.activo,
        anulada: sucursal.anuladoEn !== null,
        ultimaActualizacion: sucursal.modificadoEn || sucursal.creadoEn,
      },
    });

    return res.status(200).json({
      ok: true,
      data: sucursal,
      error: null,
    });
  } catch (error: any) {
    console.error('Error al obtener sucursal por ID:', error);

    // Registrar error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    await logError({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      entityId: id,
      module: 'obtenerSucursalPorId',
      action: 'error_obtener_sucursal',
      message: 'Error al obtener sucursal',
      error,
      context: {
        idSolicitado: id,
        tipoError: error instanceof Error ? error.name : 'Error desconocido',
        codigoError: (error as any).code || 'NO_CODE',
        error: errorMessage,
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    // Manejo detallado de errores
    if (
      error instanceof Error &&
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2023'
    ) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        entityId: id,
        module: 'obtenerSucursalPorId',
        action: 'error_obtener_sucursal',
        message: 'Error al obtener sucursal',
        error: 'ID inválido. 400',
        context: {
          idSolicitado: id,
          tipoError: error instanceof Error ? error.name : 'Error desconocido',
          codigoError: (error as any).code || 'NO_CODE',
          error: errorMessage,
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
      entityType: 'sucursal',
      entityId: id,
      module: 'obtenerSucursalPorId',
      action: 'error_obtener_sucursal',
      message: 'Error al obtener sucursal',
      error: 'Ocurrió un error al obtener la sucursal. 500',
      context: {
        idSolicitado: id,
        tipoError: error instanceof Error ? error.name : 'Error desconocido',
        codigoError: (error as any).code || 'NO_CODE',
        error: errorMessage,
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener la sucursal.',
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
    const { nombre, direccion, latitud, longitud, telefono, email } = req.body;
    
    // Verificar que no se esté intentando actualizar el campo activo
    if ('activo' in req.body) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        entityId: id,
        module: 'actualizarSucursal',
        action: 'error_actualizar_sucursal',
        message: 'Error al actualizar la sucursal',
        error: 'No está permitido modificar el estado activo mediante esta función. 400',
        context: {
          idSolicitado: id,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'No está permitido modificar el estado activo mediante esta función.',
      });
    }

    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        entityId: id,
        module: 'actualizarSucursal',
        action: 'error_actualizar_sucursal',
        message: 'Error al actualizar la sucursal',
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

    // Verificar si la sucursal existe
    const sucursalExistente = await prisma.sucursal.findUnique({
      where: {
        id,
        anuladoEn: null, // Solo sucursales no anuladas
      },
    });

    if (!sucursalExistente) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        entityId: id,
        module: 'actualizarSucursal',
        action: 'error_actualizar_sucursal',
        message: 'Error al actualizar la sucursal',
        error: 'Sucursal no encontrada. 404',
        context: {
          idSolicitado: id,
        },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Sucursal no encontrada.',
      });
    }

    // Preparar objeto de datos a actualizar
    const datosActualizados: any = {
      // Agregar campos de auditoría
      modificadoPor: userId || null,
      modificadoEn: new Date(),
    };

    // Validar y procesar nombre si se proporcionó
    if (nombre !== undefined) {
      if (!nombre || typeof nombre !== 'string') {
        logError({
          userId,
          ip: req.ip,
          entityType: 'sucursal',
          entityId: id,
          module: 'actualizarSucursal',
          action: 'error_actualizar_sucursal',
          message: 'Error al actualizar la sucursal',
          error: 'El nombre debe ser una cadena de texto válida. 400',
          context: {
            nombre,
            latitud,
            longitud,
            telefono,
            direccion,
            email,
            activo: true, // Siempre activo en la creación
            idSolicitado: id,
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
      if (nombreLimpio.length < 3 || nombreLimpio.length > 100) {
        logError({
          userId,
          ip: req.ip,
          entityType: 'sucursal',
          entityId: id,
          module: 'actualizarSucursal',
          action: 'error_actualizar_sucursal',
          message: 'Error al actualizar la sucursal',
          error: 'El nombre debe tener al menos 3 caracteres. 400',
          context: {
            nombre,
            latitud,
            longitud,
            telefono,
            direccion,
            email,
            activo: true, // Siempre activo en la creación
            idSolicitado: id,
          },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El nombre debe tener al menos 3 caracteres.',
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
          anuladoEn: null, // Solo sucursales no anuladas
        },
      });

      if (nombreDuplicado) {
        logError({
          userId,
          ip: req.ip,
          entityType: 'sucursal',
          entityId: id,
          module: 'actualizarSucursal',
          action: 'error_actualizar_sucursal',
          message: 'Error al actualizar la sucursal',
          error: 'Ya existe otra sucursal con ese nombre. 409',
          context: {
            nombre,
            latitud,
            longitud,
            telefono,
            direccion,
            email,
            activo: true, // Siempre activo en la creación
            idSolicitado: id,
          },
        });
        return res.status(409).json({
          ok: false,
          data: null,
          error: 'Ya existe otra sucursal con ese nombre.',
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
          logError({
            userId,
            ip: req.ip,
            entityType: 'sucursal',
            entityId: id,
            module: 'actualizarSucursal',
            action: 'error_actualizar_sucursal',
            message: 'Error al actualizar la sucursal',
            error: 'El teléfono debe tener 10 dígitos. 400',
            context: {
              nombre,
              latitud,
              longitud,
              telefono,
              direccion,
              email,
              activo: true, // Siempre activo en la creación
              idSolicitado: id,
            },
          });
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'El teléfono debe tener 10 dígitos.',
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
          logError({
            userId,
            ip: req.ip,
            entityType: 'sucursal',
            entityId: id,
            module: 'actualizarSucursal',
            action: 'error_actualizar_sucursal',
            message: 'Error al actualizar la sucursal',
            error: 'El email tiene formato inválido. 400',
            context: {
              nombre,
              latitud,
              longitud,
              telefono,
              direccion,
              email,
              activo: true, // Siempre activo en la creación
              idSolicitado: id,
            },
          });
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'El email tiene formato inválido.',
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
            anuladoEn: null, // Solo sucursales no anuladas
          },
        });

        if (emailDuplicado) {
          logError({
            userId,
            ip: req.ip,
            entityType: 'sucursal',
            entityId: id,
            module: 'actualizarSucursal',
            action: 'error_actualizar_sucursal',
            message: 'Error al actualizar la sucursal',
            error: 'Ya existe otra sucursal con ese email. 409',
            context: {
              nombre,
              latitud,
              longitud,
              telefono,
              direccion,
              email,
              activo: true, // Siempre activo en la creación
              idSolicitado: id,
            },
          });
          return res.status(409).json({
            ok: false,
            data: null,
            error: 'Ya existe otra sucursal con ese email.',
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
          logError({
            userId,
            ip: req.ip,
            entityType: 'sucursal',
            entityId: id,
            module: 'actualizarSucursal',
            action: 'error_actualizar_sucursal',
            message: 'Error al actualizar la sucursal',
            error: 'La latitud debe ser un número entre -90 y 90. 400',
            context: {
              nombre,
              latitud,
              longitud,
              telefono,
              direccion,
              email,
              activo: true, // Siempre activo en la creación
              idSolicitado: id,
            },
          });
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'La latitud debe ser un número entre -90 y 90.',
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
          logError({
            userId,
            ip: req.ip,
            entityType: 'sucursal',
            entityId: id,
            module: 'actualizarSucursal',
            action: 'error_actualizar_sucursal',
            message: 'Error al actualizar la sucursal',
            error: 'La longitud debe ser un número entre -180 y 180. 400',
            context: {
              nombre,
              latitud,
              longitud,
              telefono,
              direccion,
              email,
              activo: true, // Siempre activo en la creación
              idSolicitado: id,
            },
          });
          return res.status(400).json({
            ok: false,
            data: null,
            error: 'La longitud debe ser un número entre -180 y 180.',
          });
        }
        datosActualizados.longitud = longitudParsed;
      } else {
        datosActualizados.longitud = null;
      }
    }

    // El estado activo ya no se puede modificar desde aquí
    // Se ha eliminado la validación para cambiar el campo activo

    // Si no hay datos para actualizar, retornar error
    if (Object.keys(datosActualizados).length === 0) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        entityId: id,
        module: 'actualizarSucursal',
        action: 'error_actualizar_sucursal',
        message: 'Error al actualizar la sucursal',
        error: 'No se proporcionaron datos para actualizar. 400',
        context: {
          nombre,
          latitud,
          longitud,
          telefono,
          direccion,
          email,
          activo: true, // Siempre activo en la creación
          idSolicitado: id,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'No se proporcionaron datos para actualizar.',
      });
    }

    // Actualizar la sucursal
    const sucursalActualizada = await prisma.sucursal.update({
      where: { id },
      data: datosActualizados,
    });

    // Registrar éxito de actualización
    const cambios = Object.keys(datosActualizados)
      .filter((key) => key !== 'modificadoPor' && key !== 'modificadoEn')
      .reduce(
        (obj, key) => {
          obj[key] = datosActualizados[key];
          return obj;
        },
        {} as Record<string, any>
      );

    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      entityId: id,
      module: 'actualizarSucursal',
      action: 'actualizar_sucursal_exitoso',
      message: 'Sucursal actualizada exitosamente',
      details: {
        cambios,
        estadoAnterior: {
          nombre: sucursalExistente.nombre,
          direccion: sucursalExistente.direccion,
          telefono: sucursalExistente.telefono,
          email: sucursalExistente.email,
          activo: sucursalExistente.activo,
          latitud: sucursalExistente.latitud,
          longitud: sucursalExistente.longitud,
        },
        estadoNuevo: {
          nombre: sucursalActualizada.nombre,
          direccion: sucursalActualizada.direccion,
          telefono: sucursalActualizada.telefono,
          email: sucursalActualizada.email,
          activo: sucursalActualizada.activo,
          latitud: sucursalActualizada.latitud,
          longitud: sucursalActualizada.longitud,
        },
      },
    });

    return res.status(200).json({
      ok: true,
      data: sucursalActualizada,
      error: null,
    });
  } catch (error: any) {
    console.error('Error al actualizar sucursal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    // Registrar error
    await logError({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      entityId: id,
      module: 'actualizarSucursal',
      action: 'error_actualizar_sucursal',
      message: 'Error al actualizar la sucursal',
      error,
      context: {
        idSucursal: id,
        datosSolicitados: req.body,
        tipoError: error instanceof Error ? error.name : 'Error desconocido',
        codigoError: (error as any).code || 'NO_CODE',
        error: errorMessage,
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    // Manejo detallado de errores
    if (error instanceof Error) {
      if ('code' in error && error.code === 'P2025') {
        logError({
          userId,
          ip: req.ip,
          entityType: 'sucursal',
          entityId: id,
          module: 'actualizarSucursal',
          action: 'error_actualizar_sucursal',
          message: 'Error al actualizar la sucursal',
          error: 'Sucursal no encontrada. 404',
          context: {
            idSucursal: id,
            datosSolicitados: req.body,
            tipoError: error instanceof Error ? error.name : 'Error desconocido',
            codigoError: (error as any).code || 'NO_CODE',
            error: errorMessage,
            ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
          },
        });
        return res.status(404).json({
          ok: false,
          data: null,
          error: 'Sucursal no encontrada.',
        });
      }

      if ('code' in error && error.code === 'P2002') {
        logError({
          userId,
          ip: req.ip,
          entityType: 'sucursal',
          entityId: id,
          module: 'actualizarSucursal',
          action: 'error_actualizar_sucursal',
          message: 'Error al actualizar la sucursal',
          error: 'Ya existe una sucursal con el mismo nombre o email. 409',
          context: {
            idSucursal: id,
            datosSolicitados: req.body,
            tipoError: error instanceof Error ? error.name : 'Error desconocido',
            codigoError: (error as any).code || 'NO_CODE',
            error: errorMessage,
            ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
          },
        });
        return res.status(409).json({
          ok: false,
          data: null,
          error: 'Ya existe una sucursal con el mismo nombre o email.',
        });
      }
    }

    logError({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      entityId: id,
      module: 'actualizarSucursal',
      action: 'error_actualizar_sucursal',
      message: 'Error al actualizar la sucursal',
      error: 'Error al actualizar la sucursal. 500',
      context: {
        idSucursal: id,
        datosSolicitados: req.body,
        tipoError: error instanceof Error ? error.name : 'Error desconocido',
        codigoError: (error as any).code || 'NO_CODE',
        error: errorMessage,
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });
    return res.status(500).json({
      ok: false,
      data: null,
      error: `Error al actualizar la sucursal: ${errorMessage}`,
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
  let sucursalExistente;

  try {
    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        entityId: id,
        module: 'eliminarSucursal',
        action: 'error_eliminar_sucursal',
        message: 'Error al eliminar la sucursal',
        error: 'ID inválido. 400',
        context: {
          idSucursal: id,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido',
      });
    }

    // Verificar si la sucursal existe y no está anulada
    sucursalExistente = await prisma.sucursal.findUnique({
      where: {
        id,
        anuladoEn: null, // Solo sucursales no anuladas
      },
    });

    if (!sucursalExistente) {
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        entityId: id,
        module: 'eliminarSucursal',
        action: 'error_eliminar_sucursal',
        message: 'Error al eliminar la sucursal',
        error: 'Sucursal no encontrada. 404',
        context: {
          idSucursal: id,
        },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Sucursal no encontrada.',
      });
    }

    // Verificar todas las relaciones que previenen eliminación de la sucursal
    
    // 1. Verificar citas asociadas
    const citasAsociadas = await prisma.cita.count({
      where: {
        sucursalId: id,
        anuladoEn: null,
      },
    });

    // 2. Verificar descansos de empleados asociados
    const descansosEmpleadoAsociados = await prisma.descansoEmpleado.count({
      where: {
        sucursalId: id,
        anuladoEn: null,
      },
    });

    // 3. Verificar inventarios asociados
    const inventariosAsociados = await prisma.inventario.count({
      where: {
        sucursalId: id,
        anuladoEn: null,
      },
    });

    // 4. Verificar movimientos contables asociados
    const movimientosContablesAsociados = await prisma.movimientoContable.count({
      where: {
        sucursalId: id,
        anuladoEn: null,
      },
    });

    // 5. Verificar pedidos asociados
    const pedidosAsociados = await prisma.pedido.count({
      where: {
        sucursalId: id,
        anuladoEn: null,
      },
    });

    // Estructurar las relaciones asociadas para el mensaje de error
    const relacionesAsociadas = [];
    if (citasAsociadas > 0) relacionesAsociadas.push(`${citasAsociadas} cita(s)`);
    if (descansosEmpleadoAsociados > 0) relacionesAsociadas.push(`${descansosEmpleadoAsociados} descanso(s) de empleado`);
    if (inventariosAsociados > 0) relacionesAsociadas.push(`${inventariosAsociados} inventario(s)`);
    if (movimientosContablesAsociados > 0) relacionesAsociadas.push(`${movimientosContablesAsociados} movimiento(s) contable(s)`);
    if (pedidosAsociados > 0) relacionesAsociadas.push(`${pedidosAsociados} pedido(s)`);

    // Si hay relaciones que previenen la eliminación, retornar error
    if (relacionesAsociadas.length > 0) {
      const mensajeError = `No se puede eliminar la sucursal porque tiene asociado(s): ${relacionesAsociadas.join(', ')}.`;
      
      logError({
        userId,
        ip: req.ip,
        entityType: 'sucursal',
        entityId: id,
        module: 'eliminarSucursal',
        action: 'error_eliminar_sucursal',
        message: 'Error al eliminar la sucursal',
        error: `${mensajeError} 409`,
        context: {
          idSucursal: id,
          citasAsociadas,
          descansosEmpleadoAsociados,
          inventariosAsociados,
          movimientosContablesAsociados,
          pedidosAsociados,
        },
      });

      return res.status(409).json({
        ok: false,
        data: null,
        error: mensajeError,
      });
    }

    // Perform soft delete by updating the anuladoEn and anuladoPor fields
    await prisma.sucursal.update({
      where: { id },
      data: {
        activo: false,
        anuladoEn: new Date(),
        anuladoPor: userId,
      },
    });

    // Registrar éxito de eliminación
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      entityId: id,
      module: 'eliminarSucursal',
      action: 'eliminar_sucursal_exitoso',
      message: 'Sucursal eliminada exitosamente (soft delete)',
      details: {
        id: sucursalExistente.id,
        nombre: sucursalExistente.nombre,
        razon: 'Eliminación lógica (soft delete)',
        estadoAnterior: {
          activo: sucursalExistente.activo,
          anuladoEn: sucursalExistente.anuladoEn,
          anuladoPor: sucursalExistente.anuladoPor,
        },
        estadoNuevo: {
          activo: false,
          anuladoEn: new Date().toISOString(),
          anuladoPor: userId,
        },
      },
    });

    return res.status(200).json({
      ok: true,
      data: { id, mensaje: 'Sucursal eliminada exitosamente' },
      error: null,
    });
  } catch (error: any) {
    console.error('Error al eliminar sucursal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    // Registrar error
    await logError({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      entityId: id,
      module: 'eliminarSucursal',
      action: 'error_eliminar_sucursal',
      message: 'Error al eliminar la sucursal',
      error,
      context: {
        idSucursal: id,
        tipoError: error instanceof Error ? error.name : 'Error desconocido',
        codigoError: (error as any).code || 'NO_CODE',
        error: errorMessage,
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });

    // Manejo detallado de errores
    if (error instanceof Error) {
      if ('code' in error && error.code === 'P2025') {
        logError({
          userId,
          ip: req.ip,
          entityType: 'sucursal',
          entityId: id,
          module: 'eliminarSucursal',
          action: 'error_eliminar_sucursal',
          message: 'Error al eliminar la sucursal',
          error: 'Sucursal no encontrada. 404',
          context: {
            idSucursal: id,
          },
        });
        return res.status(404).json({
          ok: false,
          data: null,
          error: 'Sucursal no encontrada.',
        });
      }
    }

    logError({
      userId,
      ip: req.ip,
      entityType: 'sucursal',
      entityId: id,
      module: 'eliminarSucursal',
      action: 'error_eliminar_sucursal',
      message: 'Error al eliminar la sucursal',
      error: 'Error al eliminar la sucursal. 500',
      context: {
        idSucursal: id,
        tipoError: error instanceof Error ? error.name : 'Error desconocido',
        codigoError: (error as any).code || 'NO_CODE',
        error: errorMessage,
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });
    return res.status(500).json({
      ok: false,
      data: null,
      error: `Error al eliminar la sucursal: ${errorMessage}`,
    });
  }
};
