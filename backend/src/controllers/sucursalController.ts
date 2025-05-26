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
        actualizado_en: true,
      }
    });
    res.json(success(sucursales));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}
