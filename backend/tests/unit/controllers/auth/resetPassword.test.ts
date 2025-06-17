import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

// Mock Prisma first
jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
    },
    resetToken: {
      findFirst: jest.fn().mockResolvedValue(null),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: jest.fn().mockImplementation((fn) => fn())
  }
}));

// Mock bcrypt
jest.mock('bcrypt');

// Mock the audit functions
const mockLogError = jest.fn().mockResolvedValue(undefined);
const mockLogSuccess = jest.fn().mockResolvedValue(undefined);

jest.mock('@/utils/audit', () => ({
  logError: mockLogError,
  logSuccess: mockLogSuccess,
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
}));

// Import after setting up mocks
import prisma from '@/utils/prisma';
import { resetPassword } from '../../../../src/controllers/authController';
import { logError, logSuccess } from '@/utils/audit'; // Import types for better type checking

// Test data
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  nombreCompleto: 'Test User',
  activo: true,
};

const mockResetToken = {
  id: 'token-id',
  usuarioId: '550e8400-e29b-41d4-a716-446655440000',
  token: 'hashed-token',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  usado: false,
};

describe('Auth Controller - Reset Password', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;
  
  // Mock console.error to track calls
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock console.error to track calls
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore the original console.error after each test
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default request and response objects
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    
    req = {
      body: {},
      ip: '127.0.0.1',
    };
    
    res = {
      status: statusMock.mockReturnThis(),
      json: jsonMock,
    };

    // Reset mock implementations
    mockLogError.mockClear().mockResolvedValue(undefined);
    mockLogSuccess.mockClear().mockResolvedValue(undefined);
    
    // Reset Prisma mocks
    (prisma.usuario.findUnique as jest.Mock).mockReset();
    (prisma.usuario.update as jest.Mock).mockReset();
    (prisma.resetToken.findFirst as jest.Mock).mockReset();
    (prisma.resetToken.updateMany as jest.Mock).mockReset();
    
    // Reset bcrypt mocks
    (bcrypt.compare as jest.Mock).mockReset();
    (bcrypt.hash as jest.Mock).mockReset();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('debe retornar error si faltan campos requeridos', async () => {
    // Arrange
    req.body = {}; // No se proporciona token, email ni password

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      error: 'Token, email y password son requeridos',
      data: null
    });
    
    // Verify audit log
    expect(mockLogError).toHaveBeenCalledWith({
      userId: null,
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'resetPassword',
      action: 'error_reset_password',
      message: 'Faltan campos requeridos para restablecer la contraseña',
      error: expect.any(Error),
      context: {
        camposFaltantes: ['token', 'email', 'password']
      }
    });
  });

  it('debe restablecer la contraseña correctamente', async () => {
    // Arrange
    const newPassword = 'NewSecurePassword123!';
    req.body = {
      token: 'valid-token',
      email: 'test@example.com',
      password: newPassword,
    };

    // Mock bcrypt
    const hashedToken = await bcrypt.hash('valid-token', 10);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockImplementation((pass) => 
      Promise.resolve(`hashed-${pass}`)
    );

    // Mock Prisma
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.resetToken.findFirst as jest.Mock).mockResolvedValue({
      ...mockResetToken,
      token: hashedToken,
    });

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });

    expect(prisma.resetToken.findFirst).toHaveBeenCalledWith({
      where: {
        usuarioId: mockUser.id,
        expiresAt: { gt: expect.any(Date) },
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(bcrypt.compare).toHaveBeenCalledWith('valid-token', hashedToken);
    
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: {
        password: expect.stringMatching(/^hashed-NewSecurePassword123!$/),
        modificadoEn: expect.any(Date),
      },
    });

    expect(prisma.resetToken.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: mockUser.id },
      data: {
        expiresAt: expect.any(Date),
        modificadoEn: expect.any(Date),
      },
    });

    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      error: null,
      data: 'Contraseña restablecida correctamente'
    });
    
    // Verify success audit log
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: mockUser.id,
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: mockUser.id,
      module: 'resetPassword',
      action: 'reset_password_exitoso',
      message: 'Contraseña restablecida exitosamente',
      details: {
        email: 'test@example.com',
        metodo: 'email',
        longitudNuevaContrasena: newPassword.length,
        requisitosCumplidos: {
          longitudMinima: true,
          contieneMayuscula: true,
          contieneMinuscula: true,
          contieneNumero: true
        }
      }
    });
  });

  it('debe retornar error si el usuario no existe', async () => {
    // Arrange
    req.body = {
      token: 'valid-token',
      email: 'nonexistent@example.com',
      password: 'NewPassword123!',
    };

    // Mock Prisma para que no encuentre el usuario
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'nonexistent@example.com' },
    });
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      error: 'Usuario no encontrado',
      data: null
    });
    
    // Verify audit log
    expect(mockLogError).toHaveBeenCalledWith({
      userId: null,
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'resetPassword',
      action: 'error_reset_password',
      message: 'Intento de restablecimiento con email no registrado',
      error: expect.any(Error),
      context: {
        email: 'nonexistent@example.com'
      }
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Arrange
    req.body = {
      token: 'valid-token',
      email: 'test@example.com',
      password: 'NewPassword123!',
    };

    const error = new Error('Database error');
    
    // Mock para lanzar un error inesperado
    (prisma.usuario.findUnique as jest.Mock).mockRejectedValue(error);

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    // Verificar que se llamó a console.error con el mensaje de error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error en reset password:',
      'Database error'
    );
    
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      error: 'Error al restablecer la contraseña',
      data: null
    });

    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: null,
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'resetPassword',
      action: 'reset_password_error',
      message: 'Error al procesar el restablecimiento de contraseña',
      error: expect.any(Error),
      context: expect.objectContaining({
        email: 'test@example.com',
        tipoError: 'Error'
      })
    });
  });
  
  it('debe retornar error si el token no es válido', async () => {
    // Arrange
    req.body = {
      token: 'invalid-token',
      email: 'test@example.com',
      password: 'NewPassword123!',
    };

    const hashedToken = await bcrypt.hash('valid-token', 10);
    
    // Mock Prisma
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.resetToken.findFirst as jest.Mock).mockResolvedValue({
      ...mockResetToken,
      token: hashedToken,
    });
    
    // Mock bcrypt para que falle la comparación
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      error: 'Token inválido',
      data: null
    });
    
    expect(mockLogError).toHaveBeenCalledWith({
      userId: mockUser.id,
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: mockUser.id,
      module: 'resetPassword',
      action: 'reset_password_fallido',
      message: 'Intento de restablecimiento con token inválido',
      error: expect.any(Error),
      context: {
        email: 'test@example.com',
        razon: 'El token proporcionado no coincide con ningún token válido',
        longitudToken: 13
      }
    });
  });
  
  it('debe retornar error si la contraseña es débil', async () => {
    // Arrange
    const weakPassword = 'weak';
    req.body = {
      token: 'valid-token',
      email: 'test@example.com',
      password: weakPassword,
    };
    
    const hashedToken = await bcrypt.hash('valid-token', 10);
    
    // Mock Prisma
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.resetToken.findFirst as jest.Mock).mockResolvedValue({
      ...mockResetToken,
      token: hashedToken,
    });
    
    // Mock bcrypt para que pase la comparación del token
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
      data: null
    });
    
    expect(mockLogError).toHaveBeenCalledWith({
      userId: mockUser.id,
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: mockUser.id,
      module: 'resetPassword',
      action: 'error_reset_password',
      message: 'Intento de restablecimiento con contraseña débil',
      error: expect.any(Error),
      context: {
        email: 'test@example.com',
        requisitosCumplidos: {
          longitudMinima: false,
          contieneMayuscula: false,
          contieneMinuscula: true,
          contieneNumero: false
        },
        longitud: 4
      }
    });
  });
});
