import type { Request, Response, NextFunction } from 'express';

import { fail } from '@/utils/response';

/**
 * Middleware para proteger rutas según roles.
 * Uso: router.get(..., requireRole('admin', 'optometrista'), handler)
 * Trabaja exclusivamente con el array de roles: user.roles = ['admin', 'optometrista']
 */
export function requireRole(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verificar que el usuario esté autenticado y tenga roles definidos
    if (!req.user || !Array.isArray((req.user as any).roles)) {
      return res.status(403).json(fail('Acceso denegado: usuario no autenticado o sin roles'));
    }

    const userRoles = (req.user as any).roles as string[];

    // Si el usuario no tiene roles, denegar acceso
    if (userRoles.length === 0) {
      return res.status(403).json(fail('Acceso denegado: se requiere rol adecuado'));
    }

    // Verificar si el usuario tiene al menos uno de los roles requeridos
    const tienePermiso = userRoles.some((rol) => rolesPermitidos.includes(rol));
    if (!tienePermiso) {
      return res
        .status(403)
        .json(
          fail(
            `Acceso denegado: se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
          )
        );
    }

    next();
  };
}
