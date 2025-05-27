import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { success, fail } from "@/utils/response";
import bcrypt from "bcrypt";
import { registrarAuditoria } from "@/utils/auditoria";

const prisma = new PrismaClient();

/**
 * Lista todos los usuarios (sin exponer password)
 */
export async function listarUsuarios(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        usuario_rol: { include: { rol: true } },
      },
    });

    // Mapear usuarios a formato seguro (sin password)
    const data = usuarios.map((usuario) => ({
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      rol: usuario.usuario_rol?.[0]?.rol?.nombre || "usuario",
    }));

    // Registrar auditoría de consulta de usuarios
    await registrarAuditoria({
      usuarioId: (req as any).user?.id || null,
      accion: "listar_usuarios",
      descripcion: `Se listaron ${data.length} usuarios`,
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "usuarios",
    });

    res.json(success(data));
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json(fail(errorMessage));
  }
}

/**
 * Obtiene un usuario por ID (sin exponer password)
 */
export async function obtenerUsuario(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        usuario_rol: { include: { rol: true } },
      },
    });

    if (!usuario) {
      res.status(404).json(fail("Usuario no encontrado"));
      return;
    }

    const data = {
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      rol: usuario.usuario_rol?.[0]?.rol?.nombre || "usuario",
    };

    // Registrar auditoría de consulta de usuario
    await registrarAuditoria({
      usuarioId: (req as any).user?.id || null,
      accion: "obtener_usuario",
      descripcion: `Se consultó el usuario: ${usuario.email}`,
      ip: req.ip,
      entidadTipo: "usuario",
      entidadId: usuario.id,
      modulo: "usuarios",
    });

    res.json(success(data));
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
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
  const { nombre_completo, email, password, telefono, rol } = req.body;
  const usuarioId = (req as any).user?.id || "sistema";
  let mensajeError = "";

  // Validación mínima
  if (!nombre_completo || !email || !password) {
    mensajeError = "Faltan datos obligatorios";
    res.status(400).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: "crear_usuario_fallido",
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "usuarios",
    });
    return;
  }

  // Validación de teléfono solo si viene
  if (telefono && !telefonoValido(telefono)) {
    mensajeError = "El teléfono debe ser un número celular de 10 dígitos";
    res.status(400).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: "crear_usuario_fallido",
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "usuarios",
    });
    return;
  }

  // Validación de email
  if (!emailValido(email)) {
    mensajeError = "El email no es válido";
    res.status(400).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: "crear_usuario_fallido",
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "usuarios",
    });
    return;
  }

  // Validación de password fuerte
  if (!passwordFuerte(password)) {
    mensajeError = "El password debe tener al menos 8 caracteres, mayúscula, minúscula y número";
    res.status(400).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: "crear_usuario_fallido",
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "usuarios",
    });
    return;
  }

  // Control de acceso (solo admin)
  if ((req as any).user?.rol !== "admin") {
    mensajeError = "Solo admin puede crear usuarios";
    res.status(403).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: "crear_usuario_fallido",
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "usuarios",
    });
    return;
  }

  try {
    // ¿El email ya existe?
    const yaExiste = await prisma.usuario.findUnique({ where: { email } });
    if (yaExiste) {
      mensajeError = "El email ya está registrado";
      res.status(409).json(fail(mensajeError));
      await registrarAuditoria({
        usuarioId,
        accion: "crear_usuario_fallido",
        descripcion: mensajeError,
        ip: req.ip,
        entidadTipo: "usuario",
        modulo: "usuarios",
      });
      return;
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(password, 10);

    // Rol a asignar: el que viene en el request, o "cliente" por defecto
    const rolAsignar = rol || "cliente";
    const rolObj = await prisma.rol.findUnique({
      where: { nombre: rolAsignar },
    });
    if (!rolObj) {
      mensajeError = "El rol especificado no existe";
      res.status(400).json(fail(mensajeError));
      await registrarAuditoria({
        usuarioId,
        accion: "crear_usuario_fallido",
        descripcion: mensajeError,
        ip: req.ip,
        entidadTipo: "usuario",
        modulo: "usuarios",
      });
      return;
    }

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre_completo,
        email,
        password: passwordHash,
        telefono,
        activo: true,
      },
    });

    // Asocia el usuario al rol solicitado
    await prisma.usuario_rol.create({
      data: {
        usuario_id: usuario.id,
        rol_id: rolObj.id,
      },
    });

    // Registrar auditoría con el rol en la descripción
    await registrarAuditoria({
      usuarioId,
      accion: "crear_usuario_exitoso",
      descripcion: `Usuario creado: ${usuario.email} (rol: ${rolObj.nombre})`,
      ip: req.ip,
      entidadTipo: "usuario",
      entidadId: usuario.id,
      modulo: "usuarios",
    });

    // Respuesta segura
    res.status(201).json(
      success({
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        telefono: usuario.telefono,
        activo: usuario.activo,
        rol: rolObj.nombre,
      })
    );
  } catch (err) {
    mensajeError = err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: "crear_usuario_fallido",
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: "usuario",
      modulo: "usuarios",
    });
  }
}

