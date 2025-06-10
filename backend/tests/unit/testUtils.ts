import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Importar el mock de Prisma Client
const prismaClientMock = require('./__mocks__/prismaClient');
const prismaMock = prismaClientMock.default;

// Interfaces para tipar correctamente nuestros mocks
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

// Reinicia todos los mocks entre pruebas
export function resetMocks() {
  jest.clearAllMocks();
  
  // Reinicia los mocks de Prisma
  Object.keys(prismaMock).forEach(key => {
    if (typeof prismaMock[key] === 'object' && prismaMock[key] !== null) {
      Object.keys(prismaMock[key]).forEach(method => {
        if (typeof prismaMock[key][method]?.mockReset === 'function') {
          prismaMock[key][method].mockReset();
        }
      });
    }
  });
}

export { prismaMock };
