import { Router, Request, Response } from 'express';
import passport from '@/config/passport';
import jwt from 'jsonwebtoken';
import { login } from '@/controllers/authController';

const router = Router();

function issueJWT(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.usuario_rol?.[0]?.rol?.nombre || 'cliente' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

// --- Google OAuth ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req: Request, res: Response) => {
    const token = issueJWT((req as any).user);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

// --- Facebook OAuth ---
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req: Request, res: Response) => {
    const token = issueJWT((req as any).user);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

// --- Instagram OAuth ---
router.get('/instagram', passport.authenticate('instagram'));
router.get('/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: '/login', session: false }),
  (req: Request, res: Response) => {
    const token = issueJWT((req as any).user);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

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
