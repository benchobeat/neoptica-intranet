import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

/**
 * Cliente Prisma para interacción con la base de datos.
 * Se inicializa una única instancia para todo el controlador.
 */
const prisma = new PrismaClient();

/**
 * Controlador para crear un nuevo color.
 * 
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Respuesta con el color creado o mensaje de error
 */
export const crearColor = async (req: Request, res: Response) => {
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
    
    // Verificar si ya existe un color con el mismo nombre (case-insensitive)
    const colorExistente = await prisma.color.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: 'insensitive', // Búsqueda case-insensitive
        },
        anulado_en: null, // Solo colores no anulados
      },
    });
    
    if (colorExistente) {
      return res.status(409).json({ 
        ok: false, 
        data: null, 
        error: 'Ya existe un color con ese nombre.' 
      });
    }

    // Crear el nuevo color en la base de datos
    const nuevoColor = await prisma.color.create({
      data: {
        nombre: nombreLimpio,
        descripcion: descripcion?.trim() || null,
        activo: activo !== undefined ? activo : true,
        creado_por: userId || null,
      },
    });

    return res.status(201).json({ 
      ok: true, 
      data: nuevoColor, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al crear color:', error);
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al crear el color.' 
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
  try {
    // Preparar filtros
    const filtro: any = {
      anulado_en: null, // Solo colores no anulados (soft delete)
    };
    
    // Filtro adicional por activo si se proporciona en la consulta
    if (req.query.activo !== undefined) {
      filtro.activo = req.query.activo === 'true';
    }
    
    // Buscar colores según filtros y ordenar alfabéticamente
    const colores = await prisma.color.findMany({
      where: filtro,
      orderBy: {
        nombre: 'asc', // Ordenar alfabéticamente
      },
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: colores, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al listar colores:', error);
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Ocurrió un error al obtener el listado de colores.' 
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
    
    // Buscar el color por ID
    const color = await prisma.color.findUnique({
      where: {
        id,
        anulado_en: null, // Solo colores no anulados (soft delete)
      },
    });
    
    // Verificar si se encontró el color
    if (!color) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Color no encontrado.' 
      });
    }
    
    return res.status(200).json({ 
      ok: true, 
      data: color, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al obtener color por ID:', error);
    
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
      error: 'Ocurrió un error al obtener el color.' 
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
    
    // Verificar si el color existe
    const colorExistente = await prisma.color.findUnique({
      where: {
        id,
        anulado_en: null, // Solo colores no anulados
      },
    });
    
    if (!colorExistente) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Color no encontrado.' 
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
      
      // Verificar que no exista otro color con el mismo nombre (excepto el actual)
      const nombreDuplicado = await prisma.color.findFirst({
        where: {
          nombre: {
            equals: nombreLimpio,
            mode: 'insensitive', // Búsqueda case-insensitive
          },
          id: {
            not: id, // Excluir el color actual de la búsqueda
          },
          anulado_en: null, // Solo colores no anulados
        },
      });
      
      if (nombreDuplicado) {
        return res.status(409).json({ 
          ok: false, 
          data: null, 
          error: 'Ya existe otro color con ese nombre.' 
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
    
    // Agregar información de auditoría
    datosActualizados.modificado_en = new Date();
    datosActualizados.modificado_por = userId || null;
    
    // Actualizar el color en la base de datos
    const colorActualizado = await prisma.color.update({
      where: { id },
      data: datosActualizados,
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: colorActualizado, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al actualizar color:', error);
    
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
      error: 'Ocurrió un error al actualizar el color.' 
    });
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
    
    // Verificar si el color existe y no está anulado
    const colorExistente = await prisma.color.findUnique({
      where: {
        id,
        anulado_en: null, // Solo colores no anulados
      },
    });
    
    if (!colorExistente) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Color no encontrado.' 
      });
    }
    
    // Verificar si el color tiene productos asociados
    const productosAsociados = await prisma.producto.count({
      where: {
        color_id: id,
        anulado_en: null, // Solo productos no anulados
      },
    });
    
    if (productosAsociados > 0) {
      return res.status(409).json({ 
        ok: false, 
        data: null, 
        error: `No se puede eliminar el color porque tiene ${productosAsociados} producto(s) asociado(s).` 
      });
    }
    
    // Realizar soft delete (actualizando el campo anulado_en)
    const fechaActual = new Date();
    const colorAnulado = await prisma.color.update({
      where: { id },
      data: {
        anulado_en: fechaActual,
        anulado_por: userId || null,
        activo: false, // También marcar como inactivo
      },
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: 'Color eliminado correctamente.', 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al eliminar color:', error);
    
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
      error: 'Ocurrió un error al eliminar el color.' 
    });
  }
};
