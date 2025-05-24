import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { success, fail } from '@/utils/response';

const prisma = new PrismaClient();

/**
 * POST /api/auth/login
 * Recibe: { email, password }
 * Responde: { ok, data: { token, usuario }, error }
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  // Validación simple de entrada
  if (!email || !password) {
    res.status(400).json(fail('Email y password son requeridos'));
    return;
  }

  try {
    // 1. Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
  where: { email },
  include: {
    usuario_rol: {
      include: { rol: true }
    }
  }
});
    if (!usuario) {
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    // 2. Verificar password (bcrypt)
    if (!usuario.password) {
      res.status(401).json(fail('Usuario sin password local. Usa login social o recupera la cuenta.'));
      return;
    }

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      res.status(401).json(fail('Password incorrecto'));
      return;
    }

    // 3. Generar JWT
    const token = jwt.sign(
  {
    id: usuario.id,
    email: usuario.email,
    nombre_completo: usuario.nombre_completo,
    rol: usuario.usuario_rol?.[0]?.rol?.nombre || 'usuario', // ahora sí existe!
  },
  process.env.JWT_SECRET || 'cambia-esto-en-produccion',
  { expiresIn: '8h' }
);

    // 4. Construir la respuesta, sin incluir password
    const usuarioSafe = { ...usuario, password: undefined };

    res.json(
      success({
        token,
        usuario: usuarioSafe,
      })
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}
