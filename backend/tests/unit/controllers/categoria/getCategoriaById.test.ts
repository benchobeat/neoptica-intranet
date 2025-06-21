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
import { obtenerCategoriaPorId } from '../../../../src/controllers/categoriaController';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { mockCategoria, mockCategoriaWithSubcategorias } from '../../__fixtures__/categoriaFixtures';

describe('Controlador de Categorías - Obtener Categoría por ID', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    // Configuración inicial para cada prueba
    mockRequest = createMockRequest({
      params: { id: mockCategoria.id },
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

  it('debe obtener una categoría por ID exitosamente', async () => {
    // Configurar mock para devolver la categoría con subcategorías
    const categoriaConSubcategorias = mockCategoriaWithSubcategorias;
    
    jest.spyOn(prismaMock.categoria, 'findUnique').mockResolvedValueOnce(categoriaConSubcategorias);

    // Ejecutar el controlador
    await obtenerCategoriaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findUnique con el ID correcto
    expect(prismaMock.categoria.findUnique).toHaveBeenCalledWith({
      where: { id: mockCategoria.id },
      include: expect.objectContaining({
        padre: expect.any(Object),
        subcategorias: expect.any(Object),
        _count: expect.any(Object)
      })
    });

    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: categoriaConSubcategorias,
      error: null
    });
  });

  it('debe devolver error si el ID no es válido', async () => {
    // Configurar la petición con un ID inválido
    mockRequest.params = { id: undefined as unknown as string };

    // Ejecutar el controlador
    await obtenerCategoriaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'obtenerCategoriaPorId',
      action: 'error_obtener_categoria',
      message: 'ID de categoría inválido',
      error: expect.any(Error)
    }));

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El ID de la categoría es requerido y debe ser válido.'
    });
  });

  it('debe devolver error 404 si la categoría no existe', async () => {
    // Configurar mock para devolver null (categoría no encontrada)
    jest.spyOn(prismaMock.categoria, 'findUnique').mockResolvedValueOnce(null);

    // Ejecutar el controlador
    await obtenerCategoriaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'obtenerCategoriaPorId',
      action: 'error_obtener_categoria',
      message: 'Categoría no encontrada',
      error: expect.any(Error)
    }));

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: `No se encontró ninguna categoría con el ID ${mockCategoria.id}.`
    });
  });

  it('debe manejar errores internos', async () => {
    // Forzar un error en la consulta
    jest.spyOn(prismaMock.categoria, 'findUnique').mockImplementation(() => {
      throw new Error('Error de base de datos');
    });

    // Ejecutar el controlador
    await obtenerCategoriaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'obtenerCategoriaPorId',
      action: 'error_obtener_categoria',
      message: 'Error al obtener la categoría',
      error: expect.any(Error)
    }));

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al obtener la información de la categoría.'
    });
  });
});
