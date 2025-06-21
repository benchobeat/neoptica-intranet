import { Router } from 'express';
import type { Request, Response } from 'express';

import { authenticateJWT } from '@/middlewares/auth';
import type { RequestWithUser } from '@/utils/requestUtils';
import { success } from '@/utils/response';

const router = Router();

router.get('/protegido', authenticateJWT, (req: Request, res: Response): void => {
  const requestWithUser = req as RequestWithUser;
  res.json(success(requestWithUser.user));
});

export default router;
