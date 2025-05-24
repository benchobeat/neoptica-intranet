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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         nombre_completo:
 *                           type: string
 *                         email:
 *                           type: string
 *                         rol:
 *                           type: string
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Datos incompletos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Password incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', login);

export default router;
