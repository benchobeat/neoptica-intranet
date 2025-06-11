import { jest } from '@jest/globals';

const mockRegistrarAuditoria = jest.fn().mockImplementation(() => Promise.resolve());

jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria
}));

const { prismaMock } = require('../../__mocks__/prisma');

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    ...prismaMock
  }))
}));

import { Request, Response } from 'express';
import { actualizarProducto } from '../../../../src/controllers/productoController';
import { productoFixtures, mockUserId } from '../../__fixtures__/productoFixtures';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';

// Mock console.error to avoid polluting test output
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

beforeEach(() => {
  jest.clearAllMocks();
  resetMocks();
  if (typeof prismaMock.$resetMocks === 'function') {
    prismaMock.$resetMocks();
  }
});

describe('Producto Controller - actualizarProducto', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = createMockRequest({
      params: { id: productoFixtures.productoExistente.id },
      body: { ...productoFixtures.datosActualizacion },
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

  it('debería actualizar un producto exitosamente', async () => {
    prismaMock.producto.findUnique.mockResolvedValue(productoFixtures.productoExistente);
    prismaMock.producto.update.mockResolvedValue({
      ...productoFixtures.productoExistente,
      ...productoFixtures.datosActualizacion,
    });

    await actualizarProducto(mockRequest as any, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          nombre: productoFixtures.datosActualizacion.nombre,
        }),
      })
    );
    expect(prismaMock.producto.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: productoFixtures.productoExistente.id },
        data: expect.objectContaining({
          ...productoFixtures.datosActualizacion,
          modificadoEn: expect.any(Date),
          modificadoPor: mockUserId,
        }),
      })
    );
    // Verificar que se llamó a registrarAuditoria con los parámetros correctos
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'actualizarProducto',
        modulo: 'productos',
        entidadTipo: 'producto',
        entidadId: productoFixtures.productoExistente.id,
        usuarioId: mockUserId,
        descripcion: `Producto actualizado: ${productoFixtures.datosActualizacion.nombre}`,
        datosAdicionales: expect.objectContaining({
          id: productoFixtures.productoExistente.id,
          nombre: productoFixtures.datosActualizacion.nombre,
          cambios: expect.arrayContaining(Object.keys(productoFixtures.datosActualizacion)),
          realizadoPor: mockUserId,
        }),
      })
    );
  });

  it('debería devolver 404 si el producto no se encuentra', async () => {
    prismaMock.producto.findUnique.mockResolvedValue(null);

    await actualizarProducto(mockRequest as any, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Producto no encontrado.',
      })
    );
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });

  it('debería devolver 400 con un nombre de producto inválido', async () => {
    mockRequest.body.nombre = 'A'; // Nombre demasiado corto
    
    await actualizarProducto(mockRequest as any, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'El nombre es obligatorio y debe tener al menos 2 caracteres',
      })
    );
  });

  it('debería manejar errores de base de datos', async () => {
    const errorDb = new Error('Database error');
    prismaMock.producto.findUnique.mockResolvedValue(productoFixtures.productoExistente);
    prismaMock.producto.update.mockRejectedValue(errorDb);
    
    // Reset mock calls to ensure we only check calls after this point
    mockRegistrarAuditoria.mockClear();

    await actualizarProducto(mockRequest as any, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ocurrió un error al actualizar el producto.',
      })
    );
    // Verificar que no se registra auditoría en caso de error de validación
    expect(mockRegistrarAuditoria).not.toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'actualizarProducto'
      })
    );
    
    // Verificar que se registra un error en la consola
    expect(console.error).toHaveBeenCalledWith('Error al actualizar producto:', expect.any(Error));
  });
});