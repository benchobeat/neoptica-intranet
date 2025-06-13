// Import the controller first to avoid hoisting issues
import { Request, Response } from 'express';
import { obtenerUsuario } from '@/controllers/usuarioController';
import { mockUsuarioAdmin } from '@/../tests/unit/__fixtures__/usuarioFixtures';
import { success, fail } from '@/utils/response';

// Mock Prisma client and audit utility
const mockFindUnique = jest.fn();
const mockRegistrarAuditoria = jest.fn().mockResolvedValue(undefined);

// Mock the modules after imports
jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn().mockImplementation((...args) => mockFindUnique(...args)),
    },
  },
}));

jest.mock('@/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockImplementation((...args) => mockRegistrarAuditoria(...args)),
}));

// Re-import to use the mocks
jest.mock('@/controllers/usuarioController', () => {
  const original = jest.requireActual('@/controllers/usuarioController');
  return {
    ...original,
  };
});

// Mock request and response
const mockRequest = (params: Record<string, any> = {}) => ({
  params,
  ip: '127.0.0.1',
  user: { id: 'test-user-id' },
});

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.mock = {
    calls: {
      status: [],
      json: [],
    },
  };
  res.status.mockImplementation((statusCode: number) => {
    res.mock.calls.status.push(statusCode);
    return res;
  });
  res.json.mockImplementation((data: any) => {
    res.mock.calls.json.push(data);
    return res;
  });
  return res;
};

describe('obtenerUsuario', () => {
  let req: Request;
  let res: Response;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    req = mockRequest({ id: mockUsuarioAdmin.id });
    res = mockResponse();
    mockFindUnique.mockClear();
    mockRegistrarAuditoria.mockClear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('debe retornar un usuario por ID', async () => {
    // Arrange
    const mockUser = {
      ...mockUsuarioAdmin,
      password: 'hashedpassword',
      roles: [{
        id: 'role-id',
        rol: { nombre: 'ADMIN' }
      }]
    };

    mockFindUnique.mockResolvedValueOnce(mockUser);
    
    // Mock response methods
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    res.json = mockJson;
    res.status = mockStatus;

    // Act
    await obtenerUsuario(req, res);

    // Assert
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: mockUsuarioAdmin.id },
      include: {
        roles: { 
          include: { 
            rol: true 
          } 
        },
      },
    });

    const expectedData = {
      id: mockUsuarioAdmin.id,
      nombreCompleto: mockUsuarioAdmin.nombreCompleto,
      email: mockUsuarioAdmin.email,
      telefono: mockUsuarioAdmin.telefono,
      activo: mockUsuarioAdmin.activo,
      direccion: mockUsuarioAdmin.direccion,
      dni: mockUsuarioAdmin.dni,
      roles: ['ADMIN']
    };

    expect(mockJson).toHaveBeenCalledWith({
      ok: true,
      data: expectedData,
      error: null
    });
    expect(mockStatus).not.toHaveBeenCalled();
  });

  it('debe manejar usuario no encontrado', async () => {
    // Arrange
    mockFindUnique.mockResolvedValueOnce(null);
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnThis();
    res.json = mockJson;
    res.status = mockStatus;

    // Act
    await obtenerUsuario(req, res);

    // Assert
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Usuario no encontrado'
    });
  });

  it('no debe incluir la contraseña en la respuesta', async () => {
    // Arrange
    const mockUser = {
      ...mockUsuarioAdmin,
      password: 'hashedpassword',
      roles: [{
        id: 'role-id',
        rol: { nombre: 'ADMIN' }
      }]
    };
    mockFindUnique.mockResolvedValueOnce(mockUser);
    
    // Mock response methods
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    res.json = mockJson;
    res.status = mockStatus;

    // Act
    await obtenerUsuario(req, res);

    // Assert
    expect(mockFindUnique).toHaveBeenCalled();
    
    // Get the actual response data
    const responseCall = mockJson.mock.calls[0]?.[0];
    
    // If responseCall is null/undefined, the test will fail with a descriptive message
    expect(responseCall).toBeDefined();
    expect(responseCall.data).toBeDefined();
    
    // Check if password is not in the response
    if (responseCall?.data) {
      expect(responseCall.data).not.toHaveProperty('password');
    } else {
      // This will make the test fail with a descriptive message
      expect(responseCall).toHaveProperty('data');
    }
    
    expect(mockJson).toHaveBeenCalled();
  });

  it('debe manejar errores correctamente', async () => {
    // Arrange
    const error = new Error('Error de base de datos');
    mockFindUnique.mockRejectedValueOnce(error);
    
    // Mock response methods
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    res.json = mockJson;
    res.status = mockStatus;

    // Act
    await obtenerUsuario(req, res);
    
    // Wait for the async operations to complete
    await new Promise(process.nextTick);

    // Assert
    // Verify the error response structure and status code
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: expect.any(String)
    });
  });

  it('debe registrar la auditoría correctamente', async () => {
    // Arrange
    const mockUser = {
      ...mockUsuarioAdmin,
      roles: [{
        id: 'role-id',
        rol: { nombre: 'ADMIN' }
      }]
    };
    mockFindUnique.mockResolvedValueOnce(mockUser);
    
    // Mock response methods
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    res.json = mockJson;
    res.status = mockStatus;

    // Act
    await obtenerUsuario(req, res);
    
    // Wait for the async operations to complete
    await new Promise(process.nextTick);

    // Assert
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith({
      usuarioId: 'test-user-id',
      accion: 'obtener_usuario',
      descripcion: expect.stringContaining('Se consultó el usuario:'),
      ip: '127.0.0.1',
      entidadTipo: 'usuario',
      entidadId: mockUsuarioAdmin.id,
      modulo: 'usuarios',
    });
    
    // Verify the response is also correct
    expect(mockJson).toHaveBeenCalledWith({
      ok: true,
      data: expect.any(Object),
      error: null
    });
  });
});
