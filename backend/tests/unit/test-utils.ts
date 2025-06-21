import { jest } from '@jest/globals';
import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

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
  // Otras propiedades comunes de respuesta que podrían ser útiles en tests
  set: jest.Mock;
  get: jest.Mock;
  cookie: jest.Mock;
  clearCookie: jest.Mock;
  [key: string]: unknown; // Cambiamos any por unknown para mayor seguridad
}

// Función para crear un mock de la petición HTTP
// Define el tipo para un usuario de prueba
interface TestUser {
  id: string;
  email: string;
  nombreCompleto: string;
  roles: string[];
  [key: string]: unknown;
}

export function createMockRequest(
  options: {
    body?: Record<string, unknown>;
    params?: ParamsDictionary;
    query?: ParsedQs;
    user?: TestUser;
    ip?: string;
  } = {}
): Partial<Request> {
  const {
    body = {},
    params = {} as ParamsDictionary,
    query = {} as ParsedQs,
    user = {
      id: 'test-user-id',
      email: 'test@example.com',
      nombreCompleto: 'Usuario de Prueba',
      roles: ['admin'],
    },
    ip = '127.0.0.1',
  } = options;

  return {
    body,
    params,
    query,
    user,
    ip,
    headers: {},
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
