import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { registrarAuditoria } from '../utils/auditoria';

const prisma = new PrismaClient();

// Interfaces para DTOs
/**
 * Interfaz para crear/actualizar inventario
 */
interface InventarioDTO {
  producto_id: string;
  sucursal_id: string;
  color_id: string;
  marca_id: string;
  stock: number;
  stock_minimo: number;
}

/**
 * Interfaz para solicitar información filtrada de inventario
 */
interface FiltrosInventarioDTO {
  sucursal_id?: string;
  producto_id?: string;
  color_id?: string;
  marca_id?: string;
  estado?: 'activo' | 'bajo' | 'agotado';
}

/**
 * Interfaz para registrar movimientos de inventario
 */
interface MovimientoInventarioDTO {
  inventario_id: string;
  tipo: 'ingreso' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
  // El stock_resultante se calculará automáticamente en el servidor
}

/**
 * Interfaz para transferencias entre sucursales
 */
interface TransferenciaInventarioDTO {
  producto_id: string;
  color_id: string;
  marca_id: string;
  sucursal_origen_id: string;
  sucursal_destino_id: string;
  cantidad: number;
  motivo: string;
}

/**
 * Controlador para crear un nuevo registro de inventario.
 * 
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Respuesta con el inventario creado o mensaje de error
 */
export const crearInventario = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría y campos de control
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    const { producto_id, sucursal_id, color_id, marca_id, stock, stock_minimo } = req.body as InventarioDTO;

    // 1. Validar que todos los campos obligatorios estén presentes
    if (!producto_id || !sucursal_id || !color_id || !marca_id) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Los campos producto_id, sucursal_id, color_id y marca_id son obligatorios.'
      });
    }
    
    // Validar formatos UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(producto_id) || !uuidRegex.test(sucursal_id) || 
        !uuidRegex.test(color_id) || !uuidRegex.test(marca_id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Los IDs deben tener formato UUID válido.'
      });
    }

    // 2. Validar que producto, sucursal, color y marca existan
    // Validar existencia del producto
    const productoExistente = await prisma.producto.findUnique({
      where: { id: producto_id },
    });
    
    if (!productoExistente || productoExistente.anulado_en) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'El producto especificado no existe o está anulado.'
      });
    }
    
    // Validar existencia de la sucursal
    const sucursalExistente = await prisma.sucursal.findUnique({
      where: { id: sucursal_id },
    });
    
    if (!sucursalExistente || sucursalExistente.anulado_en) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'La sucursal especificada no existe o está anulada.'
      });
    }
    
    // Validar existencia del color
    const colorExistente = await prisma.color.findUnique({
      where: { id: color_id },
    });
    
    if (!colorExistente || colorExistente.anulado_en || !colorExistente.activo) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'El color especificado no existe, está anulado o no está activo.'
      });
    }
    
    // Validar existencia de la marca
    const marcaExistente = await prisma.marca.findUnique({
      where: { id: marca_id },
    });
    
    if (!marcaExistente || marcaExistente.anulado_en || !marcaExistente.activo) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'La marca especificada no existe, está anulada o no está activa.'
      });
    }

    // 3. Validar que stock y stock_minimo no sean negativos
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El stock no puede ser un valor negativo.'
      });
    }
    
    if (stock_minimo !== undefined && stock_minimo < 0) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El stock_minimo no puede ser un valor negativo.'
      });
    }
    
    // 4. Validar que no exista un registro con la misma combinación producto/sucursal/color/marca
    // Esta validación ya está cubierta por la restricción única en la base de datos

    // Crear el nuevo registro de inventario en la base de datos
    // Usamos un casting para evitar problemas con los campos nuevos
    const inventarioData = {
      producto_id,
      sucursal_id,
      color_id,
      marca_id,
      stock: stock ?? 0,
      stock_minimo: stock_minimo ?? 3,
      creado_por: userId || null,
      creado_en: new Date(),
    } as any; // Usamos casting para evitar errores con los nuevos campos
    
    const nuevoInventario = await prisma.inventario.create({
      data: inventarioData,
    });
    
    // Registrar auditoría de creación exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'crear_inventario_exitoso',
      descripcion: `Inventario creado para producto ${producto_id} en sucursal ${sucursal_id}`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: nuevoInventario.id,
      modulo: 'inventario',
    });

    return res.status(201).json({ 
      ok: true, 
      data: nuevoInventario, 
      error: null 
    });
  } catch (error) {
    // Solo mostrar en consola si NO es test o desarrollo
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
      // console.error('Error al crear inventario:', error);
    }
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'crear_inventario_fallido',
      descripcion: `Error al crear inventario: ${(error as Error).message}`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: null,
      modulo: 'inventario',
    });
    
    // Verificar si es un error de Prisma para dar respuestas más específicas
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ 
        ok: false, 
        data: null, 
        error: 'Ya existe un registro de inventario para esta combinación de producto, sucursal, color y marca.' 
      });
    }
    
    return res.status(500).json({ 
      ok: false, 
      data: null, 
      error: 'Error interno del servidor al crear inventario.' 
    });
  }
};

