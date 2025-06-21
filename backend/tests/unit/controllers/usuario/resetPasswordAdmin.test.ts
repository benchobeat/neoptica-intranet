import { Request, Response } from 'express';
import { resetPasswordAdmin } from '../../../../src/controllers/usuarioController';
import bcrypt from 'bcrypt';
import { mockRequest, mockResponse } from '@/../tests/unit/__fixtures__/usuarioFixtures';

// Mock modules first to avoid hoisting issues
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockLogSuccess = jest.fn().mockResolvedValue(undefined);
const mockLogError = jest.fn().mockResolvedValue(undefined);
const mockHash = jest.fn().mockResolvedValue('hashedPassword123');

// Mock the modules
jest.mock('../../../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}));

jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: (...args: any[]) => mockLogSuccess(...args),
  logError: (...args: any[]) => mockLogError(...args),
}));

jest.mock('bcrypt', () => ({
  hash: (...args: any[]) => mockHash(...args),
}));

// Import after mocks to ensure mocks are in place
import prisma from '../../../../src/utils/prisma';

// Extend Express Request type to include our custom properties
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    roles: string[];
    email: string;
    nombreCompleto: string;
  };
  ip: string;
  [key: string]: any; // Allow any additional properties
}

// Helper function to create a properly typed request
function createAuthenticatedRequest(overrides: Partial<AuthenticatedRequest> = {}): AuthenticatedRequest {
  const baseRequest = mockRequest() as any; // Use 'any' to avoid type conflicts with Express
  return {
    ...baseRequest,
    user: {
      id: overrides.user?.id || '',
      roles: overrides.user?.roles || [],
      email: overrides.user?.email || 'test@example.com',
      nombreCompleto: overrides.user?.nombreCompleto || 'Test User'
    },
    ip: overrides.ip || '127.0.0.1',
    ...overrides,
  } as AuthenticatedRequest;
}

