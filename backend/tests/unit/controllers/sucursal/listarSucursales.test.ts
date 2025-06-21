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
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: jest.fn().mockResolvedValue(undefined),
  logError: jest.fn().mockResolvedValue(undefined)
}));

// Import the mocks after setting them up
const { logSuccess, logError } = require('../../../../src/utils/audit');

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
  logSuccess.mockReset();
  logError.mockReset();
  
  // Default mock implementation
  mockSucursalFindMany.mockResolvedValue(mockSucursales);
  logSuccess.mockResolvedValue(undefined);
  logError.mockResolvedValue(undefined);
});

describe('listarSucursales', () => {
  it('debe devolver una lista de sucursales', async () => {
    // Act
    await listarSucursales(req as Request, res as Response);
    
    // Assert
    expect(mockSucursalFindMany).toHaveBeenCalledWith({
      where: {
        activo: true,
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
    
    // Verify success log was created
    expect(logSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'sucursal',
      module: 'listarSucursales',
      action: 'listar_sucursales_exitoso',
      message: 'Listado de sucursales obtenido exitosamente',
      details: {
        total: 3,
        filtrosAplicados: {
          activo: null,
          soloActivas: true
        },
        ordenamiento: 'nombre (ascendente)'
      }
    }));
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
    const dbError = new Error(errorMessage);
    mockSucursalFindMany.mockRejectedValueOnce(dbError);
    
    // Act
    await listarSucursales(req as Request, res as Response);
    
    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al listar sucursales: Error de base de datos',
    });
    
    // Verify error log was created
    expect(logError).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'sucursal',
      module: 'listarSucursales',
      action: 'error_listar_sucursales',
      message: 'Error al listar sucursales',
      error: dbError,
      context: {
        error: errorMessage,
        filtrosAplicados: {
          activo: null,
          soloActivas: true
        },
        stack: expect.any(String)
      }
    });
  });
});
