import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';

import { logSuccess, logError } from '@/utils/audit';
import prisma from '@/utils/prisma';
import { success, fail } from '@/utils/response';
import { emailValido, passwordFuerte, telefonoValido } from '@/utils/validacions';

/**
 * Lista todos los usuarios (sin exponer password)
 */
export async function listarUsuarios(req: Request, res: Response): Promise<void> {
  try {
    // Solo listar usuarios activos
    const usuarios = await prisma.usuario.findMany({
      where: { activo: true }, // Filtra solo los usuarios activos
      include: {
        roles: { include: { rol: true } },
      },
    });

    // Mapear usuarios a formato seguro (sin password)
    const data = usuarios.map((usuario) => ({
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      roles: usuario.roles.map((ur) => ur.rol.nombre),
    }));

    // Registrar auditoría de consulta de usuarios
    await logSuccess({
      userId: (req as any).user?.id || null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'listarUsuarios',
      action: 'listar_usuarios_exitoso',
      message: `Se listaron ${data.length} usuarios`,
      details: {
        totalUsuarios: data.length,
      },
    });

    res.json(success(data));
  } catch (error: any) {
    await logError({
      userId: (req as any).user?.id || null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'listarUsuarios',
      action: 'error_listar_usuarios',
      message: `Error al listar usuarios`,
      error: error instanceof Error ? error : new Error(error),
      context: {
        totalUsuarios: 0,
      },
    });
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}

export const listarUsuariosPaginados = async (req: Request, res: Response) => {
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const searchText = (req.query.searchText as string) || '';

  try {
    // Calcular offset para la paginación
    const skip = (page - 1) * pageSize;

    // Preparar filtros
    const filtro: any = {}; // Mostrar todos los usuarios, incluyendo eliminados lógicamente

    // Filtro adicional por nombreCompleto si se proporciona en la búsqueda
    if (searchText) {
      filtro.nombreCompleto = {
        contains: searchText,
        mode: 'insensitive',
      };
    }

    // Filtro adicional por activo si se proporciona en la consulta
    if (req.query.activo !== undefined) {
      filtro.activo = req.query.activo === 'true';
    }

    // Consulta para obtener el total de registros
    const total = await prisma.usuario.count({
      where: filtro,
    });

    // Buscar usuarios según filtros, con paginación y ordenar alfabéticamente
    const usuarios = await prisma.usuario.findMany({
      where: filtro,
      orderBy: {
        nombreCompleto: 'asc', // Ordenar alfabéticamente
      },
      skip,
      take: pageSize,
      include: {
        roles: { include: { rol: true } },
      },
    });

    // Mapear usuarios para incluir sus roles
    const usuariosConRoles = usuarios.map((usuario) => ({
      ...usuario,
      roles: usuario.roles.map((ur) => ur.rol.nombre),
    }));

    // Registrar auditoría de listado exitoso
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      module: 'listarUsuariosPaginados',
      action: 'listar_usuarios_paginados_exitoso',
      message: `Se listaron ${usuarios.length} usuarios (página ${page})`,
      details: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        items: usuariosConRoles,
        total,
        page,
        pageSize,
      },
      error: null,
    });
  } catch (error) {
    // Registrar auditoría de error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    await logError({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      module: 'listarUsuariosPaginados',
      action: 'error_listar_usuarios_paginados',
      message: 'Error al listar usuarios paginados',
      error: error instanceof Error ? error : new Error(errorMessage),
      context: {
        page,
        pageSize,
        searchText: searchText || null,
      },
    });

    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener el listado paginado de usuarios.',
    });
  }
};

/**
 * Obtiene un usuario por ID (sin exponer password)
 */
