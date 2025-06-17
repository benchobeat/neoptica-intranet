import crypto from 'crypto';


import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import prisma from '@/utils/prisma';
import { logSuccess, logError } from '@/utils/audit';
import { sendMail } from '@/utils/mailer';
import { success, fail } from '@/utils/response';

/**
 * Solicita un restablecimiento de contraseña generando un token seguro
 * y enviando un correo con instrucciones.
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  let mensajeError = '';

  if (!email) {
    await logError({
      userId: null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'forgotPassword',
      action: 'error_forgot_password',
      message: 'Solicitud de restablecimiento de contraseña fallida - Email es requerido',
      error: new Error('Email es requerido. 400'),
      context: {
        email: null
      }
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
      await logError({
        userId: null,
        ip: req.ip,
        entityType: 'usuario',
        module: 'forgotPassword',
        action: 'error_forgot_password',
        message: 'Intento de restablecimiento con email no registrado',
        error: new Error('Email no encontrado'),
        context: {
          email,
        }
      });

      // Mensaje genérico por seguridad
      res.json(
        success(
          'Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.'
        )
      );
      return;
    }

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    // Calcular fecha de expiración (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Guardar el token en la base de datos
    await prisma.resetToken.create({
      data: {
        usuarioId: usuario.id,
        token: resetTokenHash,
        expiresAt,
        createdAt: new Date(),
        // Los campos creado_por y creado_en se manejan automáticamente
      },
    });

    // Construir URL de restablecimiento (frontend)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Contenido del correo
    const mailSubject = 'Restablecimiento de contraseña - Neóptica Intranet';
    const mailHtml = `
      <h1>Restablecimiento de contraseña</h1>
      <p>Hola ${usuario.nombreCompleto},</p>
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

    // Registrar auditoría de éxito
    await logSuccess({
      userId: usuario.id,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuario.id,
      module: 'forgotPassword',
      action: 'forgot_password_solicitud_exitoso',
      message: 'Solicitud de restablecimiento de contraseña procesada',
      details: {
        email,
        tokenGenerado: true,
        metodo: 'email',
        expiracion: expiresAt.toISOString()
      }
    });

    res.json(
      success(
        'Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.'
      )
    );
  } catch (error) {
    console.error('Error en forgot password:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'ErrorDesconocido';
    
    await logError({
      userId: null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'auth',
      action: 'error_forgot_password',
      message: 'Error al procesar la solicitud de restablecimiento de contraseña',
      error: error instanceof Error ? error : new Error(errorMessage),
      context: {
        email,
        tipoError: errorName,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      }
    });

    // Mensaje genérico por seguridad
    res.json(
      success(
        'Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.'
      )
    );
  }
}

/**
 * Valida un token de restablecimiento y permite al usuario
 * establecer una nueva contraseña
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, email, password } = req.body;
  let mensajeError = '';

  if (!token || !email || !password) {
    const camposFaltantes = [
      !token ? 'token' : null,
      !email ? 'email' : null,
      !password ? 'password' : null
    ].filter(Boolean);
    
    await logError({
      userId: null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'resetPassword',
      action: 'error_reset_password',
      message: 'Faltan campos requeridos para restablecer la contraseña',
      error: new Error('Token, email y password son requeridos. 400'),
      context: {
        camposFaltantes
      }
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
      await logError({
        userId: null,
        ip: req.ip,
        entityType: 'usuario',
        module: 'resetPassword',
        action: 'error_reset_password',
        message: 'Intento de restablecimiento con email no registrado',
        error: new Error('Usuario no encontrado. 404'),
        context: {
          email
        }
      });
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    // Buscar token activo
    const resetTokenRecord = await prisma.resetToken.findFirst({
      where: {
        usuarioId: usuario.id,
        expiresAt: {
          gt: new Date(), // No expirado
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!resetTokenRecord) {
      await logError({
        userId: usuario.id,
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuario.id,
        module: 'resetPassword',
        action: 'error_reset_password',
        message: 'Intento de restablecimiento con token inválido o expirado',
        error: new Error('Token inválido o expirado. 400'),
        context: {
          email,
          razon: 'No se encontró un token activo o ha expirado',
          tiempoRestante: '0 segundos'
        }
      });
      res.status(400).json(fail('Token inválido o expirado'));
      return;
    }

    // Verificar token
    const isValidToken = await bcrypt.compare(token, resetTokenRecord.token);
    if (!isValidToken) {
      await logError({
        userId: usuario.id,
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuario.id,
        module: 'resetPassword',
        action: 'reset_password_fallido',
        message: 'Intento de restablecimiento con token inválido',
        error: new Error('Token inválido. 400'),
        context: {
          email,
          razon: 'El token proporcionado no coincide con ningún token válido',
          longitudToken: token.length
        }
      });
      res.status(400).json(fail('Token inválido'));
      return;
    }

    // Validar fuerza del password
    if (!passwordFuerte(password)) {
      const requisitosCumplidos = {
        longitudMinima: password.length >= 8,
        contieneMayuscula: /[A-Z]/.test(password),
        contieneMinuscula: /[a-z]/.test(password),
        contieneNumero: /\d/.test(password)
      };
      
      await logError({
        userId: usuario.id,
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuario.id,
        module: 'resetPassword',
        action: 'error_reset_password',
        message: 'Intento de restablecimiento con contraseña débil',
        error: new Error('Contraseña no cumple con los requisitos de seguridad. 400'),
        context: {
          email,
          requisitosCumplidos,
          longitud: password.length
        }
      });
      
      res.status(400).json(
        fail('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número')
      );
      return;
    }

    // Actualizar contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: passwordHash,
        modificadoEn: new Date(),
        // No incluimos modificado_por ya que espera un UUID
      },
    });

    // Invalidar todos los tokens de restablecimiento
    await prisma.resetToken.updateMany({
      where: { usuarioId: usuario.id },
      data: {
        expiresAt: new Date(), // Expira ahora
        modificadoEn: new Date(),
        // No incluimos modificado_por ya que espera un UUID
      },
    });

    // Registrar en auditoría
    const requisitosCumplidos = {
      longitudMinima: password.length >= 8,
      contieneMayuscula: /[A-Z]/.test(password),
      contieneMinuscula: /[a-z]/.test(password),
      contieneNumero: /\d/.test(password)
    };
    
    await logSuccess({
      userId: usuario.id,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuario.id,
      module: 'resetPassword',
      action: 'reset_password_exitoso',
      message: 'Contraseña restablecida exitosamente',
      details: {
        email,
        metodo: 'email',
        longitudNuevaContrasena: password.length,
        requisitosCumplidos
      }
    });

    res.json(success('Contraseña restablecida correctamente'));
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Error desconocido durante el restablecimiento de contraseña');
    console.error('Error en reset password:', errorObj.message);

    await logError({
      userId: null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'resetPassword',
      action: 'reset_password_error',
      message: 'Error al procesar el restablecimiento de contraseña',
      error: errorObj,
      context: {
        email,
        tipoError: errorObj.name,
        stack: process.env.NODE_ENV === 'development' ? errorObj.stack : undefined
      }
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
  let mensajeError = '';

  if (!email || !password) {
    const camposFaltantes = [
      !email ? 'email' : null,
      !password ? 'password' : null
    ].filter(Boolean);
    
    await logError({
      userId: null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'login',
      action: 'login_fallido',
      message: 'Intento de inicio de sesión sin credenciales completas',
      error: new Error('Email y password son requeridos. 400'),
      context: {
        camposFaltantes,
        email: email || null
      }
    });
    
    res.status(400).json(fail('Email y password son requeridos'));
    return;
  }

  try {
    // Busca el usuario e incluye sus roles
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    if (!usuario) {
      mensajeError = 'Credenciales inválidas o usuario inactivo';
      await logError({
        userId: null,
        ip: req.ip,
        entityType: 'usuario',
        module: 'login',
        action: 'login_fallido',
        message: 'Intento de inicio de sesión fallido - Usuario no encontrado',
        error: new Error('Usuario no encontrado. 401'),
        context: {
          email
        }
      });
      res.status(401).json(fail(mensajeError));
      return;
    }

    if (usuario.activo === false) {
      await logError({
        userId: usuario.id,
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuario.id,
        module: 'login',
        action: 'login_fallido',
        message: 'Intento de inicio de sesión fallido - Usuario inactivo',
        error: new Error('El usuario está inactivo. 403'),
        context: {
          email: usuario.email
        }
      });
      res.status(403).json(fail('El usuario está inactivo. Contacte al administrador.'));
      return;
    }

    if (!usuario.password) {
      await logError({
        userId: usuario.id,
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuario.id,
        module: 'login',
        action: 'login_fallido',
        message: 'Intento de inicio de sesión fallido - Sin contraseña local',
        error: new Error('El usuario no tiene contraseña local configurada. 401'),
        context: {
          email: usuario.email
        }
      });
      res.status(401).json(fail('Usuario sin password local. Usa login social o recupera la cuenta.'));
      return;
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      await logError({
        userId: usuario.id,
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuario.id,
        module: 'login',
        action: 'login_fallido',
        message: 'Intento de inicio de sesión fallido - Contraseña incorrecta',
        error: new Error('Credenciales inválidas. 401'),
        context: {
          email: usuario.email,
          ultimoIntentoFallido: new Date().toISOString()
        }
      });
      mensajeError = 'Credenciales inválidas';
      res.status(401).json(fail(mensajeError));
      return;
    }

    // Extraer todos los roles del usuario
    const roles = usuario.roles?.map((ur) => ur.rol.nombre) || ['cliente'];

    // console.log(`[DEBUG] Roles obtenidos del usuario: ${JSON.stringify(roles)}`);

    // Asegurar que siempre haya un JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET || 'default-test-secret-key-only-for-testing';

    if (!JWT_SECRET) {
      console.error(
        '¡ADVERTENCIA! JWT_SECRET no está configurado. Usando clave predeterminada insegura.'
      );
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
        nombreCompleto: usuario.nombreCompleto,
        roles, // Array con todos los roles del usuario
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Verificar que se generó el token correctamente
    if (!token) {
      // console.error('Error: No se pudo generar el token JWT');
      throw new Error('No se pudo generar el token JWT');
    }

    // Actualizar el usuario (usar modificadoEn como referencia de último acceso)
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { 
        modificadoEn: new Date()
      },
    });

    // Obtener roles del usuario para incluirlos en el log
    const rolesUsuario = usuario.roles.map(ur => ({
      id: ur.rol.id,
      nombre: ur.rol.nombre,
      descripcion: ur.rol.descripcion
    }));

    // Registrar login exitoso
    await logSuccess({
      userId: usuario.id,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuario.id,
      module: 'login',
      action: 'login_exitoso',
      message: 'Inicio de sesión exitoso',
      details: {
        email: usuario.email,
        metodo: 'email',
        usuario: {
          nombre: usuario.nombreCompleto,
          email: usuario.email,
          activo: usuario.activo,
          fechaCreacion: usuario.creadoEn?.toISOString(),
          ultimoAcceso: new Date().toISOString(),
        },
        roles: rolesUsuario,
        metadatos: {
          userAgent: req.headers['user-agent'],
          contentType: req.headers['content-type']
        }
      }
    });

    // La respuesta ya está siendo limpiada en el objeto de retorno

    res.json(
      success({
        token,
        usuario: {
          id: usuario.id,
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          roles, // Array completo de roles
          // otros campos públicos si los necesitas
        },
      })
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Error desconocido durante el inicio de sesión');
    mensajeError = error.message;
    
    await logError({
      userId: null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'login',
      action: 'login_error',
      message: 'Error durante el proceso de inicio de sesión',
      error,
      context: {
        emailIntentado: email
      }
    });
    
    res.status(500).json(fail('Error interno del servidor al procesar el inicio de sesión'));
  }
}
