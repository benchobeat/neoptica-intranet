import crypto from 'crypto';


import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import prisma from '@/utils/prisma';
import { registrarAuditoria } from '@/utils/audit';
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
    await registrarAuditoria({
      usuarioId: null,
      accion: 'forgot_password_fallido',
      descripcion: {
        mensaje: 'Solicitud de restablecimiento de contraseña fallida',
        error: 'Email es requerido',
        email: null,
        timestamp: new Date().toISOString()
      },
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'auth',
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
        accion: 'forgot_password_fallido',
        descripcion: {
          mensaje: 'Intento de restablecimiento con email no registrado',
          email: email,
          timestamp: new Date().toISOString(),
          accion: 'EMAIL_NO_ENCONTRADO'
        },
        ip: req.ip,
        entidadTipo: 'usuario',
        modulo: 'auth',
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
    await registrarAuditoria({
      usuarioId: usuario.id,
      accion: 'forgot_password_solicitud',
      descripcion: {
        mensaje: 'Solicitud de restablecimiento de contraseña procesada',
        email: email,
        usuarioId: usuario.id,
        tokenGenerado: true,
        timestamp: new Date().toISOString(),
        detalles: {
          metodo: 'email',
          expiracion: expiresAt.toISOString()
        }
      },
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuario.id,
      modulo: 'auth',
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
    
    await registrarAuditoria({
      usuarioId: null,
      accion: 'forgot_password_error',
      descripcion: {
        mensaje: 'Error al procesar la solicitud de restablecimiento de contraseña',
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        email: email,
        timestamp: new Date().toISOString(),
        detalles: {
          tipoError: errorName
        }
      },
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'auth',
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
    await registrarAuditoria({
      usuarioId: null,
      accion: 'reset_password_fallido',
      descripcion: {
        mensaje: 'Faltan campos requeridos para restablecer la contraseña',
        error: 'Token, email y password son requeridos',
        camposFaltantes: [
          !token ? 'token' : null,
          !email ? 'email' : null,
          !password ? 'password' : null
        ].filter(Boolean),
        timestamp: new Date().toISOString()
      },
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'auth',
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
        accion: 'reset_password_fallido',
        descripcion: {
          mensaje: 'Intento de restablecimiento con email no registrado',
          email: email,
          accion: 'USUARIO_NO_ENCONTRADO',
          timestamp: new Date().toISOString()
        },
        ip: req.ip,
        entidadTipo: 'usuario',
        modulo: 'auth',
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
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: 'reset_password_fallido',
        descripcion: {
          mensaje: 'Intento de restablecimiento con token inválido o expirado',
          email: email,
          usuarioId: usuario.id,
          accion: 'TOKEN_INVALIDO_O_EXPIRADO',
          timestamp: new Date().toISOString(),
          detalles: {
            razon: 'No se encontró un token activo o ha expirado',
            tiempoRestante: '0 segundos'
          }
        },
        ip: req.ip,
        entidadTipo: 'usuario',
        entidadId: usuario.id,
        modulo: 'auth',
      });
      res.status(400).json(fail('Token inválido o expirado'));
      return;
    }

    // Verificar token
    const isValidToken = await bcrypt.compare(token, resetTokenRecord.token);
    if (!isValidToken) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: 'reset_password_fallido',
        descripcion: {
          mensaje: 'Intento de restablecimiento con token inválido',
          email: email,
          usuarioId: usuario.id,
          accion: 'TOKEN_INVALIDO',
          timestamp: new Date().toISOString(),
          detalles: {
            razon: 'El token proporcionado no coincide con ningún token válido',
            longitudToken: token.length
          }
        },
        ip: req.ip,
        entidadTipo: 'usuario',
        entidadId: usuario.id,
        modulo: 'auth',
      });
      res.status(400).json(fail('Token inválido'));
      return;
    }

    // Validar fuerza del password
    if (!passwordFuerte(password)) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: 'reset_password_fallido',
        descripcion: {
          mensaje: 'Intento de restablecimiento con contraseña débil',
          email: email,
          usuarioId: usuario.id,
          accion: 'PASSWORD_DEBIL',
          timestamp: new Date().toISOString(),
          detalles: {
            requisitosCumplidos: {
              longitudMinima: password.length >= 8,
              contieneMayuscula: /[A-Z]/.test(password),
              contieneMinuscula: /[a-z]/.test(password),
              contieneNumero: /\d/.test(password)
            },
            longitud: password.length
          }
        },
        ip: req.ip,
        entidadTipo: 'usuario',
        entidadId: usuario.id,
        modulo: 'auth',
      });
      res
        .status(400)
        .json(
          fail(
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
          )
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
    await registrarAuditoria({
      usuarioId: usuario.id,
      accion: 'reset_password_exitoso',
      descripcion: {
        mensaje: 'Contraseña restablecida exitosamente',
        email: email,
        usuarioId: usuario.id,
        accion: 'CONTRASENA_RESTABLECIDA',
        timestamp: new Date().toISOString(),
        detalles: {
          metodo: 'email',
          longitudNuevaContrasena: password.length,
          requisitosCumplidos: {
            longitudMinima: password.length >= 8,
            contieneMayuscula: /[A-Z]/.test(password),
            contieneMinuscula: /[a-z]/.test(password),
            contieneNumero: /\d/.test(password)
          }
        }
      },
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuario.id,
      modulo: 'auth',
    });

    res.json(success('Contraseña restablecida correctamente'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'ErrorDesconocido';
    
    console.error('Error en reset password:', errorMessage);

    await registrarAuditoria({
      usuarioId: null,
      accion: 'reset_password_error',
      descripcion: {
        mensaje: 'Error al procesar el restablecimiento de contraseña',
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        email: email,
        timestamp: new Date().toISOString(),
        detalles: {
          tipoError: errorName,
          accion: 'ERROR_RESTABLECIMIENTO_CONTRASENA'
        }
      },
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'auth',
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
    await registrarAuditoria({
      usuarioId: null,
      accion: 'login_fallido',
      descripcion: {
        mensaje: 'Intento de inicio de sesión sin credenciales completas',
        error: 'Email y password son requeridos',
        camposFaltantes: [
          !email ? 'email' : null,
          !password ? 'password' : null
        ].filter(Boolean),
        timestamp: new Date().toISOString(),
        ip: req.ip
      },
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'auth',
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
      await registrarAuditoria({
        usuarioId: null,
        accion: 'login_fallido',
        descripcion: {
          mensaje: 'Intento de inicio de sesión fallido',
          error: 'Usuario no encontrado',
          email: email,
          accion: 'USUARIO_NO_ENCONTRADO',
          timestamp: new Date().toISOString(),
          ip: req.ip,
          detalles: {
            razon: 'No existe un usuario con el email proporcionado'
          }
        },
        ip: req.ip,
        entidadTipo: 'usuario',
        modulo: 'auth',
      });
      res.status(401).json(fail(mensajeError));
      return;
    }

    if (usuario.activo === false) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: 'login_fallido',
        descripcion: {
          mensaje: 'Intento de inicio de sesión fallido - Usuario inactivo',
          error: 'El usuario está inactivo',
          email: usuario.email,
          usuarioId: usuario.id,
          accion: 'USUARIO_INACTIVO',
          timestamp: new Date().toISOString(),
          ip: req.ip,
          detalles: {
            estado: 'inactivo',
            ultimoAcceso: 'No disponible' // Campo no existe en el modelo
          }
        },
        ip: req.ip,
        entidadTipo: 'usuario',
        entidadId: usuario.id,
        modulo: 'auth',
      });
      res.status(403).json(fail('El usuario está inactivo. Contacte al administrador.'));
      return;
    }

    if (!usuario.password) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: 'login_fallido',
        descripcion: {
          mensaje: 'Intento de inicio de sesión fallido - Sin contraseña local',
          error: 'El usuario no tiene contraseña local configurada',
          email: usuario.email,
          usuarioId: usuario.id,
          accion: 'SIN_PASSWORD_LOCAL',
          timestamp: new Date().toISOString(),
          ip: req.ip,
          detalles: {
            metodosAlternativos: ['login_social', 'recuperar_cuenta'],
            ultimoAcceso: 'No disponible' // Campo no existe en el modelo
          }
        },
        ip: req.ip,
        entidadTipo: 'usuario',
        entidadId: usuario.id,
        modulo: 'auth',
      });
      res
        .status(401)
        .json(fail('Usuario sin password local. Usa login social o recupera la cuenta.'));
      return;
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      await registrarAuditoria({
        usuarioId: usuario.id,
        accion: 'login_fallido',
        descripcion: {
          mensaje: 'Intento de inicio de sesión fallido - Contraseña incorrecta',
          error: 'Credenciales inválidas',
          email: usuario.email,
          usuarioId: usuario.id,
          accion: 'PASSWORD_INCORRECTO',
          timestamp: new Date().toISOString(),
          ip: req.ip,
          detalles: {
            intentosFallidos: 'No disponible', // Campo no existe en el modelo
            ultimoIntentoFallido: new Date().toISOString(),
            bloqueoTemporal: 'No disponible' // No tenemos información de bloqueo
          }
        },
        ip: req.ip,
        entidadTipo: 'usuario',
        entidadId: usuario.id,
        modulo: 'auth',
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
    await registrarAuditoria({
      usuarioId: usuario.id,
      accion: 'login_exitoso',
      descripcion: {
        mensaje: 'Inicio de sesión exitoso',
        email: usuario.email,
        usuarioId: usuario.id,
        accion: 'LOGIN_EXITOSO',
        timestamp: new Date().toISOString(),
        ip: req.ip,
        detalles: {
          metodo: 'email',
          usuario: {
            nombre: usuario.nombreCompleto,
            email: usuario.email,
            activo: usuario.activo,
            fechaCreacion: usuario.creadoEn?.toISOString(),
            ultimoAcceso: new Date().toISOString(), // Usamos la fecha actual como último acceso
            nota: 'Los campos de seguimiento de acceso no están implementados en el modelo de Usuario'
          },
          roles: rolesUsuario,
          metadatos: {
            userAgent: req.headers['user-agent'],
            contentType: req.headers['content-type']
          }
        }
      },
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuario.id,
      modulo: 'auth',
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
    mensajeError = err instanceof Error ? err.message : 'Error desconocido';
    
    await registrarAuditoria({
      usuarioId: null,
      accion: 'login_error',
      descripcion: {
        mensaje: 'Error durante el proceso de inicio de sesión',
        error: mensajeError,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
        detalles: {
          emailIntentado: email,
          ip: req.ip
        }
      },
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'auth',
    });
    
    res.status(500).json(fail('Error interno del servidor al procesar el inicio de sesión'));
  }
}
