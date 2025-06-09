import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { Request, Response } from 'express';

import type { ApiResponse, PaginatedResponse } from '@/types/response';
import type { AuditoriaParams } from '@/utils/audit';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      nombreCompleto: string;
      email: string;
      // Agrega otras propiedades del usuario según sea necesario
    } | null;
  }
}

// Definir la interfaz Producto basada en el modelo de Prisma
interface Producto {
  // Campos del modelo
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number; // Prisma manejará la conversión a Decimal
  categoria: string | null;
  imagen_url: string | null;
  modelo_3d_url: string | null;
  tipo_producto: string | null;
  tipo_lente: string | null;
  material_lente: string | null;
  tratamiento_lente: string | null;
  graduacion_esfera: number | null; // Prisma manejará la conversión a Decimal
  graduacion_cilindro: number | null; // Prisma manejará la conversión a Decimal
  eje: number | null;
  adicion: number | null; // Prisma manejará la conversión a Decimal
  tipo_armazon: string | null;
  material_armazon: string | null;
  tamano_puente: number | null;
  tamano_aros: number | null;
  tamano_varillas: number | null;
  activo: boolean | null;
  erp_id: number | null;
  erp_tipo: string | null;
  marca_id: string | null;
  color_id: string | null;
  creado_en: Date | null;
  creado_por: string | null;
  modificado_en: Date | null;
  modificado_por: string | null;
  anulado_en: Date | null;
  anulado_por: string | null;

  // Relaciones opcionales
  marca?: {
    id: string;
    nombre: string;
  } | null;

  color?: {
    id: string;
    nombre: string;
    codigo_hex: string | null;
  } | null;

  // Campos calculados
  _count?: {
    inventario?: number;
  };

  // Alias para compatibilidad con el frontend
  stock?: number;
}

// Tipo para el producto con relaciones
interface ProductoWithRelations extends Producto {
  marca?: MarcaRelacion;
  color?: ColorRelacion;
  _count?: {
    inventario?: number;
  };
  stock?: number; // Agregar stock a la interfaz
}

// Definir tipos para las relaciones
type MarcaRelacion = { id: string; nombre: string } | null;
type ColorRelacion = { id: string; nombre: string; codigo_hex: string | null } | null;

// La interfaz AuditoriaParams ya está definida arriba

// Función de auditoría dummy por defecto
const dummyAuditoria = async (params: AuditoriaParams): Promise<void> => {
  // Simplemente registra en la consola en modo desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT DUMMY]', params);
  }
};

/**
 * Función auxiliar para estandarizar las respuestas de la API
 */
function apiResponse<T = unknown>(
  ok: boolean,
  data: T | null = null,
  error: string | null = null,
  meta?: Record<string, unknown>
): ApiResponse<T> {
  return { ok, data, error, meta };
}

// Cargar dinámicamente la función de auditoría real
let registrarAuditoria: (params: AuditoriaParams) => Promise<void> = dummyAuditoria;

// Cargar la función de auditoría real si está disponible
(async () => {
  try {
    // Cargar la función de auditoría real si está disponible
    const { registrarAuditoria: realAuditoria } = await import('../utils/audit');
    registrarAuditoria = realAuditoria;
  } catch (error: unknown) {
    console.error('Error al cargar el módulo de auditoría:', error);
  }
})();

// Tipo para errores de Prisma
type PrismaError = Error & { code?: string; meta?: Record<string, unknown> };

// Tipos para el modelo de Producto
type ProductoBase = {
  nombre: string;
  descripcion?: string | null;
  precio: number;
  categoria?: string | null;
  imagen_url?: string | null;
  modelo_3d_url?: string | null;
  tipo_producto?: string | null;
  tipo_lente?: string | null;
  material_lente?: string | null;
  tratamiento_lente?: string | null;
  graduacion_esfera?: number | null;
  graduacion_cilindro?: number | null;
  eje?: number | null;
  adicion?: number | null;
  tipo_armazon?: string | null;
  material_armazon?: string | null;
  tamano_puente?: number | null;
  tamano_aros?: number | null;
  tamano_varillas?: number | null;
  activo?: boolean | null;
  erp_id?: number | null;
  erp_tipo?: string | null;
  marca_id?: string | null;
  color_id?: string | null;
};

