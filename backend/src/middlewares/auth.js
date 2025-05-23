// backend/src/middlewares/auth.js

const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

/**
 * Middleware de autenticación para rutas protegidas.
 * Requiere el header: Authorization: Bearer <token>
 */
function authenticateJWT(req, res, next) {
  // 1. Extraer el token del header Authorization
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(fail('Token inválido o no enviado'));
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verificar el token con la clave secreta de tu .env
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado en variables de entorno');
    }
    const payload = jwt.verify(token, secret);
    req.user = payload; // Adjunta el usuario autenticado al request
    next();
  } catch (err) {
    return res.status(401).json(fail('Token inválido o expirado'));
  }
}

module.exports = { authenticateJWT };