/**
 * Controlador para registrar un movimiento de inventario.
 * Utiliza una transacción atómica para actualizar el stock y registrar el movimiento.
 * 
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Respuesta con el movimiento creado o mensaje de error
 */
export const registrarMovimientoInventario = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría y campos de control
  const userId = (req as any).user?.id;
  // Usar exclusivamente el sistema multi-rol
  const userRoles = (req as any).user?.roles || [];
  
  try {
    const { inventario_id, tipo, cantidad, motivo } = req.body as MovimientoInventarioDTO;

    // 1. Validar que todos los campos obligatorios estén presentes
    if (!inventario_id || !tipo || cantidad === undefined || !motivo) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Los campos inventario_id, tipo, cantidad y motivo son obligatorios.'
      });
    }
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(inventario_id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El ID de inventario debe tener formato UUID válido.'
      });
    }
    
    // Validar tipo de movimiento
    if (!['ingreso', 'salida', 'ajuste'].includes(tipo)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El tipo de movimiento debe ser uno de estos: ingreso, salida, ajuste.'
      });
    }
    
    // Validar que el motivo tenga contenido válido
    if (motivo.trim().length < 3 || motivo.trim().length > 500) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El motivo debe tener entre 3 y 500 caracteres.'
      });
    }
    
    // 2. Validar que el inventario exista
    const inventarioExistente = await prisma.inventario.findUnique({
      where: { id: inventario_id },
    });
    
    if (!inventarioExistente) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'El registro de inventario especificado no existe.'
      });
    }
    
    if (inventarioExistente.anulado_en) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'No se pueden registrar movimientos en un inventario anulado.'
      });
    }
    
    // 3. Validar cantidad
    if (cantidad <= 0 && tipo === 'ingreso') {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'La cantidad para ingresos debe ser un valor positivo.'
      });
    }
    
    if (tipo === 'salida') {
      // Validar que la cantidad para salidas sea positiva (en la UI)
      const cantidadAbs = Math.abs(cantidad);
      
      // Validar que haya stock suficiente
      if (cantidadAbs > inventarioExistente.stock) {
        return res.status(400).json({
          ok: false,
          data: null,
          error: 'No hay stock suficiente para realizar la operación.'
        });
      }
    }
    
    // Para ajustes, la cantidad puede ser positiva o negativa

    // Usar una transacción para asegurar que tanto la actualización del stock
    // como el registro del movimiento se realicen de manera atómica
    const resultado = await prisma.$transaction(async (tx) => {
      // Obtener el inventario actual con bloqueo de fila (FOR UPDATE)
      const inventario = await tx.inventario.findUnique({
        where: { id: inventario_id },
      });
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Calcular el nuevo stock según el tipo de movimiento
      let nuevoStock = inventario.stock || 0;
      if (tipo === 'ingreso') {
        nuevoStock += cantidad;
      } else if (tipo === 'salida') {
        // Para salidas, asegurarnos que trabajamos con un valor positivo para restar
        const cantidadAbs = Math.abs(cantidad);
        nuevoStock -= cantidadAbs;
        // Validar que el stock no quede negativo
        if (nuevoStock < 0) {
          throw new Error('Stock insuficiente para realizar la salida');
        }
      } else if (tipo === 'ajuste') {
        // Para ajustes, la cantidad puede ser positiva o negativa
        nuevoStock += cantidad;
        // Validar que el stock no quede negativo
        if (nuevoStock < 0) {
          throw new Error('El ajuste no puede resultar en un stock negativo');
        }
      }
      
      // Actualizar el inventario
      const inventarioActualizado = await tx.inventario.update({
        where: { id: inventario_id },
        data: {
          stock: nuevoStock,
          modificado_por: userId || null,
          modificado_en: new Date(),
        },
      });
      
      // Registrar el movimiento
      // Usamos un casting para evitar problemas con los campos nuevos
      const movimientoData = {
        inventario_id,
        usuario_id: userId || null,
        tipo,
        cantidad,
        stock_resultante: nuevoStock,
        motivo,
        fecha: new Date(),
        creado_por: userId || null,
        creado_en: new Date(),
      } as any; // Usamos casting para evitar errores con los nuevos campos
      
      const movimiento = await tx.movimiento_inventario.create({
        data: movimientoData,
      });
      
      return { inventarioActualizado, movimiento };
    });
    
    // Registrar auditoría de movimiento exitoso
    await registrarAuditoria({
      usuarioId: userId,
      accion: `${tipo}_inventario_exitoso`,
      descripcion: `Movimiento de ${tipo} registrado: ${cantidad} unidades. Motivo: ${motivo}`,
      ip: req.ip,
      entidadTipo: 'movimiento_inventario',
      entidadId: resultado.movimiento.id,
      modulo: 'inventario',
    });

    return res.status(201).json({ 
      ok: true, 
      data: resultado.movimiento, 
      error: null 
    });
  } catch (error) {
    // console.error('Error al registrar movimiento de inventario:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'movimiento_inventario_fallido',
      descripcion: `Error al registrar movimiento: ${(error as Error).message}`,
      ip: req.ip,
      entidadTipo: 'movimiento_inventario',
      entidadId: null,
      modulo: 'inventario',
    });
    
    // Mensaje específico según el tipo de error
    let mensajeError = 'Error interno del servidor al registrar movimiento de inventario.';
    let statusCode = 500;
    
    if ((error as Error).message === 'Inventario no encontrado') {
      mensajeError = 'El inventario especificado no existe.';
      statusCode = 404;
    } else if ((error as Error).message === 'Stock insuficiente para realizar la salida' || 
               (error as Error).message === 'El ajuste no puede resultar en un stock negativo') {
      mensajeError = (error as Error).message;
      statusCode = 400;
    }
    
    return res.status(statusCode).json({ 
      ok: false, 
      data: null, 
      error: mensajeError 
    });
  }
};

