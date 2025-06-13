// Definir los mocks primero
const mockRolMethods = {
  findMany: jest.fn(),
};

const mockRegistrarAuditoria = jest.fn().mockResolvedValue(undefined);

// Configurar los mocks antes de importar los módulos que los usan
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    rol: mockRolMethods,
    $disconnect: jest.fn(),
  })),
  Rol: {},
}));

// Mock de la función success y fail
const mockSuccess = jest.fn((data) => ({ success: true, data }));
const mockFail = jest.fn((message) => ({ success: false, message }));

// Mock de los módulos necesarios
jest.mock('../../../../src/utils/response', () => ({
  success: mockSuccess,
  fail: mockFail,
}));

jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: (...args: any[]) => mockRegistrarAuditoria(...args),
}));

// Importar después de configurar los mocks
import { Request, Response } from 'express';
import { listarRoles } from '../../../../src/controllers/rolesController';
import { mockRolesList } from '../../__fixtures__/rolesFixtures';

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

describe('Controlador de Roles - Listar Roles', () => {
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
    mockRolMethods.findMany.mockResolvedValue(mockRolesList);
  });

  it('debe listar todos los roles', async () => {
    // Configurar el mock para devolver la lista de roles
    mockRolMethods.findMany.mockResolvedValueOnce(mockRolesList);

    // Ejecutar la función del controlador
    await listarRoles(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findMany sin filtros
    expect(mockRolMethods.findMany).toHaveBeenCalledTimes(1);
    
    // Verificar que se llamó a success con los datos correctos
    expect(mockSuccess).toHaveBeenCalledWith(mockRolesList);
    
    // Verificar que se envió la respuesta correcta
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: mockRolesList
    }));
  });

  it('debe manejar errores correctamente', async () => {
    // Simular un error en la base de datos
    const errorMessage = 'Error de base de datos';
    const error = new Error(errorMessage);
    mockRolMethods.findMany.mockRejectedValueOnce(error);

    // Ejecutar la función del controlador
    await listarRoles(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a fail con el mensaje de error
    expect(mockFail).toHaveBeenCalledWith(errorMessage);
    
    // Verificar que se envió la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: errorMessage
    }));
  });

  // Nota: Este controlador no implementa auditoría, a diferencia de otros controladores
  // Se mantiene el test para verificar que no se registre auditoría
  it('no debe registrar auditoría ya que no está implementada en el controlador', async () => {
    // Configurar el mock para devolver la lista de roles
    mockRolMethods.findMany.mockResolvedValueOnce(mockRolesList);
    
    // Resetear el mock de registrarAuditoria
    mockRegistrarAuditoria.mockClear();

    // Ejecutar la función del controlador
    await listarRoles(mockRequest as Request, mockResponse as Response);

    // Verificar que NO se registró auditoría
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });
});
