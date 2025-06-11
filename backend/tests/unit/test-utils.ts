import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Ya NO importamos el mock de Prisma Client directamente aquí
// Los archivos de test deben importarlo directamente desde './__mocks__/prisma'

// Mock de la función de auditoría
export const mockRegistrarAuditoria = jest.fn().mockImplementation(() => Promise.resolve());


// Interface para una respuesta Mock más completa
interface MockResponse {
  status: jest.Mock;
  json: jest.Mock;
  send: jest.Mock;
  end: jest.Mock;
  [key: string]: any;
}

// Función para crear un mock de la petición HTTP
export function createMockRequest(options: {
  body?: any;
  params?: any;
  query?: any;
  user?: any;
  ip?: string;
} = {}): Partial<Request> {
  const {
    body = {},
    params = {},
    query = {},
    user = {
      id: 'test-user-id',
      email: 'test@example.com',
      nombreCompleto: 'Usuario de Prueba',
      roles: ['admin']
    },
    ip = '127.0.0.1'
  } = options;

  return {
    body,
    params,
    query,
    user,
    ip,
    headers: {}
  };
}

// Función para crear un mock de la respuesta HTTP
export function createMockResponse(): MockResponse {
  const res: Partial<MockResponse> = {};
  
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  
  return res as MockResponse;
}

// Reseteo de mocks entre pruebas
export function resetMocks(): void {
  // Ya NO reseteamos el mock de Prisma desde aquí
  // Cada archivo de test debe importar y resetear el mock de Prisma directamente

  // Resetear el mock de auditoría
  mockRegistrarAuditoria.mockReset();
  mockRegistrarAuditoria.mockImplementation(() => Promise.resolve());
}

// Para mantener compatibilidad con código existente
export const resetAllMocks = resetMocks;
export const auditoriaMock = mockRegistrarAuditoria; // Mantener compatibilidad con nombre anterior

// Ya NO exportamos prismaMock desde aquí
// Los archivos de test deben importarlo directamente desde './__mocks__/prisma'
