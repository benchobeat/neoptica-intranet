import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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
    const { nombre, descripcion, activo } = req.body;
    const userId = (req as any).usuario?.id;

    // Validación estricta y avanzada de datos de entrada
    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'El nombre es obligatorio y debe ser una cadena de texto.' 
      });
    }
    
    // Validar longitud y caracteres permitidos
    const nombreLimpio = nombre.trim();
    if (nombreLimpio.length < 2 || nombreLimpio.length > 100) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'El nombre debe tener al menos 2 caracteres.' 
      });
    }
    
    // Validar caracteres permitidos: alfanuméricos, espacios y algunos especiales
    const nombreRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.,'&()]+$/;
    if (!nombreRegex.test(nombreLimpio)) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'El nombre contiene caracteres no permitidos.' 
      });
    }
    
    // Verificar si ya existe una marca con el mismo nombre (case-insensitive)
    const marcaExistente = await prisma.marca.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: 'insensitive', // Búsqueda case-insensitive
        },
        anulado_en: null, // Solo marcas no anuladas
      },
    });
    
    if (marcaExistente) {
      return res.status(409).json({ 
        ok: false, 
        data: null, 
        error: 'Ya existe una marca con ese nombre.' 
      });
    }

    // Crear la nueva marca en la base de datos
    const nuevaMarca = await prisma.marca.create({
      data: {
        nombre: nombreLimpio,
        descripcion: descripcion?.trim() || null,
        activo: activo !== undefined ? activo : true,
      },
    });

    return res.status(201).json({ 
      ok: true, 
      data: nuevaMarca, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al crear marca:', error);
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al crear la marca.' 
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
  try {
    // Preparar filtros
    const filtro: any = {
      anulado_en: null, // Solo marcas no anuladas (soft delete)
    };
    
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
    
    return res.status(200).json({ 
      ok: true, 
      data: marcas, 
      error: null 
    });
  } catch (error: any) {
    // console.error('Error al listar marcas:', error);
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al obtener el listado de marcas.' 
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
  try {
    const { id } = req.params;
    
    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'ID inválido' 
      });
    }
    
    // Buscar la marca por ID
    const marca = await prisma.marca.findUnique({
      where: {
        id,
        anulado_en: null, // Solo marcas no anuladas (soft delete)
      },
    });
    
    // Verificar si se encontró la marca
    if (!marca) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Marca no encontrada.' 
      });
    }
    
    return res.status(200).json({ 
      ok: true, 
      data: marca, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al obtener marca por ID:', error);
    
    // Manejo detallado de errores
    if (error.code === 'P2023') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido'
      });
    }
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al obtener la marca.' 
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
    const { nombre, descripcion, activo } = req.body;
    const userId = (req as any).usuario?.id;
    
    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido'
      });
    }
    
    // Verificar si la marca existe
    const marcaExistente = await prisma.marca.findUnique({
      where: {
        id,
        anulado_en: null, // Solo marcas no anuladas
      },
    });
    
    if (!marcaExistente) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Marca no encontrada.' 
      });
    }
    
    // Preparar objeto de datos a actualizar
    const datosActualizados: any = {};
    
    // Validar y procesar nombre si se proporcionó
    if (nombre !== undefined) {
      if (!nombre || typeof nombre !== 'string') {
        return res.status(400).json({ 
          ok: false, 
          data: null, 
          error: 'El nombre debe ser una cadena de texto válida.'
        });
      }
      
      const nombreLimpio = nombre.trim();
      
      // Validar longitud
      if (nombreLimpio.length < 2 || nombreLimpio.length > 100) {
        return res.status(400).json({ 
          ok: false, 
          data: null, 
          error: 'El nombre debe tener al menos 2 caracteres.' 
        });
      }
      
      // Validar caracteres permitidos
      const nombreRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.,'&()]+$/;
      if (!nombreRegex.test(nombreLimpio)) {
        return res.status(400).json({ 
          ok: false, 
          data: null, 
          error: 'El nombre contiene caracteres no permitidos.' 
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
          anulado_en: null, // Solo marcas no anuladas
        },
      });
      
      if (nombreDuplicado) {
        return res.status(409).json({ 
          ok: false, 
          data: null, 
          error: 'Ya existe otra marca con ese nombre.' 
        });
      }
      
      datosActualizados.nombre = nombreLimpio;
    }
    
    // Procesar descripción si se proporcionó
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
        error: 'No se proporcionaron datos para actualizar.' 
      });
    }
    
    // Actualizar la marca en la base de datos
    const marcaActualizada = await prisma.marca.update({
      where: { id },
      data: datosActualizados,
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: marcaActualizada, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al actualizar marca:', error);
    
    // Manejo detallado de errores de Prisma
    if (error.code === 'P2023') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido'
      });
    }
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al actualizar la marca.' 
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
    const userId = (req as any).usuario?.id;
    
    // Validación avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido'
      });
    }
    
    // Verificar si la marca existe y no está anulada
    const marcaExistente = await prisma.marca.findUnique({
      where: {
        id,
        anulado_en: null, // Solo marcas no anuladas
      },
    });
    
    if (!marcaExistente) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Marca no encontrada.' 
      });
    }
    
    // Verificar si la marca tiene productos asociados
    const productosAsociados = await prisma.producto.count({
      where: {
        marca_id: id,
        anulado_en: null, // Solo productos no anulados
      },
    });
    
    if (productosAsociados > 0) {
      return res.status(409).json({ 
        ok: false, 
        data: null, 
        error: `No se puede eliminar la marca porque tiene ${productosAsociados} producto(s) asociado(s).` 
      });
    }
    
    // Realizar soft delete (actualizando el campo anulado_en)
    const fechaActual = new Date();
    const marcaAnulada = await prisma.marca.update({
      where: { id },
      data: {
        anulado_en: fechaActual,
        activo: false, // También marcar como inactivo
      },
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: 'Marca eliminada correctamente.', 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al eliminar marca:', error);
    
    // Manejo detallado de errores de Prisma
    if (error.code === 'P2023') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID inválido'
      });
    }
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al eliminar la marca.' 
    });
  }
};
