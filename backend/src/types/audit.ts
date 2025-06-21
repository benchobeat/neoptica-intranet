import type { Color } from '@prisma/client';

/**
 * Type for tracking changes between two versions of a Color
 */
export type ColorChanges = {
  [K in keyof Omit<Color, 'creadoEn' | 'modificadoEn' | 'anuladoEn'>]?: {
    anterior: Color[K] | null;
    nuevo: Color[K] | null;
  };
};

/**
 * Type for the changes object used in audit logs
 */
export type AuditChanges = {
  [key: string]: {
    anterior: unknown;
    nuevo: unknown;
  };
};
