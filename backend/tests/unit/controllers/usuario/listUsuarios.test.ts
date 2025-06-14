// Mock the Prisma client first to avoid hoisting issues
const mockFindMany = jest.fn();
const mockPrisma = {
  usuario: {
    findMany: mockFindMany,
  },
};

// Mock the Prisma client directly before any imports
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

// Mock the audit module
const mockRegistrarAuditoria = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria
}));

// Now import the controller and other dependencies
import { Request, Response } from 'express';
import { listarUsuarios } from '../../../../src/controllers/usuarioController';
import { mockUsuarioAdmin, mockUsuarioVendedor } from '../../__fixtures__/usuarioFixtures';

// Extended user type for testing
interface TestUser {
  id: string;
  email: string;
  nombreCompleto: string;
  roles: string[];
  [key: string]: any; // Allow any other properties
}

// Mock response type for testing
type MockResponse = Response & {
  status: jest.Mock<MockResponse, [number]>;
  json: jest.Mock<MockResponse, [any]>;
  send: jest.Mock<MockResponse, [any?]>;
  mockClear: () => void;
};

// Helper function to create a mock request
const mockRequest = (options: {
  user?: Partial<TestUser>;
  ip?: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
  body?: any;
} = {}): Request => {
  const req: any = {
    method: 'GET',
    url: '/api/usuarios',
    headers: {},
    ip: options.ip || '127.0.0.1',
    params: options.params || {},
    query: options.query || {},
    body: options.body || {},
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      nombreCompleto: 'Test User',
      roles: ['admin'],
      ...(options.user || {})
    },
    // Add other required Request properties
    get: jest.fn(),
    header: jest.fn(),
    accepts: jest.fn().mockReturnValue('application/json'),
    acceptsCharsets: jest.fn().mockReturnValue(['utf-8']),
    // Add other Express Request methods as needed
  };
  return req as Request;
};

// Helper function to create a mock response
const mockResponse = (): MockResponse => {
  const res: any = {};
  
  // Mock essential response methods
  res.status = jest.fn().mockImplementation((statusCode: number) => {
    res.statusCode = statusCode;
    return res;
  });
  
  res.json = jest.fn().mockImplementation((data: any) => {
    res._json = data;
    return res;
  });
  
  res.send = jest.fn().mockReturnValue(res);
  
  // Mock clear function
  res.mockClear = () => {
    res.status.mockClear();
    res.json.mockClear();
    res.send.mockClear();
  };
  
  return res as MockResponse;
};

describe('listarUsuarios', () => {
  let req: Request;
  let res: MockResponse;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default request and response
    req = mockRequest({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        nombreCompleto: 'Test User',
        roles: ['admin']
      }
    });
    res = mockResponse();
    mockFindMany.mockClear();
    mockRegistrarAuditoria.mockClear();
    
    // Default mock implementation
    mockFindMany.mockResolvedValue([mockUsuarioAdmin, mockUsuarioVendedor]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver una lista de usuarios activos', async () => {
    // Reset mocks before test
    jest.clearAllMocks();
    
    const mockUsuarios = [
      {
        ...mockUsuarioAdmin,
        id: 'user-1',
        password: 'hashedpassword',
        roles: [
          { rol: { nombre: 'ADMIN' } }
        ]
      },
      {
        ...mockUsuarioVendedor,
        id: 'user-2',
        password: 'hashedpassword',
        roles: [
          { rol: { nombre: 'VENDEDOR' } }
        ]
      },
    ];

    // Mock de la respuesta de Prisma
    mockFindMany.mockResolvedValue(mockUsuarios);

    // Mock the success function
    const mockSuccess = jest.fn().mockImplementation((data) => ({
      success: true,
      data
    }));
    
    // Mock the response object
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    // Call the controller function
    await listarUsuarios(req as Request, mockRes as unknown as Response);

    // Verify Prisma was called correctly
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { activo: true },
      include: { roles: { include: { rol: true } } },
    });

    // Verify response was sent with correct data
    expect(mockRes.json).toHaveBeenCalled();
    
    const responseData = (mockRes.json as jest.Mock).mock.calls[0][0];
    
    // Basic response structure
    expect(responseData).toHaveProperty('ok', true);
    expect(responseData.error).toBeNull();
    expect(Array.isArray(responseData.data)).toBe(true);
    
    // Verify user data structure
    responseData.data.forEach((user: any) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('nombreCompleto');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('activo', true);
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user).not.toHaveProperty('password');
    });
  });

  it('debe manejar errores correctamente', async () => {
    // Reset mocks before test
    jest.clearAllMocks();
    
    // Mock de un error inesperado
    const error = new Error('Error de base de datos');
    mockFindMany.mockRejectedValueOnce(error);

    // Mock de console.error para evitar ruido en la salida de prueba
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock response object
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await listarUsuarios(req as Request, mockRes as unknown as Response);

    try {
      // Verificar que se manejó el error correctamente
      expect(mockRes.status).toHaveBeenCalledWith(500);
      
      // Verificar que se llamó a res.json
      expect(mockRes.json).toHaveBeenCalled();
      
      // Obtener los argumentos con los que se llamó a res.json
      const errorResponse = (mockRes.json as jest.Mock).mock.calls[0][0];
      
      // Verificar la estructura de la respuesta de error
      expect(errorResponse).toHaveProperty('ok', false);
      expect(errorResponse.data).toBeNull();
      expect(typeof errorResponse.error).toBe('string');
      expect(errorResponse.error).toBe('Error de base de datos');
    } finally {
      // Limpiar el mock
      consoleErrorSpy.mockRestore();
    }
  });

  it('no debe incluir contraseñas en la respuesta', async () => {
    // Reset mocks before test
    jest.clearAllMocks();
    
    // Crear un usuario con contraseña
    const usuarioConPassword = {
      ...mockUsuarioAdmin,
      password: 'hashedpassword123',
      roles: [
        { rol: { nombre: 'ADMIN' } }
      ]
    };

    mockFindMany.mockResolvedValue([usuarioConPassword]);

    await listarUsuarios(req as Request, res as Response);

    // Verificar que se llamó a res.json
    expect(res.json).toHaveBeenCalled();
    
    // Obtener los argumentos con los que se llamó a res.json
    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    
    // Verificar que la respuesta no incluye la contraseña
    responseData.data.forEach((user: any) => {
      expect(user).not.toHaveProperty('password');
    });
  });
});
