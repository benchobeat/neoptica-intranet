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
    estado: true,
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
        estado: true,
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
        estado: data.estado !== undefined ? data.estado : true,
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

  it('debe crear una nueva sucursal exitosamente', async () => {
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
        estado: true,
      }),
      error: null,
    }));
    
    // Verify Prisma was called correctly
    expect(prisma.sucursal.findFirst).toHaveBeenCalledWith({
      where: {
        nombre: { equals: 'Sucursal Test', mode: 'insensitive' },
        anuladoEn: null,
      },
    });
    
    // Verify create was called with correct data
    expect(prisma.sucursal.create).toHaveBeenCalledWith({
      data: {
        nombre: 'Sucursal Test',
        direccion: 'Calle Falsa 123',
        telefono: '1234567890',
        email: 'test@example.com',
        estado: true,
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
        estado: true,
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

  it('debe verificar que no exista una sucursal con el mismo nombre', async () => {
    // Arrange
    const req = createMockRequest({
      body: {
        nombre: 'Sucursal Duplicada',
        direccion: 'Calle Falsa 123',
        telefono: '1234567890',
        email: 'duplicada@test.com',
        estado: true,
      },
      user: { id: 'test-user-id' },
    });

    // Create a proper mock response with all required methods
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Response;

    // Mock Prisma to return an existing sucursal when checking for duplicates
    (prisma.sucursal.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'existing-id',
      nombre: 'Sucursal Duplicada',
      direccion: 'Otra dirección',
      telefono: '0987654321',
      email: 'otro@email.com',
      estado: true,
      creadoEn: new Date(),
      creadoPor: 'another-user',
    });

    // Act
    await crearSucursal(req as Request, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      data: null,
      error: 'Ya existe una sucursal con ese nombre.'
    }));
    
    // Verify create was not called
    expect(prisma.sucursal.create).not.toHaveBeenCalled();
    
    // Verify error log was called for duplicate name check
    expect(logError).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'sucursal',
      module: 'crearSucursal',
      action: 'error_crear_sucursal',
      error: 'Ya existe una sucursal con ese nombre.',
      message: 'Error al crear la sucursal',
      context: {
        nombre: 'Sucursal Duplicada',
        direccion: 'Calle Falsa 123',
        telefono: '1234567890',
        email: 'duplicada@test.com',
        estado: true,
        latitud: undefined,
        longitud: undefined,
        error: 'Ya existe una sucursal con ese nombre.'
      }
    });
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
});
