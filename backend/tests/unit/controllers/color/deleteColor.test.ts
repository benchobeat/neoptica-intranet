import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Importar prismaMock directamente del mock
const { prismaMock, resetPrismaMocks } = require('../../__mocks__/prisma');

// Mockear módulos antes de importar el controlador
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock)
}));

// Mock de auditoría
const mockRegistrarAuditoria = jest.fn().mockImplementation(() => Promise.resolve());
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria
}));

// Importar el controlador después de los mocks
import { eliminarColor } from '../../../../src/controllers/colorController';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { mockColor } from '../../__fixtures__/colorFixtures';

describe('Controlador de Colores - Eliminar Color', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;
  const userEmail = 'test@example.com';
  const colorId = '550e8400-e29b-41d4-a716-446655440000';
  const now = new Date();
  
  // Usamos la función centralizada para resetear mocks

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
    resetMocks();
    resetPrismaMocks();

    // Configuración por defecto para las pruebas de eliminación exitosa
    prismaMock.producto.count.mockResolvedValue(0); // No hay productos asociados
    prismaMock.color.findUnique.mockResolvedValue(mockColor);
    prismaMock.color.update.mockResolvedValue({
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
    
    prismaMock.color.findUnique.mockResolvedValue(mockColorActivo);
    prismaMock.color.update.mockResolvedValue(mockColorEliminado);

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
    expect(prismaMock.color.findUnique).toHaveBeenCalledWith({
      where: { 
        id: colorId,
        anuladoEn: null 
      },
    });

    // Verificar que se llamó a update con los datos correctos
    expect(prismaMock.color.update).toHaveBeenCalledWith({
      where: { id: colorId },
      data: {
        anuladoEn: expect.any(Date),
        anuladoPor: 'test-user-id', // Usar el ID del usuario, no el email
        activo: false,
      },
    });
  });

  it('debe devolver error 404 si el color no existe', async () => {
    // Cambiar la configuración para esta prueba
    prismaMock.color.findUnique.mockResolvedValueOnce(null); // Color no existe
    
    // Ejecuta el controlador
    await eliminarColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verifica que se haya llamado a las funciones esperadas
    expect(prismaMock.color.findUnique).toHaveBeenCalledWith({
      where: { 
        id: colorId,
        anuladoEn: null 
      }
    });
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
    prismaMock.color.findUnique.mockResolvedValue(null);

    // Limpiar el mock de update para este caso de prueba
    prismaMock.color.update.mockClear();

    // Ejecutar la función del controlador
    await eliminarColor(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findUnique con el ID correcto y anuladoEn: null
    expect(prismaMock.color.findUnique).toHaveBeenCalledWith({
      where: { 
        id: colorId,
        anuladoEn: null 
      },
    });

    // Verificar que NO se llamó a update ya que el color no existe
    expect(prismaMock.color.update).not.toHaveBeenCalled();

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
    prismaMock.color.findUnique.mockRejectedValueOnce(new Error(errorMessage));

    // Ejecutar la función del controlador
    await eliminarColor(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findUnique
    expect(prismaMock.color.findUnique).toHaveBeenCalled();

    // Verificar la respuesta de error 500
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al eliminar color'
    });
  });

  it('debe eliminar un color exitosamente', async () => {
    // Configuraciones específicas para esta prueba se hacen en beforeEach
    
    // Ejecuta el controlador
    await eliminarColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verifica que se haya llamado a las funciones esperadas
    expect(prismaMock.color.findUnique).toHaveBeenCalledWith({
      where: { 
        id: colorId,
        anuladoEn: null 
      }
    });
    
    // Verificar que se llamó a update para el soft delete
    expect(prismaMock.color.update).toHaveBeenCalledWith({
      where: { id: colorId },
      data: {
        anuladoEn: expect.any(Date),
        anuladoPor: mockRequest.user?.id,
        activo: false,
      },
    });
    
    // Verificar respuesta exitosa
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: 'Color eliminado correctamente.',
      error: null,
    });
  });
});
