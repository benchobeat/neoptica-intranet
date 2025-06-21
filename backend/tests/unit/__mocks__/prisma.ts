import { jest } from '@jest/globals';

/**
 * Mock de Prisma Client para pruebas unitarias
 *
 * Enfoque simplificado para evitar problemas de tipado
 * y mantener compatibilidad con pruebas existentes
 */

/**
 * Definimos un tipo genérico para los datos de entrada en los métodos mock
 * Esto nos permite tener un tipado mínimo sin la complejidad de los tipos completos de Prisma
 */
type MockData = Record<string, unknown>;

// Funciones mock básicas para cada entidad
const createBasicMockFunctions = () => ({
  create: jest.fn().mockImplementation(() => Promise.resolve({})),
  findMany: jest.fn().mockImplementation(() => Promise.resolve([])),
  findUnique: jest.fn().mockImplementation(() => Promise.resolve(null)),
  findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
  findFirstOrThrow: jest.fn().mockImplementation(() => Promise.resolve({})),
  findUniqueOrThrow: jest.fn().mockImplementation(() => Promise.resolve({})),
  update: jest.fn().mockImplementation((args: { data?: MockData; where?: MockData }) => {
    const data = args?.data || {};
    return Promise.resolve({
      ...data,
      id: '1',
      ultimoAcceso: new Date(),
    });
  }),
  updateMany: jest.fn().mockImplementation(() => Promise.resolve({ count: 0 })),
  delete: jest.fn().mockImplementation(() => Promise.resolve({})),
  deleteMany: jest.fn().mockImplementation(() => Promise.resolve({ count: 0 })),
  count: jest.fn().mockImplementation(() => Promise.resolve(0)),
  createMany: jest.fn().mockImplementation(() => Promise.resolve({ count: 1 })),
});

// Crear un mock reusable para todas las entidades
const prismaMock = {
  $transaction: jest.fn(<T>(operations: Promise<T>[]) => Promise.all(operations)),
  $on: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $use: jest.fn(),
  $executeRaw: jest.fn(),
  $queryRaw: jest.fn(),

  // Inicializar mocks para cada modelo
  categoria: createBasicMockFunctions(),
  usuario: {
    ...createBasicMockFunctions(),
    update: jest.fn().mockImplementation((args: { data?: MockData; where?: MockData }) => {
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
    ...createBasicMockFunctions(),
    findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
    create: jest.fn().mockImplementation((args: { data?: MockData }) => {
      return Promise.resolve({
        ...args.data,
        id: '1',
      });
    }),
  },
  marca: createBasicMockFunctions(),
  producto: createBasicMockFunctions(),
  sucursal: {
    ...createBasicMockFunctions(),
    create: jest.fn().mockImplementation((args: { data?: MockData }) => {
      return Promise.resolve({
        ...args.data,
        id: '123e4567-e89b-12d3-a456-426614174000',
        activo: args.data?.activo !== undefined ? args.data.activo : true,
        creadoEn: new Date(),
        creadoPor: 'test-user-id',
      });
    }),
    update: jest.fn().mockImplementation((args: { data?: MockData; where?: MockData }) => {
      return Promise.resolve({
        ...args.data,
        id: args.where?.id || '123e4567-e89b-12d3-a456-426614174000',
      });
    }),
  },
  rol: createBasicMockFunctions(),
  usuarioRol: createBasicMockFunctions(),
  // otros modelos según necesidad
};

// Función para resetear todos los mocks de Prisma
const resetPrismaMocks = () => {
  // Resetear todos los métodos de todas las entidades
  const entities = ['categoria', 'color', 'marca', 'producto', 'usuario', 'rol', 'usuarioRol'];
  entities.forEach((entity) => {
    const mockEntity = prismaMock[entity as keyof typeof prismaMock];
    if (mockEntity && typeof mockEntity === 'object') {
      Object.keys(mockEntity).forEach((method) => {
        const mockMethod = mockEntity[method as keyof typeof mockEntity];
        if (typeof mockMethod === 'function' && mockMethod.mockClear) {
          mockMethod.mockClear();
        }
      });
    }
  });

  // Resetear $transaction y otros métodos principales
  const clientMethods = [
    '$transaction',
    '$on',
    '$connect',
    '$disconnect',
    '$use',
    '$executeRaw',
    '$queryRaw',
  ];
  clientMethods.forEach((method) => {
    const mockMethod = prismaMock[method as keyof typeof prismaMock];
    if (typeof mockMethod === 'function' && mockMethod.mockClear) {
      mockMethod.mockClear();
    }
  });

  // Reinicializar $transaction
  prismaMock.$transaction.mockImplementation(<T>(ops: Promise<T>[]) => Promise.all(ops));
};

// Export the mock and reset function for use in tests
export { prismaMock, resetPrismaMocks };
