import type { Request } from 'express';

interface UserPayload {
  id: string;
  nombreCompleto: string;
  email: string;
}

export interface RequestWithUser extends Request {
  usuario?: UserPayload;
  user?: UserPayload;
}

export const getUserId = (req: Request): string | undefined => {
  const reqWithUser = req as RequestWithUser;
  return reqWithUser.usuario?.id || reqWithUser.user?.id;
};
