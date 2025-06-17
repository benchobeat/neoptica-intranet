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
import { listarMarcasPaginadas } from '../../../../src/controllers/marcaController';
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

describe('Controlador de Marcas - Listar Marcas Paginadas', () => {
  let mockRequest: Partial<Request & { usuario?: any }>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let responseObject: any;

  const mockPaginationResult = {
    items: mockMarcaList,
    total: 3,
    page: 1,
    pageSize: 10,
  };

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockRequest = {
      query: {
        page: '1',
        pageSize: '10',
      },
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

    // Configuración por defecto para las pruebas
    mockMarcaMethods.findMany.mockResolvedValue(mockMarcaList);
    mockMarcaMethods.count.mockResolvedValue(3);

    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('debe listar marcas paginadas cuando no hay filtros', async () => {
    // Ejecutar la función del controlador
    await listarMarcasPaginadas(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findMany con los parámetros correctos
    expect(mockMarcaMethods.findMany).toHaveBeenCalledWith({
      where: {
        anuladoEn: null,
      },
      orderBy: {
        nombre: 'asc',
      },
      skip: 0,
      take: 10,
    });

    // Verificar que se llamó a count con los parámetros correctos
    expect(mockMarcaMethods.count).toHaveBeenCalledWith({
      where: {
        anuladoEn: null,
      },
    });

    // Verificar la respuesta exitosa
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual({
      ok: true,
      data: {
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            nombre: expect.any(String),
          })
        ]),
        total: 3,
        page: 1,
        pageSize: 10,
      },
      error: null,
    });
    
    // Verificar que se llamó a logSuccess con los parámetros correctos
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      module: 'listarMarcasPaginadas',
      action: 'listar_marcas_paginadas_exitoso',
      message: 'Listado de marcas paginado obtenido exitosamente',
      details: {
        totalRegistros: 3,
        paginaActual: 1,
        totalPaginas: 1,
        filtrosAplicados: {
          activo: null,
          busqueda: null
        }
      }
    });
    
    // Verificar que no se llamó a logError
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('debe filtrar marcas por texto de búsqueda', async () => {
    // Configurar parámetro de búsqueda
    mockRequest.query.searchText = 'buscar';

    // Ejecutar la función del controlador
    await listarMarcasPaginadas(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findMany con el filtro de búsqueda
    expect(mockMarcaMethods.findMany).toHaveBeenCalledWith({
      where: {
        anuladoEn: null,
        nombre: {
          contains: 'buscar',
          mode: 'insensitive',
        },
      },
      orderBy: {
        nombre: 'asc',
      },
      skip: 0,
      take: 10,
    });

    // Verificar que se llamó a logSuccess con el filtro de búsqueda
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      details: expect.objectContaining({
        filtrosAplicados: expect.objectContaining({
          busqueda: null // El controlador no actualiza este campo en los logs
        })
      })
    }));
    
    // Verificar que se usó el searchText en la consulta
    expect(mockMarcaMethods.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        nombre: expect.objectContaining({
          contains: 'buscar',
          mode: 'insensitive'
        })
      })
    }));
  });

  it('debe filtrar marcas por estado activo', async () => {
    // Configurar parámetro de estado activo
    mockRequest.query.activo = 'true';

    // Ejecutar la función del controlador
    await listarMarcasPaginadas(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findMany con el filtro de estado activo
    expect(mockMarcaMethods.findMany).toHaveBeenCalledWith({
      where: {
        anuladoEn: null,
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
      skip: 0,
      take: 10,
    });

    // Verificar que se llamó a logSuccess con el filtro de estado activo
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      details: expect.objectContaining({
        filtrosAplicados: expect.objectContaining({
          activo: true
        })
      })
    }));
  });

  it('debe manejar la paginación correctamente', async () => {
    // Configurar parámetros de paginación
    mockRequest.query.page = '2';
    mockRequest.query.pageSize = '2';

    // Configurar el mock para devolver menos resultados
    mockMarcaMethods.count.mockResolvedValue(5);
    mockMarcaMethods.findMany.mockResolvedValue([mockMarcaList[0], mockMarcaList[1]]);

    // Ejecutar la función del controlador
    await listarMarcasPaginadas(mockRequest as Request, mockResponse as Response);

    // Verificar que se aplicó el salto (skip) correcto
    expect(mockMarcaMethods.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 2, // (page - 1) * pageSize = (2 - 1) * 2 = 2
      take: 2,
    }));

    // Verificar la respuesta con la paginación correcta
    expect(responseObject).toEqual(expect.objectContaining({
      data: expect.objectContaining({
        page: 2,
        pageSize: 2,
        total: 5,
      })
    }));

    // Verificar que se calculó correctamente el total de páginas
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      details: expect.objectContaining({
        paginaActual: 2,
        totalPaginas: 3, // Math.ceil(5 / 2) = 3
      })
    }));
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para lanzar un error
    const errorMessage = 'Error inesperado';
    const testError = new Error(errorMessage);
    mockMarcaMethods.findMany.mockRejectedValue(testError);

    // Ejecutar la función del controlador
    await listarMarcasPaginadas(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 500
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Error interno del servidor al obtener el listado de marcas',
    });
    
    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      module: 'listarMarcasPaginadas',
      action: 'listar_marcas_paginadas',
      message: 'Error al obtener el listado paginado de marcas',
      error: testError,
      context: expect.objectContaining({
        pagina: '1',
        pageSize: '10',
        searchText: null,
        error: 'Error inesperado'
      })
    }));
    
    // Verificar que el stack está incluido en el contexto
    const logErrorCall = mockLogError.mock.calls[0][0];
    expect(logErrorCall.context.stack).toContain('Error: Error inesperado');
    
    // Verificar que no se llamó a logSuccess en caso de error
    expect(mockLogSuccess).not.toHaveBeenCalled();
  });
});
