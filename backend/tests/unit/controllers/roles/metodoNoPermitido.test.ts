import { Request, Response } from 'express';
import { metodoNoPermitido } from '../../../../src/controllers/rolesController';

// Mock del módulo de respuesta
jest.mock('../../../../src/utils/response', () => {
  const mockFail = jest.fn((message) => ({
    ok: false,
    data: null,
    error: message
  }));
  
  return {
    __esModule: true,
    fail: mockFail,
    default: { fail: mockFail },
    // Exportamos el mock para usarlo en las pruebas
    mockFail
  };
});

// Importamos el módulo después de definir el mock
import * as responseModule from '../../../../src/utils/response';

// Obtenemos el mockFail del módulo mockeado
const mockFail = (responseModule as any).mockFail;

describe('Controlador de Roles - Método No Permitido', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let responseObject: any;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockRequest = {
      method: 'POST', // Simulamos un método no permitido
      path: '/api/roles',
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

    // Limpiar los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('debe devolver un error 405 para métodos no permitidos', () => {
    // Configurar el mensaje de error esperado
    const errorMessage = 'Operación no permitida: los roles del sistema solo pueden ser consultados (solo lectura). Método no permitido.';
    
    // Ejecutar la función del controlador
    metodoNoPermitido(mockRequest as Request, mockResponse as Response);

    // Verificar que se devolvió el código de estado 405
    expect(mockStatus).toHaveBeenCalledWith(405);
    
    // Verificar que se llamó a fail con el mensaje correcto
    expect(mockFail).toHaveBeenCalledWith(errorMessage);
    
    // También podemos verificar que se llamó a la función fail del módulo
    expect(responseModule.fail).toHaveBeenCalledWith(errorMessage);
    
    // Verificar la respuesta
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: errorMessage
    });
  });

  it('debe mantener la estructura de respuesta estándar', () => {
    // Configurar el mensaje de error esperado
    const errorMessage = 'Operación no permitida: los roles del sistema solo pueden ser consultados (solo lectura). Método no permitido.';

    // Ejecutar la función del controlador
    metodoNoPermitido(mockRequest as Request, mockResponse as Response);
    
    // Verificar la estructura de la respuesta
    expect(responseObject).toHaveProperty('ok', false);
    expect(responseObject).toHaveProperty('data', null);
    expect(responseObject).toHaveProperty('error', errorMessage);
  });
});
