import { Request, Response } from 'express';
import { crearMarca } from '../../../../src/controllers/marcaController';
import { mockMarca, createMarcaData } from '../../__fixtures__/marcaFixtures';

// Mock de Prisma Client
jest.mock('@prisma/client', () => {
  const mockMarcaMethods = {
    findFirst: jest.fn(),
    create: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      marca: mockMarcaMethods,
      $disconnect: jest.fn(),
    })),
    mockMarcaMethods, // Exportamos los métodos para usarlos en las pruebas
  };
});

// Mock de auditoría
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
}));

// Obtenemos los mocks después de importar los módulos
const { mockMarcaMethods } = require('@prisma/client');

describe('Controlador de Marcas - Crear Marca', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let responseObject: any;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockRequest = {
      body: { ...createMarcaData },
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

    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar mocks por defecto
    mockMarcaMethods.findFirst.mockResolvedValue(null);
    mockMarcaMethods.create.mockResolvedValue({
      ...mockMarca,
      nombre: createMarcaData.nombre,
      descripcion: createMarcaData.descripcion,
      activo: true,
      creadoPor: mockRequest.user?.id,
      creadoEn: new Date(),
    });
  });

  it('debe crear una nueva marca exitosamente', async () => {
    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a create con los datos correctos
    expect(mockMarcaMethods.create).toHaveBeenCalledWith({
      data: {
        nombre: createMarcaData.nombre,
        descripcion: createMarcaData.descripcion,
        activo: true, // Valor por defecto si no se especifica
        creadoPor: mockRequest.user?.id,
        creadoEn: expect.any(Date),
      },
    });

    // Verificar la respuesta exitosa
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(responseObject).toEqual({
      ok: true,
      data: expect.objectContaining({
        id: mockMarca.id,
        nombre: createMarcaData.nombre,
        descripcion: createMarcaData.descripcion,
      }),
      error: null,
    });
  });

  it('debe validar que el nombre sea obligatorio', async () => {
    // Configurar solicitud sin nombre
    mockRequest.body = { ...createMarcaData, nombre: '' };

    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'El nombre es obligatorio y debe ser una cadena de texto.',
    });
  });

  it('debe validar la longitud mínima del nombre', async () => {
    // Configurar nombre con menos de 2 caracteres
    mockRequest.body = { ...createMarcaData, nombre: 'A' };

    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'El nombre debe tener al menos 2 caracteres.',
    });
  });

  it('debe validar caracteres permitidos en el nombre', async () => {
    // Configurar nombre con caracteres inválidos
    mockRequest.body = { ...createMarcaData, nombre: 'Marca #123' };

    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'El nombre contiene caracteres no permitidos.',
    });
  });

  it('debe validar que no exista otra marca con el mismo nombre', async () => {
    // Configurar el mock para simular que ya existe una marca con el mismo nombre
    mockMarcaMethods.findFirst.mockResolvedValue({
      ...mockMarca,
      nombre: createMarcaData.nombre.toUpperCase(), // Para probar case-insensitive
    });

    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findFirst con los parámetros correctos
    expect(mockMarcaMethods.findFirst).toHaveBeenCalledWith({
      where: {
        nombre: {
          equals: createMarcaData.nombre,
          mode: 'insensitive',
        },
        anuladoEn: null,
      },
    });

    // Verificar la respuesta de error
    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Ya existe una marca con ese nombre.',
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para simular un error inesperado
    mockMarcaMethods.findFirst.mockRejectedValue(new Error('Error de base de datos'));

    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 500
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(responseObject).toEqual({
      ok: false,
      data: null,
      error: 'Ocurrió un error al crear la marca.',
    });
  });
});
