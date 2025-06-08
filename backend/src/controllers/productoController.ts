import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

/**
 * Cliente Prisma para interacción con la base de datos.
 * Se inicializa una única instancia para todo el controlador.
 */
const prisma = new PrismaClient();

/**
 * Controlador para crear un nuevo producto.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Respuesta con el producto creado o mensaje de error
 */
export const crearProducto = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, precio, categoria, imagen_url, modelo_3d_url, activo } = req.body;

    // Validación estricta de datos de entrada
    if (typeof nombre !== 'string' || nombre.trim().length < 2) {
      return res.status(400).json({ ok: false, data: null, error: 'El nombre es obligatorio y debe tener al menos 2 caracteres.' });
    }
    if (typeof precio !== 'number' && typeof precio !== 'string') {
      return res.status(400).json({ ok: false, data: null, error: 'El precio es obligatorio y debe ser un número.' });
    }
    const precioNum = typeof precio === 'string' ? parseFloat(precio) : precio;
    if (isNaN(precioNum) || precioNum <= 0) {
      return res.status(400).json({ ok: false, data: null, error: 'El precio debe ser un número mayor a 0.' });
    }
    if (imagen_url && typeof imagen_url === 'string' && !/^https?:\/\/.+/.test(imagen_url)) {
      return res.status(400).json({ ok: false, data: null, error: 'La URL de la imagen no es válida.' });
    }
    if (modelo_3d_url && typeof modelo_3d_url === 'string' && !/^https?:\/\/.+/.test(modelo_3d_url)) {
      return res.status(400).json({ ok: false, data: null, error: 'La URL del modelo 3D no es válida.' });
    }

    // Crear el producto en la base de datos
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : undefined,
        precio: precioNum,
        categoria: categoria ? categoria.trim() : undefined,
        imagen_url,
        modelo_3d_url,
        activo: typeof activo === 'boolean' ? activo : true,
      },
    });

    return res.status(201).json({ ok: true, data: nuevoProducto, error: null });
  } catch (error: any) {
    // // console.error('Error al crear el producto:', error);
    if (error.code === 'P2002') {
      // Prisma error de unicidad (clave duplicada)
      return res.status(409).json({ ok: false, data: null, error: 'Ya existe un producto con ese nombre.' });
    }
    return res.status(500).json({ ok: false, data: null, error: 'Ocurrió un error al crear el producto.' });
  }
};

/**
 * Función auxiliar para normalizar parámetros de consulta.
 *
 * @param {any} param - El parámetro a normalizar
 * @param {T} fallback - Valor por defecto si el parámetro no existe
 * @returns {T} - El valor normalizado
 */
function normalizeParam<T = string>(param: any, fallback: T): T {
  if (Array.isArray(param)) {
    return param[0] ?? fallback;
  }
  return (param ?? fallback) as T;
}

/**
 * Función auxiliar para normalizar parámetros booleanos de consulta.
 *
 * @param {any} param - El parámetro a normalizar
 * @returns {boolean|undefined} - El valor booleano normalizado o undefined
 */
function normalizeBooleanParam(param: any): boolean | undefined {
  if (Array.isArray(param)) param = param[0];
  if (param === true || param === 'true' || param === 1 || param === '1') return true;
  if (param === false || param === 'false' || param === 0 || param === '0') return false;
  return undefined;
}

/**
 * Controlador para listar productos con filtros y paginación.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista paginada de productos o mensaje de error
 */
export const listarProductos = async (req: Request, res: Response) => {
  try {
    // Filtros y paginación
    const page = Number(normalizeParam(req.query.page, 1));
    const limit = Number(normalizeParam(req.query.limit, 20));
    const q = normalizeParam(req.query.q, '');
    const categoria = normalizeParam(req.query.categoria, undefined);
    const soloActivos = normalizeBooleanParam(req.query.soloActivos);

    // Normalización de parámetros
    const pageNum = page > 0 ? page : 1;
    const limitNum = limit > 0 && limit <= 100 ? limit : 20;
    const skip = (pageNum - 1) * limitNum;

    // Construcción de filtros para la consulta
    const where: Record<string, any> = {};
    if (soloActivos === true) {
      where.activo = true;
    } else if (soloActivos === false) {
      where.activo = false;
    }
    if (typeof categoria === 'string' && categoria.length > 0) {
      where.categoria = categoria;
    }
    if (typeof q === 'string' && q.trim().length > 0) {
      where.OR = [
        { nombre: { contains: q.trim(), mode: 'insensitive' } },
        { descripcion: { contains: q.trim(), mode: 'insensitive' } },
      ];
    }

    // Consulta a la base de datos (productos y total)
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { nombre: 'asc' },
      }),
      prisma.producto.count({ where }),
    ]);

    return res.status(200).json({
      ok: true,
      data: productos,
      error: null,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    // // console.error('Error al listar los productos:', error);
    return res.status(500).json({ ok: false, data: null, error: 'Ocurrió un error al listar los productos.' });
  }
};

/**
 * Controlador para obtener un producto por su ID.
 *
 * @param {Request} req - Objeto de solicitud Express con el ID del producto en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos del producto o mensaje de error
 */
