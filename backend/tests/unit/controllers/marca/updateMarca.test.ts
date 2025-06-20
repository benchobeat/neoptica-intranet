// Definir mocks primero para evitar problemas de hoisting
const mockMarcaMethods = {
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
};

const mockLogSuccess = jest.fn().mockResolvedValue(undefined);
const mockLogError = jest.fn().mockResolvedValue(undefined);

// Configurar mocks antes de importar los módulos que los usan
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    marca: mockMarcaMethods,
    $disconnect: jest.fn(),
  })),
}));

jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: (...args: any[]) => mockLogSuccess(...args),
  logError: (...args: any[]) => mockLogError(...args),
}));

// Importar después de configurar los mocks
import { Request, Response } from 'express';
import { actualizarMarca } from '../../../../src/controllers/marcaController';
import { mockMarca, updateMarcaData as originalUpdateMarcaData } from '../../__fixtures__/marcaFixtures';

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

// Extender la interfaz Error para incluir la propiedad code
interface CustomError extends Error {
  code?: string;
}

describe('Controlador de Marcas - Actualizar Marca', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let responseObject: any;
  
  // Create a version of updateMarcaData without activo field
  const updateMarcaData = {
    nombre: originalUpdateMarcaData.nombre,
    descripcion: originalUpdateMarcaData.descripcion
  };

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    
    mockRequest = {
      params: { id: mockMarca.id },
      body: { ...updateMarcaData },
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

    // Configurar mocks por defecto
    mockMarcaMethods.findUnique.mockResolvedValue(mockMarca);
    mockMarcaMethods.findFirst.mockResolvedValue(null);
    mockMarcaMethods.update.mockResolvedValue({
      ...mockMarca,
      nombre: updateMarcaData.nombre,
      descripcion: updateMarcaData.descripcion,
      // activo field remains unchanged
      modificadoPor: mockRequest.usuario?.id,
      modificadoEn: new Date(),
    });

    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('debe actualizar una marca existente exitosamente', async () => {
    // Ejecutar la función del controlador
    await actualizarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a update con los datos correctos (sin el campo activo)
    expect(mockMarcaMethods.update).toHaveBeenCalledWith({
      where: { id: mockMarca.id },
      data: {
        nombre: updateMarcaData.nombre,
        descripcion: updateMarcaData.descripcion,
        // El campo activo ya no se incluye
        modificadoPor: mockRequest.usuario?.id,
        modificadoEn: expect.any(Date),
      },
    });

    // Verificar que se llamó a logSuccess con los parámetros correctos
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockRequest.usuario?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      module: 'actualizarMarca',
      action: 'actualizar_marca',
      message: 'Marca actualizada exitosamente',
      entityId: mockMarca.id,
      details: expect.objectContaining({
        id: mockMarca.id,
        cambios: expect.objectContaining({
          nombre: expect.objectContaining({
            anterior: mockMarca.nombre,
            nuevo: updateMarcaData.nombre
          }),
          descripcion: expect.objectContaining({
            anterior: mockMarca.descripcion,
            nuevo: updateMarcaData.descripcion
          })
          // El campo activo ya no se actualiza
        })
      })
    }));
    
    // Verificar que no se llamó a logError
    expect(mockLogError).not.toHaveBeenCalled()

    // Verificar la respuesta exitosa
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual({
      ok: true,
      data: expect.objectContaining({
        id: mockMarca.id,
        nombre: updateMarcaData.nombre,
        descripcion: updateMarcaData.descripcion,
        activo: mockMarca.activo // activo mantiene el valor original
      }),
      error: null,
    });
  });

  it('debe validar que el ID sea un UUID válido', async () => {
    // Configurar un ID inválido
    mockRequest.params = { id: 'id-invalido' };

    // Ejecutar la función del controlador
    await actualizarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'ID inválido',
    });
  });

  it('debe validar que la marca exista antes de actualizar', async () => {
    // Configurar el mock para simular que la marca no existe
    mockMarcaMethods.findUnique.mockResolvedValue(null);

    // Limpiar llamadas previas a los mocks
    jest.clearAllMocks();

    // Ejecutar la función del controlador
    await actualizarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Marca no encontrada.',
    });
    
    // Verificar que se llamó a logError con el error de recurso no encontrado
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockRequest.usuario?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      module: 'actualizarMarca',
      action: 'error_actualizar_marca',
      message: 'Error al actualizar la marca',
      error: 'Marca no encontrada. 404',
      entityId: mockMarca.id,
      context: {
        idSolicitado: mockMarca.id
      }
    }));
    
    // Verificar que no se llamó a logSuccess
    expect(mockLogSuccess).not.toHaveBeenCalled();
  });

  it('debe validar que no exista otra marca con el mismo nombre', async () => {
    // Configurar el mock para simular que ya existe otra marca con el mismo nombre
    mockMarcaMethods.findFirst.mockResolvedValue({
      ...mockMarca,
      id: 'otro-id-diferente',
    });
    
    // Asegurarse de que findUnique devuelva la marca existente
    mockMarcaMethods.findUnique.mockResolvedValue(mockMarca);

    // Ejecutar la función del controlador
    await actualizarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Ya existe otra marca con ese nombre.',
    });
  });

  it('debe rechazar la solicitud cuando se intenta modificar el campo activo', async () => {
    // Configurar el body con el campo activo
    mockRequest.body = { ...mockRequest.body, activo: false };

    // Ejecutar la función del controlador
    await actualizarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'No está permitido modificar el campo activo.',
    });
    
    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockRequest.usuario?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      module: 'actualizarMarca',
      action: 'error_actualizar_marca',
      message: 'Error al actualizar la marca',
      error: 'No está permitido modificar el campo activo. 400',
      entityId: mockMarca.id,
      context: expect.objectContaining({
        idSolicitado: mockMarca.id
      })
    }));
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para lanzar un error
    const errorMessage = 'Error inesperado';
    const testError = new Error(errorMessage);
    mockMarcaMethods.findUnique.mockRejectedValue(testError);

    // Ejecutar la función del controlador
    await actualizarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 500
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Error interno del servidor al actualizar la marca',
    });
    
    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockRequest.usuario?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      module: 'actualizarMarca',
      action: 'error_actualizar_marca',
      message: 'Error al actualizar la marca. 500',
      entityId: mockMarca.id,
      error: testError,
      context: expect.objectContaining({
        idSolicitado: mockMarca.id,
        datosSolicitud: expect.objectContaining({
          nombre: updateMarcaData.nombre,
          descripcion: updateMarcaData.descripcion
        }),
        error: 'Error inesperado',
        stack: expect.stringContaining('Error: Error inesperado')
      })
    }));
    
    // Verificar que no se llamó a logSuccess
    expect(mockLogSuccess).not.toHaveBeenCalled();
  });
});
