// Definir mocks primero para evitar problemas de hoisting
const mockMarcaMethods = {
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
};

const mockRegistrarAuditoria = jest.fn().mockResolvedValue(undefined);

// Configurar mocks antes de importar los módulos que los usan
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    marca: mockMarcaMethods,
    $disconnect: jest.fn(),
  })),
}));

jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: (...args: any[]) => mockRegistrarAuditoria(...args),
}));

// Importar después de configurar los mocks
import { Request, Response } from 'express';
import { actualizarMarca } from '../../../../src/controllers/marcaController';
import { mockMarca, updateMarcaData } from '../../__fixtures__/marcaFixtures';

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
      ...updateMarcaData,
      modificado_por: mockRequest.usuario?.id,
      modificado_en: new Date(),
    });

    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('debe actualizar una marca existente exitosamente', async () => {
    // Ejecutar la función del controlador
    await actualizarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a update con los datos correctos (usando snake_case para los campos de la base de datos)
    expect(mockMarcaMethods.update).toHaveBeenCalledWith({
      where: { id: mockMarca.id },
      data: {
        nombre: updateMarcaData.nombre,
        descripcion: updateMarcaData.descripcion,
        activo: updateMarcaData.activo,
        modificado_por: mockRequest.usuario?.id,
        modificado_en: expect.any(Date),
      },
    });

    // Verificar la respuesta exitosa
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual({
      ok: true,
      data: expect.objectContaining({
        id: mockMarca.id,
        nombre: updateMarcaData.nombre,
        descripcion: updateMarcaData.descripcion,
        activo: updateMarcaData.activo,
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

    // Limpiar llamadas previas al mock de auditoría
    mockRegistrarAuditoria.mockClear();

    // Ejecutar la función del controlador
    await actualizarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Marca no encontrada.',
    });
    
    // Verificar que NO se registró la auditoría de error
    // ya que el controlador actual no registra auditoría cuando la marca no existe
    expect(mockRegistrarAuditoria).not.toHaveBeenCalled();
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

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para lanzar un error
    const errorMessage = 'Error inesperado';
    mockMarcaMethods.findUnique.mockRejectedValue(new Error(errorMessage));
    
    // Configurar el mock para la auditoría de error
    mockRegistrarAuditoria.mockResolvedValue(undefined);

    // Ejecutar la función del controlador
    await actualizarMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 500
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Ocurrió un error al actualizar la marca.',
    });
  });
});
