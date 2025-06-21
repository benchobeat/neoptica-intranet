import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Importar prismaMock directamente del mock
const { prismaMock, resetPrismaMocks } = require('../../__mocks__/prisma');

// Mockear módulos antes de importar el controlador
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock)
}));

// Mock de auditoría
const mockLogSuccess = jest.fn().mockImplementation(() => Promise.resolve());
const mockLogError = jest.fn().mockImplementation(() => Promise.resolve());

jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: mockLogSuccess,
  logError: mockLogError
}));

// Importar el controlador después de los mocks
import { listarCategorias } from '../../../../src/controllers/categoriaController';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { mockCategoriaList, mockCategoria, mockCategoriaWithParentExtended, mockCategoriaWithSubcategorias } from '../../__fixtures__/categoriaFixtures';

describe('Controlador de Categorías - Listar Categorías', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    // Configuración inicial para cada prueba
    mockRequest = createMockRequest({
      query: {},
      user: { 
        id: 'test-user-id',
        nombreCompleto: 'Usuario Administrador',
        email: 'admin@example.com',
        roles: ['ADMIN']
      } as any, // Usamos type assertion para evitar el error de tipo
      ip: '127.0.0.1'
    });

    mockResponse = createMockResponse();
    resetMocks();
    resetPrismaMocks();
    
    // Reset mocks antes de cada prueba
    mockLogSuccess.mockClear();
    mockLogError.mockClear();
  });

  it('debe listar todas las categorías con estructura jerárquica', async () => {
    // Preparar datos de prueba para simular una estructura jerárquica
    const categoriaRaiz = { ...mockCategoria };
    const subcategoria = { ...mockCategoriaWithParentExtended };
    const categoriasLista = [categoriaRaiz, subcategoria];

    // Configurar mock
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValueOnce(categoriasLista);
    
    // Ejecutar el controlador
    await listarCategorias(mockRequest as Request, mockResponse as Response);

    // Verificar que se llama a findMany con los filtros correctos
    expect(prismaMock.categoria.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { padreId: null }, // Debería buscar categorías de primer nivel por defecto
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ],
      include: {
        padre: {
          select: {
            id: true,
            nombre: true
          }
        },
        _count: {
          select: {
            productos: true,
            subcategorias: true
          }
        }
      }
    }));

    // Verificar que se registró la operación exitosa
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'listarCategorias',
      action: 'categorias_listadas_exitoso',
      message: 'Listado de categorías obtenido exitosamente',
      details: expect.objectContaining({
        categorias: expect.objectContaining({
          count: 2
        })
      })
    }));

    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.any(Array),
      error: null
    }));
  });

  it('debe filtrar categorías por estado activo', async () => {
    // Configurar la consulta con filtro de activo
    mockRequest.query = { activo: 'true' };

    // Preparar datos que serían devueltos por el mock
    const categoriasActivas = mockCategoriaList.filter(cat => cat.activo);
    
    // Configurar mock
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValueOnce(categoriasActivas);

    // Ejecutar el controlador
    await listarCategorias(mockRequest as Request, mockResponse as Response);

    // Verificar que se llama a findMany con el filtro activo y padreId: null
    expect(prismaMock.categoria.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { 
        activo: true,
        padreId: null // Debería mantener el filtro de categorías de primer nivel
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ]
    }));

    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true
    }));
  });

  it('debe filtrar categorías por tipo específico', async () => {
    // Configurar la consulta con filtro de tipo
    mockRequest.query = { tipoCategoria: 'LENTE' };

    // Preparar datos que serían devueltos por el mock
    const categoriasLente = mockCategoriaList.filter(cat => cat.tipoCategoria === 'LENTE');
    
    // Configurar mock
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValueOnce(categoriasLente);

    // Ejecutar el controlador
    await listarCategorias(mockRequest as Request, mockResponse as Response);

    // Verificar que se llama a findMany con el filtro de tipo y padreId: null
    expect(prismaMock.categoria.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { 
        tipoCategoria: 'LENTE',
        padreId: null // Debería mantener el filtro de categorías de primer nivel
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ]
    }));

    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      details: expect.objectContaining({
        categorias: {
          count: expect.any(Number),
          query: { tipoCategoria: 'LENTE' }
        }
      })
    }));
  });

  it('debe filtrar subcategorías por padreId', async () => {
    // ID de una categoría padre
    const padreId = mockCategoria.id;
    mockRequest.query = { padreId };

    // Preparar datos que serían devueltos por el mock (subcategorías)
    const subcategorias = [mockCategoriaWithParentExtended];
    
    // Configurar mock
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValueOnce(subcategorias);

    // Ejecutar el controlador
    await listarCategorias(mockRequest as Request, mockResponse as Response);

    // Verificar que se llama a findMany con el filtro de padreId y ordenación
    expect(prismaMock.categoria.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { 
        padreId: String(padreId) // El controlador convierte el padreId a String
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ],
      include: expect.objectContaining({
        padre: {
          select: {
            id: true,
            nombre: true
          }
        },
        _count: {
          select: {
            productos: true,
            subcategorias: true
          }
        }
      })
    }));

    // Verificar que se devuelven las subcategorías directamente (sin estructura de árbol)
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      data: subcategorias
    }));
  });

  it('debe filtrar solo categorías de primer nivel cuando incluirSubcategorias=false', async () => {
    // Configurar para obtener solo categorías raíz
    mockRequest.query = { incluirSubcategorias: 'false' };

    // Solo categorías sin padre
    const categoriasRaiz = mockCategoriaList.filter(cat => !cat.padreId);
    
    // Configurar mock
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValueOnce(categoriasRaiz);

    // Ejecutar el controlador
    await listarCategorias(mockRequest as Request, mockResponse as Response);

    // Verificar que se llama a findMany con el filtro de padreId=null y ordenación
    expect(prismaMock.categoria.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { 
        padreId: null 
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ],
      include: expect.objectContaining({
        padre: {
          select: {
            id: true,
            nombre: true
          }
        },
        _count: {
          select: {
            productos: true,
            subcategorias: true
          }
        }
      })
    }));

    // Verificar la respuesta
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.any(Array)
    }));
  });

  it('debe manejar errores internos', async () => {
    // Forzar un error en la consulta
    jest.spyOn(prismaMock.categoria, 'findMany').mockImplementation(() => {
      throw new Error('Error de base de datos');
    });

    // Ejecutar el controlador
    await listarCategorias(mockRequest as Request, mockResponse as Response);

    // Verificar que se registra el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'listarCategorias',
      action: 'error_listar_categorias',
      message: 'Error al listar categorías',
      error: expect.any(Error),
      context: expect.anything()
    }));
    
    // Verificar respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      data: null,
      error: 'Error al obtener la lista de categorías.'
    }));
  });

  it('debe construir correctamente la estructura jerárquica', async () => {
    // Configurar mock para devolver categorías con estructura jerárquica
    const categoriasJerarquicas = [
      { ...mockCategoria, id: '1', nombre: 'Raíz 1', padreId: null },
      { ...mockCategoria, id: '2', nombre: 'Hijo 1.1', padreId: '1' },
      { ...mockCategoria, id: '3', nombre: 'Hijo 1.2', padreId: '1' },
      { ...mockCategoria, id: '4', nombre: 'Raíz 2', padreId: null }
    ];
    
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValueOnce(categoriasJerarquicas);

    // Ejecutar el controlador
    await listarCategorias(mockRequest as Request, mockResponse as Response);

    // Verificar que se llama a findMany con los parámetros correctos
    expect(prismaMock.categoria.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { padreId: null },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ]
    }));

    // Verificar la estructura jerárquica en la respuesta
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          nombre: 'Raíz 1',
          subcategorias: expect.arrayContaining([
            expect.objectContaining({ id: '2', nombre: 'Hijo 1.1' }),
            expect.objectContaining({ id: '3', nombre: 'Hijo 1.2' })
          ])
        }),
        expect.objectContaining({
          id: '4',
          nombre: 'Raíz 2',
          subcategorias: []
        })
      ]),
      error: null
    }));
  });

  it('debe incluir subcategorias cuando se solicita explícitamente', async () => {
    // Configurar mock
    mockRequest.query = { incluirSubcategorias: 'true' };
    
    const categoriasConSubcategorias = [
      { ...mockCategoria, id: '1', nombre: 'Raíz', padreId: null },
      { ...mockCategoria, id: '2', nombre: 'Subcategoría', padreId: '1' }
    ];
    
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValueOnce(categoriasConSubcategorias);

    // Ejecutar el controlador
    await listarCategorias(mockRequest as Request, mockResponse as Response);

    // Verificar que se llama a findMany sin filtrar por padreId
    expect(prismaMock.categoria.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {}, // No debe haber filtro de padreId
      include: expect.objectContaining({
        _count: {
          select: {
            productos: true,
            subcategorias: true
          }
        }
      })
    }));

    // Verificar que la respuesta incluye la estructura jerárquica
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          nombre: 'Raíz',
          subcategorias: expect.arrayContaining([
            expect.objectContaining({ id: '2', nombre: 'Subcategoría' })
          ])
        })
      ])
    }));
  });

  it('debe registrar correctamente la auditoría en caso de éxito', async () => {
    // Configurar mock
    const categorias = [mockCategoria];
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValueOnce(categorias);

    // Ejecutar el controlador
    await listarCategorias(mockRequest as Request, mockResponse as Response);

    // Verificar que se registra el éxito en la auditoría
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'listarCategorias',
      action: 'categorias_listadas_exitoso',
      message: 'Listado de categorías obtenido exitosamente',
      details: expect.objectContaining({
        categorias: {
          count: 1,
          query: {}
        }
      })
    }));
  });
});
