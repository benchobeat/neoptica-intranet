// Importar tipos primero para evitar dependencias circulares
import { Request, Response } from 'express';

// Definir mocks a nivel superior
const mockPrisma = {
  usuario: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockLogSuccess = jest.fn();
const mockLogError = jest.fn();

// Configurar mocks antes de importar el controlador
jest.mock('@/utils/audit', () => ({
  logSuccess: (...args: any[]) => mockLogSuccess(...args),
  logError: (...args: any[]) => mockLogError(...args),
}));

jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Importar después de configurar los mocks
import { eliminarUsuario } from '@/controllers/usuarioController';
import { mockRequest, mockResponse } from '@/../tests/unit/__fixtures__/usuarioFixtures';
import { fail } from '@/utils/response';

// Definir tipo de usuario para que coincida con la estructura esperada en el controlador
interface UserType {
  id: string;
  nombreCompleto: string;
  email: string;
  roles: string[];
}

// Extender el tipo Request de Express para incluir nuestras propiedades personalizadas
interface AuthenticatedRequest extends Request {
  user: UserType;
  ip: string;
  [key: string]: any; // Permitir propiedades adicionales
}

// Función auxiliar para crear una solicitud tipada correctamente
function createAuthenticatedRequest(overrides: Partial<AuthenticatedRequest> = {}): AuthenticatedRequest {
  const baseRequest = mockRequest() as unknown as Partial<AuthenticatedRequest>;
  
  // Crear un objeto de usuario con todas las propiedades requeridas
  const defaultUser: UserType = {
    id: '',
    nombreCompleto: 'Usuario de Prueba',
    email: 'test@example.com',
    roles: []
  };

  // Combinar todas las propiedades, asegurando que el objeto de usuario esté correctamente tipado
  return {
    ...baseRequest,
    user: {
      ...defaultUser,
      ...(overrides.user || {})
    },
    ip: '127.0.0.1',
    ...overrides,
  } as AuthenticatedRequest;
}

describe('eliminarUsuario', () => {
  let req: AuthenticatedRequest;
  let res: Response;
  const targetUserId = 'user-to-delete-id';
  const adminUser = { 
    id: 'admin-user-id', 
    nombreCompleto: 'Admin User',
    email: 'admin@example.com',
    roles: ['admin'] 
  };
  
  const regularUser = { 
    id: 'regular-user-id', 
    nombreCompleto: 'Regular User',
    email: 'user@example.com',
    roles: ['user'] 
  };

  beforeEach(() => {
    // Restablecer mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Crear una solicitud simulada con todas las propiedades requeridas de Express
    req = createAuthenticatedRequest({
      params: { id: targetUserId },
      user: adminUser,
      ip: '127.0.0.1'
    });

    // Mock de respuesta
    res = mockResponse();
    
    // Implementaciones por defecto de los mocks
    mockLogSuccess.mockResolvedValue(undefined);
    mockLogError.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('debe eliminar (desactivar) un usuario correctamente', async () => {
    // Configurar mocks para este caso de prueba
    const mockUser = {
      id: targetUserId,
      email: 'usuario@example.com',
      activo: true,
      anuladoEn: null,
      anuladoPor: null,
    };

    // Configurar el mock para findUnique
    mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

    // Configurar el mock para update
    mockPrisma.usuario.update.mockImplementation(({ where, data }) => {
      return Promise.resolve({
        ...mockUser,
        ...data,
        id: where.id,
      });
    });

    // Llamar a la función del controlador
    await eliminarUsuario(req, res);

    // Verificar que se buscó el usuario con el ID correcto
    expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: targetUserId },
      select: { id: true, email: true, activo: true }
    });

    // Verificar que se actualizó el usuario
    expect(mockPrisma.usuario.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: targetUserId },
      data: {
        activo: false,
        anuladoEn: expect.any(Date),
        anuladoPor: adminUser.id,
      },
    }));

    // Verificar que se registró la auditoría exitosa
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      action: 'eliminar_usuario_exitoso',
      entityType: 'usuario',
      entityId: targetUserId,
      module: 'eliminarUsuario',
      userId: adminUser.id,
      ip: '127.0.0.1',
      message: `Usuario eliminado: ${mockUser.email}`,
      details: expect.objectContaining({
        email: mockUser.email,
        eliminadoPor: adminUser.id,
        fechaEliminacion: expect.any(String)
      })
    }));

    // Verificar respuesta exitosa
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: 'Usuario eliminado correctamente',
      error: null
    });
    
    // Verificar que se registró la auditoría exitosa
    expect(mockLogSuccess).toHaveBeenCalledWith({
      action: 'eliminar_usuario_exitoso',
      entityType: 'usuario',
      entityId: targetUserId,
      module: 'eliminarUsuario',
      userId: adminUser.id,
      ip: '127.0.0.1',
      message: `Usuario eliminado: ${mockUser.email}`,
      details: expect.objectContaining({
        email: mockUser.email,
        eliminadoPor: adminUser.id
      })
    });
  });

  it('debe manejar el caso cuando el usuario no existe', async () => {
    const nonExistentUserId = 'non-existent-user';
    req = createAuthenticatedRequest({
      params: { id: nonExistentUserId },
      user: adminUser,
    });

    // Configurar el mock para devolver null (usuario no encontrado)
    mockPrisma.usuario.findUnique.mockResolvedValue(null);

    // Llamar a la función del controlador
    await eliminarUsuario(req, res);

    // Verificar que se buscó el usuario
    expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: nonExistentUserId },
      select: { id: true, email: true, activo: true },
    });

    // Verificar que NO se intentó actualizar el usuario
    expect(mockPrisma.usuario.update).not.toHaveBeenCalled();

    // Verificar que se registró el error de auditoría
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      action: 'error_eliminar_usuario',
      entityType: 'usuario',
      entityId: nonExistentUserId,
      module: 'eliminarUsuario',
      userId: adminUser.id,
      ip: '127.0.0.1',
      message: `Intento de eliminar usuario no encontrado: ${nonExistentUserId}`,
      error: expect.any(Error),
      context: expect.objectContaining({
        usuarioId: nonExistentUserId,
        solicitadoPor: adminUser.id
      }),
    }));

    // Verificar respuesta de error
    expect(res.json).toHaveBeenCalledWith(
      fail('Usuario no encontrado')
    );
    
    // Verificar que no se intentó actualizar el usuario
    expect(mockPrisma.usuario.update).not.toHaveBeenCalled();
    
    // Verificar que se registró el error de auditoría
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      action: 'error_eliminar_usuario',
      message: expect.stringContaining('Intento de eliminar usuario no encontrado')
    }));
  });

  it('no debe permitir a un no administrador eliminar usuarios', async () => {
    // Configurar solicitud con usuario regular (sin rol admin)
    req = createAuthenticatedRequest({
      params: { id: 'user-to-delete' },
      user: regularUser
    });

    // Llamar al controlador
    await eliminarUsuario(req, res);

    // Verificar respuesta de error de autorización
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      fail('Acceso denegado: solo administradores pueden eliminar usuarios')
    );
    
    // Verificar que no se intentó buscar el usuario
    expect(mockPrisma.usuario.findUnique).not.toHaveBeenCalled();
    
    // Verificar que no se registró ningún error de auditoría
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('debe manejar correctamente un usuario ya inactivo', async () => {
    const inactiveUserId = 'inactive-user';
    const mockInactiveUser = {
      id: inactiveUserId,
      email: 'inactive@example.com',
      activo: false,
      anuladoPor: 'another-admin',
      anuladoEn: new Date()
    };
    
    // Configurar mock para usuario inactivo
    mockPrisma.usuario.findUnique.mockResolvedValueOnce(mockInactiveUser);

    // Configurar solicitud con admin
    req = createAuthenticatedRequest({
      params: { id: inactiveUserId },
      user: adminUser
    });

    // Llamar al controlador
    await eliminarUsuario(req, res);

    // Verificar que se buscó al usuario
    expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: inactiveUserId },
      select: { id: true, email: true, activo: true }
    });

    // Verificar que se actualizó el usuario (aunque ya esté inactivo, el controlador igual lo actualiza)
    expect(mockPrisma.usuario.update).toHaveBeenCalledWith({
      where: { id: inactiveUserId },
      data: {
        activo: false,
        anuladoEn: expect.any(Date),
        anuladoPor: adminUser.id
      }
    });

    // Verificar respuesta exitosa
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: 'Usuario eliminado correctamente',
        error: null
      })
    );
    
    // Verificar que se registró la auditoría exitosa
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      action: 'eliminar_usuario_exitoso',
      message: `Usuario eliminado: ${mockInactiveUser.email}`,
      details: {
        email: mockInactiveUser.email,
        eliminadoPor: adminUser.id,
        fechaEliminacion: expect.any(String)
      }
    }));
  });

  it('debe manejar errores inesperados', async () => {
    const errorMessage = 'Error de base de datos';
    const errorUserId = 'error-user-id';
    
    // Configurar request con usuario admin
    const errorReq = createAuthenticatedRequest({
      params: { id: errorUserId },
      user: adminUser,
      ip: '127.0.0.1'
    });
    
    // Configurar para que falle la búsqueda del usuario
    const testError = new Error(errorMessage);
    
    // Resetear mocks
    jest.clearAllMocks();
    
    // Configurar el mock para que falle
    mockPrisma.usuario.findUnique = jest.fn().mockRejectedValue(testError);

    await eliminarUsuario(errorReq, res);

    // Verificar respuesta de error
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Error al eliminar el usuario',
      })
    );
    
    // Verificar que no se intentó actualizar el usuario
    expect(mockPrisma.usuario.update).not.toHaveBeenCalled();
    
    // Verificar que se registró el error de auditoría
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      action: 'error_eliminar_usuario',
      entityType: 'usuario',
      module: 'eliminarUsuario',
      userId: adminUser.id,
      ip: '127.0.0.1',
      error: testError,
      message: `Error al eliminar usuario: ${errorUserId}`,
      context: {
        error: errorMessage,
        stack: testError.stack
      }
    }));
  });
});
