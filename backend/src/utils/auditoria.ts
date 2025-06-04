import { PrismaClient } from "@prisma/client";
import { getSystemUserId } from "./system";

const prisma = new PrismaClient();

function safeUUID(value: string | null | undefined): string | null {
  // Regex para UUID v4
  return typeof value === "string" && /^[0-9a-fA-F-]{36}$/.test(value) ? value : null;
}

/**
 * Registra una entrada en el log de auditoría
 * Si no se proporciona un usuarioId, utilizará el usuario system
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
    // Si no hay usuarioId proporcionado, usar el del sistema
    let finalUsuarioId = usuarioId;
    
    if (!finalUsuarioId) {
      try {
        finalUsuarioId = await getSystemUserId();
      } catch (systemErr) {
        console.error("Error obteniendo usuario del sistema:", systemErr);
        // Continuamos con usuarioId null, lo que podría causar un error de FK
        // pero es preferible a silenciar completamente el log de auditoría
      }
    }
    
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
    console.error("Error registrando auditoría:", err);
  }
}