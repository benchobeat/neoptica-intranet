import { jest } from '@jest/globals';

// Mock de la función de auditoría
export const registrarAuditoria = jest.fn(
  async (_params: any): Promise<void> => {}
);
