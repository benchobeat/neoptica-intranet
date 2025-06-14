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
    $transaction: jest.fn().mockImplementation(fn => fn())
  }
}));

// Now import the controller and other dependencies
import prisma from '@/utils/prisma';
import { resetPassword } from '../../../../src/controllers/authController';
import { registrarAuditoria } from '@/utils/audit';

// Mock the rest of dependencies
jest.mock('bcrypt');
jest.mock('@/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
}));

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

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    req = {
      body: {
        token: 'valid-token',
        email: 'test@example.com',
        password: 'NewSecure123!',
      },
      ip: '127.0.0.1',
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Default mock implementations
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.resetToken.findFirst as jest.Mock).mockResolvedValue(mockResetToken);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
    (prisma.usuario.update as jest.Mock).mockResolvedValue({ ...mockUser, password: 'new-hashed-password' });
    (prisma.resetToken.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('debe retornar error si faltan campos requeridos', async () => {
    // Arrange
    req.body = {}; // Missing all required fields

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Token, email y password son requeridos',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'reset_password_fallido',
        descripcion: expect.objectContaining({
          mensaje: 'Faltan campos requeridos para restablecer la contraseña',
          error: 'Token, email y password son requeridos',
          camposFaltantes: ['token', 'email', 'password'],
          timestamp: expect.any(String)
        })
      })
    );
  });

  it('debe retornar error si el usuario no existe', async () => {
    // Arrange
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Usuario no encontrado',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'reset_password_fallido',
        descripcion: expect.objectContaining({
          mensaje: 'Intento de restablecimiento con email no registrado',
          email: 'test@example.com',
          accion: 'USUARIO_NO_ENCONTRADO',
          timestamp: expect.any(String)
        })
      })
    );
  });

  it('debe retornar error si el token no es válido o ha expirado', async () => {
    // Arrange
    (prisma.resetToken.findFirst as jest.Mock).mockResolvedValue(null);

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Token inválido o expirado',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'reset_password_fallido',
        descripcion: expect.objectContaining({
          mensaje: 'Intento de restablecimiento con token inválido o expirado',
          email: 'test@example.com',
          accion: 'TOKEN_INVALIDO_O_EXPIRADO',
          timestamp: expect.any(String),
          detalles: expect.objectContaining({
            razon: expect.any(String)
          })
        })
      })
    );
  });

  it('debe retornar error si el token no coincide', async () => {
    // Arrange
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Token inválido',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'reset_password_fallido',
        descripcion: expect.objectContaining({
          mensaje: 'Intento de restablecimiento con token inválido',
          email: 'test@example.com',
          accion: 'TOKEN_INVALIDO',
          timestamp: expect.any(String),
          detalles: expect.objectContaining({
            razon: expect.any(String)
          })
        })
      })
    );
  });

  it('debe retornar error si la contraseña es débil', async () => {
    // Arrange
    req.body.password = 'weak'; // Contraseña que no cumple con los requisitos

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'reset_password_fallido',
        modulo: 'auth',
        entidadTipo: 'usuario',
        entidadId: mockUser.id,
        usuarioId: mockUser.id,
        ip: '127.0.0.1',
        descripcion: expect.objectContaining({
          mensaje: 'Intento de restablecimiento con contraseña débil',
          email: 'test@example.com',
          accion: 'PASSWORD_DEBIL',
          timestamp: expect.any(String),
          detalles: expect.objectContaining({
            longitud: 4,
            requisitosCumplidos: expect.any(Object)
          })
        })
      })
    );
  });

  it('debe restablecer la contraseña correctamente', async () => {
    // Arrange
    const now = new Date();
    
    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(bcrypt.hash).toHaveBeenCalledWith('NewSecure123!', 10);
    const updateCall = (prisma.usuario.update as jest.Mock).mock.calls[0][0];
    expect(updateCall).toEqual(
      expect.objectContaining({
        where: { id: mockUser.id },
        data: {
          password: 'new-hashed-password',
          modificadoEn: expect.any(Date)
        }
      })
    );
    // Check that updateMany was called with the correct arguments
    expect(prisma.resetToken.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: mockUser.id },
      data: {
        modificadoEn: expect.any(Date),
        expiresAt: expect.any(Date)
      }
    });
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: 'Contraseña restablecida correctamente',
        error: null
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'reset_password_exitoso',
        modulo: 'auth',
        entidadTipo: 'usuario',
        entidadId: mockUser.id,
        usuarioId: mockUser.id,
        ip: '127.0.0.1',
        descripcion: expect.objectContaining({
          mensaje: 'Contraseña restablecida exitosamente',
          email: 'test@example.com',
          accion: 'CONTRASENA_RESTABLECIDA',
          timestamp: expect.any(String),
          detalles: expect.objectContaining({
            metodo: 'email',
            longitudNuevaContrasena: 13,
            requisitosCumplidos: {
              contieneMayuscula: true,
              contieneMinuscula: true,
              contieneNumero: true,
              longitudMinima: true
            }
          })
        })
      })
    );
  });

  it('debe manejar errores inesperados', async () => {
    // Arrange
    const error = new Error('Database error');
    (prisma.usuario.findUnique as jest.Mock).mockRejectedValue(error);

    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error en reset password:', 'Database error');
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Error al restablecer la contraseña',
      })
    );

    // Verify error audit log
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'reset_password_error',
        modulo: 'auth',
        entidadTipo: 'usuario',
        usuarioId: null,
        ip: '127.0.0.1',
        descripcion: expect.objectContaining({
          mensaje: 'Error al procesar el restablecimiento de contraseña',
          error: 'Database error',
          email: 'test@example.com',
          timestamp: expect.any(String),
          detalles: expect.objectContaining({
            accion: 'ERROR_RESTABLECIMIENTO_CONTRASENA',
            tipoError: 'Error'
          })
        })
      })
    );
  });
});
