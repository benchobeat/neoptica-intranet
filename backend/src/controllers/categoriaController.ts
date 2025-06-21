import { PrismaClient, type Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

import { logError, logSuccess } from '../utils/audit';
import { getUserId } from '../utils/requestUtils';
import { validarIconoUrl } from '../utils/validacions';

const prisma = new PrismaClient();

/**
 * Controlador para crear una nueva categoría.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Respuesta con la categoría creada o mensaje de error
 */
export const crearCategoria = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría y campos de control
  const userId = getUserId(req);

  try {
    const { nombre, descripcion, tipoCategoria, iconoUrl, orden, padreId, erpId, erpTipo } =
      req.body;

    // Validar iconoUrl si se proporciona
    if (iconoUrl !== undefined) {
      const errorIcono = validarIconoUrl(iconoUrl);
      if (errorIcono) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'categoria',
          module: 'crearCategoria',
          action: 'error_crear_categoria',
          message: 'URL de ícono inválida',
          error: new Error(errorIcono),
          context: { iconoUrl },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: errorIcono,
        });
      }
    }

    // Validación estricta y avanzada de datos de entrada
    if (!nombre || typeof nombre !== 'string') {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        module: 'crearCategoria',
        action: 'error_crear_categoria',
        message: 'Se presentó un error durante la creación de la categoría',
        error: new Error('El nombre es obligatorio y debe ser una cadena de texto.'),
        context: req.body,
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
        entityType: 'categoria',
        module: 'crearCategoria',
        action: 'error_crear_categoria',
        message: 'Se presentó un error durante la creación de la categoría',
        error: new Error('El nombre debe tener entre 2 y 100 caracteres.'),
        context: { nombre },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El nombre debe tener entre 2 y 100 caracteres.',
      });
    }

    // Verificar si ya existe una categoría con el mismo nombre
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nombre: nombreLimpio,
      },
      include: {
        padre: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // Si la categoría existe y está activa, retornar error
    if (categoriaExistente?.activo) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        module: 'crearCategoria',
        action: 'error_crear_categoria',
        message: 'Ya existe una categoría activa con ese nombre',
        error: new Error('Ya existe una categoría activa con ese nombre.'),
        context: { nombre, categoriaExistenteId: categoriaExistente.id },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Ya existe una categoría activa con ese nombre.',
      });
    }

    // Si la categoría existe pero está desactivada, reactivarla
    if (categoriaExistente && !categoriaExistente.activo) {
      const categoriaReactivada = await prisma.categoria.update({
        where: { id: categoriaExistente.id },
        data: {
          descripcion: descripcion?.trim() || null,
          tipoCategoria: tipoCategoria?.trim() || null,
          iconoUrl: iconoUrl?.trim() || null,
          orden: orden !== undefined ? Number(orden) : null, // Ensure it's a number
          padreId: padreId || null,
          erpId: erpId || null,
          erpTipo: erpTipo || null,
          activo: true,
          modificadoPor: userId || null,
          modificadoEn: new Date(),
        },
        include: {
          padre: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });

      // Registrar auditoría de reactivación
      await logSuccess({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        entityId: categoriaReactivada.id,
        module: 'crearCategoria',
        action: 'categoria_reactivada_exitoso',
        message: 'Categoría reactivada exitosamente',
        details: {
          categoria: {
            id: categoriaReactivada.id,
            nombre: categoriaReactivada.nombre,
            estadoAnterior: 'inactiva',
            estadoNuevo: 'activa',
          },
        },
      });

      return res.status(200).json({
        ok: true,
        data: categoriaReactivada,
        error: null,
      });
    }

    // Validar categoría padre si se proporciona
    if (padreId) {
      const padreExiste = await prisma.categoria.findUnique({
        where: { id: padreId },
      });

      if (!padreExiste) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'categoria',
          module: 'crearCategoria',
          action: 'error_crear_categoria',
          message: 'Se presentó un error durante la creación de la categoría',
          error: new Error('La categoría padre especificada no existe.'),
          context: { padreId },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'La categoría padre especificada no existe.',
        });
      }
    }

    // Preparar datos para la creación de una nueva categoría
    const categoriaData = {
      nombre: nombreLimpio,
      descripcion: descripcion?.trim() || null,
      tipoCategoria: tipoCategoria?.trim() || null,
      iconoUrl: iconoUrl?.trim() || null,
      orden: orden !== undefined ? Number(orden) : 0,
      activo: true, // Siempre se crea como activa
      erpId: erpId !== undefined ? Number(erpId) : null,
      erpTipo: erpTipo?.trim() || null,
      padreId: padreId || null,
      // Datos de auditoría
      creadoPor: userId || null,
      creadoEn: new Date(),
    };

    // Crear la categoría en la base de datos
    const nuevaCategoria = await prisma.categoria.create({
      data: categoriaData,
      include: {
        padre: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // Registrar éxito para auditoría
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'categoria',
      entityId: nuevaCategoria.id,
      module: 'crearCategoria',
      action: 'categoria_creada_exitoso',
      message: 'Categoría creada exitosamente',
      details: {
        categoria: {
          id: nuevaCategoria.id,
          nombre: nuevaCategoria.nombre,
        },
      },
    });

    return res.status(201).json({
      ok: true,
      data: nuevaCategoria,
      error: null,
    });
  } catch (error) {
    // Registrar el error para auditoría
    await logError({
      userId:
        (req as { usuario?: { id: string }; user?: { id: string } }).usuario?.id ||
        (req as { usuario?: { id: string }; user?: { id: string } }).user?.id,
      ip: req.ip,
      entityType: 'categoria',
      module: 'crearCategoria',
      action: 'error_crear_categoria',
      message: 'Error interno al crear la categoría',
      error: error as Error,
      context: req.body,
    });

    console.error('Error al crear categoría:', error);
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al crear la categoría.',
    });
  }
};

