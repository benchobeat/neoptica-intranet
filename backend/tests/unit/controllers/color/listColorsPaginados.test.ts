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
import { listarColoresPaginados } from '../../../../src/controllers/colorController';
import { mockColorList } from '../../__fixtures__/colorFixtures';

// Definir el tipo de usuario esperado
interface User {
  id: string;
  email: string;
  nombreCompleto: string;
  roles?: string[]; // Propiedad opcional
}

describe('Controlador de Colores - Listar Colores Paginados', () => {
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

  it('debe listar colores con paginación', async () => {
    // Configurar parámetros de paginación
    mockRequest.query = {
      pagina: '1',
      limite: '10',
      orden: 'nombre',
      direccion: 'asc'
    };

    // Configurar mocks de Prisma
    prismaMock.color.count.mockResolvedValue(mockColorList.length);
    prismaMock.color.findMany.mockResolvedValue(mockColorList);

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
    prismaMock.color.count.mockResolvedValue(mockColorList.length);
    prismaMock.color.findMany.mockResolvedValue(mockColorList);

    // Ejecutar sin parámetros de paginación
    await listarColoresPaginados(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findMany con los parámetros correctos
    expect(prismaMock.color.findMany).toHaveBeenCalledWith({
      where: { anuladoEn: null },
      orderBy: { nombre: 'asc' },
      skip: 0,
      take: 10
    });
    
    // Verificar que se llamó a logSuccess con los parámetros correctos
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'color',
      entityId: null,
      module: 'listarColoresPaginados',
      action: 'listar_colores_paginados_exitoso',
      message: 'Listado paginado de colores obtenido exitosamente',
      details: {
        total: mockColorList.length,
        pagina: 1,
        porPagina: 10,
        totalPaginas: 1,
        filtros: {
          activo: undefined,
          busqueda: null
        }
      }
    });

    // Verificar que se usen los valores por defecto
    expect(prismaMock.color.findMany).toHaveBeenCalledWith({
      where: { anuladoEn: null },
      orderBy: { nombre: 'asc' },
      skip: 0,
      take: 10
    });
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
