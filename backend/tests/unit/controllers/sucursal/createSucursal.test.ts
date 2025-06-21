import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { v4 as uuidv4 } from 'uuid';

// 1. First mock the audit module
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: jest.fn().mockResolvedValue(undefined),
  logError: jest.fn().mockResolvedValue(undefined)
}));

// 2. Then import the controller after setting up mocks
import { crearSucursal } from '../../../../src/controllers/sucursalController';
import { PrismaClient } from '@prisma/client';

// 3. Get the mock function references
const { logSuccess, logError } = jest.requireMock('../../../../src/utils/audit');

// Helper function to generate valid UUIDs
const generateValidUuid = () => '123e4567-e89b-12d3-a456-426614174000';

// Mock the entire uuid module
jest.mock('uuid', () => ({
  v4: () => generateValidUuid(), // Use the helper function for consistency
}));

// Mock the Prisma client with proper types
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    sucursal: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    logAuditoria: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
    $transaction: jest.fn((fn) => fn()),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    ...mockPrisma,
  };
});

// Create Prisma client instance after mocking
const prisma = new PrismaClient();

describe('crearSucursal', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockSucursal = {
    id: generateValidUuid(),
    nombre: 'Sucursal Test',
    direccion: 'Calle Falsa 123',
    telefono: '1234567890',
    email: 'test@example.com',
    activo: true,
    creadoEn: new Date(),
    creadoPor: 'test-user-id',
    modificadoEn: null,
    modificadoPor: null,
    anuladoEn: null,
    anuladoPor: null
  };

  beforeEach(() => {
    // Reset all mocks before each test
    resetMocks();
    
    // Setup default request with user authentication
    req = createMockRequest({
      user: { id: 'test-user-id', email: 'test@example.com' }, // Add user authentication
      body: {
        nombre: 'Sucursal Test',
        direccion: 'Calle Falsa 123',
        telefono: '1234567890',
        email: 'test@example.com',
        latitud: null,
        longitud: null
      }
    });

    // Setup response mock
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock for findFirst (no existing sucursal)
    (prisma.sucursal.findFirst as jest.Mock).mockImplementation(({ where }) => {
      if (where.nombre) {
        return Promise.resolve(null);
      }
      if (where.email) {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });
    
    // Mock for create
    (prisma.sucursal.create as jest.Mock).mockImplementation(({ data }) => {
      return Promise.resolve({
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: data.nombre,
        direccion: data.direccion || null,
        telefono: data.telefono || null,
        email: data.email ? data.email.toLowerCase() : null,
        latitud: data.latitud || null,
        longitud: data.longitud || null,
        activo: data.activo !== undefined ? data.activo : true,
        creadoEn: new Date(),
        creadoPor: data.creadoPor || 'system',
        modificadoEn: null,
        modificadoPor: null,
        anuladoEn: null,
        anuladoPor: null,
      });
    });
    
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Reset the mock implementations to the default
    logSuccess.mockResolvedValue(undefined);
    logError.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear una nueva sucursal exitosamente con activo=true aunque no se envíe en el body', async () => {
    // Act
    await crearSucursal(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.objectContaining({
        nombre: 'Sucursal Test',
        direccion: 'Calle Falsa 123',
        telefono: '1234567890',
        email: 'test@example.com',
        activo: true,
      }),
      error: null,
    }));
    
    // Verify Prisma was called correctly
    expect(prisma.sucursal.findFirst).toHaveBeenCalledWith({
      where: {
        nombre: { equals: 'Sucursal Test', mode: 'insensitive' },
      },
    });
    
    // Verify create was called with correct data
    expect(prisma.sucursal.create).toHaveBeenCalledWith({
      data: {
        nombre: 'Sucursal Test',
        direccion: 'Calle Falsa 123',
        telefono: '1234567890',
        email: 'test@example.com',
        activo: true, // Comprobamos que activo se establece siempre como true aunque no se envíe en el body
        creadoPor: 'test-user-id',
        creadoEn: expect.any(Date),
        latitud: null,
        longitud: null,
      },
    });
    
    // Verify audit log was called with correct parameters
    expect(logSuccess).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'sucursal',
      entityId: '123e4567-e89b-12d3-a456-426614174000',
      module: 'crearSucursal',
      action: 'crear_sucursal_exitoso',
      message: 'Sucursal creada exitosamente',
      details: {
        direccion: 'Calle Falsa 123',
        email: 'test@example.com',
        activo: true,
        latitud: null,
        longitud: null,
        nombre: 'Sucursal Test',
        telefono: '1234567890',
      }
    });
  });

  it('debe validar que el nombre sea requerido', async () => {
    req.body.nombre = '';
    
    await crearSucursal(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('El nombre es obligatorio'),
      })
    );
  });

  it('debe validar el formato del teléfono', async () => {
    req.body.telefono = '12345';
    
    await crearSucursal(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('El teléfono debe tener 10 dígitos'),
      })
    );
  });

  it('debe validar que el email sea válido si se proporciona', async () => {
    req.body.email = 'correo-invalido';
    
    await crearSucursal(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El email tiene formato inválido.',
      })
    );
  });

  it('debe verificar que no exista una sucursal activa con el mismo nombre', async () => {
    // Arrange
    const req = createMockRequest({
      body: {
        nombre: 'Sucursal Duplicada',
        direccion: 'Calle Falsa 123',
        telefono: '1234567890',
        email: 'duplicada@test.com'
      },
      user: { id: 'test-user-id' },
    });

    // Create a proper mock response with all required methods
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Response;

    // Mock Prisma to return an active sucursal with the same name
    const existingSucursal = {
      id: 'existing-id',
      nombre: 'Sucursal Duplicada',
      direccion: 'Otra dirección',
      telefono: '0987654321',
      email: 'otro@email.com',
      activo: true, // Active sucursal should cause a conflict
      anuladoEn: null,
      anuladoPor: null,
      creadoEn: new Date(),
      creadoPor: 'another-user',
      modificadoEn: null,
      modificadoPor: null,
      latitud: null,
      longitud: null
    };
    
    (prisma.sucursal.findFirst as jest.Mock).mockResolvedValueOnce(existingSucursal);

    // Act
    await crearSucursal(req as Request, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      data: null,
      error: 'Ya existe una sucursal activa con ese nombre.'
    }));
    
    // Verify create was not called
    expect(prisma.sucursal.create).not.toHaveBeenCalled();
    
    // Verify error log was called for duplicate name check
    expect(logError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'sucursal',
      module: 'crearSucursal',
      action: 'error_crear_sucursal',
      error: 'Ya existe una sucursal activa con ese nombre.',
      message: 'Error al crear la sucursal',
      context: expect.objectContaining({
        nombre: 'Sucursal Duplicada',
        direccion: 'Calle Falsa 123',
        telefono: '1234567890',
        email: 'duplicada@test.com',
        activo: true,
        error: 'Ya existe una sucursal activa con ese nombre.'
      })
    }));
  });

  it('debe manejar errores inesperados', async () => {
    const errorMessage = 'Error inesperado';
    (prisma.sucursal.findFirst as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    await crearSucursal(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al crear sucursal: Error inesperado'
    });
  });

  // === TESTS PARA LA FUNCIONALIDAD DE REACTIVACIÓN DE SUCURSALES ===
  
  it('debe reactivar una sucursal inactiva (activo=false) cuando se intenta crear con el mismo nombre', async () => {
    // Arrange
    const sucursalInactiva = {
      id: 'inactive-id-123',
      nombre: 'Sucursal Test',
      direccion: 'Dirección Antigua',
      telefono: '9876543210',
      email: 'antiguo@test.com',
      activo: false, // Sucursal inactiva
      anuladoEn: null,
      anuladoPor: null,
      creadoEn: new Date('2023-01-01'),
      creadoPor: 'otro-usuario',
      modificadoEn: new Date('2023-01-02'),
      modificadoPor: 'otro-usuario',
      latitud: 10.123,
      longitud: -74.456
    };
    
    // Mock para encontrar una sucursal inactiva con el mismo nombre
    (prisma.sucursal.findFirst as jest.Mock).mockResolvedValueOnce(sucursalInactiva);
    
    // Mock para la actualización de la sucursal
    (prisma.sucursal.update as jest.Mock).mockResolvedValueOnce({
      ...sucursalInactiva,
      activo: true,
      direccion: 'Calle Falsa 123', // Nueva dirección
      telefono: '1234567890', // Nuevo teléfono
      email: 'test@example.com', // Nuevo email
      modificadoEn: new Date(),
      modificadoPor: 'test-user-id'
    });
    
    // Act
    await crearSucursal(req as Request, res as Response);
    
    // Assert
    expect(statusMock).toHaveBeenCalledWith(200); // 200 OK para reactivación
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.objectContaining({
        id: 'inactive-id-123',
        nombre: 'Sucursal Test',
        mensaje: 'Sucursal reactivada exitosamente'
      }),
      error: null
    }));
    
    // Verify update was called with correct parameters
    expect(prisma.sucursal.update).toHaveBeenCalledWith({
      where: { id: 'inactive-id-123' },
      data: expect.objectContaining({
        activo: true,
        anuladoEn: null,
        anuladoPor: null,
        direccion: 'Calle Falsa 123',
        telefono: '1234567890',
        email: 'test@example.com',
        modificadoEn: expect.any(Date),
        modificadoPor: 'test-user-id'
      })
    });
    
    // Verify success audit log was called
    expect(logSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1', 
      entityType: 'sucursal',
      entityId: 'inactive-id-123',
      module: 'crearSucursal',
      action: 'reactivar_sucursal_exitoso',
      message: 'Sucursal reactivada exitosamente'
    }));
  });
  
  it('debe reactivar una sucursal anulada (anuladoEn no es null) cuando se intenta crear con el mismo nombre', async () => {
    // Arrange
    const sucursalAnulada = {
      id: 'anulada-id-456',
      nombre: 'Sucursal Test',
      direccion: 'Dirección Vieja',
      telefono: '5551234567',
      email: 'viejo@test.com',
      activo: true, // Puede ser true pero anulada
      anuladoEn: new Date('2023-05-15'), // Fecha de anulación
      anuladoPor: 'admin-user',
      creadoEn: new Date('2023-01-01'),
      creadoPor: 'otro-usuario',
      modificadoEn: new Date('2023-05-15'),
      modificadoPor: 'admin-user',
      latitud: null,
      longitud: null
    };
    
    // Mock para encontrar una sucursal anulada con el mismo nombre
    (prisma.sucursal.findFirst as jest.Mock).mockResolvedValueOnce(sucursalAnulada);
    
    // Mock para la actualización de la sucursal
    (prisma.sucursal.update as jest.Mock).mockResolvedValueOnce({
      ...sucursalAnulada,
      activo: true,
      anuladoEn: null,
      anuladoPor: null,
      direccion: 'Calle Falsa 123',
      telefono: '1234567890',
      email: 'test@example.com',
      modificadoEn: new Date(),
      modificadoPor: 'test-user-id'
    });
    
    // Act
    await crearSucursal(req as Request, res as Response);
    
    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.objectContaining({
        id: 'anulada-id-456',
        nombre: 'Sucursal Test',
        mensaje: 'Sucursal reactivada exitosamente'
      }),
      error: null
    }));
    
    // Verify update was called with correct parameters
    expect(prisma.sucursal.update).toHaveBeenCalledWith({
      where: { id: 'anulada-id-456' },
      data: expect.objectContaining({
        activo: true,
        anuladoEn: null,
        anuladoPor: null,
        direccion: 'Calle Falsa 123',
        telefono: '1234567890',
        email: 'test@example.com',
        modificadoEn: expect.any(Date),
        modificadoPor: 'test-user-id'
      })
    });
  });
  
  it('debe mantener los campos originales si no se proporcionan nuevos valores al reactivar', async () => {
    // Arrange
    const sucursalInactiva = {
      id: 'inactive-id-789',
      nombre: 'Sucursal Test',
      direccion: 'Dirección Original',
      telefono: '9990001111',
      email: 'original@test.com',
      activo: false,
      anuladoEn: new Date('2023-06-01'),
      anuladoPor: 'otro-admin',
      creadoEn: new Date('2023-02-01'),
      creadoPor: 'creador-original',
      modificadoEn: new Date('2023-06-01'),
      modificadoPor: 'otro-admin',
      latitud: 12.345,
      longitud: -67.890
    };
    
    // Crear una solicitud sin algunos campos
    const reqParcial = createMockRequest({
      body: {
        nombre: 'Sucursal Test', // Solo enviamos el nombre
      },
      user: { id: 'test-user-id', email: 'test@example.com' },
    });
    
    // Mock para encontrar una sucursal inactiva
    (prisma.sucursal.findFirst as jest.Mock).mockResolvedValueOnce(sucursalInactiva);
    
    // Mock para la actualización
    (prisma.sucursal.update as jest.Mock).mockResolvedValueOnce({
      ...sucursalInactiva,
      activo: true,
      anuladoEn: null,
      anuladoPor: null,
      // Se mantienen los datos originales para campos no especificados
      direccion: 'Dirección Original',
      telefono: '9990001111',
      email: 'original@test.com',
      latitud: 12.345,
      longitud: -67.890,
      modificadoEn: new Date(),
      modificadoPor: 'test-user-id'
    });
    
    // Act
    await crearSucursal(reqParcial as Request, res as Response);
    
    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    
    // Verify update was called preserving original values
    expect(prisma.sucursal.update).toHaveBeenCalledWith({
      where: { id: 'inactive-id-789' },
      data: expect.objectContaining({
        activo: true,
        anuladoEn: null,
        anuladoPor: null,
        // Importante: los campos no proporcionados deben mantener valores originales
        direccion: 'Dirección Original',
        telefono: '9990001111',
        email: 'original@test.com',
        latitud: 12.345,
        longitud: -67.890,
        modificadoEn: expect.any(Date),
        modificadoPor: 'test-user-id'
      })
    });
  });
  
  it('debe manejar errores durante la reactivación', async () => {
    // Arrange
    const sucursalInactiva = {
      id: 'error-id-999',
      nombre: 'Sucursal Test',
      direccion: 'Dirección Error',
      telefono: '1231231234',
      email: 'error@test.com',
      activo: false,
      anuladoEn: new Date('2023-07-01'),
      anuladoPor: 'admin',
      creadoEn: new Date('2023-01-15'),
      creadoPor: 'admin',
      modificadoEn: new Date('2023-07-01'),
      modificadoPor: 'admin',
      latitud: null,
      longitud: null
    };
    
    // Mock para encontrar una sucursal inactiva
    (prisma.sucursal.findFirst as jest.Mock).mockResolvedValueOnce(sucursalInactiva);
    
    // Mock para simular un error durante la actualización
    const errorMessage = 'Error al actualizar la sucursal';
    (prisma.sucursal.update as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    // Act
    await crearSucursal(req as Request, res as Response);
    
    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      data: null,
      error: 'Error al reactivar la sucursal.'
    }));
    
    // Verify error log was called
    expect(logError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'sucursal',
      entityId: 'error-id-999',
      module: 'crearSucursal',
      action: 'error_reactivar_sucursal',
      message: 'Error al reactivar la sucursal',
      error: errorMessage
    }));
  });
});