/**
 * Controlador para listar todas las categorías con filtros opcionales.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista de categorías o mensaje de error
 */
export const listarCategorias = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId =
    (req as { usuario?: { id: string }; user?: { id: string } }).usuario?.id ||
    (req as { usuario?: { id: string }; user?: { id: string } }).user?.id;

  try {
    // Capturar los parámetros de filtro de la consulta
    const { activo, tipoCategoria, padreId, incluirSubcategorias } = req.query;

    // Construimos el objeto de filtro (where) con el tipo correcto de Prisma
    const where: Prisma.CategoriaWhereInput = {};

    // Filtrar por estado activo/inactivo si se proporciona
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    // Filtrar por tipo de categoría si se proporciona
    if (tipoCategoria) {
      where.tipoCategoria = String(tipoCategoria);
    }

    // Filtrar por categoría padre si se proporciona
    if (padreId) {
      where.padreId = String(padreId);
      // Si no se especifica padreId y no queremos incluir subcategorías
      // entonces filtramos solo categorías de primer nivel (sin padre)
    } else if (incluirSubcategorias !== 'true') {
      where.padreId = null;
    }

    // Consulta a la base de datos
    const categorias = await prisma.categoria.findMany({
      where,
      orderBy: [
        { orden: 'asc' }, // Primero ordenar por el campo 'orden'
        { nombre: 'asc' }, // Luego ordenar alfabéticamente
      ],
      include: {
        // Incluir información básica de la categoría padre si existe
        padre: {
          select: {
            id: true,
            nombre: true,
          },
        },
        // Incluir conteo de productos asociados
        _count: {
          select: {
            productos: true,
            subcategorias: true,
          },
        },
      },
    });

    // Función recursiva para construir la estructura jerárquica
    const buildCategoryTree = (parentId: string | null) => {
      return categorias
        .filter((cat) => cat.padreId === parentId)
        .map((cat) => ({
          ...cat,
          subcategorias: buildCategoryTree(cat.id),
        }));
    };

    // Construir el árbol completo si no se especifica padreId
    // Si se especifica padreId, devolvemos las subcategorías planas
    const data = padreId ? categorias : buildCategoryTree(null);

    // Registrar éxito para auditoría
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'categoria',
      module: 'listarCategorias',
      action: 'categorias_listadas_exitoso',
      message: 'Listado de categorías obtenido exitosamente',
      details: {
        categorias: {
          count: categorias.length,
          query: req.query,
        },
      },
    });
    return res.status(200).json({
      ok: true,
      data,
      error: null,
    });
  } catch (error) {
    // Registrar el error para auditoría
    await logError({
      userId,
      ip: req.ip,
      entityType: 'categoria',
      module: 'listarCategorias',
      action: 'error_listar_categorias',
      message: 'Error al listar categorías',
      error: error as Error,
      context: req.query,
    });

    console.error('Error al listar categorías:', error);
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al obtener la lista de categorías.',
    });
  }
};

/**
 * Controlador para obtener una categoría por su ID.
 *
 * @param {Request} req - Objeto de solicitud Express con ID de categoría en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos de la categoría o mensaje de error
 */