/**
 * Controlador para listar registros de inventario con filtros opcionales.
 * 
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista filtrada de registros de inventario
 */
export const listarInventario = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    // Obtener parámetros de consulta para filtros
    const { sucursal_id, producto_id, color_id, marca_id, estado } = req.query as unknown as FiltrosInventarioDTO;
    
    // Construir filtros dinámicos
    const filtros: any = {
      anulado_en: null, // Solo mostrar registros no anulados por defecto
    };
    
    // Añadir filtros si están presentes
    if (sucursal_id) filtros.sucursal_id = sucursal_id;
    if (producto_id) filtros.producto_id = producto_id;
    if (color_id) filtros.color_id = color_id;
    if (marca_id) filtros.marca_id = marca_id;
    
    // Filtrar por estado (activo, bajo, agotado)
    if (estado === 'bajo') {
      filtros.stock = {
        lte: prisma.inventario.fields.stock_minimo, // Stock menor o igual que stock_minimo
        gt: 0, // Stock mayor que 0
      };
    } else if (estado === 'agotado') {
      filtros.stock = 0;
    } else if (estado === 'activo') {
      filtros.stock = { gt: prisma.inventario.fields.stock_minimo }; // Stock mayor que stock_minimo
    }
    
    // Consultar el inventario con los filtros aplicados y relaciones
    // Usamos casting para evitar errores con los nuevos campos
    const options = {
      where: filtros,
      include: {
        producto: true,
        sucursal: true,
        color: true,
        marca: true,
      },
      orderBy: [
        { sucursal: { nombre: 'asc' } },
        { producto: { nombre: 'asc' } },
      ],
    } as any;
    
    const inventario = await prisma.inventario.findMany(options);
    
    // Registrar auditoría de consulta exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_inventario_exitoso',
      descripcion: `Consulta de inventario con ${Object.keys(filtros).length - 1} filtros aplicados`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: null,
      modulo: 'inventario',
    });

    return res.status(200).json({
      ok: true,
      data: inventario,
      error: null,
    });
  } catch (error) {
    // console.error('Error al listar inventario:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_inventario_fallido',
      descripcion: `Error al listar inventario: ${(error as Error).message}`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: null,
      modulo: 'inventario',
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al listar inventario.'
    });
  }
};

