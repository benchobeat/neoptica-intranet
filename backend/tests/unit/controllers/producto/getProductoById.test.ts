// 1. Import jest first
import { jest } from '@jest/globals';

// 2. Import prismaMock using require to avoid hoisting issues
const { prismaMock } = require('../../__mocks__/prisma');

// 3. Mock Prisma client with a function that returns our mock
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    ...prismaMock
  }))
}));

// 4. Now import the rest of the dependencies
import { Request, Response } from 'express';
import { obtenerProductoPorId } from '../../../../src/controllers/productoController';
import { productoFixtures } from '../../__fixtures__/productoFixtures';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';

// 5. Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  resetMocks();
  if (typeof prismaMock.$resetMocks === 'function') {
    prismaMock.$resetMocks();
  }
});

describe('Producto Controller - obtenerProductoPorId', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = createMockRequest({
      params: { id: productoFixtures.productoExistente.id },
      user: { 
        id: 'usuario-test-id', 
        nombreCompleto: 'Test User', 
        email: 'test@example.com',
        roles: ['admin']
      }
    });
    
    mockResponse = createMockResponse();
    
    // Resetear todos los mocks antes de cada prueba
    resetMocks();
  });

  it('debería devolver un producto si se encuentra', async () => {
    prismaMock.producto.findUnique.mockResolvedValue(productoFixtures.productoExistente);

    await obtenerProductoPorId(mockRequest as any, mockResponse as Response);

    expect(prismaMock.producto.findUnique).toHaveBeenCalledWith({
      where: { id: productoFixtures.productoExistente.id },
      include: {
        marca: {
          select: { id: true, nombre: true },
        },
        color: {
          select: { id: true, nombre: true, codigoHex: true },
        },
        _count: {
          select: { inventarios: true },
        },
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: expect.objectContaining({ 
        id: productoFixtures.productoExistente.id,
        stock: expect.any(Number)
      }),
      error: null
    });
  });

  it('debería devolver 404 si el producto no se encuentra', async () => {
    prismaMock.producto.findUnique.mockResolvedValue(null);

    await obtenerProductoPorId(mockRequest as any, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Producto no encontrado.'
    });
  });

  it('debería devolver 400 si el ID no es válido', async () => {
    // Usar un ID más corto que 10 caracteres para forzar el error de validación
    mockRequest.params = { id: 'short' };

    await obtenerProductoPorId(mockRequest as any, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'ID de producto inválido.'
    });
  });

  it('debería manejar errores de base de datos', async () => {
    const errorDb = new Error('Database error');
    prismaMock.producto.findUnique.mockRejectedValue(errorDb);

    await obtenerProductoPorId(mockRequest as any, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ocurrió un error al obtener el producto.',
      })
    );
  });
});