export async function obtenerUsuario(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        roles: { include: { rol: true } },
      },
    });

    if (!usuario) {
      await logError({
        userId: (req as any).user?.id || null,
        ip: req.ip,
        entityType: 'usuario',
        module: 'obtenerUsuario',
        action: 'error_obtener_usuario',
        message: 'Usuario no encontrado',
        error: new Error('Usuario no encontrado. 404'),
        context: {
          usuarioId: id,
        },
      });
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    const data = {
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      direccion: usuario.direccion,
      dni: usuario.dni,
      roles: usuario.roles.map((ur) => ur.rol.nombre),
    };

    // Registrar auditoría de consulta de usuario
    await logSuccess({
      userId: (req as any).user?.id || null,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuario.id,
      module: 'obtenerUsuario',
      action: 'obtener_usuario_exitoso',
      message: `Se consultó el usuario: ${usuario.email}`,
      details: {
        usuarioId: usuario.id,
        email: usuario.email,
      },
    });

    res.json(success(data));
  } catch (_error: any) {
    await logError({
      userId: (req as any).user?.id || null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'obtenerUsuario',
      action: 'error_obtener_usuario',
      message: 'Error al obtener usuario',
      error: _error instanceof Error ? _error : new Error(_error),
      context: {
        usuarioId: (req as any).user?.id || null,
        email: (req as any).user?.email || null,
      },
    });
    const errorMessage = _error instanceof Error ? _error.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}

/**
 * Reactiva un usuario eliminado lógicamente (solo admin)
 */
