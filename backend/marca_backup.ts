import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

/**
 * Cliente Prisma para interacciÃ³n con la base de datos.
 * Se inicializa una Ãºnica instancia para todo el controlador.
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

    // ValidaciÃ³n estricta y avanzada de datos de entrada
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
        error: 'El nombre debe tener entre 2 y 100 caracteres.' 
      });
    }
    
    // Validar caracteres permitidos: alfanumÃ©ricos, espacios y algunos especiales
    const nombreRegex = /^[a-zA-Z0-9Ã¡Ã©Ã­Ã³ÃºÃÃ‰ÃÃ“ÃšÃ±Ã‘\s\-\.,'&()]+$/;
    if (!nombreRegex.test(nombreLimpio)) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'El nombre contiene caracteres no permitidos.' 
      });
    }

    // Verificar si ya existe una marca con el mismo nombre
    const marcaExistente = await prisma.marca.findFirst({
      where: {
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive', // BÃºsqueda case-insensitive
        },
        anulado_en: null, // Solo buscar entre marcas activas
      }
    });

    if (marcaExistente) {
      return res.status(409).json({ 
        ok: false, 
        data: null, 
        error: 'Ya existe una marca con ese nombre.' 
      });
    }
    
    // Sanitizar los datos antes de insertar
    const datosSanitizados = {
      nombre: nombreLimpio,
      descripcion: descripcion ? descripcion.trim() : null,
      activo: activo === false ? false : true, // Default a true si no se especifica
    };
    
    // Crear la marca en la base de datos
    const nuevaMarca = await prisma.marca.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : undefined,
        activo: typeof activo === 'boolean' ? activo : true,
        creado_por: userId || undefined,
      },
    });
    
    return res.status(201).json({ 
      ok: true, 
      data: nuevaMarca, 
      error: null 
    });
  } catch (error: any) {
    // console.error('Error al crear la marca:', error);
    if (error.code === 'P2002') {
      // Prisma error de unicidad (clave duplicada)
      return res.status(409).json({ 
        ok: false, 
        data: null, 
        error: 'Ya existe una marca con ese nombre.' 
      });
    }
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'OcurriÃ³ un error al crear la marca.' 
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
    const { nombre, activo } = req.query;
    
    // Construir el filtro de bÃºsqueda
    const filtro: any = {
      anulado_en: null, // Solo marcas no anuladas (soft delete)
    };
    
    // Filtrar por nombre si se proporciona
    if (nombre && typeof nombre === 'string' && nombre.trim() !== '') {
      filtro.nombre = {
        contains: nombre.trim(),
        mode: 'insensitive', // BÃºsqueda case-insensitive
      };
    }
    
    // Filtrar por estado activo si se proporciona
    if (activo !== undefined) {
      const activoBool = activo === 'true';
      filtro.activo = activoBool;
    }
    
    // Obtener las marcas segÃºn el filtro
    const marcas = await prisma.marca.findMany({
      where: filtro,
      orderBy: {
        nombre: 'asc', // Ordenar alfabÃ©ticamente
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
      error: 'OcurriÃ³ un error al obtener el listado de marcas.' 
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
    
    // ValidaciÃ³n avanzada del ID - verifica formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'ID invÃ¡lido' 
      });
    }
    
    // Buscar la marca por ID
    const marca = await prisma.marca.findUnique({
      where: {
        id,
        anulado_en: null, // Solo marcas no anuladas (soft delete)
      },
    });
    
    // Verificar si se encontrÃ³ la marca
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
        error: 'ID invÃ¡lido. El formato no corresponde a un UUID vÃ¡lido.'
      });
    }
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'OcurriÃ³ un error al obtener la marca.' 
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
    
    // ValidaciÃ³n del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'ID invÃ¡lido.' 
      });
    }
    
    // ValidaciÃ³n avanzada de datos
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
        error: 'El nombre debe tener entre 2 y 100 caracteres.' 
      });
    }
    
    // Validar caracteres permitidos: alfanumÃ©ricos, espacios y algunos especiales
    const nombreRegex = /^[a-zA-Z0-9Ã¡Ã©Ã­Ã³ÃºÃÃ‰ÃÃ“ÃšÃ±Ã‘\s\-\.,'&()]+$/;
    if (!nombreRegex.test(nombreLimpio)) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'El nombre contiene caracteres no permitidos.' 
      });
    }
    
    // Validar si la descripciÃ³n es un string cuando estÃ¡ presente
    if (descripcion !== undefined && (typeof descripcion !== 'string')) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'La descripciÃ³n debe ser una cadena de texto.'
      });
    }
    
    // Verificar si la marca existe
    const marcaExistente = await prisma.marca.findUnique({
      where: {
        id,
        anulado_en: null, // Solo marcas no anuladas (soft delete)
      },
    });
    
    if (!marcaExistente) {
      return res.status(404).json({ 
        ok: false, 
        data: null, 
        error: 'Marca no encontrada.' 
      });
    }
    
    // Si se actualiza el nombre, verificar que no exista otra marca con el mismo nombre
    if (nombre && nombreLimpio !== marcaExistente.nombre) {
      const nombreDuplicado = await prisma.marca.findFirst({
        where: {
          nombre: {
            equals: nombreLimpio,
            mode: 'insensitive', // BÃºsqueda case-insensitive
          },
          id: {
            not: id, // Excluir la marca actual de la bÃºsqueda
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
    }
    
    // Preparar los datos a actualizar
    const dataUpdate: any = {};
    
    if (nombre !== undefined) dataUpdate.nombre = nombreLimpio;
    if (descripcion !== undefined) dataUpdate.descripcion = descripcion.trim();
    if (activo !== undefined) dataUpdate.activo = activo;
    
    // Agregar datos de auditorÃ­a
    dataUpdate.modificado_en = new Date();
    dataUpdate.modificado_por = userId || undefined;
    
    // Actualizar la marca
    const marcaActualizada = await prisma.marca.update({
      where: { id },
      data: dataUpdate,
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: marcaActualizada, 
      error: null 
    });
  } catch (error: any) {
    // console.error('Error al actualizar marca:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        ok: false, 
        data: null, 
        error: 'Ya existe otra marca con ese nombre.' 
      });
    }
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'OcurriÃ³ un error al actualizar la marca.' 
    });
  }
};

/**
 * Controlador para eliminar (soft delete) una marca.
 * Marca la marca como inactiva en lugar de eliminarla fÃ­sicamente.
 * 
 * @param {Request} req - Objeto de solicitud Express con ID en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} ConfirmaciÃ³n de eliminaciÃ³n o mensaje de error
 */
