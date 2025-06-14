// Import types
import { Request, Response } from 'express';

// Extended user type for testing
interface TestUser {
  id: string;
  email: string;
  nombreCompleto: string;
  telefono?: string | null;
  dni?: string | null;
  direccion?: string | null;
  password?: string;
  salt?: string;
  token?: string | null;
  tokenExpiracion?: Date | null;
  ultimoInicioSesion?: Date | null;
  intentosFallidos?: number;
  bloqueado?: boolean;
  fechaNacimiento?: Date | null;
  genero?: string | null;
  fotoPerfil?: string | null;
  notificaciones?: boolean;
  preferencias?: Record<string, any>;
  roles: Array<{ rol: { nombre: string } }>;
  [key: string]: any; // For any additional properties that might exist
}

// Extend Express types to include our custom properties
declare global {
  namespace Express {
    // Extend the existing Request type
    interface Request {
      user?: User;
      ip?: string;
      body: any;
      params: Record<string, any>;
      method: string;
      url: string;
      headers: Record<string, any>;
      get: jest.Mock;
    }
  }
}

// Simplified mock response type for testing
type MockResponse = {
  status: jest.Mock<MockResponse, [number]>;
  json: jest.Mock<MockResponse, [any]>;
  send: jest.Mock<MockResponse, [any?]>;
  mockClear: () => void;
  [key: string]: any; // Allow any other properties
};

// Define mocks first
const mockRegistrarAuditoria = jest.fn();

// Mock Prisma client methods
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockRolFindMany = jest.fn();
const mockUsuarioRolFindMany = jest.fn();

// Mock the modules using jest.doMock to avoid hoisting issues
jest.doMock('@/utils/prisma', () => ({
  usuario: {
    findUnique: mockFindUnique,
    update: mockUpdate,
  },
  rol: {
    findMany: mockRolFindMany,
  },
  usuarioRol: {
    findMany: mockUsuarioRolFindMany,
  },
}));

jest.doMock('@/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria,
}));

// Now import the controller after setting up mocks
const { actualizarPerfilUsuario } = require('@/controllers/usuarioController');

// Helper function to create a mock response
const createMockResponse = (): MockResponse => {
  const res: Partial<MockResponse> = {};
  
  // Mock essential response methods
  res.status = jest.fn().mockImplementation(() => res as MockResponse);
  res.json = jest.fn().mockImplementation(() => res as MockResponse);
  res.send = jest.fn().mockImplementation(() => res as MockResponse);
  
  // Mock clear function
  res.mockClear = () => {
    (res.status as jest.Mock).mockClear();
    (res.json as jest.Mock).mockClear();
    (res.send as jest.Mock).mockClear();
  };
  
  return res as MockResponse;
};

// Helper function to create a mock request with user data
const createMockRequest = (body: any, user: any): Request => {
  // Create a simple mock request with essential properties
  const req: any = {
    body,
    user,
    params: { id: user?.id },
    method: 'POST',
    url: '/api/usuarios/actualizar-perfil',
    headers: {},
    ip: '127.0.0.1',
    get: jest.fn()
  };
  
  return req as Request;
};