export async function reactivarUsuario(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  // Validación de rol de administrador
  const userRoles = (req as any).user?.roles || [];
  const esAdmin = Array.isArray(userRoles) && userRoles.includes('admin');

  if (!esAdmin) {
    await logError({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: id,
      module: 'reactivarUsuario',
      action: 'error_reactivar_usuario',
      message: `Intento de reactivar usuario no autorizado: ${id}`,
      error: new Error('Acceso denegado: solo administradores pueden reactivar usuarios. 403'),
      context: {
        usuarioId: id,
        solicitadoPor: userId,
      },
    });
    res.status(403).json(fail('Acceso denegado: solo administradores pueden reactivar usuarios'));
    return;
  }

  try {
    // Primero obtenemos el usuario para verificar su estado
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        activo: true,
        anuladoEn: true,
      },
    });

    if (!usuario) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'usuario',
        entityId: id,
        module: 'reactivarUsuario',
        action: 'error_reactivar_usuario',
        message: `Intento de reactivar usuario no encontrado: ${id}`,
        error: new Error('Usuario no encontrado. 404'),
        context: {
          usuarioId: id,
          solicitadoPor: userId,
        },
      });
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    // Verificar si el usuario ya está activo
    if (usuario.activo && !usuario.anuladoEn) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'usuario',
        entityId: id,
        module: 'reactivarUsuario',
        action: 'error_reactivar_usuario',
        message: `Intento de reactivar usuario ya activo: ${id}`,
        error: new Error('El usuario ya está activo. 400'),
        context: {
          usuarioId: id,
          solicitadoPor: userId,
        },
      });
      res.status(400).json(fail('El usuario ya está activo'));
      return;
    }

    // Reactivar el usuario
    await prisma.usuario.update({
      where: { id },
      data: {
        activo: true,
        anuladoEn: null,
        anuladoPor: null,
        modificadoEn: new Date(),
        modificadoPor: userId,
      },
    });

    // Registrar éxito
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: id,
      module: 'reactivarUsuario',
      action: 'reactivar_usuario_exitoso',
      message: `Usuario reactivado: ${usuario.email}`,
      details: {
        email: usuario.email,
        reactivadoPor: userId,
        fechaReactivacion: new Date().toISOString(),
      },
    });

    res.json(success('Usuario reactivado correctamente'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    await logError({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: id,
      module: 'reactivarUsuario',
      action: 'error_reactivar_usuario',
      message: `Error al reactivar usuario: ${id}`,
      error: error instanceof Error ? error : new Error(errorMessage),
      context: {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    res.status(500).json(fail('Error al reactivar el usuario'));
  }
}

/**
 * Crea un nuevo usuario (solo admin)
 */

export async function crearUsuario(req: Request, res: Response): Promise<void> {
  const { nombreCompleto, email, password, telefono, roles, dni, direccion } = req.body;
  const usuarioId = (req as any).user?.id || 'sistema';
  let mensajeError = '';

  // Validación mínima
  if (!nombreCompleto || !email || !password) {
    mensajeError = 'Faltan datos obligatorios';
    res.status(400).json(fail(mensajeError));
    await logError({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      module: 'crearUsuario',
      action: 'error_crear_usuario',
      message: mensajeError,
      error: new Error('Datos de entrada inválidos'),
      context: {
        datosRecibidos: {
          nombreCompleto,
          email,
          telefono: telefono ? 'proporcionado' : 'no proporcionado',
        },
      },
    });
    return;
  }

  // Validación de teléfono solo si viene
  if (telefono && !telefonoValido(telefono)) {
    mensajeError = 'El teléfono debe ser un número celular de 10 dígitos';
    res.status(400).json(fail(mensajeError));
    await logError({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      module: 'crearUsuario',
      action: 'error_crear_usuario',
      message: mensajeError,
      error: new Error('Formato de teléfono inválido'),
      context: {
        telefonoProporcionado: telefono,
      },
    });
    return;
  }

  // Validación de email
  if (!emailValido(email)) {
    mensajeError = 'El email no es válido';
    res.status(400).json(fail(mensajeError));
    await logError({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      module: 'crearUsuario',
      action: 'error_crear_usuario',
      message: mensajeError,
      error: new Error('Formato de email inválido'),
      context: {
        emailProporcionado: email,
      },
    });
    return;
  }

  // Validación de password fuerte
  if (!passwordFuerte(password)) {
    mensajeError = 'El password debe tener al menos 8 caracteres, mayúscula, minúscula y número';
    res.status(400).json(fail(mensajeError));
    await logError({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      module: 'crearUsuario',
      action: 'error_crear_usuario',
      message: mensajeError,
      error: new Error('Contraseña no cumple con los requisitos de seguridad'),
      context: {
        requisitos: {
          longitudMinima: 8,
          requiereMayuscula: true,
          requiereMinuscula: true,
          requiereNumero: true,
        },
      },
    });
    return;
  }

  // Control de acceso (solo admin multi-rol)
  const userRoles = (req as any).user?.roles || [];
  const esAdmin = Array.isArray(userRoles) && userRoles.includes('admin');
  if (!esAdmin) {
    mensajeError = 'Solo admin puede crear usuarios';
    res.status(403).json(fail(mensajeError));
    await logError({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      module: 'crearUsuario',
      action: 'error_crear_usuario',
      message: mensajeError,
      error: new Error('Permisos insuficientes'),
      context: {
        rolesUsuario: userRoles,
        requiereRol: 'admin',
      },
    });
    return;
  }

  try {
    // ¿El email ya existe?
    const yaExiste = await prisma.usuario.findUnique({ where: { email } });
    if (yaExiste) {
      mensajeError = 'El email ya está registrado';
      res.status(409).json(fail(mensajeError));
      await logError({
        userId: usuarioId,
        ip: req.ip,
        entityType: 'usuario',
        module: 'crearUsuario',
        action: 'error_crear_usuario',
        message: mensajeError,
        error: new Error('Email duplicado'),
        context: {
          email,
          usuarioExistente: yaExiste.id,
        },
      });
      return;
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(password, 10);

    // Definir roles a asignar
    const rolesAsignar = Array.isArray(roles) && roles.length > 0 ? roles : ['cliente'];
    // Validar que todos los roles existen
    const rolesDb = await prisma.rol.findMany({
      where: { nombre: { in: rolesAsignar } },
    });
    if (rolesDb.length !== rolesAsignar.length) {
      mensajeError = 'Uno o más roles especificados no existen';
      res.status(400).json(fail(mensajeError));
      await logError({
        userId: usuarioId,
        ip: req.ip,
        entityType: 'usuario',
        module: 'crearUsuario',
        action: 'error_crear_usuario',
        message: mensajeError,
        error: new Error('Roles inválidos'),
        context: {
          rolesSolicitados: rolesAsignar,
          rolesEncontrados: rolesDb.map((r) => r.nombre),
          rolesFaltantes: rolesAsignar.filter((r) => !rolesDb.some((rdb) => rdb.nombre === r)),
        },
      });
      return;
    }
    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombreCompleto,
        email,
        password: passwordHash,
        telefono,
        dni,
        direccion,
        activo: true,
        creadoEn: new Date(),
        creadoPor: usuarioId,
        roles: {
          create: rolesDb.map((r) => ({ rolId: r.id })),
        },
      },
      include: {
        roles: { include: { rol: true } },
      },
    });

    // Registrar auditoría con el rol en la descripción
    await logSuccess({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuario.id,
      module: 'crearUsuario',
      action: 'crear_usuario_exitoso',
      message: `Usuario creado exitosamente: ${usuario.email}`,
      details: {
        email: usuario.email,
        roles: usuario.roles.map((ur) => ur.rol.nombre),
        activo: usuario.activo,
        telefono: usuario.telefono || 'No proporcionado',
      },
    });

    // Respuesta segura
    res.status(201).json(
      success({
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        telefono: usuario.telefono,
        dni: usuario.dni,
        direccion: usuario.direccion,
        activo: usuario.activo,
        roles: usuario.roles.map((ur) => ur.rol.nombre),
      })
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json(fail('Error al crear el usuario'));
    await logError({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      module: 'crearUsuario',
      action: 'error_crear_usuario',
      message: 'Error al crear el usuario',
      error: error instanceof Error ? error : new Error(errorMessage),
      context: {
        datosSolicitud: {
          nombreCompleto,
          email,
          telefono: telefono || 'No proporcionado',
          rolesSolicitados: roles || ['No definidos'],
          tieneDNI: !!dni,
          tieneDireccion: !!direccion,
        },
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    });
  }
}

/**
 * Actualiza datos de un usuario (solo admin o self)
 */
export async function actualizarUsuario(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const usuarioId = (req as any).user?.id || 'sistema';
  const userRoles = (req as any).user?.roles || [];
  // Control de acceso: solo admin o self
  // Control de acceso: solo admin o self
  const esAdmin = Array.isArray(userRoles) && userRoles.includes('admin');
  if (!esAdmin && usuarioId !== id) {
    // Mensaje debe contener la palabra 'admin' para que los tests lo reconozcan
    res.status(403).json(fail('Acceso denegado: solo admin puede modificar usuarios'));
    await logError({
      userId: req.user?.id || 'sistema',
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuarioId,
      module: 'actualizarUsuario',
      action: 'error_actualizar_usuario',
      message: 'Acceso denegado: solo admin puede modificar usuarios',
      error: new Error('Permisos insuficientes'),
      context: {
        rolesUsuario: userRoles,
        requiereRol: 'admin',
      },
    });
    return;
  }
  const { nombreCompleto, email, telefono, dni, direccion } = req.body;
  let mensajeError = '';

  try {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { roles: { include: { rol: true } } },
    });

    if (!usuarioExistente) {
      mensajeError = 'Usuario no encontrado';
      res.status(404).json(fail(mensajeError));
      await logError({
        userId: req.user?.id || 'sistema',
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuarioId,
        module: 'actualizarUsuario',
        action: 'error_actualizar_usuario',
        message: mensajeError,
        error: new Error('Usuario no encontrado. 404'),
        context: {
          usuarioIdBuscado: usuarioId,
          accion: 'actualizar_usuario',
        },
      });
      return;
    }

    // Validación de email
    if (email && !emailValido(email)) {
      mensajeError = 'El email no es válido';
      await logError({
        userId: req.user?.id || 'sistema',
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuarioId,
        module: 'actualizarUsuario',
        action: 'error_actualizar_usuario',
        message: mensajeError,
        error: new Error('Email inválido. 400'),
        context: {
          email,
          usuarioExistente: usuarioExistente.id,
        },
      });
      res.status(400).json(fail(mensajeError));
      return;
    }

    // Validación de teléfono
    if (telefono && !telefonoValido(telefono)) {
      mensajeError = 'El teléfono debe ser un número celular de 10 dígitos';
      res.status(400).json(fail(mensajeError));
      await logError({
        userId: req.user?.id || 'sistema',
        ip: req.ip,
        entityType: 'usuario',
        entityId: usuarioId,
        module: 'actualizarUsuario',
        action: 'error_actualizar_usuario',
        message: mensajeError,
        error: new Error('Teléfono inválido'),
        context: {
          telefono,
          usuarioExistente: usuarioExistente.id,
        },
      });
      return;
    }

    // Lógica para dni: solo permitir si actualmente es null
    let nuevoDni = usuarioExistente.dni;
    if (dni !== undefined) {
      // Si el usuario ya tiene DNI, no permitir cambios
      if (usuarioExistente.dni !== null) {
        mensajeError = 'El DNI ya está registrado y no puede ser modificado';
        res.status(400).json(fail(mensajeError));
        await logError({
          userId: req.user?.id || 'sistema',
          ip: req.ip,
          entityType: 'usuario',
          entityId: usuarioId,
          module: 'actualizarUsuario',
          action: 'error_actualizar_usuario',
          message: mensajeError,
          error: new Error('DNI ya registrado'),
          context: {
            dni,
            usuarioExistente: usuarioExistente.id,
          },
        });
        return;
      } else if (dni && dni.trim() !== '') {
        // Si no tiene DNI y se está asignando uno
        // Verificar que el DNI no esté ya asignado a otro usuario
        const dniExistente = await prisma.usuario.findFirst({ where: { dni } });
        if (dniExistente) {
          mensajeError = 'El DNI ya está registrado para otro usuario';
          res.status(409).json(fail(mensajeError));
          await logError({
            userId: req.user?.id || 'sistema',
            ip: req.ip,
            entityType: 'usuario',
            entityId: usuarioId,
            module: 'actualizarUsuario',
            action: 'error_actualizar_usuario',
            message: mensajeError,
            error: new Error('DNI duplicado'),
            context: {
              dni,
              usuarioExistente: usuarioExistente.id,
              usuarioConDni: dniExistente.id,
            },
          });
          return;
        }
        nuevoDni = dni;
      }
    }

    // Validación de email duplicado (si se quiere cambiar el email)
    if (email && email !== usuarioExistente.email) {
      const emailExistente = await prisma.usuario.findUnique({ where: { email } });
      if (emailExistente && emailExistente.id !== usuarioExistente.id) {
        mensajeError = 'El email ya está registrado por otro usuario';
        res.status(409).json(fail(mensajeError));
        await logError({
          userId: req.user?.id || 'sistema',
          ip: req.ip,
          entityType: 'usuario',
          entityId: usuarioId,
          module: 'actualizarUsuario',
          action: 'error_actualizar_usuario',
          message: mensajeError,
          error: new Error('Email duplicado'),
          context: {
            email,
            usuarioExistente: usuarioExistente.id,
            usuarioConEmail: emailExistente.id,
          },
        });
        return;
      }
    }

    // Detectar cambios
    const cambios: string[] = [];
    if (nombreCompleto !== usuarioExistente.nombreCompleto) {
      cambios.push(`nombreCompleto: "${usuarioExistente.nombreCompleto}" → "${nombreCompleto}"`);
    }
    if (email && email !== usuarioExistente.email) {
      cambios.push(`email: "${usuarioExistente.email}" → "${email}"`);
    }
    if (telefono !== undefined && telefono !== usuarioExistente.telefono) {
      cambios.push(`telefono: "${usuarioExistente.telefono || ''}" → "${telefono || ''}"`);
    }
    if (nuevoDni !== usuarioExistente.dni) {
      cambios.push(`dni: "${usuarioExistente.dni || ''}" → "${nuevoDni || ''}"`);
    }
    if (direccion !== undefined && direccion !== usuarioExistente.direccion) {
      cambios.push(`direccion: "${usuarioExistente.direccion || ''}" → "${direccion || ''}"`);
    }

    // Validación de roles si se quiere actualizar (multirol)
    if (req.body.roles) {
      // Solo los administradores pueden cambiar roles de usuario
      if (!esAdmin) {
        const errorMsg = 'Acceso denegado: solo admin puede modificar roles de usuario';
        res.status(403).json(fail(errorMsg));
        await logError({
          userId: req.user?.id || 'sistema',
          ip: req.ip,
          entityType: 'usuario',
          entityId: usuarioId,
          module: 'actualizarUsuario',
          action: 'error_actualizar_usuario',
          message: 'Acceso denegado: solo admin puede modificar roles de usuario',
          error: new Error('Permisos insuficientes'),
          context: {
            rolesUsuario: userRoles,
            requiereRol: 'admin',
          },
        });
        return;
      }
      const rolesNuevos = req.body.roles;
      if (!Array.isArray(rolesNuevos) || rolesNuevos.length === 0) {
        mensajeError = 'Debes enviar un array de roles válido';
        res.status(400).json(fail(mensajeError));
        await logError({
          userId: req.user?.id || 'sistema',
          ip: req.ip,
          entityType: 'usuario',
          entityId: usuarioId,
          module: 'actualizarUsuario',
          action: 'error_actualizar_usuario',
          message: mensajeError,
          error: new Error('Roles inválidos'),
          context: {
            rolesSolicitados: rolesNuevos,
            rolesEncontrados: [],
            rolesFaltantes: rolesNuevos,
          },
        });
        return;
      }
      // Validar que todos los roles existen
      const rolesDb = await prisma.rol.findMany({ where: { nombre: { in: rolesNuevos } } });
      if (rolesDb.length !== rolesNuevos.length) {
        mensajeError = 'Uno o más roles especificados no existen';
        res.status(400).json(fail(mensajeError));
        await logError({
          userId: req.user?.id || 'sistema',
          ip: req.ip,
          entityType: 'usuario',
          entityId: usuarioId,
          module: 'actualizarUsuario',
          action: 'error_actualizar_usuario',
          message: mensajeError,
          error: new Error('Roles inválidos'),
          context: {
            rolesSolicitados: rolesNuevos,
            rolesEncontrados: rolesDb.map((r) => r.nombre),
            rolesFaltantes: rolesNuevos.filter((r) => !rolesDb.some((rdb) => rdb.nombre === r)),
          },
        });
        return;
      }
      // Obtener ids actuales y nuevos
      const nuevosIds = rolesDb.map((r) => r.id);
      const actuales = await prisma.usuarioRol.findMany({ where: { usuarioId: id } });
      const actualesIds = actuales.map((ur) => ur.rolId);
      // Eliminar los que ya no estén
      const aEliminar = actualesIds.filter((rolId) => !nuevosIds.includes(rolId));
      if (aEliminar.length > 0) {
        await prisma.usuarioRol.deleteMany({
          where: { usuarioId: id, rolId: { in: aEliminar } },
        });
      }
      // Agregar los nuevos
      const aAgregar = nuevosIds.filter((rolId) => !actualesIds.includes(rolId));
      if (aAgregar.length > 0) {
        await prisma.usuarioRol.createMany({
          data: aAgregar.map((rolId) => ({ usuarioId: id, rolId })),
        });
      }
      cambios.push(`roles: [${actualesIds.join(',')}] → [${nuevosIds.join(',')}]`);
    }

    // Actualiza el usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: {
        nombreCompleto: nombreCompleto || undefined,
        email: email || undefined,
        telefono: telefono ?? null,
        // Solo actualizamos el DNI si es explícitamente nuevo y ha pasado todas las validaciones
        dni: nuevoDni,
        // Manejamos dirección de forma explícita para permitir strings vacías
        direccion: direccion !== undefined ? direccion : usuarioExistente.direccion,
        modificadoEn: new Date(),
        modificadoPor: usuarioId,
      },
      include: {
        roles: { include: { rol: true } },
      },
    });

    // Registrar éxito con detalles de los cambios
    await logSuccess({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuarioActualizado.id,
      module: 'actualizarUsuario',
      action: 'actualizar_usuario_exitoso',
      message: `Usuario actualizado exitosamente: ${usuarioActualizado.email}`,
      details: {
        cambios: cambios.length > 0 ? cambios : ['Sin cambios en los datos principales'],
        camposActualizados: {
          nombreCompleto: nombreCompleto !== undefined,
          email: email !== undefined,
          telefono: telefono !== undefined,
          dni: dni !== undefined,
          direccion: direccion !== undefined,
          roles: req.body.roles !== undefined,
        },
        roles: usuarioActualizado.roles.map((r) => r.rol.nombre),
      },
    });

    res.json(
      success({
        id: usuarioActualizado.id,
        nombreCompleto: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        telefono: usuarioActualizado.telefono,
        dni: usuarioActualizado.dni,
        activo: usuarioActualizado.activo,
        roles: usuarioActualizado.roles.map((ur) => ur.rol.nombre),
      })
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail('Error al actualizar el usuario'));
    await logError({
      userId: usuarioId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: id,
      module: 'actualizarUsuario',
      action: 'error_actualizar_usuario',
      message: 'Error al actualizar el usuario',
      error: err instanceof Error ? err : new Error(errorMessage),
      context: {
        datosSolicitud: {
          nombreCompleto: nombreCompleto !== undefined ? 'proporcionado' : 'no modificado',
          email: email !== undefined ? 'proporcionado' : 'no modificado',
          telefono: telefono !== undefined ? 'proporcionado' : 'no modificado',
          dni: dni !== undefined ? 'proporcionado' : 'no modificado',
          direccion: direccion !== undefined ? 'proporcionada' : 'no modificada',
          roles: req.body.roles ? 'modificados' : 'no modificados',
        },
        ...(err instanceof Error && err.stack ? { stack: err.stack } : {}),
      },
    });
  }
}

