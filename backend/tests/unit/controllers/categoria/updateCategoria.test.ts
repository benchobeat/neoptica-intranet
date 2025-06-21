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

// Mock de validación de URLs
const mockValidarIconoUrl = jest.fn().mockImplementation(() => null);
jest.mock('../../../../src/utils/validacions', () => ({
  validarIconoUrl: mockValidarIconoUrl
}));

// Importar el controlador después de los mocks
import { actualizarCategoria } from '../../../../src/controllers/categoriaController';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { mockCategoria, validCategoriaData } from '../../__fixtures__/categoriaFixtures';

describe('Controlador de Categorías - Actualizar Categoría', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    // Configuración inicial para cada prueba
    mockRequest = createMockRequest({
      params: { id: mockCategoria.id },
      body: { nombre: 'Lentes de Sol Actualizados' },
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
    mockValidarIconoUrl.mockImplementation(() => null); // No error by default
    
    // Configurar mock para findUnique (verificar que la categoría existe)
    jest.spyOn(prismaMock.categoria, 'findUnique').mockResolvedValue({
      ...mockCategoria
    });
  });

  it('debe actualizar una categoría exitosamente', async () => {
    // Datos de actualización
    const datosActualizacion = {
      nombre: 'Lentes de Sol Actualizados',
      descripcion: 'Descripción actualizada',
      orden: 2
    };
    mockRequest.body = datosActualizacion;

    // Mock de la categoría actualizada
    const categoriaActualizada = {
      ...mockCategoria,
      ...datosActualizacion,
      modificadoEn: new Date(),
      modificadoPor: 'test-user-id'
    };
    
    // Configurar mock para update
    jest.spyOn(prismaMock.categoria, 'update').mockResolvedValueOnce(categoriaActualizada);

    // Ejecutar el controlador
    await actualizarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findUnique con el ID correcto
    expect(prismaMock.categoria.findUnique).toHaveBeenCalledWith({
      where: { id: mockCategoria.id }
    });

    // Verificar que se llamó a update con los datos correctos
    expect(prismaMock.categoria.update).toHaveBeenCalledWith({
      where: { id: mockCategoria.id },
      data: expect.objectContaining({
        nombre: 'Lentes de Sol Actualizados',
        descripcion: 'Descripción actualizada',
        orden: 2,
        modificadoPor: 'test-user-id',
        modificadoEn: expect.any(Date)
      }),
      include: expect.any(Object)
    });

    // Verificar que se registró el éxito
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      entityId: mockCategoria.id,
      module: 'actualizarCategoria',
      action: 'categoria_actualizada_exitoso',
      message: 'Categoría actualizada exitosamente',
      details: expect.objectContaining({
        categoria: expect.any(Object),
        camposActualizados: Object.keys(datosActualizacion)
      })
    }));

    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: categoriaActualizada,
      error: null
    });
  });

  it('debe devolver error si el ID no es válido', async () => {
    // Configurar la petición con un ID inválido
    mockRequest.params = { id: undefined as unknown as string };

    // Ejecutar el controlador
    await actualizarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'actualizarCategoria',
      action: 'error_actualizar_categoria',
      message: 'ID de categoría inválido',
      error: expect.any(Error)
    }));

    // Verificar que no se intentó actualizar
    expect(prismaMock.categoria.update).not.toHaveBeenCalled();

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
    await actualizarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'actualizarCategoria',
      action: 'error_actualizar_categoria',
      message: 'Categoría no encontrada',
      error: expect.any(Error)
    }));

    // Verificar que no se intentó actualizar
    expect(prismaMock.categoria.update).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: `No se encontró ninguna categoría con el ID ${mockCategoria.id}.`
    });
  });

  it('debe validar que el nombre sea una cadena de texto válida', async () => {
    // Configurar la petición con un nombre inválido
    mockRequest.body = {
      nombre: ''
    };

    // Ejecutar el controlador
    await actualizarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'actualizarCategoria',
      action: 'error_actualizar_categoria',
      message: 'Nombre de categoría inválido',
      error: expect.any(Error)
    }));

    // Verificar que no se intentó actualizar
    expect(prismaMock.categoria.update).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre debe ser una cadena de texto válida.'
    });
  });

  it('debe validar la longitud del nombre', async () => {
    // Configurar la petición con un nombre demasiado corto
    mockRequest.body = {
      nombre: 'A'
    };

    // Ejecutar el controlador
    await actualizarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'actualizarCategoria',
      action: 'error_actualizar_categoria',
      message: 'Longitud de nombre inválida',
      error: expect.any(Error)
    }));

    // Verificar que no se intentó actualizar
    expect(prismaMock.categoria.update).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre debe tener entre 2 y 100 caracteres.'
    });
  });

  it('debe validar que no exista otra categoría con el mismo nombre', async () => {
    // Mock de una categoría existente con el mismo nombre
    const otraCategoria = {
      ...mockCategoria,
      id: 'otro-id',
      nombre: 'Nombre duplicado'
    };

    // Configurar la petición con un nombre que ya existe
    mockRequest.body = {
      nombre: 'Nombre duplicado'
    };

    // Configurar mock para findFirst (encontrar nombre duplicado)
    jest.spyOn(prismaMock.categoria, 'findFirst').mockResolvedValueOnce(otraCategoria);

    // Ejecutar el controlador
    await actualizarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findFirst para buscar duplicados
    expect(prismaMock.categoria.findFirst).toHaveBeenCalledWith({
      where: {
        nombre: 'Nombre duplicado',
        NOT: { id: mockCategoria.id }
      }
    });

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'actualizarCategoria',
      action: 'error_actualizar_categoria',
      message: 'Nombre duplicado',
      error: expect.any(Error)
    }));

    // Verificar que no se intentó actualizar
    expect(prismaMock.categoria.update).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ya existe otra categoría con ese nombre.'
    });
  });

  it('debe validar que la categoría padre existe', async () => {
    // Configurar la petición con un ID de padre que no existe
    mockRequest.body = {
      padreId: 'id-inexistente'
    };

    // Configurar mock para findUnique (padre no existe)
    jest.spyOn(prismaMock.categoria, 'findUnique')
      .mockResolvedValueOnce(mockCategoria) // Primera llamada para verificar que la categoría existe
      .mockResolvedValueOnce(null); // Segunda llamada para verificar el padre

    // Ejecutar el controlador
    await actualizarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se intentó buscar la categoría padre
    expect(prismaMock.categoria.findUnique).toHaveBeenCalledWith({
      where: { id: 'id-inexistente' }
    });

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'actualizarCategoria',
      action: 'error_actualizar_categoria',
      message: 'Categoría padre no existente',
      error: expect.any(Error)
    }));

    // Verificar que no se intentó actualizar
    expect(prismaMock.categoria.update).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'La categoría padre especificada no existe.'
    });
  });

  it('debe validar que una categoría no puede ser padre de sí misma', async () => {
    // Configurar la petición con el mismo ID como padreId
    mockRequest.body = {
      padreId: mockCategoria.id
    };

    // Ejecutar el controlador
    await actualizarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'actualizarCategoria',
      action: 'error_actualizar_categoria',
      message: 'Auto-referencia inválida',
      error: expect.any(Error)
    }));

    // Verificar que no se intentó actualizar
    expect(prismaMock.categoria.update).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Una categoría no puede ser padre de sí misma.'
    });
  });

  it('debe validar la URL del ícono', async () => {
    // Configurar mock de validación para que devuelva un error
    mockValidarIconoUrl.mockImplementation(() => 'Formato de URL de ícono inválido.');
    
    // Configurar la petición con URL de ícono inválida
    mockRequest.body = {
      iconoUrl: 'invalid-url'
    };

    // Ejecutar el controlador
    await actualizarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó al validador
    expect(mockValidarIconoUrl).toHaveBeenCalledWith('invalid-url');

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'actualizarCategoria',
      action: 'error_actualizar_categoria',
      message: 'URL de ícono inválida',
      error: expect.any(Error)
    }));

    // Verificar que no se intentó actualizar
    expect(prismaMock.categoria.update).not.toHaveBeenCalled();

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Formato de URL de ícono inválido.'
    });
  });

  it('debe manejar errores internos', async () => {
    // Forzar un error en la consulta
    jest.spyOn(prismaMock.categoria, 'findUnique').mockImplementation(() => {
      throw new Error('Error de base de datos');
    });

    // Ejecutar el controlador
    await actualizarCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'actualizarCategoria',
      action: 'error_actualizar_categoria',
      message: 'Error interno al actualizar la categoría',
      error: expect.any(Error)
    }));

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al actualizar la categoría.'
    });
  });
});
