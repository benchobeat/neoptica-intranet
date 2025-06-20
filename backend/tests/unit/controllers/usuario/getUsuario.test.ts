// Importar tipos primero
import { Request, Response } from 'express';

// Definir mocks a nivel superior
const mockPrisma = {
  usuario: {
    findUnique: jest.fn(),
  },
};

const mockLogSuccess = jest.fn();
const mockLogError = jest.fn();

// Configurar mocks
jest.mock('@/utils/audit', () => ({
  logSuccess: (...args: any[]) => mockLogSuccess(...args),
  logError: (...args: any[]) => mockLogError(...args),
}));

jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Importar el controlador después de configurar los mocks
import { obtenerUsuario } from '@/controllers/usuarioController';

// Tipo de usuario extendido para pruebas
interface TestUser {
  id: string;
  email?: string;
  nombreCompleto?: string;
  roles?: string[] | Array<{ rol: { nombre: string } }>;
  [key: string]: any; // Permitir propiedades adicionales
}

// Tipo de respuesta mock para pruebas
type MockResponse = Response & {
  status: jest.Mock<MockResponse, [number]>;
  json: jest.Mock<MockResponse, [any]>;
  send: jest.Mock<MockResponse, [any?]>;
  mock: {
    calls: {
      status: any[];
      json: any[];
    };
  };
  mockClear: () => void;
  _json: any;
};

// Función auxiliar para crear una solicitud mock
const createMockRequest = (params: Record<string, any> = {}, user?: TestUser): Request => {
  const req: any = {
    params,
    method: 'GET',
    url: `/api/usuarios/${params.id}`,
    headers: {},
    ip: '127.0.0.1',
    user: user || { 
      id: 'test-user-id', 
      email: 'test@example.com', 
      nombreCompleto: 'Test User',
      roles: ['user']
    },
    get: jest.fn(),
    accepts: jest.fn().mockReturnValue('application/json'),
    header: jest.fn(),
  };
  return req as Request;
};

// Función auxiliar para crear una respuesta mock
const createMockResponse = (): MockResponse => {
  const res: any = {};
  
  // Mock de métodos esenciales de response
  res.status = jest.fn().mockImplementation((statusCode: number) => {
    res.statusCode = statusCode;
    return res;
  });
  
  res.json = jest.fn().mockImplementation((data: any) => {
    res._json = data;
    return res;
  });
  
  res.send = jest.fn().mockReturnValue(res);
  
  // Seguimiento para pruebas
  res.mock = {
    calls: {
      status: [],
      json: [],
    },
  };
  
  // Rastrear llamadas a status
  const originalStatus = res.status;
  res.status = jest.fn((...args) => {
    res.mock.calls.status.push(args);
    return originalStatus.apply(res, args);
  });
  
  // Rastrear llamadas a json
  const originalJson = res.json;
  res.json = jest.fn((...args) => {
    res.mock.calls.json.push(args);
    return originalJson.apply(res, args);
  });
  
  // Función para limpiar los mocks
  res.mockClear = () => {
    res.mock.calls.status = [];
    res.mock.calls.json = [];
    res.status.mockClear();
    res.json.mockClear();
    res.send.mockClear();
  };
  
  return res as MockResponse;
};

