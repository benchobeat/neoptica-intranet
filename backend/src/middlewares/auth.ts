// backend/src/middlewares/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { fail } from '@/utils/response';

/**
 * Middleware de autenticación para rutas protegidas.
 * Compatible con Express 4 y TypeScript estricto.
 * Soporta multirol: user.roles = ['admin', 'optometrista']
 * NO retorna nada explícitamente.
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
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
    
    // Garantizar que exista el array de roles en req.user
    if (!Array.isArray(payload.roles)) {
      // Si no hay array de roles, utilizar un array vacío
      payload.roles = [];
    }
    
    // console.log(`[DEBUG] Token decodificado. Roles: ${JSON.stringify(payload.roles)}`);
    
    // Asignar payload al request
    (req as any).user = payload;
    
    next();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(401).json(fail(errorMessage));
    return;
  }
}
