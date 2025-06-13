import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { mockSucursalList } from '../../__fixtures__/sucursalFixtures';

// Mock prisma before importing the controller
const mockSucursalFindMany = jest.fn();
const mockPrismaClient = {
  sucursal: {
    findMany: mockSucursalFindMany,
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
const mockRegistrarAuditoria = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria,
}));

// Import the controller only after mocking dependencies
import { listarSucursales } from '../../../../src/controllers/sucursalController';
import prisma from '../../../../src/utils/prisma';

let req: Partial<Request>;
let res: Partial<Response>;
let jsonMock: jest.Mock;
let statusMock: jest.Mock;

// Use the mock data from fixtures
const mockSucursales = mockSucursalList;

beforeEach(() => {
  // Reset all mocks before each test
  resetMocks();
  
  // Setup default request
  req = createMockRequest({
    query: {},
  });
  
  // Setup response with mock functions
  jsonMock = jest.fn();
  statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  
  res = {
    status: statusMock as unknown as (code: number) => Response,
    json: jsonMock as unknown as (body?: any) => Response,
  };
  
  // Reset mock implementations
  mockSucursalFindMany.mockReset();
  mockRegistrarAuditoria.mockReset();
  
  // Default mock implementation
  mockSucursalFindMany.mockResolvedValue(mockSucursales);
});

describe('listarSucursales', () => {
  it('debe devolver una lista de sucursales', async () => {
    // Act
    await listarSucursales(req as Request, res as Response);
    
    // Assert
    expect(mockSucursalFindMany).toHaveBeenCalledWith({
      where: {
        anuladoEn: null,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
    
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          nombre: expect.any(String),
        })
      ]),
      error: null,
    });
    
    // Verify audit log was created
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith({
      usuarioId: 'test-user-id',
      accion: 'listar_sucursales',
      descripcion: expect.stringContaining('Se listaron'),
      ip: '127.0.0.1',
      entidadTipo: 'sucursal',
      modulo: 'sucursales',
    });
  });

  it('debe devolver un array vacío cuando no hay sucursales', async () => {
    // Arrange
    mockSucursalFindMany.mockResolvedValueOnce([]);
    
    // Act
    await listarSucursales(req as Request, res as Response);
    
    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      data: [],
      error: null,
    });
  });
  
  it('debe manejar errores correctamente', async () => {
    // Arrange
    const errorMessage = 'Error de base de datos';
    mockSucursalFindMany.mockRejectedValueOnce(new Error(errorMessage));
    
    // Act
    await listarSucursales(req as Request, res as Response);
    
    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener el listado de sucursales.',
    });
    
    // Verify error audit log was created
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith({
      usuarioId: 'test-user-id',
      accion: 'listar_sucursales_fallido',
      descripcion: errorMessage,
      ip: '127.0.0.1',
      entidadTipo: 'sucursal',
      modulo: 'sucursales',
    });
  });
});
