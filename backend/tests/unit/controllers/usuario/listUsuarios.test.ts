// First, set up the mocks
const mockFindMany = jest.fn();
const mockLogError = jest.fn();
const mockLogSuccess = jest.fn();

// Mock Prisma client and its methods
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      usuario: {
        findMany: mockFindMany,
      },
    })),
  };
});

// Mock the audit functions
jest.mock('@/utils/audit', () => ({
  logError: (...args: any[]) => mockLogError(...args),
  logSuccess: (...args: any[]) => mockLogSuccess(...args),
}));

// Mock the prisma instance
jest.mock('@/utils/prisma', () => ({
  usuario: {
    findMany: mockFindMany,
  },
}));

// Now import the modules that use the mocks
import { Request, Response } from 'express';
import { listarUsuarios } from '@/controllers/usuarioController';
import { success, fail } from '@/utils/response';

// Test data
const mockUsuarios = [
  {
    id: 'user-1',
    nombreCompleto: 'Admin User',
    email: 'admin@example.com',
    telefono: '1234567890',
    activo: true,
    roles: [
      { rol: { nombre: 'admin' } },
    ],
  },
  {
    id: 'user-2',
    nombreCompleto: 'Vendor User',
    email: 'vendor@example.com',
    telefono: '0987654321',
    activo: true,
    roles: [
      { rol: { nombre: 'vendedor' } },
    ],
  },
];

// Extended Request type for testing
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    nombreCompleto: string;
    roles: string[];
  };
  ip: string;
}

// Helper function to create a mock request
const createMockRequest = (overrides: Partial<AuthenticatedRequest> = {}): AuthenticatedRequest => {
  const req: any = {
    method: 'GET',
    url: '/api/usuarios',
    headers: {},
    ip: '127.0.0.1',
    params: {},
    query: {},
    body: {},
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      nombreCompleto: 'Test User',
      roles: ['admin'],
    },
    ...overrides,
  };
  return req as AuthenticatedRequest;
};

// Helper function to create a mock response
const createMockResponse = () => {
  const res: any = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('listarUsuarios', () => {
  let req: AuthenticatedRequest;
  let res: Response;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default request and response
    req = createMockRequest({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        nombreCompleto: 'Test User',
        roles: ['admin']
      },
      ip: '127.0.0.1'
    });
    
    res = createMockResponse();
    
    // Default mock implementation
    mockFindMany.mockResolvedValue(mockUsuarios);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver una lista de usuarios activos', async () => {
    // Act
    await listarUsuarios(req, res);

    // Assert
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { activo: true },
      include: { roles: { include: { rol: true } } },
    });

    // Verify response structure
    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    
    // Verify success response structure
    expect(responseData).toHaveProperty('ok', true);
    expect(responseData.error).toBeNull();
    expect(Array.isArray(responseData.data)).toBe(true);
    
    // Verify user data structure
    responseData.data.forEach((user: any) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('nombreCompleto');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('telefono');
      expect(user).toHaveProperty('activo', true);
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user).not.toHaveProperty('password');
    });
    
    // Verify audit log
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'listarUsuarios',
      action: 'listar_usuarios_exitoso',
      message: `Se listaron ${mockUsuarios.length} usuarios`,
      details: {
        totalUsuarios: mockUsuarios.length
      }
    });
  });

  it('debe manejar errores de base de datos correctamente', async () => {
    // Arrange
    const dbError = new Error('Error de conexión a la base de datos');
    mockFindMany.mockRejectedValueOnce(dbError);
    
    // Act
    await listarUsuarios(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      fail('Error de conexión a la base de datos')
    );
    
    // Verify error audit log
    expect(mockLogError).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'listarUsuarios',
      action: 'error_listar_usuarios',
      message: 'Error al listar usuarios',
      error: dbError,
      context: {
        totalUsuarios: 0
      }
    });
  });
  
  it('debe manejar el caso cuando no hay usuarios', async () => {
    // Arrange
    mockFindMany.mockResolvedValueOnce([]);
    
    // Act
    await listarUsuarios(req, res);
    
    // Assert
    expect(mockFindMany).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(success([]));
    
    // Verify audit log for empty result
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Se listaron 0 usuarios',
      details: { totalUsuarios: 0 }
    }));
  });
  
  it('debe funcionar correctamente sin usuario autenticado', async () => {
    // Arrange
    req.user = undefined;
    
    // Act
    await listarUsuarios(req, res);
    
    // Assert
    expect(mockFindMany).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.anything());
    
    // Verify audit log with null userId
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: null,
      ip: '127.0.0.1'
    }));
  });
});
