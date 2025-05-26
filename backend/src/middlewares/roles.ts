import { Request, Response, NextFunction } from 'express';
import { fail } from '@/utils/response';

/**
 * Middleware para proteger rutas según roles.
 * Uso: router.get(..., requireRole('admin', 'optometrista'), handler)
 */
export function requireRole(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRol = (req as any).user?.rol;

    if (!userRol) {
      return res.status(401).json(fail('Token sin información de rol'));
    }

    if (!rolesPermitidos.includes(userRol)) {
      return res.status(403).json(fail('Acceso denegado: se requiere rol adecuado'));
    }

    next();
  };
}
