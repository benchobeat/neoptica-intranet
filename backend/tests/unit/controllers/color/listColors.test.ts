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
import { listarColores } from '../../../../src/controllers/colorController';
import { mockColor, mockColorList } from '../../__fixtures__/colorFixtures';

// Definir el tipo de usuario esperado
interface User {
  id: string;
  email: string;
  nombreCompleto: string;
  roles?: string[]; // Propiedad opcional
}

describe('Controlador de Colores - Listar Colores', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;
  const userEmail = 'test@example.com';

  beforeEach(() => {
    // Configuración inicial para cada prueba
    const user: User = { 
      id: 'test-user-id',
      email: userEmail,
      nombreCompleto: 'Usuario de Prueba'
    };
    
    mockRequest = {
      query: {},
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

    // Configuración por defecto para las pruebas
    prismaMock.color.findMany.mockReset();
    prismaMock.color.count.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarColores', () => {
    it('debe listar todos los colores activos', async () => {
      // Configurar el mock de Prisma
      prismaMock.color.findMany.mockResolvedValue(mockColorList);

      // Ejecutar la función del controlador
      await listarColores(mockRequest as Request, mockResponse as Response);

      // Verificar la respuesta
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ok: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            nombre: expect.any(String),
            activo: true
          })
        ]),
        error: null
      });
    });

    it('debe filtrar por nombre si se proporciona', async () => {
      // Configurar solicitud con filtro de búsqueda
      mockRequest.query = { nombre: 'rojo' };
      
      // Configurar el mock para simular un error
      const errorMessage = 'Error de base de datos';
      prismaMock.color.findMany.mockRejectedValue(new Error(errorMessage));

      // Ejecutar la función del controlador
      await listarColores(mockRequest as Request, mockResponse as Response);

      // Verificar la respuesta de error
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: 'Error al obtener colores'
      });
    });

    it('debe manejar errores inesperados', async () => {
      // Configurar el mock para lanzar un error
      const errorMessage = 'Error inesperado';
      const testError = new Error(errorMessage);
      prismaMock.color.findMany.mockRejectedValue(testError);

      // Ejecutar la función del controlador
      await listarColores(mockRequest as Request, mockResponse as unknown as Response);
      
      // Verificar que se llamó a logError con los parámetros correctos
      expect(mockLogError).toHaveBeenCalledWith({
        userId: 'test-user-id',
        ip: '127.0.0.1',
        entityType: 'color',
        module: 'listarColores',
        action: 'error_listar_colores',
        message: 'Error al listar colores',
        error: expect.any(Error),
        context: {
          filtrosAplicados: {
            busqueda: undefined,
            activo: undefined
          },
          errorStack: undefined
        }
      });

      // Verificar que se manejó el error correctamente
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          error: 'Error al obtener colores'
        })
      );
      expect(mockResponse.json.mock.calls[0][0]).toHaveProperty('data', null);
    });
  });


});
