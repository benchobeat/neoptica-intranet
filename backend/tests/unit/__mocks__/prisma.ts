import { jest } from '@jest/globals';

/**
 * Mock de Prisma Client para pruebas unitarias
 * Esta es una implementación simplificada que evita problemas de tipado
 */

// Definir tipos para evitar errores TS
type MockReturnValue = any;
type MockArgs = any[];

// Funciones mock básicas para cada entidad
const mockEntityFunctions = {
  create: jest.fn().mockResolvedValue({} as MockReturnValue),
  findMany: jest.fn().mockResolvedValue([] as MockReturnValue[]),
  findUnique: jest.fn().mockResolvedValue(null as MockReturnValue),
  findFirst: jest.fn().mockResolvedValue(null as MockReturnValue),
  update: jest.fn().mockResolvedValue({} as MockReturnValue),
  updateMany: jest.fn().mockResolvedValue({ count: 0 } as { count: number }),
  delete: jest.fn().mockResolvedValue({} as MockReturnValue),
  count: jest.fn().mockResolvedValue(0 as number),
};

// Crear un mock reusable para todas las entidades
const prismaMock = {
  color: { ...mockEntityFunctions },
  marca: { ...mockEntityFunctions },
  producto: { ...mockEntityFunctions },
  $transaction: jest.fn(<T>(operations: Promise<T>[]) => Promise.all(operations)),
};

// Función para resetear todos los mocks de Prisma
const resetPrismaMocks = () => {
  // Resetear todos los métodos de todas las entidades
  ['color', 'marca', 'producto'].forEach(entity => {
    Object.keys(mockEntityFunctions).forEach(method => {
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
  resetPrismaMocks
};
