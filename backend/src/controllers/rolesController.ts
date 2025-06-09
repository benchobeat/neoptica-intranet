import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

import { success, fail } from '@/utils/response';

const prisma = new PrismaClient();

/**
 * Lista todos los roles
 */
/**
 * GET /api/roles — Solo lectura
 * Lista todos los roles predefinidos del sistema.
 */
export async function listarRoles(req: Request, res: Response): Promise<void> {
  try {
    const roles = await prisma.rol.findMany();
    res.json(success(roles));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}

/**
 * Métodos no permitidos para roles (POST, PUT, DELETE)
 * Siempre responde 405 y mensaje claro.
 */
export function metodoNoPermitido(_req: Request, res: Response): void {
  res
    .status(405)
    .json(
      fail(
        'Operación no permitida: los roles del sistema solo pueden ser consultados (solo lectura). Método no permitido.'
      )
    );
}
