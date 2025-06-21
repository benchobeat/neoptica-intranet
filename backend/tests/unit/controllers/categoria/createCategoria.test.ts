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
const mockLogSuccess = jest.fn().mockImplementation(() => Promise.resolve());
const mockLogError = jest.fn().mockImplementation(() => Promise.resolve());

jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria,
  logSuccess: mockLogSuccess,
  logError: mockLogError
}));

// Mock de validación de URLs
const mockValidarIconoUrl = jest.fn().mockImplementation(() => null);
jest.mock('../../../../src/utils/validacions', () => ({
  validarIconoUrl: mockValidarIconoUrl
}));

// Importar el controlador después de los mocks
import { crearCategoria } from '../../../../src/controllers/categoriaController';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { validCategoriaData, invalidCategoriaData, mockCategoria, mockCategoriaInactiva } from '../../__fixtures__/categoriaFixtures';

describe('Controlador de Categorías - Crear Categoría', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    // Configuración inicial para cada prueba
    mockRequest = createMockRequest({
      body: { ...validCategoriaData },
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
  });

  it('debe crear una categoría exitosamente', async () => {
    // Configuración del mock para la prueba específica
    (prismaMock.categoria.findFirst as jest.Mock).mockImplementation(() => Promise.resolve(null));
    (prismaMock.categoria.create as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ...mockCategoria,
        ...validCategoriaData, // Sobrescribir con los datos de la categoría que se está creando
        id: mockCategoria.id // Mantener el ID del mock
      })
    );

    // Ejecuta el controlador
    await crearCategoria(mockRequest as Request, mockResponse as unknown as Response);

    // Verifica que se haya llamado a las funciones esperadas
    expect(prismaMock.categoria.findFirst).toHaveBeenCalled();
    expect(prismaMock.categoria.create).toHaveBeenCalled();
    
    // Verifica que se llamó a prisma.categoria.create con los valores por defecto correctos
    expect(prismaMock.categoria.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        activo: true, // Siempre true independientemente de la solicitud
      }),
      include: expect.anything()
    });
    
    // Verifica que se llamó a logSuccess con los parámetros correctos
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'crearCategoria',
      action: 'categoria_creada_exitoso',
      message: 'Categoría creada exitosamente',
      entityId: mockCategoria.id,
      details: expect.objectContaining({
        categoria: expect.objectContaining({
          id: mockCategoria.id,
          nombre: validCategoriaData.nombre
        })
      })
    });

    // Verifica la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.anything(),
        error: null
      })
    );
  });

  it('debe crear una categoría con valores predeterminados cuando falten campos opcionales', async () => {
    // Preparar solicitud con solo el campo obligatorio (nombre)
    mockRequest.body = { nombre: 'Lentes de Sol' };
    
    // Configurar mocks
    jest.spyOn(prismaMock.categoria, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prismaMock.categoria, 'create').mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440001',
      nombre: 'Lentes de Sol',
      descripcion: null,
      tipoCategoria: null,
      iconoUrl: null,
      orden: 0,
      activo: true,
      erpId: null,
      erpTipo: null,
      padreId: null,
      creadoEn: new Date(),
      creadoPor: 'test-user-id',
      modificadoEn: new Date(),
      modificadoPor: null,
      anuladoEn: null,
      anuladoPor: null
    });

    // Ejecutar el controlador
    await crearCategoria(mockRequest as Request, mockResponse as Response);
    
    // Verificar que se llamó a create con los valores por defecto correctos
    expect(prismaMock.categoria.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        nombre: 'Lentes de Sol',
        descripcion: null,
        tipoCategoria: null,
        iconoUrl: null,
        orden: 0,
        activo: true,
        creadoPor: 'test-user-id'
      })
    }));
    
    // Verificar respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.objectContaining({
        nombre: 'Lentes de Sol',
        activo: true
      })
    }));
  });

  it('debe reactivar una categoría inactiva cuando se intenta crear con el mismo nombre', async () => {
    // Configurar una categoría inactiva existente
    const categoriaInactiva = mockCategoriaInactiva;
    
    const categoriaReactivada = {
      ...categoriaInactiva,
      activo: true,
      descripcion: validCategoriaData.descripcion,
      tipoCategoria: validCategoriaData.tipoCategoria,
      iconoUrl: validCategoriaData.iconoUrl,
      orden: validCategoriaData.orden,
      modificadoPor: 'test-user-id',
      modificadoEn: expect.any(Date)
    };

    // Configurar mocks
    jest.spyOn(prismaMock.categoria, 'findFirst').mockResolvedValueOnce(categoriaInactiva);
    jest.spyOn(prismaMock.categoria, 'update').mockResolvedValueOnce(categoriaReactivada);

    // Configurar solicitud con datos válidos y mismo nombre que la categoría inactiva
    mockRequest.body = { 
      nombre: mockCategoriaInactiva.nombre,
      descripcion: validCategoriaData.descripcion,
      tipoCategoria: validCategoriaData.tipoCategoria,
      iconoUrl: validCategoriaData.iconoUrl,
      orden: validCategoriaData.orden
    };

    // Ejecutar la función del controlador
    await crearCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findFirst con los parámetros correctos
    expect(prismaMock.categoria.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        nombre: mockCategoriaInactiva.nombre,
      })
    }));

    // Verificar que se llamó a update para reactivar la categoría
    expect(prismaMock.categoria.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: categoriaInactiva.id },
      data: expect.objectContaining({
        activo: true,
        modificadoPor: 'test-user-id',
        modificadoEn: expect.any(Date)
      })
    }));

    // Verificar que no se intentó crear una nueva categoría
    expect(prismaMock.categoria.create).not.toHaveBeenCalled();

    // Verificar que se registró el éxito de la operación
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'crearCategoria',
      action: 'categoria_reactivada_exitoso',
      message: 'Categoría reactivada exitosamente'
    }));

    // Verificar la respuesta exitosa
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.anything(),
      error: null
    }));
  });

  it('debe devolver error si ya existe una categoría activa con el mismo nombre', async () => {
    // Configura el mock para simular que ya existe una categoría activa con el mismo nombre
    const categoriaActiva = {
      ...mockCategoria,
      activo: true
    };

    jest.spyOn(prismaMock.categoria, 'findFirst').mockResolvedValueOnce(categoriaActiva);
    
    // Configura el body de la request
    mockRequest.body = { ...validCategoriaData, nombre: mockCategoria.nombre };

    // Ejecuta el controlador
    await crearCategoria(mockRequest as Request, mockResponse as Response);

    // Verifica que se llamó a findFirst con los parámetros correctos
    expect(prismaMock.categoria.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        nombre: mockCategoria.nombre
      })
    }));

    // Verifica que no se intentó crear la categoría
    expect(prismaMock.categoria.create).not.toHaveBeenCalled();
    
    // Verifica que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'crearCategoria',
      action: 'error_crear_categoria',
      message: 'Ya existe una categoría activa con ese nombre',
      error: expect.any(Error)
    }));

    // Verifica la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ya existe una categoría activa con ese nombre.'
    });
  });

  it('debe validar que el nombre es requerido', async () => {
    // Configurar la petición sin nombre
    mockRequest.body = {
      ...mockRequest.body,
      nombre: undefined
    };

    // Ejecutar la función del controlador
    await crearCategoria(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre es obligatorio y debe ser una cadena de texto.'
    });
  });

  it('debe validar la longitud del nombre', async () => {
    // Configurar la petición con un nombre demasiado corto
    mockRequest.body = {
      ...mockRequest.body,
      nombre: 'A'
    };

    // Ejecutar la función del controlador
    await crearCategoria(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre debe tener entre 2 y 100 caracteres.'
    });
  });

  it('debe validar la URL del ícono', async () => {
    // Configurar mock de validación para que devuelva un error
    mockValidarIconoUrl.mockImplementation(() => 'Formato de URL de ícono inválido.');
    
    // Configurar la petición con URL de ícono inválida
    mockRequest.body = {
      ...mockRequest.body,
      iconoUrl: 'invalid-url'
    };

    // Ejecutar la función del controlador
    await crearCategoria(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar que se llamó al validador
    expect(mockValidarIconoUrl).toHaveBeenCalledWith('invalid-url');

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Formato de URL de ícono inválido.'
    });
  });

  it('debe validar que la categoría padre existe', async () => {
    // Configurar la petición con un ID de padre que no existe
    mockRequest.body = {
      ...mockRequest.body,
      padreId: 'id-inexistente'
    };

    // Configurar mocks
    jest.spyOn(prismaMock.categoria, 'findFirst').mockResolvedValueOnce(null);
    jest.spyOn(prismaMock.categoria, 'findUnique').mockResolvedValueOnce(null); // Padre no existe

    // Ejecutar la función del controlador
    await crearCategoria(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar que se intentó buscar la categoría padre
    expect(prismaMock.categoria.findUnique).toHaveBeenCalledWith({
      where: { id: 'id-inexistente' }
    });

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'La categoría padre especificada no existe.'
    });
  });

  it('debe manejar errores internos', async () => {
    // Simular un error interno
    jest.spyOn(prismaMock.categoria, 'findFirst').mockImplementation(() => {
      throw new Error('Error de base de datos');
    });

    // Ejecutar la función del controlador
    await crearCategoria(mockRequest as Request, mockResponse as Response);

    // Verificar que se registró el error
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'categoria',
      module: 'crearCategoria',
      action: 'error_crear_categoria',
      message: 'Error interno al crear la categoría',
      error: expect.any(Error)
    }));

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error al crear la categoría.'
    });
  });
});
