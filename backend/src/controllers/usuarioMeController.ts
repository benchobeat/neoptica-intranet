import type { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';

import { logSuccess, logError } from '@/utils/audit';
import prisma from '@/utils/prisma';
import { getUserId } from '@/utils/requestUtils';
import { success, fail } from '@/utils/response';
import { telefonoValido, passwordFuerte } from '@/utils/validacions';

/**
 * Obtiene el perfil del usuario autenticado
 */
export async function obtenerPerfilUsuario(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json(fail('No autenticado'));
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { rol: true } },
      },
    });

    if (!usuario) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'usuario',
        module: 'obtenerPerfilUsuario',
        action: 'error_obtener_perfil_usuario',
        message: 'Usuario no encontrado',
        error: new Error('Usuario no encontrado. 404'),
        context: {
          usuarioBuscado: userId,
        },
      });
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    // No exponer el hash de la contraseña
    const { password, ...usuarioSinPassword } = usuario;

    // Formatear la respuesta
    const data = {
      ...usuarioSinPassword,
      roles: usuario.roles.map((ur) => ({
        id: ur.rol.id,
        nombre: ur.rol.nombre,
        descripcion: ur.rol.descripcion,
      })),
    };

    // Registrar auditoría de consulta exitosa
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuario.id,
      module: 'obtenerPerfilUsuario',
      action: 'consultar_perfil_exitoso',
      message: `Usuario consultó su perfil`,
      details: {
        usuarioId: usuario.id,
        email: usuario.email,
      },
    });

    res.json(success(data));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Registrar el error en la auditoría
    await logError({
      userId: getUserId(req) || null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'obtenerPerfilUsuario',
      action: 'error_obtener_perfil_usuario',
      message: 'Error al obtener perfil',
      error: error instanceof Error ? error : new Error(errorMessage) + '. 500',
      context: {
        error: errorMessage,
        stack: errorStack,
      },
    });

    res.status(500).json(fail('Error al obtener el perfil'));
  }
}

/**
 * Permite a un usuario cambiar su propia contraseña
 */
