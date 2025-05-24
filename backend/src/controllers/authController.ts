import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { success, fail } from '@/utils/response';

const prisma = new PrismaClient();

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json(fail('Email y password son requeridos'));
    return;
  }

  try {
    // Busca el usuario e incluye sus roles
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        usuario_rol: { include: { rol: true } }
      }
    });
    
    if (usuario.activo === false) {
      res.status(403).json(fail('El usuario está inactivo. Contacte al administrador.'));
      return;
    }

    if (!usuario) {
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    if (!usuario.password) {
      res.status(401).json(fail('Usuario sin password local. Usa login social o recupera la cuenta.'));
      return;
    }

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      res.status(401).json(fail('Password incorrecto'));
      return;
    }

    // Rol principal (puedes ajustar si soportas varios roles por usuario)
    const rol = usuario.usuario_rol?.[0]?.rol?.nombre || 'usuario';

    // Genera JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        rol
      },
      process.env.JWT_SECRET || 'cambia-esto-en-produccion',
      { expiresIn: '8h' }
    );

    // Limpia la respuesta
    const { password: _, ...usuarioSafe } = usuario;

    res.json(success({
      token,
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        rol
    // otros campos públicos si los necesitas
      }
    }));

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}
