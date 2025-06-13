// Import types only to avoid hoisting issues
type Request = import('express').Request;
type Response = import('express').Response;

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

// Mock response object
const createMockResponse = (): Response => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    // Add other mock implementations as needed
  };
  return res as Response;
};

// Mock request object
const createMockRequest = (body: any, user: any): Request => {
  return {
    body,
    user,
    ip: '127.0.0.1',
    params: { id: user?.id },
    // Add required Request properties
    method: 'POST',
    url: '/api/usuarios/perfil',
    headers: {},
    get: jest.fn(),
    // Add other required Request properties as needed
  } as unknown as Request;
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
  const mockUser = {
    id: userId,
    nombreCompleto: 'Test User',
    email: 'test@example.com',
    telefono: '1234567890',
    direccion: 'Test Address',
    dni: null,
    activo: true,
    creadoEn: new Date(),
    modificadoEn: new Date(),
    creadoPor: 'system',
    modificadoPor: 'system',
    roles: [
      {
        rol: {
          nombre: 'cliente'
        }
      }
    ],
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
  let res: Partial<Response>;
  let currentMockUser: any;
  
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
      roles: ['user']
    };
    
    req = createMockRequest(
      { ...validUpdateData },
      requestUser
    );
    
    // Setup response mock with required Response properties
    res = {
      ...createMockResponse(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Response;
    
    // Setup Prisma mocks
    mockFindUnique.mockResolvedValue(currentMockUser);
    // Mock the update function to return updated user data
    mockUpdate.mockImplementation(({ data }) => {
      // Create a copy of the current mock user
      const updatedUser = { ...currentMockUser };
      
      // Update fields from the request data
      if (data.nombreCompleto) updatedUser.nombreCompleto = data.nombreCompleto;
      if (data.telefono) updatedUser.telefono = data.telefono;
      if (data.direccion) updatedUser.direccion = data.direccion;
      if (data.dni !== undefined) updatedUser.dni = data.dni;
      
      // Handle the case where nombre_completo is passed in the request body
      if (data.nombre_completo) {
        updatedUser.nombreCompleto = data.nombre_completo;
      }
      
      // Update timestamps
      updatedUser.modificadoEn = new Date();
      updatedUser.modificadoPor = userId;
      
      // Ensure roles are in the expected format
      updatedUser.roles = [{ rol: { nombre: 'cliente' } }];
      
      return Promise.resolve(updatedUser);
    });
    
    // Setup role mocks
    mockRolFindMany.mockResolvedValue([{ nombre: 'user' }]);
    mockUsuarioRolFindMany.mockResolvedValue([{ rol: { nombre: 'user' } }]);
    
    // Setup audit mock
    mockRegistrarAuditoria.mockResolvedValue(undefined);
  });

  it('debe actualizar el perfil correctamente', async () => {
    console.log('--- Starting test: debe actualizar el perfil correctamente ---');
    
    // Arrange    // Create a copy of mockUser to avoid reference issues
    const userToUpdate = JSON.parse(JSON.stringify(mockUser));
    
    // Mock successful find
    console.log('Mocking findUnique with user:', JSON.stringify(userToUpdate, null, 2));
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
    
    console.log('Mocking update with response:', JSON.stringify(updatedUser, null, 2));
    mockUpdate.mockResolvedValueOnce(updatedUser);
    
    req = createMockRequest(validUpdateData, { id: userId, roles: ['user'] });
    console.log('Request created with body:', JSON.stringify(validUpdateData, null, 2));
    
    // Act
    console.log('Calling actualizarPerfilUsuario...');
    try {
      await actualizarPerfilUsuario(req, res);
      console.log('actualizarPerfilUsuario completed');
    } catch (error) {
      console.error('Error in actualizarPerfilUsuario:', error);
      throw error;
    }
    
    // Debug: Log all calls to res.status and res.json
    console.log('res.status calls:', (res.status as jest.Mock).mock.calls);
    console.log('res.json calls:', (res.json as jest.Mock).mock.calls);
    
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
    req = createMockRequest(updateWithEmail, { id: userId, roles: ['user'] });
    
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
    req = createMockRequest(updateWithRoles, { id: userId, roles: ['user'] });
    
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
    req = createMockRequest(invalidData, { id: userId, roles: ['user'] });
    
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
    console.log('\n--- Starting test: debe manejar errores inesperados ---');
    
    // Arrange - Mock an error during the find operation
    const error = new Error('Error inesperado');
    console.log('Mocking findUnique to reject with error:', error.message);
    mockFindUnique.mockRejectedValueOnce(error);
    
    // Reset mock calls
    (res.status as jest.Mock).mockClear();
    (res.json as jest.Mock).mockClear();
    
    // Act
    console.log('Calling actualizarPerfilUsuario...');
    try {
      await actualizarPerfilUsuario(req, res);
      console.log('actualizarPerfilUsuario completed');
    } catch (error) {
      console.error('Error in actualizarPerfilUsuario:', error);
      throw error;
    }
    
    // Debug: Log all calls to res.status and res.json
    console.log('res.status calls:', (res.status as jest.Mock).mock.calls);
    console.log('res.json calls:', (res.json as jest.Mock).mock.calls);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    console.log('Response data:', responseData);
    
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
