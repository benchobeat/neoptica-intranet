import { jest } from '@jest/globals';

// Mock de Prisma Client para pruebas unitarias
export const prismaMock = {
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
  $transaction: jest.fn().mockImplementation(ops => Array.isArray(ops) ? Promise.all(ops) : Promise.resolve(ops)),
};

// Mock de la función de auditoría
export const auditoriaMock = jest.fn(
  async (): Promise<void> => {}
);

// Configuración para mockear req y res de Express
export const createMockRequest = (data: any = {}) => {
  const { body = {}, params = {}, query = {}, user = null, ip = '127.0.0.1' } = data;
  
  return {
    body,
    params,
    query,
    user: user || {
      id: 'test-user-id',
      email: 'test@example.com',
      nombreCompleto: 'Usuario Test' // Añadido el campo requerido
    },
    ip,
    headers: {}
  };
};

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Reseteo de mocks entre pruebas
export const resetAllMocks = () => {
  jest.resetAllMocks();
  Object.keys(prismaMock).forEach(key => {
    if (typeof prismaMock[key] === 'object' && prismaMock[key] !== null) {
      Object.keys(prismaMock[key]).forEach(method => {
        if (typeof prismaMock[key][method] === 'function' && 
            typeof prismaMock[key][method].mockReset === 'function') {
          prismaMock[key][method].mockReset();
        }
      });
    }
  });
  auditoriaMock.mockReset();
};