export const obtenerCategoriaPorId = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId =
    (req as { usuario?: { id: string }; user?: { id: string } }).usuario?.id ||
    (req as { usuario?: { id: string }; user?: { id: string } }).user?.id;

  try {
    const { id } = req.params;

    // Validar que el ID sea un formato válido
    if (!id || typeof id !== 'string') {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        module: 'obtenerCategoriaPorId',
        action: 'error_obtener_categoria',
        message: 'ID de categoría inválido',
        error: new Error('El ID de la categoría es requerido y debe ser válido.'),
        context: { id },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El ID de la categoría es requerido y debe ser válido.',
      });
    }

    // Buscar la categoría por ID
    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        // Incluir información de la categoría padre si existe
        padre: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            tipoCategoria: true,
          },
        },
        // Incluir subcategorías directas (un nivel)
        subcategorias: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            orden: true,
            activo: true,
            _count: {
              select: { productos: true },
            },
          },
          orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
        },
        // Incluir conteo de productos asociados
        _count: {
          select: {
            productos: true,
            subcategorias: true,
          },
        },
        // Opcionalmente, podríamos incluir una muestra de productos
        // pero lo dejamos comentado para evitar cargar demasiada información
        /*
        productos: {
          take: 5,  // Solo mostrar 5 productos de ejemplo
          select: {
            id: true,
            nombre: true,
            codigo: true,
            precioBase: true,
          },
          orderBy: { creadoEn: 'desc' }, // Los más recientes
        },
        */
      },
    });

    if (!categoria) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        module: 'obtenerCategoriaPorId',
        action: 'error_obtener_categoria',
        message: 'Categoría no encontrada',
        error: new Error(`No se encontró ninguna categoría con el ID ${id}.`),
        context: { id },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: `No se encontró ninguna categoría con el ID ${id}.`,
      });
    }

    return res.status(200).json({
      ok: true,
      data: categoria,
      error: null,
    });
  } catch (error) {
    // Registrar el error para auditoría
    await logError({
      userId,
      ip: req.ip,
      entityType: 'categoria',
      module: 'obtenerCategoriaPorId',
      action: 'error_obtener_categoria',
      message: 'Error al obtener la categoría',
      error: error as Error,
      context: { id: req.params.id },
    });

    console.error('Error al obtener categoría por ID:', error);
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al obtener la información de la categoría.',
    });
  }
};

/**
 * Controlador para actualizar una categoría existente.
 *
 * @param {Request} req - Objeto de solicitud Express con ID en params y datos en body
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos de la categoría actualizada o mensaje de error
 */
