import { Router } from 'express';
import { login } from '@/controllers/authController';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuario (genera JWT)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@neoptica.com
 *               password:
 *                 type: string
 *                 example: Admin1234!
 *     responses:
 *       200:
 *         description: Login exitoso, retorna token y usuario
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: Password incorrecto
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/login', login);

export default router;
