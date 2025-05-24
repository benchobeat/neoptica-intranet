import { Router, Request, Response } from 'express';
import { authenticateJWT } from '@/middlewares/auth';
import { success } from '@/utils/response';

const router = Router();

router.get('/protegido', authenticateJWT, (req: Request, res: Response): void => {
  res.json(success((req as any).user));
});

export default router;
