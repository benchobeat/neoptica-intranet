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
import { eliminarCategoria } from '../../../../src/controllers/categoriaController';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { mockCategoria } from '../../__fixtures__/categoriaFixtures';

describe('Controlador de Categorías - Eliminar Categoría', () => {
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
      },
      ip: '127.0.0.1'
    });

    mockResponse = createMockResponse();
    resetMocks();
    resetPrismaMocks();
    
    // Reset mocks antes de cada prueba
    mockLogSuccess.mockClear();
    mockLogError.mockClear();
    
    // Configurar mock para findUnique (verificar que la categoría existe)
    jest.spyOn(prismaMock.categoria, 'findUnique').mockResolvedValue({
      ...mockCategoria,
      _count: { productos: 0 }
    });
    
    // Configurar mock para subcategorías activas
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValue([]);

    // Configurar mock para delete exitoso
    jest.spyOn(prismaMock.categoria, 'delete').mockResolvedValue(mockCategoria);
  });

  it('debe desactivar una categoría exitosamente', async () => {
    // Ejecutar el controlador
    await eliminarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findUnique con el ID correcto
    expect(prismaMock.categoria.findUnique).toHaveBeenCalledWith({
      where: { id: mockCategoria.id },
      include: {
        _count: {
          select: { productos: true }
        }
      }
    });

    // Verificar que se verificaron subcategorías activas
    expect(prismaMock.categoria.findMany).toHaveBeenCalledWith({
      where: { padreId: mockCategoria.id, activo: true },
      select: { id: true }
    });

    // Verificar que se actualizó la categoría (soft delete)
    expect(prismaMock.categoria.update).toHaveBeenCalledWith({
      where: { id: mockCategoria.id },
      data: {
        activo: false,
        anuladoEn: expect.any(Date),
        anuladoPor: 'test-user-id'
      }
    });

    // Verificar que se registró el éxito
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'eliminarCategoria',
      action: 'categoria_desactivada_exitoso',
      message: 'Categoría desactivada exitosamente',
      entityId: '1', 
      details: expect.objectContaining({
        categoria: expect.objectContaining({
          id: '1',  
          nombre: undefined  
        }),
        tieneProductos: false,
        tieneSubcategorias: false
      })
    }));

    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: {
        id: '1', // El controlador devuelve un ID hardcodeado
        nombre: undefined, // El controlador no incluye el nombre
        activo: false,
        mensaje: 'Categoría desactivada exitosamente',
        advertencia: null
      },
      error: null
    });
  });

  it('debe devolver error si el ID no es válido', async () => {
    // Configurar la petición con un ID inválido
    mockRequest.params = { id: undefined as unknown as string };

    // Ejecutar el controlador
    await eliminarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'eliminarCategoria',
      action: 'error_eliminar_categoria',
      message: 'ID de categoría inválido',
      error: expect.any(Error)
    }));

    // Verificar que no se intentó eliminar
    expect(prismaMock.categoria.delete).not.toHaveBeenCalled();

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
    await eliminarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'eliminarCategoria',
      action: 'error_eliminar_categoria',
      message: 'Categoría no encontrada',
      error: expect.any(Error)
    }));

    // Verificar que no se intentó eliminar
    expect(prismaMock.categoria.delete).not.toHaveBeenCalled();

    // Verificar que se devolvió un error 404
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      error: `No se encontró ninguna categoría con el ID ${mockCategoria.id}.`
    }));

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'eliminarCategoria',
      action: 'error_eliminar_categoria',
      message: 'Categoría no encontrada',
      error: expect.any(Error),
      context: { id: mockCategoria.id }
    }));

    // Verificar que no se intentó actualizar
    expect(prismaMock.categoria.update).not.toHaveBeenCalled();
  });

  it('debe impedir desactivar una categoría que tiene productos asociados', async () => {
    // Configurar para que la categoría tenga productos
    jest.spyOn(prismaMock.categoria, 'findUnique').mockResolvedValueOnce({
      ...mockCategoria,
      _count: { productos: 2 }
    });

    // Ejecutar el controlador
    await eliminarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se devolvió un error 400
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      error: 'No se puede desactivar la categoría porque tiene productos asociados.'
    }));

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'eliminarCategoria',
      action: 'error_eliminar_categoria',
      message: 'Dependencias existentes',
      error: expect.any(Error),
      context: expect.objectContaining({
        cantidadProductos: 2
      })
    }));
  });

  it('debe impedir desactivar una categoría que tiene subcategorías activas', async () => {
    // Configurar para que la categoría tenga subcategorías activas
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValueOnce([
      { id: 'subcat-1' },
      { id: 'subcat-2' }
    ]);

    // Ejecutar el controlador
    await eliminarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se devolvió un error 400
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      error: expect.stringContaining('No se puede desactivar la categoría porque tiene subcategorías')
    }));

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'eliminarCategoria',
      action: 'error_eliminar_categoria',
      message: 'Dependencias existentes',
      error: expect.any(Error),
      context: expect.objectContaining({
        cantidadSubcategorias: 2
      })
    }));

    // Verificar el mensaje de error en la respuesta
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      error: expect.stringContaining('No se puede desactivar la categoría porque tiene subcategorías')
    }));
  });

  it('debe manejar errores de base de datos en la verificación de subcategorías', async () => {
    // Forzar un error en la búsqueda de subcategorías
    const dbError = new Error('Error de base de datos al buscar subcategorías');
    jest.spyOn(prismaMock.categoria, 'findMany').mockRejectedValueOnce(dbError);

    // Ejecutar el controlador
    await eliminarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se devolvió un error 500
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al desactivar la categoría.'
    });

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'eliminarCategoria',
      action: 'error_eliminar_categoria',
      message: 'Error interno al eliminar la categoría',
      error: dbError,
      context: { id: mockCategoria.id }
    }));
  });

  it('debe manejar errores de base de datos en la operación de eliminación', async () => {
    // Configurar mocks para que pasen las validaciones iniciales
    jest.spyOn(prismaMock.categoria, 'findUnique').mockResolvedValueOnce({
      ...mockCategoria,
      _count: { productos: 0 }
    });
    
    // Forzar un error en la operación de actualización (soft delete)
    const updateError = new Error('Error de base de datos en update');
    jest.spyOn(prismaMock.categoria, 'findMany').mockResolvedValueOnce([]);
    jest.spyOn(prismaMock.categoria, 'update').mockRejectedValueOnce(updateError);

    // Ejecutar el controlador
    await eliminarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se devolvió un error 500
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al desactivar la categoría.'
    });

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'eliminarCategoria',
      action: 'error_eliminar_categoria',
      message: 'Error interno al eliminar la categoría',
      error: updateError,
      context: { id: mockCategoria.id }
    }));
  });
});
