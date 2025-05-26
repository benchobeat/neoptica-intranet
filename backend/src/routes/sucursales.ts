import { Router } from 'express';
import { listarSucursales } from '@/controllers/sucursalController';
import { authenticateJWT } from '@/middlewares/auth';

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
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', authenticateJWT, listarSucursales);

export default router;
