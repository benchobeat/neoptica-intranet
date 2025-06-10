import { jest } from '@jest/globals';

// Mock completo de Prisma Client para pruebas unitarias
// Mock completo de Prisma Client para tests
const prismaMock = {
  color: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  $transaction: jest.fn().mockImplementation(arg => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    } else if (typeof arg === 'function') {
      return arg(prismaMock);
    }
    return Promise.resolve(arg);
  }),
  $connect: jest.fn().mockImplementation(() => Promise.resolve()),
  $disconnect: jest.fn().mockImplementation(() => Promise.resolve())
};

module.exports = {
  __esModule: true,
  PrismaClient: jest.fn().mockImplementation(() => prismaMock),
  default: prismaMock
};
