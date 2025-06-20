import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { Request, Response } from 'express';

import type { ApiResponse, PaginatedResponse } from '@/types/response';

import { logSuccess, logError } from '../utils/audit';
import { validarCamposNumericosProducto } from '../utils/validacionesNumericas';
import { validarImagenUrl, validarModelo3dUrl } from '../utils/validacions';

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

// Definir la interfaz Producto basada en el modelo de Prisma actualizado
interface Producto {
  // Campos del modelo
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number; // Prisma manejará la conversión a Decimal
  categoriaId: string | null;
  categoria?: any; // Relación con el modelo Categoria
  imagenUrl: string | null;
  modelo3dUrl: string | null;
  materialLente: string | null;
  tratamientoLente: string | null;
  graduacionEsfera: number | null; // Prisma manejará la conversión a Decimal
  graduacionCilindro: number | null; // Prisma manejará la conversión a Decimal
  eje: number | null;
  adicion: number | null; // Prisma manejará la conversión a Decimal
  tipoArmazon: string | null;
  materialArmazon: string | null;
  tamanoPuente: number | null;
  tamanoAros: number | null;
  tamanoVarillas: number | null;
  activo: boolean | null;
  erpId: number | null;
  erpTipo: string | null;
  marcaId: string | null;
  colorId: string | null;
  creadoEn: Date | null;
  creadoPor: string | null;
  modificadoEn: Date | null;
  modificadoPor: string | null;
  anuladoEn: Date | null;
  anuladoPor: string | null;

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

// Tipos para las relaciones

/**
 * Tipos para las relaciones de producto con otros modelos en operaciones de creación/actualización
 */
type ProductoRelaciones = {
  categoria?: { connect: { id: string } };
  marca?: { connect: { id: string } };
  color?: { connect: { id: string } };
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

// Tipo para errores de Prisma
type PrismaError = Error & { code?: string; meta?: Record<string, unknown> };

// Interfaz para los datos de entrada al crear o actualizar un producto
interface ProductoInput {
  nombre: string;
  descripcion?: string;
  precio: number;
  categoriaId?: string;
  marcaId?: string;
  colorId?: string;
  materialLente?: string | null;
  tratamientoLente?: string | null;
  graduacionEsfera?: number | null;
  graduacionCilindro?: number | null;
  eje?: number | null;
  adicion?: number | null;
  tipoArmazon?: string | null;
  materialArmazon?: string | null;
  tamanoPuente?: number | null;
  tamanoAros?: number | null;
  tamanoVarillas?: number | null;
  activo?: boolean | null;
  erpId?: number | null;
  erpTipo?: string | null;
  imagenUrl?: string | null;
  modelo3dUrl?: string | null;
}

// Tipo para el producto con datos de entrada
type ProductoCreateInput = Omit<ProductoInput, 'activo'> & {
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

    // Validar campos numéricos
    const errorNumerico = validarCamposNumericosProducto(req.body);
    if (errorNumerico) {
      await logError({
        userId: req.user?.id,
        ip: req.ip,
        entityType: 'producto',
        module: 'crearProducto',
        action: 'error_crear_producto',
        message: 'Error de validación en campos numéricos',
        error: new Error(errorNumerico),
        context: { campos: req.body },
      });
      return res.status(400).json(apiResponse(false, null, errorNumerico));
    }

    // Validar URLs de imagen y modelo 3D si se proporcionan
    if (req.body.imagenUrl) {
      const errorImagen = validarImagenUrl(req.body.imagenUrl);
      if (errorImagen) {
        await logError({
          userId: req.user?.id,
          ip: req.ip,
          entityType: 'producto',
          module: 'crearProducto',
          action: 'error_crear_producto',
          message: 'La URL de la imagen no es válida',
          error: new Error(errorImagen),
          context: { imagenUrl: req.body.imagenUrl },
        });
        return res.status(400).json(apiResponse(false, null, errorImagen));
      }
    }

    if (req.body.modelo3dUrl) {
      const errorModelo = validarModelo3dUrl(req.body.modelo3dUrl);
      if (errorModelo) {
        await logError({
          userId: req.user?.id,
          ip: req.ip,
          entityType: 'producto',
          module: 'crearProducto',
          action: 'error_crear_producto',
          message: 'La URL del modelo 3D no es válida',
          error: new Error(errorModelo),
          context: { modelo3dUrl: req.body.modelo3dUrl },
        });
        return res.status(400).json(apiResponse(false, null, errorModelo));
      }
    }

    if ('error' in validacion) {
      await logError({
        userId: req.user?.id,
        ip: req.ip,
        entityType: 'producto',
        module: 'crearProducto',
        action: 'error_crear_producto',
        message: 'Los datos del producto son inválidos',
        error: new Error('Los datos del producto son inválidos. 400'),
        context: {
          datosSolicitud: req.body,
          error: validacion.error,
        },
      });
      return res.status(400).json(apiResponse(false, null, validacion.error));
    }

    const productoData = validacion;

    // Verificar si ya existe un producto con el mismo nombre
    const productoExistente = await prisma.producto.findFirst({
      where: { nombre: productoData.nombre },
    });

    if (productoExistente) {
      await logError({
        userId: req.user?.id,
        ip: req.ip,
        entityType: 'producto',
        module: 'crearProducto',
        action: 'error_crear_producto',
        message: 'Ya existe un producto con ese nombre',
        error: new Error('Ya existe un producto con ese nombre. 409'),
        context: { nombre: productoData.nombre },
      });
      return res
        .status(409)
        .json(apiResponse(false, null, 'Ya existe un producto con ese nombre.'));
    }

    // Validar existencia de relaciones (categoría, marca, color) en lote
    try {
      // Preparar consultas de validación para todas las relaciones
      const validacionPromises = [];
      const relacionesParaValidar = [];

      if (productoData.categoriaId) {
        validacionPromises.push(
          prisma.categoria.findUnique({
            where: { id: productoData.categoriaId },
          })
        );
        relacionesParaValidar.push('categoria');
      }

      if (productoData.marcaId) {
        validacionPromises.push(
          prisma.marca.findUnique({
            where: { id: productoData.marcaId },
          })
        );
        relacionesParaValidar.push('marca');
      }

      if (productoData.colorId) {
        validacionPromises.push(
          prisma.color.findUnique({
            where: { id: productoData.colorId },
          })
        );
        relacionesParaValidar.push('color');
      }

      // Si hay relaciones para validar, ejecutar todas las consultas en paralelo
      if (validacionPromises.length > 0) {
        const resultados = await Promise.all(validacionPromises);

        // Verificar resultados de cada relación
        for (let i = 0; i < resultados.length; i++) {
          const resultado = resultados[i];
          const tipoRelacion = relacionesParaValidar[i];
          let idRelacion;

          switch (tipoRelacion) {
            case 'categoria':
              idRelacion = productoData.categoriaId;

              // Validar que la categoría existe
              if (!resultado) {
                await logError({
                  userId: req.user?.id,
                  ip: req.ip,
                  entityType: 'producto',
                  module: 'crearProducto',
                  action: 'error_crear_producto',
                  message: `La categoría con ID ${idRelacion} no existe`,
                  error: new Error(`La categoría con ID ${idRelacion} no existe. 400`),
                  context: { categoriaId: idRelacion },
                });
                return res
                  .status(400)
                  .json(apiResponse(false, null, `La categoría con ID ${idRelacion} no existe.`));
              }

              // Validar que la categoría esté activa
              if (resultado.anuladoEn) {
                await logError({
                  userId: req.user?.id,
                  ip: req.ip,
                  entityType: 'producto',
                  module: 'crearProducto',
                  action: 'error_crear_producto',
                  message: `La categoría con ID ${idRelacion} está inactiva`,
                  error: new Error(`La categoría con ID ${idRelacion} está inactiva. 400`),
                  context: {
                    categoriaId: idRelacion,
                    nombreCategoria: resultado.nombre,
                    anuladoEn: resultado.anuladoEn,
                  },
                });
                return res
                  .status(400)
                  .json(
                    apiResponse(false, null, `La categoría con ID ${idRelacion} está inactiva.`)
                  );
              }
              break;

            case 'marca':
              idRelacion = productoData.marcaId;

              // Validar que la marca existe
              if (!resultado) {
                await logError({
                  userId: req.user?.id,
                  ip: req.ip,
                  entityType: 'producto',
                  module: 'crearProducto',
                  action: 'error_crear_producto',
                  message: `La marca con ID ${idRelacion} no existe`,
                  error: new Error(`La marca con ID ${idRelacion} no existe. 400`),
                  context: { marcaId: idRelacion },
                });
                return res
                  .status(400)
                  .json(apiResponse(false, null, `La marca con ID ${idRelacion} no existe.`));
              }
              break;

            case 'color':
              idRelacion = productoData.colorId;

              // Validar que el color existe
              if (!resultado) {
                await logError({
                  userId: req.user?.id,
                  ip: req.ip,
                  entityType: 'producto',
                  module: 'crearProducto',
                  action: 'error_crear_producto',
                  message: `El color con ID ${idRelacion} no existe`,
                  error: new Error(`El color con ID ${idRelacion} no existe. 400`),
                  context: { colorId: idRelacion },
                });
                return res
                  .status(400)
                  .json(apiResponse(false, null, `El color con ID ${idRelacion} no existe.`));
              }
              break;
          }
        }
      }
    } catch (error) {
      await logError({
        userId: req.user?.id,
        ip: req.ip,
        entityType: 'producto',
        module: 'crearProducto',
        action: 'error_crear_producto',
        message: 'Error al validar relaciones de producto',
        error,
        context: {
          categoriaId: productoData.categoriaId,
          marcaId: productoData.marcaId,
          colorId: productoData.colorId,
        },
      });
      return res
        .status(500)
        .json(apiResponse(false, null, 'Error al validar relaciones de producto.'));
    }

    // Crear objeto de datos para Prisma usando los tipos correctos
    // Primero crear datos básicos sin relaciones
    const baseData: Omit<Prisma.ProductoCreateInput, 'categoria' | 'marca' | 'color'> = {
      nombre: productoData.nombre,
      descripcion: productoData.descripcion || null,
      precio: productoData.precio,
      imagenUrl: productoData.imagenUrl || null,
      modelo3dUrl: productoData.modelo3dUrl || null,
      materialLente: productoData.materialLente || null,
      tratamientoLente: productoData.tratamientoLente || null,
      graduacionEsfera: productoData.graduacionEsfera || null,
      graduacionCilindro: productoData.graduacionCilindro || null,
      eje: productoData.eje || null,
      adicion: productoData.adicion || null,
      tipoArmazon: productoData.tipoArmazon || null,
      materialArmazon: productoData.materialArmazon || null,
      tamanoPuente: productoData.tamanoPuente || null,
      tamanoAros: productoData.tamanoAros || null,
      tamanoVarillas: productoData.tamanoVarillas || null,
      activo: productoData.activo ?? true,
    };

    // Crear relaciones según lo requerido por Prisma
    const relations: ProductoRelaciones = {};
    if (productoData.categoriaId) {
      relations.categoria = { connect: { id: productoData.categoriaId } };
    }
    if (productoData.marcaId) {
      relations.marca = { connect: { id: productoData.marcaId } };
    }
    if (productoData.colorId) {
      relations.color = { connect: { id: productoData.colorId } };
    }

    // Combinar todo en un objeto con tipado seguro
    const productoCreateData: Prisma.ProductoCreateInput = {
      ...baseData,
      ...relations,
    };

    // Crear el producto en la base de datos
    const nuevoProducto = await prisma.producto.create({
      data: productoCreateData,
      include: {
        marca: true,
        color: true,
        inventarios: true,
        _count: {
          select: { inventarios: true },
        },
      },
    });

    // Registrar auditoría de éxito
    await logSuccess({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'producto',
      entityId: nuevoProducto.id,
      module: 'crearProducto',
      action: 'crear_producto_exitoso',
      message: `Producto creado: ${nuevoProducto.nombre}`,
      details: {
        nombre: nuevoProducto.nombre,
        precio: nuevoProducto.precio,
        marcaId: nuevoProducto.marcaId,
        colorId: nuevoProducto.colorId,
        activo: nuevoProducto.activo,
      },
    });

    return res.status(201).json(apiResponse(true, nuevoProducto));
  } catch (error) {
    console.error('Error al crear el producto:', error);

    // Manejar errores específicos de Prisma
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2002') {
      await logError({
        userId: req.user?.id,
        ip: req.ip,
        entityType: 'producto',
        module: 'crearProducto',
        action: 'error_crear_producto',
        message: 'Ya existe un producto con ese nombre o identificador',
        error: new Error('Ya existe un producto con ese nombre o identificador. 409'),
        context: {
          nombre: req.body.nombre,
          marcaId: req.body.marcaId,
          colorId: req.body.colorId,
          activo: req.body.activo,
        },
      });
      return res
        .status(409)
        .json(apiResponse(false, null, 'Ya existe un producto con ese nombre o identificador.'));
    }

    if (prismaError.code === 'P2003') {
      await logError({
        userId: req.user?.id,
        ip: req.ip,
        entityType: 'producto',
        module: 'crearProducto',
        action: 'error_crear_producto',
        message: 'Referencia inválida (marca_id o color_id no existen)',
        error: new Error('Referencia inválida (marca_id o color_id no existen). 400'),
        context: {
          nombre: req.body.nombre,
          marcaId: req.body.marcaId,
          colorId: req.body.colorId,
          activo: req.body.activo,
        },
      });
      return res
        .status(400)
        .json(apiResponse(false, null, 'Referencia inválida (marca_id o color_id no existen).'));
    }

    // Registrar error en auditoría
    await logError({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'producto',
      module: 'crearProducto',
      action: 'error_crear_producto',
      message: 'Error al crear producto',
      error,
      context: {
        datosSolicitud: req.body,
      },
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
function validateProductoInput(data: unknown): ProductoInput | { error: string } {
  if (typeof data !== 'object' || data === null) {
    return { error: 'Los datos del producto son inválidos' };
  }

  const input = data as Record<string, unknown>;
  const result: Partial<ProductoInput> = {};

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

  // Actualizado para usar categoriaId en lugar de categoria
  if (input.categoriaId !== undefined) {
    result.categoriaId = input.categoriaId ? String(input.categoriaId).trim() : null;
  }

  // Validar URLs
  const validateUrl = (url: unknown): string | null => {
    if (!url) return null;
    const urlStr = String(url);
    return /^https?:\/\//.test(urlStr) ? urlStr : null;
  };

  result.imagenUrl = validateUrl(input.imagenUrl);
  result.modelo3dUrl = validateUrl(input.modelo3dUrl);

  // Validar campos numéricos opcionales
  const numericFields = [
    'graduacionEsfera',
    'graduacionCilindro',
    'eje',
    'adicion',
    'tamanoPuente',
    'tamanoAros',
    'tamanoVarillas',
  ] as const;

  for (const field of numericFields) {
    if (input[field] !== undefined && input[field] !== null && input[field] !== '') {
      const num = Number(input[field]);
      result[field] = isNaN(num) ? null : num;
    }
  }

  // Validar campos de texto opcionales
  const textFields = [
    'tipoProducto',
    'tipoLente',
    'materialLente',
    'tratamientoLente',
    'tipoArmazon',
    'materialArmazon',
    'erpTipo',
  ] as const;

  for (const field of textFields) {
    if (input[field] !== undefined) {
      result[field] = input[field] ? String(input[field]).trim() : null;
    }
  }

  // Validar campos de ID
  const idFields = ['marcaId', 'colorId'] as const;
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
  marcaId?: string | string[];
  colorId?: string | string[];
  ordenarPor?: 'nombre' | 'precio' | 'categoria' | 'creadoEn' | 'actualizadoEn';
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
  // Declarar variables fuera del try para que estén disponibles en el catch
  let page = 1;
  let limit = 20;
  let searchTerm = '';
  let categoria: string | undefined;
  let marcaId: string | undefined;
  let colorId: string | undefined;
  let soloActivos: boolean | undefined;

  try {
    // Normalizar y validar parámetros de consulta
    page = Math.max(1, Number(normalizeParam(req.query.page, '1')) || 1);
    limit = Math.min(100, Math.max(1, Number(normalizeParam(req.query.limit, '20')) || 20));
    searchTerm = normalizeParam(req.query.q, '');
    categoria = normalizeParam(req.query.categoria, undefined);
    marcaId = normalizeParam(req.query.marcaId, undefined);
    colorId = normalizeParam(req.query.colorId, undefined);
    soloActivos = normalizeBooleanParam(req.query.soloActivos);

    // Ordenación
    const ordenarPor = normalizeParam(req.query.ordenarPor, 'nombre') as
      | 'nombre'
      | 'precio'
      | 'categoria'
      | 'creadoEn'
      | 'actualizadoEn';
    const orden = normalizeParam(req.query.orden, 'asc') as 'asc' | 'desc';

    // Definir el tipo para el objeto where utilizando tipos de Prisma
    let where: Prisma.ProductoWhereInput = {};

    // Aplicar filtros
    if (soloActivos !== undefined) {
      where.activo = soloActivos;
    }

    if (marcaId) {
      where.marcaId = marcaId;
    }

    if (colorId) {
      where.colorId = colorId;
    }

    // Filtrar por categoría
    if (categoria) {
      // Si parece un UUID, buscar por categoriaId exacto
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoria)) {
        // Usamos el campo directo, type casting para evitar error de TS
        (where as any).categoriaId = categoria;
      } else {
        // Usamos una sintaxis diferente para la búsqueda por nombre de categoría
        // Usamos casting para manejar el tipo correctamente
        const categoryFilter = {
          nombre: {
            contains: categoria,
            mode: 'insensitive',
          },
        };

        // Asignamos el filtro utilizando type casting para evitar errores de tipado
        where = {
          ...where,
          categoria: { some: categoryFilter } as any,
        };
      }
    }

    // Búsqueda por término
    if (searchTerm) {
      where.OR = [
        { nombre: { contains: searchTerm, mode: 'insensitive' } },
        { descripcion: { contains: searchTerm, mode: 'insensitive' } },
        // Búsqueda por nombre de categoría usando type casting para evitar errores
        {
          categoria: {
            some: {
              nombre: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          } as any,
        },
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
          inventarios: {
            select: {
              id: true,
              stock: true,
              stockMinimo: true,
              sucursalId: true,
              sucursal: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
            where: {
              stock: { gt: 0 }, // Solo incluir inventarios con stock mayor a 0
            },
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

    // Registrar auditoría de la consulta exitosa
    await logSuccess({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'producto',
      module: 'productoController',
      action: 'listar_productos_exitoso',
      message: `Consulta de listado de productos (página ${page}, ${limit} por página)`,
      details: {
        page,
        limit,
        searchTerm,
        categoria,
        marcaId,
        colorId,
        soloActivos,
        totalResultados: total,
      },
    });

    // Mapear los resultados para incluir el stock calculado
    const productosConStock = productos.map((producto) => {
      // Calcular stock total sumando el stock de todos los inventarios
      const stockTotal = producto.inventarios.reduce((sum, inv) => sum + (inv.stock || 0), 0);

      return {
        ...producto,
        stock: stockTotal,
        // Mapear los inventarios para incluir solo la información relevante
        inventarios: producto.inventarios.map((inv) => ({
          id: inv.id,
          stock: inv.stock,
          stockMinimo: inv.stockMinimo,
          sucursal: {
            id: inv.sucursal?.id,
            nombre: inv.sucursal?.nombre,
          },
        })),
      };
    });

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
    await logError({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'producto',
      module: 'productoController',
      action: 'error_listar_productos',
      message: 'Error al listar productos',
      error,
      context: {
        filtros: {
          page,
          limit,
          searchTerm,
          categoria,
          marcaId,
          colorId,
          soloActivos,
        },
      },
    });

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
  // Obtener userId para auditoría
  const userId = req.user?.id;

  try {
    const { id } = req.params;
    const bodyData = req.body;

    // Validación del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      // Registrar error de validación del ID
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'actualizarProducto',
        action: 'error_actualizar_producto',
        message: 'ID de producto inválido',
        error: new Error('ID inválido - formato incorrecto. 400'),
        context: { id },
      });
      return res.status(400).json(apiResponse(false, null, 'ID de producto inválido.'));
    }

    // Validar datos de entrada
    const validacion = validateProductoInput(bodyData);

    // Validar campos numéricos
    const errorNumerico = validarCamposNumericosProducto(bodyData);
    if (errorNumerico) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'actualizarProducto',
        action: 'error_actualizar_producto',
        message: 'Error de validación en campos numéricos',
        error: new Error(errorNumerico),
        context: { id, campos: bodyData },
      });
      return res.status(400).json(apiResponse(false, null, errorNumerico));
    }

    // Validar URLs de imagen y modelo 3D si se proporcionan
    if (bodyData.imagenUrl) {
      const errorImagen = validarImagenUrl(bodyData.imagenUrl);
      if (errorImagen) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'producto',
          module: 'actualizarProducto',
          action: 'error_actualizar_producto',
          message: 'La URL de la imagen no es válida',
          error: new Error(errorImagen),
          context: { id, imagenUrl: bodyData.imagenUrl },
        });
        return res.status(400).json(apiResponse(false, null, errorImagen));
      }
    }