export const actualizarCategoria = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría y campos de control
  const userId =
    (req as { usuario?: { id: string }; user?: { id: string } }).usuario?.id ||
    (req as { usuario?: { id: string }; user?: { id: string } }).user?.id;

  try {
    const { id } = req.params;
    const { nombre, descripcion, tipoCategoria, iconoUrl, orden, padreId, erpId, erpTipo } =
      req.body;

    // Validar iconoUrl si se proporciona
    if (iconoUrl !== undefined) {
      const errorIcono = validarIconoUrl(iconoUrl);
      if (errorIcono) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'categoria',
          module: 'actualizarCategoria',
          action: 'error_actualizar_categoria',
          message: 'URL de ícono inválida',
          error: new Error(errorIcono),
          context: { id, iconoUrl },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: errorIcono,
        });
      }
    }

    // Validar que el ID sea un formato válido
    if (!id || typeof id !== 'string') {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        module: 'actualizarCategoria',
        action: 'error_actualizar_categoria',
        message: 'ID de categoría inválido',
        error: new Error('El ID de la categoría es requerido y debe ser válido.'),
        context: { id },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El ID de la categoría es requerido y debe ser válido.',
      });
    }

    // Verificar que la categoría existe
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoriaExistente) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        module: 'actualizarCategoria',
        action: 'error_actualizar_categoria',
        message: 'Categoría no encontrada',
        error: new Error(`No se encontró ninguna categoría con el ID ${id}.`),
        context: { id },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: `No se encontró ninguna categoría con el ID ${id}.`,
      });
    }

    // Validar datos enviados para actualización
    if (nombre !== undefined && (!nombre || typeof nombre !== 'string')) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        module: 'actualizarCategoria',
        action: 'error_actualizar_categoria',
        message: 'Nombre de categoría inválido',
        error: new Error('El nombre debe ser una cadena de texto válida.'),
        context: { id, nombre },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El nombre debe ser una cadena de texto válida.',
      });
    }

    // Si se proporciona un nombre, validar que no exista duplicado
    let nombreLimpio = undefined;
    if (nombre !== undefined) {
      nombreLimpio = nombre.trim();

      if (nombreLimpio.length < 2 || nombreLimpio.length > 100) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'categoria',
          module: 'actualizarCategoria',
          action: 'error_actualizar_categoria',
          message: 'Longitud de nombre inválida',
          error: new Error('El nombre debe tener entre 2 y 100 caracteres.'),
          context: { id, nombre: nombreLimpio },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'El nombre debe tener entre 2 y 100 caracteres.',
        });
      }

      // Verificar que no exista otra categoría con el mismo nombre (excepto esta misma)
      const categoriaConMismoNombre = await prisma.categoria.findFirst({
        where: {
          nombre: nombreLimpio,
          NOT: { id }, // Excluir la categoría actual
        },
      });

      if (categoriaConMismoNombre) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'categoria',
          module: 'actualizarCategoria',
          action: 'error_actualizar_categoria',
          message: 'Nombre duplicado',
          error: new Error('Ya existe otra categoría con ese nombre.'),
          context: { id, nombre: nombreLimpio, categoriaExistenteId: categoriaConMismoNombre.id },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'Ya existe otra categoría con ese nombre.',
        });
      }
    }

    // Validar categoría padre si se proporciona
    if (padreId !== undefined && padreId !== null) {
      // Verificar que la categoría padre existe
      const padreExiste = await prisma.categoria.findUnique({
        where: { id: padreId },
      });

      if (!padreExiste) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'categoria',
          module: 'actualizarCategoria',
          action: 'error_actualizar_categoria',
          message: 'Categoría padre no existente',
          error: new Error('La categoría padre especificada no existe.'),
          context: { id, padreId },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'La categoría padre especificada no existe.',
        });
      }

      // Verificar que no sea un ciclo (una categoría no puede ser padre de sí misma)
      if (padreId === id) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'categoria',
          module: 'actualizarCategoria',
          action: 'error_actualizar_categoria',
          message: 'Auto-referencia inválida',
          error: new Error('Una categoría no puede ser padre de sí misma.'),
          context: { id, padreId },
        });
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'Una categoría no puede ser padre de sí misma.',
        });
      }

      // Aquí podríamos añadir más validaciones, como verificar que no se creen ciclos
      // recursivos (A->B->C->A) pero eso requeriría una función recursiva adicional
    }

    // Preparar datos para la actualización con el tipo correcto de Prisma
    const categoriaData: Prisma.CategoriaUpdateInput = {};

    // Solo actualizar los campos que se proporcionan
    if (nombreLimpio !== undefined) categoriaData.nombre = nombreLimpio;
    if (descripcion !== undefined) categoriaData.descripcion = descripcion?.trim() || null;
    if (tipoCategoria !== undefined) categoriaData.tipoCategoria = tipoCategoria?.trim() || null;
    if (iconoUrl !== undefined) categoriaData.iconoUrl = iconoUrl?.trim() || null;
    if (orden !== undefined) categoriaData.orden = Number(orden);
    // El campo activo no se puede modificar a través de esta ruta
    if (erpId !== undefined) categoriaData.erpId = erpId !== null ? Number(erpId) : null;
    if (erpTipo !== undefined) categoriaData.erpTipo = erpTipo?.trim() || null;
    if (padreId !== undefined) {
      categoriaData.padre = padreId ? { connect: { id: padreId } } : { disconnect: true };
    }

    // Datos de auditoría
    categoriaData.modificadoPor = userId || null;
    categoriaData.modificadoEn = new Date();

    // Actualizar la categoría en la base de datos
    const categoriaActualizada = await prisma.categoria.update({
      where: { id },
      data: categoriaData,
      include: {
        padre: {
          select: {
            id: true,
            nombre: true,
          },
        },
        _count: {
          select: {
            productos: true,
            subcategorias: true,
          },
        },
      },
    });

    // Registrar éxito para auditoría
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'categoria',
      entityId: categoriaActualizada.id,
      module: 'actualizarCategoria',
      action: 'categoria_actualizada_exitoso',
      message: 'Categoría actualizada exitosamente',
      details: {
        categoria: {
          id: categoriaActualizada.id,
          nombre: categoriaActualizada.nombre,
        },
        camposActualizados: Object.keys(req.body),
      },
    });

    return res.status(200).json({
      ok: true,
      data: categoriaActualizada,
      error: null,
    });
  } catch (error) {
    // Registrar el error para auditoría
    await logError({
      userId:
        (req as { usuario?: { id: string }; user?: { id: string } }).usuario?.id ||
        (req as { usuario?: { id: string }; user?: { id: string } }).user?.id,
      ip: req.ip,
      entityType: 'categoria',
      module: 'actualizarCategoria',
      action: 'error_actualizar_categoria',
      message: 'Error interno al actualizar la categoría',
      error: error as Error,
      context: { id: req.params.id, ...req.body },
    });

    console.error('Error al actualizar categoría:', error);
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al actualizar la categoría.',
    });
  }
};