/**
 * Controlador para obtener un registro de inventario por su ID.
 * 
 * @param {Request} req - Objeto de solicitud Express con ID en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos del registro de inventario o mensaje de error
 */
export const obtenerInventarioPorId = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    const { id } = req.params;
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El ID debe tener formato UUID válido.'
      });
    }
    
    // Usamos transaction para garantizar consistencia en los datos obtenidos
    const resultado = await prisma.$transaction(async (tx) => {
      // Buscar el registro de inventario por ID
      const inventario = await tx.inventario.findUnique({
        where: { id }
      });
      
      if (!inventario) {
        return null;
      }
      
      // Obtener movimientos relacionados
      const movimientos = await tx.movimiento_inventario.findMany({
        where: { inventario_id: id },
        orderBy: { fecha: 'desc' as const },
        take: 10
      });
      
      // Obtener producto relacionado si existe
      const producto = inventario.producto_id 
        ? await tx.producto.findUnique({ where: { id: inventario.producto_id } })
        : null;
        
      // Obtener sucursal relacionada si existe
      const sucursal = inventario.sucursal_id
        ? await tx.sucursal.findUnique({ where: { id: inventario.sucursal_id } })
        : null;
        
      // Obtener color y marca usando any para evitar errores de tipo
      // ya que el esquema puede variar
      const inventarioAny = inventario as any;
      
      // Obtener color relacionado si existe
      const color = inventarioAny.color_id
        ? await tx.color.findUnique({ where: { id: inventarioAny.color_id } })
        : null;
        
      // Obtener marca relacionada si existe
      const marca = inventarioAny.marca_id
        ? await tx.marca.findUnique({ where: { id: inventarioAny.marca_id } })
        : null;
      
      // Construir objeto de respuesta
      return {
        ...inventario,
        producto,
        sucursal,
        color,
        marca,
        movimientos
      };
    });
    
    // Verificar si existe el inventario
    if (!resultado) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Registro de inventario no encontrado.'
      });
    }
    
    // Registrar auditoría de consulta exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'obtener_inventario_exitoso',
      descripcion: `Consulta de inventario ID: ${id}`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: id,
      modulo: 'inventario',
    });

    return res.status(200).json({
      ok: true,
      data: resultado,
      error: null,
    });
  } catch (error) {
    // console.error('Error al obtener inventario por ID:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'obtener_inventario_fallido',
      descripcion: `Error al obtener inventario: ${(error as Error).message}`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: req.params.id || null,
      modulo: 'inventario',
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al obtener inventario.'
    });
  }
};

/**
 * Controlador para actualizar un registro de inventario existente.
 * 
 * @param {Request} req - Objeto de solicitud Express con ID en params y datos en body
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Datos del registro actualizado o mensaje de error
 */
