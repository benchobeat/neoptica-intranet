import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { v4 as uuidv4 } from 'uuid';

// Mock the audit module first
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: jest.fn().mockResolvedValue(undefined),
  logError: jest.fn().mockResolvedValue(undefined)
}));

// Then import the controller after setting up mocks
import { eliminarProducto } from '../../../../src/controllers/productoController';
import { PrismaClient } from '@prisma/client';

// Get the mock function references
const { logSuccess, logError } = jest.requireMock('../../../../src/utils/audit');

// Helper function to generate valid UUIDs
const generateValidUuid = () => '123e4567-e89b-12d3-a456-426614174000';

// Mock the Prisma client with proper types
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    producto: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    inventario: {
      findMany: jest.fn().mockResolvedValue([]),
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

describe('eliminarProducto', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const productId = generateValidUuid();
  const timestamp = new Date();

  const mockProducto = {
    id: productId,
    nombre: 'Producto a Eliminar',
    descripcion: 'Este producto será eliminado',
    precio: 99.99,
    activo: true,
    creadoEn: timestamp,
    creadoPor: 'test-user-id',
    modificadoEn: null,
    modificadoPor: null,
    anuladoEn: null,
    anuladoPor: null,
    _count: {
      inventario: 0
    },
    stock: 0,
    marca: {
      id: generateValidUuid(),
      nombre: 'Marca de Prueba'
    },
    color: {
      id: generateValidUuid(),
      nombre: 'Rojo',
      codigo_hex: '#FF0000'
    }
  };

  const mockDeletedProducto = {
    ...mockProducto,
    activo: false,
    anuladoEn: timestamp,
    anuladoPor: 'test-user-id'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    resetMocks();
    
    // Setup default request with params
    req = createMockRequest({
      params: { id: productId },
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
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue(mockProducto);
    (prisma.producto.update as jest.Mock).mockResolvedValue(mockDeletedProducto);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debe desactivar un producto existente correctamente', async () => {
    // Act
    await eliminarProducto(req as Request<{id: string}>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          id: productId,
          activo: false,
          anuladoPor: 'test-user-id',
          anuladoEn: expect.any(Date)
        })
      })
    );

    // Verify update was called with correct parameters
    expect(prisma.producto.update).toHaveBeenCalledWith({
      where: { id: productId },
      data: {
        activo: false,
        anuladoEn: expect.any(Date),
        anuladoPor: 'test-user-id',
      },
      include: {
        _count: {
          select: {
            inventarios: true,
          },
        },
        color: {
          select: {
            id: true,
            nombre: true,
            codigoHex: true,
          },
        },
        marca: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // Verify audit log was called
    expect(logSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user-id',
        action: 'eliminar_producto_exitoso',
        entityType: 'producto',
        entityId: productId,
        message: 'Producto desactivado: Producto a Eliminar',
        details: expect.objectContaining({
          id: productId,
          nombre: 'Producto a Eliminar',
          activo: true,
          eliminadoPor: 'test-user-id'
        }),
        ip: expect.any(String),
        module: 'productoController'
      })
    );
  });

  it('debe devolver error 404 si el producto no existe', async () => {
    // Arrange
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    await eliminarProducto(req as Request<{id: string}>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Producto no encontrado.'
      })
    );
  });

  it('debe devolver error 404 si el ID no es un UUID válido', async () => {
    // Arrange
    req.params = { id: 'invalid-uuid' };
    // Mock findUnique to return null to simulate not found
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    await eliminarProducto(req as Request<{id: string}>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      data: null,
      error: 'Producto no encontrado.',
      meta: undefined,
      ok: false
    });
  });

  it('debe devolver error 400 si el producto ya está inactivo', async () => {
    // Arrange
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue({
      ...mockProducto,
      activo: false,
      anuladoEn: timestamp,
      anuladoPor: 'another-user-id'
    });

    // Act
    await eliminarProducto(req as Request<{id: string}>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El producto ya está desactivado.'
      })
    );
  });

  it('debe manejar errores inesperados correctamente', async () => {
    // Arrange
    const errorMessage = 'Error inesperado';
    (prisma.producto.findUnique as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act
    await eliminarProducto(req as Request<{id: string}>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ocurrió un error al eliminar el producto.'
      })
    );

    // Verify error was logged
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user-id',
        action: 'error_eliminar_producto',
        entityType: 'producto',
        entityId: productId,
        message: 'Error al eliminar producto',
        error: expect.any(Error),
        module: 'eliminarProducto',
        ip: expect.any(String),
        context: expect.objectContaining({
          id: productId
        })
      })
    );
  });

  it('debe permitir la eliminación cuando no hay inventario', async () => {
    // Arrange
    const mockProductoWithoutInventory = {
      ...mockProducto,
      _count: { inventarios: 0 }, // No inventory
      stock: 0
    };
    
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue(mockProductoWithoutInventory);

    const updatedProduct = {
      ...mockProductoWithoutInventory,
      activo: false,
      anuladoPor: 'test-user-id',
      anuladoEn: new Date(),
      color: { id: mockProducto.color.id, nombre: 'Rojo', codigoHex: '#FF0000' },
      marca: { id: mockProducto.marca.id, nombre: 'Marca de Prueba' },
      _count: { inventarios: 0 }
    };

    (prisma.producto.update as jest.Mock).mockResolvedValue(updatedProduct);

    // Act
    await eliminarProducto(req as Request<{id: string}>, res as unknown as Response);

    // Assert
    expect(prisma.producto.update).toHaveBeenCalledWith({
      where: { id: mockProducto.id },
      data: {
        activo: false,
        anuladoPor: 'test-user-id',
        anuladoEn: expect.any(Date)
      },
      include: {
        color: { select: { id: true, nombre: true, codigoHex: true } },
        marca: { select: { id: true, nombre: true } },
        _count: { select: { inventarios: true } }
      }
    });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      data: expect.objectContaining({
        activo: false,
        anuladoPor: 'test-user-id',
        _count: { inventarios: 0 },
        id: mockProducto.id,
        nombre: mockProducto.nombre,
        color: expect.any(Object),
        marca: expect.any(Object)
      }),
      error: null,
      meta: undefined
    });
  });

  it('debe permitir la eliminación forzada con el parámetro force=true', async () => {
    // Arrange
    req.query = { force: 'true' };
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue({
      ...mockProducto,
      _count: { inventario: 5 },
      stock: 5
    });

    // Act
    await eliminarProducto(req as Request<{id: string}>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(prisma.producto.update).toHaveBeenCalled();
  });
});
