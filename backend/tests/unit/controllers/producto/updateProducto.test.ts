import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { v4 as uuidv4 } from 'uuid';

// Mock the audit module first
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: jest.fn().mockResolvedValue(undefined),
  logError: jest.fn().mockResolvedValue(undefined)
}));

// Then import the controller after setting up mocks
import { actualizarProducto } from '../../../../src/controllers/productoController';
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
      findFirst: jest.fn(),
    },
    inventario: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    categoria: {
      findUnique: jest.fn().mockResolvedValue({ id: 'valid-id', nombre: 'Categoría', anuladoEn: null }),
    },
    marca: {
      findUnique: jest.fn().mockResolvedValue({ id: 'valid-id', nombre: 'Marca' }),
    },
    color: {
      findUnique: jest.fn().mockResolvedValue({ id: 'valid-id', nombre: 'Color', codigo_hex: '#000000' }),
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

describe('actualizarProducto', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const productId = generateValidUuid();
  const timestamp = new Date();

  const mockExistingProduct = {
    id: productId,
    nombre: 'Producto Original',
    descripcion: 'Descripción original',
    precio: 99.99,
    categoriaId: generateValidUuid(),
    marcaId: generateValidUuid(),
    colorId: generateValidUuid(),
    materialLente: 'Original',
    tratamientoLente: 'Original',
    graduacionEsfera: 1.0,
    graduacionCilindro: -0.5,
    eje: 90,
    adicion: 1.0,
    tipoArmazon: 'Original',
    materialArmazon: 'Original',
    tamanoPuente: 17,
    tamanoAros: 50,
    tamanoVarillas: 135,
    activo: true,
    erpId: 54321,
    erpTipo: 'lente',
    imagenUrl: 'https://example.com/original.jpg',
    modelo3dUrl: null,
    creadoEn: timestamp,
    creadoPor: 'original-user-id',
    modificadoEn: null,
    modificadoPor: null,
    anuladoEn: null,
    anuladoPor: null,
    _count: {
      inventario: 5
    },
    stock: 5,
    marca: {
      id: generateValidUuid(),
      nombre: 'Marca Original'
    },
    color: {
      id: generateValidUuid(),
      nombre: 'Azul',
      codigo_hex: '#0000FF'
    },
    inventarios: [
      { cantidad: 3, ubicacion: { nombre: 'Ubicación 1' } },
      { cantidad: 2, ubicacion: { nombre: 'Ubicación 2' } }
    ]
  };

  const mockUpdatedProduct = {
    ...mockExistingProduct,
    nombre: 'Producto Actualizado',
    descripcion: 'Descripción actualizada',
    precio: 149.99,
    materialLente: 'Policarbonato',
    modificadoEn: timestamp,
    modificadoPor: 'test-user-id'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    resetMocks();
    
    // Setup default request with user authentication and params
    req = createMockRequest({
      user: { 
        id: 'test-user-id', 
        nombreCompleto: 'Usuario de Prueba',
        email: 'test@example.com' 
      },
      params: { id: productId },
      body: {
        nombre: 'Nuevo Nombre',
        descripcion: 'Nueva descripción',
        precio: 100,
        marcaId: 'marca-123',
        colorId: 'color-123'
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
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue(mockExistingProduct);
    (prisma.producto.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.producto.update as jest.Mock).mockResolvedValue(mockUpdatedProduct);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debe actualizar un producto existente correctamente', async () => {
    // Act
    await actualizarProducto(req as Request<{ id: string }, {}, any>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    
    // Get the actual response
    const response = jsonMock.mock.calls[0][0];
    
    // Check basic response structure
    expect(response).toMatchObject({
      ok: true,
      data: expect.objectContaining({
        id: productId,
        nombre: 'Producto Actualizado',
        descripcion: 'Descripción actualizada',
        precio: 149.99,
        modificadoPor: 'test-user-id',
        materialLente: 'Policarbonato'
      })
    });
    
    // Check that the response includes required fields
    expect(response.data).toHaveProperty('marca');
    expect(response.data).toHaveProperty('color');
    expect(response.data).toHaveProperty('inventarios');
    expect(response.data).toHaveProperty('_count');

    // Verify audit log was called
    expect(logSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user-id',
        action: 'actualizar_producto_exitoso',
        entityType: 'producto',
        entityId: productId,
        module: 'productoController',
        message: `Producto actualizado: Producto Actualizado`,
        ip: expect.any(String),
        details: {
          id: productId,
          nombre: 'Producto Actualizado',
          realizadoPor: 'test-user-id',
          cambios: expect.arrayContaining([
            'nombre', 'precio', 'descripcion', 'imagenUrl', 'modelo3dUrl', 'marcaId', 'colorId'
          ])
        }
      })
    );
  });

  it('debe devolver error 404 si el producto no existe', async () => {
    // Arrange
    (prisma.producto.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    await actualizarProducto(req as Request<{ id: string }, {}, any>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Producto no encontrado.'
      })
    );
  });

  it('debe validar que el precio sea un número positivo', async () => {
    // Arrange
    req.body.precio = -100;

    // Act
    await actualizarProducto(req as Request<{ id: string }, {}, any>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El campo precio debe ser mayor o igual a 0'
      })
    );
  });

  it('debe validar el formato de la URL de la imagen', async () => {
    // Arrange
    req.body.imagenUrl = 'no-es-una-url-valida';

    // Act
    await actualizarProducto(req as Request<{ id: string }, {}, any>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'La URL de la imagen no tiene un formato válido. Debe comenzar con http:// o https://'
      })
    );
  });

  it('debe manejar errores inesperados correctamente', async () => {
    // Arrange
    const errorMessage = 'Error inesperado';
    (prisma.producto.findUnique as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act
    await actualizarProducto(req as Request<{ id: string }, {}, any>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ocurrió un error al actualizar el producto.'
      })
    );

    // Verify error was logged
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user-id',
        action: 'error_actualizar_producto',
        entityType: 'producto',
        module: 'actualizarProducto',
        message: 'Error al actualizar producto',
        error: expect.any(Error),
        context: expect.objectContaining({
          error: expect.any(Error)
        }),
        ip: expect.any(String)
      })
    );
  });

  it('debe permitir actualizar solo campos específicos', async () => {
    // Arrange
    const updateData = {
      nombre: 'Producto Actualizado',
      descripcion: 'Solo actualizar descripción',
      precio: 199.99,
      marcaId: '123e4567-e89b-12d3-a456-426614174000',
      colorId: '123e4567-e89b-12d3-a456-426614174000',
      categoriaId: '123e4567-e89b-12d3-a456-426614174000',
      adicion: 1,
      eje: 90,
      graduacionCilindro: -0.5,
      graduacionEsfera: 1,
      tamanoAros: 50,
      tamanoPuente: 17,
      tamanoVarillas: 135,
      tipoArmazon: 'Original',
      materialArmazon: 'Original',
      materialLente: 'Policarbonato',
      tratamientoLente: 'Original',
      imagenUrl: 'https://example.com/original.jpg',
      modelo3dUrl: null
    };
    
    req.body = updateData;

    const partiallyUpdatedProduct = {
      ...mockExistingProduct,
      descripcion: 'Solo actualizar descripción',
      precio: 199.99,
      modificadoEn: timestamp,
      modificadoPor: 'test-user-id'
    };

    (prisma.producto.update as jest.Mock).mockResolvedValue(partiallyUpdatedProduct);

    // Act
    await actualizarProducto(req as Request<{ id: string }, {}, any>, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          id: productId,
          nombre: 'Producto Original', // No debería cambiar
          descripcion: 'Solo actualizar descripción',
          precio: 199.99,
          materialLente: 'Original' // No debería cambiar
        })
      })
    );
  });
});
