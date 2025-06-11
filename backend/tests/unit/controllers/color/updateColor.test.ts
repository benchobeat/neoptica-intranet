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
      user: user
    };

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

  it('debe actualizar un color existente', async () => {
    // Configurar mocks de Prisma
    prismaMock.color.findUnique.mockResolvedValue(mockColor);
    prismaMock.color.findFirst.mockResolvedValue(null); // Para verificar que no hay duplicados
    prismaMock.color.update.mockResolvedValue({
      ...mockColor,
      ...updatedColorData,
      modificadoEn: new Date(),
      modificadoPor: 'test@example.com'
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

  it('debe retornar error 404 si el color no existe', async () => {
    // Configurar el mock para simular que no se encontró el color
    prismaMock.color.findUnique.mockResolvedValue(null);

    // Ejecutar la función del controlador
    await actualizarColor(mockRequest as Request, mockResponse as Response);

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
    // Configurar el mock para lanzar un error
    const errorMessage = 'Error inesperado';
    prismaMock.color.findUnique.mockRejectedValue(new Error(errorMessage));

    // Ejecutar la función del controlador
    await actualizarColor(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al actualizar color'
    });
  });
});
