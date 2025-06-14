import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { resetPassword } from '../../../../src/controllers/authController';
import prisma from '@/utils/prisma';
import { registrarAuditoria } from '@/utils/audit';

// Mock the dependencies
jest.mock('bcrypt');
jest.mock('@/utils/prisma', () => ({
  usuario: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  resetToken: {
    findFirst: jest.fn(),
    updateMany: jest.fn(),
  },
}));

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
        descripcion: 'Token, email y password son requeridos',
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
        descripcion: 'Email no encontrado: test@example.com',
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
        descripcion: 'Token no encontrado o expirado para test@example.com',
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
        descripcion: 'Token inválido para test@example.com',
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
        descripcion: 'Password débil para test@example.com',
      })
    );
  });

  it('debe restablecer la contraseña correctamente', async () => {
    // Act
    await resetPassword(req as Request, res as Response);

    // Assert
    // Verify password was hashed
    expect(bcrypt.hash).toHaveBeenCalledWith('NewSecure123!', 10);
    
    // Verify user was updated with new password
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: {
        password: 'new-hashed-password',
        modificadoEn: expect.any(Date),
      },
    });

    // Verify all reset tokens were invalidated
    expect(prisma.resetToken.updateMany).toHaveBeenCalledWith({
      where: { usuarioId: mockUser.id },
      data: {
        expiresAt: expect.any(Date),
        modificadoEn: expect.any(Date),
      },
    });

    // Verify success response
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: 'Contraseña restablecida correctamente',
      })
    );

    // Verify audit log
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'reset_password',
        descripcion: 'Contraseña restablecida exitosamente para test@example.com',
        usuarioId: mockUser.id,
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
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'reset_password_fallido',
        descripcion: 'Database error',
      })
    );
  });
});
