import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Importar prismaMock directamente
const { prismaMock, resetPrismaMocks } = require('../../__mocks__/prisma');
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';

// Mockear módulos antes de importar el controlador
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock)
}));

// Mock de funciones de auditoría
const mockLogSuccess = jest.fn().mockImplementation(() => Promise.resolve());
const mockLogError = jest.fn().mockImplementation(() => Promise.resolve());

// Mock del módulo de auditoría
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: mockLogSuccess,
  logError: mockLogError
}));

// Importar el controlador después de los mocks
import { crearMarca } from '../../../../src/controllers/marcaController';
import { mockMarca, mockMarcaInactiva, createMarcaData as originalCreateMarcaData } from '../../__fixtures__/marcaFixtures';

describe('Controlador de Marcas - Crear Marca', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  // Cree una version segura de los datos sin el campo activo
  const createMarcaData = {
    nombre: originalCreateMarcaData.nombre,
    descripcion: originalCreateMarcaData.descripcion
  };
  
  beforeEach(() => {
    mockRequest = createMockRequest({
      body: {...createMarcaData},
      user: { 
        id: 'test-user-id',
        email: 'test@example.com',
        nombreCompleto: 'Usuario Test',
        roles: ['admin'] 
      }
    });

    mockResponse = createMockResponse();
    
    // Resetear todos los mocks antes de cada prueba
    resetMocks();
    prismaMock.marca.findFirst.mockResolvedValue(null);
    // Configurar el mock para devolver una respuesta similar a la del controlador
    prismaMock.marca.create.mockImplementation(({ data }) => {
      return Promise.resolve({
        ...mockMarca,
        id: 'nuevo-id-generado',
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: true, // Siempre true
        creadoPor: data.creadoPor,
        creadoEn: data.creadoEn,
        anuladoEn: null,
        anuladoPor: null,
        modificadoEn: null,
        modificadoPor: null,
      });
    });
  });

  it('debe rechazar la solicitud cuando se intenta modificar el campo activo', async () => {
    // Arrange - añadir campo activo a la solicitud
    mockRequest.body = { ...mockRequest.body, activo: false };

    // Act
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'No está permitido modificar el campo activo.',
    });

    // Verificar que se llamó a logError
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'error_crear_marca',
        entityType: 'marca',
        module: 'crearMarca',
        message: 'Error al crear la marca',
        error: 'No está permitido modificar el campo activo. 400',
        context: expect.objectContaining({
          nombre: mockRequest.body.nombre,
          descripcion: mockRequest.body.descripcion
        })
      })
    );
  });

  it('debe crear una nueva marca exitosamente', async () => {
    // Act
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: expect.objectContaining({
        id: expect.any(String),
        nombre: createMarcaData.nombre,
        descripcion: createMarcaData.descripcion,
        activo: true,
      }),
      error: null,
    });

    // Verificar que se llamó a logSuccess
    expect(mockLogSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'crear_marca_exitoso',
        entityType: 'marca',
        module: 'crearMarca',
        message: 'Marca creada exitosamente',
        details: expect.objectContaining({
          nombre: createMarcaData.nombre,
          descripcion: createMarcaData.descripcion,
          activo: true
        }),
        entityId: expect.any(String),
        ip: expect.any(String),
        userId: mockRequest.user?.id
      })
    );
  });

  it('debe validar que el nombre sea obligatorio', async () => {
    // Arrange
    mockRequest.body = { ...createMarcaData, nombre: '' };

    // Act
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      error: 'El nombre es obligatorio y debe ser una cadena de texto.',
    }));

    // Verificar que se llamó a logError
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'error_crear_marca',
        entityType: 'marca',
        module: 'crearMarca',
        message: 'Error al crear la marca',
        error: 'El nombre es obligatorio y debe ser una cadena de texto. 400',
        context: expect.objectContaining({
          nombre: ''
        })
      })
    );
  });

  it('debe validar la longitud mínima del nombre', async () => {
    // Arrange
    const invalidName = 'a';
    mockRequest.body = { nombre: invalidName, descripcion: createMarcaData.descripcion };

    // Act
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre debe tener entre 2 y 100 caracteres.',
    });

    // Verificar que se llamó a logError
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'error_crear_marca',
        entityType: 'marca',
        module: 'crearMarca',
        message: 'Error al crear la marca',
        error: 'El nombre debe tener entre 2 y 100 caracteres. 400',
        context: expect.objectContaining({
          nombre: invalidName
        })
      })
    );
  });

  it('debe validar caracteres permitidos en el nombre', async () => {
    // Arrange
    const invalidName = 'Marca#123'; // Carácter # no permitido
    mockRequest.body = { nombre: invalidName, descripcion: createMarcaData.descripcion };

    // Act
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre contiene caracteres no permitidos.',
    });

    // Verificar que se llamó a logError
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'error_crear_marca',
        entityType: 'marca',
        module: 'crearMarca',
        message: 'Error al crear la marca',
        error: 'El nombre contiene caracteres no permitidos. 400',
        context: expect.objectContaining({
          nombre: invalidName
        })
      })
    );
  });

  it('debe validar que no exista otra marca activa con el mismo nombre', async () => {
    // Configurar el mock para simular que ya existe una marca activa con el mismo nombre
    const existingMarca = {
      ...mockMarca,
      nombre: createMarcaData.nombre.toUpperCase(), // Para probar case-insensitive
    };
    prismaMock.marca.findFirst.mockResolvedValue(existingMarca);

    // Act
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ya existe una marca con ese nombre.',
    });

    // Verificar que se llamó a logError
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'error_crear_marca',
        entityType: 'marca',
        module: 'crearMarca',
        message: 'Error al crear la marca',
        error: 'Ya existe una marca activa con ese nombre. 409',
        context: expect.objectContaining({
          nombre: createMarcaData.nombre,
          descripcion: createMarcaData.descripcion
        })
      })
    );
  });

  it('debe reactivar y actualizar una marca inactiva con el mismo nombre', async () => {
    // Configurar el mock para simular que existe una marca inactiva con el mismo nombre
    const inactiveMarca = {
      ...mockMarcaInactiva,
      nombre: createMarcaData.nombre.toUpperCase(), // Para probar case-insensitive
    };
    
    const updatedMarca = {
      ...inactiveMarca,
      nombre: createMarcaData.nombre, // El nombre se actualiza al formato correcto
      descripcion: createMarcaData.descripcion,
      activo: true,
      anuladoEn: null, // Aseguramos que estos campos estén explícitamente en null
      anuladoPor: null,
      modificadoPor: mockRequest.user?.id,
      modificadoEn: new Date()
    };

    // Configurar los mocks
    prismaMock.marca.findFirst.mockResolvedValue(inactiveMarca);
    prismaMock.marca.update.mockResolvedValue(updatedMarca);

    // Act
    await crearMarca(mockRequest as Request, mockResponse as Response);
    const responseData = mockResponse.json.mock.calls[0][0];

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    
    // Verify the response structure and important fields
    expect(responseData).toMatchObject({
      ok: true,
      error: null,
    });
    
    // Verify the data object contains the expected fields with correct values
    expect(responseData.data).toMatchObject({
      id: inactiveMarca.id,
      nombre: createMarcaData.nombre,
      descripcion: createMarcaData.descripcion,
      activo: true,
    });
    
    // Verify anulación fields are cleared
    expect(responseData.data.anuladoEn).toBeNull();
    expect(responseData.data.anuladoPor).toBeNull();

    // Verificar que se llamó a prisma.marca.update con los parámetros correctos
    expect(prismaMock.marca.update).toHaveBeenCalledWith({
      where: { id: inactiveMarca.id },
      data: {
        nombre: createMarcaData.nombre,
        descripcion: createMarcaData.descripcion,
        activo: true,
        anuladoEn: null,
        anuladoPor: null,
        modificadoPor: mockRequest.user?.id,
        modificadoEn: expect.any(Date)
      }
    });

    // Verificar que se registró el éxito de la reactivación
    expect(mockLogSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'reactivar_marca_exitosa',
        entityType: 'marca',
        module: 'crearMarca',
        message: 'Marca reactivada exitosamente',
        entityId: inactiveMarca.id,
        details: expect.objectContaining({
          nombre: createMarcaData.nombre,
          descripcion: createMarcaData.descripcion,
          reactivada: true
        })
      })
    );
  });

  it('debe manejar errores al reactivar una marca inactiva', async () => {
    // Configurar el mock para simular que existe una marca inactiva
    const inactiveMarca = {
      ...mockMarcaInactiva,
      nombre: createMarcaData.nombre.toUpperCase(),
    };
    
    const testError = new Error('Error al actualizar la marca');
    
    prismaMock.marca.findFirst.mockResolvedValue(inactiveMarca);
    prismaMock.marca.update.mockRejectedValue(testError);

    // Act
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error interno del servidor al crear la marca',
    });

    // Verificar que se llamó a logError
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'error_crear_marca',
        entityType: 'marca',
        module: 'crearMarca',
        message: 'Error al crear la marca',
        error: testError,
        context: expect.objectContaining({
          datosSolicitud: expect.any(Object),
          error: testError.message,
          stack: expect.any(String)
        })
      })
    );
  });

  it('debe manejar errores inesperados', async () => {
    // Simular un error inesperado
    const errorMessage = 'Error de base de datos';
    const testError = new Error(errorMessage);
    
    // Configurar mock para que falle en create
    prismaMock.marca.create.mockRejectedValue(testError);

    // Act
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Error interno del servidor al crear la marca',
    });

    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'error_crear_marca',
        entityType: 'marca',
        module: 'crearMarca',
        message: 'Error al crear la marca',
        error: testError,
        context: expect.objectContaining({
          datosSolicitud: expect.any(Object),
          error: errorMessage,
          stack: expect.any(String)
        })
      })
    );
  });
});
