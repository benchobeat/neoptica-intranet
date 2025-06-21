// First, set up the mocks
const mockFindUnique = jest.fn();
const mockLogError = jest.fn();
const mockLogSuccess = jest.fn();

// Mock Prisma client and its methods
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      usuario: {
        findUnique: mockFindUnique,
      },
    })),
  };
});

// Mock the audit functions
jest.mock('../../../../src/utils/audit', () => ({
  logError: (...args: any[]) => mockLogError(...args),
  logSuccess: (...args: any[]) => mockLogSuccess(...args),
}));

// Mock the prisma instance
jest.mock('../../../../src/utils/prisma', () => ({
  usuario: {
    findUnique: mockFindUnique,
  },
}));

// Now import the modules that use the mocks
import { Request } from 'express';
import { obtenerPerfilUsuario } from '../../../../src/controllers/usuarioMeController';
import { success, fail } from '../../../../src/utils/response';

describe('obtenerPerfilUsuario', () => {
  let req: Partial<Request>;
  let res: any;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request with authenticated user
    req = {
      user: { 
        id: 'user-123', 
        email: 'test@example.com',
        nombreCompleto: 'Test User',
        roles: ['user']
      },
      ip: '127.0.0.1',
    } as any;

    // Setup response mock
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    res = {
      status: mockStatus,
      json: mockJson,
    };
  });

  it('debe retornar el perfil del usuario autenticado exitosamente', async () => {
    // Mock user data
    const mockUser = {
      id: 'user-123',
      nombreCompleto: 'Test User',
      email: 'test@example.com',
      telefono: '1234567890',
      direccion: 'Test Address',
      dni: '12345678',
      activo: true,
      roles: [
        {
          rol: {
            id: 'rol-1',
            nombre: 'user',
            descripcion: 'Usuario regular',
          },
        },
      ],
    };

    // Mock Prisma
    mockFindUnique.mockResolvedValue(mockUser);

    // Call controller
    await obtenerPerfilUsuario(req as Request, res);

    // Verify response
    expect(mockJson).toHaveBeenCalledWith(
      success({
        id: mockUser.id,
        nombreCompleto: mockUser.nombreCompleto,
        email: mockUser.email,
        telefono: mockUser.telefono,
        direccion: mockUser.direccion,
        dni: mockUser.dni,
        activo: mockUser.activo,
        roles: mockUser.roles.map((r: any) => r.rol),
      })
    );

    // Verify audit log
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'usuario',
      entityId: mockUser.id,
      module: 'obtenerPerfilUsuario',
      action: 'consultar_perfil_exitoso',
      message: 'Usuario consultó su perfil',
      details: {
        usuarioId: mockUser.id,
        email: mockUser.email,
      },
    });
  });

  it('debe retornar error 401 si el usuario no está autenticado', async () => {
    // Remove user from request
    req.user = undefined;

    // Call controller
    await obtenerPerfilUsuario(req as Request, res);

    // Verify response
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith(fail('No autenticado'));

    // Verify no audit log was created
    expect(mockLogSuccess).not.toHaveBeenCalled();
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('debe retornar error 404 si el usuario no existe', async () => {
    // Mock Prisma to return null (user not found)
    mockFindUnique.mockResolvedValue(null);

    // Call controller
    await obtenerPerfilUsuario(req as Request, res);

    // Verify response
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      fail('Usuario no encontrado')
    );

    // Verify error audit log
    expect(mockLogError).toHaveBeenCalledWith({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'usuario',
      module: 'obtenerPerfilUsuario',
      action: 'error_obtener_perfil_usuario',
      message: 'Usuario no encontrado',
      error: expect.any(Error),
      context: {
        usuarioBuscado: req.user?.id,
      },
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Mock Prisma to throw an error
    const error = new Error('Database error');
    mockFindUnique.mockRejectedValue(error);

    // Call controller
    await obtenerPerfilUsuario(req as Request, res);

    // Verify response
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      fail('Error al obtener el perfil')
    );

    // Verify error audit log
    expect(mockLogError).toHaveBeenCalledWith({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'usuario',
      module: 'obtenerPerfilUsuario',
      action: 'error_obtener_perfil_usuario',
      message: 'Error al obtener perfil',
      error: expect.any(Error),
      context: expect.objectContaining({
        error: expect.any(String),
        stack: expect.any(String),
      }),
    });
  });
});