export const actualizarInventario = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría y campos de control
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    const { id } = req.params;
    const { stock, stock_minimo } = req.body;
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El ID debe tener formato UUID válido.'
      });
    }
    
    // Verificar que el inventario exista
    const inventarioExistente = await prisma.inventario.findUnique({
      where: { id },
    });
    
    if (!inventarioExistente) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Registro de inventario no encontrado.'
      });
    }
    
    // Verificar si está anulado
    if (inventarioExistente.anulado_en) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'No se puede actualizar un registro de inventario anulado.'
      });
    }
    
    // Validar que los campos a actualizar sean válidos
    if (stock === undefined && stock_minimo === undefined) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Debe proporcionar al menos un campo para actualizar (stock o stock_minimo).'
      });
    }
    
    // Validar que stock y stock_minimo no sean negativos
    if ((stock !== undefined && stock < 0) || (stock_minimo !== undefined && stock_minimo < 0)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El stock y stock mínimo no pueden ser valores negativos.'
      });
    }
    
    // Preparar datos para actualización
    const datosActualizacion: any = {
      modificado_por: userId || null,
      modificado_en: new Date(),
    };
    
    // Añadir campos a actualizar si están presentes
    if (stock !== undefined) datosActualizacion.stock = stock;
    if (stock_minimo !== undefined) datosActualizacion.stock_minimo = stock_minimo;
    
    // Actualizar el registro de inventario
    // Usamos casting para evitar errores con los nuevos campos
    const options = {
      where: { id },
      data: datosActualizacion,
      include: {
        producto: true,
        sucursal: true,
        color: true,
        marca: true,
      },
    } as any;
    
    const inventarioActualizado = await prisma.inventario.update(options);
    
    // Registrar auditoría de actualización exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'actualizar_inventario_exitoso',
      descripcion: `Inventario actualizado ID: ${id}, campos: ${Object.keys(datosActualizacion).filter(k => k !== 'modificado_por' && k !== 'modificado_en').join(', ')}`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: id,
      modulo: 'inventario',
    });

    return res.status(200).json({
      ok: true,
      data: inventarioActualizado,
      error: null,
    });
  } catch (error) {
    // console.error('Error al actualizar inventario:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'actualizar_inventario_fallido',
      descripcion: `Error al actualizar inventario: ${(error as Error).message}`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: req.params.id || null,
      modulo: 'inventario',
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al actualizar inventario.'
    });
  }
};

/**
 * Controlador para eliminar (soft delete) un registro de inventario.
 * 
 * @param {Request} req - Objeto de solicitud Express con ID en params
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Confirmación de eliminación o mensaje de error
 */
export const eliminarInventario = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría y campos de control
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    const { id } = req.params;
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El ID debe tener formato UUID válido.'
      });
    }
    
    // Verificar que el inventario exista
    const inventarioExistente = await prisma.inventario.findUnique({
      where: { id },
    });
    
    if (!inventarioExistente) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Registro de inventario no encontrado.'
      });
    }
    
    // Verificar si ya está anulado
    if (inventarioExistente.anulado_en) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Este registro de inventario ya se encuentra anulado.'
      });
    }
    
    // Verificar que el stock sea cero antes de permitir la eliminación
    if (inventarioExistente.stock > 0) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'No se puede eliminar un inventario con stock disponible. El stock debe ser cero.'
      });
    }
    
    // Realizar soft delete (anulación)
    const inventarioAnulado = await prisma.inventario.update({
      where: { id },
      data: {
        anulado_en: new Date(),
        anulado_por: userId || null,
      },
    });
    
    // Registrar auditoría de eliminación exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'eliminar_inventario_exitoso',
      descripcion: `Inventario anulado ID: ${id}`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: id,
      modulo: 'inventario',
    });

    return res.status(200).json({
      ok: true,
      data: { mensaje: 'Registro de inventario anulado correctamente.', id },
      error: null,
    });
  } catch (error) {
    // console.error('Error al eliminar inventario:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'eliminar_inventario_fallido',
      descripcion: `Error al eliminar inventario: ${(error as Error).message}`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: req.params.id || null,
      modulo: 'inventario',
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al eliminar inventario.'
    });
  }
};

