/**
 * utils/system.ts
 * Utilidades para acceso a recursos de sistema y configuraciones globales
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Variable para cachear el ID y evitar consultas repetidas
let systemUserId: string | null = null;

/**
 * Obtiene el ID del usuario system utilizado para operaciones del sistema
 * Este usuario no debe usarse para login y sirve como actor para eventos automáticos
 *
 * @returns Promise<string> ID del usuario system
 * @throws Error si el usuario system no existe (requiere ejecutar seed)
 */
export async function getSystemUserId(): Promise<string> {
  if (systemUserId) return systemUserId;

  const systemUser = await prisma.usuario.findUnique({
    where: { email: 'system@internal.neoptica.com' },
  });

  if (!systemUser) {
    throw new Error(
      'Usuario de sistema no encontrado. Ejecuta el seed primero.' +
        ' Este usuario es necesario para registrar eventos del sistema.'
    );
  }

  systemUserId = systemUser.id;
  return systemUserId;
}

/**
 * Valida si un ID de usuario corresponde al usuario system
 * Útil para evitar eliminar o modificar el usuario system
 *
 * @param userId ID del usuario a validar
 * @returns Promise<boolean> true si es el usuario system, false si hay error o no coincide
 */
export async function isSystemUser(userId: string): Promise<boolean> {
  try {
    const sysUserId = await getSystemUserId();
    return userId === sysUserId;
  } catch {
    // Si no se puede determinar el ID del usuario system (entorno de pruebas),
    // asumimos que NO es el usuario system, para que las operaciones sigan funcionando
    console.log('TESTS: No se pudo validar si es usuario system, asumiendo que no lo es');
    return false;
  }
}