    if (bodyData.modelo3dUrl) {
      const errorModelo = validarModelo3dUrl(bodyData.modelo3dUrl);
      if (errorModelo) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'producto',
          module: 'actualizarProducto',
          action: 'error_actualizar_producto',
          message: 'La URL del modelo 3D no es válida',
          error: new Error(errorModelo),
          context: { id, modelo3dUrl: bodyData.modelo3dUrl },
        });
        return res.status(400).json(apiResponse(false, null, errorModelo));
      }
    }

    if ('error' in validacion) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'actualizarProducto',
        action: 'error_actualizar_producto',
        message: 'Los datos del producto son inválidos',
        error: new Error('Los datos del producto son inválidos. 400'),
        context: {
          datosSolicitud: bodyData,
          error: validacion.error,
        },
      });
      return res.status(400).json(apiResponse(false, null, validacion.error));
    }

    // Verificar si ya existe otro producto con el mismo nombre
    if (validacion.nombre) {
      const productoExistente = await prisma.producto.findFirst({
        where: {
          nombre: validacion.nombre,
          id: { not: id }, // Excluir el producto actual
        },
      });

      if (productoExistente) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'producto',
          module: 'actualizarProducto',
          action: 'error_actualizar_producto',
          message: 'Ya existe un producto con ese nombre',
          error: new Error('Ya existe un producto con ese nombre. 409'),
          context: { nombre: validacion.nombre },
        });
        return res
          .status(409)
          .json(apiResponse(false, null, 'Ya existe un producto con ese nombre.'));
      }
    }

    // Validar existencia de marca si se proporciona marcaId
    if (validacion.marcaId) {
      const marcaExistente = await prisma.marca.findUnique({
        where: { id: validacion.marcaId },
      });

      if (!marcaExistente) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'producto',
          module: 'actualizarProducto',
          action: 'error_actualizar_producto',
          message: 'La marca especificada no existe',
          error: new Error('La marca especificada no existe. 400'),
          context: { marcaId: validacion.marcaId },
        });
        return res.status(400).json(apiResponse(false, null, 'La marca especificada no existe.'));
      }
    }

    // Validar existencia de categoría y que esté activa si se proporciona categoriaId
    if (validacion.categoriaId) {
      const categoriaExistente = await prisma.categoria.findUnique({
        where: { id: validacion.categoriaId },
      });

      if (!categoriaExistente) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'producto',
          module: 'actualizarProducto',
          action: 'error_actualizar_producto',
          message: `La categoría con ID ${validacion.categoriaId} no existe`,
          error: new Error(`La categoría con ID ${validacion.categoriaId} no existe. 400`),
          context: { categoriaId: validacion.categoriaId },
        });
        return res
          .status(400)
          .json(
            apiResponse(false, null, `La categoría con ID ${validacion.categoriaId} no existe.`)
          );
      }

      // Verificar que la categoría esté activa
      if (categoriaExistente.anuladoEn) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'producto',
          module: 'actualizarProducto',
          action: 'error_actualizar_producto',
          message: `La categoría con ID ${validacion.categoriaId} está inactiva`,
          error: new Error(`La categoría con ID ${validacion.categoriaId} está inactiva. 400`),
          context: {
            categoriaId: validacion.categoriaId,
            nombreCategoria: categoriaExistente.nombre,
            anuladoEn: categoriaExistente.anuladoEn,
          },
        });
        return res
          .status(400)
          .json(
            apiResponse(false, null, `La categoría con ID ${validacion.categoriaId} está inactiva.`)
          );
      }
    }

    // Validar existencia de color si se proporciona colorId
    if (validacion.colorId) {
      const colorExistente = await prisma.color.findUnique({
        where: { id: validacion.colorId },
      });

      if (!colorExistente) {
        await logError({
          userId,
          ip: req.ip,
          entityType: 'producto',
          module: 'actualizarProducto',
          action: 'error_actualizar_producto',
          message: 'El color especificado no existe',
          error: new Error('El color especificado no existe. 400'),
          context: { colorId: validacion.colorId },
        });
        return res.status(400).json(apiResponse(false, null, 'El color especificado no existe.'));
      }
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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'actualizarProducto',
        action: 'error_actualizar_producto',
        message: 'Producto no encontrado',
        error: new Error('Producto no encontrado. 404'),
        context: { id },
      });
      return res.status(404).json(apiResponse(false, null, 'Producto no encontrado.'));
    }

    // Preparar datos de actualización con el tipo correcto
    const updateData: Prisma.ProductoUpdateInput = {
      ...validacion,
      modificadoEn: new Date(),
      modificadoPor: req.user?.id || null,
    };

    // Manejar relaciones usando el tipo correcto
    if (validacion.categoriaId) {
      (updateData as any).categoria = { connect: { id: validacion.categoriaId } };
      delete (updateData as any).categoriaId; // Eliminar el campo para evitar conflicto
    }

    if (validacion.marcaId) {
      (updateData as any).marca = { connect: { id: validacion.marcaId } };
      delete (updateData as any).marcaId;
    }

    if (validacion.colorId) {
      (updateData as any).color = { connect: { id: validacion.colorId } };
      delete (updateData as any).colorId;
    }

    // Actualizar el producto
    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: updateData,
      include: {
        categoria: {
          select: { id: true, nombre: true },
        },
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

    // Registrar la acción de auditoría exitosa
    try {
      await logSuccess({
        userId: req.user?.id,
        ip: req.ip,
        entityType: 'producto',
        entityId: id,
        module: 'productoController',
        action: 'actualizar_producto_exitoso',
        message: `Producto actualizado: ${productoActualizado.nombre}`,
        details: {
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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'actualizarProducto',
        action: 'error_actualizar_producto',
        message: 'ID de producto inválido',
        error: new Error('ID inválido - formato incorrecto. 400'),
        context: {
          error: prismaError,
        },
      });
      return res
        .status(400)
        .json(apiResponse(false, null, 'ID de producto inválido (formato incorrecto).'));
    }

    if (prismaError.code === 'P2002') {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'actualizarProducto',
        action: 'error_actualizar_producto',
        message: 'ID de producto inválido',
        error: new Error('ID inválido - formato incorrecto. 400'),
        context: {
          error: prismaError,
        },
      });
      return res
        .status(409)
        .json(apiResponse(false, null, 'Ya existe un producto con ese nombre o identificador.'));
    }

    await logError({
      userId,
      ip: req.ip,
      entityType: 'producto',
      module: 'actualizarProducto',
      action: 'error_actualizar_producto',
      message: 'Error al actualizar producto',
      error,
      context: {
        error: prismaError,
      },
    });

    return res
      .status(500)
      .json(apiResponse(false, null, 'Ocurrió un error al actualizar el producto.'));
  }
};

