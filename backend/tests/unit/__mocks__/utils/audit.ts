import { jest } from '@jest/globals';

import type { AuditoriaParams } from '../../../../src/utils/audit';

// Mock de la función de auditoría
export const registrarAuditoria = jest.fn(async (_params: AuditoriaParams): Promise<void> => {});

export const logSuccess = jest.fn(async (_params: AuditoriaParams): Promise<void> => {});

export const logError = jest.fn(async (_params: AuditoriaParams): Promise<void> => {});