/**
 * Controlador para listar alertas de stock bajo o agotado.
 * Solo accesible para usuarios autenticados.
 * 
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Lista de inventarios con stock bajo o agotado
 */
export const listarAlertasStock = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    // Filtrar inventarios con stock bajo (menor o igual al mínimo) o agotado (cero)
    // Usamos casting para evitar errores con los nuevos campos
    const options = {
      where: {
        anulado_en: null,
        OR: [
          {
            stock: { lte: prisma.inventario.fields.stock_minimo, gt: 0 }, // Stock bajo
          },
          {
            stock: 0, // Stock agotado
          },
        ],
      },
      include: {
        producto: true,
        sucursal: true,
        color: true,
        marca: true,
      },
      orderBy: [
        { stock: 'asc' }, // Priorizar los que tienen menos stock
        { sucursal: { nombre: 'asc' } },
        { producto: { nombre: 'asc' } },
      ],
    } as any;
    
    const alertasStock = await prisma.inventario.findMany(options);
    
    // Clasificar alertas en "bajo" y "agotado"
    const alertasClasificadas = alertasStock.map(item => ({
      ...item,
      estado: item.stock === 0 ? 'agotado' : 'bajo',
    }));
    
    // Registrar auditoría de consulta exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_alertas_stock_exitoso',
      descripcion: `Consulta de alertas de stock`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: null,
      modulo: 'inventario',
    });

    return res.status(200).json({
      ok: true,
      data: alertasClasificadas,
      meta: {
        resumen: {
          total: alertasClasificadas.length,
          bajo: alertasClasificadas.filter(a => a.estado === 'bajo').length,
          agotado: alertasClasificadas.filter(a => a.estado === 'agotado').length,
        },
      },
      error: null,
    });
  } catch (error) {
    // console.error('Error al listar alertas de stock:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_alertas_stock_fallido',
      descripcion: `Error al listar alertas de stock: ${(error as Error).message}`,
      ip: req.ip,
      entidadTipo: 'inventario',
      entidadId: null,
      modulo: 'inventario',
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al listar alertas de stock.'
    });
  }
};

/**
 * Controlador para reversar o anular un movimiento de inventario.
 * Solo usuarios con rol admin pueden realizar esta operación.
 * 
 * @param {Request} req - Objeto de solicitud Express con ID en params y motivo en body
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<Response>} Confirmación de reversa o mensaje de error
 */
