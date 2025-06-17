import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Mock Prisma first
jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    resetToken: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockImplementation(fn => fn())
  }
}));

// Now import the controller and other dependencies
import prisma from '@/utils/prisma';
import { forgotPassword } from '../../../../src/controllers/authController';
import { registrarAuditoria } from '@/utils/audit';
import { sendMail } from '@/utils/mailer';

// Mock the rest of dependencies
jest.mock('bcrypt');
jest.mock('crypto');

// Mock audit functions
const mockLogError = jest.fn().mockResolvedValue(undefined);
const mockLogSuccess = jest.fn().mockResolvedValue(undefined);

jest.mock('@/utils/audit', () => ({
  logError: (params: any) => mockLogError(params),
  logSuccess: (params: any) => mockLogSuccess(params),
  registrarAuditoria: jest.fn().mockImplementation((params) => {
    // For testing, we'll just call the appropriate mock function
    if (params.accion.endsWith('_error') || params.accion.endsWith('_fallido')) {
      return mockLogError(params);
    } else {
      return mockLogSuccess(params);
    }
  }),
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
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      error: 'Email es requerido',
      data: null
    });

    // Verify audit log
    expect(mockLogError).toHaveBeenCalledWith({
      userId: null,
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'forgotPassword',
      action: 'error_forgot_password',
      message: 'Solicitud de restablecimiento de contraseña fallida - Email es requerido',
      error: expect.any(Error),
      context: {
        email: null
      }
    });
  });

  it('debe manejar email no registrado de manera segura', async () => {
    // Arrange
    req.body = { email: 'nonexistent@example.com' };
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    await forgotPassword(req as Request, res as Response);

    // Assert
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      error: null,
      data: 'Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.'
    });
    
    // Verify audit log
    expect(mockLogError).toHaveBeenCalledWith({
      userId: null,
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'forgotPassword',
      action: 'error_forgot_password',
      message: 'Intento de restablecimiento con email no registrado',
      error: expect.any(Error),
      context: {
        email: 'nonexistent@example.com'
      }
    });
    
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
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      error: null,
      data: 'Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.'
    });

    // Verify audit log
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: mockUser.id,
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: mockUser.id,
      module: 'forgotPassword',
      action: 'forgot_password_solicitud_exitoso',
      message: 'Solicitud de restablecimiento de contraseña procesada',
      details: {
        email: 'test@example.com',
        expiracion: expect.any(String),
        metodo: 'email',
        tokenGenerado: true
      }
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Arrange
    const error = new Error('Database error');
    req.body = { email: 'test@example.com' };
    (prisma.usuario.findUnique as jest.Mock).mockRejectedValueOnce(error);

    // Spy on console.error to verify it's called
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    await forgotPassword(req as Request, res as Response);

    // Assert
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      error: null,
      data: 'Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.'
    });
    
    // Verify error audit log
    const errorCall = mockLogError.mock.calls[0][0];
    expect(errorCall).toMatchObject({
      userId: null,
      ip: '127.0.0.1',
      entityType: 'usuario',
      module: 'auth',
      action: 'error_forgot_password',
      message: 'Error al procesar la solicitud de restablecimiento de contraseña',
      error: expect.any(Error)
    });
    
    // Check context separately to be more flexible with additional properties
    expect(errorCall.context).toMatchObject({
      email: 'test@example.com',
      tipoError: 'Error'
    });
  });
});
