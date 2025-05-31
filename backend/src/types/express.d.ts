import { usuario } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends usuario {}
    interface Request {
      user?: User;
    }
  }
}
