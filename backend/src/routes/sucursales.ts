import { Router } from 'express';
import { listarSucursales, crearSucursal, obtenerSucursalPorId, actualizarSucursal, eliminarSucursal } from '@/controllers/sucursalController';
import { authenticateJWT } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/roles';

const router = Router();

/**
 * @swagger
 * /api/sucursales:
 *   get:
 *     summary: Lista todas las sucursales activas
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sucursales activas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sucursal'
 *                 error: { type: string, example: null }
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authenticateJWT, listarSucursales);


/**
 * @swagger
 * /api/sucursales:
 *   post:
 *     summary: Crea una nueva sucursal
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SucursalInput'
 *     responses:
 *       201:
 *         description: Sucursal creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sucursal'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Duplicidad de nombre o email
 *       401:
 *         description: No autorizado
 */
router.post(  "/",  authenticateJWT,  requireRole("admin"),   crearSucursal);


/**
 * @swagger
 * /api/sucursales/{id}:
 *   get:
 *     summary: Obtiene una sucursal por su ID
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la sucursal a consultar
 *     responses:
 *       200:
 *         description: Sucursal encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sucursal'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticateJWT, obtenerSucursalPorId);

/**
 * @swagger
 * /api/sucursales/{id}:
 *   put:
 *     summary: Actualizar una sucursal existente
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la sucursal a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SucursalInput'
 *     responses:
 *       200:
 *         description: Sucursal actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sucursal'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Datos inválidos o ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Sucursal no encontrada
 *       409:
 *         description: Conflicto (p. ej. nombre duplicado)
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authenticateJWT, requireRole('admin'), actualizarSucursal);

/**
 * @swagger
 * /api/sucursales/{id}:
 *   delete:
 *     summary: Eliminar una sucursal (soft delete)
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la sucursal a eliminar
 *     responses:
 *       200:
 *         description: Sucursal eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: string
 *                   example: "Sucursal eliminada correctamente."
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Sucursal no encontrada
 *       409:
 *         description: No se puede eliminar (tiene elementos asociados)
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authenticateJWT, requireRole('admin'), eliminarSucursal);

export default router;
