import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { login } from '../../../../src/controllers/authController';
import prisma from '@/utils/prisma';
import { registrarAuditoria } from '@/utils/audit';

// Mock the dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@/utils/prisma', () => ({
  usuario: {
    findUnique: jest.fn(),
  },
}));

jest.mock('@/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
}));

// Mock environment variables
const OLD_ENV = process.env;

// Test user data
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  nombreCompleto: 'Test User',
  password: 'hashedpassword123',
  activo: true,
  roles: [
    {
      rol: {
        nombre: 'admin',
      },
    },
  ],
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

    // Setup request and response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    sendMock = jest.fn();

    req = {
      body: {},
      ip: '127.0.0.1',
    };

    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };

    // Default mock implementations
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
  });

  afterAll(() => {
    process.env = OLD_ENV;
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
        descripcion: 'Email y password son requeridos',
      })
    );
  });

  it('debe retornar error si el usuario no existe', async () => {
    // Arrange
    req.body = { email: 'nonexistent@example.com', password: 'password' };
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

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
        descripcion: expect.stringContaining('Intento de login fallido para email:'),
      })
    );
  });

  it('debe retornar error si el usuario está inactivo', async () => {
    // Arrange
    req.body = { email: 'inactive@example.com', password: 'password' };
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
      ...mockUser,
      activo: false,
    });

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El usuario está inactivo. Contacte al administrador.',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'login_fallido',
        descripcion: expect.stringContaining('Intento de login fallido (usuario inactivo)'),
      })
    );
  });

  it('debe retornar error si la contraseña es incorrecta', async () => {
    // Arrange
    req.body = { email: 'test@example.com', password: 'wrongpassword' };
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Credenciales inválidas',
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'login_fallido',
        descripcion: expect.stringContaining('Intento de login fallido (password incorrecto)'),
      })
    );
  });

  it('debe iniciar sesión correctamente con credenciales válidas', async () => {
    // Arrange
    req.body = { email: 'test@example.com', password: 'correctpassword' };
    const mockToken = 'mock-jwt-token';
    
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).not.toHaveBeenCalled(); // No error status
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: {
          token: mockToken,
          usuario: {
            id: mockUser.id,
            nombreCompleto: mockUser.nombreCompleto,
            email: mockUser.email,
            roles: ['admin'],
          },
        },
      })
    );
    expect(registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'login_exitoso',
        descripcion: expect.stringContaining('Usuario accedió al sistema'),
      })
    );
  });

  it('debe manejar múltiples roles correctamente', async () => {
    // Arrange
    const multiRoleUser = {
      ...mockUser,
      roles: [
        { rol: { nombre: 'admin' } },
        { rol: { nombre: 'vendedor' } },
      ],
    };
    
    req.body = { email: 'multirole@example.com', password: 'correctpassword' };
    const mockToken = 'mock-jwt-token';
    
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(multiRoleUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          usuario: expect.objectContaining({
            roles: expect.arrayContaining(['admin', 'vendedor']),
          }),
        }),
      })
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        roles: expect.arrayContaining(['admin', 'vendedor']),
      }),
      'test-secret',
      { expiresIn: '8h' }
    );
  });

  it('debe manejar errores inesperados', async () => {
    // Arrange
    req.body = { email: 'test@example.com', password: 'password' };
    const error = new Error('Database error');
    (prisma.usuario.findUnique as jest.Mock).mockRejectedValue(error);

    // Act
    await login(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Database error',
      })
    );
  });
});
