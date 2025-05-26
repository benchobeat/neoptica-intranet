import { Router } from 'express';
import { listarSucursales , crearSucursal } from '@/controllers/sucursalController';
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


export default router;
