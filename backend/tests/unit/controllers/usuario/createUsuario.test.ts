import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

// Mock modules before importing the controller
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockCreateMany = jest.fn();
const mockFindMany = jest.fn();
const mockTransaction = jest.fn();
const mockRegistrarAuditoria = jest.fn().mockResolvedValue(undefined);

jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
    usuarioRol: {
      createMany: mockCreateMany,
    },
    rol: {
      findMany: mockFindMany,
    },
    $transaction: mockTransaction,
  },
}));

jest.mock('@/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria,
}));

// Add a spy on bcrypt.hash to avoid actual hashing in tests
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Import controller after setting up mocks
import { crearUsuario } from '@/controllers/usuarioController';

// Test data
const testUserData = {
  nombreCompleto: 'Nuevo Usuario',
  email: 'nuevo@example.com',
  password: 'Password123', // Must meet strength requirements
  telefono: '1234567890',
  dni: '87654321',
  direccion: 'Calle Nueva 123',
  roles: ['admin'],
  activo: true,
  emailVerificado: false,
};

// Mock request and response
const mockRequest = (data: {
  body?: any;
  params?: any;
  query?: any;
  user?: {
    id: string;
    nombreCompleto?: string;
    email?: string;
    roles?: string[];
  };
} = {}) => ({
  ...data,
  ip: '127.0.0.1',
  headers: {},
  get: jest.fn(),
  header: jest.fn(),
  accepts: jest.fn(),
} as unknown as Request);

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('crearUsuario', () => {
  let req: Request;
  let res: Response;


  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockFindUnique.mockResolvedValue(null); // Default: no existing user
    mockFindMany.mockResolvedValue([{id: 'rol-id-1', nombre: 'admin'}]); // Default: role exists
    mockCreate.mockResolvedValue({
      ...testUserData, 
      id: 'new-user-id',
      password: 'hashed_password',
      activo: true,
      creadoEn: new Date(),
      creadoPor: 'admin-user-id',
      roles: [{
        rolId: 'rol-id-1',
        rol: {id: 'rol-id-1', nombre: 'admin'}
      }]
    });
    mockCreateMany.mockResolvedValue({count: 1});
    mockTransaction.mockImplementation(async (callback) => {
      // Simulamos el comportamiento de un transaction ejecutando el callback con nuestros mocks
      return await callback({
        usuario: { 
          findUnique: mockFindUnique,
          create: mockCreate 
        },
        rol: { 
          findMany: mockFindMany 
        },
        usuarioRol: { 
          createMany: mockCreateMany 
        }
      });
    });

    // Mock the response
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear un nuevo usuario correctamente', async () => {
    // Arrange
    req = mockRequest({
      body: testUserData,
      user: { id: 'admin-user-id', roles: ['admin'] },
    });

    // Act
    await crearUsuario(req, res);

    // Assert
    // Verify user creation
    expect(mockCreate).toHaveBeenCalled();
    
    // Verify role check and user creation were called
    const findManyCalled = mockFindMany.mock.calls.some(call => 
      call[0]?.where?.nombre?.in?.includes('admin')
    );
    const createCalled = mockCreate.mock.calls.length > 0;
    
    expect(findManyCalled).toBe(true);
    expect(createCalled).toBe(true);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          id: 'new-user-id',
          nombreCompleto: testUserData.nombreCompleto,
          email: testUserData.email,
        }),
      }),
    );

    // Verify audit was called with success
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'crear_usuario_exitoso',
        entidadId: 'new-user-id',
        descripcion: expect.any(String),
        modulo: 'usuarios',
        entidadTipo: 'usuario'
      })
    );
  });

  it('no debe permitir crear un usuario con email existente', async () => {
    // Arrange
    mockFindUnique.mockResolvedValue({ id: 'existing-user-id', email: testUserData.email });
    
    const req = mockRequest({
      body: testUserData,
      user: { id: 'admin-user-id', roles: ['admin'] },
    });

    // Act
    await crearUsuario(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        data: null,
        error: 'El email ya está registrado'
      })
    );

    // Verify audit
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'crear_usuario_fallido',
      })
    );
  });

  it('debe validar los roles', async () => {
    // Arrange
    // Simular que el rol no existe
    mockFindMany.mockResolvedValue([]); // NingÃºn rol encontrado
    
    // Es importante proporcionar un password vÃ¡lido para que llegue a la validaciÃ³n de roles
    const req = mockRequest({
      body: { 
        ...testUserData, 
        roles: ['role_inexistente'],
        password: 'Password123' // Password fuerte que pase la validaciÃ³n
      },
      user: { id: 'admin-user-id', roles: ['admin'] },
    });

    // Act
    await crearUsuario(req, res);

    // Assert
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { nombre: { in: ['role_inexistente'] } },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        data: null,
        error: 'Uno o más roles especificados no existen',
      }),
    );
  });

  it('debe manejar errores inesperados', async () => {
    // Arrange
    mockFindUnique.mockRejectedValue(new Error('Database error'));
    
    const req = mockRequest({
      body: { 
        ...testUserData,
        password: 'Password123' // Password fuerte que pase la validaciÃ³n previa
      },
      user: { id: 'admin-user-id', roles: ['admin'] },
    });

    // Act
    await crearUsuario(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('error'),
      }),
    );

    // Verify audit
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'crear_usuario_fallido',
      })
    );
  });

  it('solo debe permitir a administradores crear usuarios', async () => {
    // Arrange
    const nonAdminReq = mockRequest({
      body: { 
        ...testUserData,
        password: 'Password123' // Password fuerte que pase la validaciÃ³n previa
      },
      user: { 
        id: 'user-id',
        nombreCompleto: 'Usuario Regular',
        email: 'user@example.com',
        roles: ['vendedor']
      } as any, // Type assertion to avoid TypeScript error with roles
    });
    
    // Act
    await crearUsuario(nonAdminReq, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('admin'),
      }),
    );
  });
});
