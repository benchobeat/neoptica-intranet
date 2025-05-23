import express from 'express';
import { authenticateJWT } from './middlewares/auth'; // ajusta la ruta si es necesario
import { success } from './utils/response';

const router = express.Router();

router.get('/protegido', authenticateJWT, (req, res) => {
  // El usuario autenticado estará en req.user
  return res.json(success((req as any).user));
});

export default router;
