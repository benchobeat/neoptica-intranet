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
import { listarProductos } from '../../../../src/controllers/productoController';
import { productoFixtures, mockUserId } from '../../__fixtures__/productoFixtures';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';

// 7. Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  resetMocks();
  if (typeof prismaMock.$resetMocks === 'function') {
    prismaMock.$resetMocks();
  }
});

describe('Producto Controller - listarProductos', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = createMockRequest({
      query: {},
      user: { 
        id: mockUserId, 
        nombreCompleto: 'Test User', 
        email: 'test@example.com',
        roles: ['admin']
      },
      ip: '127.0.0.1'
    });
    
    mockResponse = createMockResponse();
    
    // Resetear todos los mocks antes de cada prueba
    resetMocks();
  });

  it('debería listar los productos correctamente con paginación por defecto', async () => {
    prismaMock.producto.findMany.mockResolvedValue(productoFixtures.listaDeProductos);
    prismaMock.producto.count.mockResolvedValue(productoFixtures.listaDeProductos.length);

    await listarProductos(mockRequest as any, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.any(Array),
        meta: expect.objectContaining({
          total: productoFixtures.listaDeProductos.length,
          page: 1,
          limit: 20,
        }),
      })
    );
    expect(prismaMock.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
      })
    );
    expect(mockRegistrarAuditoria).toHaveBeenCalled();
  });

  it('debería filtrar productos por término de búsqueda (q)', async () => {
    const searchTerm = 'Prueba 1';
    mockRequest.query = { q: searchTerm };
    const productosFiltrados = [productoFixtures.listaDeProductos[0]];
    prismaMock.producto.findMany.mockResolvedValue(productosFiltrados);
    prismaMock.producto.count.mockResolvedValue(productosFiltrados.length);

    await listarProductos(mockRequest as any, mockResponse as Response);

    // Verificar que se llamó a findMany con los parámetros correctos
    expect(prismaMock.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { nombre: { contains: searchTerm, mode: 'insensitive' } },
            { descripcion: { contains: searchTerm, mode: 'insensitive' } },
            { categoria: { contains: searchTerm, mode: 'insensitive' } },
          ],
        }),
        skip: 0,
        take: 20,
      })
    );
    
    // Verificar que se devolvió la respuesta correcta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    const responseArg = mockResponse.json.mock.calls[0][0];
    expect(responseArg).toMatchObject({
      ok: true,
      data: expect.any(Array),
      meta: expect.objectContaining({
        total: productosFiltrados.length,
        page: 1,
        limit: 20,
      }),
    });
  });

  it('debería filtrar por nombre correctamente', async () => {
    const nombre = 'test';
    mockRequest.query = { q: nombre };
    const productosFiltrados = [productoFixtures.listaDeProductos[0]];
    prismaMock.producto.findMany.mockResolvedValue(productosFiltrados);
    prismaMock.producto.count.mockResolvedValue(productosFiltrados.length);

    await listarProductos(mockRequest as any, mockResponse as Response);

    // Verificar que se llama a findMany con los parámetros correctos
    expect(prismaMock.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { nombre: { contains: nombre, mode: 'insensitive' } },
          ]),
        }),
      })
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('debería manejar la paginación correctamente', async () => {
    const page = 2;
    const limit = 10;
    mockRequest.query = { page: page.toString(), limit: limit.toString() };
    const productosPaginados = productoFixtures.listaDeProductos.slice(0, 2);
    const total = productoFixtures.listaDeProductos.length;
    
    prismaMock.producto.findMany.mockResolvedValue(productosPaginados);
    prismaMock.producto.count.mockResolvedValue(total);

    await listarProductos(mockRequest as any, mockResponse as Response);

    // Verificar que se llama a findMany con los parámetros de paginación correctos
    expect(prismaMock.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: (page - 1) * limit,
        take: limit,
      })
    );
    
    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    const responseArg = mockResponse.json.mock.calls[0][0];
    expect(responseArg).toMatchObject({
      ok: true,
      data: expect.any(Array),
      meta: expect.objectContaining({
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }),
    });
  });

  it('debería manejar errores de base de datos', async () => {
    const errorDb = new Error('Database error');
    prismaMock.producto.findMany.mockRejectedValue(errorDb);
    prismaMock.producto.count.mockResolvedValue(0);

    await listarProductos(mockRequest as any, mockResponse as Response);

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    
    // Verificar que se devuelve un objeto de error con la estructura correcta
    const responseArg = mockResponse.json.mock.calls[0][0];
    expect(responseArg).toMatchObject({
      ok: false,
      data: [],
      error: expect.stringContaining('Ocurrió un error al listar los productos'),
      meta: expect.objectContaining({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      }),
    });

    // Verificar que se registró la auditoría de error
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'errorListarProductos',
        modulo: 'productos',
        usuarioId: mockUserId,
      })
    );
  });
});