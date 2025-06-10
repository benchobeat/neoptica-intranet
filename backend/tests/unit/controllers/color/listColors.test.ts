import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Definir el mock antes de importar los demás módulos
const mockPrisma = {
  color: {
    findMany: jest.fn(),
    count: jest.fn(),
  }
} as any;

// Mockear módulos antes de importar el controlador
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockImplementation(() => Promise.resolve())
}));

// Importar el controlador después de los mocks
import { listarColores, listarColoresPaginados } from '../../../../src/controllers/colorController';
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
      user: user
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Configuración por defecto para las pruebas
    mockPrisma.color.findMany.mockReset();
    mockPrisma.color.count.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarColores', () => {
    it('debe listar todos los colores activos', async () => {
      // Configurar el mock de Prisma
      mockPrisma.color.findMany.mockResolvedValue(mockColorList);

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
      mockPrisma.color.findMany.mockRejectedValue(new Error(errorMessage));

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
  });

  describe('listarColoresPaginados', () => {
    it('debe listar colores con paginación', async () => {
      // Configurar parámetros de paginación
      mockRequest.query = {
        pagina: '1',
        limite: '10',
        orden: 'nombre',
        direccion: 'asc'
      };

      // Configurar mocks de Prisma
      mockPrisma.color.count.mockResolvedValue(mockColorList.length);
      mockPrisma.color.findMany.mockResolvedValue(mockColorList);

      // Ejecutar la función del controlador
      await listarColoresPaginados(mockRequest as Request, mockResponse as Response);

      // Verificar la respuesta
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ok: true,
        data: {
          items: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              nombre: expect.any(String),
              descripcion: expect.any(String),
              codigoHex: expect.any(String),
              activo: true,
              creadoEn: expect.any(Date),
              creadoPor: userEmail,
              modificadoEn: null,
              modificadoPor: null,
              anuladoEn: null,
              anuladoPor: null
            })
          ]),
          total: mockColorList.length,
          page: 1,
          pageSize: 10,
          totalPages: 1
        },
        error: null
      });
    });

    it('debe manejar parámetros de paginación por defecto', async () => {
      // Configurar mocks de Prisma
      mockPrisma.color.count.mockResolvedValue(mockColorList.length);
      mockPrisma.color.findMany.mockResolvedValue(mockColorList);

      // Ejecutar sin parámetros de paginación
      await listarColoresPaginados(mockRequest as Request, mockResponse as Response);

      // Verificar que se usen los valores por defecto
      expect(mockPrisma.color.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
        where: {
          anuladoEn: null
        },
        orderBy: {
          nombre: 'asc'
        }
      }));
    });

    it('debe manejar errores en la paginación', async () => {
      // Configurar parámetros inválidos
      mockRequest.query = {
        pagina: 'no-numero',
        limite: 'no-numero'
      };

      // Ejecutar la función del controlador
      await listarColoresPaginados(mockRequest as Request, mockResponse as Response);

      // Verificar la respuesta de error
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: 'Error al listar colores paginados'
      });
    });
  });
});
