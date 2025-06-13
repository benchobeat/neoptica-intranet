import type { Request, Response } from 'express';
import express from 'express';

import { authenticateJWT, checkRole } from '@/middlewares/auth';
import { success } from '@/utils/response';

const router = express.Router();

/**
 * @swagger
 * /api/admin/ruta-protegida:
 *   get:
 *     summary: Ruta protegida para prueba de admin
 *     tags: [Test]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso concedido
 *       403:
 *         description: Acceso denegado
 *       401:
 *         description: No autorizado, token inválido o expirado
 */
router.get(
  '/admin/ruta-protegida',
  authenticateJWT,
  checkRole(['admin']),
  (req: Request, res: Response) => {
    res.json(success({ message: 'Acceso concedido' }));
  }
);

/**
 * @swagger
 * /api/vendedor/ruta-protegida:
 *   get:
 *     summary: Ruta protegida para prueba de vendedor
 *     tags: [Test]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso concedido
 *       403:
 *         description: Acceso denegado
 *       401:
 *         description: No autorizado, token inválido o expirado
 */
router.get(
  '/vendedor/ruta-protegida',
  authenticateJWT,
  checkRole(['vendedor']),
  (req: Request, res: Response) => {
    res.json(success({ message: 'Acceso concedido' }));
  }
);

export default router;
