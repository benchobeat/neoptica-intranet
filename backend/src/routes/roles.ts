import { Router } from 'express';

import { listarRoles, metodoNoPermitido } from '@/controllers/rolesController';
import { authenticateJWT } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/roles';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles de usuario
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Lista todos los roles (Solo lectura)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rol'
 *                 error:
 *                   type: string
 *                   example: null
 *       401:
 *         description: Token inválido o no enviado
 */
router.get('/', authenticateJWT, requireRole('admin'), listarRoles);

// Solo permite GET, el resto responde 405
router.all('/', metodoNoPermitido);
router.all('/:id', metodoNoPermitido);

export default router;
