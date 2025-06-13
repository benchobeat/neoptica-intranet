import { Request, Response } from 'express';
import { resetPasswordAdmin } from '@/controllers/usuarioController';
import { registrarAuditoria } from '@/utils/audit';
import bcrypt from 'bcrypt';
import { mockRequest, mockResponse } from '@/../tests/unit/__fixtures__/usuarioFixtures';

// Mock modules first to avoid hoisting issues
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockRegistrarAuditoria = jest.fn().mockResolvedValue(undefined);
const mockHash = jest.fn().mockResolvedValue('hashedPassword123');
const mockIsSystemUser = jest.fn().mockResolvedValue(false);

// Mock the modules
jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}));

jest.mock('@/utils/audit', () => ({
  registrarAuditoria: (...args: any[]) => mockRegistrarAuditoria(...args),
}));

jest.mock('bcrypt', () => ({
  hash: (...args: any[]) => mockHash(...args),
}));

jest.mock('@/utils/system', () => ({
  isSystemUser: (id: string) => mockIsSystemUser(id),
}));

// Import after mocks to ensure mocks are in place
import prisma from '@/utils/prisma';

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
    mockRegistrarAuditoria.mockReset();
    mockHash.mockReset();
    mockIsSystemUser.mockReset();
    
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
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith({
      usuarioId: adminUser.id,
      accion: 'reset_password_admin',
      descripcion: expect.stringContaining('restableció la contraseña'),
      ip: req.ip,
      entidadTipo: 'usuario',
      entidadId: targetUserId,
      modulo: 'usuarios',
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
        error: 'Error inesperado',
      })
    );
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
    
    // Verificar que no se actualizó la contraseña
    expect(mockUpdate).not.toHaveBeenCalledWith({
      where: { id: targetUserId },
      data: { password: 'newHashedPassword123' },
    });
  });
});
