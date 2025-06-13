import { jest } from '@jest/globals';

/**
 * Mock de Prisma Client para pruebas unitarias
 */

// Definir tipos básicos para los mocks
type MockFn = jest.Mock;

// Funciones mock básicas para cada entidad
const mockEntityFunctions = {
  create: jest.fn().mockImplementation(() => Promise.resolve({})),
  findMany: jest.fn().mockImplementation(() => Promise.resolve([])),
  findUnique: jest.fn().mockImplementation(() => Promise.resolve(null)),
  findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
  update: jest.fn().mockImplementation(() => Promise.resolve({})),
  updateMany: jest.fn().mockImplementation(() => Promise.resolve({ count: 0 })),
  delete: jest.fn().mockImplementation(() => Promise.resolve({})),
  count: jest.fn().mockImplementation(() => Promise.resolve(0)),
} as const;

// Crear un mock reusable para todas las entidades
const prismaMock: any = {
  $transaction: jest.fn(<T>(operations: Promise<T>[]) => Promise.all(operations)),
  // Inicializar mocks para cada modelo de Prisma
  $on: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $use: jest.fn(),
  $executeRaw: jest.fn(),
  $queryRaw: jest.fn(),

  // Inicializar mocks para cada modelo
  color: { ...mockEntityFunctions },
  marca: { ...mockEntityFunctions },
  producto: { ...mockEntityFunctions },
  sucursal: { ...mockEntityFunctions },
  // Agregar otros modelos según sea necesario
};

// Función para resetear todos los mocks de Prisma
const resetPrismaMocks = () => {
  // Resetear todos los métodos de todas las entidades
  ['color', 'marca', 'producto'].forEach((entity) => {
    Object.keys(mockEntityFunctions).forEach((method) => {
      prismaMock[entity][method].mockClear();
    });
  });

  // Resetear $transaction
  prismaMock.$transaction.mockClear();
  prismaMock.$transaction.mockImplementation(<T>(ops: Promise<T>[]) => Promise.all(ops));
};

// Exportar el mock y la función de reseteo para usar en tests
module.exports = {
  prismaMock,
  resetPrismaMocks,
};
