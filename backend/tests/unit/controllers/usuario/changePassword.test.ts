import { Request } from 'express';
import { cambiarPassword } from '@/controllers/usuarioController';
import prisma from '@/utils/prisma';
import { registrarAuditoria } from '@/utils/audit';
import bcrypt from 'bcrypt';
import { mockUsuarioAdmin, mockRequest, mockResponse } from '@/../tests/unit/__fixtures__/usuarioFixtures';

// Create mock implementations
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockRegistrarAuditoria = jest.fn().mockResolvedValue(undefined);
const mockCompare = jest.fn();
const mockHash = jest.fn().mockResolvedValue('newHashedPassword123');

// Helper function to match controller's response format
const success = (message: string) => ({
  ok: true,
  data: message,
  error: null
});

const fail = (message: string) => ({
  ok: false,
  data: null,
  error: message
});

// Mock the modules
jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn((...args) => mockFindUnique(...args)),
      update: jest.fn((...args) => mockUpdate(...args)),
    },
  },
}));

jest.mock('@/utils/audit', () => ({
  registrarAuditoria: jest.fn((...args) => mockRegistrarAuditoria(...args)),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn((...args) => mockCompare(...args)),
  hash: jest.fn((...args) => mockHash(...args)),
}));

describe('cambiarPassword', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;
  
  // Extend Express Request type for our tests
  interface AuthenticatedRequest extends Request {
    user: any;
    ip: string;
    [key: string]: any;
  }

  const passwordData = {
    actual: 'currentPassword123',
    nueva: 'newSecurePassword123',
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock response
    res = mockResponse();
    next = jest.fn();

    // Mock request with user and body
    const mockReq = mockRequest() as any;
    req = {
      ...mockReq,
      params: { id: mockUsuarioAdmin.id },
      body: {
        actual: 'currentPassword123',
        nueva: 'NewSecurePassword123!', // Must meet password strength requirements
      },
      user: { ...mockUsuarioAdmin, id: mockUsuarioAdmin.id },
      ip: '127.0.0.1',
    };

    // Setup default mocks
    mockFindUnique.mockResolvedValue({
      id: mockUsuarioAdmin.id,
      password: 'hashedCurrentPassword123',
    });

    mockCompare.mockResolvedValue(true);
    mockHash.mockResolvedValue('newHashedPassword123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('debe cambiar la contraseña correctamente', async () => {
    // Mock successful password comparison
    mockCompare.mockResolvedValueOnce(true);
    
    // Mock successful user lookup
    mockFindUnique.mockResolvedValueOnce({
      id: mockUsuarioAdmin.id,
      password: 'hashedCurrentPassword123',
    });

    await cambiarPassword(req, res);

    // Verify database query
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: mockUsuarioAdmin.id },
    });

    // Verify password comparison
    expect(mockCompare).toHaveBeenCalledWith(
      'currentPassword123',
      'hashedCurrentPassword123'
    );

    // Verify database update
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockUsuarioAdmin.id },
      data: { password: 'newHashedPassword123' },
    });

    // Verify response
    expect(res.json).toHaveBeenCalledWith(
      success('Contraseña actualizada correctamente')
    );

    // Verify audit log
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith({
      usuarioId: mockUsuarioAdmin.id,
      accion: 'cambiar_password',
      descripcion: 'El usuario cambió su contraseña.',
      ip: '127.0.0.1',
      entidadTipo: 'usuario',
      entidadId: mockUsuarioAdmin.id,
      modulo: 'usuarios',
    });
  });

  it('no debe permitir cambiar la contraseña si la actual no coincide', async () => {
    // Mock user lookup and incorrect password
    mockFindUnique.mockResolvedValueOnce({
      id: mockUsuarioAdmin.id,
      password: 'hashedCurrentPassword123',
    });
    mockCompare.mockResolvedValueOnce(false);

    await cambiarPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      fail('El password actual es incorrecto')
    );
    
    // Verify no update was made
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('no debe permitir cambiar la contraseña de otro usuario', async () => {
    // User trying to change password of another user
    req.user = {
      id: 'other-user-id',
      roles: ['vendedor'],
    };

    await cambiarPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      fail('Solo puedes cambiar tu propia contraseña')
    );
    
    // Verify no database calls were made
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('debe manejar errores inesperados', async () => {
    // Mock error
    const error = new Error('Database error');
    mockFindUnique.mockRejectedValueOnce(error);
    
    await cambiarPassword(req, res);
    
    // The controller should handle the error and return a 500 status
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.any(String)
      })
    );
  });

  it('debe validar que se proporcionen ambos passwords', async () => {
    // Missing required fields
    const testReq = {
      ...req,
      body: {},
    } as any;

    await cambiarPassword(testReq, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      fail('Se requieren el password actual y el nuevo')
    );
  });

  it('debe validar la fortaleza de la nueva contraseña', async () => {
    // Weak password (doesn't meet strength requirements)
    const testReq = {
      ...req,
      body: {
        actual: 'currentPassword123',
        nueva: 'weak',
      },
    } as any;

    await cambiarPassword(testReq, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      fail(expect.stringContaining('El password nuevo debe ser fuerte'))
    );
  });

  it('debe manejar usuario no encontrado', async () => {
    // User not found
    mockFindUnique.mockResolvedValueOnce(null);
    
    await cambiarPassword(req, res);
    
    // The controller returns 404 when user is not found
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.any(String)
      })
    );
  });
  
  it('debe manejar usuario sin password configurado', async () => {
    // User without password set
    mockFindUnique.mockResolvedValueOnce({
      id: mockUsuarioAdmin.id,
      password: null,
    });
    
    await cambiarPassword(req, res);
    
    // The controller should return a 400 status when user has no password
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('password local')
      })
    );
  });
});