describe('actualizarPerfilUsuario', () => {
  // Test data
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const fechaActual = new Date();
  // Test data - use camelCase field names to match controller expectations
  const validUpdateData = {
    nombreCompleto: 'Updated Name',
    telefono: '0987654321',
    direccion: 'Updated Address',
    dni: '87654321'
  };
  
  // Mock user data with all required fields
  const mockUser: TestUser = {
    id: userId,
    nombreCompleto: 'Test User',
    email: 'test@example.com',
    telefono: '1234567890',
    dni: null,
    direccion: 'Test Address',
    roles: [
      {
        rol: {
          nombre: 'cliente'
        }
      }
    ],
    // Additional test-only properties
    password: 'hashedpassword',
    salt: 'somesalt',
    token: null,
    tokenExpiracion: null,
    ultimoInicioSesion: null,
    intentosFallidos: 0,
    bloqueado: false,
    fechaNacimiento: null,
    genero: null,
    fotoPerfil: null,
    notificaciones: true,
    preferencias: {}
  };

  // Test variables
  let req: Partial<Request>;
  let res: MockResponse;
  let currentMockUser: TestUser;
  
  // Mock functions are already defined at the top level
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    // Reset all mocks
    
    // Setup default mock user data
    currentMockUser = { ...mockUser };
    
    // Setup request with user data
    const requestUser = { 
      id: userId,
      email: 'test@example.com',
      nombreCompleto: 'Test User',
      roles: ['user']
    };
    
    // Create mock request with user and update data
    const mockUserWithRoles = {
      ...requestUser,
      roles: requestUser.roles.map(rol => ({ rol: { nombre: rol } }))
    };
    
    // Create the request with the properly typed user
    req = createMockRequest(
      { ...validUpdateData },
      mockUserWithRoles
    );
    
    // Update current mock user with the full user object
    currentMockUser = { 
      ...mockUser,
      roles: mockUserWithRoles.roles 
    };
    
    // Setup response mock
    res = createMockResponse();
    
    // Setup Prisma mocks
    mockFindUnique.mockImplementation(({ where }) => {
      if (where.id === currentMockUser.id) {
        return Promise.resolve({
          ...currentMockUser,
          // Add any additional fields that the controller might expect
          activo: true,
          creadoEn: new Date(),
          modificadoEn: new Date(),
          creadoPor: 'system',
          modificadoPor: 'system'
        });
      }
      return Promise.resolve(null);
    });

    // Mock the update function to return updated user data
    mockUpdate.mockImplementation(({ data }) => {
      // Create a copy of the current mock user
      const updatedUser = { ...currentMockUser };
      
      // Update fields from the request data
      if (data.nombreCompleto) updatedUser.nombreCompleto = data.nombreCompleto;
      if (data.telefono !== undefined) updatedUser.telefono = data.telefono;
      if (data.direccion !== undefined) updatedUser.direccion = data.direccion;
      if (data.dni !== undefined) updatedUser.dni = data.dni;
      
      // Handle the case where nombre_completo is passed in the request body
      if (data.nombre_completo) {
        updatedUser.nombreCompleto = data.nombre_completo;
      }
      
      // Update timestamps
      (updatedUser as any).modificadoEn = new Date();
      (updatedUser as any).modificadoPor = userId;
      
      // Update the current mock user for subsequent tests
      currentMockUser = updatedUser;
      
      return Promise.resolve({
        ...updatedUser,
        // Include any additional fields that the controller might expect
        roles: updatedUser.roles || [{ rol: { nombre: 'cliente' } }]
      });
    });
    
    // Setup role mocks
    mockRolFindMany.mockResolvedValue([{ nombre: 'user' }]);
    mockUsuarioRolFindMany.mockResolvedValue([{ rol: { nombre: 'user' } }]);
    
    // Setup audit mock
    mockRegistrarAuditoria.mockResolvedValue(undefined);
  });

  it('debe actualizar el perfil correctamente', async () => {
    // Arrange    // Create a copy of mockUser to avoid reference issues
    const userToUpdate = JSON.parse(JSON.stringify(mockUser));
    
    // Mock successful find
    mockFindUnique.mockResolvedValueOnce(userToUpdate);
    
    // Create updated user with the new data
    const updatedUser = {
      ...userToUpdate,
      nombreCompleto: validUpdateData.nombreCompleto || userToUpdate.nombreCompleto,
      telefono: validUpdateData.telefono || userToUpdate.telefono,
      direccion: validUpdateData.direccion || userToUpdate.direccion,
      dni: validUpdateData.dni || userToUpdate.dni,
      modificadoEn: new Date(),
      modificadoPor: userId,
      // Ensure roles is included in the response
      roles: userToUpdate.roles || []
    };
    
    mockUpdate.mockResolvedValueOnce(updatedUser);
    
    req = createMockRequest(validUpdateData, { 
      id: userId, 
      email: 'test@example.com',
      nombreCompleto: 'Test User',
      roles: ['user'] 
    });
    
    // Act
    try {
      await actualizarPerfilUsuario(req, res);
    } catch (error) {
      throw error;
    }
    
    // Assert - The controller doesn't set status code on success, only sends JSON
    // Verify database update was called with correct data
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: userId }),
      data: expect.objectContaining({
        nombreCompleto: validUpdateData.nombreCompleto,
        telefono: validUpdateData.telefono,
        direccion: validUpdateData.direccion,
        dni: validUpdateData.dni,
        modificadoEn: expect.any(Date),
        modificadoPor: userId
      })
    }));
    
    // Verify the response contains the expected data
    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseData).toMatchObject({
      ok: true,
      data: {
        id: userId,
        nombreCompleto: validUpdateData.nombreCompleto, // Expect the updated name
        telefono: validUpdateData.telefono,
        direccion: validUpdateData.direccion,
        dni: validUpdateData.dni,
        email: 'test@example.com',
        roles: ['cliente'],
      },
      error: null,
    });
    
    // Verify audit log was called with the correct action and description
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith({
      usuarioId: userId,
      accion: 'modificar_perfil_exitoso',
      descripcion: expect.stringContaining('Perfil modificado. Cambios:'),
      modulo: 'usuarios',
      entidadId: userId,
      entidadTipo: 'usuario',
      ip: '127.0.0.1'
    });
  });
  
  it('debe actualizar el DNI cuando es nulo', async () => {
    // Arrange
    const updateDataWithDNI = { ...validUpdateData, dni: '87654321' };
    req = createMockRequest(updateDataWithDNI, { id: userId, roles: ['user'] });
    
    // Act
    await actualizarPerfilUsuario(req, res);
    
    // Assert - Should allow DNI update when current DNI is null
    // The controller doesn't set status code on success, only sends JSON
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: userId },
      data: expect.objectContaining({
        dni: '87654321',
        modificadoEn: expect.any(Date),
        modificadoPor: userId
      })
    }));
  });
  
  it('no debe permitir actualizar el email', async () => {
    // Arrange
    const updateWithEmail = { ...validUpdateData, email: 'newemail@example.com' };
    req = createMockRequest(updateWithEmail, { 
      id: userId, 
      email: 'test@example.com',
      nombreCompleto: 'Test User',
      roles: ['user'] 
    });
    
    // Act
    await actualizarPerfilUsuario(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'No puedes modificar tu email desde este endpoint por seguridad'
      })
    );
  });
  
  it('no debe permitir actualizar roles', async () => {
    // Arrange
    const updateWithRoles = { ...validUpdateData, roles: ['admin'] };
    req = createMockRequest(updateWithRoles, { 
      id: userId, 
      email: 'test@example.com',
      nombreCompleto: 'Test User',
      roles: ['user'] 
    });
    
    // Act
    await actualizarPerfilUsuario(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Acceso denegado: no puedes modificar tus propios roles'
      })
    );
  });
  
  it('debe manejar error cuando el usuario no existe', async () => {
    // Arrange
    mockFindUnique.mockResolvedValueOnce(null);
    
    // Act
    await actualizarPerfilUsuario(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Usuario no encontrado'
      })
    );
  });
  
  it('debe manejar errores de validación', async () => {
    // Arrange
    const invalidData = { ...validUpdateData, telefono: 'invalid' };
    req = createMockRequest(invalidData, { 
      id: userId, 
      email: 'test@example.com',
      nombreCompleto: 'Test User',
      roles: ['user'] 
    });
    
    // Act
    await actualizarPerfilUsuario(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.any(String)
      })
    );
  });
  
  it('debe manejar errores inesperados', async () => {
    // Arrange
    const error = new Error('Database error');
    mockFindUnique.mockRejectedValueOnce(error);
    
    // Act
    await actualizarPerfilUsuario(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseData).toMatchObject({
      ok: false,
      error: 'Database error'  // The controller uses the actual error message
    });
  });

  it('debe manejar intento de modificar roles', async () => {
    // Try to update roles (should be rejected)
    const reqWithRoles = {
      ...req,
      body: {
        ...req.body,
        roles: ['admin']
      }
    };
    
    await actualizarPerfilUsuario(reqWithRoles as Request, res);
    
    expect(res.status).toHaveBeenCalledWith(403);
    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseData).toMatchObject({
      ok: false,
      error: 'Acceso denegado: no puedes modificar tus propios roles'
    });
  });

  it('debe manejar intento de modificar email', async () => {
    // Try to update email (should be rejected)
    const reqWithEmail = {
      ...req,
      body: {
        ...req.body,
        email: 'newemail@example.com'
      }
    };
    
    await actualizarPerfilUsuario(reqWithEmail as Request, res);
    
    expect(res.status).toHaveBeenCalledWith(403);
    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseData).toMatchObject({
      ok: false,
      error: 'No puedes modificar tu email desde este endpoint por seguridad'
    });
  });

  it('no debe permitir modificar DNI si ya tiene valor', async () => {
    // Mock user with existing DNI
    mockFindUnique.mockResolvedValueOnce({
      ...mockUser,
      dni: '12345678' // Existing DNI value
    });
    
    // Arrange
    const updateDataWithDNI = { ...validUpdateData, dni: '87654321' };
    req = createMockRequest(updateDataWithDNI, { id: userId, roles: ['user'] });
    
    // Act
    await actualizarPerfilUsuario(req, res);
    
    // Assert - Should return 400 if trying to update DNI when it already has a value
    expect(res.status).toHaveBeenCalledWith(400);
    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseData).toMatchObject({
      ok: false,
      error: 'El DNI ya está registrado y no puede ser modificado'
    });
  });

  it('debe manejar usuario no encontrado', async () => {
    // Arrange
    const updateData = { ...validUpdateData };
    req = createMockRequest(updateData, { id: 'non-existent-id', roles: ['user'] });
    mockFindUnique.mockResolvedValueOnce(null);
    
    // Act
    await actualizarPerfilUsuario(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Usuario no encontrado'
      })
    );
  });

  it('debe manejar errores inesperados', async () => {
    
    // Arrange - Mock an error during the find operation
    const error = new Error('Error inesperado');
    mockFindUnique.mockRejectedValueOnce(error);
    
    // Reset mock calls
    res.status.mockClear();
    (res.json as jest.Mock).mockClear();
    
    // Act
    try {
      await actualizarPerfilUsuario(req, res);
    } catch (error) {
      throw error;
    }
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    
    // Verify the error message contains the expected text
    expect(responseData).toMatchObject({
      ok: false,
      error: expect.stringContaining('Error')
    });
    
    // Verify audit log was created for the error
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith(expect.objectContaining({
      accion: 'modificar_perfil_fallido',
      descripcion: expect.stringContaining('Error')
    }));
  });
});
