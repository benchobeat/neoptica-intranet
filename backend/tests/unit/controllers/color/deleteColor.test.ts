import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Definir el mock antes de importar los demás módulos
const mockPrisma = {
  color: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  producto: {
    count: jest.fn()
  },
  $transaction: jest.fn(async (callback) => {
    if (typeof callback === 'function') {
      return await callback(mockPrisma);
    }
    if (Array.isArray(callback)) {
      return await Promise.all(callback);
    }
    return await Promise.resolve(callback);
  })
} as any; // Usamos 'as any' temporalmente para evitar errores de tipo

// Mockear módulos antes de importar el controlador
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockImplementation(() => Promise.resolve())
}));

// Importar el controlador después de los mocks
import { eliminarColor } from '../../../../src/controllers/colorController';
import { createMockRequest, createMockResponse } from '../../testUtils';
import { mockColor } from '../../__fixtures__/colorFixtures';

describe('Controlador de Colores - Eliminar Color', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;
  const userEmail = 'test@example.com';
  const colorId = '550e8400-e29b-41d4-a716-446655440000';
  const now = new Date();
  
  // Función auxiliar para resetear todos los mocks
  const resetAllMocks = () => {
    jest.clearAllMocks();
    Object.values(mockPrisma.color).forEach(mockFn => {
      if (typeof mockFn === 'function') {
        (mockFn as jest.Mock).mockClear();
      }
    });
  };

  beforeEach(() => {
    // Configuración inicial para cada prueba
    mockRequest = createMockRequest({
      params: { id: colorId },
      user: { 
        id: 'test-user-id', 
        email: userEmail,
        nombreCompleto: 'Usuario de Prueba',
        roles: ['admin']
      }
    });

    mockResponse = createMockResponse();
    resetAllMocks();

    // Configuración por defecto para las pruebas de eliminación exitosa
    mockPrisma.producto.count.mockResolvedValue(0); // No hay productos asociados
    mockPrisma.color.findUnique.mockResolvedValue(mockColor);
    mockPrisma.color.update.mockResolvedValue({
      ...mockColor,
      anuladoEn: now,
      anuladoPor: userEmail,
      activo: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe marcar un color como eliminado (soft delete)', async () => {
    // Configurar mocks de Prisma
    const mockColorActivo = { ...mockColor, anuladoEn: null };
    const mockColorEliminado = { 
      ...mockColor, 
      anuladoEn: now, 
      anuladoPor: 'test-user-id', 
      activo: false 
    };
    
    mockPrisma.color.findUnique.mockResolvedValue(mockColorActivo);
    mockPrisma.color.update.mockResolvedValue(mockColorEliminado);

    // Ejecutar la función del controlador
    await eliminarColor(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: 'Color eliminado correctamente.',
      error: null,
    });

    // Verificar que se llamó a findUnique con el ID correcto y anuladoEn: null
    expect(mockPrisma.color.findUnique).toHaveBeenCalledWith({
      where: { 
        id: colorId,
        anuladoEn: null 
      },
    });

    // Verificar que se llamó a update con los datos correctos
    expect(mockPrisma.color.update).toHaveBeenCalledWith({
      where: { id: colorId },
      data: {
        anuladoEn: expect.any(Date),
        anuladoPor: 'test-user-id', // Usar el ID del usuario, no el email
        activo: false,
      },
    });
  });

  it('debe retornar error 404 si el color no existe', async () => {
    // Configurar el mock para simular que el color no existe
    mockPrisma.color.findUnique.mockResolvedValue(null);

    // Ejecutar la función del controlador
    await eliminarColor(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Color no encontrado.'
    });
  });

  it('debe validar que el ID sea un UUID válido', async () => {
    // Configurar solicitud con ID inválido
    mockRequest.params = { id: 'id-invalido' };

    // Ejecutar la función del controlador
    await eliminarColor(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'ID inválido'
    });
  });

  it('debe manejar el caso cuando el color ya está eliminado', async () => {
    // Configurar mock para simular que el color no existe (ya está eliminado)
    mockPrisma.color.findUnique.mockResolvedValue(null);

    // Limpiar el mock de update para este caso de prueba
    mockPrisma.color.update.mockClear();

    // Ejecutar la función del controlador
    await eliminarColor(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findUnique con el ID correcto y anuladoEn: null
    expect(mockPrisma.color.findUnique).toHaveBeenCalledWith({
      where: { 
        id: colorId,
        anuladoEn: null 
      },
    });

    // Verificar que NO se llamó a update ya que el color no existe
    expect(mockPrisma.color.update).not.toHaveBeenCalled();

    // Verificar la respuesta de error 404
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Color no encontrado.'
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para lanzar un error en la primera llamada a findUnique
    const errorMessage = 'Error de base de datos';
    mockPrisma.color.findUnique.mockRejectedValueOnce(new Error(errorMessage));

    // Ejecutar la función del controlador
    await eliminarColor(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findUnique
    expect(mockPrisma.color.findUnique).toHaveBeenCalled();

    // Verificar la respuesta de error 500
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al eliminar color'
    });
  });
});
