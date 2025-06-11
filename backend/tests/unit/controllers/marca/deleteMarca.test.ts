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

// 2. Mock de auditoría
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockImplementation(() => Promise.resolve())
}));

// 3. Ahora podemos importar módulos que usan estos mocks
import { eliminarMarca } from '../../../../src/controllers/marcaController';
import { mockMarca } from '../../__fixtures__/marcaFixtures';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';

// 4. Obtener referencias al mock de auditoría
const mockRegistrarAuditoria = require('../../../../src/utils/audit').registrarAuditoria;

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
    mockRegistrarAuditoria.mockClear();
    
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
  });

  it('debe validar que el ID sea un UUID válido', async () => {
    // Configurar un ID inválido
    mockRequest.params = { id: 'id-invalido' };

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json.mock.calls[0][0]).toEqual({
      ok: false,
      data: null,
      error: 'ID inválido',
    });
  });

  it('debe devolver error 404 si la marca no existe', async () => {
    // Configurar el mock para que devuelva null (marca no encontrada)
    mockFindUnique.mockResolvedValue(null);

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Marca no encontrada.',
    });
  });

  it('debe devolver error 404 si la marca ya está anulada', async () => {
    // Configurar el mock para simular una marca ya anulada
    const marcaAnulada = {
      ...mockMarca,
      anuladoEn: new Date(),
      anuladoPor: 'user-id',
      activo: false,
    };

    // Configurar el mock para devolver null (marca no encontrada por el filtro anuladoEn: null)
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
  });

  it('debe devolver error 409 si la marca tiene productos asociados', async () => {
    // Configurar el mock para simular que hay productos asociados
    mockProductoCount.mockResolvedValueOnce(5);

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'No se puede eliminar la marca porque tiene 5 producto(s) asociado(s).',
    });
  });

  it('debe manejar errores internos correctamente', async () => {
    // Configurar el mock para que lance un error
    mockUpdate.mockRejectedValue(new Error('Error de base de datos'));

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ocurrió un error al eliminar la marca.',
    });
  });
});