/**
 * Actualiza datos de un usuario (solo admin o self)
 */
export async function actualizarUsuario(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const { nombre_completo, email, telefono, dni } = req.body;
  const usuarioId = (req as any).user?.id || "sistema";
  let mensajeError = "";

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      mensajeError = "Usuario no encontrado";
      res.status(404).json(fail(mensajeError));
      await registrarAuditoria({
        usuarioId,
        accion: "modificar_usuario_fallido",
        descripcion: mensajeError,
        ip: req.ip,
        entidadTipo: "usuario",
        entidadId: id,
        modulo: "usuarios",
      });
      return;
    }

    // Validación de email
    if (email && !emailValido(email)) {
      mensajeError = "El email no es válido";
      res.status(400).json(fail(mensajeError));
      await registrarAuditoria({
        usuarioId,
        accion: "modificar_usuario_fallido",
        descripcion: mensajeError,
        ip: req.ip,
        entidadTipo: "usuario",
        entidadId: id,
        modulo: "usuarios",
      });
      return;
    }
    // Validación de teléfono
    if (telefono && !telefonoValido(telefono)) {
      mensajeError = "El teléfono debe ser un número celular de 10 dígitos";
      res.status(400).json(fail(mensajeError));
      await registrarAuditoria({
        usuarioId,
        accion: "modificar_usuario_fallido",
        descripcion: mensajeError,
        ip: req.ip,
        entidadTipo: "usuario",
        entidadId: id,
        modulo: "usuarios",
      });
      return;
    }

    // Lógica para dni: solo permitir si actualmente es null
    let nuevoDni = usuario.dni;
    if (dni !== undefined) {
      if (usuario.dni !== null) {
        mensajeError = "El DNI ya está registrado y no puede ser modificado";
        res.status(400).json(fail(mensajeError));
        await registrarAuditoria({
          usuarioId,
          accion: "modificar_usuario_fallido",
          descripcion: mensajeError,
          ip: req.ip,
          entidadTipo: "usuario",
          entidadId: id,
          modulo: "usuarios",
        });
        return;
      } else {
        nuevoDni = dni;
      }
    }

    // Validación de email duplicado (si se quiere cambiar el email)
    if (email && email !== usuario.email) {
      const emailExistente = await prisma.usuario.findUnique({ where: { email } });
      if (emailExistente && emailExistente.id !== usuario.id) {
        mensajeError = "El email ya está registrado por otro usuario";
        res.status(409).json(fail(mensajeError));
        await registrarAuditoria({
          usuarioId,
          accion: "modificar_usuario_fallido",
          descripcion: mensajeError,
          ip: req.ip,
          entidadTipo: "usuario",
          entidadId: id,
          modulo: "usuarios",
        });
        return;
      }
    }

    // Detectar cambios
    const cambios: string[] = [];
    if (nombre_completo && nombre_completo !== usuario.nombre_completo) {
      cambios.push(`nombre_completo: "${usuario.nombre_completo}" → "${nombre_completo}"`);
    }
    if (email && email !== usuario.email) {
      cambios.push(`email: "${usuario.email}" → "${email}"`);
    }
    if (telefono !== undefined && telefono !== usuario.telefono) {
      cambios.push(`telefono: "${usuario.telefono || ""}" → "${telefono || ""}"`);
    }
    if (nuevoDni !== usuario.dni) {
      cambios.push(`dni: "${usuario.dni || ""}" → "${nuevoDni || ""}"`);
    }

    // Actualiza el usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: {
        nombre_completo,
        email,
        telefono,
        dni: nuevoDni,
      },
    });

    await registrarAuditoria({
      usuarioId,
      accion: "modificar_usuario_exitoso",
      descripcion: `Usuario modificado: ${usuarioActualizado.email}. Cambios: ${cambios.length > 0 ? cambios.join("; ") : "sin cambios"}`,
      ip: req.ip,
      entidadTipo: "usuario",
      entidadId: usuarioActualizado.id,
      modulo: "usuarios",
    });

    res.json(
      success({
        id: usuarioActualizado.id,
        nombre_completo: usuarioActualizado.nombre_completo,
        email: usuarioActualizado.email,
        telefono: usuarioActualizado.telefono,
        dni: usuarioActualizado.dni,
        activo: usuarioActualizado.activo,
      })
    );
  } catch (err) {
    mensajeError = err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json(fail(mensajeError));
    await registrarAuditoria({
      usuarioId,
      accion: "modificar_usuario_fallido",
      descripcion: mensajeError,
      ip: req.ip,
      entidadTipo: "usuario",
      entidadId: id,
      modulo: "usuarios",
    });
  }
}