export const obtenerProductoPorId = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ProductoWithRelations>>
) => {
  // Obtener ID del usuario para la auditoría
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    // Validación del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      // Registrar error de validación del ID
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'productoController',
        action: 'error_obtener_producto',
        message: 'ID de producto inválido',
        error: new Error('ID inválido - formato incorrecto'),
        context: { id },
      });
      return res.status(400).json(apiResponse(false, null, 'ID de producto inválido.'));
    }

    // Buscar el producto en la base de datos con relaciones incluyendo inventarios
    // Definir el objeto include completo y aplicar type casting
    const includeOptions = {
      marca: {
        select: { id: true, nombre: true },
      },
      color: {
        select: { id: true, nombre: true, codigoHex: true },
      },
      categoria: {
        select: { id: true, nombre: true },
      },
    };

    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        ...(includeOptions as any), // Type casting para evitar errores con categoria
        inventarios: {
          select: {
            id: true,
            stock: true,
            stockMinimo: true,
            sucursalId: true,
            sucursal: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
          where: {
            stock: {
              gt: 0,
            },
          },
        },
        _count: {
          select: {
            inventarios: true,
          },
        },
      },
    });

    // Verificar si el producto existe
    if (!producto) {
      // Registrar error de producto no encontrado
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        entityId: id,
        module: 'productoController',
        action: 'error_obtener_producto',
        message: 'Producto no encontrado',
        error: new Error('Producto no encontrado'),
        context: { id },
      });
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Producto no encontrado.',
      });
    }

    // Usamos type assertion para indicar a TypeScript que el producto tiene inventarios
    // debido a que incluimos esto en la consulta Prisma
    const productoConInventarios = producto as any;

    // Calcular stock total sumando el stock de todos los inventarios
    const stockTotal = productoConInventarios.inventarios.reduce(
      (sum, inv) => sum + (inv.stock || 0),
      0
    );

    // Mapear los inventarios para incluir solo la información relevante
    const inventarios = productoConInventarios.inventarios.map((inv) => ({
      id: inv.id,
      stock: inv.stock,
      stockMinimo: inv.stockMinimo,
      sucursal: {
        id: inv.sucursal?.id,
        nombre: inv.sucursal?.nombre,
      },
    }));

    // Convertir Decimal a number para campos numéricos
    const responseData = {
      ...producto,
      precio: producto.precio instanceof Decimal ? producto.precio.toNumber() : producto.precio,
      graduacionEsfera:
        producto.graduacionEsfera instanceof Decimal
          ? producto.graduacionEsfera.toNumber()
          : producto.graduacionEsfera,
      graduacionCilindro:
        producto.graduacionCilindro instanceof Decimal
          ? producto.graduacionCilindro.toNumber()
          : producto.graduacionCilindro,
      adicion:
        producto.adicion && producto.adicion instanceof Decimal
          ? producto.adicion.toNumber()
          : producto.adicion,
      stock: stockTotal,
      inventarios,
    };

    // Registrar auditoría de consulta exitosa
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'producto',
      entityId: id,
      module: 'productoController',
      action: 'obtener_producto',
      message: `Consulta exitosa del producto: ${producto.nombre}`,
      details: {
        productoId: id,
        nombre: producto.nombre,
      },
    });

    return res.status(200).json({
      ok: true,
      data: responseData as unknown as ProductoWithRelations,
      error: null,
    });
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    // Si el error es de validación de Prisma (por ejemplo, formato de ID incorrecto), responde 400
    if (err.code === 'P2023' || err.message?.includes('Invalid')) {
      // Registrar error de validación
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        entityId: id,
        module: 'productoController',
        action: 'error_obtener_producto',
        message: 'Error de validación al obtener producto',
        error,
        context: { id, errorCode: err.code },
      });
      return res
        .status(400)
        .json({ ok: false, data: null, error: 'ID inválido (formato incorrecto).' });
    }
    // Registrar error general
    await logError({
      userId,
      ip: req.ip,
      entityType: 'producto',
      entityId: id,
      module: 'productoController',
      action: 'error_obtener_producto',
      message: 'Error al obtener producto por ID',
      error,
      context: { id },
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener el producto.',
      meta: undefined,
    });
  }
};

