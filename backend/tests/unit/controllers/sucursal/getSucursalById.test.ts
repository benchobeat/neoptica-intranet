import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';

// Mock prisma before importing the controller
const mockSucursalFindUnique = jest.fn();
const mockPrismaClient = {
  sucursal: {
    findUnique: mockSucursalFindUnique,
  },
  $disconnect: jest.fn(),
};

// Mock @prisma/client before importing any modules that use it
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock the audit module
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
}));

// Import the controller only after mocking dependencies
import { obtenerSucursalPorId } from '../../../../src/controllers/sucursalController';

describe('obtenerSucursalPorId', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockSucursal = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nombre: 'Sucursal Test',
    direccion: 'Calle Falsa 123',
    telefono: '1234567890',
    email: 'test@example.com',
    estado: true,
    latitud: null,
    longitud: null,
    anuladoEn: null,
    anuladoPor: null,
    modificadoEn: null,
    modificadoPor: null,
    creadoEn: new Date(),
    creadoPor: 'test-user-id',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    resetMocks();
    
    // Setup default request with ID parameter
    req = createMockRequest({
      params: { id: '123e4567-e89b-12d3-a456-426614174000' },
    });

    // Setup response mock
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Reset the Prisma mock
    mockSucursalFindUnique.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver una sucursal existente', async () => {
    // Set up the mock to return the test data for this specific test
    mockSucursalFindUnique.mockResolvedValueOnce(mockSucursal);
    
    // Call the controller
    await obtenerSucursalPorId(req as Request, res as Response);

    // Verify the response
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      data: expect.objectContaining({
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Sucursal Test',
      }),
      error: null,
    });

    // Verify the controller called findUnique with the correct parameters
    expect(mockSucursalFindUnique).toHaveBeenCalledWith({
      where: { 
        id: '123e4567-e89b-12d3-a456-426614174000',
        anuladoEn: null,
      },
    });
  });

  it('debe devolver un error 404 si la sucursal no existe', async () => {
    mockSucursalFindUnique.mockResolvedValueOnce(null);
    
    await obtenerSucursalPorId(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Sucursal no encontrada.',
    });
  });

  it('debe validar el formato del ID', async () => {
    req.params.id = 'invalid-id';
    
    await obtenerSucursalPorId(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'ID inválido', // Controller returns this message for invalid UUID format
        data: null
      })
    );
  });

  it('debe manejar errores inesperados', async () => {
    const errorMessage = 'Error inesperado';
    mockSucursalFindUnique.mockRejectedValueOnce(new Error(errorMessage));
    
    await obtenerSucursalPorId(req as Request, res as Response);

    // The controller returns 500 for unexpected errors
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        data: null,
        error: 'Ocurrió un error al obtener la sucursal.'
      })
    );
  });

  it('debe manejar el caso cuando no se proporciona un ID', async () => {
    req.params = {};
    
    await obtenerSucursalPorId(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        data: null,
        error: 'ID inválido' // Controller returns this message when ID is missing
      })
    );
  });
});
