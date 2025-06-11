import { Request, Response } from 'express';
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
const mockRegistrarAuditoria = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria,
}));

// Import the controller after setting up mocks
import { actualizarSucursal } from '../../../../src/controllers/sucursalController';

// Simple mock response type with only the methods we need for testing
type MockResponse = {
  status: jest.Mock<MockResponse, [number]>;
  json: jest.Mock<MockResponse, [any]>;
  sendStatus: jest.Mock<MockResponse, [number]>;
  send: jest.Mock<MockResponse, [any?]>;
  set: jest.Mock<MockResponse, [string, string]>;
};

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
    estado: true,
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
    estado: false,
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

    // Setup response mocks with proper typing
    const mockResponse: MockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };
    
    res = mockResponse;
    statusMock = mockResponse.status;
    jsonMock = mockResponse.json;

    // Reset all Prisma mocks
    mockPrisma.sucursal.findUnique.mockReset();
    mockPrisma.sucursal.findFirst.mockReset();
    mockPrisma.sucursal.update.mockReset();
    mockRegistrarAuditoria.mockReset();
    
    // Default mock implementations
    mockPrisma.sucursal.findUnique.mockImplementation(({ where }) => {
      if (where && where.id === '123e4567-e89b-12d3-a456-426614174000' && where.anuladoEn === null) {
        return Promise.resolve(existingSucursal);
      }
      return Promise.resolve(null);
    });
    
    mockPrisma.sucursal.findFirst.mockResolvedValue(null);
    mockPrisma.sucursal.update.mockResolvedValue(updatedSucursal);
    mockRegistrarAuditoria.mockResolvedValue(undefined);
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

    // Verificar que se registró la auditoría
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith({
      usuarioId: 'test-user-id',
      accion: 'actualizar_sucursal',
      descripcion: expect.any(String),
      ip: '127.0.0.1',
      entidadTipo: 'sucursal',
      entidadId: '123e4567-e89b-12d3-a456-426614174000',
      modulo: 'sucursales',
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
      error: 'Ocurrió un error al actualizar la sucursal.',
    });

    // Verificar que se registró la auditoría de error
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith({
      usuarioId: 'test-user-id',
      accion: 'actualizar_sucursal_fallido',
      descripcion: expect.stringContaining(errorMessage),
      ip: '127.0.0.1',
      entidadTipo: 'sucursal',
      entidadId: '123e4567-e89b-12d3-a456-426614174000',
      modulo: 'sucursales',
    });
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
