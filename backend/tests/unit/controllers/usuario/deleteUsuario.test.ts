// Import types first to avoid circular dependencies
import { Request, Response } from 'express';

// Define mocks at the top level
const mockPrisma = {
  usuario: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockRegistrarAuditoria = jest.fn().mockResolvedValue(undefined);
const mockIsSystemUser = jest.fn().mockResolvedValue(false);

// Configure mocks before importing the controller
jest.mock('@/utils/audit', () => ({
  registrarAuditoria: (params: any) => mockRegistrarAuditoria(params),
}));

jest.mock('@/utils/system', () => ({
  isSystemUser: (id: string) => mockIsSystemUser(id),
}));

jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Import after setting up mocks
import { eliminarUsuario } from '@/controllers/usuarioController';
import { mockRequest, mockResponse } from '@/../tests/unit/__fixtures__/usuarioFixtures';

// Define user type to match the expected structure in the controller
interface UserType {
  id: string;
  nombreCompleto: string;
  email: string;
  roles: string[];
}

// Extend Express Request type to include our custom properties
interface AuthenticatedRequest extends Request {
  user: UserType;
  ip: string;
  [key: string]: any; // Allow any additional properties
}

// Helper function to create a properly typed request
function createAuthenticatedRequest(overrides: Partial<AuthenticatedRequest> = {}): AuthenticatedRequest {
  const baseRequest = mockRequest() as unknown as Partial<AuthenticatedRequest>;
  
  // Create a proper user object with all required properties
  const defaultUser: UserType = {
    id: '',
    nombreCompleto: 'Test User',
    email: 'test@example.com',
    roles: []
  };

  // Merge all properties, ensuring user object is properly typed
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
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create a proper mock request with all required Express properties
    req = createAuthenticatedRequest({
      params: { id: targetUserId },
      user: adminUser,
      ip: '127.0.0.1'
    });

    // Mock response
    res = mockResponse();
    
    // Default mock implementations
    mockIsSystemUser.mockResolvedValue(false);
    mockRegistrarAuditoria.mockResolvedValue(undefined);
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

    // Verificar que se registró la auditoría
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith(expect.objectContaining({
      accion: 'eliminar_usuario',
      entidadId: targetUserId,
      entidadTipo: 'usuario',
      modulo: 'usuarios',
      usuarioId: adminUser.id,
    }));

    // Verificar respuesta exitosa
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.any(String),
        error: null
      })
    );
    
    // Verificar que el mensaje de éxito contenga el texto esperado
    const responseArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseArg.data).toContain('eliminado');
  });

  it('no debe permitir eliminar un usuario ya inactivo', async () => {
    const inactiveUserId = 'inactive-user';
    req = createAuthenticatedRequest({
      params: { id: inactiveUserId },
      user: adminUser,
      ip: '127.0.0.1'
    });
    
    // Configurar un usuario que ya está inactivo
    mockPrisma.usuario.findUnique.mockResolvedValueOnce({
      id: inactiveUserId,
      email: 'inactivo@example.com',
      activo: false,
      anuladoEn: new Date(),
      anuladoPor: 'some-admin-id',
    });

    await eliminarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El usuario ya está inactivo o eliminado',
      })
    );
    
    expect(mockPrisma.usuario.update).not.toHaveBeenCalled();
  });

  it('no debe permitir a un no administrador eliminar usuarios', async () => {
    // Configurar un usuario sin rol de administrador
    req = createAuthenticatedRequest({
      params: { id: targetUserId },
      user: regularUser,
      ip: '127.0.0.1'
    });

    await eliminarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Acceso denegado: solo admin puede eliminar usuarios',
      })
    );
    
    // Verificar que no se intentó buscar ni actualizar el usuario
    expect(mockPrisma.usuario.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.usuario.update).not.toHaveBeenCalled();
  });

  it('debe manejar el caso cuando el usuario no existe', async () => {
    const nonExistentUserId = 'non-existent-user';
    req = createAuthenticatedRequest({
      params: { id: nonExistentUserId },
      user: adminUser,
      ip: '127.0.0.1'
    });
    
    mockPrisma.usuario.findUnique.mockResolvedValueOnce(null);

    await eliminarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Usuario no encontrado',
      })
    );
    
    expect(mockPrisma.usuario.update).not.toHaveBeenCalled();
  });

  // Nota: El controlador actual no tiene validación para usuarios del sistema
  // Si se implementa en el futuro, agregar la prueba correspondiente aquí
  it.todo('debería implementar validación para usuarios del sistema');

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
    
    // Configurar el mock de registrarAuditoria para que no falle la prueba
    mockRegistrarAuditoria.mockImplementation(async () => {
      // No hacer nada, solo evitar que falle la prueba
    });

    await eliminarUsuario(errorReq, res);

    // Verificar respuesta de error
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: errorMessage,
      })
    );
    
    // Verificar que se llamó a registrarAuditoria con los parámetros correctos
    // Nota: El controlador no registra auditoría en caso de error inesperado
    // por lo que no deberíamos esperar que se llame a registrarAuditoria
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });
});