export async function cambiarPasswordUsuario(req: Request, res: Response): Promise<void> {
  const { passwordActual, passwordNuevo } = req.body;
  const userId = getUserId(req);
  const ip = req.ip;

  if (!userId) {
    const errorMsg = 'Usuario no autenticado';
    res.status(401).json(fail(errorMsg));
    await logError({
      userId: 'sistema',
      ip,
      entityType: 'usuario',
      entityId: 'no-autenticado',
      module: 'cambiarPasswordUsuario',
      action: 'error_cambiar_password',
      message: errorMsg + '. 401',
      error: new Error('Usuario no autenticado intentó cambiar contraseña. 401'),
      context: {
        accion: 'validacion_autenticacion',
        ipSolicitante: ip,
      },
    });
    return;
  }

  const id = userId; // Usamos el ID del usuario autenticado

  // Validación básica
  if (!passwordActual || !passwordNuevo) {
    const errorMsg = 'Se requieren el password actual y el nuevo';
    res.status(400).json(fail(errorMsg));
    await logError({
      userId,
      ip,
      entityType: 'usuario',
      entityId: id,
      module: 'cambiarPasswordUsuario',
      action: 'error_cambiar_password',
      message: errorMsg,
      error: new Error('Datos de solicitud inválidos. 400'),
      context: {
        accion: 'validacion_datos',
        camposFaltantes: [
          ...(!passwordActual ? ['passwordActual'] : []),
          ...(!passwordNuevo ? ['passwordNuevo'] : []),
        ],
      },
    });
    return;
  }

  // Validar fortaleza de la nueva contraseña
  if (!passwordFuerte(passwordNuevo)) {
    const errorMsg =
      'El password nuevo debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números';
    res.status(400).json(fail(errorMsg));
    await logError({
      userId,
      ip,
      entityType: 'usuario',
      entityId: id,
      module: 'cambiarPasswordUsuario',
      action: 'error_cambiar_password',
      message: 'Validación de contraseña fallida',
      error: new Error(errorMsg) + '. 400',
      context: {
        accion: 'validacion_password',
        requisitos: ['min_8_caracteres', 'mayusculas', 'minusculas', 'numeros'],
      },
    });
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      const errorMsg = 'Usuario no encontrado';
      res.status(404).json(fail(errorMsg));
      await logError({
        userId,
        ip,
        entityType: 'usuario',
        entityId: id,
        module: 'cambiarPasswordUsuario',
        action: 'error_cambiar_password',
        message: errorMsg,
        error: new Error('Usuario no encontrado. 404'),
        context: {
          accion: 'buscar_usuario',
          usuarioBuscado: id,
        },
      });
      return;
    }

    if (!usuario.password) {
      const errorMsg = 'El usuario no tiene password local configurado';
      res.status(400).json(fail(errorMsg));
      await logError({
        userId,
        ip,
        entityType: 'usuario',
        entityId: id,
        module: 'cambiarPasswordUsuario',
        action: 'error_cambiar_password',
        message: errorMsg,
        error: new Error('Método de autenticación no soportado. 400'),
        context: {
          accion: 'validacion_metodo_autenticacion',
          metodoActual: 'sin_password_local',
        },
      });
      return;
    }

    const esPasswordValido = await bcrypt.compare(passwordActual, usuario.password);
    if (!esPasswordValido) {
      const errorMsg = 'El password actual es incorrecto';
      res.status(401).json(fail(errorMsg));
      await logError({
        userId,
        ip,
        entityType: 'usuario',
        entityId: id,
        module: 'cambiarPasswordUsuario',
        action: 'error_cambiar_password',
        message: errorMsg,
        error: new Error('Credenciales inválidas. 401'),
        context: {
          accion: 'validacion_credenciales',
          intento: 'password_incorrecto',
        },
      });
      return;
    }

    // Validar fortaleza de la nueva contraseña
    if (!passwordFuerte(passwordNuevo)) {
      const errorMsg =
        'El password nuevo debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números';
      res.status(400).json(fail(errorMsg));
      await logError({
        userId,
        ip,
        entityType: 'usuario',
        entityId: id,
        module: 'cambiarPasswordUsuario',
        action: 'error_cambiar_password',
        message: 'Validación de contraseña fallida',
        error: new Error(errorMsg + '. 400'),
        context: {
          accion: 'validacion_password',
          requisitos: ['min_8_caracteres', 'mayusculas', 'minusculas', 'numeros'],
        },
      });
      return;
    }
    // Hashear el nuevo password
    const nuevoHash = await bcrypt.hash(passwordNuevo, 10);
    await prisma.usuario.update({
      where: { id },
      data: {
        password: nuevoHash,
        modificadoPor: userId,
        modificadoEn: new Date(),
      },
    });

    // Registrar éxito del cambio de contraseña
    await logSuccess({
      userId,
      ip,
      entityType: 'usuario',
      entityId: id,
      module: 'cambiarPasswordUsuario',
      action: 'cambiar_password_exitoso',
      message: 'Contraseña actualizada correctamente',
      details: {
        accion: 'cambio_password',
        realizadoPor: userId,
        fechaCambio: new Date().toISOString(),
        requiereReinicioSesion: true,
      },
    });

    res.json(success('Contraseña actualizada correctamente'));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Registrar el error en la auditoría
    await logError({
      userId,
      ip,
      entityType: 'usuario',
      entityId: id,
      module: 'cambiarPasswordUsuario',
      action: 'error_cambiar_password',
      message: `Error al cambiar la contraseña: ${errorMessage}`,
      error: error instanceof Error ? error : new Error(errorMessage + '. 500'),
      context: {
        accion: 'cambio_password',
        error: errorMessage,
        stack: errorStack,
      },
    });

    res.status(500).json(fail('Error al cambiar la contraseña'));
  }
}

/**
 * Permite a un usuario modificar su propio perfil (nombre, telefono, direccion, dni solo si está null)
 * No permite modificar roles ni email para evitar escalada de privilegios
 */
