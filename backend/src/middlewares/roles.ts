import { Request, Response, NextFunction } from 'express';
import { fail } from '@/utils/response';

/**
 * Middleware para proteger rutas según roles.
 * Uso: router.get(..., requireRole('admin', 'optometrista'), handler)
 * Trabaja exclusivamente con el array de roles: user.roles = ['admin', 'optometrista']
 */
export function requireRole(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user || {};
    // Usar exclusivamente el formato de array de roles
    const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [];

    // Si está autenticado pero no tiene roles, consideramos que es un problema de autorización (403)
    // no de autenticación (401)
    if (!userRoles.length) {
      return res.status(403).json(fail('Acceso denegado: se requiere rol adecuado'));
    }

    // Permitir acceso si tiene al menos uno de los roles requeridos
    const tienePermiso = userRoles.some((r) => rolesPermitidos.includes(r));
    if (!tienePermiso) {
      return res.status(403).json(fail('Acceso denegado: se requiere rol adecuado'));
    }

    next();
  };
}
