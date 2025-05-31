import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function safeUUID(value: string | null | undefined): string | null {
  // Regex para UUID v4
  return typeof value === "string" && /^[0-9a-fA-F-]{36}$/.test(value) ? value : null;
}

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
    await prisma.log_auditoria.create({
      data: {
        usuarioId: safeUUID(usuarioId),
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