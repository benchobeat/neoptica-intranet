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

// Extend the Express Request type to include our custom properties
type CustomRequest = Request & {
  user?: {
    id: string;
    roles: string[];
  };
  ip?: string;
};

// Mock request and response
const mockRequest = (options: Partial<CustomRequest> = {}): CustomRequest => {
  const req = {} as CustomRequest;
  req.ip = options.ip || '127.0.0.1';
  req.user = options.user || { id: 'test-user-id', roles: ['admin'] };
  req.get = jest.fn();
  req.header = jest.fn();
  req.accepts = jest.fn().mockReturnValue('application/json');
  req.acceptsCharsets = jest.fn().mockReturnValue(['utf-8']);
  return req;
};

const mockResponse = (): jest.Mocked<Response> => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.get = jest.fn();
  return res as jest.Mocked<Response>;
};



describe('listarUsuarios', () => {
  let req: CustomRequest;
  let res: jest.Mocked<Response>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default request and response
    req = mockRequest();
    res = mockResponse();
    
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
