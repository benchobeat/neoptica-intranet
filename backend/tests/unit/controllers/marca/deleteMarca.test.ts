import { Request, Response } from 'express';
import { eliminarMarca } from '../../../../src/controllers/marcaController';
import { mockMarca } from '../../__fixtures__/marcaFixtures';

// Mock de Prisma Client
jest.mock('@prisma/client', () => {
  const mockMarcaMethods = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };

  const mockProductoMethods = {
    count: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      marca: mockMarcaMethods,
      producto: mockProductoMethods,
      $disconnect: jest.fn(),
    })),
    mockMarcaMethods, // Exportamos los métodos para usarlos en las pruebas
    mockProductoMethods,
  };
});

// Mock de auditoría
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
}));

// Obtenemos los mocks después de importar los módulos
const { mockMarcaMethods, mockProductoMethods } = require('@prisma/client');

describe('Controlador de Marcas - Eliminar Marca', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let responseObject: any;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockRequest = {
      params: { id: mockMarca.id },
      user: { 
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
    mockMarcaMethods.findUnique.mockResolvedValue({
      ...mockMarca,
      anuladoEn: null,
    });
    mockMarcaMethods.update.mockResolvedValue({
      ...mockMarca,
      anuladoEn: new Date(),
      anuladoPor: 'usuario-test-id',
      activo: false,
    });

    // Configurar mock para verificación de productos asociados
    mockProductoMethods.count.mockResolvedValue(0); // Por defecto, no hay productos asociados
    
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('debe realizar un soft delete de una marca existente', async () => {
    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a update con los campos de anulación
    expect(mockMarcaMethods.update).toHaveBeenCalledWith({
      where: { id: mockMarca.id },
      data: {
        anuladoEn: expect.any(Date),
        anuladoPor: mockRequest.user?.id,
        activo: false,
      },
    });

    // Verificar la respuesta exitosa
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual({
      ok: true,
      data: 'Marca eliminada correctamente.',
      error: null,
    });
  });

  it('debe validar que el ID sea un UUID válido', async () => {
    // Configurar un ID inválido
    mockRequest.params = { id: 'id-invalido' };

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'ID inválido',
    });
  });

  it('debe validar que la marca exista antes de eliminar', async () => {
    // Configurar el mock para simular que la marca no existe
    mockMarcaMethods.findUnique.mockResolvedValue(null);

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 404
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Marca no encontrada.',
    });
  });

  it('debe manejar el caso cuando la marca ya está eliminada', async () => {
    // Configurar el mock para simular una marca ya eliminada
    mockMarcaMethods.findUnique.mockResolvedValue({
      ...mockMarca,
      anuladoEn: new Date(),
      anuladoPor: 'usuario-anterior',
      activo: false,
    });

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar que se maneja correctamente una marca ya eliminada
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual({
      ok: true,
      data: 'Marca eliminada correctamente.',
      error: null,
    });
  });
  
  it('debe rechazar la eliminación si hay productos asociados', async () => {
    // Configurar el mock para simular que hay 2 productos asociados
    mockProductoMethods.count.mockResolvedValue(2);
    
    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);
    
    // Verificar que se verificaron los productos asociados
    expect(mockProductoMethods.count).toHaveBeenCalledWith({
      where: {
        marcaId: mockMarca.id,
        anuladoEn: null,
      },
    });
    
    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'No se puede eliminar la marca porque tiene 2 producto(s) asociado(s).',
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para lanzar un error inesperado
    mockMarcaMethods.findUnique.mockRejectedValue(new Error('Error de base de datos'));

    // Ejecutar la función del controlador
    await eliminarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 500
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Ocurrió un error al eliminar la marca.',
    });
  });
});
