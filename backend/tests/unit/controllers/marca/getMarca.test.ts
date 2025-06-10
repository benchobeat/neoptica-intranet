import { Request, Response } from 'express';
import { obtenerMarcaPorId } from '../../../../src/controllers/marcaController';
import { mockMarca } from '../../__fixtures__/marcaFixtures';

// Extender la interfaz Error para incluir la propiedad code
interface CustomError extends Error {
  code?: string;
}

// Mock Prisma y auditoría
jest.mock('@prisma/client', () => {
  const mockMarcaMethods = {
    findUnique: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      marca: mockMarcaMethods,
      $disconnect: jest.fn(),
    })),
    mockMarcaMethods, // Exportamos los métodos para usarlos en las pruebas
  };
});

// Obtenemos los mocks después de importar los módulos
const { mockMarcaMethods } = require('@prisma/client');

// Mock de auditoría
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
}));

describe('Controlador de Marcas - Obtener Marca por ID', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let responseObject: any;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockRequest = {
      params: { id: mockMarca.id },
      user: { 
        id: 'usuario-test-id',
        email: 'test@example.com',
        nombreCompleto: 'Usuario de Prueba'
      },
      ip: '127.0.0.1'
    };

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    // Configurar el mock para devolver la respuesta a través de .json
    mockJson.mockImplementation((result) => {
      responseObject = result;
      return mockResponse;
    });

    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('debe devolver una marca cuando existe', async () => {
    // Configurar el mock para devolver una marca existente
    mockMarcaMethods.findUnique.mockResolvedValue(mockMarca);

    // Ejecutar la función del controlador
    await obtenerMarcaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findUnique con el ID correcto y anuladoEn: null
    expect(mockMarcaMethods.findUnique).toHaveBeenCalledWith({
      where: { 
        id: mockMarca.id,
        anuladoEn: null 
      },
    });

    // Verificar la respuesta exitosa
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual({
      ok: true,
      data: expect.objectContaining({
        id: mockMarca.id,
        nombre: mockMarca.nombre,
      }),
      error: null,
    });
  });

  it('debe devolver error 404 cuando la marca no existe', async () => {
    // Configurar el mock para devolver null (marca no encontrada)
    mockMarcaMethods.findUnique.mockResolvedValue(null);

    // Ejecutar la función del controlador
    await obtenerMarcaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 404
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Marca no encontrada.',
    });
  });

  it('debe devolver error 400 cuando el ID es inválido', async () => {
    // Configurar un ID inválido
    mockRequest.params = { id: 'id-invalido' };

    // Ejecutar la función del controlador
    await obtenerMarcaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 400
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'ID inválido',
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para lanzar un error de Prisma
    const errorMessage = 'Error inesperado de base de datos';
    const error = new Error(errorMessage) as CustomError;
    error.code = 'P2023'; // Simulamos un error de Prisma
    mockMarcaMethods.findUnique.mockRejectedValue(error);

    // Ejecutar la función del controlador
    await obtenerMarcaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 400 para error de formato de ID
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'ID inválido',
    });
    
    // Probar con otro tipo de error
    mockMarcaMethods.findUnique.mockRejectedValue(new Error('Error inesperado'));
    
    // Limpiar llamadas anteriores
    mockStatus.mockClear();
    mockJson.mockClear();
    
    // Ejecutar de nuevo
    await obtenerMarcaPorId(mockRequest as Request, mockResponse as Response);
    
    // Verificar respuesta de error 500 para otros errores
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener la marca.',
    });
  });
});
