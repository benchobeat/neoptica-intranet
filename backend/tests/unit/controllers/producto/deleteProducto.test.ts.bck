// 1. Import jest first
import { jest } from '@jest/globals';

// 2. Create mock functions and constants
const MOCK_USER_ID = '4778780b-a4f2-496c-8ea3-e4d5760e6e4c'; // UUID format expected by the controller
const mockRegistrarAuditoria = jest.fn().mockImplementation(() => Promise.resolve());

// 3. Set up mocks before importing anything that uses them
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria
}));

// Mock the console.error to avoid polluting test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

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
import { eliminarProducto } from '../../../../src/controllers/productoController';
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

describe('Producto Controller - eliminarProducto', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    // Usar un ID válido (más de 10 caracteres)
    mockRequest = createMockRequest({
      params: { id: 'producto-123' },
      user: { 
        id: MOCK_USER_ID, // Usar el ID de usuario consistente
        nombreCompleto: 'Usuario Test', 
        email: 'test@test.com', 
        roles: ['admin'] 
      },
      ip: '127.0.0.1'
    });
    mockResponse = createMockResponse();
    
    // Resetear todos los mocks antes de cada prueba
    mockRegistrarAuditoria.mockClear();
    resetMocks();
  });

  it('debería desactivar un producto (soft delete) exitosamente', async () => {
    // Configurar mock para simular producto existente
    const productoActivo = { 
      ...productoFixtures.productoExistente,
      id: 'producto-123', // Asegurar que el ID coincida con el mockRequest
      activo: true,
      anuladoEn: null,
      anuladoPor: null,
      marca: { id: 'marca-1', nombre: 'Marca Test' },
      color: { id: 'color-1', nombre: 'Color Test', codigoHex: '#FFFFFF' },
      _count: { inventarios: 0 },
      creadoPor: MOCK_USER_ID // Asegurar que el creador coincida con el mock
    };
    
    const productoDesactivado = {
      ...productoActivo,
      activo: false,
      anuladoEn: new Date(),
      anuladoPor: MOCK_USER_ID, // Usar el ID del usuario del mock en formato UUID
      _count: { inventarios: 0 }
    };

    // Configurar mocks de Prisma
    prismaMock.producto.findUnique.mockResolvedValue(productoActivo);
    prismaMock.producto.update.mockResolvedValue({
      ...productoDesactivado,
      marca: { id: 'marca-1', nombre: 'Marca Test' },
      color: { id: 'color-1', nombre: 'Color Test', codigoHex: '#FFFFFF' }
    });

    await eliminarProducto(mockRequest as any, mockResponse as Response);

    // Verificar respuesta exitosa
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    
    // Verificar la estructura básica de la respuesta
    const responseArg = mockResponse.json.mock.calls[0][0];
    expect(responseArg).toMatchObject({
      ok: true,
      data: expect.objectContaining({
        id: productoActivo.id,
        activo: false,
        anuladoEn: expect.any(Date),
        anuladoPor: expect.any(String),
        _count: expect.any(Object),
        marca: expect.any(Object),
        color: expect.any(Object)
      })
    });
    
    // Verificar que los datos básicos del producto se mantienen
    const productoResponse = responseArg.data;
    expect(productoResponse.nombre).toBe(productoActivo.nombre);
    expect(productoResponse.descripcion).toBe(productoActivo.descripcion);
    expect(productoResponse.precio).toBe(productoActivo.precio);

    // Verificar que se llamó a Prisma con los parámetros correctos
    expect(prismaMock.producto.update).toHaveBeenCalledWith({
      where: { id: productoActivo.id },
      data: {
        activo: false,
        anuladoEn: expect.any(Date),
        anuladoPor: MOCK_USER_ID // Usar el ID del usuario del mock en formato UUID
      },
      include: {
        marca: { select: { id: true, nombre: true } },
        color: { select: { id: true, nombre: true, codigoHex: true } },
        _count: { select: { inventarios: true } }
      }
    });

    // Verificar auditoría con expect.objectContaining para ser más flexible
    expect(mockRegistrarAuditoria).toHaveBeenCalledWith(expect.objectContaining({
      usuarioId: MOCK_USER_ID,
      accion: 'eliminarProducto',
      entidadTipo: 'producto',
      entidadId: productoActivo.id,
      modulo: 'productos',
      ip: expect.any(String),
      datosAdicionales: expect.objectContaining({
        id: productoActivo.id,
        nombre: productoActivo.nombre,
        realizadoPor: MOCK_USER_ID
      })
    }));
  });

  it('debería devolver 400 si el ID no es válido (menos de 10 caracteres)', async () => {
    // Configurar request con ID inválido (menos de 10 caracteres)
    mockRequest.params = { id: 'short' };

    await eliminarProducto(mockRequest as any, mockResponse as Response);

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        data: null,
        error: 'ID de producto inválido.'
      })
    );

    // No debe intentar buscar en la base de datos
    expect(prismaMock.producto.findUnique).not.toHaveBeenCalled();
    // No debe registrar auditoría
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si el ID no es una cadena', async () => {
    // Configurar request con ID inválido (no string)
    mockRequest.params = { id: 123 as any };

    await eliminarProducto(mockRequest as any, mockResponse as Response);

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        data: null,
        error: 'ID de producto inválido.'
      })
    );
  });

  it('debería devolver 404 si el producto no se encuentra', async () => {
    // Configurar un ID válido pero que no existe
    const nonExistentId = '1234567890';
    mockRequest.params = { id: nonExistentId };
    
    // Simular que el producto no existe
    prismaMock.producto.findUnique.mockResolvedValueOnce(null);

    await eliminarProducto(mockRequest as any, mockResponse as Response);

    // Verificar que se devuelve un error 404
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        data: null,
        error: 'Producto no encontrado.'
      })
    );

    // Verificar que se llamó a findUnique con el ID correcto
    expect(prismaMock.producto.findUnique).toHaveBeenCalledWith({
      where: { id: nonExistentId },
      include: {
        marca: { select: { id: true, nombre: true } },
        color: { select: { id: true, nombre: true, codigoHex: true } },
        _count: { select: { inventarios: true } }
      }
    });

    // No debe intentar actualizar el producto
    expect(prismaMock.producto.update).not.toHaveBeenCalled();
    
    // No debe registrar auditoría si no se encuentra el producto
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si el producto ya está desactivado', async () => {
    // Configurar mock para simular producto ya desactivado
    const productoInactivo = { 
      ...productoFixtures.productoExistente,
      id: 'producto-123', // Asegurar que el ID coincida con el mockRequest
      activo: false,
      anuladoEn: new Date(),
      anuladoPor: 'user-12345678', // Usar el ID del usuario del mock
      _count: { inventarios: 0 },
      marca: { id: 'marca-1', nombre: 'Marca Test' },
      color: { id: 'color-1', nombre: 'Color Test', codigoHex: '#FFFFFF' }
    };
    
    // Configurar mock de Prisma
    prismaMock.producto.findUnique.mockResolvedValueOnce(productoInactivo);
    
    // Configurar el mock de update para que no se llame
    prismaMock.producto.update.mockImplementation(() => {
      throw new Error('No se debería llamar a update');
    });

    await eliminarProducto(mockRequest as any, mockResponse as Response);

    // Verificar que se devuelve un error 400 (conflicto)
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        data: null,
        error: 'El producto ya está desactivado.'
      })
    );

    // Verificar que se llamó a findUnique con los includes correctos
    expect(prismaMock.producto.findUnique).toHaveBeenCalledWith({
      where: { id: productoInactivo.id },
      include: {
        marca: { select: { id: true, nombre: true } },
        color: { select: { id: true, nombre: true, codigoHex: true } },
        _count: { select: { inventarios: true } }
      }
    });

    // No debe intentar actualizar el producto
    expect(prismaMock.producto.update).not.toHaveBeenCalled();
    
    // No debe registrar auditoría
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });

  it('debería manejar errores de base de datos al actualizar', async () => {
    // Configurar mocks
    const productoActivo = { 
      ...productoFixtures.productoExistente,
      id: 'producto-123',
      activo: true,
      anuladoEn: null,
      anuladoPor: null,
      nombre: 'Lentes de Sol Test',
      marca: { id: 'marca-1', nombre: 'Marca Test' },
      color: { id: 'color-1', nombre: 'Color Test', codigoHex: '#FFFFFF' },
      _count: { inventarios: 0 },
      creadoPor: MOCK_USER_ID
    };
    
    // Configurar el mock para findUnique (éxito)
    prismaMock.producto.findUnique.mockResolvedValue(productoActivo);
    
    // Configurar el mock para update (error)
    const dbError = new Error('Database error') as any;
    dbError.code = 'P2002'; // Simulate a Prisma error code
    prismaMock.producto.update.mockRejectedValue(dbError);
    
    // Configurar el mock de auditoría
    mockRegistrarAuditoria.mockImplementation(() => Promise.resolve());
    
    // Limpiar llamadas previas a los mocks
    mockRegistrarAuditoria.mockClear();
    prismaMock.producto.update.mockClear();

    await eliminarProducto(mockRequest as any, mockResponse as Response);

    // Verificar respuesta de error del servidor
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    
    // Verificar la estructura básica de la respuesta de error
    const responseArg = mockResponse.json.mock.calls[0][0];
    expect(responseArg).toMatchObject({
      ok: false,
      data: null,
      error: 'Ocurrió un error al eliminar el producto.'
    });
    
    // Verificar que no se registró auditoría en caso de error
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });
});