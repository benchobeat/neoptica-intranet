// Configuración inicial de los mocks
const mockCount = jest.fn();
const mockFindMany = jest.fn();
const mockLogError = jest.fn();
const mockLogSuccess = jest.fn();

// Mock de las funciones de auditoría
jest.mock('../../../../src/utils/audit', () => ({
  logError: mockLogError,
  logSuccess: mockLogSuccess,
}));

// Mock de la instancia de Prisma
jest.mock('../../../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      count: mockCount,
      findMany: mockFindMany,
    },
  },
}));

// Importar controlador y utilidades necesarias
import { Request, Response } from 'express';
import { listarUsuariosPaginados } from '../../../../src/controllers/usuarioController';

// Datos de prueba
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
    password: 'hashed_password',
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
    password: 'hashed_password',
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
const createMockRequest = (overrides: Partial<AuthenticatedRequest> = {}) => {
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

// Interfaz extendida para simular la respuesta de Express
interface MockResponse extends Omit<Response, 'json' | 'status' | 'send'> {
  json: jest.Mock;
  status: jest.Mock;
  send: jest.Mock;
}

// Función auxiliar para crear una respuesta simulada
const createMockResponse = (): MockResponse => {
  const res: Partial<MockResponse> = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res as MockResponse;
};

describe('listarUsuariosPaginados', () => {
  let req: AuthenticatedRequest;
  let res: MockResponse;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar solicitud y respuesta por defecto
    req = createMockRequest();
    res = createMockResponse();

    // Implementaciones por defecto de los mocks
    mockCount.mockResolvedValue(2);
    mockFindMany.mockResolvedValue(mockUsuarios);
  });

  afterEach(() => {
    // Limpiar mocks después de cada prueba
    jest.clearAllMocks();
  });

  it('debe devolver una lista paginada de usuarios (página 1)', async () => {
    // Preparación 
    req.query = {}; // Valores por defecto: page=1, pageSize=10

    // Ejecutar
    await listarUsuariosPaginados(req, res);

    // Verificar
    expect(mockCount).toHaveBeenCalledWith({
      where: {}
    });
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { nombreCompleto: 'asc' },
      skip: 0,
      take: 10,
      include: { roles: { include: { rol: true } } },
    });

    // Verificar el estado y datos de la respuesta
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: {
        items: expect.any(Array),
        total: 2,
        page: 1,
        pageSize: 10,
      },
      error: null,
    });

    // Verificar que tenemos el número esperado de elementos
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(responseData.items.length).toBe(2);
    
    // Verificar el registro de auditoría exitoso
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'listarUsuariosPaginados',
      action: 'listar_usuarios_paginados_exitoso',
      message: 'Se listaron 2 usuarios (página 1)',
      details: {
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1
      }
    });
  });

  it('debe aplicar filtros de búsqueda correctamente', async () => {
    // Arrange
    req.query = {
      searchText: 'admin',
      activo: 'true'
    };

    // Act
    await listarUsuariosPaginados(req, res);

    // Assert
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          nombreCompleto: expect.objectContaining({
            contains: 'admin',
            mode: 'insensitive'
          }),
          activo: true,
        }),
      })
    );
    
    // Verify audit log includes search parameters
    expect(mockLogSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Se listaron')
      })
    );
  });

  it('debe manejar errores de base de datos correctamente', async () => {
    // Preparación
    const dbError = new Error('Error de base de datos');
    mockCount.mockRejectedValueOnce(dbError);

    // Ejecutar
    await listarUsuariosPaginados(req, res);

    // Verificar
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener el listado paginado de usuarios.'
    });
    
    // Verificar registro de error en auditoría
    expect(mockLogError).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'listarUsuariosPaginados',
      action: 'error_listar_usuarios_paginados',
      message: 'Error al listar usuarios paginados',
      error: dbError,
      context: {
        page: 1,
        pageSize: 10,
        searchText: null
      }
    });
  });

  it('debe funcionar correctamente sin usuario autenticado', async () => {
    // Preparación
    req.user = undefined;
    
    // Ejecutar
    await listarUsuariosPaginados(req, res);
    
    // Verificar
    expect(mockFindMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    
    // Verificar que el registro de auditoría tiene userId indefinido cuando no hay autenticación
    expect(mockLogSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: undefined
      })
    );
  });
});
