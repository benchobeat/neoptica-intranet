import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { mockSucursalList } from '../../__fixtures__/sucursalFixtures';

// Mock prisma before importing the controller
const mockSucursalFindMany = jest.fn();
const mockSucursalCount = jest.fn();
const mockPrismaClient = {
  sucursal: {
    findMany: mockSucursalFindMany,
    count: mockSucursalCount,
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
import { listarSucursalesPaginadas } from '../../../../src/controllers/sucursalController';
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
    query: {
      page: '1',
      limit: '10',
    },
  });

  // Setup response mock
  jsonMock = jest.fn();
  statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  res = {
    status: statusMock,
    json: jsonMock,
  };

  // Mock Prisma responses
  mockSucursalFindMany.mockResolvedValue(mockSucursales);
  mockSucursalCount.mockResolvedValue(mockSucursales.length);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('listarSucursalesPaginadas', () => {

  beforeEach(() => {
    // Reset all mocks before each test
    resetMocks();
    
    // Setup default request
    req = createMockRequest({
      query: {
        page: '1',
        limit: '10',
      },
    });

    // Setup response mock
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Mock Prisma responses
    (prisma.sucursal.findMany as jest.Mock).mockResolvedValue(mockSucursales);
    (prisma.sucursal.count as jest.Mock).mockResolvedValue(mockSucursales.length);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe listar sucursales con paginación por defecto', async () => {
    // Arrange
    const expectedResponse = {
      ok: true,
      data: {
        items: mockSucursales,
        page: 1,
        pageSize: 10,
        total: mockSucursales.length,
      },
      error: null,
    };

    // Act
    await listarSucursalesPaginadas(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(expectedResponse);
    
    // Verify Prisma was called with correct pagination
    expect(mockSucursalFindMany).toHaveBeenCalledWith({
      where: { anuladoEn: null },
      skip: 0,
      take: 10,
      orderBy: { nombre: 'asc' },
    });
  });

  it('debe aplicar filtro por nombre', async () => {
    // Arrange
    const searchText = 'Sucursal 1';
    req.query = {
      ...req.query,
      search: searchText, // The controller expects 'search' parameter for filtering by name
    };

    // Mock the count to return 1 for the filtered result
    mockSucursalCount.mockResolvedValueOnce(1);
    
    // Mock the findMany to return filtered results
    mockSucursalFindMany.mockResolvedValueOnce([mockSucursales[0]]);

    // Act
    await listarSucursalesPaginadas(req as Request, res as Response);


    // Assert that the response is correct
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          items: [mockSucursales[0]],
          total: 1,
          page: 1,
          pageSize: 10,
        }),
      })
    );
  });

  it('debe aplicar filtro por activo', async () => {
    // Arrange
    req.query = {
      ...req.query,
      activo: 'true',
    };

    // Act
    await listarSucursalesPaginadas(req as Request, res as Response);

    // Assert
    expect(mockSucursalFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          activo: true,
          anuladoEn: null,
        }),
        orderBy: { nombre: 'asc' },
      })
    );
  });

  it('debe manejar la paginación personalizada', async () => {
    // Arrange
    const page = 1; // First page (1-based index)
    const pageSize = 2; // Custom page size smaller than our mock data
    const totalItems = mockSucursales.length; // Total items in our mock data
    
    // Mock the request with custom pagination
    const mockRequest = {
      ...req,
      query: {
        page: page.toString(),
        pageSize: pageSize.toString(),
      },
      user: { id: 'test-user-id' },
      ip: '127.0.0.1',
    } as unknown as Request;

    // Mock the count to return total items
    mockSucursalCount.mockResolvedValueOnce(totalItems);
    
    // Mock the findMany to return a subset of items based on pagination
    const expectedItems = mockSucursales.slice(0, pageSize);
    mockSucursalFindMany.mockResolvedValueOnce(expectedItems);

    // Act
    await listarSucursalesPaginadas(mockRequest, res as Response);

    // Assert that the response is correct
    expect(statusMock).toHaveBeenCalledWith(200);
    
    // Check the response structure and pagination values
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          items: expect.any(Array),
          total: totalItems,
          page: page,
          pageSize: pageSize,
        }),
      })
    );

    // Verify the response data matches our expectations
    const responseData = jsonMock.mock.calls[0][0];
    expect(responseData.data.items).toHaveLength(pageSize);
    expect(responseData.data.page).toBe(page);
    expect(responseData.data.pageSize).toBe(pageSize);
    expect(responseData.data.total).toBe(totalItems);
  });

  it('debe manejar errores inesperados', async () => {
    // Arrange
    const errorMessage = 'Error inesperado';
    mockSucursalFindMany.mockRejectedValueOnce(new Error(errorMessage));
    
    // Act
    await listarSucursalesPaginadas(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        data: null,
        error: 'Ocurrió un error al obtener el listado paginado de sucursales.',
      })
    );
  });

  it('debe devolver una lista vacía si no hay resultados', async () => {
    // Arrange
    mockSucursalFindMany.mockResolvedValueOnce([]);
    mockSucursalCount.mockResolvedValueOnce(0);
    
    // Act
    await listarSucursalesPaginadas(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      data: {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
      },
      error: null,
    });
  });
});
