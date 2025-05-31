import { Router } from 'express';
import { 
  crearInventario, 
  listarInventario, 
  obtenerInventarioPorId, 
  actualizarInventario, 
  eliminarInventario,
  registrarMovimientoInventario,
  reversarMovimientoInventario,
  listarAlertasStock
} from '@/controllers/inventarioController';
import { authenticateJWT } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/roles';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Gestión de inventario y movimientos de stock
 * components:
 *   schemas:
 *     InventarioInput:
 *       type: object
 *       required:
 *         - producto_id
 *         - sucursal_id
 *         - color_id
 *         - marca_id
 *       properties:
 *         producto_id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         sucursal_id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         color_id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440002"
 *         marca_id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440003"
 *         stock:
 *           type: integer
 *           minimum: 0
 *           example: 10
 *         stock_minimo:
 *           type: integer
 *           minimum: 0
 *           example: 5
 *     InventarioUpdate:
 *       type: object
 *       properties:
 *         stock:
 *           type: integer
 *           minimum: 0
 *           example: 15
 *         stock_minimo:
 *           type: integer
 *           minimum: 0
 *           example: 3
 *     MovimientoInput:
 *       type: object
 *       required:
 *         - inventario_id
 *         - tipo
 *         - cantidad
 *         - motivo
 *       properties:
 *         inventario_id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         tipo:
 *           type: string
 *           enum: [ingreso, salida, ajuste]
 *           example: "ingreso"
 *         cantidad:
 *           type: integer
 *           example: 5
 *           description: "Positivo para ingresos, negativo para salidas, cualquiera para ajustes"
 *         motivo:
 *           type: string
 *           example: "Compra de nuevos productos"
 *     ReversaInput:
 *       type: object
 *       required:
 *         - motivo
 *       properties:
 *         motivo:
 *           type: string
 *           example: "Error en la cantidad ingresada"
 *     Inventario:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         producto_id:
 *           type: string
 *           format: uuid
 *         sucursal_id:
 *           type: string
 *           format: uuid
 *         color_id:
 *           type: string
 *           format: uuid
 *         marca_id:
 *           type: string
 *           format: uuid
 *         stock:
 *           type: integer
 *         stock_minimo:
 *           type: integer
 *         producto:
 *           type: object
 *         sucursal:
 *           type: object
 *         color:
 *           type: object
 *         marca:
 *           type: object
 *         creado_en:
 *           type: string
 *           format: date-time
 *         modificado_en:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     Error:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         data:
 *           type: object
 *           nullable: true
 *           example: null
 *         error:
 *           type: string
 *           example: "Mensaje descriptivo del error"
 */

/**
 * @swagger
 * /api/inventario:
 *   post:
 *     summary: Crear un nuevo registro de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventarioInput'
 *     responses:
 *       201:
 *         description: Inventario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Inventario'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Error en los datos enviados
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto, sucursal, color o marca no encontrados
 *       409:
 *         description: Ya existe un registro para esta combinación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authenticateJWT, requireRole('admin'), crearInventario);

/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Listar registros de inventario con filtros opcionales
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursal_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por sucursal
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por producto
 *       - in: query
 *         name: color_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por color
 *       - in: query
 *         name: marca_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por marca
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, bajo, agotado]
 *         description: Filtrar por estado de stock
 *     responses:
 *       200:
 *         description: Lista de registros de inventario
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticateJWT, listarInventario);

/**
 * @swagger
 * /api/inventario/alertas:
 *   get:
 *     summary: Listar alertas de stock bajo o agotado
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas de stock
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/alertas', authenticateJWT, listarAlertasStock);

/**
 * @swagger
 * /api/inventario/{id}:
 *   get:
 *     summary: Obtener un registro de inventario por su ID
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del registro de inventario
 *     responses:
 *       200:
 *         description: Registro de inventario encontrado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticateJWT, obtenerInventarioPorId);

/**
 * @swagger
 * /api/inventario/{id}:
 *   put:
 *     summary: Actualizar un registro de inventario existente
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del registro de inventario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventarioUpdate'
 *     responses:
 *       200:
 *         description: Registro actualizado exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authenticateJWT, requireRole('admin'), actualizarInventario);

/**
 * @swagger
 * /api/inventario/{id}:
 *   delete:
 *     summary: Eliminar (anular) un registro de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del registro de inventario
 *     responses:
 *       200:
 *         description: Registro anulado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authenticateJWT, requireRole('admin'), eliminarInventario);

/**
 * @swagger
 * /api/inventario/movimientos:
 *   post:
 *     summary: Registrar un nuevo movimiento de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovimientoInput'
 *     responses:
 *       201:
 *         description: Movimiento registrado exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Inventario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/movimientos', authenticateJWT, registrarMovimientoInventario);

/**
 * @swagger
 * /api/inventario/movimientos/{id}/reversar:
 *   post:
 *     summary: Reversar un movimiento de inventario (solo admin)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del movimiento a reversar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReversaInput'
 *     responses:
 *       200:
 *         description: Movimiento reversado exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (no tiene rol admin)
 *       404:
 *         description: Movimiento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/movimientos/:id/reversar', authenticateJWT, requireRole('admin'), reversarMovimientoInventario);

export default router;
