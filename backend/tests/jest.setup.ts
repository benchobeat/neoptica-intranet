// Configuración global para Jest
import { jest } from '@jest/globals';

// Configurar el mock de Prisma
jest.mock('../src/config/prisma', () => {
  return {
    prisma: {
      color: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn((operations) => {
        return Array.isArray(operations) ? Promise.all(operations) : Promise.resolve(operations);
      }),
    },
  };
});

// Mock para la función de auditoría
jest.mock('../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockImplementation(() => Promise.resolve()),
}));

// Aumentar el timeout para tests más complejos
jest.setTimeout(10000);

// Suprimir logs durante los test
console.log = jest.fn();
console.info = jest.fn();
console.warn = jest.fn();
// Mantener los errores visibles
// console.error = jest.fn();

// Limpiar los mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
});
