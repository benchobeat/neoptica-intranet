import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

import { success, fail } from '@/utils/response';
import { logSuccess, logError } from '@/utils/audit';
import roles from '@/routes/roles';

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
    logSuccess({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'rol',
      module: 'roles',
      action: 'listar_roles',
      message: 'Roles listados exitosamente',
      details: {
        roles: roles.map((rol) => ({
          id: rol.id,
          nombre: rol.nombre,
          descripcion: rol.descripcion,
        })),
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
    logError({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'rol',
      module: 'listarRoles',
      action: 'listar_roles',
      message: 'Error al listar roles',
      error: errorMessage,
      context: {
        roles: roles,
      },
    });
  }
}

/**
 * Métodos no permitidos para roles (POST, PUT, DELETE)
 * Siempre responde 405 y mensaje claro.
 */
export function metodoNoPermitido(_req: Request, res: Response): void {
  logError({
    userId: _req.user?.id,
    ip: _req.ip,
    entityType: 'rol',
    module: 'metodoNoPermitido',
    action: 'metodo_no_permitido',
    message: 'Método no permitido',
    error: 'Método no permitido. 405',
    context: {
      roles: [],
    },
  });
  res
    .status(405)
    .json(
      fail(
        'Operación no permitida: los roles del sistema solo pueden ser consultados (solo lectura). Método no permitido.'
      )
    );
}
