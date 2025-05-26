import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { success, fail } from "@/utils/response";
import bcrypt from "bcrypt";

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

  // Validación mínima
  if (!nombre_completo || !email || !password) {
    res.status(400).json(fail("Faltan datos obligatorios"));
    return;
  }

  // Validación de teléfono celular de 10 dígitos
  if (!telefonoValido(telefono)) {
    res
      .status(400)
      .json(fail("El teléfono debe ser un número celular de 10 dígitos"));
    return;
  }

  // Validación de email
  if (!emailValido(email)) {
    res.status(400).json(fail("El email no es válido"));
    return;
  }

  // Validación de password fuerte
  if (!passwordFuerte(password)) {
    res
      .status(400)
      .json(
        fail(
          "El password debe tener al menos 8 caracteres, mayúscula, minúscula y número"
        )
      );
    return;
  }

  // Control de acceso (solo admin)
  if ((req as any).user?.rol !== "admin") {
    res.status(403).json(fail("Solo admin puede crear usuarios"));
    return;
  }

  try {
    // ¿El email ya existe?
    const yaExiste = await prisma.usuario.findUnique({ where: { email } });
    if (yaExiste) {
      res.status(409).json(fail("El email ya está registrado"));
      return;
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(password, 10);

    // Rol a asignar: el que viene en el request, o "vendedor" por defecto
    const rolAsignar = rol || "vendedor";
    const rolObj = await prisma.rol.findUnique({
      where: { nombre: rolAsignar },
    });
    if (!rolObj) {
      res.status(400).json(fail("El rol especificado no existe"));
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
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json(fail(errorMessage));
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
  const { nombre_completo, email, telefono } = req.body;

  // Validación mínima
  if (!nombre_completo || !email) {
    res.status(400).json(fail("Faltan datos obligatorios"));
    return;
  }

  // Permitir solo si es admin o es el propio usuario
  const userId = (req as any).user?.id;
  const userRol = (req as any).user?.rol;
  if (userRol !== "admin" && userId !== id) {
    res.status(403).json(fail("Solo admin o el propio usuario pueden editar"));
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      res.status(404).json(fail("Usuario no encontrado"));
      return;
    }

    // ¿El nuevo email está en uso por otro usuario?
    if (email !== usuario.email) {
      const emailUsado = await prisma.usuario.findUnique({ where: { email } });
      if (emailUsado && emailUsado.id !== id) {
        res.status(409).json(fail("El email ya está registrado"));
        return;
      }
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: {
        nombre_completo,
        email,
        telefono,
      },
    });

    // Buscar rol principal del usuario (si lo necesitas mostrar)
    const usuarioRol = await prisma.usuario_rol.findFirst({
      where: { usuario_id: usuarioActualizado.id },
      include: { rol: true },
    });

    res.json(
      success({
        id: usuarioActualizado.id,
        nombre_completo: usuarioActualizado.nombre_completo,
        email: usuarioActualizado.email,
        telefono: usuarioActualizado.telefono,
        activo: usuarioActualizado.activo,
        rol: usuarioRol?.rol?.nombre || "usuario",
      })
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json(fail(errorMessage));
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

  // Solo admin puede eliminar usuarios
  const userRol = (req as any).user?.rol;
  if (userRol !== "admin") {
    res.status(403).json(fail("Solo admin puede eliminar usuarios"));
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      res.status(404).json(fail("Usuario no encontrado"));
      return;
    }

    // Borrado lógico: marca el usuario como inactivo
    await prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });

    res.json(success("Usuario marcado como inactivo"));
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
    res.json(success('Contraseña restablecida correctamente'));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}
