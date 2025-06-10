// Mock de Prisma Client para pruebas unitarias

const prismaMock = {
  color: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  $transaction: jest.fn((operations) => Promise.all(operations)),
};

export { prismaMock };

// Configuración global para las pruebas
global.beforeEach(() => {
  jest.clearAllMocks();
});