/**
 * Controlador para eliminar (soft delete) una categoría.
 * Marca la categoría como inactiva en lugar de eliminarla físicamente.
 *
 * @param {Request} req - Objeto de solicitud Express con ID en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Confirmación de eliminación o mensaje de error
 */
export const eliminarCategoria = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId =
    (req as { usuario?: { id: string }; user?: { id: string } }).usuario?.id ||
    (req as { usuario?: { id: string }; user?: { id: string } }).user?.id;

  try {
    const { id } = req.params;

    // Validar que el ID sea un formato válido
    if (!id || typeof id !== 'string') {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        module: 'eliminarCategoria',
        action: 'error_eliminar_categoria',
        message: 'ID de categoría inválido',
        error: new Error('El ID de la categoría es requerido y debe ser válido.'),
        context: { id },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El ID de la categoría es requerido y debe ser válido.',
      });
    }

    // Verificar que la categoría existe y obtener sus subcategorías activas
    const [categoriaExistente, subcategoriasActivas] = await Promise.all([
      prisma.categoria.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              productos: true,
            },
          },
        },
      }),
      prisma.categoria.findMany({
        where: {
          padreId: id,
          activo: true,
        },
        select: { id: true },
      }),
    ]);

    if (!categoriaExistente) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        module: 'eliminarCategoria',
        action: 'error_eliminar_categoria',
        message: 'Categoría no encontrada',
        error: new Error(`No se encontró ninguna categoría con el ID ${id}.`),
        context: { id },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: `No se encontró ninguna categoría con el ID ${id}.`,
      });
    }

    // Verificar si la categoría tiene productos o subcategorías activas asociadas
    const tieneProductos = categoriaExistente._count.productos > 0;
    const tieneSubcategorias = subcategoriasActivas.length > 0;

    // No permitir la desactivación si hay productos o subcategorías
    if (tieneProductos || tieneSubcategorias) {
      const mensaje = `No se puede desactivar la categoría porque tiene ${tieneProductos ? 'productos' : ''}${tieneProductos && tieneSubcategorias ? ' y ' : ''}${tieneSubcategorias ? 'subcategorías' : ''} asociados.`;
      await logError({
        userId,
        ip: req.ip,
        entityType: 'categoria',
        module: 'eliminarCategoria',
        action: 'error_eliminar_categoria',
        message: 'Dependencias existentes',
        error: new Error(mensaje),
        context: {
          id,
          cantidadProductos: categoriaExistente._count.productos,
          cantidadSubcategorias: subcategoriasActivas.length,
        },
      });
      return res.status(400).json({
        ok: false,
        data: null,
        error: mensaje,
      });
    }

    // Realizar soft delete (marcar como inactivo)
    const categoriaDesactivada = await prisma.categoria.update({
      where: { id },
      data: {
        activo: false,
        anuladoEn: new Date(),
        anuladoPor: userId || null,
      },
    });

    // Registrar éxito para auditoría
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'categoria',
      entityId: categoriaDesactivada.id,
      module: 'eliminarCategoria',
      action: 'categoria_desactivada_exitoso',
      message: 'Categoría desactivada exitosamente',
      details: {
        categoria: {
          id: categoriaDesactivada.id,
          nombre: categoriaDesactivada.nombre,
        },
        tieneProductos,
        tieneSubcategorias,
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        id: categoriaDesactivada.id,
        nombre: categoriaDesactivada.nombre,
        activo: categoriaDesactivada.activo,
        mensaje: 'Categoría desactivada exitosamente',
        advertencia:
          tieneProductos || tieneSubcategorias
            ? `La categoría tenía ${tieneProductos ? 'productos' : ''} ${tieneProductos && tieneSubcategorias ? 'y' : ''} ${tieneSubcategorias ? 'subcategorías' : ''} asociados que podrían quedar sin clasificación.`
            : null,
      },
      error: null,
    });
  } catch (error) {
    // Registrar el error para auditoría
    await logError({
      userId:
        (req as { usuario?: { id: string }; user?: { id: string } }).usuario?.id ||
        (req as { usuario?: { id: string }; user?: { id: string } }).user?.id,
      ip: req.ip,
      entityType: 'categoria',
      module: 'eliminarCategoria',
      action: 'error_eliminar_categoria',
      message: 'Error interno al eliminar la categoría',
      error: error as Error,
      context: { id: req.params.id },
    });

    console.error('Error al eliminar categoría:', error);
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al desactivar la categoría.',
    });
  }
};
