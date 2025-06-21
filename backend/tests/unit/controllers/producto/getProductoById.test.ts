import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { v4 as uuidv4 } from 'uuid';

// Mock the audit module first
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: jest.fn().mockResolvedValue(undefined),
  logError: jest.fn().mockResolvedValue(undefined)
}));

// Then import the controller after setting up mocks
import { obtenerProductoPorId } from '../../../../src/controllers/productoController';
import { PrismaClient } from '@prisma/client';

// Get the mock function references
const { logError } = jest.requireMock('../../../../src/utils/audit');

// Helper function to generate valid UUIDs
const generateValidUuid = () => '123e4567-e89b-12d3-a456-426614174000';

// Mock the Prisma client with proper types
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    producto: {
      findUnique: jest.fn(),
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

describe('obtenerProductoPorId', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const productId = generateValidUuid();
  const timestamp = new Date();

  const mockProducto = {
    id: productId,
    nombre: 'Producto de Prueba',
    descripcion: 'Descripción del producto de prueba',
    precio: 199.99,
    categoriaId: generateValidUuid(),
    marcaId: generateValidUuid(),
    colorId: generateValidUuid(),
    materialLente: 'Policarbonato',
    tratamientoLente: 'Antirreflejante',
    graduacionEsfera: 2.5,
    graduacionCilindro: -1.25,
    eje: 90,
    adicion: 1.5,
    tipoArmazon: 'Entero',
    materialArmazon: 'Acetato',
    tamanoPuente: 18,
    tamanoAros: 52,
    tamanoVarillas: 140,
    activo: true,
    erpId: 12345,
    erpTipo: 'lente',
    imagenUrl: 'https://example.com/image.jpg',
    modelo3dUrl: null,
    creadoEn: timestamp,
    creadoPor: 'test-user-id',
    modificadoEn: null,
    modificadoPor: null,
    anuladoEn: null,
    anuladoPor: null,
    _count: {
      inventario: 10
    },
    stock: 10,
    marca: {
      id: generateValidUuid(),
      nombre: 'Marca de Prueba'
    },
    color: {
      id: generateValidUuid(),
      nombre: 'Negro',
      codigo_hex: '#000000'
    },
    categoria: {
      id: generateValidUuid(),
      nombre: 'Lentes de Sol',
      descripcion: 'Categoría de lentes de sol'
    },
    inventarios: [
      { cantidad: 5, ubicacion: { nombre: 'Ubicación 1' } },
      { cantidad: 5, ubicacion: { nombre: 'Ubicación 2' } }
    ]
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debe devolver un producto existente correctamente', async () => {
    // Arrange - Mock the product with inventory data
    const mockProductoWithInventory = {
      ...mockProducto,
      inventarios: [
        { 
          id: 'inv1', 
          stock: 5, 
          stockMinimo: 2, 
          sucursal: { 
            id: 'suc1', 
            nombre: 'Sucursal 1' 
          } 
        },
        { 
          id: 'inv2', 
          stock: 5, 
          stockMinimo: 2, 
          sucursal: { 
            id: 'suc2', 
            nombre: 'Sucursal 2' 
          } 
        }
      ],
      _count: {
        inventarios: 2
      }
    };

    (prisma.producto.findUnique as jest.Mock).mockResolvedValue(mockProductoWithInventory);

    // Act
    await obtenerProductoPorId(req as Request<{ id: string }>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    
    // Check basic response structure
    const response = jsonMock.mock.calls[0][0];
    expect(response).toMatchObject({
      ok: true,
      data: expect.any(Object),
      error: null
    });
    
    // Check the product data contains the expected fields
    const { data: product } = response;
    expect(product).toMatchObject({
      id: productId,
      nombre: 'Producto de Prueba',
      descripcion: 'Descripción del producto de prueba',
      precio: 199.99,
      activo: true,
      color: expect.objectContaining({
        id: expect.any(String),
        nombre: 'Negro',
        codigo_hex: '#000000'
      }),
      marca: expect.objectContaining({
        id: expect.any(String),
        nombre: 'Marca de Prueba'
      }),
      _count: expect.objectContaining({
        inventarios: expect.any(Number)
      }),
      inventarios: expect.arrayContaining([
        expect.objectContaining({
          id: 'inv1',
          stock: 5,
          stockMinimo: 2,
          sucursal: expect.objectContaining({
            id: 'suc1',
            nombre: 'Sucursal 1'
          })
        }),
        expect.objectContaining({
          id: 'inv2',
          stock: 5,
          stockMinimo: 2,
          sucursal: expect.objectContaining({
            id: 'suc2',
            nombre: 'Sucursal 2'
          })
        })
      ])
    });
    
    // Verify the product was fetched with the correct include options
    expect(prisma.producto.findUnique).toHaveBeenCalledWith({
      where: { id: productId },
      include: expect.objectContaining({
        marca: expect.any(Object),
        color: expect.any(Object),
        categoria: expect.any(Object),
        inventarios: expect.any(Object),
        _count: expect.any(Object)
      })
    });
  });

  it('debe devolver error 404 si el producto no existe', async () => {
    // Arrange
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    await obtenerProductoPorId(req as Request<{ id: string }>, res as unknown as Response);

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
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    await obtenerProductoPorId(req as Request<{ id: string }>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      error: 'Producto no encontrado.',
      data: null,
      meta: undefined
    });
  });

  it('debe manejar errores inesperados correctamente', async () => {
    // Arrange
    const errorMessage = 'Error inesperado';
    (prisma.producto.findUnique as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act
    await obtenerProductoPorId(req as Request<{ id: string }>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      error: 'Ocurrió un error al obtener el producto.',
      data: null,
      meta: undefined
    });

    // Verify error was logged with expected structure
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user-id',
        action: 'error_obtener_producto',
        module: 'productoController',
        entityType: 'producto',
        entityId: productId,
        message: expect.stringContaining('Error al obtener producto'),
        error: expect.any(Error),
        context: expect.objectContaining({
          id: productId
        }),
        ip: expect.any(String)
      })
    );
  });

  it('debe incluir relaciones con marca, color y categoria cuando se solicitan', async () => {
    // Arrange
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue({
      ...mockProducto,
      include: {
        marca: true,
        color: true,
        categoria: true
      }
    });

    // Act
    await obtenerProductoPorId(req as Request<{ id: string }>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          id: productId,
          nombre: 'Producto de Prueba',
          marca: expect.objectContaining({
            nombre: 'Marca de Prueba'
          }),
          color: expect.objectContaining({
            nombre: 'Negro',
            codigo_hex: '#000000'
          }),
          categoria: expect.objectContaining({
            nombre: 'Lentes de Sol',
            descripcion: 'Categoría de lentes de sol'
          })
        })
      })
    );
  });
});
