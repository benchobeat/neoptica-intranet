// Import mocks first
import { prismaMock } from '../../../../tests/unit/__mocks__/prisma';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

// Helper function to create a properly typed mock user
const createMockUser = (overrides: any = {}) => ({
  id: '1',
  email: 'test@example.com',
  nombreCompleto: 'Test User',
  password: 'hashedpassword',
  activo: true,
  creadoEn: new Date(),
  creadoPor: 'system',
  modificadoEn: new Date(),
  modificadoPor: 'system',
  anuladoEn: null,
  anuladoPor: null,
  ultimoAcceso: null,
  ultimoIp: null,
  intentosFallidos: 0,
  roles: [
    { 
      rol: { 
        id: '1', 
        nombre: 'usuario', 
        descripcion: 'Usuario estándar',
        $on: jest.fn(),
        $transaction: jest.fn()
      },
      $on: jest.fn(),
      $transaction: jest.fn()
    }
  ],
  // Add Prisma client methods
  $on: jest.fn(),
  $transaction: jest.fn(),
  ...overrides
});

// Important: Mock Prisma first, before importing controller
jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn().mockImplementation(() => Promise.resolve(null)),
      update: jest.fn().mockImplementation(() => Promise.resolve({})),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([]))
    },
    usuarioRol: {
      findMany: jest.fn().mockImplementation(() => Promise.resolve([]))
    },
    $transaction: jest.fn().mockImplementation(fn => fn())
  }
}));

// Now import the controller and other dependencies
import prisma from '@/utils/prisma';
import { login } from '../../../../src/controllers/authController';
import { registrarAuditoria } from '@/utils/audit';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(false),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
}));

// Mock environment variables
const OLD_ENV = process.env;

// Test user data
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  nombreCompleto: 'Test User',
  activo: true,
  password: '$2b$10$examplehashedpassword', // bcrypt hash for 'password'
  creadoEn: new Date(),
  modificadoEn: new Date(),
  roles: []
};

