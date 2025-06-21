import { jest } from '@jest/globals';

/**
 * Mock de Prisma Client para pruebas unitarias
 */

// Definir tipos básicos para los mocks
type MockFn = jest.Mock;

// Tipos para los mocks
type UpdateArgs = {
  data: Record<string, any>;
  where: Record<string, any>;
};

// Funciones mock básicas para cada entidad
const mockEntityFunctions = {
  create: jest.fn().mockImplementation(() => Promise.resolve({})),
  findMany: jest.fn().mockImplementation(() => Promise.resolve([])),
  findUnique: jest.fn().mockImplementation(() => Promise.resolve(null)),
  findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
  update: jest.fn().mockImplementation((args: any) => {
    // Handle both direct object and function arguments
    const data = args?.data || {};
    return Promise.resolve({
      ...data,
      id: '1',
      ultimoAcceso: new Date(),
    });
  }),
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
  categoria: {
    ...mockEntityFunctions
  },
  usuario: {
    ...mockEntityFunctions,
    update: jest.fn().mockImplementation((args: any) => {
      return Promise.resolve({
        ...args.data,
        id: args.where?.id || '1',
        ultimoAcceso: new Date(),
        ultimoIp: '127.0.0.1',
        intentosFallidos: 0,
        roles: [],
      });
    }),
  },
  color: { 
    ...mockEntityFunctions,
    findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
    create: jest.fn().mockImplementation((args: any) => {
      return Promise.resolve({
        ...args.data,
        id: args.id || '1',
      });
    }),
  },
  marca: { ...mockEntityFunctions },
  producto: { ...mockEntityFunctions },
  sucursal: { 
    ...mockEntityFunctions,
    create: jest.fn().mockImplementation((args: any) => {
      return Promise.resolve({
        ...args.data,
        id: args.id || '123e4567-e89b-12d3-a456-426614174000',
        activo: args.data.activo !== undefined ? args.data.activo : true,
        creadoEn: new Date(),
        creadoPor: 'test-user-id',
      });
    }),
    update: jest.fn().mockImplementation((args: any) => {
      return Promise.resolve({
        ...args.data,
        id: args.where?.id || '123e4567-e89b-12d3-a456-426614174000',
      });
    }),
  },
  rol: { ...mockEntityFunctions },
  usuarioRol: { ...mockEntityFunctions },
  // Agregar otros modelos según sea necesario
};

// Función para resetear todos los mocks de Prisma
const resetPrismaMocks = () => {
  // Resetear todos los métodos de todas las entidades
  const entities = ['color', 'marca', 'producto', 'usuario', 'rol', 'usuarioRol'];
  entities.forEach((entity) => {
    if (prismaMock[entity]) {
      Object.keys(mockEntityFunctions).forEach((method) => {
        if (prismaMock[entity][method]?.mockClear) {
          prismaMock[entity][method].mockClear();
        }
      });
    }
  });

  // Resetear $transaction
  prismaMock.$transaction.mockClear();
  prismaMock.$transaction.mockImplementation(<T>(ops: Promise<T>[]) => Promise.all(ops));
};

// Export the mock and reset function for use in tests
export { prismaMock, resetPrismaMocks };
