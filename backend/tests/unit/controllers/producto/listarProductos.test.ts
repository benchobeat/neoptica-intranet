import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { v4 as uuidv4 } from 'uuid';

// Mock the audit module first
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: jest.fn().mockResolvedValue(undefined),
  logError: jest.fn().mockResolvedValue(undefined)
}));

// Then import the controller after setting up mocks
import { listarProductos } from '../../../../src/controllers/productoController';
import { PrismaClient } from '@prisma/client';

// Get the mock function references
const { logError } = jest.requireMock('../../../../src/utils/audit');

// Helper function to generate valid UUIDs
const generateValidUuid = () => '123e4567-e89b-12d3-a456-426614174000';

// Mock the Prisma client with proper types
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    producto: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    inventario: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    logAuditoria: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    ...mockPrisma,
  };
});

// Create Prisma client instance after mocking
const prisma = new PrismaClient();

describe('listarProductos', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockProducto1 = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nombre: 'Producto 1',
    descripcion: 'Descripción del producto 1',
    precio: 199.99,
    activo: true,
    marca: { nombre: 'Marca 1' },
    color: { nombre: 'Rojo', codigo_hex: '#FF0000' },
    _count: {
      inventarios: 10
    },
    inventarios: [
      { id: 'inv1', stock: 5, stockMinimo: 2, sucursalId: 'suc1', sucursal: { id: 'suc1', nombre: 'Sucursal 1' } },
      { id: 'inv2', stock: 5, stockMinimo: 2, sucursalId: 'suc2', sucursal: { id: 'suc2', nombre: 'Sucursal 2' } }
    ]
  };

  const mockProducto2 = {
    id: generateValidUuid(),
    nombre: 'Producto 2',
    descripcion: 'Descripción del producto 2',
    precio: 299.99,
    activo: true,
    marca: { nombre: 'Marca 2' },
    color: { nombre: 'Azul', codigo_hex: '#0000FF' },
    _count: {
      inventarios: 5
    },
    inventarios: [
      { id: 'inv3', stock: 3, stockMinimo: 2, sucursalId: 'suc1', sucursal: { id: 'suc1', nombre: 'Sucursal 1' } },
      { id: 'inv4', stock: 2, stockMinimo: 2, sucursalId: 'suc3', sucursal: { id: 'suc3', nombre: 'Sucursal 3' } }
    ]
  };

  const mockProductos = [mockProducto1, mockProducto2];

  const mockPagination = {
    total: 2,
    totalPages: 1,
    currentPage: 1,
    perPage: 20,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    resetMocks();
    
    // Setup default request with query params
    req = createMockRequest({
      query: {},
      user: { 
        id: 'test-user-id', 
        nombreCompleto: 'Usuario de Prueba',
        email: 'test@example.com' 
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

    // Default mock implementations
    (prisma.producto.findMany as jest.Mock).mockResolvedValue(mockProductos);
    (prisma.producto.count as jest.Mock).mockResolvedValue(2);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debe listar productos con paginación por defecto', async () => {
    // Act
    await listarProductos(req as Request, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    
    // Get the response data
    const response = jsonMock.mock.calls[0][0];
    
    // Check basic response structure
    expect(response).toMatchObject({
      ok: true,
      data: expect.any(Array),
      meta: expect.objectContaining({
        page: 1,
        limit: 20,
        total: 2,
        pages: 1,
      }),
    });
    
    // Check the products array
    expect(response.data).toHaveLength(2);
    expect(response.data[0]).toMatchObject({
      nombre: 'Producto 1',
      precio: 199.99,
      _count: expect.objectContaining({
        inventarios: expect.any(Number)
      })
    });
    expect(response.data[1]).toMatchObject({
      nombre: 'Producto 2',
      precio: 299.99,
      _count: expect.objectContaining({
        inventarios: expect.any(Number)
      })
    });

    // Verify default pagination values
    expect(prisma.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: {
          nombre: 'asc'
        },
        where: {},
        include: {
          marca: {
            select: {
              id: true,
              nombre: true
            }
          },
          color: {
            select: {
              id: true,
              nombre: true,
              codigoHex: true
            }
          },
          inventarios: {
            select: {
              id: true,
              stock: true,
              stockMinimo: true,
              sucursalId: true,
              sucursal: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            },
            where: {
              stock: {
                gt: 0
              }
            }
          },
          _count: {
            select: {
              inventarios: true
            }
          }
        }
      })
    );
  });

  it('debe aplicar paginación personalizada', async () => {
    // Arrange
    req.query = { page: '2', limit: '5' };

    // Act
    await listarProductos(req as Request, res as unknown as Response);

    // Assert
    expect(prisma.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5, // (page - 1) * limit = (2 - 1) * 5 = 5
        take: 5,
      })
    );
  });

  it('debe filtrar por búsqueda de texto', async () => {
    // Arrange
    req.query = { q: 'lentes' };

    // Act
    await listarProductos(req as Request, res as unknown as Response);

    // Assert
    expect(prisma.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { nombre: { contains: 'lentes', mode: 'insensitive' } },
            { descripcion: { contains: 'lentes', mode: 'insensitive' } },
            { categoria: { some: { nombre: { contains: 'lentes', mode: 'insensitive' } } } },
          ],
        }),
      })
    );
  });

  it('debe filtrar por categoría', async () => {
    // Arrange
    const categoriaId = generateValidUuid();
    req.query = { categoria: categoriaId };

    // Act
    await listarProductos(req as Request, res as unknown as Response);

    // Assert
    expect(prisma.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoriaId: categoriaId,
        })
      })
    );
  });

  it('debe filtrar por marca', async () => {
    // Arrange
    const marcaId = generateValidUuid();
    req.query = { marcaId };

    // Act
    await listarProductos(req as Request, res as unknown as Response);

    // Assert
    expect(prisma.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          marcaId: marcaId,
        })
      })
    );
  });

  it('debe filtrar por color', async () => {
    // Arrange
    const colorId = generateValidUuid();
    req.query = { colorId };

    // Act
    await listarProductos(req as Request, res as unknown as Response);

    // Assert
    expect(prisma.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          colorId: colorId,
        })
      })
    );
  });

  it('debe filtrar por estado activo/inactivo', async () => {
    // Arrange
    req.query = { soloActivos: 'false' };

    // Act
    await listarProductos(req as Request, res as unknown as Response);

    // Assert
    expect(prisma.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          activo: false, // Debe filtrar por activo: false cuando soloActivos es false
        }),
      })
    );
  });

  it('debe ordenar por campo y dirección especificados', async () => {
    // Arrange
    req.query = { ordenarPor: 'precio', orden: 'asc' };

    // Act
    await listarProductos(req as Request, res as unknown as Response);

    // Assert
    expect(prisma.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { precio: 'asc' },
      })
    );
  });

  it('debe manejar errores inesperados correctamente', async () => {
    // Arrange
    const errorMessage = 'Error inesperado';
    (prisma.producto.findMany as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act
    await listarProductos(req as Request, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    
    // Get the response data
    const response = jsonMock.mock.calls[0][0];
    
    // Check the error response structure
    expect(response).toMatchObject({
      ok: false,
      data: [],
      error: 'Ocurrió un error al listar los productos. Por favor, intente nuevamente.',
      meta: expect.objectContaining({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      }),
    });

    // Verify error was logged
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user-id',
        entityType: 'producto',
        module: 'productoController',
        action: 'error_listar_productos',
        message: 'Error al listar productos',
        error: expect.any(Error),
        context: expect.objectContaining({
          filtros: expect.any(Object)
        }),
        ip: expect.any(String)
      })
    );
  });
});
