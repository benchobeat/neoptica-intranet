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
const mockLogSuccess = jest.fn().mockImplementation((params: any) => Promise.resolve());
const mockLogError = jest.fn().mockImplementation((params: any) => Promise.resolve());

jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria,
  logSuccess: mockLogSuccess,
  logError: mockLogError
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
      },
      ip: '127.0.0.1'
    });

    mockResponse = createMockResponse();
    resetMocks();
    resetPrismaMocks();
    
    // Reset mocks antes de cada prueba
    mockLogSuccess.mockClear();
    mockLogError.mockClear();

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
    await eliminarColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar que no se intentó buscar ni actualizar
    expect(prismaMock.color.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.color.update).not.toHaveBeenCalled();
    
    // Debug: Log the actual call to mockLogError
    const mockCalls = (mockLogError as jest.Mock).mock.calls[0][0];
    console.log('Actual mockLogError call:', JSON.stringify(mockCalls, null, 2));
    
    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'color',
      module: 'eliminarColor',
      action: 'error_eliminar_color',
      message: 'Error al eliminar color',
      error: expect.any(Error),
      context: {
        datosSolicitud: {},
        id: 'id-invalido'
      }
    });

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      error: 'ID inválido',
      data: null
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para lanzar un error en la primera llamada a findUnique
    const errorMessage = 'Error de base de datos';
    const testError = new Error(errorMessage);
    (prismaMock.color.findUnique as jest.Mock).mockImplementationOnce(() => Promise.reject(testError));

    // Configurar solicitud con ID válido
    mockRequest.params = { id: colorId };

    // Ejecutar la función del controlador
    await eliminarColor(mockRequest as Request, mockResponse as unknown as Response);

    // Debug: Log the actual call to mockLogError
    const mockCalls = (mockLogError as jest.Mock).mock.calls[0][0];
    console.log('Actual mockLogError call:', JSON.stringify(mockCalls, null, 2));

    // Verificar que se intentó buscar el color
    expect(prismaMock.color.findUnique).toHaveBeenCalledWith({
      where: { 
        id: colorId,
        anuladoEn: null 
      }
    });

    // Verificar que no se intentó actualizar
    expect(prismaMock.color.update).not.toHaveBeenCalled();
    
    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'color',
      module: 'eliminarColor',
      action: 'error_eliminar_color',
      message: 'Error al eliminar el color',
      error: testError,
      context: {
        id: colorId,
        datosSolicitud: {},
        tieneProductosAsociados: 0,
        stack: expect.any(String)
      }
    });

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Error al eliminar el color'
      })
    );
  });

  it('debe eliminar un color exitosamente', async () => {
    // Configuraciones específicas para esta prueba se hacen en beforeEach
    
    // Ejecuta el controlador
    await eliminarColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar que se obtuvo el color correctamente
    expect(prismaMock.color.findUnique).toHaveBeenCalledWith({
      where: { 
        id: colorId,
        anuladoEn: null 
      }
    });

    // Verificar que se actualizó el color con la marca de tiempo de anulación
    expect(prismaMock.color.update).toHaveBeenCalledWith({
      where: { id: colorId },
      data: {
        anuladoEn: expect.any(Date),
        anuladoPor: 'test-user-id',
        activo: false
      }
    });
    
    // Verificar que se llamó a logSuccess con los parámetros correctos
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'color',
      module: 'colores',
      action: 'eliminar_color_exitoso',
      message: 'Color eliminado exitosamente',
      entityId: colorId,
      details: {
        fechaEliminacion: expect.any(String),
        nombre: 'Rojo',
        tipo: 'soft_delete'
      }
    });
    
    // Verificar la respuesta exitosa
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: 'Color eliminado correctamente.',
      error: null
    });
    
    // Verificar respuesta exitosa
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: 'Color eliminado correctamente.',
      error: null,
    });
  });
});
