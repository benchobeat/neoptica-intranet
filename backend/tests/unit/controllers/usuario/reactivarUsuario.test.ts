// First, set up the mocks
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockLogError = jest.fn();
const mockLogSuccess = jest.fn();

// Mock Prisma client and its methods
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      usuario: {
        findUnique: mockFindUnique,
        update: mockUpdate,
      },
    })),
  };
});

// Mock the audit functions
jest.mock('@/utils/audit', () => ({
  logError: (...args: any[]) => mockLogError(...args),
  logSuccess: (...args: any[]) => mockLogSuccess(...args),
}));

// Mock the prisma instance
jest.mock('@/utils/prisma', () => ({
  usuario: {
    findUnique: mockFindUnique,
    update: mockUpdate,
  },
}));

// Now import the modules that use the mocks
import { Request } from 'express';
import { reactivarUsuario } from '@/controllers/usuarioController';
import { success, fail } from '@/utils/response';

describe('reactivarUsuario', () => {
  let req: Partial<Request>;
  let res: any;
  let mockUser: any;
  let mockInactiveUser: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock request with admin user
    req = {
      params: { id: 'inactive-user-id' },
      ip: '127.0.0.1',
      user: {
        id: 'admin-user-id',
        nombreCompleto: 'Admin User',
        email: 'admin@example.com',
      },
    } as any;

    // Add roles to the user object
    (req.user as any).roles = ['admin'];

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock user data
    mockInactiveUser = {
      id: 'inactive-user-id',
      email: 'inactive@example.com',
      nombreCompleto: 'Inactive User',
      activo: false,
      anuladoEn: new Date(),
      anuladoPor: 'deleter-user-id',
    };
  });

  it('debe reactivar exitosamente un usuario inactivo (solo admin)', async () => {
    // Mock findUnique para encontrar el usuario inactivo
    mockFindUnique.mockResolvedValueOnce(mockInactiveUser);
    
    // Mock update para simular la reactivación
    mockUpdate.mockResolvedValueOnce({
      ...mockInactiveUser,
      activo: true,
      anuladoEn: null,
      anuladoPor: null,
    });

    await reactivarUsuario(req as Request, res as any);

    // Verificar que se llamó a findUnique con el ID correcto y los campos necesarios
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'inactive-user-id' },
      select: {
        id: true,
        email: true,
        activo: true,
        anuladoEn: true,
      },
    });

    // Verificar que se llamó a update con los datos correctos
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'inactive-user-id' },
      data: {
        activo: true,
        anuladoEn: null,
        anuladoPor: null,
        modificadoEn: expect.any(Date),
        modificadoPor: 'admin-user-id',
      },
    });

    // Verificar que no se llamó a status(200)
    expect(res.status).not.toHaveBeenCalledWith(200);

    // Verificar que se llamó a res.json con el mensaje de éxito
    expect(res.json).toHaveBeenCalledWith(
      success('Usuario reactivado correctamente')
    );

    // Verificar el log de éxito
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: 'admin-user-id',
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: 'inactive-user-id',
      module: 'reactivarUsuario',
      action: 'reactivar_usuario_exitoso',
      message: 'Usuario reactivado: inactive@example.com',
      details: expect.objectContaining({
        email: 'inactive@example.com',
        reactivadoPor: 'admin-user-id',
        fechaReactivacion: expect.any(String),
      }),
    });
  });

  it('debe retornar error 403 si el usuario no es administrador', async () => {
    // Simular usuario no administrador
    (req as any).user.roles = ['user'];

    await reactivarUsuario(req as Request, res as any);

    // Verificar que no se intentó buscar el usuario
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      fail('Acceso denegado: solo administradores pueden reactivar usuarios')
    );

    // Verificar el log de error
    expect(mockLogError).toHaveBeenCalledWith({
      userId: 'admin-user-id',
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: 'inactive-user-id',
      module: 'reactivarUsuario',
      action: 'error_reactivar_usuario',
      message: 'Intento de reactivar usuario no autorizado: inactive-user-id',
      error: expect.any(Error),
      context: {
        solicitadoPor: 'admin-user-id',
        usuarioId: 'inactive-user-id',
      },
    });
  });

  it('debe retornar error 404 si el usuario no existe', async () => {
    // Simular que el usuario no existe
    mockFindUnique.mockResolvedValueOnce(null);

    await reactivarUsuario(req as Request, res as any);

    // Verificar que se intentó buscar el usuario con los campos necesarios
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'inactive-user-id' },
      select: {
        id: true,
        email: true,
        activo: true,
        anuladoEn: true,
      },
    });

    // Verificar que no se intentó actualizar
    expect(mockUpdate).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      fail('Usuario no encontrado')
    );

    // Verificar el log de error
    expect(mockLogError).toHaveBeenCalledWith({
      userId: 'admin-user-id',
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: 'inactive-user-id',
      module: 'reactivarUsuario',
      action: 'error_reactivar_usuario',
      message: 'Intento de reactivar usuario no encontrado: inactive-user-id',
      error: expect.any(Error),
      context: {
        solicitadoPor: 'admin-user-id',
        usuarioId: 'inactive-user-id',
      },
    });
  });

  it('debe retornar error 400 si el usuario ya está activo', async () => {
    // Simular usuario ya activo
    mockFindUnique.mockResolvedValueOnce({
      ...mockInactiveUser,
      activo: true,
      anuladoEn: null,
      anuladoPor: null,
    });

    await reactivarUsuario(req as Request, res as any);

    // Verificar que se intentó buscar el usuario con los campos necesarios
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'inactive-user-id' },
      select: {
        id: true,
        email: true,
        activo: true,
        anuladoEn: true,
      },
    });

    // Verificar que no se intentó actualizar
    expect(mockUpdate).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      fail('El usuario ya está activo')
    );

    // Verificar el log de error
    expect(mockLogError).toHaveBeenCalledWith({
      userId: 'admin-user-id',
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: 'inactive-user-id',
      module: 'reactivarUsuario',
      action: 'error_reactivar_usuario',
      message: 'Intento de reactivar usuario ya activo: inactive-user-id',
      error: expect.any(Error),
      context: {
        solicitadoPor: 'admin-user-id',
        usuarioId: 'inactive-user-id',
      },
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Simular un error inesperado
    const testError = new Error('Error de base de datos');
    mockFindUnique.mockRejectedValueOnce(testError);

    await reactivarUsuario(req as Request, res as any);

    // Verificar que se intentó buscar el usuario con los campos necesarios
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'inactive-user-id' },
      select: {
        id: true,
        email: true,
        activo: true,
        anuladoEn: true,
      },
    });

    // Verificar que no se intentó actualizar
    expect(mockUpdate).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      fail('Error al reactivar el usuario')
    );

    // Verificar el log de error
    expect(mockLogError).toHaveBeenCalledWith({
      userId: 'admin-user-id',
      ip: '127.0.0.1',
      entityType: 'usuario',
      entityId: 'inactive-user-id',
      module: 'reactivarUsuario',
      action: 'error_reactivar_usuario',
      message: 'Error al reactivar usuario: inactive-user-id',
      error: testError,
      context: {
        error: 'Error de base de datos',
        stack: expect.any(String),
      },
    });
  });
});