export const obtenerProductoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validación del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      return res.status(400).json({ ok: false, data: null, error: 'ID inválido.' });
    }

    // Buscar el producto en la base de datos
    const producto = await prisma.producto.findUnique({ where: { id } });

    // Verificar si el producto existe
    if (!producto) {
      return res.status(404).json({ ok: false, data: null, error: 'Producto no encontrado.' });
    }

    return res.status(200).json({ ok: true, data: producto, error: null });
  } catch (error: any) {
    // Si el error es de validación de Prisma (por ejemplo, formato de ID incorrecto), responde 400
    if (error.code === 'P2023' || error.message?.includes('Invalid')) {
      return res.status(400).json({ ok: false, data: null, error: 'ID inválido (formato incorrecto).' });
    }
    // // console.error('Error al obtener producto por ID:', error);
    return res.status(500).json({ ok: false, data: null, error: 'Ocurrió un error al obtener el producto.' });
  }
};

/**
 * Controlador para actualizar un producto existente.
 *
 * @param {Request} req - Objeto de solicitud Express con el ID del producto en params y datos actualizados en body
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos del producto actualizado o mensaje de error
 */
export const actualizarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validación del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      return res.status(400).json({ ok: false, data: null, error: 'ID inválido.' });
    }

    // Verificar si el producto existe
    const productoExistente = await prisma.producto.findUnique({ where: { id } });
    if (!productoExistente) {
      return res.status(404).json({ ok: false, data: null, error: 'Producto no encontrado.' });
    }

    const { nombre, descripcion, precio, categoria, imagen_url, modelo_3d_url, activo } = req.body;

    // Validaciones estrictas (solo si el campo está presente en la solicitud)
    if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length < 2)) {
      return res.status(400).json({ ok: false, data: null, error: 'El nombre debe tener al menos 2 caracteres.' });
    }

    if (precio !== undefined) {
      const precioNum = typeof precio === 'string' ? parseFloat(precio) : precio;
      if (isNaN(precioNum) || precioNum <= 0) {
        return res.status(400).json({ ok: false, data: null, error: 'El precio debe ser un número mayor a 0.' });
      }
    }

    if (imagen_url && typeof imagen_url === 'string' && !/^https?:\/\/.+/.test(imagen_url)) {
      return res.status(400).json({ ok: false, data: null, error: 'La URL de la imagen no es válida.' });
    }

    if (modelo_3d_url && typeof modelo_3d_url === 'string' && !/^https?:\/\/.+/.test(modelo_3d_url)) {
      return res.status(400).json({ ok: false, data: null, error: 'La URL del modelo 3D no es válida.' });
    }

    // Actualizar el producto en la base de datos
    const actualizado = await prisma.producto.update({
      where: { id },
      data: {
        // Solo actualizar los campos proporcionados
        nombre: nombre !== undefined ? nombre.trim() : undefined,
        descripcion: descripcion !== undefined ? descripcion.trim() : undefined,
        precio: precio !== undefined ? (typeof precio === 'string' ? parseFloat(precio) : precio) : undefined,
        categoria: categoria !== undefined ? categoria.trim() : undefined,
        imagen_url,
        modelo_3d_url,
        activo: typeof activo === 'boolean' ? activo : undefined,
        modificado_en: new Date(),
      },
    });

    return res.status(200).json({ ok: true, data: actualizado, error: null });
  } catch (error: any) {
    // Si el error es de validación de Prisma (por ejemplo, formato de ID incorrecto), responde 400
    if (error.code === 'P2023' || error.message?.includes('Invalid')) {
      return res.status(400).json({ ok: false, data: null, error: 'ID inválido (formato incorrecto).' });
    }
    // // console.error('Error al actualizar producto:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ ok: false, data: null, error: 'Ya existe un producto con ese nombre.' });
    }
    return res.status(500).json({ ok: false, data: null, error: 'Ocurrió un error al actualizar el producto.' });
  }
};

/**
 * Controlador para eliminar (soft delete) un producto.
 * Marca el producto como inactivo en lugar de eliminarlo físicamente.
 *
 * @param {Request} req - Objeto de solicitud Express con el ID del producto en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos del producto desactivado o mensaje de error
 */
export const eliminarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validación del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      return res.status(400).json({ ok: false, data: null, error: 'ID inválido.' });
    }

    // Verificar si el producto existe
    const producto = await prisma.producto.findUnique({ where: { id } });
    if (!producto) {
      return res.status(404).json({ ok: false, data: null, error: 'Producto no encontrado.' });
    }

    // Soft delete - marca el producto como inactivo
    const actualizado = await prisma.producto.update({
      where: { id },
      data: {
        activo: false,
        anulado_en: new Date(),
        anulado_por: (req as any).user?.id || null,
      },
    });

    return res.status(200).json({ ok: true, data: actualizado, error: null });
  } catch (error: any) {
    // Si el error es de validación de Prisma (por ejemplo, formato de ID incorrecto), responde 400
    if (error.code === 'P2023' || error.message?.includes('Invalid')) {
      return res.status(400).json({ ok: false, data: null, error: 'ID inválido (formato incorrecto).' });
    }
    // // console.error('Error al eliminar producto:', error);
    return res.status(500).json({ ok: false, data: null, error: 'Ocurrió un error al eliminar el producto.' });
  }
};
