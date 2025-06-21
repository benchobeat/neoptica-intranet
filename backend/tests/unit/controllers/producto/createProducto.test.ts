import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { v4 as uuidv4 } from 'uuid';

// Mock the audit module first
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: jest.fn().mockResolvedValue(undefined),
  logError: jest.fn().mockResolvedValue(undefined)
}));

// Then import the controller after setting up mocks
import { crearProducto } from '../../../../src/controllers/productoController';
import { PrismaClient } from '@prisma/client';

// Get the mock function references
const { logSuccess, logError } = jest.requireMock('../../../../src/utils/audit');

// Helper function to generate valid UUIDs
const generateValidUuid = () => '123e4567-e89b-12d3-a456-426614174000';

// Mock the uuid module
jest.mock('uuid', () => ({
  v4: () => generateValidUuid(),
}));

// Mock the Prisma client with proper types
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    producto: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    categoria: {
      findUnique: jest.fn(),
    },
    marca: {
      findUnique: jest.fn(),
    },
    color: {
      findUnique: jest.fn(),
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

describe('crearProducto', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockProducto = {
    id: generateValidUuid(),
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
    creadoEn: new Date(),
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
    }
  };

  beforeEach(() => {
    // Reset all mocks before each test
    resetMocks();
    
    // Setup default request with user authentication
    req = createMockRequest({
      user: { 
        id: 'test-user-id', 
        nombreCompleto: 'Usuario de Prueba',
        email: 'test@example.com' 
      },
      body: {
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
        imagenUrl: 'https://example.com/image.jpg',
        modelo3dUrl: null
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

  it('debe crear un producto válido correctamente', async () => {
    // Arrange
    (prisma.producto.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.categoria.findUnique as jest.Mock).mockResolvedValue({
      id: req.body.categoriaId,
      nombre: 'Categoría Test',
      anuladoEn: null
    });
    (prisma.marca.findUnique as jest.Mock).mockResolvedValue({
      id: req.body.marcaId,
      nombre: 'Marca Test'
    });
    (prisma.color.findUnique as jest.Mock).mockResolvedValue({
      id: req.body.colorId,
      nombre: 'Color Test',
      codigo_hex: '#FFFFFF'
    });
    (prisma.producto.create as jest.Mock).mockResolvedValue(mockProducto);

    // Act
    await crearProducto(req as Request, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          nombre: 'Producto de Prueba',
          precio: 199.99,
          activo: true
        })
      })
    );

    // Verify audit log was called with correct structure
    expect(logSuccess).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: expect.any(String),
      entityType: 'producto',
      entityId: mockProducto.id,
      module: 'crearProducto',
      action: 'crear_producto_exitoso',
      message: `Producto creado: ${mockProducto.nombre}`,
      details: {
        nombre: mockProducto.nombre,
        precio: mockProducto.precio,
        marcaId: mockProducto.marcaId,
        colorId: mockProducto.colorId,
        activo: mockProducto.activo
      }
    });
  });

  it('debe validar que el nombre es requerido y tiene al menos 2 caracteres', async () => {
    // Arrange - Test missing name
    delete req.body.nombre;

    // Act
    await crearProducto(req as Request, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El nombre es obligatorio y debe tener al menos 2 caracteres'
      })
    );

    // Test name too short
    req.body.nombre = 'a';
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El nombre es obligatorio y debe tener al menos 2 caracteres'
      })
    );
  });

  it('debe validar que el precio es requerido y válido', async () => {
    // Setup mocks for related entities
    (prisma.producto.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.categoria.findUnique as jest.Mock).mockResolvedValue({ id: 'cat-id' });
    (prisma.marca.findUnique as jest.Mock).mockResolvedValue({ id: 'marca-id' });
    (prisma.color.findUnique as jest.Mock).mockResolvedValue({ id: 'color-id' });

    // Test missing price
    req.body.precio = null;
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El precio es obligatorio'
      })
    );

    // Test invalid price format
    req.body.precio = 'no-es-un-numero';
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El campo precio debe ser un número válido'
      })
    );
  });

  it('debe validar que el precio sea mayor a 0', async () => {
    // Setup mocks for related entities
    (prisma.producto.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.categoria.findUnique as jest.Mock).mockResolvedValue({ id: 'cat-id' });
    (prisma.marca.findUnique as jest.Mock).mockResolvedValue({ id: 'marca-id' });
    (prisma.color.findUnique as jest.Mock).mockResolvedValue({ id: 'color-id' });
    
    // Test zero price
    req.body.precio = 0;
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El precio debe ser un número mayor a 0'
      })
    );

    // Test negative price
    req.body.precio = -100;
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El precio debe ser un número mayor a 0'
      })
    );
  });

  it('debe validar el formato de la URL de la imagen', async () => {
    // Test invalid URL format
    req.body.imagenUrl = 'no-es-una-url-valida';
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'La URL de la imagen no tiene un formato válido. Debe comenzar con http:// o https://'
      })
    );

    // Test invalid image extension
    req.body.imagenUrl = 'https://example.com/document.pdf';
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('La URL de la imagen debe terminar con una de las siguientes extensiones:')
      })
    );
  });

  it('debe validar el formato de la URL del modelo 3D si se proporciona', async () => {
    // Test invalid 3D model URL format
    req.body.modelo3dUrl = 'no-es-una-url-valida';
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'La URL del modelo 3D no tiene un formato válido. Debe comenzar con http:// o https://'
      })
    );

    // Test invalid 3D model extension
    req.body.modelo3dUrl = 'https://example.com/model.abc';
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('La URL del modelo 3D debe terminar con una de las siguientes extensiones:')
      })
    );
  });

  it('debe manejar errores inesperados correctamente', async () => {
    // Arrange
    const errorMessage = 'Error inesperado';
    (prisma.producto.findFirst as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act
    await crearProducto(req as Request, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ocurrió un error al crear el producto. Por favor, intente nuevamente.'
      })
    );

    // Verify error was logged with correct structure
    expect(logError).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: expect.any(String),
      entityType: 'producto',
      module: 'crearProducto',
      action: 'error_crear_producto',
      message: 'Error al crear producto',
      error: expect.any(Error),
      context: expect.objectContaining({
        datosSolicitud: expect.any(Object)
      })
    });
  });

  it('debe validar que no se puede crear un producto con nombre duplicado', async () => {
    // Arrange
    const existingProduct = { ...mockProducto, id: 'existing-id' };
    (prisma.producto.findFirst as jest.Mock).mockResolvedValue(existingProduct);

    // Act
    await crearProducto(req as Request, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ya existe un producto con ese nombre.'
      })
    );
  });

  it('debe validar campos numéricos específicos', async () => {
    // Setup mocks for related entities
    (prisma.producto.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.categoria.findUnique as jest.Mock).mockResolvedValue({ id: 'cat-id' });
    (prisma.marca.findUnique as jest.Mock).mockResolvedValue({ id: 'marca-id' });
    (prisma.color.findUnique as jest.Mock).mockResolvedValue({ id: 'color-id' });

    // Test invalid graduación esfera
    req.body.graduacionEsfera = -25; // Fuera de rango
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El campo graduación esfera debe ser mayor o igual a -20'
      })
    );

    // Reset mock before next test
    jsonMock.mockClear();
    statusMock.mockClear();
    
    // Test invalid eje
    req.body.graduacionEsfera = -15; // Valid value to avoid failing on the sphere validation
    req.body.eje = 200; // Fuera de rango
    await crearProducto(req as Request, res as unknown as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El campo eje debe ser menor o igual a 180'
      })
    );
  });

  it('debe validar la existencia de relaciones (categoría, marca, color)', async () => {
    // Mock para simular que no existe la categoría
    (prisma.producto.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.categoria.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.marca.findUnique as jest.Mock).mockResolvedValue({ id: 'marca-id' });
    (prisma.color.findUnique as jest.Mock).mockResolvedValue({ id: 'color-id' });
    
    // Act
    await crearProducto(req as Request, res as unknown as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('La categoría')
      })
    );
  });
});
