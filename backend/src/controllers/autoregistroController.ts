import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { success, fail } from '@/utils/response';
import { registrarAuditoria } from '@/utils/auditoria';

const prisma = new PrismaClient();

/**
 * Permite el autoregistro de usuarios con el rol 'cliente'.
 * Solo se permite crear usuarios con el rol 'cliente' mediante este endpoint.
 * Puede ser usado por formulario tradicional o por redes sociales.
 */
export async function autoregistroCliente(req: Request, res: Response): Promise<void> {
  const { nombre_completo, email, password, telefono, proveedor_oauth, oauth_id } = req.body;
  let mensajeError = '';
  // console.log("[autoregistroCliente] INICIO", { nombre_completo, email, proveedor_oauth, oauth_id });

  // Validación mínima para registro tradicional
  if (!proveedor_oauth && (!nombre_completo || !email || !password)) {
    mensajeError = 'Faltan datos obligatorios';
    // console.log("[autoregistroCliente] ERROR: ", mensajeError);
    res.status(400).json(fail(mensajeError));
    return;
  }

  // Validación mínima para registro social
  if (proveedor_oauth && (!email || !oauth_id)) {
    mensajeError = 'Faltan datos obligatorios para registro social';
    // console.log("[autoregistroCliente] ERROR: ", mensajeError);
    res.status(400).json(fail(mensajeError));
    return;
  }

  // Solo permite el rol cliente
  const roles = ['cliente'];

  try {
    // Verifica email único
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      mensajeError = 'Ya existe un usuario con ese email';
      // console.log("[autoregistroCliente] ERROR: ", mensajeError);
      res.status(409).json(fail(mensajeError));
      return;
    }

    let hashPassword = null;
    if (password) {
      // Registro tradicional
      hashPassword = await bcrypt.hash(password, 10);
    }

    // Crea el usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre_completo: nombre_completo || email,
        email,
        password: hashPassword,
        telefono,
        activo: true,
        proveedor_oauth: proveedor_oauth || null,
        oauth_id: oauth_id || null,
        usuario_rol: {
          create: { rol: { connect: { nombre: roles[0] } } },
        },
      },
      include: { usuario_rol: { include: { rol: true } } },
    });
    // console.log("[autoregistroCliente] USUARIO CREADO", usuario.id);

    // Registrar auditoría
    await registrarAuditoria({
      usuarioId: usuario.id,
      accion: 'autoregistro_cliente',
      descripcion: `Nuevo cliente registrado: ${usuario.email} (${proveedor_oauth || 'formulario'})`,
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuario.id,
      modulo: 'usuarios',
    });
    // console.log("[autoregistroCliente] AUDITORIA REGISTRADA", usuario.id);

    res.status(201).json(success({
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      roles: ['cliente'],
      proveedor_oauth: usuario.proveedor_oauth,
    }));
    // console.log("[autoregistroCliente] FIN OK", usuario.id);
  } catch (err) {
    mensajeError = err instanceof Error ? err.message : 'Error desconocido';
    // console.log("[autoregistroCliente] ERROR CATCH: ", mensajeError, err);
    res.status(500).json(fail(mensajeError));
  }
}
