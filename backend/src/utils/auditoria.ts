import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function safeUUID(value: string | null | undefined): string | null {
  // Regex para UUID v4
  return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value) ? value : null;
}

/**
 * Registra una entrada en el log de auditoría
 * Si no se proporciona un usuarioId, se registrará como null
 */
export async function registrarAuditoria({
  usuarioId,
  accion,
  descripcion,
  ip,
  entidadTipo,
  entidadId,
  modulo,
}: {
  usuarioId: string | null;
  accion: string;
  descripcion?: string;
  ip?: string;
  entidadTipo?: string;
  entidadId?: string;
  modulo?: string;
}) {
  try {
    // Usar directamente el usuarioId proporcionado, que puede ser null
    // Esto ya no causará problemas de FK porque configuramos onDelete: SetNull
    // en la relación en el schema de Prisma
    const finalUsuarioId = usuarioId;

    await prisma.log_auditoria.create({
      data: {
        usuarioId: safeUUID(finalUsuarioId),
        accion,
        descripcion,
        ip,
        entidadTipo,
        entidadId,
        modulo,
      },
    });
  } catch (err) {
    console.error('Error registrando auditoría:', err);
  }
}
