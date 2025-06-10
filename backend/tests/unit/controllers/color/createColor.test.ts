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
  $transaction: jest.fn(async (callback) => {
    if (typeof callback === 'function') {
      return await callback(mockPrisma);
    }
    if (Array.isArray(callback)) {
      return await Promise.all(callback);
    }
    return await Promise.resolve(callback);
  })
};

// Mockear módulos antes de importar el controlador
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockImplementation(() => Promise.resolve())
}));

// Importar el controlador después de los mocks
import { crearColor } from '../../../../src/controllers/colorController';
import { createMockRequest, createMockResponse } from '../../testUtils';
import { validColorData, invalidColorData, mockColor } from '../../__fixtures__/colorFixtures';

describe('Controlador de Colores - Crear Color', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

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
      body: { ...validColorData }
    });

    mockResponse = createMockResponse();
    resetAllMocks();
  });

  it('debe crear un color exitosamente', async () => {
    // Configuración del mock para la prueba específica
    (mockPrisma.color.findFirst as jest.Mock).mockImplementation(() => Promise.resolve(null));
    (mockPrisma.color.create as jest.Mock).mockImplementation(() => Promise.resolve({...mockColor}));

    // Ejecuta el controlador
    await crearColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verifica que se haya llamado a las funciones esperadas
    expect(mockPrisma.color.findFirst).toHaveBeenCalled();
    expect(mockPrisma.color.create).toHaveBeenCalled();

    // Verifica la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.anything()
      })
    );
  });

  it('debe devolver error si ya existe un color con el mismo nombre', async () => {
    // Configura el mock para simular un color existente
    (mockPrisma.color.findFirst as jest.Mock).mockImplementation(() => Promise.resolve({...mockColor}));

    // Ejecuta el controlador
    await crearColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verifica que se haya llamado a la función esperada
    expect(mockPrisma.color.findFirst).toHaveBeenCalled();
    expect(mockPrisma.color.create).not.toHaveBeenCalled();

    // Verifica la respuesta de error adecuada
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ya existe un color con ese nombre.',
      })
    );
  });

  it('debe validar que el nombre es requerido', async () => {
    // Configurar la petición sin nombre
    mockRequest.body = {
      ...mockRequest.body,
      nombre: undefined
    };

    // Ejecutar la función del controlador
    await crearColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre es obligatorio y debe ser una cadena de texto.'
    });
  });

  it('debe validar el formato del código hexadecimal', async () => {
    // Asegurarse de que findFirst devuelve null (no existe el color)
    (mockPrisma.color.findFirst as jest.Mock).mockImplementation(() => Promise.resolve(null));
    
    // Configurar la petición con un código hex inválido
    mockRequest.body = {
      ...mockRequest.body,
      codigoHex: 'GGGGGG'
    };

    // Ejecutar la función del controlador
    await crearColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Formato de código hexadecimal inválido. Debe ser #RRGGBB o #RGB.'
    });
  });
});
