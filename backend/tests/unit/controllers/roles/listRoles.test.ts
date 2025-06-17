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

// Mocks para las funciones de auditoría
const mockLogSuccess = jest.fn().mockResolvedValue(undefined);
const mockLogError = jest.fn().mockResolvedValue(undefined);

// Mock completo del módulo de auditoría
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
  logSuccess: mockLogSuccess,
  logError: mockLogError,
  // Otras funciones que puedan ser necesarias
  obtenerRegistrosAuditoria: jest.fn(),
  limpiarRegistrosAntiguos: jest.fn(),
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
  it('debe registrar auditoría exitosa al listar roles', async () => {
    // Configurar el mock para devolver la lista de roles
    mockRolMethods.findMany.mockResolvedValueOnce(mockRolesList);
    
    // Resetear los mocks
    mockLogSuccess.mockClear();
    mockLogError.mockClear();

    // Ejecutar la función del controlador
    await listarRoles(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a logSuccess con los parámetros correctos
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'rol',
      module: 'roles',
      action: 'listar_roles',
      message: 'Roles listados exitosamente',
      details: expect.objectContaining({
        roles: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            nombre: expect.any(String),
            descripcion: expect.any(String)
          })
        ])
      })
    });
    
    // Verificar que no se llamó a logError
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('debe registrar error de auditoría cuando falla la consulta', async () => {
    // Simular un error en la base de datos
    const errorMessage = 'Error de base de datos';
    const error = new Error(errorMessage);
    mockRolMethods.findMany.mockRejectedValueOnce(error);
    
    // Resetear los mocks
    mockLogSuccess.mockClear();
    mockLogError.mockClear();

    // Ejecutar la función del controlador
    await listarRoles(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'rol',
      module: 'listarRoles',
      action: 'listar_roles',
      message: 'Error al listar roles',
      error: errorMessage,
      context: expect.any(Object)
    });
    
    // Verificar que no se llamó a logSuccess
    expect(mockLogSuccess).not.toHaveBeenCalled();

    // Verificar que NO se registró auditoría
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
  });
});
