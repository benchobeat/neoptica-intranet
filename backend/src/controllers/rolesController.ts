import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { success, fail } from '@/utils/response';

const prisma = new PrismaClient();

/**
 * Lista todos los roles
 */
export async function listarRoles(req: Request, res: Response): Promise<void> {
  console.log('req.user en roles:', (req as any).user);
  try {
    const roles = await prisma.rol.findMany();
    res.json(success(roles));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json(fail(errorMessage));
  }
}