describe('resetPasswordAdmin', () => {
  let req: AuthenticatedRequest;
  let res: Response;
  
  const targetUserId = 'target-user-id';
  const adminUser = { 
    id: 'admin-id', 
    roles: ['admin'],
    email: 'admin@example.com',
    nombreCompleto: 'Admin User'
  };
  
  const regularUser = { 
    id: 'regular-user-id',
    roles: ['user'],
    email: 'user@example.com',
    nombreCompleto: 'Regular User'
  };

  const newPassword = 'NewSecure123';
  const hashedPassword = 'hashedPassword123';

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Default request setup (admin user)
    req = createAuthenticatedRequest({
      params: { id: targetUserId },
      body: { password_nuevo: newPassword },
      user: adminUser,
      ip: '127.0.0.1'
    });
    
    res = mockResponse() as unknown as Response;
    
    // Reset all mocks
    mockFindUnique.mockReset();
    mockUpdate.mockReset();
    mockHash.mockReset();
    
    // Setup default mocks
    mockFindUnique.mockResolvedValue({
      id: targetUserId,
      email: 'target@example.com',
      activo: true,
    });
    mockHash.mockResolvedValue(hashedPassword);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('debe permitir a un admin restablecer la contraseña de otro usuario', async () => {
    // Configurar mocks
    const mockUser = {
      id: targetUserId,
      email: 'user@example.com',
      password: 'oldHashedPassword',
    };
    
    mockFindUnique.mockResolvedValueOnce(mockUser);
    mockUpdate.mockResolvedValueOnce({
      ...mockUser,
      password: hashedPassword,
    });
    
    await resetPasswordAdmin(req, res);
    
    // Verificar que se buscó el usuario
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: targetUserId },
    });
    
    // Verificar que se hasheó la contraseña
    expect(mockHash).toHaveBeenCalledWith(newPassword, 10);
    
    // Verificar que se actualizó la contraseña
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: targetUserId },
      data: { password: hashedPassword },
    });
    
    // Verificar que se usó el campo password_nuevo
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          password: expect.any(String)
        })
      })
    );
    
    // Verificar respuesta exitosa
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.any(String),
      })
    );
    
    // Verificar que se registró la auditoría
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: adminUser.id,
      ip: req.ip,
      entityType: 'usuario',
      entityId: targetUserId,
      module: 'resetPasswordAdmin',
      action: 'reset_password_admin_exitoso',
      message: `Contraseña restablecida para el usuario ${mockUser.email}`,
      details: expect.objectContaining({
        accion: 'reset_password_admin',
        realizadoPor: adminUser.id
      })
    });
  });

  it('no debe permitir a un no administrador restablecer contraseñas', async () => {
    // Configurar request para usuario no admin
    req = createAuthenticatedRequest({
      ...req,
      user: regularUser
    });
    
    await resetPasswordAdmin(req, res);
    
    // Verificar respuesta de error
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Solo admin puede restablecer contraseñas',
      })
    );
    
    // Verificar que no se intentó buscar ni actualizar el usuario
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    
    // Verificar que se registró el error en la auditoría
    expect(mockLogError).toHaveBeenCalledWith({
      userId: regularUser.id,
      ip: req.ip,
      entityType: 'usuario',
      entityId: targetUserId,
      module: 'resetPasswordAdmin',
      action: 'error_reset_password_admin',
      message: 'Solo admin puede restablecer contraseñas',
      error: expect.any(Error),
      context: expect.objectContaining({
        accion: 'validacion_permisos',
        rolRequerido: 'admin'
      })
    });
  });

  it('debe manejar el caso cuando el usuario objetivo no existe', async () => {
    // Usuario no encontrado
    mockFindUnique.mockResolvedValueOnce(null);

    await resetPasswordAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Usuario no encontrado',
      })
    );
    
    // Verificar que se registró el error en la auditoría
    expect(mockLogError).toHaveBeenCalledWith({
      userId: adminUser.id,
      ip: req.ip,
      entityType: 'usuario',
      entityId: targetUserId,
      module: 'resetPasswordAdmin',
      action: 'error_reset_password_admin',
      message: 'Usuario no encontrado',
      error: expect.any(Error),
      context: expect.objectContaining({
        accion: 'buscar_usuario',
        usuarioBuscado: targetUserId
      })
    });
  });

  it('debe validar la fortaleza de la nueva contraseña', async () => {
    // Configurar request con contraseña débil
    req.body = { password_nuevo: 'weak' };
    
    await resetPasswordAdmin(req as any, res as any);
    
    // Verificar respuesta de error
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('El password nuevo debe tener al menos 8 caracteres'),
      })
    );
    
    // Verificar que no se intentó buscar ni actualizar el usuario
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    
    // Verificar que se registró el error en la auditoría
    expect(mockLogError).toHaveBeenCalledWith({
      userId: adminUser.id,
      ip: req.ip,
      entityType: 'usuario',
      entityId: targetUserId,
      module: 'resetPasswordAdmin',
      action: 'error_reset_password_admin',
      message: 'Validación de contraseña fallida. 400',
      error: expect.any(Error),
      context: expect.objectContaining({
        accion: 'validacion_password',
        requisitos: expect.any(Array)
      })
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar mock para lanzar error
    const error = new Error('Error inesperado');
    mockFindUnique.mockRejectedValueOnce(error);
    
    await resetPasswordAdmin(req as any, res as any);
    
    // Verificar respuesta de error
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Error al restablecer la contraseña',
      })
    );
    
    // Verificar que se registró el error en la auditoría
    expect(mockLogError).toHaveBeenCalledWith({
      userId: adminUser.id,
      ip: req.ip,
      entityType: 'usuario',
      entityId: targetUserId,
      module: 'resetPasswordAdmin',
      action: 'error_reset_password_admin',
      message: 'Error al restablecer contraseña',
      error: expect.any(Error),
      context: expect.objectContaining({
        accion: 'reset_password_admin',
        error: expect.any(String)
      })
    });
  });

  it('debe aceptar tanto password_nuevo como newPassword en el body', async () => {
    // Configurar request con newPassword en lugar de password_nuevo
    req.body = { newPassword: 'otraContraseña123' };
    
    // Configurar mocks
    const mockUser = {
      id: targetUserId,
      email: 'user@example.com',
      password: 'oldHashedPassword',
    };
    mockFindUnique.mockResolvedValueOnce(mockUser);
    mockUpdate.mockResolvedValueOnce(mockUser);
    
    await resetPasswordAdmin(req as any, res as any);
    
    // Verificar que se usó newPassword para el hash
    expect(mockHash).toHaveBeenCalledWith('otraContraseña123', 10);
    
    // Verificar que se actualizó la contraseña
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: targetUserId },
      data: { password: hashedPassword },
    });
    
    // Verificar que se registró en la auditoría
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      action: 'reset_password_admin_exitoso',
      entityId: targetUserId
    }));
  });
});