/**
 * Marca un usuario como inactivo (borrado lógico). Solo admin puede hacerlo.
 */
export async function eliminarUsuario(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      res.status(404).json(fail("Usuario no encontrado"));
      return;
    }

    // Eliminación lógica: marcar como inactivo y guardar fecha/anulador
    await prisma.usuario.update({
      where: { id },
      data: {
        activo: false,
        anulado_en: new Date(),
        anulado_por: (req as any).user?.id || null,
      },
    });

    // Registrar auditoría
    await registrarAuditoria({
      usuarioId: (req as any).user?.id || null,
      accion: "eliminar_usuario",
      descripcion: `El usuario ${usuario.email} fue eliminado lógicamente.`,
      ip: req.ip,
      entidadTipo: "usuario",
      entidadId: id,
      modulo: "usuarios",
    });

    res.json(success("Usuario eliminado lógicamente"));
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json(fail(errorMessage));
  }
}

/**
 * Cambia la contraseña del propio usuario
 */
export async function cambiarPassword(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { password_actual, password_nuevo } = req.body;

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
  // Password fuerte: mínimo 8 caracteres, mayúscula, minúscula, número
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password_nuevo)) {
    res.status(400).json(fail('El password nuevo debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números'));
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
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
      data: { password: nuevoHash }
    });

    // Registrar auditoría (sin password)
    await registrarAuditoria({
      usuarioId: id,
      accion: "cambiar_password",
      descripcion: `El usuario cambió su contraseña.`,
      ip: req.ip,
      entidadTipo: "usuario",
      entidadId: id,
      modulo: "usuarios",
    });

    res.json(success('Contraseña actualizada correctamente'));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}

/**
 * Restablece la contraseña de un usuario (solo admin)
 */
export async function resetPasswordAdmin(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { password_nuevo } = req.body;

  // Control de acceso: solo admin
  const userRol = (req as any).user?.rol;
  if (userRol !== 'admin') {
    res.status(403).json(fail('Solo admin puede restablecer contraseñas'));
    return;
  }

  // Validación mínima
  if (!password_nuevo) {
    res.status(400).json(fail('Debes enviar el nuevo password'));
    return;
  }
  // Validación de fuerza
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password_nuevo)) {
    res.status(400).json(fail('El password nuevo debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números'));
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      res.status(404).json(fail('Usuario no encontrado'));
      return;
    }

    const nuevoHash = await bcrypt.hash(password_nuevo, 10);
    await prisma.usuario.update({
      where: { id },
      data: { password: nuevoHash }
    });

    // Registrar auditoría (sin password)
    await registrarAuditoria({
      usuarioId: (req as any).user?.id || null,
      accion: "reset_password_admin",
      descripcion: `El admin restableció la contraseña del usuario ${usuario.email}.`,
      ip: req.ip,
      entidadTipo: "usuario",
      entidadId: id,
      modulo: "usuarios",
    });

    res.json(success('Contraseña restablecida correctamente'));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}
