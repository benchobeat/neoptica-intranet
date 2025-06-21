import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Convierte un ID simple a un objeto de relación de Prisma usado para conexiones.
 *
 * @param {string | null | undefined} id - El ID a convertir
 * @returns {object | null} - Objeto de relación para Prisma o null si no hay ID
 */
export function toRelation<T extends string>(
  id: T | null | undefined
): { connect: { id: T } } | null {
  if (!id) return null;
  return { connect: { id } };
}

/**
 * Convierte un objeto con IDs directos a objetos de relación para Prisma.
 * Útil para transformar datos recibidos de formularios/API a formato compatible con Prisma.
 *
 * @param {Record<string, unknown>} data - Datos con IDs directos
 * @param {Record<string, string>} fieldMap - Mapeo entre campos ID y campos de relación
 * @returns {Record<string, unknown>} - Objeto con relaciones Prisma
 */
export function convertIdsToRelations(
  data: Record<string, unknown>,
  fieldMap: Record<string, string>
): Record<string, unknown> {
  const result = { ...data };

  // Itera sobre el mapa de campos para convertir IDs a relaciones
  Object.entries(fieldMap).forEach(([idField, relationField]) => {
    const idValue = data[idField];

    // Si hay un valor de ID, crea un objeto de relación y elimina el campo ID original
    if (idValue !== undefined && idValue !== null) {
      result[relationField] = { connect: { id: String(idValue) } };
      delete result[idField];
    }
  });

  return result;
}

/**
 * Extrae un valor string de un campo que puede ser un string directo o un objeto de operación Prisma
 *
 * @param field - El campo que puede ser string o NullableStringFieldUpdateOperationsInput
 * @returns string | null | undefined - El valor string extraído
 */
export function extractStringValue(
  field: string | Prisma.NullableStringFieldUpdateOperationsInput | null | undefined
): string | null | undefined {
  if (field === null || field === undefined) {
    // Devolvemos null o undefined directamente, ya que ambos son tipos válidos de retorno
    return field as null | undefined;
  }

  if (typeof field === 'string') {
    return field;
  }

  // Si es un objeto de operación Prisma, intentamos extraer el valor set
  return 'set' in field ? field.set : undefined;
}

/**
 * Convierte un valor string a un objeto de operación Prisma para actualizaciones
 *
 * @param value - El valor string a convertir
 * @returns - Objeto de operación Prisma
 */
export function toStringFieldUpdateOperation(
  value: string | null | undefined
): Prisma.NullableStringFieldUpdateOperationsInput | undefined {
  if (value === undefined) {
    return undefined;
  }

  return { set: value };
}

export default prisma;