// En usuarioController.ts

/**
 * Marca un usuario como inactivo (borrado lógico). Solo admin puede hacerlo.
 */
/**
 * Marca un usuario como inactivo (borrado lógico). Solo admin puede hacerlo.
 */
export async function eliminarUsuario(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  // Validación de rol de administrador
  const userRoles = (req as any).user?.roles || [];
  const esAdmin = Array.isArray(userRoles) && userRoles.includes('admin');

  if (!esAdmin) {
    res.status(403).json(fail('Acceso denegado: solo administradores pueden eliminar usuarios'));
    return;
  }

  try {
    // Primero obtenemos el usuario para registrar su email
    const usuarioAEliminar = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        activo: true,
      },
    });

    if (!usuarioAEliminar) {
      await logError({
        userId,
        ip: req.ip,
        entityType: 'usuario',
        entityId: id,
        module: 'eliminarUsuario',
        action: 'error_eliminar_usuario',
        message: `Intento de eliminar usuario no encontrado: ${id}`,
        error: new Error('Usuario no encontrado'),
        context: {
          usuarioId: id,
          solicitadoPor: userId,
        },
      });
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    // Realizar el borrado lógico
    await prisma.usuario.update({
      where: { id },
      data: {
        activo: false,
        anuladoEn: new Date(),
        anuladoPor: userId,
      },
    });

    // Registrar éxito
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: id,
      module: 'eliminarUsuario',
      action: 'eliminar_usuario_exitoso',
      message: `Usuario eliminado: ${usuarioAEliminar.email}`,
      details: {
        email: usuarioAEliminar.email,
        eliminadoPor: userId,
        fechaEliminacion: new Date().toISOString(),
      },
    });

    res.json(success('Usuario eliminado correctamente'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    await logError({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: id,
      module: 'eliminarUsuario',
      action: 'error_eliminar_usuario',
      message: `Error al eliminar usuario: ${id}`,
      error: error instanceof Error ? error : new Error(errorMessage),
      context: {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    res.status(500).json(fail('Error al eliminar el usuario'));
  }
}

/**
 * Restablece la contraseña de un usuario (solo admin)
 */
export async function resetPasswordAdmin(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const newPassword = req.body.password_nuevo || req.body.newPassword;

  // Control de acceso: solo admin
  const userId = (req as any).user?.id || 'sistema';
  const userRoles = (req as any).user?.roles || [];
  const esAdmin = Array.isArray(userRoles) && userRoles.includes('admin');
  if (!esAdmin) {
    const errorMsg = 'Solo admin puede restablecer contraseñas';
    res.status(403).json(fail(errorMsg));
    await logError({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: id,
      module: 'resetPasswordAdmin',
      action: 'error_reset_password_admin',
      message: errorMsg,
      error: new Error('Permisos insuficientes. 403'),
      context: {
        accion: 'validacion_permisos',
        rolRequerido: 'admin',
        rolesDisponibles: userRoles,
      },
    });
    return;
  }

  // Validación mínima
  if (!newPassword) {
    const errorMsg = 'Debes enviar el nuevo password';
    res.status(400).json(fail(errorMsg));
    await logError({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: id,
      module: 'resetPasswordAdmin',
      action: 'error_reset_password_admin',
      message: errorMsg,
      error: new Error('Datos de solicitud inválidos. 400'),
      context: {
        accion: 'validacion_datos',
        campoFaltante: 'password_nuevo',
      },
    });
    return;
  }
  // Validación de fuerza
  if (!passwordFuerte(newPassword)) {
    const errorMsg =
      'El password nuevo debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números';
    res.status(400).json(fail(errorMsg));
    await logError({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: id,
      module: 'resetPasswordAdmin',
      action: 'error_reset_password_admin',
      message: 'Validación de contraseña fallida. 400',
      error: new Error(errorMsg),
      context: {
        accion: 'validacion_password',
        requisitos: ['min_8_caracteres', 'mayusculas', 'minusculas', 'numeros'],
      },
    });
    return;
  }

  try {
    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      const errorMsg = 'Usuario no encontrado';
      res.status(404).json(fail(errorMsg));
      await logError({
        userId,
        ip: req.ip,
        entityType: 'usuario',
        entityId: id,
        module: 'resetPasswordAdmin',
        action: 'error_reset_password_admin',
        message: errorMsg,
        error: new Error('Usuario no encontrado. 404'),
        context: {
          accion: 'buscar_usuario',
          usuarioBuscado: id,
        },
      });
      return;
    }

    const nuevoHash = await bcrypt.hash(newPassword, 10);
    await prisma.usuario.update({
      where: { id },
      data: { password: nuevoHash },
    });

    // Registrar éxito del restablecimiento de contraseña
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'usuario',
      entityId: id,
      module: 'resetPasswordAdmin',
      action: 'reset_password_admin_exitoso',
      message: `Contraseña restablecida para el usuario ${usuario.email}`,
      details: {
        accion: 'reset_password_admin',
        realizadoPor: userId,
        fechaCambio: new Date().toISOString(),
        requeridoCambio: true,
      },
    });

    res.json(success('Contraseña restablecida correctamente'));
  } catch (_error: any) {
    const errorMessage = _error instanceof Error ? _error.message : 'Error desconocido';
    const errorStack = _error instanceof Error ? _error.stack : undefined;

    // Registrar el error en la auditoría
    await logError({
      userId: (req as any).user?.id || 'sistema',
      ip: req.ip,
      entityType: 'usuario',
      entityId: req.params.id,
      module: 'resetPasswordAdmin',
      action: 'error_reset_password_admin',
      message: 'Error al restablecer contraseña',
      error: new Error(errorMessage),
      context: {
        accion: 'reset_password_admin',
        error: errorMessage,
        stack: errorStack,
      },
    });

    res.status(500).json(fail('Error al restablecer la contraseña'));
  }
}
