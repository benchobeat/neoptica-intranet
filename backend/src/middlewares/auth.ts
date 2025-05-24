import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { fail } from '@/utils/response';

/**
 * Middleware de autenticación para rutas protegidas.
 * Requiere el header: Authorization: Bearer <token>
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(fail('Token inválido o no enviado'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado en variables de entorno');
    }
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json(fail('Token inválido o expirado'));
  }
}
