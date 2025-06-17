import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Definir el tipo de marca mock
interface MarcaMock {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  creadoEn: Date;
  creadoPor: string | null;
  modificadoEn: Date | null;
  modificadoPor: string | null;
  anuladoEn: Date | null;
  anuladoPor: string | null;
}

// Crear mocks con tipo any para evitar problemas de tipado
const mockFindUnique = jest.fn() as any;
const mockUpdate = jest.fn() as any;
const mockCount = jest.fn() as any;
const mockProductoCount = jest.fn() as any;
const mockTransaction = jest.fn() as any;

// Configurar implementaciones por defecto
mockFindUnique.mockResolvedValue(null);
mockUpdate.mockResolvedValue({});
mockCount.mockResolvedValue(0);
mockProductoCount.mockResolvedValue(0);
mockTransaction.mockImplementation((callback: any) => 
  Array.isArray(callback) ? Promise.all(callback) : Promise.resolve([])
);

// Mock del cliente Prisma que interceptará las instancias en marcaController.ts
const mockPrismaClient = {
  marca: {
    findUnique: mockFindUnique,
    update: mockUpdate,
    count: mockCount,
  },
  producto: {
    count: mockProductoCount,
  },
  $transaction: mockTransaction,
};

// 1. Mock de Prisma Client (con implementación específica para esta prueba)
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient)
}));

// 2. Mock de funciones de auditoría
const mockLogSuccess = jest.fn().mockImplementation(() => Promise.resolve());
const mockLogError = jest.fn().mockImplementation(() => Promise.resolve());

// Mock del módulo de auditoría
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: mockLogSuccess,
  logError: mockLogError
}));

// 3. Ahora podemos importar módulos que usan estos mocks
import { eliminarMarca } from '../../../../src/controllers/marcaController';
import { mockMarca } from '../../__fixtures__/marcaFixtures';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';

describe('Controlador de Marcas - Eliminar Marca', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = createMockRequest({
      params: { id: mockMarca.id },
      user: { 
        id: 'usuario-test-id',
        email: 'test@example.com',
        nombreCompleto: 'Usuario de Prueba'
      },
      ip: '127.0.0.1'
    });

    mockResponse = createMockResponse();
    
    // Configurar mocks de Prisma antes de cada prueba
    mockFindUnique.mockResolvedValue({
      ...mockMarca,
      anuladoEn: null,
    });
    
    mockUpdate.mockResolvedValue({
      ...mockMarca,
      anuladoEn: new Date(),
      anuladoPor: 'usuario-test-id',
      activo: false,
    });

    // Configurar mock para verificación de productos asociados
    mockProductoCount.mockResolvedValue(0);
    
    // Resetear los mocks antes de cada prueba
    resetMocks();
    mockLogSuccess.mockClear();
    mockLogError.mockClear();
    
    // Resetear los mocks de Prisma
    mockFindUnique.mockClear();
    mockUpdate.mockClear();
    mockCount.mockClear();
    mockProductoCount.mockClear();
    mockTransaction.mockClear();
  });

  it('debe realizar un soft delete de una marca existente', async () => {
    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a update con los campos de anulación
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockMarca.id },
      data: {
        anuladoEn: expect.any(Date),
        anuladoPor: mockRequest.user?.id,
        activo: false,
      },
    });

    // Verificar la respuesta exitosa
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json.mock.calls[0][0]).toEqual({
      ok: true,
      data: 'Marca eliminada correctamente.',
      error: null,
    });

    // Verificar que se llamó a logSuccess con los parámetros correctos
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      entityId: mockMarca.id,
      module: 'eliminarMarca',
      action: 'eliminar_marca',
      message: 'Marca eliminada exitosamente',
      details: {
        id: mockMarca.id,
        tipo: 'soft_delete',
        anuladoEn: expect.any(String)
      }
    });
  });

  it('debe validar que el ID sea un UUID válido', async () => {
    // Configurar un ID inválido
    const invalidId = 'id-invalido';
    mockRequest.params = { id: invalidId };

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json.mock.calls[0][0]).toEqual({
      ok: false,
      data: null,
      error: 'ID inválido',
    });

    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      entityId: invalidId,
      module: 'eliminarMarca',
      action: 'error_eliminar_marca',
      message: 'Error al eliminar la marca',
      error: 'ID inválido. 400',
      context: {
        idSolicitado: invalidId
      }
    });
  });

  it('debe devolver error 404 si la marca no existe o ya está anulada', async () => {
    // Configurar el mock para simular que la marca no existe o ya está anulada
    mockFindUnique.mockResolvedValueOnce(null);

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Marca no encontrada.',
    });

    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      entityId: mockMarca.id,
      module: 'eliminarMarca',
      action: 'error_eliminar_marca',
      message: 'Error al eliminar la marca',
      error: 'Marca no encontrada. 404',
      context: {
        idSolicitado: mockMarca.id
      }
    });
  });

  it('debe devolver error 409 si la marca tiene productos asociados', async () => {
    // Configurar el mock para simular que hay productos asociados
    const productCount = 5;
    mockProductoCount.mockResolvedValueOnce(productCount);

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar respuesta de error
    const errorMessage = `No se puede eliminar la marca porque tiene ${productCount} producto(s) asociado(s).`;
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: errorMessage,
    });

    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      entityId: mockMarca.id,
      module: 'eliminarMarca',
      action: 'error_eliminar_marca',
      message: 'Error al eliminar la marca',
      error: 'No se puede eliminar la marca porque tiene productos asociados. 409',
      context: {
        idSolicitado: mockMarca.id
      }
    }));
  });

  it('debe manejar errores internos correctamente', async () => {
    // Configurar el mock para que lance un error
    const errorMessage = 'Error de base de datos';
    const testError = new Error(errorMessage);
    mockUpdate.mockRejectedValue(testError);

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error interno del servidor al eliminar la marca',
    });

    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      entityId: mockMarca.id,
      module: 'eliminarMarca',
      action: 'error_eliminar_marca',
      message: 'Error al eliminar la marca',
      error: 'Error interno del servidor al eliminar la marca. 500',
      context: expect.objectContaining({
        idSolicitado: mockMarca.id,
      })
    }));
  });
});