describe('obtenerUsuario', () => {
  let req: Request;
  let res: MockResponse;
  const mockUserId = 'test-user-id';
  const mockAdminUser = { 
    id: mockUserId, 
    email: 'admin@example.com', 
    nombreCompleto: 'Admin User',
    roles: ['admin']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = createMockRequest({ id: mockUserId }, mockAdminUser);
    res = createMockResponse();
    mockPrisma.usuario.findUnique.mockReset();
    mockLogSuccess.mockReset();
    mockLogError.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('debe retornar un usuario por ID exitosamente', async () => {
    // Configurar
    const mockUser = {
      id: mockUserId,
      nombreCompleto: 'Test User',
      email: 'test@example.com',
      telefono: '1234567890',
      activo: true,
      direccion: 'Calle Falsa 123',
      dni: '12345678',
      roles: [{
        rol: { 
          id: 'role-id',
          nombre: 'ADMIN' 
        }
      }]
    };

    mockPrisma.usuario.findUnique.mockResolvedValueOnce(mockUser);

    // Ejecutar
    await obtenerUsuario(req, res);

    // Verificar
    expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
      include: {
        roles: { 
          include: { 
            rol: true 
          } 
        },
      },
    });

    const expectedData = {
      id: mockUser.id,
      nombreCompleto: mockUser.nombreCompleto,
      email: mockUser.email,
      telefono: mockUser.telefono,
      activo: mockUser.activo,
      direccion: mockUser.direccion,
      dni: mockUser.dni,
      roles: ['ADMIN']
    };

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expectedData,
        error: null
      })
    );

    // Verificar que se registró la auditoría exitosa
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: mockUserId,
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: mockUserId,
      module: 'obtenerUsuario',
      action: 'obtener_usuario',
      message: `Se consultó el usuario: ${mockUser.email}`,
      details: {
        usuarioId: mockUser.id,
        email: mockUser.email
      }
    });
  });

  it('debe manejar el caso cuando el usuario no existe', async () => {
    // Configurar
    const nonExistentId = 'non-existent-id';
    req.params.id = nonExistentId;
    mockPrisma.usuario.findUnique.mockResolvedValueOnce(null);

    // Ejecutar
    await obtenerUsuario(req, res);

    // Verificar
    expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: nonExistentId },
      include: {
        roles: { 
          include: { 
            rol: true 
          } 
        },
      },
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Usuario no encontrado',
        data: null
      })
    );

    // Verificar que se registró el error de auditoría
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockUserId,
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'obtenerUsuario',
      action: 'obtener_usuario_fallido',
      message: 'Usuario no encontrado',
      error: expect.any(Error),
      context: {
        usuarioId: nonExistentId
      }
    }));
  });

  it('debe manejar errores inesperados al obtener el usuario', async () => {
    // Configurar
    const error = new Error('Error de base de datos');
    mockPrisma.usuario.findUnique.mockRejectedValueOnce(error);

    // Ejecutar
    await obtenerUsuario(req, res);

    // Verificar
    expect(res.status).toHaveBeenCalledWith(500);
expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Error de base de datos',
        data: null
      })
    );

    // Verificar que se registró el error de auditoría
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockUserId,
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'obtenerUsuario',
      action: 'obtener_usuario_fallido',
      message: 'Error al obtener usuario',
      error: error,
      context: {
        usuarioId: mockUserId,
        email: 'admin@example.com'
      }
    }));
  });

  it('debe manejar correctamente un usuario con múltiples roles', async () => {
    // Configurar
    const mockUser = {
      id: mockUserId,
      nombreCompleto: 'Usuario con Múltiples Roles',
      email: 'multiroles@example.com',
      telefono: '1234567890',
      activo: true,
      direccion: 'Calle Múltiple 123',
      dni: '87654321',
      roles: [
        { rol: { id: 'role-1', nombre: 'ADMIN' } },
        { rol: { id: 'role-2', nombre: 'VENDEDOR' } },
        { rol: { id: 'role-3', nombre: 'INVENTARIO' } }
      ]
    };

    mockPrisma.usuario.findUnique.mockResolvedValueOnce(mockUser);

    // Ejecutar
    await obtenerUsuario(req, res);

    // Verificar
    expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
      include: {
        roles: { 
          include: { 
            rol: true 
          } 
        },
      },
    });

    const expectedData = {
      id: mockUser.id,
      nombreCompleto: mockUser.nombreCompleto,
      email: mockUser.email,
      telefono: mockUser.telefono,
      activo: mockUser.activo,
      direccion: mockUser.direccion,
      dni: mockUser.dni,
      roles: ['ADMIN', 'VENDEDOR', 'INVENTARIO']
    };

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expectedData,
        error: null
      })
    );

    // Verificar que se registró la auditoría exitosa
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: mockUserId,
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: mockUserId,
      module: 'obtenerUsuario',
      action: 'obtener_usuario',
      message: `Se consultó el usuario: ${mockUser.email}`,
      details: {
        usuarioId: mockUser.id,
        email: mockUser.email
      }
    });
  });
});