export const eliminarMarca = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).usuario?.id;
    
    // ValidaciÃ³n del ID
    if (!id || typeof id !== 'string' || id.length < 10) {
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: 'ID invÃ¡lido.' 
      });
    }
    
    // Verificar si la marca existe
    const marcaExistente = await prisma.marca.findUnique({
      where: {
        id,
        anulado_en: null, // Solo marcas no anuladas (soft delete)
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
      return res.status(400).json({ 
        ok: false, 
        data: null, 
        error: `No se puede eliminar la marca porque tiene ${productosAsociados} producto(s) asociado(s).` 
      });
    }
    
    // Realizar soft delete
    const marcaEliminada = await prisma.marca.update({
      where: { id },
      data: {
        activo: false,
        anulado_en: new Date(),
        anulado_por: userId || undefined,
      },
    });
    
    return res.status(200).json({ 
      ok: true, 
      data: 'Marca eliminada correctamente', 
      error: null 
    });
  } catch (error: any) {
    console.error('Error al eliminar marca:', error);
    
    // Manejo detallado de errores
    if (error.code === 'P2023') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'ID invÃ¡lido. El formato no corresponde a un UUID vÃ¡lido.'
      });
    }
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'OcurriÃ³ un error al eliminar la marca.' 
    });
  }
};
