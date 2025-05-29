import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { success, fail } from '@/utils/response';

const prisma = new PrismaClient();

/**
 * Lista todas las sucursales (solo activas)
 */
export async function listarSucursales(req: Request, res: Response): Promise<void> {
  try {
    const sucursales = await prisma.sucursal.findMany({
      where: { estado: true },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        latitud: true,
        longitud: true,
        telefono: true,
        email: true,
        estado: true,
        creado_en: true,
        modificado_en: true,
      }
    });
    res.json(success(sucursales));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}


/**
 * Crear Sucursal
 */
export async function crearSucursal(req: Request, res: Response): Promise<void> {
  const { nombre, direccion, latitud, longitud, telefono, email } = req.body;

  // Validación mínima
  if (!nombre || nombre.length < 3) {
    res.status(400).json(fail("El nombre es obligatorio (mínimo 3 caracteres)"));
    return;
  }
  if (telefono && !/^\d{10}$/.test(telefono)) {
    res.status(400).json(fail("El teléfono debe tener 10 dígitos"));
    return;
  }
  if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.status(400).json(fail("El email tiene formato inválido"));
    return;
  }

  try {
    // Verificar duplicidad de nombre o email (si aplica)
    const existeNombre = await prisma.sucursal.findFirst({ where: { nombre } });
    if (existeNombre) {
      res.status(409).json(fail("Ya existe una sucursal con ese nombre"));
      return;
    }
    if (email) {
      const existeEmail = await prisma.sucursal.findFirst({ where: { email } });
      if (existeEmail) {
        res.status(409).json(fail("Ya existe una sucursal con ese email"));
        return;
      }
    }

    const sucursal = await prisma.sucursal.create({
      data: {
        nombre,
        direccion,
        latitud: latitud ? Number(latitud) : undefined,
        longitud: longitud ? Number(longitud) : undefined,
        telefono,
        email,
        estado: true,
      },
    });

    res.status(201).json(success(sucursal));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json(fail(errorMessage));
  }
}