export async function actualizarPerfilUsuario(req: Request, res: Response): Promise<void> {
  const usuarioId = getUserId(req) || 'sistema';
  const { nombreCompleto, telefono, direccion, dni, roles, email } = req.body;

  // Rechazar intentos de cambiar roles
  if (roles !== undefined) {
    const errorMsg = 'Acceso denegado: no puedes modificar tus propios roles';
    res.status(403).json(fail(errorMsg));
    await logError({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuarioId,
      module: 'actualizarPerfilUsuario',
      action: 'error_actualizar_perfil',
      message: errorMsg,
      error: new Error('Intento de modificar roles propios. 403'),
      context: {
        rolesProporcionados: roles,
        accion: 'modificar_roles',
      },
    });
    return;
  }

  // Rechazar intentos de cambiar email (por seguridad)
  if (email !== undefined) {
    const errorMsg = 'No puedes modificar tu email desde este endpoint por seguridad';
    res.status(403).json(fail(errorMsg));
    await logError({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuarioId,
      module: 'actualizarPerfilUsuario',
      action: 'error_actualizar_perfil',
      message: errorMsg,
      error: new Error('Intento de modificar email propio. 403'),
      context: {
        emailProporcionado: email,
        accion: 'modificar_email',
      },
    });
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      const errorMsg = 'Usuario no encontrado';
      res.status(404).json(fail(errorMsg));
      await logError({
        userId: usuarioId,
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuarioId,
        module: 'actualizarPerfilUsuario',
        action: 'error_actualizar_perfil',
        message: errorMsg,
        error: new Error('Usuario no encontrado al intentar actualizar perfil. 404'),
        context: {
          usuarioBuscado: usuarioId,
          accion: 'buscar_usuario_para_actualizar',
        },
      });
      return;
    }

    // DNI: Solo permitir actualización si actualmente está vacío o es null
    let nuevoDni = usuario.dni;
    if (dni !== undefined) {
      try {
        // Comprobamos tanto null como string vacía para mayor robustez
        if (usuario.dni !== null && usuario.dni !== '') {
          const errorMsg = 'El DNI ya está registrado y no puede ser modificado';
          res.status(400).json(fail(errorMsg));
          await logError({
            userId: usuarioId,
            ip: req.ip,
            entityType: 'usuario',
            entityId: usuarioId,
            module: 'actualizarPerfilUsuario',
            action: 'error_actualizar_perfil',
            message: errorMsg,
            error: new Error('Intento de modificar DNI existente. 400'),
            context: {
              dniActual: usuario.dni,
              dniSolicitado: dni,
              accion: 'modificar_dni',
            },
          });
          return;
        } else {
          // Asegurar que el DNI tenga un formato válido antes de guardarlo
          if (dni && typeof dni === 'string') {
            nuevoDni = dni.trim();
          } else {
            res.status(400).json(fail('El DNI no puede estar vacío o no es válido'));
            return;
          }
        }
      } catch {
        res.status(500).json(fail('Error al procesar el DNI'));
        return;
      }
    }

    // Validaciones de teléfono
    if (telefono && !telefonoValido(telefono)) {
      const errorMsg = 'El teléfono debe ser un número celular de 10 dígitos';
      res.status(400).json(fail(errorMsg));
      await logError({
        userId: usuarioId,
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuarioId,
        module: 'actualizarPerfilUsuario',
        action: 'error_actualizar_perfil',
        message: errorMsg,
        error: new Error('Formato de teléfono inválido. 400'),
        context: {
          telefonoProporcionado: telefono,
          formatoRequerido: '10 dígitos numéricos',
        },
      });
      return;
    }

    // Preparar datos para actualización
    const updateData: Prisma.UsuarioUpdateInput = {
      modificadoEn: new Date(),
      modificadoPor: usuarioId,
    };

    // Solo incluir campos que realmente se están actualizando
    if (nombreCompleto !== undefined) updateData.nombreCompleto = nombreCompleto;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (nuevoDni !== undefined) updateData.dni = nuevoDni;

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: updateData,
      include: {
        roles: { include: { rol: true } },
      },
    });

    // Detectar cambios
    const cambios: string[] = [];
    if (nombreCompleto && nombreCompleto !== usuario.nombreCompleto) {
      cambios.push(`nombreCompleto: "${usuario.nombreCompleto}" → "${nombreCompleto}"`);
    }
    if (telefono !== undefined && telefono !== usuario.telefono) {
      cambios.push(`telefono: "${usuario.telefono || ''}" → "${telefono || ''}"`);
    }
    if (direccion !== undefined && direccion !== usuario.direccion) {
      cambios.push(`direccion: "${usuario.direccion || ''}" → "${direccion || ''}"`);
    }
    if (nuevoDni && nuevoDni !== usuario.dni) {
      cambios.push(`dni: "${usuario.dni || ''}" → "${nuevoDni || ''}"`);
    }

    // Registrar éxito
    await logSuccess({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuarioId,
      module: 'actualizarPerfilUsuario',
      action: 'actualizar_perfil_exitoso',
      message: 'Perfil actualizado exitosamente',
      details: {
        cambiosRealizados: cambios.length > 0 ? cambios : ['Sin cambios en los datos'],
        camposActualizados: {
          nombreCompleto: nombreCompleto !== undefined,
          telefono: telefono !== undefined,
          direccion: direccion !== undefined,
          dni: dni !== undefined,
        },
      },
    });

    // Devolver respuesta exitosa
    res.json(
      success({
        id: usuarioActualizado.id,
        nombreCompleto: usuarioActualizado.nombreCompleto,
        telefono: usuarioActualizado.telefono,
        direccion: usuarioActualizado.direccion,
        dni: usuarioActualizado.dni,
        email: usuarioActualizado.email,
        roles: usuarioActualizado.roles.map((ur) => ur.rol.nombre),
      })
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json(fail('Error al actualizar el perfil'));

    await logError({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuarioId,
      module: 'actualizarPerfilUsuario',
      action: 'error_actualizar_perfil',
      message: 'Error al actualizar el perfil',
      error: error instanceof Error ? error : new Error(errorMessage + '. 500'),
      context: {
        datosSolicitud: {
          nombreCompleto: nombreCompleto !== undefined ? 'proporcionado' : 'no modificado',
          telefono: telefono !== undefined ? 'proporcionado' : 'no modificado',
          direccion: direccion !== undefined ? 'proporcionada' : 'no modificada',
          dni: dni !== undefined ? 'proporcionado' : 'no modificado',
        },
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });
  }
}