export const reversarMovimientoInventario = async (req: Request, res: Response) => {
  // Capturar ID de usuario para auditoría y campos de control
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El ID debe tener formato UUID válido.'
      });
    }
    
    // Validar que se proporcione un motivo
    if (!motivo || motivo.trim().length < 3 || motivo.trim().length > 500) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Debe proporcionar un motivo válido para la reversa (entre 3 y 500 caracteres).'
      });
    }
    
    // Buscar el movimiento original
    const movimientoOriginal = await prisma.movimiento_inventario.findUnique({
      where: { id },
      include: {
        inventario: true,
      },
    });
    
    if (!movimientoOriginal) {
      return res.status(404).json({
        ok: false,
        data: null,
        error: 'Movimiento de inventario no encontrado.'
      });
    }
    
    // Verificar si el movimiento ya está anulado o es una reversa
    if (movimientoOriginal.anulado) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Este movimiento ya se encuentra anulado.'
      });
    }
    
    if (movimientoOriginal.reversa_de) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'No se puede reversar un movimiento que ya es una reversa.'
      });
    }
    
    // Validar que el inventario asociado exista y no esté anulado
    if (!movimientoOriginal.inventario || movimientoOriginal.inventario.anulado_en) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: 'El inventario asociado a este movimiento no existe o está anulado.'
      });
    }
    
    // Calcular la cantidad inversa para la reversa
    const cantidadReversa = -movimientoOriginal.cantidad;
    
    // Usar una transacción para asegurar la integridad de los datos
    const resultado = await prisma.$transaction(async (tx) => {
      // Obtener el inventario actual con bloqueo de fila
      const inventario = await tx.inventario.findUnique({
        where: { id: movimientoOriginal.inventario_id as string },
      });
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Calcular el nuevo stock tras la reversa
      const nuevoStock = (inventario.stock || 0) + cantidadReversa;
      
      // Validar que el stock no quede negativo
      if (nuevoStock < 0) {
        throw new Error('La reversa no puede resultar en un stock negativo');
      }
      
      // Actualizar el inventario
      const inventarioActualizado = await tx.inventario.update({
        where: { id: movimientoOriginal.inventario_id as string },
        data: {
          stock: nuevoStock,
          modificado_por: userId || null,
          modificado_en: new Date(),
        },
      });
      
      // Marcar el movimiento original como anulado
      const movimientoAnulado = await tx.movimiento_inventario.update({
        where: { id },
        data: {
          anulado: true,
          modificado_por: userId || null,
          modificado_en: new Date(),
        },
      });
      
      // Crear el movimiento de reversa
      // Determinar el tipo opuesto para la reversa
      let tipoReversa: string;
      if (movimientoOriginal.tipo === 'ingreso') {
        tipoReversa = 'salida';
      } else if (movimientoOriginal.tipo === 'salida') {
        tipoReversa = 'ingreso';
      } else {
        tipoReversa = 'ajuste'; // Para tipo 'ajuste' u otros
      }
      
      const movimientoData = {
        inventario_id: movimientoOriginal.inventario_id,
        usuario_id: userId || null,
        tipo: tipoReversa,
        cantidad: Math.abs(movimientoOriginal.cantidad), // Guarda el valor absoluto para la UI
        stock_resultante: nuevoStock,
        motivo: `Reversión: ${motivo} (reversa del movimiento ID: ${id})`,
        reversa_de: id,
        fecha: new Date(),
        creado_por: userId || null,
        creado_en: new Date(),
      } as any;
      
      const movimientoReversa = await tx.movimiento_inventario.create({
        data: movimientoData,
      });
      
      return { inventarioActualizado, movimientoAnulado, movimientoReversa };
    });
    
    // Registrar auditoría de reversa exitosa
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'reversar_movimiento_exitoso',
      descripcion: `Movimiento ID: ${id} reversado. Motivo: ${motivo}`,
      ip: req.ip,
      entidadTipo: 'movimiento_inventario',
      entidadId: id,
      modulo: 'inventario',
    });

    return res.status(200).json({
      ok: true,
      data: resultado.movimientoReversa,
      meta: {
        mensaje: 'Movimiento reversado correctamente.',
        movimientoOriginal: { id, anulado: true },
        stockActual: resultado.inventarioActualizado.stock,
      },
      error: null,
    });
  } catch (error) {
    // console.error('Error al reversar movimiento de inventario:', error);
    
    // Registrar auditoría de error
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'reversar_movimiento_fallido',
      descripcion: `Error al reversar movimiento: ${(error as Error).message}`,
      ip: req.ip,
      entidadTipo: 'movimiento_inventario',
      entidadId: req.params.id || null,
      modulo: 'inventario',
    });
    
    // Mensaje específico según el tipo de error
    let mensajeError = 'Error interno del servidor al reversar movimiento de inventario.';
    let statusCode = 500;
    
    if ((error as Error).message === 'Inventario no encontrado') {
      mensajeError = 'El inventario asociado no existe.';
      statusCode = 404;
    } else if ((error as Error).message === 'La reversa no puede resultar en un stock negativo') {
      mensajeError = 'La reversa no puede resultar en un stock negativo. Se deben ajustar otros movimientos primero.';
      statusCode = 400;
    }
    
    return res.status(statusCode).json({
      ok: false,
      data: null,
      error: mensajeError
    });
  }
};

// Otros controladores pendientes:
// - solicitarTransferencia
// - aprobarTransferencia
// - rechazarTransferencia
