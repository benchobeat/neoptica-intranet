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
import { actualizarColor } from '../../../../src/controllers/colorController';
import { mockColor, updatedColorData } from '../../__fixtures__/colorFixtures';

// Definir el tipo de usuario esperado
interface User {
  id: string;
  email: string;
  nombreCompleto: string;
  roles?: string[]; // Propiedad opcional
}

describe('Controlador de Colores - Actualizar Color', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;
  const colorId = '550e8400-e29b-41d4-a716-446655440000';
  const userEmail = 'test@example.com';

  beforeEach(() => {
    // Configuración inicial para cada prueba
    const user: User = { 
      id: 'test-user-id',
      email: userEmail,
      nombreCompleto: 'Usuario de Prueba'
    };
    
    mockRequest = {
      params: { id: colorId },
      body: { ...updatedColorData },
      user: user,
      ip: '127.0.0.1'
    };

    // Reset mocks antes de cada prueba
    mockLogSuccess.mockClear();
    mockLogError.mockClear();
    resetPrismaMocks();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Resetear todos los mocks
    resetPrismaMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe actualizar un color existente e ignorar el campo activo', async () => {
    // Configurar mocks de Prisma
    prismaMock.color.findUnique.mockResolvedValue(mockColor);
    prismaMock.color.findFirst.mockResolvedValue(null); // Para verificar que no hay duplicados
    
    // Añadir activo: false en los datos para verificar que se ignora
    mockRequest.body = {
      ...mockRequest.body,
      activo: false // Este campo debería ser ignorado
    };
    
    prismaMock.color.update.mockResolvedValue({
      ...mockColor,
      ...updatedColorData,
      activo: true, // El valor de activo no debería cambiar
      modificadoEn: new Date(),
      modificadoPor: 'test@example.com'
    });

    // Llamar a la función que se está probando
    await actualizarColor(mockRequest as Request, mockResponse as Response);

    // Verificar que se actualizó correctamente
    const updateCall = (prismaMock.color.update as jest.Mock).mock.calls[0][0];
    
    // Verificar la estructura básica de la llamada
    expect(updateCall).toMatchObject({
      where: { id: colorId },
      data: expect.objectContaining({
        nombre: updatedColorData.nombre,
        codigoHex: updatedColorData.codigoHex,
        descripcion: updatedColorData.descripcion,
        modificadoPor: 'test-user-id',
        modificadoEn: expect.any(Date)
      })
    });
    
    // Verificar que no se incluye el campo activo en la actualización
    const updateData = (updateCall as { data: any }).data;
    expect(updateData).not.toHaveProperty('activo');
    
    // Verificar que no se incluye el mensaje en los datos de actualización
    expect(updateData.mensaje).toBeUndefined();

    // Verificar que se llamó a logSuccess con los parámetros correctos
    const successCall = (mockLogSuccess as jest.Mock).mock.calls[0][0];
    expect(successCall).toMatchObject({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'color',
      module: 'actualizarColor',
      action: 'actualizar_color_exitoso',
      message: 'Color actualizado exitosamente',
      details: {
        cambios: expect.objectContaining({
          nombre: expect.objectContaining({
            anterior: expect.any(String),
            nuevo: expect.any(String)
          }),
          codigoHex: expect.objectContaining({
            anterior: expect.any(String),
            nuevo: expect.any(String)
          }),
          descripcion: expect.objectContaining({
            anterior: expect.any(String),
            nuevo: expect.any(String)
          })
        })
      },
      entityId: colorId
    });

    // Ejecutar la función del controlador
    await actualizarColor(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: expect.objectContaining({
        nombre: updatedColorData.nombre,
        codigoHex: updatedColorData.codigoHex,
        descripcion: updatedColorData.descripcion,
        modificadoPor: 'test@example.com'
      }),
      error: null
    });
  });

  it('debe ignorar explícitamente el campo activo cuando se proporciona', async () => {
    // Configurar mocks de Prisma
    prismaMock.color.findUnique.mockResolvedValue(mockColor);
    prismaMock.color.findFirst.mockResolvedValue(null);
    
    // Añadir activo: false en la solicitud
    mockRequest.body = {
      ...mockRequest.body,
      activo: false
    };
    
    // Ejecutar la función del controlador
    await actualizarColor(mockRequest as Request, mockResponse as Response);
    
    // Verificar que se llamó a update sin incluir activo
    const updateCall = (prismaMock.color.update as jest.Mock).mock.calls[0][0];
    expect((updateCall as any).data).not.toHaveProperty('activo');
  });
  
  it('debe manejar el caso cuando el color no existe', async () => {
    // Configurar el mock para simular que no se encuentra el color
    (prismaMock.color.findUnique as jest.Mock).mockImplementation(() => Promise.resolve(null));

    // Ejecutar la función del controlador
    await actualizarColor(mockRequest as Request, mockResponse as Response);

    // Verificar que se verificó la existencia del color
    expect(prismaMock.color.findUnique).toHaveBeenCalledWith({
      where: { 
        id: colorId,
        anuladoEn: null
      }
    });

    // Verificar que no se intentó actualizar
    expect(prismaMock.color.update).not.toHaveBeenCalled();

    // Verificar que se devolvió el error 404
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Color no encontrado.'
    });
    
    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'color',
      module: 'actualizarColor',
      action: 'error_actualizar_color',
      message: 'Color no encontrado.',
      context: {
        id: colorId,
        datosSolicitud: updatedColorData
      },
      error: expect.any(Error)
    });  
  });

  it('debe validar que el ID sea un UUID válido', async () => {
    // Configurar solicitud con ID inválido
    mockRequest.params = { id: 'id-invalido' };

    // Ejecutar la función del controlador
    await actualizarColor(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'ID inválido'
    });
  });

  it('debe validar que el nombre no esté en uso por otro color', async () => {
    // Configurar mocks para simular que ya existe otro color con el mismo nombre
    prismaMock.color.findUnique.mockResolvedValue(mockColor);
    prismaMock.color.findFirst.mockResolvedValue({
      ...mockColor,
      id: 'otro-id-diferente'
    });

    // Ejecutar la función del controlador
    await actualizarColor(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ya existe otro color con ese nombre.'
    });
  });

  it('debe manejar errores de validación de datos', async () => {
    // Configurar solicitud con datos inválidos
    mockRequest.body = { nombre: '' }; // Nombre vacío
    
    // Configurar el mock para simular que el color existe
    prismaMock.color.findUnique.mockResolvedValue(mockColor);

    // Ejecutar la función del controlador
    await actualizarColor(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre debe tener entre 2 y 100 caracteres.'
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para lanzar un error inesperado
    const errorMessage = 'Error inesperado';
    const testError = new Error(errorMessage);
    (prismaMock.color.findUnique as jest.Mock).mockImplementation(() => Promise.reject(testError));

    // Ejecutar la función del controlador
    await actualizarColor(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a logError con los parámetros correctos
    const errorCall = (mockLogError as jest.Mock).mock.calls[0][0];
    
    // Verificar las propiedades básicas
    expect(errorCall).toMatchObject({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'color',
      module: 'actualizarColor',
      action: 'error_actualizar_color',
      message: 'Se presento un error durante la actualizacion del color',
      context: {
        idSolicitado: colorId
      }
    });
    
    // Verificar que el error está presente y es una instancia de Error
    expect((errorCall as any).error).toBeInstanceOf(Error);
    expect((errorCall as any).error.message).toBe('ID inválido. 400');

    // Verificar que se manejó el error correctamente
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al actualizar color'
    });
  });
});
