import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { success, fail } from '@/utils/response';
import { registrarAuditoria } from "@/utils/auditoria";

const prisma = new PrismaClient();

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  let mensajeError = "";

  if (!email || !password) {
    await registrarAuditoria({
      usuarioId: null,
      accion: "login_fallido",
      descripcion: "Email y password son requeridos",
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "auth",
    });
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
    
    if (!usuario) {
      mensajeError = "Credenciales inválidas o usuario inactivo";
      await registrarAuditoria({
        usuarioId: "desconocido",
        accion: "login_fallido",
        descripcion: `Intento de login fallido para email: ${email}`,
        ip: req.ip,
        entidadTipo: "usuario",
        modulo: "auth",
      });
      res.status(401).json(fail(mensajeError));
      return;
    }

    if (usuario.activo === false) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: "login_fallido",
        descripcion: `Intento de login fallido (usuario inactivo): ${usuario.email}`,
        ip: req.ip,
        entidadTipo: "usuario",
        entidadId: usuario.id,
        modulo: "auth",
      });
      res.status(403).json(fail('El usuario está inactivo. Contacte al administrador.'));
      return;
    }

    if (!usuario.password) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: "login_fallido",
        descripcion: `Intento de login fallido (sin password local): ${usuario.email}`,
        ip: req.ip,
        entidadTipo: "usuario",
        entidadId: usuario.id,
        modulo: "auth",
      });
      res.status(401).json(fail('Usuario sin password local. Usa login social o recupera la cuenta.'));
      return;
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: "login_fallido",
        descripcion: `Intento de login fallido (password incorrecto): ${usuario.email}`,
        ip: req.ip,
        entidadTipo: "usuario",
        entidadId: usuario.id,
        modulo: "auth",
      });
      mensajeError = "Credenciales inválidas";
      res.status(401).json(fail(mensajeError));
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

    // Registrar log de acceso exitoso
    await registrarAuditoria({
      usuarioId: usuario.id,
      accion: "login_exitoso",
      descripcion: `Usuario accedió al sistema: ${usuario.email}`,
      ip: req.ip,
      entidadTipo: "usuario",
      entidadId: usuario.id,
      modulo: "auth",
    });

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
    mensajeError = err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json(fail(mensajeError));
  }
}