type ProductoCreateInput = Omit<ProductoBase, 'activo'> & {
  activo?: boolean;
};

type ProductoUpdateInput = Partial<ProductoCreateInput>;

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
export const crearProducto = async (req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    // Validar y normalizar los datos de entrada
    const validacion = validateProductoInput(req.body);
    if ('error' in validacion) {
      return res.status(400).json(apiResponse(false, null, validacion.error));
    }

    const productoData = validacion;

    // Verificar si ya existe un producto con el mismo nombre
    const productoExistente = await prisma.producto.findFirst({
      where: { nombre: productoData.nombre },
    });

    if (productoExistente) {
      return res
        .status(409)
        .json(apiResponse(false, null, 'Ya existe un producto con ese nombre.'));
    }

    // Crear el producto en la base de datos
    const nuevoProducto = await prisma.producto.create({
      data: {
        ...productoData,
        activo: productoData.activo ?? true, // Valor por defecto: true
      },
    });

    // Registrar auditoría
    await registrarAuditoria({
      usuarioId: req.user?.id || null,
      accion: 'crear_producto',
      entidadTipo: 'producto',
      entidadId: nuevoProducto.id,
      descripcion: `Producto creado: ${nuevoProducto.nombre}`,
      ip: req.ip,
      modulo: 'productos',
    });

    return res.status(201).json(apiResponse(true, nuevoProducto));
  } catch (error) {
    console.error('Error al crear el producto:', error);

    // Manejar errores específicos de Prisma
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2002') {
      return res
        .status(409)
        .json(apiResponse(false, null, 'Ya existe un producto con ese nombre o identificador.'));
    }

    if (prismaError.code === 'P2003') {
      return res
        .status(400)
        .json(apiResponse(false, null, 'Referencia inválida (marca_id o color_id no existen).'));
    }

    // Registrar error en auditoría
    await registrarAuditoria({
      usuarioId: req.user?.id || null,
      accion: 'error_crear_producto',
      entidadTipo: 'producto',
      descripcion: `Error al crear producto: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      ip: req.ip,
      modulo: 'productos',
    });

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          'Ocurrió un error al crear el producto. Por favor, intente nuevamente.'
        )
      );
  }
};

/**
 * Función auxiliar para normalizar parámetros de consulta.
 *
 * @param {unknown} param - El parámetro a normalizar
 * @param {T} fallback - Valor por defecto si el parámetro no existe
 * @returns {T} - El valor normalizado
 */
function normalizeParam<T = string>(param: unknown, fallback: T): T {
  if (Array.isArray(param)) {
    return (param[0] as T) ?? fallback;
  }
  return (param as T) ?? fallback;
}

/**
 * Función auxiliar para normalizar parámetros booleanos de consulta.
 *
 * @param {unknown} param - El parámetro a normalizar
 * @returns {boolean|undefined} - El valor booleano normalizado o undefined
 */
function normalizeBooleanParam(param: unknown): boolean | undefined {
  const value = Array.isArray(param) ? param[0] : param;

  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

/**
 * Valida y normaliza los datos de entrada para la creación/actualización de un producto.
 *
 * @param {unknown} data - Datos del producto a validar
 * @returns {ProductoCreateInput | { error: string }} - Datos validados o mensaje de error
 */
function validateProductoInput(data: unknown): ProductoCreateInput | { error: string } {
  if (typeof data !== 'object' || data === null) {
    return { error: 'Los datos del producto son inválidos' };
  }

  const input = data as Record<string, unknown>;
  const result: Partial<ProductoCreateInput> = {};

  // Validar nombre (campo requerido)
  if (!input.nombre || typeof input.nombre !== 'string' || input.nombre.trim().length < 2) {
    return { error: 'El nombre es obligatorio y debe tener al menos 2 caracteres' };
  }
  result.nombre = input.nombre.trim();

  // Validar precio (campo requerido)
  if (input.precio === undefined || input.precio === null || input.precio === '') {
    return { error: 'El precio es obligatorio' };
  }

  const precioNum =
    typeof input.precio === 'string' ? parseFloat(input.precio) : Number(input.precio);

  if (isNaN(precioNum) || precioNum <= 0) {
    return { error: 'El precio debe ser un número mayor a 0' };
  }
  result.precio = precioNum;

  // Campos opcionales con validación
  if (input.descripcion !== undefined) {
    result.descripcion = input.descripcion ? String(input.descripcion).trim() : null;
  }

  if (input.categoria !== undefined) {
    result.categoria = input.categoria ? String(input.categoria).trim() : null;
  }

  // Validar URLs
  const validateUrl = (url: unknown): string | null => {
    if (!url) return null;
    const urlStr = String(url);
    return /^https?:\/\//.test(urlStr) ? urlStr : null;
  };

  result.imagen_url = validateUrl(input.imagen_url);
  result.modelo_3d_url = validateUrl(input.modelo_3d_url);

  // Validar campos numéricos opcionales
  const numericFields = [
    'graduacion_esfera',
    'graduacion_cilindro',
    'eje',
    'adicion',
    'tamano_puente',
    'tamano_aros',
    'tamano_varillas',
  ] as const;

  for (const field of numericFields) {
    if (input[field] !== undefined && input[field] !== null && input[field] !== '') {
      const num = Number(input[field]);
      result[field] = isNaN(num) ? null : num;
    }
  }

  // Validar campos de texto opcionales
  const textFields = [
    'tipo_producto',
    'tipo_lente',
    'material_lente',
    'tratamiento_lente',
    'tipo_armazon',
    'material_armazon',
    'erp_tipo',
  ] as const;

  for (const field of textFields) {
    if (input[field] !== undefined) {
      result[field] = input[field] ? String(input[field]).trim() : null;
    }
  }

  // Validar campos de ID
  const idFields = ['marca_id', 'color_id'] as const;
  for (const field of idFields) {
    if (input[field] !== undefined) {
      result[field] = input[field] ? String(input[field]) : null;
    }
  }

  // Validar campos booleanos
  if (input.activo !== undefined) {
    result.activo = Boolean(input.activo);
  }

  return result as ProductoCreateInput;
}

// Tipos para los parámetros de consulta de listarProductos
type ListarProductosQueryParams = {
  page?: string | string[];
  limit?: string | string[];
  q?: string | string[];
  categoria?: string | string[];
  soloActivos?: string | string[] | boolean;
  marca_id?: string | string[];
  color_id?: string | string[];
  ordenarPor?: 'nombre' | 'precio' | 'categoria' | 'creado_en' | 'actualizado_en';
  orden?: 'asc' | 'desc';
};

/**
 * Controlador para listar productos con filtros y paginación.
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista paginada de productos o mensaje de error
 */
export const listarProductos = async (
  req: Request<{}, {}, {}, ListarProductosQueryParams>,
  res: Response<PaginatedResponse<ProductoWithRelations>>
) => {
  try {
    // Normalizar y validar parámetros de consulta
    const page = Math.max(1, Number(normalizeParam(req.query.page, '1')) || 1);
    const limit = Math.min(100, Math.max(1, Number(normalizeParam(req.query.limit, '20')) || 20));
    const searchTerm = normalizeParam(req.query.q, '');
    const categoria = normalizeParam(req.query.categoria, undefined);
    const marcaId = normalizeParam(req.query.marca_id, undefined);
    const colorId = normalizeParam(req.query.color_id, undefined);
    const soloActivos = normalizeBooleanParam(req.query.soloActivos);

    // Ordenación
    const ordenarPor = normalizeParam(req.query.ordenarPor, 'nombre') as
      | 'nombre'
      | 'precio'
      | 'categoria'
      | 'creado_en'
      | 'actualizado_en';
    const orden = normalizeParam(req.query.orden, 'asc') as 'asc' | 'desc';

    // Definir el tipo para el objeto where
    const where: {
      activo?: boolean;
      marca_id?: string;
      color_id?: string;
      categoria?:
        | { equals: string; mode: 'insensitive' }
        | { contains: string; mode: 'insensitive' };
      OR?: Array<{
        nombre?: { contains: string; mode: 'insensitive' };
        descripcion?: { contains: string; mode: 'insensitive' };
        categoria?: { contains: string; mode: 'insensitive' };
      }>;
      marcaId?: string;
      colorId?: string;
      creado_en?: { gte?: Date; lte?: Date };
    } = {};

    // Filtro por estado activo/inactivo
    if (soloActivos !== undefined) {
      where.activo = soloActivos;
    }

    // Filtros por ID de relaciones
    if (marcaId) where.marca_id = marcaId;
    if (colorId) where.color_id = colorId;

    // Filtro por categoría
    if (categoria) {
      where.categoria = { equals: categoria, mode: 'insensitive' };
    }

    // Búsqueda por término
    if (searchTerm) {
      where.OR = [
        { nombre: { contains: searchTerm, mode: 'insensitive' } },
        { descripcion: { contains: searchTerm, mode: 'insensitive' } },
        { categoria: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Consulta principal de productos con stock calculado
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          marca: {
            select: { id: true, nombre: true },
          },
          color: {
            select: { id: true, nombre: true, codigoHex: true },
          },
          _count: {
            select: { inventarios: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [ordenarPor]: orden },
      }),
      prisma.producto.count({ where }),
    ]);

    // Registrar auditoría de la consulta
    const auditoriaParams: AuditoriaParams = {
      usuarioId: req.user?.id || null, // Asumiendo que el usuario está en req.user
      accion: 'listar_productos',
      modulo: 'productos',
      descripcion: `Consulta de listado de productos (página ${page}, ${limit} por página)`,
      ip: req.ip,
      datosAdicionales: {
        page,
        limit,
        searchTerm,
        categoria,
        marcaId,
        colorId,
        soloActivos,
        totalResultados: total,
      },
    };
    await registrarAuditoria(auditoriaParams);

    // Mapear los resultados para incluir el stock calculado
    const productosConStock = productos.map((producto) => ({
      ...producto,
      stock: producto._count?.inventarios || 0,
    }));

    // Construir respuesta con tipos seguros
    const response: PaginatedResponse<ProductoWithRelations> = {
      ok: true,
      data: productosConStock as unknown as ProductoWithRelations[],
      error: null,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error al listar productos:', error);

    // Registrar error en auditoría
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorParams: AuditoriaParams = {
      usuarioId: req.user?.id || null, // Asumiendo que el usuario está en req.user
      accion: 'error_listar_productos',
      modulo: 'productos',
      descripcion: `Error al listar productos: ${errorMessage}`,
      ip: req.ip,
      datosAdicionales: {
        error: errorMessage,
      },
    };
    await registrarAuditoria(errorParams);

    // Para el caso de error, devolvemos un objeto compatible con PaginatedResponse
    return res.status(500).json({
      ok: false,
      data: [],
      error: 'Ocurrió un error al listar los productos. Por favor, intente nuevamente.',
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
    } as PaginatedResponse<ProductoWithRelations>);
  }
};

/**
 * Controlador para obtener un producto por su ID.
 *
 * @param {Request} req - Objeto de solicitud Express con el ID del producto en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos del producto o mensaje de error
 */
export const actualizarProducto = async (
  req: Request<{ id: string }, {}, ProductoUpdateInput>,
  res: Response<ApiResponse<ProductoWithRelations>>
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validación del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      return res.status(400).json(apiResponse(false, null, 'ID de producto inválido.'));
    }

    // Validar datos de entrada
    const validacion = validateProductoInput(updateData);
    if ('error' in validacion) {
      return res.status(400).json(apiResponse(false, null, validacion.error));
    }

    // Verificar si el producto existe
    const producto = (await prisma.producto.findUnique({
      where: { id },
      include: {
        _count: {
          select: { inventarios: true },
        },
      },
    })) as (typeof producto & { _count?: { inventarios?: number } }) | null;

    if (!producto) {
      return res.status(404).json(apiResponse(false, null, 'Producto no encontrado.'));
    }

    // Actualizar el producto
    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: {
        ...validacion,
        modificadoEn: new Date(),
        modificadoPor: req.user?.id || null,
      },
      include: {
        marca: {
          select: { id: true, nombre: true },
        },
        color: {
          select: { id: true, nombre: true, codigoHex: true },
        },
        _count: {
          select: { inventarios: true },
        },
      },
    });

    // Agregar el stock calculado al producto
    const productoConStock = {
      ...productoActualizado,
      stock: productoActualizado._count?.inventarios || 0,
    };

    // Registrar la acción de auditoría
    try {
      await registrarAuditoria({
        usuarioId: req.user?.id || null,
        accion: 'ACTUALIZAR',
        entidadTipo: 'producto',
        entidadId: id,
        descripcion: `Producto actualizado: ${productoActualizado.nombre}`,
        modulo: 'productos',
        ip: req.ip,
        datosAdicionales: {
          id: productoActualizado.id,
          nombre: productoActualizado.nombre,
          cambios: Object.keys(validacion),
          realizadoPor: req.user?.id || 'sistema',
        },
      });
    } catch (auditError) {
      console.error('Error al registrar auditoría:', auditError);
      // No fallar la operación principal si falla la auditoría
    }

    return res.status(200).json({
      ok: true,
      data: productoConStock as unknown as ProductoWithRelations,
      error: null,
    });
  } catch (error: unknown) {
    // Manejar errores específicos de Prisma
    const prismaError = error as { code?: string; message?: string };

    if (prismaError.code === 'P2023' || prismaError.message?.includes('Invalid')) {
      return res
        .status(400)
        .json(apiResponse(false, null, 'ID de producto inválido (formato incorrecto).'));
    }

    if (prismaError.code === 'P2002') {
      return res
        .status(409)
        .json(apiResponse(false, null, 'Ya existe un producto con ese nombre o identificador.'));
    }

    console.error('Error al actualizar producto:', error);
    return res
      .status(500)
      .json(apiResponse(false, null, 'Ocurrió un error al actualizar el producto.'));
  }
};

export const obtenerProductoPorId = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ProductoWithRelations>>
) => {
  try {
    const { id } = req.params;

    // Validación del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      return res.status(400).json(apiResponse(false, null, 'ID de producto inválido.'));
    }

    // Buscar el producto en la base de datos con relaciones
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        marca: {
          select: { id: true, nombre: true },
        },
        color: {
          select: { id: true, nombre: true, codigoHex: true },
        },
        _count: {
          select: { inventarios: true },
        },
      },
    });

    // Verificar si el producto existe
    if (!producto) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Producto no encontrado.',
      });
    }

    // Agregar el stock calculado al producto
    const productoConStock = {
      ...producto,
      stock:
        (
          producto as unknown as {
            _count?: { inventario?: number };
          }
        )._count?.inventario || 0,
    };

    // Convertir Decimal a number para campos numéricos
    const responseData = {
      ...productoConStock,
      precio:
        productoConStock.precio instanceof Decimal
          ? productoConStock.precio.toNumber()
          : productoConStock.precio,
      graduacionEsfera:
        productoConStock.graduacionEsfera instanceof Decimal
          ? productoConStock.graduacionEsfera.toNumber()
          : productoConStock.graduacionEsfera,
      graduacionCilindro:
        productoConStock.graduacionCilindro instanceof Decimal
          ? productoConStock.graduacionCilindro.toNumber()
          : productoConStock.graduacionCilindro,
      adicion:
        productoConStock.adicion && productoConStock.adicion instanceof Decimal
          ? productoConStock.adicion.toNumber()
          : productoConStock.adicion,
      stock: productoConStock._count?.inventarios || 0,
    };

    return res.status(200).json({
      ok: true,
      data: responseData as unknown as ProductoWithRelations,
      error: null,
    });
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    // Si el error es de validación de Prisma (por ejemplo, formato de ID incorrecto), responde 400
    if (err.code === 'P2023' || err.message?.includes('Invalid')) {
      return res
        .status(400)
        .json({ ok: false, data: null, error: 'ID inválido (formato incorrecto).' });
    }
    // // console.error('Error al obtener producto por ID:', error);
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener el producto.',
      meta: undefined,
    });
  }
};

/**
 * Controlador para actualizar un producto existente.
          .status(400)
          .json({ ok: false, data: null, error: 'El precio debe ser un número mayor a 0.' });
      }
    }

    if (imagen_url && typeof imagen_url === 'string' && !/^https?:\/\/.+/.test(imagen_url)) {
      return res
        .status(400)
        .json({ ok: false, data: null, error: 'La URL de la imagen no es válida.' });
    }

    if (
      modelo_3d_url &&
      typeof modelo_3d_url === 'string' &&
      !/^https?:\/\/.+/.test(modelo_3d_url)
    ) {
      return res
        .status(400)
        .json({ ok: false, data: null, error: 'La URL del modelo 3D no es válida.' });
    }

    // Actualizar el producto en la base de datos
    const actualizado = await prisma.producto.update({
      where: { id },
      data: {
        // Solo actualizar los campos proporcionados
        nombre: nombre !== undefined ? nombre.trim() : undefined,
        descripcion: descripcion !== undefined ? descripcion.trim() : undefined,
        precio:
          precio !== undefined
            ? typeof precio === 'string'
              ? parseFloat(precio)
              : precio
            : undefined,
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
      return res
        .status(400)
        .json({ ok: false, data: null, error: 'ID inválido (formato incorrecto).' });
    }
    // // console.error('Error al actualizar producto:', error);
    if (error.code === 'P2002') {
      return res
        .status(409)
        .json({ ok: false, data: null, error: 'Ya existe un producto con ese nombre.' });
    }
    return res
      .status(500)
      .json({ ok: false, data: null, error: 'Ocurrió un error al actualizar el producto.' });
  }
};

/**
 * Controlador para eliminar (soft delete) un producto por su ID.
 * Marca el producto como inactivo en lugar de eliminarlo físicamente.
 *
 * @param {Request} req - Objeto de solicitud Express con el ID del producto en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Producto desactivado o mensaje de error
 */
export const eliminarProducto = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ProductoWithRelations>>
) => {
  try {
    const { id } = req.params;

    // Validación del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      return res.status(400).json(apiResponse(false, null, 'ID de producto inválido.'));
    }

    // Verificar si el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        marca: {
          select: { id: true, nombre: true },
        },
        color: {
          select: { id: true, nombre: true, codigoHex: true },
        },
        _count: {
          select: { inventarios: true },
        },
      },
    });

    if (!producto) {
      return res.status(404).json(apiResponse(false, null, 'Producto no encontrado.'));
    }

    // Verificar si el producto ya está desactivado
    if (producto.activo === false) {
      return res.status(400).json(apiResponse(false, null, 'El producto ya está desactivado.'));
    }

    // Soft delete - marca el producto como inactivo
    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: {
        activo: false,
        anuladoEn: new Date(),
        anuladoPor: req.user?.id || null,
      },
      include: {
        marca: {
          select: { id: true, nombre: true },
        },
        color: {
          select: { id: true, nombre: true, codigoHex: true },
        },
        _count: {
          select: { inventarios: true },
        },
      },
    });

    // Agregar el stock calculado al producto
    const productoConStock = {
      ...productoActualizado,
      stock: productoActualizado._count?.inventarios || 0,
    };

    // Registrar la acción de auditoría
    try {
      await registrarAuditoria({
        usuarioId: req.user?.id || null,
        accion: 'ELIMINAR',
        entidadTipo: 'producto',
        entidadId: id,
        descripcion: `Producto desactivado: ${producto.nombre}`,
        modulo: 'productos',
        ip: req.ip,
        datosAdicionales: {
          id: producto.id,
          nombre: producto.nombre,
          realizadoPor: req.user?.id || 'sistema',
        },
      });
    } catch (auditError) {
      console.error('Error al registrar auditoría:', auditError);
      // No fallar la operación principal si falla la auditoría
    }

    // Respuesta exitosa usando apiResponse
    return res
      .status(200)
      .json(apiResponse(true, productoConStock as unknown as ProductoWithRelations));
  } catch (error: unknown) {
    // Manejar errores específicos de Prisma
    const prismaError = error as { code?: string; message?: string };

    if (prismaError.code === 'P2023' || prismaError.message?.includes('Invalid')) {
      return res
        .status(400)
        .json(apiResponse(false, null, 'ID de producto inválido (formato incorrecto).'));
    }

    // Registrar error en consola
    console.error('Error al eliminar producto:', error);

    return res
      .status(500)
      .json(apiResponse(false, null, 'Ocurrió un error al eliminar el producto.'));
  }
};