describe('Auth Controller - Login', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks and environment
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
    process.env.JWT_SECRET = 'test-secret';

    // Reset all mocks before each test
    jest.clearAllMocks();
  
    // Reset Prisma mock implementations
    prismaMock.usuario = {
      findUnique: jest.fn().mockResolvedValue(null),
    };
    prismaMock.usuarioRol = {
      findMany: jest.fn().mockResolvedValue([]),
    };
    prismaMock.$transaction = jest.fn().mockImplementation(async (callback: any) => {
      return await callback({
        usuario: {
          update: jest.fn().mockImplementation((data: any) => 
            Promise.resolve({ ...mockUser, ...data.data })
          ),
        },
      });
    });
  
    // Reset other mocks
    (registrarAuditoria as jest.Mock).mockClear();
    (bcrypt.compare as jest.Mock).mockClear();
    (jwt.sign as jest.Mock).mockClear();

    // Configuración de req y res
    req = {
      body: {},
      ip: '127.0.0.1',
      headers: {},
    };

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    sendMock = jest.fn();

    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };

    // Set default mock implementations for bcrypt and jwt
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

    // Add console spy for debugging
    jest.spyOn(console, 'log').mockImplementation((message) => {
      process.stdout.write(`DEBUG: ${message}\n`);
    });
    
    jest.spyOn(console, 'error').mockImplementation((message) => {
      process.stdout.write(`ERROR: ${message}\n`);
    });
    
    // Reset prisma mocks before each test
    jest.mocked(prisma.usuario.findUnique).mockReset();
    jest.mocked(prisma.usuario.update).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe retornar error si faltan credenciales', async () => {
    // Arrange
    req.body = {}; // No email or password

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Email y password son requeridos',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'login_fallido',
        descripcion: expect.objectContaining({
          error: 'Email y password son requeridos',
          mensaje: expect.stringContaining('Intento de inicio de sesión sin credenciales completas'),
          camposFaltantes: expect.arrayContaining(['email', 'password']),
          ip: '127.0.0.1',
          timestamp: expect.any(String)
        })
      })
    );
  });

  it('debe retornar error si el usuario no existe', async () => {
    // Arrange
    req.body = { email: 'nonexistent@example.com', password: 'password' };
    (prismaMock.usuario.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Credenciales inválidas o usuario inactivo',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'login_fallido',
        descripcion: expect.objectContaining({
          mensaje: 'Intento de inicio de sesión fallido',
          email: 'nonexistent@example.com',
          accion: 'USUARIO_NO_ENCONTRADO',
          detalles: expect.objectContaining({
            razon: 'No existe un usuario con el email proporcionado'
          }),
          ip: '127.0.0.1',
          timestamp: expect.any(String)
        })
      })
    );
  });

  it('debe retornar error si el usuario está inactivo', async () => {
    // Arrange
    const inactiveUser = {
      id: 2,
      email: 'inactive@example.com',
      password: 'hashedpassword',
      nombre: 'Inactive',
      apellido: 'User',
      activo: false,
    };
    req.body = { email: 'inactive@example.com', password: 'password' };
    prismaMock.usuario.findUnique.mockResolvedValue(inactiveUser);

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Credenciales inválidas o usuario inactivo',
      })
    );
    
    // Verify audit log
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'login_fallido',
        modulo: 'auth',
        entidadTipo: 'usuario',
        ip: '127.0.0.1',
        descripcion: expect.objectContaining({
          mensaje: 'Intento de inicio de sesión fallido',
          error: 'Usuario no encontrado',
          email: 'inactive@example.com',
        }),
      })
    );
  });

  it('debe retornar error si la contraseña es incorrecta', async () => {
    // Arrange
    req.body = { email: 'test@example.com', password: 'wrongpassword' };
    prismaMock.usuario.findUnique.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Credenciales inválidas o usuario inactivo',
      })
    );
    
    // Verify audit log
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'login_fallido',
        modulo: 'auth',
        entidadTipo: 'usuario',
        ip: '127.0.0.1',
        descripcion: expect.objectContaining({
          mensaje: 'Intento de inicio de sesión fallido',
          error: 'Usuario no encontrado',
          email: 'test@example.com',
        }),
      })
    );
  });

  it('debe iniciar sesión correctamente con credenciales válidas', async () => {
    // Arrange
    req.body = { email: 'test@example.com', password: 'password' };
    
    const mockUserWithRole = createMockUser({
      ...mockUser,
      roles: [
        { rol: { id: '1', nombre: 'usuario', descripcion: 'Usuario estándar' } }
      ]
    });
    
    // Set up mocks with proper Prisma client methods
    jest.mocked(prisma.usuario.findUnique).mockResolvedValue(mockUserWithRole as any);
    
    // Mock bcrypt.compare
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    
    // Mock update with proper Prisma client instance
    const mockUpdatedUser = {
      ...mockUserWithRole,
      modificadoEn: new Date(),
      $on: jest.fn(),
      $transaction: jest.fn(),
      // Add all required Prisma client methods
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $executeRaw: jest.fn(),
      $executeRawUnsafe: jest.fn(),
      $queryRaw: jest.fn(),
      $queryRawUnsafe: jest.fn(),
      $use: jest.fn(),
      $extends: jest.fn()
    };
    
    jest.mocked(prisma.usuario.update).mockImplementation(() => mockUpdatedUser as any);

    // Mock JWT sign
    const mockToken = 'mocked-jwt-token';
    (jwt.sign as jest.Mock).mockImplementation((payload, secret, options) => {
      return mockToken;
    });

    // Act
    await login(req as Request, res as Response);

    // Assert - Check the response structure
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: {
          token: expect.any(String),
          usuario: {
            id: mockUser.id,
            nombreCompleto: 'Test User',
            email: 'test@example.com',
            roles: expect.arrayContaining(['usuario'])
          }
        }
      })
    );
    
    // Verify the token was generated with the correct payload
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: mockUser.id,
        email: mockUser.email,
        nombreCompleto: mockUser.nombreCompleto,
        roles: ['usuario']
      },
      expect.any(String),
      { expiresIn: '8h' }
    );

    // Verify JWT token was generated with correct data
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: mockUser.id,
        email: 'test@example.com',
        nombreCompleto: 'Test User',
        roles: ['usuario']
      },
      expect.any(String),
      { expiresIn: '8h' }
    );

    // Verify audit log
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'login_exitoso',
        modulo: 'auth',
        entidadTipo: 'usuario',
        usuarioId: mockUser.id,
        ip: '127.0.0.1',
        descripcion: expect.objectContaining({
          mensaje: 'Inicio de sesión exitoso',
          email: 'test@example.com',
          accion: 'LOGIN_EXITOSO',
          usuarioId: mockUser.id,
          detalles: expect.objectContaining({
            metodo: 'email',
            roles: [
              expect.objectContaining({ nombre: 'usuario' })
            ]
          })
        })
      })
    );
  });

  it('debe manejar múltiples roles correctamente', async () => {
    // Arrange
    req.body = { email: 'test@example.com', password: 'password' };
    
    const mockUserWithRoles = createMockUser({
      roles: [
        { rol: { id: '1', nombre: 'admin', descripcion: 'Administrador' } },
        { rol: { id: '2', nombre: 'vendedor', descripcion: 'Vendedor' } }
      ]
    });
    
    // Set up mocks with proper Prisma client methods
    jest.mocked(prisma.usuario.findUnique).mockResolvedValue(mockUserWithRoles as any);
    
    // Mock bcrypt.compare
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    
    // Mock JWT sign
    const mockToken = 'mocked-jwt-token';
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    // Mock update with proper Prisma client instance
    const mockUpdatedUser = {
      ...mockUserWithRoles,
      modificadoEn: new Date(),
      $on: jest.fn(),
      $transaction: jest.fn(),
      // Add all required Prisma client methods
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $executeRaw: jest.fn(),
      $executeRawUnsafe: jest.fn(),
      $queryRaw: jest.fn(),
      $queryRawUnsafe: jest.fn(),
      $use: jest.fn(),
      $extends: jest.fn()
    };
    
    jest.mocked(prisma.usuario.update).mockImplementation(() => mockUpdatedUser as any);

    // Act
    await login(req as Request, res as Response);
    
    // Assert - Check the response structure
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      data: {
        token: 'mocked-jwt-token',
        usuario: {
          id: mockUserWithRoles.id, // Use the ID from the mock user with roles
          nombreCompleto: 'Test User',
          email: 'test@example.com',
          roles: ['admin', 'vendedor'] // Expect exact match for roles array
        }
      },
      error: null
    });
    
    // Verify the token was generated with the correct payload
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: mockUserWithRoles.id, // Use the ID from the mock user with roles
        email: 'test@example.com',
        nombreCompleto: 'Test User',
        roles: ['admin', 'vendedor']
      },
      expect.any(String),
      { expiresIn: '8h' }
    );
    
    // Verify audit log
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'login_exitoso',
        modulo: 'auth',
        entidadTipo: 'usuario',
        entidadId: mockUserWithRoles.id,
        usuarioId: mockUserWithRoles.id,
        ip: '127.0.0.1',
        descripcion: expect.objectContaining({
          mensaje: 'Inicio de sesión exitoso',
          email: 'test@example.com',
          accion: 'LOGIN_EXITOSO',
          usuarioId: mockUserWithRoles.id,
          timestamp: expect.any(String),
          detalles: expect.objectContaining({
            metodo: 'email',
            roles: expect.arrayContaining([
              expect.objectContaining({ nombre: 'admin', id: '1', descripcion: 'Administrador' }),
              expect.objectContaining({ nombre: 'vendedor', id: '2', descripcion: 'Vendedor' })
            ]),
            usuario: expect.objectContaining({
              nombre: 'Test User',
              email: 'test@example.com',
              activo: true
            }),
            metadatos: expect.any(Object)
          })
        })
      })
    );
  });

  it('debe manejar errores inesperados', async () => {
    // Arrange
    req.body = { email: 'test@example.com', password: 'password' };
    const error = new Error('Database error');
    prismaMock.usuario.findUnique.mockRejectedValue(error);

    // Act
    await login(req as Request, res as Response);

    // Assert - The controller returns 401 for user not found
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Credenciales inválidas o usuario inactivo'
      })
    );
    
    // Verify audit log for error case
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'login_fallido',
        modulo: 'auth',
        entidadTipo: 'usuario',
        ip: '127.0.0.1',
        usuarioId: null,
        descripcion: expect.objectContaining({
          mensaje: 'Intento de inicio de sesión fallido',
          error: 'Usuario no encontrado',
          email: 'test@example.com',
          ip: '127.0.0.1',
          accion: 'USUARIO_NO_ENCONTRADO',
          detalles: expect.objectContaining({
            razon: 'No existe un usuario con el email proporcionado'
          })
        })
      })
    );
  });
});
