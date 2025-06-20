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

// Importar el controlador después de los mocks
import { crearColor } from '../../../../src/controllers/colorController';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { validColorData, invalidColorData, mockColor } from '../../__fixtures__/colorFixtures';

describe('Controlador de Colores - Crear Color', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;

  // Usamos la función centralizada para resetear mocks

  beforeEach(() => {
    // Configuración inicial para cada prueba
    mockRequest = createMockRequest({
      body: { ...validColorData },
      user: { id: 'test-user-id' },
      ip: '127.0.0.1'
    });

    mockResponse = createMockResponse();
    resetMocks();
    resetPrismaMocks();
    
    // Reset mocks antes de cada prueba
    mockLogSuccess.mockClear();
    mockLogError.mockClear();
  });

  it('debe crear un color exitosamente', async () => {
    // Configuración del mock para la prueba específica
    (prismaMock.color.findFirst as jest.Mock).mockImplementation(() => Promise.resolve(null));
    (prismaMock.color.create as jest.Mock).mockImplementation(() => Promise.resolve({...mockColor}));

    // Ejecuta el controlador
    await crearColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verifica que se haya llamado a las funciones esperadas
    expect(prismaMock.color.findFirst).toHaveBeenCalled();
    expect(prismaMock.color.create).toHaveBeenCalled();
    
    // Verifica que se llamó a prisma.color.create con los valores por defecto correctos
    expect(prismaMock.color.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        activo: true, // Siempre true independientemente de la solicitud
      })
    });
    
    // Verifica que se llamó a logSuccess con los parámetros correctos
    expect(mockLogSuccess).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'color',
      module: 'crearColor',
      action: 'crear_color_exitoso',
      message: 'Color creado exitosamente',
      entityId: mockColor.id,
      details: expect.objectContaining({
        nombre: validColorData.nombre,
        codigoHex: validColorData.codigoHex,
        descripcion: validColorData.descripcion
      })
    });

    // Verifica la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        data: expect.anything()
      })
    );
  });

  it('debe crear un color con valores predeterminados cuando falten algunos campos opcionales', async () => {
    // Preparar solicitud con solo el campo obligatorio (nombre)
    mockRequest.body = { nombre: 'Verde' };
    
    // Configurar mocks
    jest.spyOn(prismaMock.color, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prismaMock.color, 'create').mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440001',
      nombre: 'Verde',
      codigoHex: '',
      descripcion: '',
      activo: true,
      creadoEn: new Date(),
      creadoPor: 'test-user-id',
      modificadoEn: new Date(),
      modificadoPor: 'test-user-id',
      anuladoEn: new Date(),
      anuladoPor: 'test-user-id'
    });

    // Ejecutar el controlador
    await crearColor(mockRequest as Request, mockResponse as Response);
    
    // Verificar que se llamó a create con los valores por defecto correctos
    expect(prismaMock.color.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nombre: 'Verde',
        codigoHex: null,
        descripcion: null,
        activo: true, // Siempre true independientemente de la solicitud
        creadoPor: 'test-user-id'
      })
    });
    
    // Verificar respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      data: expect.objectContaining({
        nombre: 'Verde',
        activo: true
      })
    }));
  });

  it('debe devolver error si ya existe un color con el mismo nombre', async () => {
    // Configura el mock para simular que ya existe un color con el mismo nombre
    (prismaMock.color.findFirst as jest.Mock).mockImplementation(() => 
      Promise.resolve({ ...mockColor })
    );

    // Ejecuta el controlador
    await crearColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verifica que se haya llamado a la función de búsqueda
    expect(prismaMock.color.findFirst).toHaveBeenCalled();
    
    // Verifica que no se haya intentado crear el color
    expect(prismaMock.color.create).not.toHaveBeenCalled();

    // Debug: Log the actual call to mockLogError
    const mockCalls = (mockLogError as jest.Mock).mock.calls[0][0];
    
    // Verifica que se llamó a logError con los parámetros correctos
    expect(mockLogError).toHaveBeenCalledWith({
      userId: 'test-user-id',
      ip: '127.0.0.1',
      entityType: 'color',
      module: 'crearColor',
      action: 'error_crear_color',
      message: 'Se presento un error durante la creacion del color',
      error: expect.any(Error),
      context: {
        nombre: 'Rojo',
        descripcion: 'Color rojo estándar',
        codigoHex: '#FF0000',
        colorExistenteId: '550e8400-e29b-41d4-a716-446655440000'
      }
    });

    // Verifica la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Ya existe un color con ese nombre.'
      })
    );
  });

  it('debe validar que el nombre es requerido', async () => {
    // Configurar la petición sin nombre
    mockRequest.body = {
      ...mockRequest.body,
      nombre: undefined
    };

    // Ejecutar la función del controlador
    await crearColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'El nombre es obligatorio y debe ser una cadena de texto.'
    });
  });

  it('debe validar el formato del código hexadecimal', async () => {
    // Asegurarse de que findFirst devuelve null (no existe el color)
    (prismaMock.color.findFirst as jest.Mock).mockImplementation(() => Promise.resolve(null));
    
    // Configurar la petición con un código hex inválido
    mockRequest.body = {
      ...mockRequest.body,
      codigoHex: 'GGGGGG'
    };

    // Ejecutar la función del controlador
    await crearColor(mockRequest as Request, mockResponse as unknown as Response);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Formato de código hexadecimal inválido. Debe ser #RRGGBB o #RGB.'
    });
  });
});
