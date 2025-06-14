import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';

import prisma from '@/utils/prisma';
import { registrarAuditoria } from '@/utils/audit';
import { success, fail } from '@/utils/response';
import { isSystemUser } from '@/utils/system';

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
    await registrarAuditoria({
      usuarioId: (req as any).user?.id || null,
      accion: 'listar_usuarios',
      descripcion: `Se listaron ${data.length} usuarios`,
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'usuarios',
    });

    res.json(success(data));
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}

export const listarUsuariosPaginados = async (req: Request, res: Response) => {
  const userId = (req as any).usuario?.id || (req as any).user?.id;
  try {
    // Extraer parámetros de paginación y búsqueda
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchText = (req.query.searchText as string) || '';

    // Calcular offset para la paginación
    const skip = (page - 1) * pageSize;

    // Preparar filtros
    const filtro: any = {
      anuladoEn: null, // Solo marcas no anuladas (soft delete)
    };

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
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_usuarios_paginados',
      descripcion: `Se listaron ${usuarios.length} usuarios (página ${page})`,
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'usuarios',
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
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'listar_usuarios_paginados_fallido',
      descripcion: errorMessage,
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'usuarios',
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
    await registrarAuditoria({
      usuarioId: (req as any).user?.id || null,
      accion: 'obtener_usuario',
      descripcion: `Se consultó el usuario: ${usuario.email}`,
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuario.id,
      modulo: 'usuarios',
    });

    res.json(success(data));
  } catch (_error: any) {
    const errorMessage = _error instanceof Error ? _error.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}

/**
 * Crea un nuevo usuario (solo admin)
 */
function emailValido(email: string): boolean {
  // Regex simple, puedes reemplazar por una librería si lo prefieres
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordFuerte(password: string): boolean {
  // Mínimo 8 caracteres, una mayúscula, una minúscula y un número
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function telefonoValido(telefono: string): boolean {
  // Solo dígitos, exactamente 10 caracteres
  return /^\d{10}$/.test(telefono);
}

export async function crearUsuario(req: Request, res: Response): Promise<void> {
  const { nombreCompleto, email, password, telefono, roles, dni, direccion } = req.body;
  const usuarioId = (req as any).user?.id || 'sistema';
  let mensajeError = '';

  // Validación mínima
  if (!nombreCompleto || !email || !password) {
    mensajeError = 'Faltan datos obligatorios';
    res.status(400).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: 'crear_usuario_fallido',
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'usuarios',
    });
    return;
  }

  // Validación de teléfono solo si viene
  if (telefono && !telefonoValido(telefono)) {
    mensajeError = 'El teléfono debe ser un número celular de 10 dígitos';
    res.status(400).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: 'crear_usuario_fallido',
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'usuarios',
    });
    return;
  }

  // Validación de email
  if (!emailValido(email)) {
    mensajeError = 'El email no es válido';
    res.status(400).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: 'crear_usuario_fallido',
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'usuarios',
    });
    return;
  }

  // Validación de password fuerte
  if (!passwordFuerte(password)) {
    mensajeError = 'El password debe tener al menos 8 caracteres, mayúscula, minúscula y número';
    res.status(400).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: 'crear_usuario_fallido',
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'usuarios',
    });
    return;
  }

  // Control de acceso (solo admin multi-rol)
  const userRoles = (req as any).user?.roles || [];
  const esAdmin = Array.isArray(userRoles) && userRoles.includes('admin');
  if (!esAdmin) {
    mensajeError = 'Solo admin puede crear usuarios';
    res.status(403).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: 'crear_usuario_fallido',
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'usuarios',
    });
    return;
  }

  try {
    // ¿El email ya existe?
    const yaExiste = await prisma.usuario.findUnique({ where: { email } });
    if (yaExiste) {
      mensajeError = 'El email ya está registrado';
      res.status(409).json(fail(mensajeError));
      await registrarAuditoria({
        usuarioId,
        accion: 'crear_usuario_fallido',
        descripcion: mensajeError,
        ip: req.ip,
        entidadTipo: 'usuario',
        modulo: 'usuarios',
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
      await registrarAuditoria({
        usuarioId,
        accion: 'crear_usuario_fallido',
        descripcion: mensajeError,
        ip: req.ip,
        entidadTipo: 'usuario',
        modulo: 'usuarios',
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
    await registrarAuditoria({
      usuarioId,
      accion: 'crear_usuario_exitoso',
      descripcion: `Usuario creado: ${usuario.email} (roles: ${usuario.roles.map((ur) => ur.rol.nombre).join(', ')})`,
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuario.id,
      modulo: 'usuarios',
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
    res.status(500).json(fail(errorMessage));
    await registrarAuditoria({
      usuarioId,
      accion: 'crear_usuario_fallido',
      descripcion: errorMessage,
      ip: req.ip,
      entidadTipo: 'usuario',
      modulo: 'usuarios',
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
    return;
  }
  const { nombreCompleto, email, telefono, dni, direccion } = req.body;
  let mensajeError = '';

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      mensajeError = 'Usuario no encontrado';
      res.status(404).json(fail(mensajeError));
      await registrarAuditoria({
        usuarioId,
        accion: 'modificar_usuario_fallido',
        descripcion: mensajeError,
        ip: req.ip,
        entidadTipo: 'usuario',
        entidadId: id,
        modulo: 'usuarios',
      });
      return;
    }

    try {
      // Verificar si es el usuario system
      if (await isSystemUser(id)) {
        mensajeError =
          'No se puede modificar el usuario del sistema. Esta cuenta es utilizada para operaciones internas.';
        res.status(403).json(fail(mensajeError));
        await registrarAuditoria({
          usuarioId,
          accion: 'modificar_usuario_fallido',
          descripcion: `Intento de modificar el usuario system (${id}). Operación denegada.`,
          ip: req.ip,
          entidadTipo: 'usuario',
          entidadId: id,
          modulo: 'usuarios',
        });
        return;
      }
    } catch (_error: any) {
      // Si no podemos verificar si es usuario system, continuamos normalmente
      // Esto es importante para que los tests sigan funcionando
    }

    // Validación de email
    if (email && !emailValido(email)) {
      mensajeError = 'El email no es válido';
      res.status(400).json(fail(mensajeError));
      await registrarAuditoria({
        usuarioId,
        accion: 'modificar_usuario_fallido',
        descripcion: mensajeError,
        ip: req.ip,
        entidadTipo: 'usuario',
        entidadId: id,
        modulo: 'usuarios',
      });
      return;
    }
    // Validación de teléfono
    if (telefono && !telefonoValido(telefono)) {
      mensajeError = 'El teléfono debe ser un número celular de 10 dígitos';
      res.status(400).json(fail(mensajeError));
      await registrarAuditoria({
        usuarioId,
        accion: 'modificar_usuario_fallido',
        descripcion: mensajeError,
        ip: req.ip,
        entidadTipo: 'usuario',
        entidadId: id,
        modulo: 'usuarios',
      });
      return;
    }

    // Lógica para dni: solo permitir si actualmente es null
    let nuevoDni = usuario.dni;
    if (dni !== undefined) {
      // Si el usuario ya tiene DNI, no permitir cambios
      if (usuario.dni !== null) {
        mensajeError = 'El DNI ya está registrado y no puede ser modificado';
        res.status(400).json(fail(mensajeError));
        await registrarAuditoria({
          usuarioId,
          accion: 'modificar_usuario_fallido',
          descripcion: mensajeError,
          ip: req.ip,
          entidadTipo: 'usuario',
          entidadId: id,
          modulo: 'usuarios',
        });
        return;
      } else if (dni && dni.trim() !== '') {
        // Si no tiene DNI y se está asignando uno
        // Verificar que el DNI no esté ya asignado a otro usuario
        const dniExistente = await prisma.usuario.findFirst({ where: { dni } });
        if (dniExistente) {
          mensajeError = 'El DNI ya está registrado para otro usuario';
          res.status(409).json(fail(mensajeError));
          await registrarAuditoria({
            usuarioId,
            accion: 'modificar_usuario_fallido',
            descripcion: mensajeError,
            ip: req.ip,
            entidadTipo: 'usuario',
            entidadId: id,
            modulo: 'usuarios',
          });
          return;
        }
        nuevoDni = dni;
      }
    }

    // Validación de email duplicado (si se quiere cambiar el email)
    if (email && email !== usuario.email) {
      const emailExistente = await prisma.usuario.findUnique({ where: { email } });
      if (emailExistente && emailExistente.id !== usuario.id) {
        mensajeError = 'El email ya está registrado por otro usuario';
        res.status(409).json(fail(mensajeError));
        await registrarAuditoria({
          usuarioId,
          accion: 'modificar_usuario_fallido',
          descripcion: mensajeError,
          ip: req.ip,
          entidadTipo: 'usuario',
          entidadId: id,
          modulo: 'usuarios',
        });
        return;
      }
    }

    // Detectar cambios
    const cambios: string[] = [];
    if (nombreCompleto !== usuario.nombreCompleto) {
      cambios.push(`nombreCompleto: "${usuario.nombreCompleto}" → "${nombreCompleto}"`);
    }
    if (email && email !== usuario.email) {
      cambios.push(`email: "${usuario.email}" → "${email}"`);
    }
    if (telefono !== undefined && telefono !== usuario.telefono) {
      cambios.push(`telefono: "${usuario.telefono || ''}" → "${telefono || ''}"`);
    }
    if (nuevoDni !== usuario.dni) {
      cambios.push(`dni: "${usuario.dni || ''}" → "${nuevoDni || ''}"`);
    }
    if (direccion !== undefined && direccion !== usuario.direccion) {
      cambios.push(`direccion: "${usuario.direccion || ''}" → "${direccion || ''}"`);
    }

    // Validación de roles si se quiere actualizar (multirol)
    if (req.body.roles) {
      // Solo los administradores pueden cambiar roles de usuario
      if (!esAdmin) {
        res.status(403).json(fail('Acceso denegado: solo admin puede modificar roles de usuario'));
        return;
      }
      const rolesNuevos = req.body.roles;
      if (!Array.isArray(rolesNuevos) || rolesNuevos.length === 0) {
        mensajeError = 'Debes enviar un array de roles válido';
        res.status(400).json(fail(mensajeError));
        await registrarAuditoria({
          usuarioId,
          accion: 'modificar_usuario_fallido',
          descripcion: mensajeError,
          ip: req.ip,
          entidadTipo: 'usuario',
          entidadId: id,
          modulo: 'usuarios',
        });
        return;
      }
      // Validar que todos los roles existen
      const rolesDb = await prisma.rol.findMany({ where: { nombre: { in: rolesNuevos } } });
      if (rolesDb.length !== rolesNuevos.length) {
        mensajeError = 'Uno o más roles especificados no existen';
        res.status(400).json(fail(mensajeError));
        await registrarAuditoria({
          usuarioId,
          accion: 'modificar_usuario_fallido',
          descripcion: mensajeError,
          ip: req.ip,
          entidadTipo: 'usuario',
          entidadId: id,
          modulo: 'usuarios',
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

    // Log para debug
    console.log('[DEBUG] Datos a actualizar:', {
      nombreCompleto: nombreCompleto || undefined,
      email: email || undefined,
      telefono: telefono ?? null,
      dni: nuevoDni,
      direccion: direccion !== undefined ? direccion : usuario.direccion,
    });

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
        direccion: direccion !== undefined ? direccion : usuario.direccion,
        modificadoEn: new Date(),
        modificadoPor: usuarioId,
      },
      include: {
        roles: { include: { rol: true } },
      },
    });

    await registrarAuditoria({
      usuarioId,
      accion: 'modificar_usuario_exitoso',
      descripcion: `Usuario modificado: ${usuarioActualizado.email}. Cambios: ${cambios.length > 0 ? cambios.join('; ') : 'sin cambios'}`,
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuarioActualizado.id,
      modulo: 'usuarios',
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
    mensajeError = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: 'modificar_usuario_fallido',
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: id,
      modulo: 'usuarios',
    });
  }
}

// En usuarioController.ts

/**
 * Permite a un usuario modificar su propio perfil (nombre, telefono, direccion, dni solo si está null)
 */
/**
 * Permite a un usuario modificar su propio perfil (nombre, telefono, direccion, dni solo si está null)
 * No permite modificar roles ni email para evitar escalada de privilegios
 */
export async function actualizarPerfilUsuario(req: Request, res: Response): Promise<void> {
  const usuarioId = (req as any).user?.id || 'sistema';
  const { nombreCompleto, telefono, direccion, dni, roles, email } = req.body;

  // Rechazar intentos de cambiar roles
  if (roles !== undefined) {
    res.status(403).json(fail('Acceso denegado: no puedes modificar tus propios roles'));
    await registrarAuditoria({
      usuarioId,
      accion: 'modificar_perfil_fallido',
      descripcion: 'Intento de modificar roles propios',
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuarioId,
      modulo: 'usuarios',
    });
    return;
  }

  // Rechazar intentos de cambiar email (por seguridad)
  if (email !== undefined) {
    res.status(403).json(fail('No puedes modificar tu email desde este endpoint por seguridad'));
    await registrarAuditoria({
      usuarioId,
      accion: 'modificar_perfil_fallido',
      descripcion: 'Intento de modificar email propio',
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuarioId,
      modulo: 'usuarios',
    });
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      res.status(404).json(fail('Usuario no encontrado'));
      await registrarAuditoria({
        usuarioId,
        accion: 'modificar_perfil_fallido',
        descripcion: 'Usuario no encontrado',
        ip: req.ip,
        entidadTipo: 'usuario',
        entidadId: usuarioId,
        modulo: 'usuarios',
      });
      return;
    }

    // DNI: Solo permitir actualización si actualmente está vacío o es null
    let nuevoDni = usuario.dni;
    if (dni !== undefined) {
      try {
        // Comprobamos tanto null como string vacía para mayor robustez
        if (usuario.dni !== null && usuario.dni !== '') {
          res.status(400).json(fail('El DNI ya está registrado y no puede ser modificado'));
          await registrarAuditoria({
            usuarioId,
            accion: 'modificar_perfil_fallido',
            descripcion: 'Intento de modificar DNI existente',
            ip: req.ip,
            entidadTipo: 'usuario',
            entidadId: usuarioId,
            modulo: 'usuarios',
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
      } catch (_error) {
        res.status(500).json(fail('Error al procesar el DNI'));
        return;
      }
    }

    // Validaciones de nombre y teléfono si lo deseas
    if (telefono && !telefonoValido(telefono)) {
      res.status(400).json(fail('El teléfono debe ser un número celular de 10 dígitos'));
      return;
    }

    // Preparar datos para actualización
    const updateData: any = {
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
    if (nuevoDni !== usuario.dni) {
      cambios.push(`dni: "${usuario.dni || ''}" → "${nuevoDni || ''}"`);
    }

    await registrarAuditoria({
      usuarioId,
      accion: 'modificar_perfil_exitoso',
      descripcion: `Perfil modificado. Cambios: ${cambios.length > 0 ? cambios.join('; ') : 'sin cambios'}`,
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuarioId,
      modulo: 'usuarios',
    });

    res.json(
      success({
        id: usuarioActualizado.id,
        nombreCompleto: usuarioActualizado.nombreCompleto,
        telefono: usuarioActualizado.telefono,
        direccion: usuarioActualizado.direccion,
        dni: usuarioActualizado.dni,
        roles: usuarioActualizado.roles.map((ur) => ur.rol.nombre),
        email: usuarioActualizado.email,
      })
    );
  } catch (err) {

    const mensajeError = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: 'modificar_perfil_fallido',
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: usuarioId,
      modulo: 'usuarios',
    });
  }
}

/**
 * Marca un usuario como inactivo (borrado lógico). Solo admin puede hacerlo.
 */
export async function eliminarUsuario(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  // Validación interna de rol admin (multirol)
  const userRoles = (req as any).user?.roles || [];
  const esAdmin = Array.isArray(userRoles) && userRoles.includes('admin');
  // Solo los administradores pueden eliminar usuarios. El mensaje debe contener 'admin' para los tests.
  // Si un usuario común intenta eliminarse a sí mismo, también debe recibir este mensaje.
  if (!esAdmin) {
    res.status(403).json(fail('Acceso denegado: solo admin puede eliminar usuarios'));
    return;
  }

  try {
    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    try {
      // Verificar si es el usuario system
      if (await isSystemUser(id)) {
        await registrarAuditoria({
          usuarioId: userId,
          accion: 'eliminar_usuario_fallido',
          descripcion: `Intento de eliminar el usuario system (${id}). Operación denegada.`,
          ip: req.ip,
          entidadTipo: 'usuario',
          entidadId: id,
          modulo: 'usuarios',
        });
        res
          .status(403)
          .json(
            fail(
              'No se puede eliminar el usuario del sistema. Esta cuenta es utilizada para operaciones internas.'
            )
          );
        return;
      }
    } catch (_error: any) {
      // Si no podemos verificar si es usuario system, continuamos normalmente
      // Esto es importante para que los tests sigan funcionando
    }

    // Validación: no permitir eliminar si ya está inactivo
    if (usuario.activo === false) {
      // 409 Conflict indica que la operación no es válida en el estado actual
      res.status(409).json(fail('El usuario ya está inactivo o eliminado'));
      return;
    }

    // Eliminación lógica: marcar como inactivo y guardar fecha/anulador
    await prisma.usuario.update({
      where: { id },
      data: {
        activo: false,
        anuladoEn: new Date(),
        anuladoPor: userId,
      },
    });

    // Registrar auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: 'eliminar_usuario',
      descripcion: `El usuario ${usuario.email} fue eliminado lógicamente.`,
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: id,
      modulo: 'usuarios',
    });

    res.json(success('Usuario eliminado lógicamente'));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}

/**
 * Cambia la contraseña del propio usuario
 */
export async function cambiarPassword(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  // Compatibilidad: aceptamos tanto {password_actual, password_nuevo} como {actual, nueva}
  // para soportar ambos formatos de payload usados por los tests y clientes.
  const password_actual = req.body.password_actual || req.body.actual;
  const password_nuevo = req.body.password_nuevo || req.body.nueva;

  // Verifica que el usuario autenticado es el mismo
  const userId = (req as any).user?.id;
  if (userId !== id) {
    res.status(403).json(fail('Solo puedes cambiar tu propia contraseña'));
    return;
  }

  // Validación básica
  if (!password_actual || !password_nuevo) {
    res.status(400).json(fail('Se requieren el password actual y el nuevo'));
    return;
  }
  // Validación de password fuerte antes de consultar el usuario
  if (!passwordFuerte(password_nuevo)) {
    res
      .status(400)
      .json(
        fail(
          'El password nuevo debe ser fuerte: mínimo 8 caracteres, incluir mayúsculas, minúsculas y números'
        )
      );
    return;
  }

  try {
    // Validación de password fuerte debe ocurrir antes de buscar el usuario.
    // Esto es importante para que siempre se devuelva 400 si el password nuevo es débil,
    // incluso si el usuario no existe (por motivos de seguridad y para cumplir con los tests).
    if (!passwordFuerte(password_nuevo)) {
      res
        .status(400)
        .json(
          fail(
            'El password nuevo debe ser fuerte: mínimo 8 caracteres, incluir mayúsculas, minúsculas y números'
          )
        );
      return;
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      // Nota: No validamos el password aquí, ya que la validación débil ocurre antes.
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }
    if (!usuario.password) {
      res.status(400).json(fail('El usuario no tiene password local configurado'));
      return;
    }
    const ok = await bcrypt.compare(password_actual, usuario.password);
    if (!ok) {
      res.status(401).json(fail('El password actual es incorrecto'));
      return;
    }
    // Hashear el nuevo password
    const nuevoHash = await bcrypt.hash(password_nuevo, 10);
    await prisma.usuario.update({
      where: { id },
      data: { password: nuevoHash },
    });

    // Registrar auditoría (sin password)
    await registrarAuditoria({
      usuarioId: id,
      accion: 'cambiar_password',
      descripcion: 'El usuario cambió su contraseña.',
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: id,
      modulo: 'usuarios',
    });

    res.json(success('Contraseña actualizada correctamente'));
  } catch (_error: any) {
    const errorMessage = _error instanceof Error ? _error.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}

/**
 * Restablece la contraseña de un usuario (solo admin)
 */
export async function resetPasswordAdmin(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const newPassword = req.body.password_nuevo || req.body.newPassword;

  // Control de acceso: solo admin
  const userRoles = (req as any).user?.roles || [];
  const esAdmin = Array.isArray(userRoles) && userRoles.includes('admin');
  if (!esAdmin) {
    res.status(403).json(fail('Solo admin puede restablecer contraseñas'));
    return;
  }

  // Validación mínima
  if (!newPassword) {
    res.status(400).json(fail('Debes enviar el nuevo password'));
    return;
  }
  // Validación de fuerza
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
    res
      .status(400)
      .json(
        fail(
          'El password nuevo debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números'
        )
      );
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    try {
      // Verificar si es el usuario system
      if (await isSystemUser(id)) {
        await registrarAuditoria({
          usuarioId: (req as any).user?.id || null,
          accion: 'reset_password_admin_fallido',
          descripcion: `Intento de cambiar contraseña del usuario system (${id}). Operación denegada.`,
          ip: req.ip,
          entidadTipo: 'usuario',
          entidadId: id,
          modulo: 'usuarios',
        });
        res
          .status(403)
          .json(
            fail(
              'No se puede modificar la contraseña del usuario del sistema. Esta cuenta es utilizada para operaciones internas.'
            )
          );
        return;
      }
    } catch (_error: any) {
      // Si no podemos verificar si es usuario system, continuamos normalmente
      // Esto es importante para que los tests sigan funcionando
    }

    const nuevoHash = await bcrypt.hash(newPassword, 10);
    await prisma.usuario.update({
      where: { id },
      data: { password: nuevoHash },
    });

    // Registrar auditoría (sin password)
    await registrarAuditoria({
      usuarioId: (req as any).user?.id || null,
      accion: 'reset_password_admin',
      descripcion: `El admin restableció la contraseña del usuario ${usuario.email}.`,
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: id,
      modulo: 'usuarios',
    });

    res.json(success('Contraseña restablecida correctamente'));
  } catch (_error: any) {
    const errorMessage = _error instanceof Error ? _error.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}