/**
 * Eliminar un producto (desactivación lógica)
 * @param {Request} req - Objeto de solicitud con parámetros
 * @param {Response} res - Objeto de respuesta
 * @returns {Promise<Response>} Respuesta con mensaje de éxito o error
 */

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
  // Extraer id y userId fuera del try para que estén disponibles en el catch
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Validación del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      // Registrar error de validación del ID
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'eliminarProducto',
        action: 'error_eliminar_producto',
        message: 'ID de producto inválido',
        error: new Error('ID inválido - formato incorrecto. 400'),
        context: { id },
      });
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
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'eliminarProducto',
        action: 'error_eliminar_producto',
        message: 'Producto no encontrado',
        error: new Error('Producto no encontrado. 404'),
        context: { id },
      });
      return res.status(404).json(apiResponse(false, null, 'Producto no encontrado.'));
    }

    // Verificar si el producto ya está desactivado
    if (producto.activo === false) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'eliminarProducto',
        action: 'error_eliminar_producto',
        message: 'El producto ya está desactivado',
        error: new Error('El producto ya está desactivado. 400'),
        context: { id },
      });
      return res.status(400).json(apiResponse(false, null, 'El producto ya está desactivado.'));
    }

    // Verificar si el producto tiene stock disponible
    const inventarios = await prisma.inventario.findMany({
      where: { productoId: id },
      select: { stock: true },
    });

    const stockTotal = inventarios.reduce((sum, inv) => sum + (inv.stock || 0), 0);

    if (stockTotal > 0) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'producto',
        module: 'eliminarProducto',
        action: 'error_eliminar_producto',
        message: 'No se puede desactivar un producto con stock disponible',
        error: new Error('No se puede desactivar un producto con stock disponible. 400'),
        context: {
          id,
          stockActual: stockTotal,
        },
      });
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            'No se puede desactivar el producto porque aún tiene stock disponible.'
          )
        );
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

    // Registrar la acción de auditoría exitosa
    try {
      await logSuccess({
        userId: req.user?.id,
        ip: req.ip,
        entityType: 'producto',
        entityId: id,
        module: 'productoController',
        action: 'eliminar_producto_exitoso',
        message: `Producto desactivado: ${producto.nombre}`,
        details: {
          id: producto.id,
          nombre: producto.nombre,
          activo: producto.activo,
          eliminadoPor: req.user?.id || 'sistema',
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
      // Registrar error de validación de Prisma
      await logError({
        userId: req.user?.id,
        ip: req.ip,
        entityType: 'producto',
        entityId: id,
        module: 'eliminarProducto',
        action: 'error_eliminar_producto',
        message: 'Error de validación al eliminar producto',
        error,
        context: { id, errorCode: prismaError.code },
      });
      return res
        .status(400)
        .json(apiResponse(false, null, 'ID de producto inválido (formato incorrecto).'));
    }

    // Registrar error general
    await logError({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'producto',
      entityId: id,
      module: 'eliminarProducto',
      action: 'error_eliminar_producto',
      message: 'Error al eliminar producto',
      error,
      context: { id },
    });

    // Registrar error en consola
    console.error('Error al eliminar producto:', error);

    return res
      .status(500)
      .json(apiResponse(false, null, 'Ocurrió un error al eliminar el producto.'));
  }
};
