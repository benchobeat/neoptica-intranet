import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import type { AuthenticatedUser } from '@/types/auth';
import { fail } from '@/utils/response';

/**
 * Middleware de autenticación para rutas protegidas.
 * Compatible con Express 4 y TypeScript estricto.
 * Soporta multirol: user.roles = ['admin', 'optometrista']
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(fail('Token inválido o no enviado'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado en variables de entorno');
    }

    const payload = jwt.verify(token, secret) as jwt.JwtPayload;

    // Validar que el payload contenga los campos requeridos
    if (!payload.id || !payload.email) {
      throw new Error('Token inválido: faltan campos requeridos');
    }

    // Crear el objeto de usuario con tipos seguros
    const user: AuthenticatedUser = {
      id: String(payload.id),
      email: String(payload.email),
      nombreCompleto: String(
        payload.nombre_completo || payload.nombreCompleto || 'Usuario sin nombre'
      ),
      roles: Array.isArray(payload.roles) ? payload.roles : [],
      ...payload, // Incluir el resto de las propiedades del payload
    };

    // Asignar el usuario al request
    req.user = user;

    next();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(401).json(fail(errorMessage));
  }
}

/**
 * Middleware para verificar que el usuario tiene al menos uno de los roles requeridos
 * @param requiredRoles Array de roles permitidos para acceder a la ruta
 * @returns Middleware que verifica los roles del usuario
 */
export function checkRole(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      res.status(401).json(fail('Usuario no autenticado'));
      return;
    }

    // Verificar que el usuario tenga al menos uno de los roles requeridos
    // Hacemos una aserción de tipo para asegurarnos que TypeScript reconozca roles
    const userRoles = (req.user as Express.User).roles || [];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      res.status(403).json(fail('No tienes permisos para acceder a este recurso'));
      return;
    }

    // Usuario tiene al menos uno de los roles requeridos, permitir acceso
    next();
  };
}
