// 1. Import jest first
import { jest } from '@jest/globals';

// 2. Create mock functions
const mockRegistrarAuditoria = jest.fn().mockImplementation(() => Promise.resolve());

// 3. Set up mocks before importing anything that uses them
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria
}));

// 4. Import prismaMock using require to avoid hoisting issues
const { prismaMock } = require('../../__mocks__/prisma');

// 5. Mock Prisma client with a function that returns our mock
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    ...prismaMock
  }))
}));

// 6. Now import the rest of the dependencies
import { Request, Response } from 'express';
import { crearProducto } from '../../../../src/controllers/productoController';
import { productoFixtures, mockUserId } from '../../__fixtures__/productoFixtures';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// 7. Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  resetMocks();
  if (typeof prismaMock.$resetMocks === 'function') {
    prismaMock.$resetMocks();
  }
});

describe('Producto Controller - crearProducto', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      body: { ...productoFixtures.productoValido },
      user: { 
        id: mockUserId,
        nombreCompleto: 'Test User',
        email: 'test@example.com',
        roles: ['admin']
      },
      ip: '127.0.0.1'
    } as any;
    mockResponse = createMockResponse();
    resetMocks();
    if (typeof prismaMock.$resetMocks === 'function') {
      prismaMock.$resetMocks();
    }
    jest.clearAllMocks();
  });

  it('debería crear un producto exitosamente', async () => {
    // Configurar que no existe un producto con el mismo nombre
    prismaMock.producto.findFirst.mockResolvedValue(null);
    const productoCreado = { 
      ...productoFixtures.productoExistente,
      _count: { inventario: 0 },
      stock: 0
    };
    prismaMock.producto.create.mockResolvedValue(productoCreado);

    // Llamar al controlador
    await crearProducto(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar que se verificó si el producto ya existe
    expect(prismaMock.producto.findFirst).toHaveBeenCalledWith({
      where: { nombre: productoFixtures.productoValido.nombre },
    });

    // Verificar que se llamó a Prisma con los datos correctos
    expect(prismaMock.producto.create).toHaveBeenCalledWith({
      data: {
        ...productoFixtures.productoValido,
        activo: true,
        imagenUrl: null,
        modelo3dUrl: null
      }
    });

    // Verificar respuesta exitosa
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          nombre: productoFixtures.productoValido.nombre,
          descripcion: productoFixtures.productoValido.descripcion,
          precio: productoFixtures.productoValido.precio,
          categoria: productoFixtures.productoValido.categoria,
          activo: true,
          imagenUrl: null,
          modelo3dUrl: null
        })
      })
    );

    // Verificar que se registró la auditoría correctamente
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith(expect.objectContaining({
      accion: 'crearProducto',
      entidadTipo: 'producto',
      entidadId: productoFixtures.productoExistente.id,
      descripcion: expect.stringContaining('Producto creado:'),
      ip: '127.0.0.1',
      modulo: 'productos',
      usuarioId: mockUserId
    }));
  });

  it('debería devolver 409 si el producto ya existe', async () => {
    // Configurar el mock para simular que el producto ya existe
    prismaMock.producto.findFirst.mockResolvedValue(productoFixtures.productoExistente);

    // Llamar al controlador
    await crearProducto(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar que se verificó si el producto ya existe
    expect(prismaMock.producto.findFirst).toHaveBeenCalledWith({
      where: { nombre: productoFixtures.productoValido.nombre },
    });

    // Verificar que no se intentó crear el producto
    expect(prismaMock.producto.create).not.toHaveBeenCalled();

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ya existe un producto con ese nombre.'
      })
    );
    
    // Verificar que no se registró auditoría para este caso de error
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });

  it('debería devolver error 400 si faltan campos requeridos', async () => {
    // Configurar un producto sin campos requeridos
    mockRequest.body = {};

    // Llamar al controlador
    await crearProducto(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar que no se intentó buscar ni crear el producto
    expect(prismaMock.producto.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.producto.create).not.toHaveBeenCalled();

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('El nombre es obligatorio y debe tener al menos 2 caracteres')
      })
    );
    
    // Verificar que no se registró auditoría para este caso de error
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si el precio es inválido', async () => {
    // Configurar un producto con precio inválido
    mockRequest.body = {
      ...mockRequest.body,
      precio: -10
    };

    // Llamar al controlador
    await crearProducto(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar que no se intentó buscar ni crear el producto
    expect(prismaMock.producto.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.producto.create).not.toHaveBeenCalled();

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.stringContaining('El precio debe ser un número mayor a 0')
      })
    );
    
    // Verificar que no se registró auditoría para este caso de error
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });

  it('debería manejar errores de Prisma', async () => {
    // Configurar que no existe un producto con el mismo nombre
    prismaMock.producto.findFirst.mockResolvedValue(null);
    
    const dbError = new PrismaClientKnownRequestError('Error de base de datos', {
      clientVersion: '4.0.0',
      code: 'P2002',
      meta: { target: ['nombre'] }
    } as any);
    
    // Configurar el mock para que falle con el error de Prisma
    prismaMock.producto.create.mockRejectedValue(dbError);

    // Llamar al controlador
    await crearProducto(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar que se intentó buscar y crear el producto
    expect(prismaMock.producto.findFirst).toHaveBeenCalled();
    expect(prismaMock.producto.create).toHaveBeenCalled();
    
    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ya existe un producto con ese nombre o identificador.'
      })
    );
    
    // Verificar que no se llamó a registrarAuditoria para este tipo de error
    // ya que el controlador maneja este error específico sin auditoría
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ya existe un producto con ese nombre o identificador.'
      })
    );
  });
  
  it('debería manejar errores de referencia inválida', async () => {
    // Configurar que no existe un producto con el mismo nombre
    prismaMock.producto.findFirst.mockResolvedValue(null);
    
    const dbError = new PrismaClientKnownRequestError('Foreign key constraint failed', {
      clientVersion: '4.0.0',
      code: 'P2003',
      meta: { field_name: 'marcaId' }
    });
    
    prismaMock.producto.create.mockRejectedValue(dbError);

    // Llamar al controlador
    await crearProducto(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Referencia inválida (marca_id o color_id no existen).'
      })
    );
  });
  
  it('debería manejar errores inesperados', async () => {
    // Configurar que no existe un producto con el mismo nombre
    prismaMock.producto.findFirst.mockResolvedValue(null);
    
    const errorInesperado = new Error('Error inesperado');
    prismaMock.producto.create.mockRejectedValue(errorInesperado);

    // Llamar al controlador
    await crearProducto(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ocurrió un error al crear el producto. Por favor, intente nuevamente.'
      })
    );
    
    // Verificar que se llamó a registrarAuditoria exactamente una vez
    expect(mockRegistrarAuditoria).toHaveBeenCalledTimes(1);
  });
});