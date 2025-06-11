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
import { obtenerColorPorId } from '../../../../src/controllers/colorController';
import { mockColor } from '../../__fixtures__/colorFixtures';

// Definir el tipo de usuario esperado
interface User {
  id: string;
  email: string;
  nombreCompleto: string;
  roles?: string[]; // Propiedad opcional
}

describe('Controlador de Colores - Obtener Color por ID', () => {
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
      user: user
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Configuración por defecto para las pruebas
    prismaMock.color.findUnique.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe obtener un color existente por su ID', async () => {
    // Configurar el mock de Prisma
    prismaMock.color.findUnique.mockResolvedValue(mockColor);

    // Ejecutar la función del controlador
    await obtenerColorPorId(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: expect.objectContaining({
        id: mockColor.id,
        nombre: mockColor.nombre,
        codigoHex: mockColor.codigoHex
      }),
      error: null
    });
    
    // Verificar que se llamó a findUnique con el ID correcto y el filtro anuladoEn: null
    expect(prismaMock.color.findUnique).toHaveBeenCalledWith({
      where: { 
        id: colorId,
        anuladoEn: null
      },
    });
  });

  it('debe retornar error 404 si el color no existe', async () => {
    // Configurar el mock para simular que no se encontró el color
    prismaMock.color.findUnique.mockResolvedValue(null);

    // Ejecutar la función del controlador
    await obtenerColorPorId(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Color no encontrado.'
    });
  });

  it('debe validar que el ID sea un UUID válido', async () => {
    // Configurar un ID inválido
    if (mockRequest.params) {
      mockRequest.params.id = 'id-invalido';
    }

    // Ejecutar la función del controlador
    await obtenerColorPorId(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'ID inválido'
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar un error inesperado
    const errorMessage = 'Error inesperado';
    prismaMock.color.findUnique.mockRejectedValue(new Error(errorMessage));

    // Ejecutar la función del controlador
    await obtenerColorPorId(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al obtener color'
    });
  });
});
