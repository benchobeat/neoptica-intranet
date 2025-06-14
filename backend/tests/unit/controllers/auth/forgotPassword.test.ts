import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { forgotPassword } from '../../../../src/controllers/authController';
import prisma from '@/utils/prisma';
import { registrarAuditoria } from '@/utils/audit';
import { sendMail } from '@/utils/mailer';

// Mock the dependencies
jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('@/utils/prisma', () => ({
  usuario: {
    findUnique: jest.fn(),
  },
  resetToken: {
    create: jest.fn(),
  },
}));

jest.mock('@/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/utils/mailer', () => ({
  sendMail: jest.fn().mockResolvedValue(undefined),
}));

// Test user data
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  nombreCompleto: 'Test User',
  activo: true,
};

describe('Auth Controller - Forgot Password', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let randomBytesMock: jest.Mock;
  let createHashMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks and environment
    jest.clearAllMocks();
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.JWT_SECRET = 'test-secret';

    // Setup request and response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    req = {
      body: {},
      ip: '127.0.0.1',
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Default mock implementations
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');
    
    // Mock crypto.randomBytes
    randomBytesMock = jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue('random-token'),
    });
    (crypto as any).randomBytes = randomBytesMock;
  });

  it('debe retornar error si falta el email', async () => {
    // Arrange
    req.body = {}; // No email provided

    // Act
    await forgotPassword(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Email es requerido',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'forgot_password_fallido',
        descripcion: 'Email es requerido',
      })
    );
  });

  it('debe manejar email no registrado de manera segura', async () => {
    // Arrange
    req.body = { email: 'nonexistent@example.com' };
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    await forgotPassword(req as Request, res as Response);

    // Assert
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: 'Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'forgot_password_fallido',
        descripcion: 'Email no encontrado: nonexistent@example.com',
      })
    );
    expect(prisma.resetToken.create).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('debe generar token y enviar email para email registrado', async () => {
    // Arrange
    req.body = { email: 'test@example.com' };
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.resetToken.create as jest.Mock).mockResolvedValue({
      id: 'token-id',
      usuarioId: mockUser.id,
      token: 'hashed-token',
      expiresAt: new Date(),
      usado: false,
    });

    // Act
    await forgotPassword(req as Request, res as Response);

    // Assert
    // Verify token was generated and hashed
    expect(randomBytesMock).toHaveBeenCalledWith(32);
    expect(bcrypt.hash).toHaveBeenCalledWith('random-token', 10);
    
    // Verify token was saved to database
    expect(prisma.resetToken.create).toHaveBeenCalledWith({
      data: {
        usuarioId: mockUser.id,
        token: 'hashed-token',
        expiresAt: expect.any(Date),
        createdAt: expect.any(Date),
      },
    });

    // Verify email was sent
    expect(sendMail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Restablecimiento de contraseña - Neóptica Intranet',
      html: expect.stringContaining('http://localhost:3000/reset-password?token=random-token'),
    });

    // Verify success response
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: 'Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.',
      })
    );

    // Verify audit log
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'forgot_password',
        descripcion: 'Solicitud de restablecimiento de contraseña para test@example.com',
        usuarioId: mockUser.id,
      })
    );
  });

  it('debe manejar errores inesperados', async () => {
    // Arrange
    req.body = { email: 'test@example.com' };
    const error = new Error('Database error');
    (prisma.usuario.findUnique as jest.Mock).mockRejectedValue(error);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    await forgotPassword(req as Request, res as Response);

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error en forgot password:', 'Database error');
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: 'Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'forgot_password_fallido',
        descripcion: 'Database error',
      })
    );

    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});
