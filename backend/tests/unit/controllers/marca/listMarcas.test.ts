// Definir los mocks primero
const mockMarcaMethods = {
  findMany: jest.fn(),
  count: jest.fn(),
};

const mockLogSuccess = jest.fn().mockResolvedValue(undefined);
const mockLogError = jest.fn().mockResolvedValue(undefined);

// Configurar los mocks antes de importar los módulos que los usan
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    marca: mockMarcaMethods,
    $disconnect: jest.fn(),
  })),
}));

jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: (...args: any[]) => mockLogSuccess(...args),
  logError: (...args: any[]) => mockLogError(...args),
}));

// Importar después de configurar los mocks
import { Request, Response } from 'express';
import { listarMarcas } from '../../../../src/controllers/marcaController';
import { mockMarca, mockMarcaList } from '../../__fixtures__/marcaFixtures';

// Extender la interfaz Request para incluir la propiedad usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        nombreCompleto: string;
      };
    }
  }
}

// Extender la interfaz Error para incluir la propiedad code
interface CustomError extends Error {
  code?: string;
}

describe('Controlador de Marcas - Listar Marcas', () => {
  let mockRequest: Partial<Request & { usuario?: any }>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let responseObject: any;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockRequest = {
      query: {},
      user: { 
        id: 'usuario-test-id',
        email: 'test@example.com',
        nombreCompleto: 'Usuario de Prueba'
      },
      usuario: { 
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

    // Configuración por defecto para las pruebas
    mockMarcaMethods.findMany.mockResolvedValue(mockMarcaList);
  });

  it('debe listar todas las marcas cuando no hay filtros', async () => {
    // Ejecutar la función del controlador
    await listarMarcas(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findMany con los parámetros correctos
    expect(mockMarcaMethods.findMany).toHaveBeenCalledWith({
      where: {
        anuladoEn: null,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Verificar la respuesta exitosa
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual({
      ok: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          nombre: expect.any(String),
        })
      ]),
      error: null,
    });
    
    // Verificar que se llamó a logSuccess con los parámetros correctos
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      module: 'listarMarcas',
      action: 'listar_marcas_exitoso',
      message: 'Listado de marcas obtenido exitosamente',
      details: {
        totalRegistros: mockMarcaList.length,
        filtrosAplicados: {
          id: null,
          nombre: null,
          activo: null
        }
      }
    });
    
    // Verificar que no se llamó a logError
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('debe filtrar marcas por nombre cuando se proporciona el parámetro', async () => {
    // Configurar parámetro de búsqueda
    mockRequest.query = { nombre: 'Ray' };

    // Ejecutar la función del controlador
    await listarMarcas(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findMany con el filtro de nombre
    expect(mockMarcaMethods.findMany).toHaveBeenCalledWith({
      where: {
        anuladoEn: null,
        nombre: {
          contains: 'Ray',
          mode: 'insensitive',
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  });

  it('debe filtrar marcas por estado activo cuando se proporciona el parámetro', async () => {
    // Configurar parámetro de estado
    mockRequest.query = { activo: 'true' };

    // Ejecutar la función del controlador
    await listarMarcas(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findMany con el filtro de estado
    expect(mockMarcaMethods.findMany).toHaveBeenCalledWith({
      where: {
        anuladoEn: null,
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  });

  it('debe devolver un array vacío cuando no hay marcas que coincidan con los filtros', async () => {
    // Configurar el mock para devolver un array vacío
    mockMarcaMethods.findMany.mockResolvedValue([]);

    // Ejecutar la función del controlador
    await listarMarcas(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta exitosa con array vacío
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual({
      ok: true,
      data: [],
      error: null,
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para lanzar un error
    const errorMessage = 'Error inesperado';
    const testError = new Error(errorMessage);
    mockMarcaMethods.findMany.mockRejectedValue(testError);

    // Ejecutar la función del controlador
    await listarMarcas(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 500
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Error interno del servidor al listar marcas'
    });
    
    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      module: 'listarMarcas',
      action: 'error_listar_marcas',
      message: 'Error al listar las marcas',
      error: testError,
      context: expect.objectContaining({
        filtrosAplicados: {
          id: null,
          nombre: null,
          activo: null
        },
        error: 'Error inesperado'
      })
    });
    
    // Verificar que el stack está incluido en el contexto
    const logErrorCall = mockLogError.mock.calls[0][0];
    expect(logErrorCall.context.stack).toContain('Error: Error inesperado');
    
    // Verificar que no se llamó a logSuccess en caso de error
    expect(mockLogSuccess).not.toHaveBeenCalled();
  });
});
