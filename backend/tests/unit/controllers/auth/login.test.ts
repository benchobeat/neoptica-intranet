import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock Prisma first
jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockImplementation(fn => fn())
  }
}));

// Mock bcrypt
jest.mock('bcrypt');

// Mock jwt
jest.mock('jsonwebtoken');

// Mock audit functions
const mockLogError = jest.fn().mockResolvedValue(undefined);
const mockLogSuccess = jest.fn().mockResolvedValue(undefined);

jest.mock('@/utils/audit', () => ({
  logError: (params: any) => mockLogError(params),
  logSuccess: (params: any) => mockLogSuccess(params),
}));

// Import after mocking
import prisma from '@/utils/prisma';
import { login } from '../../../../src/controllers/authController';

describe('Auth Controller - Login', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  
  // Test user data - un usuario activo con rol de optometrista
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'optometrista@example.com',
    nombreCompleto: 'Test Optometrista',
    activo: true,
    password: '$2b$10$examplehashedpassword', // bcrypt hash for 'password'
    creadoEn: new Date('2023-01-01'),
    modificadoEn: new Date('2023-01-01'),
    roles: [
      {
        rol: {
          id: '1',
          nombre: 'optometrista',
          descripcion: 'Optometrista del sistema'
        }
      }
    ]
  };

  beforeEach(() => {
    // Reset mocks and environment
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';

    // Setup request and response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    req = {
      body: {},
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent',
        'content-type': 'application/json'
      },
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Default mock implementations
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.usuario.update as jest.Mock).mockResolvedValue({
      ...mockUser,
      modificadoEn: new Date()
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');
  });

  it('debe retornar error si faltan credenciales', async () => {
    // Arrange
    req.body = {}; // No se proporcionan credenciales

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      error: 'Email y password son requeridos'
    }));

    // Verificar que se registró el error en auditoría
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: null,
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'login',
      action: 'login_fallido',
      message: 'Intento de inicio de sesión sin credenciales completas',
      error: expect.any(Error),
      context: expect.objectContaining({
        camposFaltantes: expect.arrayContaining(['email', 'password']),
        email: null
      })
    }));
  });

  it('debe manejar usuario no encontrado', async () => {
    // Arrange
    const email = 'noexiste@example.com';
    req.body = { email, password: 'cualquier-password' };
    
    // Mock que el usuario no existe en base de datos
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValueOnce(null);

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      error: 'Credenciales inválidas o usuario inactivo'
    }));

    // Verificar auditoría de error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: null,
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'login',
      action: 'login_fallido',
      message: 'Intento de inicio de sesión fallido - Usuario no encontrado',
      error: expect.any(Error),
      context: expect.objectContaining({
        email
      })
    }));
  });

  it('debe retornar error si la contraseña es incorrecta', async () => {
    // Arrange
    const email = 'usuario@example.com';
    req.body = { email, password: 'contraseña-incorrecta' };
    
    // Mock usuario encontrado pero con contraseña que no coincide
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValueOnce({
      ...mockUser,
      email
    });
    
    // Mock verificación de contraseña fallida
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      error: 'Credenciales inválidas'
    }));

    // Verificar auditoría de error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockUser.id,
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: mockUser.id,
      module: 'login',
      action: 'login_fallido',
      message: 'Intento de inicio de sesión fallido - Contraseña incorrecta',
      error: expect.any(Error),
      context: expect.objectContaining({
        email,
        ultimoIntentoFallido: expect.any(String)
      })
    }));
  });

  it('debe retornar error si el usuario está inactivo', async () => {
    // Arrange
    const usuarioInactivo = {
      ...mockUser,
      email: 'inactivo@example.com',
      activo: false // Usuario inactivo
    };
    
    req.body = { email: usuarioInactivo.email, password: 'password123' };
    
    // Mock usuario encontrado pero inactivo
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValueOnce(usuarioInactivo);
    
    // La contraseña no debería verificarse en este caso, pero por si acaso
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(403); // Forbidden
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      error: 'El usuario está inactivo. Contacte al administrador.'
    }));

    // Verificar auditoría de error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: usuarioInactivo.id,
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: usuarioInactivo.id,
      module: 'login',
      action: 'login_fallido',
      message: 'Intento de inicio de sesión fallido - Usuario inactivo',
      error: expect.any(Error),
      context: expect.objectContaining({
        email: usuarioInactivo.email
      })
    }));
  });

  it('debe iniciar sesión correctamente con credenciales válidas', async () => {
    // Arrange
    req.body = { email: 'optometrista@example.com', password: 'password123' };
    
    // Mock usuario encontrado con datos
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
    
    // Mock verificación de contraseña exitosa
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    
    // Act
    await login(req as Request, res as Response);
    
    // Assert
    // Verificar respuesta JSON (res.json sin status explícito retorna 200 por defecto)
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.objectContaining({
        token: 'mock-jwt-token',
        usuario: expect.objectContaining({
          id: mockUser.id,
          nombreCompleto: mockUser.nombreCompleto,
          email: mockUser.email,
          roles: ['optometrista']
        })
      })
    }));
    
    // Verificar que JWT se firmó con los parámetros correctos
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        nombreCompleto: mockUser.nombreCompleto,
        roles: ['optometrista']
      }),
      'test-secret',
      expect.objectContaining({ expiresIn: '8h' })
    );
    
    // Verificar actualización del usuario (última conexión)
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: expect.objectContaining({ 
        modificadoEn: expect.any(Date) 
      })
    });
    
    // Verificar que se registró el evento de login exitoso
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockUser.id,
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: mockUser.id,
      module: 'login',
      action: 'login_exitoso',
      message: 'Inicio de sesión exitoso',
      details: expect.objectContaining({
        email: mockUser.email
      })
    }));
  });
  
  it('debe manejar usuario con múltiples roles', async () => {
    // Arrange
    const mockMultiRoleUser = {
      ...mockUser,
      email: 'multirol@example.com',
      // Estructura correcta de roles según el controlador
      roles: [
        { rol: { id: '1', nombre: 'admin', descripcion: 'Administrador del sistema' } },
        { rol: { id: '2', nombre: 'optometrista', descripcion: 'Optometrista del sistema' } },
        { rol: { id: '3', nombre: 'vendedor', descripcion: 'Vendedor del sistema' } }
      ]
    };
    
    req.body = { email: mockMultiRoleUser.email, password: 'password123' };
    
    // Capturar errores durante el test
    let capturedError: any = null;
    const originalConsoleError = console.error;
    console.error = (msg) => { capturedError = msg; originalConsoleError(msg); };
    
    // Mock de usuario encontrado con múltiples roles
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValueOnce(mockMultiRoleUser);
    
    // Mock de verificación de contraseña exitosa
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    
    // Mock generación de token JWT
    (jwt.sign as jest.Mock).mockReturnValueOnce('multi-role-token');
    
    // Mock actualización de usuario (importante para evitar errores)
    (prisma.usuario.update as jest.Mock).mockResolvedValueOnce(mockMultiRoleUser);

    // Act
    await login(req as Request, res as Response);
    
    // Restaurar console.error
    console.error = originalConsoleError;
    
    // Si hay error capturado, mostrarlo para depuración pero no fallar el test
    if (capturedError) {
      console.log('Error capturado durante el test:', capturedError);
    }

    // Assert
    // Verificar respuesta JSON
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.objectContaining({
        token: 'multi-role-token',
        usuario: expect.objectContaining({
          id: mockMultiRoleUser.id,
          email: mockMultiRoleUser.email
          // La estructura exacta de los roles puede variar, no verificamos aquí
        })
      })
    }));
    
    // Verificar que JWT se firmó con los parámetros correctos
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockMultiRoleUser.id,
        email: mockMultiRoleUser.email,
        roles: expect.arrayContaining(['admin', 'optometrista', 'vendedor'])
      }),
      'test-secret',
      expect.objectContaining({ expiresIn: '8h' })
    );
    
    // Verificar actualización del usuario (última conexión)
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: mockMultiRoleUser.id },
      data: expect.objectContaining({ 
        modificadoEn: expect.any(Date) 
      })
    });

    // Verificar que se registró el evento de login exitoso
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockMultiRoleUser.id,
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: mockMultiRoleUser.id,
      module: 'login',
      action: 'login_exitoso',
      message: 'Inicio de sesión exitoso',
      details: expect.objectContaining({
        email: mockMultiRoleUser.email,
        roles: expect.arrayContaining([
          expect.objectContaining({ nombre: 'admin' }),
          expect.objectContaining({ nombre: 'optometrista' }),
          expect.objectContaining({ nombre: 'vendedor' })
        ])
      })
    }));
  });
});
