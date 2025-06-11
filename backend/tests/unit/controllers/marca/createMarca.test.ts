import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Importar prismaMock directamente
const { prismaMock, resetPrismaMocks } = require('../../__mocks__/prisma');
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';

// Mockear módulos antes de importar el controlador
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock)
}));

// Mock de auditoría
const mockRegistrarAuditoria = jest.fn().mockImplementation(() => Promise.resolve());
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: mockRegistrarAuditoria
}));

// Importar el controlador después de los mocks
import { crearMarca } from '../../../../src/controllers/marcaController';
import { mockMarca, createMarcaData } from '../../__fixtures__/marcaFixtures';

describe('Controlador de Marcas - Crear Marca', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

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
        activo: data.activo,
        creadoPor: data.creadoPor,
        creadoEn: data.creadoEn,
        anuladoEn: null,
        anuladoPor: null,
        modificadoEn: null,
        modificadoPor: null,
      });
    });
  });

  it('debe crear una nueva marca exitosamente', async () => {
    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a create con los datos correctos
    expect(prismaMock.marca.create).toHaveBeenCalledWith({
      data: {
        nombre: createMarcaData.nombre,
        descripcion: createMarcaData.descripcion,
        activo: true, // Valor por defecto si no se especifica
        creadoPor: mockRequest.user?.id,
        creadoEn: expect.any(Date),
      },
    });

    // Verificar la respuesta exitosa
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    
    // Verificar que se llamó a json con la estructura básica
    expect(mockResponse.json).toHaveBeenCalled();
    
    // Obtener los argumentos con los que se llamó a json
    const [responseData] = mockResponse.json.mock.calls[0];
    
    // Verificar la estructura básica
    expect(responseData).toMatchObject({
      ok: true,
      error: null,
    });
    
    // Verificar que data existe y tiene los campos requeridos
    expect(responseData.data).toBeDefined();
    expect(responseData.data).toMatchObject({
      nombre: createMarcaData.nombre,
      descripcion: createMarcaData.descripcion,
      activo: true,
    });
    
    // Verificar que se incluyen los campos de auditoría
    expect(responseData.data.creadoPor).toBe(mockRequest.user?.id);
    expect(responseData.data.creadoEn).toBeInstanceOf(Date);
    expect(responseData.data).toHaveProperty('id');
  });

  it('debe validar que el nombre sea obligatorio', async () => {
    // Configurar solicitud sin nombre
    mockRequest.body = {
      ...mockRequest.body,
      nombre: undefined,
    };

    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre es obligatorio y debe ser una cadena de texto.',
    });
  });

  it('debe validar la longitud mínima del nombre', async () => {
    // Configurar nombre con menos de 2 caracteres
    mockRequest.body = {
      ...mockRequest.body,
      nombre: 'A',
    };

    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre debe tener al menos 2 caracteres.',
    });
  });

  it('debe validar caracteres permitidos en el nombre', async () => {
    // Configurar nombre con caracteres inválidos
    mockRequest.body = {
      ...mockRequest.body,
      nombre: 'Marca #123',
    };

    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre contiene caracteres no permitidos.',
    });
  });

  it('debe validar que no exista otra marca con el mismo nombre', async () => {
    // Configurar el mock para simular que ya existe una marca con el mismo nombre
    prismaMock.marca.findFirst.mockResolvedValue({
      ...mockMarca,
      nombre: createMarcaData.nombre.toUpperCase(), // Para probar case-insensitive
    });

    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar que se llamó a findFirst con los parámetros correctos
    expect(prismaMock.marca.findFirst).toHaveBeenCalledWith({
      where: {
        nombre: {
          equals: createMarcaData.nombre,
          mode: 'insensitive',
        },
        anuladoEn: null,
      },
    });

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ya existe una marca con ese nombre.',
    });
  });

  it('debe manejar errores inesperados', async () => {
    // Configurar el mock para simular un error inesperado
    prismaMock.marca.findFirst.mockRejectedValue(new Error('Error de base de datos'));

    // Ejecutar la función del controlador
    await crearMarca(mockRequest as Request, mockResponse as Response);

    // Verificar la respuesta de error 500
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Ocurrió un error al crear la marca.',
    });
  });


});
