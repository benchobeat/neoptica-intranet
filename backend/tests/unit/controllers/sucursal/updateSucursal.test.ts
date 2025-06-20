import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createMockRequest, createMockResponse } from '../../test-utils';

// Mock Prisma client before importing the controller
const mockPrisma = {
  sucursal: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

// Mock audit module
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: jest.fn().mockResolvedValue(undefined),
  logError: jest.fn().mockResolvedValue(undefined)
}));

// Import the mocks after setting them up
const { logSuccess, logError } = require('../../../../src/utils/audit');

// Import the controller after setting up mocks
import { actualizarSucursal } from '../../../../src/controllers/sucursalController';

// Type for our mock response methods
type MockResponseMethods = {
  status: jest.Mock<MockResponse, [number]>;
  json: jest.Mock<MockResponse, [any]>;
  sendStatus: jest.Mock<MockResponse, [number]>;
  send: jest.Mock<MockResponse, [any?]>;
  set: jest.Mock<MockResponse, [any, any?]>;
};

// Our mock response type that includes both Express Response and our mock methods
type MockResponse = Response & MockResponseMethods;

// Get the mocked Prisma client instance
const prisma = new PrismaClient();

describe('actualizarSucursal', () => {
  let req: Partial<Request>;
  let res: MockResponse;
  let statusMock: jest.Mock<MockResponse, [number]>;
  let jsonMock: jest.Mock<MockResponse, [any]>;

  const existingSucursal = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nombre: 'Sucursal Original',
    direccion: 'Dirección Original',
    telefono: '1234567890',
    email: 'original@example.com',
    activo: true,
    creadoEn: new Date('2023-01-01'),
    creadoPor: 'original-user',
    modificadoEn: null,
    modificadoPor: null,
  };

  const updatedSucursal = {
    ...existingSucursal,
    nombre: 'Sucursal Actualizada',
    direccion: 'Nueva Dirección',
    telefono: '0987654321',
    email: 'actualizado@example.com',
    activo: false,
    modificadoEn: new Date(),
    modificadoPor: 'test-user-id',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default request
    req = createMockRequest({
      params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      body: {
        nombre: 'Sucursal Actualizada',
        direccion: 'Calle Falsa 123',
        telefono: '0987654321',
        email: 'actualizada@test.com',
        latitud: -2.170998,
        longitud: -79.922356,
      },
      user: { id: 'test-user-id' },
      ip: '127.0.0.1',
    });

    // Create the mock response object with type assertion
    const mockResponse: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      locals: {},
      statusCode: 200,
      headersSent: false,
      chunkedEncoding: false,
      shouldKeepAlive: true,
      useChunkedEncodingByDefault: true,
      // Add other required Express Response properties with default values
      app: {},
      headers: {},
      statusMessage: '',
      // Add other Express Response methods with no-op functions
      append: jest.fn().mockReturnThis(),
      attachment: jest.fn().mockReturnThis(),
      // Add other methods as needed...
    };
    
    // Assign the mock response to res
    res = mockResponse as MockResponse;
    
    // Assign the mock functions to the test variables
    statusMock = res.status as jest.Mock<MockResponse, [number]>;
    jsonMock = res.json as jest.Mock<MockResponse, [any]>;
    
    res = mockResponse;
    statusMock = mockResponse.status;
    jsonMock = mockResponse.json;

    // Reset all Prisma mocks
    mockPrisma.sucursal.findUnique.mockReset();
    mockPrisma.sucursal.findFirst.mockReset();
    mockPrisma.sucursal.update.mockReset();
    logSuccess.mockReset();
    logError.mockReset();
    
    // Default mock implementations
    mockPrisma.sucursal.findUnique.mockImplementation(({ where }) => {
      if (where && where.id === '123e4567-e89b-12d3-a456-426614174000' && where.anuladoEn === null) {
        return Promise.resolve(existingSucursal);
      }
      return Promise.resolve(null);
    });
    
    mockPrisma.sucursal.findFirst.mockResolvedValue(null);
    mockPrisma.sucursal.update.mockResolvedValue(updatedSucursal);
    logSuccess.mockResolvedValue(undefined);
    logError.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe actualizar una sucursal existente correctamente', async () => {
    // Configurar el mock para devolver la sucursal existente
    mockPrisma.sucursal.findUnique.mockResolvedValueOnce(existingSucursal);
    
    await actualizarSucursal(req as Request, res as Response);

    // Verificar que se devolvió el código de estado 200
    expect(statusMock).toHaveBeenCalledWith(200);
    
    // Verificar que se devolvieron los datos correctos
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      data: expect.objectContaining({
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Sucursal Actualizada',
      }),
      error: null,
    });

    // Verificar que se llamó a update con los datos correctos
    expect(mockPrisma.sucursal.update).toHaveBeenCalledWith({
      where: { id: '123e4567-e89b-12d3-a456-426614174000' },
      data: expect.objectContaining({
        nombre: 'Sucursal Actualizada',
        direccion: 'Calle Falsa 123',
        telefono: '0987654321',
        email: 'actualizada@test.com',
        latitud: -2.170998,
        longitud: -79.922356,
        modificadoPor: 'test-user-id',
        modificadoEn: expect.any(Date),
      }),
    });

    // Verify success audit log was created
    expect(logSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'sucursal',
      entityId: '123e4567-e89b-12d3-a456-426614174000',
      module: 'actualizarSucursal',
      action: 'actualizar_sucursal_exitoso',
      message: 'Sucursal actualizada exitosamente',
      details: expect.objectContaining({
        estadoAnterior: expect.objectContaining({
          nombre: 'Sucursal Original',
          direccion: 'Dirección Original',
          telefono: '1234567890',
          email: 'original@example.com'
        }),
        estadoNuevo: expect.objectContaining({
          nombre: 'Sucursal Actualizada',
          direccion: 'Nueva Dirección',
          telefono: '0987654321',
          email: 'actualizado@example.com'
        })
      })
    }));
    // Verify success response format
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      error: null,
      data: expect.objectContaining({
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Sucursal Actualizada',
        direccion: 'Nueva Dirección',
        telefono: '0987654321',
        email: 'actualizado@example.com',
        activo: false
      })
    });
  });

  it('debe devolver error 404 si la sucursal no existe', async () => {
    // Mock para indicar que no existe la sucursal
    mockPrisma.sucursal.findUnique.mockResolvedValueOnce(null);
    
    await actualizarSucursal(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Sucursal no encontrada.',
    });

    // Verificar que no se intentó actualizar
    expect(mockPrisma.sucursal.update).not.toHaveBeenCalled();
  });

  it('debe validar que el nombre no esté duplicado', async () => {
    // First, ensure that findUnique returns the existing sucursal
    mockPrisma.sucursal.findUnique.mockResolvedValueOnce(existingSucursal);
    
    // Then mock findFirst to return a duplicate name
    mockPrisma.sucursal.findFirst.mockResolvedValueOnce({
      id: 'otro-id',
      nombre: 'Sucursal Actualizada',
      anuladoEn: null,
    });
    
    await actualizarSucursal(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ya existe otra sucursal con ese nombre.',
    });

    // Verificar que no se intentó actualizar
    expect(mockPrisma.sucursal.update).not.toHaveBeenCalled();
  });

  it('debe validar el formato del teléfono', async () => {
    // First, ensure findUnique returns the existing sucursal
    mockPrisma.sucursal.findUnique.mockResolvedValueOnce(existingSucursal);
    
    req.body.telefono = '12345';
    
    await actualizarSucursal(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El teléfono debe tener 10 dígitos.',
    });

    // Verificar que no se intentó actualizar
    expect(mockPrisma.sucursal.update).not.toHaveBeenCalled();
  });

  it('debe manejar errores inesperados', async () => {
    const errorMessage = 'Error inesperado';
    mockPrisma.sucursal.findUnique.mockRejectedValueOnce(new Error(errorMessage));
    
    await actualizarSucursal(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al actualizar la sucursal: Error inesperado',
    });

    // Verify error log was created
    expect(logError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'sucursal',
      entityId: '123e4567-e89b-12d3-a456-426614174000',
      module: 'actualizarSucursal',
      action: 'error_actualizar_sucursal',
      message: 'Error al actualizar la sucursal',
      error: expect.any(Error),
      context: expect.objectContaining({
        idSucursal: '123e4567-e89b-12d3-a456-426614174000',
        error: errorMessage,
        tipoError: 'Error',
        codigoError: 'NO_CODE',
        datosSolicitados: expect.any(Object)
      })
    }));
  });

  it('debe validar que el ID sea un UUID válido', async () => {
    // Probar con un ID inválido
    req.params.id = 'id-invalido';
    
    await actualizarSucursal(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'ID inválido',
    });

    // Verificar que no se intentó buscar ni actualizar
    expect(mockPrisma.sucursal.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.sucursal.update).not.toHaveBeenCalled();
  });
});
