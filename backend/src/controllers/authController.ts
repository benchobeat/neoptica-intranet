import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { success, fail } from '@/utils/response';
import { registrarAuditoria } from "@/utils/auditoria";
import { sendMail } from '@/utils/mailer';

const prisma = new PrismaClient();

/**
 * Solicita un restablecimiento de contraseña generando un token seguro
 * y enviando un correo con instrucciones.
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  let mensajeError = "";

  if (!email) {
    await registrarAuditoria({
      usuarioId: null,
      accion: "forgot_password_fallido",
      descripcion: "Email es requerido",
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "auth",
    });
    res.status(400).json(fail('Email es requerido'));
    return;
  }

  try {
    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // Por seguridad, no revelamos si el email existe o no
    // Siempre devolvemos un mensaje genérico de éxito
    if (!usuario) {
      await registrarAuditoria({
        usuarioId: null,
        accion: "forgot_password_fallido",
        descripcion: `Email no encontrado: ${email}`,
        ip: req.ip,
        entidadTipo: "usuario",
        modulo: "auth",
      });
      
      // Mensaje genérico por seguridad
      res.json(success('Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.'));
      return;
    }

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    // Calcular fecha de expiración (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Guardar el token en la base de datos
    await prisma.reset_token.create({
      data: {
        usuario_id: usuario.id,
        token: resetTokenHash,
        expires_at: expiresAt,
        created_at: new Date()
        // Los campos creado_por y creado_en se manejan automáticamente
      }
    });

    // Construir URL de restablecimiento (frontend)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Contenido del correo
    const mailSubject = 'Restablecimiento de contraseña - Neóptica Intranet';
    const mailHtml = `
      <h1>Restablecimiento de contraseña</h1>
      <p>Hola ${usuario.nombre_completo},</p>
      <p>Has solicitado restablecer tu contraseña para acceder a Neóptica Intranet.</p>
      <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
      <p><a href="${resetUrl}">Restablecer mi contraseña</a></p>
      <p>Este enlace será válido por 24 horas.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu cuenta sigue segura.</p>
      <p>Saludos,<br>Equipo de Neóptica</p>
    `;

    // Enviar correo
    await sendMail({
      to: email,
      subject: mailSubject,
      html: mailHtml,
    });

    // Registrar en auditoría
    await registrarAuditoria({
      usuarioId: usuario.id,
      accion: "forgot_password",
      descripcion: `Solicitud de restablecimiento de contraseña para ${email}`,
      ip: req.ip,
      entidadTipo: "usuario",
      entidadId: usuario.id,
      modulo: "auth",
    });

    res.json(success('Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.'));
  } catch (err) {
    mensajeError = err instanceof Error ? err.message : "Error desconocido";
    console.error("Error en forgot password:", mensajeError);
    
    await registrarAuditoria({
      usuarioId: null,
      accion: "forgot_password_fallido",
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "auth",
    });
    
    // Mensaje genérico por seguridad
    res.json(success('Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.'));
  }
}

/**
 * Valida un token de restablecimiento y permite al usuario
 * establecer una nueva contraseña
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, email, password } = req.body;
  let mensajeError = "";

  if (!token || !email || !password) {
    await registrarAuditoria({
      usuarioId: null,
      accion: "reset_password_fallido",
      descripcion: "Token, email y password son requeridos",
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "auth",
    });
    res.status(400).json(fail('Token, email y password son requeridos'));
    return;
  }

  try {
    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      await registrarAuditoria({
        usuarioId: null,
        accion: "reset_password_fallido",
        descripcion: `Email no encontrado: ${email}`,
        ip: req.ip,
        entidadTipo: "usuario",
        modulo: "auth",
      });
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    // Buscar token activo
    const resetTokenRecord = await prisma.reset_token.findFirst({
      where: {
        usuario_id: usuario.id,
        expires_at: {
          gt: new Date() // No expirado
        },
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!resetTokenRecord) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: "reset_password_fallido",
        descripcion: `Token no encontrado o expirado para ${email}`,
        ip: req.ip,
        entidadTipo: "usuario",
        entidadId: usuario.id,
        modulo: "auth",
      });
      res.status(400).json(fail('Token inválido o expirado'));
      return;
    }

    // Verificar token
    const isValidToken = await bcrypt.compare(token, resetTokenRecord.token);
    if (!isValidToken) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: "reset_password_fallido",
        descripcion: `Token inválido para ${email}`,
        ip: req.ip,
        entidadTipo: "usuario",
        entidadId: usuario.id,
        modulo: "auth",
      });
      res.status(400).json(fail('Token inválido'));
      return;
    }

    // Validar fuerza del password
    if (!passwordFuerte(password)) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: "reset_password_fallido",
        descripcion: `Password débil para ${email}`,
        ip: req.ip,
        entidadTipo: "usuario",
        entidadId: usuario.id,
        modulo: "auth",
      });
      res.status(400).json(fail('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'));
      return;
    }

    // Actualizar contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { 
        password: passwordHash,
        modificado_en: new Date()
        // No incluimos modificado_por ya que espera un UUID
      }
    });

    // Invalidar todos los tokens de restablecimiento
    await prisma.reset_token.updateMany({
      where: { usuario_id: usuario.id },
      data: { 
        expires_at: new Date(),  // Expira ahora
        modificado_en: new Date()
        // No incluimos modificado_por ya que espera un UUID
      }
    });

    // Registrar en auditoría
    await registrarAuditoria({
      usuarioId: usuario.id,
      accion: "reset_password",
      descripcion: `Contraseña restablecida exitosamente para ${email}`,
      ip: req.ip,
      entidadTipo: "usuario",
      entidadId: usuario.id,
      modulo: "auth",
    });

    res.json(success('Contraseña restablecida correctamente'));
  } catch (err) {
    mensajeError = err instanceof Error ? err.message : "Error desconocido";
    console.error("Error en reset password:", mensajeError);
    
    await registrarAuditoria({
      usuarioId: null,
      accion: "reset_password_fallido",
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "auth",
    });
    
    res.status(500).json(fail('Error al restablecer la contraseña'));
  }
}

/**
 * Valida que la contraseña cumpla con los requisitos mínimos de seguridad
 */
function passwordFuerte(password: string): boolean {
  // Mínimo 8 caracteres, una mayúscula, una minúscula y un número
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

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

    // Extraer todos los roles del usuario
    const roles = usuario.usuario_rol?.map(ur => ur.rol.nombre) || ['cliente'];
    
    // console.log(`[DEBUG] Roles obtenidos del usuario: ${JSON.stringify(roles)}`);

    // Asegurar que siempre haya un JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET || 'default-test-secret-key-only-for-testing';
    
    if (!JWT_SECRET) {
      console.error('¡ADVERTENCIA! JWT_SECRET no está configurado. Usando clave predeterminada insegura.');
    }
    
    // Log para debugging en tests
    if (process.env.NODE_ENV === 'test') {
      // console.log(`Generando token JWT para usuario ${usuario.email} con roles: ${JSON.stringify(roles)}`);
    }
    
    // Genera JWT solo con multirol
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        roles // Array con todos los roles del usuario
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // Verificar que se generó el token correctamente
    if (!token) {
      // console.error('Error: No se pudo generar el token JWT');
      throw new Error('No se pudo generar el token JWT');
    }

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
        roles // Array completo de roles
        // otros campos públicos si los necesitas
      }
    }));

  } catch (err) {
    mensajeError = err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json(fail(mensajeError));
  }
}
