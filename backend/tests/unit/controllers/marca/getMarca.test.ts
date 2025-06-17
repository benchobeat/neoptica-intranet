import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// 1. Primero definimos los mocks locales
const mockFindUnique = jest.fn() as any;
const mockLogSuccess = jest.fn().mockImplementation(async () => {
  return Promise.resolve();
});
const mockLogError = jest.fn().mockImplementation(async () => {
  return Promise.resolve();
});

// 2. Mock de Prisma Client
const mockPrismaClient = {
  marca: {
    findUnique: mockFindUnique,
  },
};

// 3. Configurar los mocks antes de importar los módulos que los usan
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: mockLogSuccess,
  logError: mockLogError
}));

// 4. Ahora importamos los módulos que usan los mocks
import { obtenerMarcaPorId } from '../../../../src/controllers/marcaController';
import { createMockRequest, createMockResponse } from '../../test-utils';
import { mockMarca } from '../../__fixtures__/marcaFixtures';

describe('Controlador de Marcas - Obtener Marca por ID', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = createMockRequest({
      params: { id: mockMarca.id }, // Pasamos el ID en los parámetros de URL
      user: { 
        id: 'usuario-test-id',
        email: 'test@example.com',
        nombreCompleto: 'Usuario de Prueba',
        roles: ['admin']
      }
    });

    mockResponse = createMockResponse();
    
    // Resetear todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar implementaciones por defecto
    mockFindUnique.mockResolvedValue({ ...mockMarca });
    mockLogSuccess.mockImplementation(async () => Promise.resolve());
    mockLogError.mockImplementation(async () => Promise.resolve());
  });

  it('debe devolver una marca cuando existe', async () => {
    // Configurar el mock para simular que la marca existe
    mockFindUnique.mockResolvedValueOnce({ ...mockMarca });

    // Ejecutar la función del controlador
    await obtenerMarcaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findUnique con el ID correcto y anuladoEn: null
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { 
        id: mockMarca.id,
        anuladoEn: null
      }
    });

    // Verificar la respuesta exitosa
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: true,
      data: expect.objectContaining({
        id: mockMarca.id,
        nombre: mockMarca.nombre,
      }),
      error: null,
    });

    // Verificar que se llamó a logSuccess con los parámetros correctos
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      entityId: mockMarca.id,
      module: 'obtenerMarcaPorId',
      action: 'obtener_marca_exitoso',
      message: 'Marca obtenida exitosamente',
      details: expect.objectContaining({
        id: mockMarca.id,
        nombre: mockMarca.nombre,
        activo: true,
        creadoEn: expect.any(String),
        modificadoEn: null
      })
    });
    
    // Verificar que no se llamó a logError
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('debe devolver error 404 si la marca no existe', async () => {
    // Configurar el mock para simular que la marca no existe
    mockFindUnique.mockResolvedValueOnce(null);

    // Ejecutar la función del controlador
    await obtenerMarcaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Marca no encontrada'
    });

    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      entityId: null,
      module: 'obtenerMarcaPorId',
      action: 'error_obtener_marca_por_id',
      message: 'Error al obtener la marca',
      error: 'Marca no encontrada. 404',
      context: {
        id: mockMarca.id
      }
    });
    
    // Verificar que no se llamó a logSuccess
    expect(mockLogSuccess).not.toHaveBeenCalled();
  });

  it('debe devolver error 400 si el ID no es válido', async () => {
    // Configurar el request con un ID inválido
    mockRequest.params = { id: 'id-invalido' };

    // Ejecutar la función del controlador
    await obtenerMarcaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'ID inválido',
    });

    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      entityId: null,
      module: 'obtenerMarcaPorId',
      action: 'error_obtener_marca_por_id',
      message: 'Error al obtener la marca',
      error: 'ID inválido. 400',
      context: {
        id: 'id-invalido'
      }
    });
    
    // Verificar que no se llamó a logSuccess
    expect(mockLogSuccess).not.toHaveBeenCalled();
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para lanzar un error inesperado
    const errorPrisma = new Error('Database error') as any;
    errorPrisma.code = 'P2002'; // Código de error de Prisma
    mockFindUnique.mockRejectedValueOnce(errorPrisma);

    // Ejecutar la función del controlador
    await obtenerMarcaPorId(mockRequest as Request, mockResponse as Response);
    
    // Verificar la respuesta de error 500
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener la marca.',
    });

    // Verificar que se llamó a logError con los parámetros correctos
    const dbError = new Error('Database error');
    (dbError as any).code = 'P2002';
    
    // Verificar que se llamó a logError con el error original
    expect(mockLogError).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      entityId: mockMarca.id,
      module: 'obtenerMarcaPorId',
      action: 'error_obtener_marca_por_id',
      message: 'Error al obtener la marca',
      error: dbError,
      context: {
        idSolicitado: mockMarca.id,
        error: 'Database error',
        stack: expect.any(String)
      }
    });
    
    // Limpiar llamadas anteriores
    mockResponse.status.mockClear();
    mockResponse.json.mockClear();
    mockLogError.mockClear();

    // Probar con otro tipo de error
    const unexpectedError = new Error('Error inesperado');
    mockFindUnique.mockRejectedValueOnce(unexpectedError);

    await obtenerMarcaPorId(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 500 para errores inesperados
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ocurrió un error al obtener la marca.',
    });

    // Verificar que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: mockRequest.user?.id,
      ip: mockRequest.ip,
      entityType: 'marca',
      entityId: mockMarca.id,
      module: 'obtenerMarcaPorId',
      action: 'error_obtener_marca_por_id',
      message: 'Error al obtener la marca',
      error: unexpectedError,
      context: {
        idSolicitado: mockMarca.id,
        error: 'Error inesperado',
        stack: expect.any(String)
      }
    });
  });
});
