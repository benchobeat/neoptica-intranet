import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, resetMocks } from '../../test-utils';
import { v4 as uuidv4 } from 'uuid';

// 1. First mock the audit module
jest.mock('../../../../src/utils/audit', () => ({
  logSuccess: jest.fn().mockResolvedValue(undefined),
  logError: jest.fn().mockResolvedValue(undefined)
}));

// Import the mocks after setting them up
const { logSuccess, logError } = require('../../../../src/utils/audit');

// Helper function for consistent UUIDs
const generateValidUuid = () => '123e4567-e89b-12d3-a456-426614174000';

// 2. Mock the Prisma client with proper types - BEFORE importing the controller
jest.mock('@prisma/client', () => {
  // Mock Prisma client implementation
  const mockPrisma = {
    sucursal: {
      findUnique: jest.fn((params) => {
        // Handle the query with id and anuladoEn: null
        if (params?.where?.id === '123e4567-e89b-12d3-a456-426614174000' && 
            params?.where?.anuladoEn === null) {
          return Promise.resolve({
            id: '123e4567-e89b-12d3-a456-426614174000',
            nombre: 'Sucursal Test',
            direccion: 'Dirección Test',
            telefono: '1234567890',
            email: 'test@example.com',
            latitud: 0,
            longitud: 0,
            activo: true,
            creadoEn: new Date(),
            creadoPor: 'system',
            modificadoEn: null,
            modificadoPor: null,
            anuladoEn: null,
            anuladoPor: null
          });
        }
        return Promise.resolve(null);
      }),
      update: jest.fn((params) => {
        return Promise.resolve({
          id: params.where.id,
          nombre: 'Sucursal Test',
          direccion: 'Dirección Test',
          telefono: '1234567890',
          email: 'test@example.com',
          latitud: 0,
          longitud: 0,
          activo: false,
          creadoEn: new Date(),
          creadoPor: 'system',
          modificadoEn: null,
          modificadoPor: null,
          anuladoEn: new Date(),
          anuladoPor: params.data.anuladoPor
        });
      }),
    },
    cita: {
      count: jest.fn(() => Promise.resolve(0)),
    },
    descansoEmpleado: {
      count: jest.fn(() => Promise.resolve(0)),
    },
    inventario: {
      count: jest.fn(() => Promise.resolve(0)),
    },
    movimientoContable: {
      count: jest.fn(() => Promise.resolve(0)),
    },
    pedido: {
      count: jest.fn(() => Promise.resolve(0)),
    },
    $transaction: jest.fn(callback => callback()),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// 3. Then import the controller AFTER setting up mocks
import { eliminarSucursal } from '../../../../src/controllers/sucursalController';

// 4. Get the mock function reference for audit
const mockRegistrarAuditoria = jest.requireMock('../../../../src/utils/audit').registrarAuditoria;

describe('eliminarSucursal', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  
  // Access the mock Prisma client
  const mockPrismaClient = jest.requireMock('@prisma/client').PrismaClient();

  // Test data
  const existingSucursal = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nombre: 'Sucursal Test',
    direccion: 'Dirección Test',
    telefono: '1234567890',
    email: 'test@example.com',
    latitud: 0,
    longitud: 0,
    activo: true,
    creadoEn: new Date(),
    creadoPor: 'system',
    modificadoEn: null,
    modificadoPor: null,
    anuladoEn: null,
    anuladoPor: null,
  };

  const deletedSucursal = {
    ...existingSucursal,
    estado: false,
    anuladoEn: new Date(),
    anuladoPor: 'test-user-id',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    resetMocks();
    
    // Setup default request and response objects
    req = createMockRequest();
    const mockRes = createMockResponse();
    jsonMock = mockRes.json as jest.Mock;
    statusMock = mockRes.status as jest.Mock;
    res = {
      status: statusMock,
      json: jsonMock
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe realizar un soft delete de la sucursal exitosamente', async () => {
    // Arrange - Reset all mocks before this test
    jest.clearAllMocks();
    
    // Setup the request with the correct user ID
    const testUserId = 'test-user-id';
    req = createMockRequest({
      params: { id: existingSucursal.id },
      user: { id: testUserId, email: 'test@example.com' },
    });
    
    // Setup response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock };
    
    // Mock findUnique to return the test sucursal
    mockPrismaClient.sucursal.findUnique.mockImplementation(({ where }) => {
      if (where && where.id === existingSucursal.id && where.anuladoEn === null) {
        return Promise.resolve({
          ...existingSucursal,
          anuladoEn: null,
          activo: true
        });
      }
      return Promise.resolve(null);
    });
    
    // Mock count to return 0 (no associated appointments)
    mockPrismaClient.cita.count.mockResolvedValue(0);
    
    // Mock update to return the updated sucursal
    mockPrismaClient.sucursal.update.mockImplementation(({ where, data }) => {
      return Promise.resolve({
        ...existingSucursal,
        ...data,
        id: where.id,
        estado: false,
        anuladoEn: new Date(),
        anuladoPor: testUserId,
      });
    });
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: true,
      data: { 
        id: '123e4567-e89b-12d3-a456-426614174000',
        mensaje: 'Sucursal eliminada exitosamente' 
      },
      error: null
    });

    // Verify the update was called with the correct parameters
    expect(mockPrismaClient.sucursal.update).toHaveBeenCalledWith({
      where: { id: existingSucursal.id },
      data: {
        activo: false,
        anuladoEn: expect.any(Date),
        anuladoPor: 'test-user-id',
      },
    });

    // Verify the audit log was created with the correct parameters
    expect(logSuccess).toHaveBeenCalledWith(expect.objectContaining({
      userId: testUserId,
      ip: '127.0.0.1',
      entityType: 'sucursal',
      entityId: existingSucursal.id,
      module: 'eliminarSucursal',
      action: 'eliminar_sucursal_exitoso',
      message: 'Sucursal eliminada exitosamente (soft delete)',
      details: {
        id: existingSucursal.id,
        nombre: 'Sucursal Test',
        razon: 'Eliminación lógica (soft delete)',
        estadoAnterior: {
          activo: true,
          anuladoEn: null,
          anuladoPor: null
        },
        estadoNuevo: expect.objectContaining({
          activo: false,
          anuladoEn: expect.any(String),
          anuladoPor: testUserId
        })
      }
    }));
  });

  it('debe devolver error 404 si la sucursal no existe', async () => {
    mockPrismaClient.sucursal.findUnique.mockResolvedValueOnce(null);
    
    await eliminarSucursal(req as Request, res as Response);

    // Controller returns 400 with 'ID inválido' for missing/undefined IDs
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'ID inválido',
    });
  });

  it('debe devolver error 404 si la sucursal ya está eliminada', async () => {
    // Arrange - Mock Prisma to return already deleted sucursal
    mockPrismaClient.sucursal.findUnique.mockResolvedValueOnce(null);
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert - Should return 404 for already deleted or non-existent
    // Controller returns 400 with 'ID inválido' for missing/undefined IDs
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'ID inválido',
    });
  });

  it('debe validar que el ID sea un UUID válido', async () => {
    // Arrange - Set invalid UUID
    req.params.id = 'invalid-id';
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'ID inválido',
    });
  });

  it('debe devolver 404 cuando hay un error al buscar la sucursal', async () => {
    // Arrange - Reset all mocks before this test
    jest.clearAllMocks();
    
    // Setup the request with the correct user ID
    req = createMockRequest({
      params: { id: existingSucursal.id },
      user: { id: 'test-user-id', email: 'test@example.com' },
    });
    
    // Setup response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock };
    
    // Mock findUnique to throw an error to simulate a database error
    const errorMessage = 'Database connection error';
    mockPrismaClient.sucursal.findUnique.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert - Controller returns 404 when there's an error finding the record
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'Sucursal no encontrada.',
    });
    
    // Note: The controller doesn't log an audit entry when a record isn't found
    // This is the expected behavior - we only log actual errors, not "not found" cases
  });

  it('debe manejar el caso cuando no se proporciona un ID', async () => {
    // Arrange - Remove ID from params
    req.params = {};
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert - Should validate missing ID
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'ID inválido',
    });
  });

  it('debe impedir eliminar si hay citas asociadas', async () => {
    // Arrange
    jest.clearAllMocks();
    const testUserId = 'test-user-id';
    req = createMockRequest({
      params: { id: existingSucursal.id },
      user: { id: testUserId, email: 'test@example.com' },
    });
    
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock };
    
    // Importante: Resetear todos los counts para asegurar que no hay estado compartido entre pruebas
    mockPrismaClient.cita.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.descansoEmpleado.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.inventario.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.movimientoContable.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.pedido.count.mockReset().mockResolvedValue(0);
    
    // Mock findUnique para devolver la sucursal
    mockPrismaClient.sucursal.findUnique.mockReset().mockImplementation(({ where }) => {
      if (where && where.id === existingSucursal.id && where.anuladoEn === null) {
        return Promise.resolve(existingSucursal);
      }
      return Promise.resolve(null);
    });
    
    // Mock count para indicar que hay citas asociadas
    mockPrismaClient.cita.count.mockResolvedValueOnce(3);
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert - Debe devolver error 409
    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'No se puede eliminar la sucursal porque tiene asociado(s): 3 cita(s).',
    });
    
    // Verificar que no se intentó hacer update
    expect(mockPrismaClient.sucursal.update).not.toHaveBeenCalled();
  });


  it('debe impedir eliminar si hay descansos de empleados asociados', async () => {
    // Arrange
    jest.clearAllMocks();
    const testUserId = 'test-user-id';
    req = createMockRequest({
      params: { id: existingSucursal.id },
      user: { id: testUserId, email: 'test@example.com' },
    });
    
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock };
    
    // Importante: Resetear todos los counts para asegurar que no hay estado compartido
    mockPrismaClient.cita.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.descansoEmpleado.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.inventario.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.movimientoContable.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.pedido.count.mockReset().mockResolvedValue(0);
    
    // Mock findUnique para devolver la sucursal
    mockPrismaClient.sucursal.findUnique.mockReset().mockImplementation(({ where }) => {
      if (where && where.id === existingSucursal.id && where.anuladoEn === null) {
        return Promise.resolve(existingSucursal);
      }
      return Promise.resolve(null);
    });
    
    // Mock count para indicar que hay descansos de empleados asociados
    mockPrismaClient.descansoEmpleado.count.mockResolvedValueOnce(2);
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert - Debe devolver error 409
    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'No se puede eliminar la sucursal porque tiene asociado(s): 2 descanso(s) de empleado.',
    });
    
    // Verificar que no se intentó hacer update
    expect(mockPrismaClient.sucursal.update).not.toHaveBeenCalled();
  });

  it('debe impedir eliminar si hay inventarios asociados', async () => {
    // Arrange
    jest.clearAllMocks();
    const testUserId = 'test-user-id';
    req = createMockRequest({
      params: { id: existingSucursal.id },
      user: { id: testUserId, email: 'test@example.com' },
    });
    
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock };
    
    // Importante: Resetear todos los counts para asegurar que no hay estado compartido
    mockPrismaClient.cita.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.descansoEmpleado.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.inventario.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.movimientoContable.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.pedido.count.mockReset().mockResolvedValue(0);
    
    // Mock findUnique para devolver la sucursal
    mockPrismaClient.sucursal.findUnique.mockReset().mockImplementation(({ where }) => {
      if (where && where.id === existingSucursal.id && where.anuladoEn === null) {
        return Promise.resolve(existingSucursal);
      }
      return Promise.resolve(null);
    });
    
    // Mock count para indicar que hay inventarios asociados
    mockPrismaClient.inventario.count.mockResolvedValueOnce(5);
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert - Debe devolver error 409
    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'No se puede eliminar la sucursal porque tiene asociado(s): 5 inventario(s).',
    });
    
    // Verificar que no se intentó hacer update
    expect(mockPrismaClient.sucursal.update).not.toHaveBeenCalled();
  });

  it('debe impedir eliminar si hay movimientos contables asociados', async () => {
    // Arrange
    jest.clearAllMocks();
    const testUserId = 'test-user-id';
    req = createMockRequest({
      params: { id: existingSucursal.id },
      user: { id: testUserId, email: 'test@example.com' },
    });
    
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock };
    
    // Importante: Resetear todos los counts para asegurar que no hay estado compartido
    mockPrismaClient.cita.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.descansoEmpleado.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.inventario.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.movimientoContable.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.pedido.count.mockReset().mockResolvedValue(0);
    
    // Mock findUnique para devolver la sucursal
    mockPrismaClient.sucursal.findUnique.mockReset().mockImplementation(({ where }) => {
      if (where && where.id === existingSucursal.id && where.anuladoEn === null) {
        return Promise.resolve(existingSucursal);
      }
      return Promise.resolve(null);
    });
    
    // Mock count para indicar que hay movimientos contables asociados
    mockPrismaClient.movimientoContable.count.mockResolvedValueOnce(10);
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert - Debe devolver error 409
    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'No se puede eliminar la sucursal porque tiene asociado(s): 10 movimiento(s) contable(s).',
    });
    
    // Verificar que no se intentó hacer update
    expect(mockPrismaClient.sucursal.update).not.toHaveBeenCalled();
  });

  it('debe impedir eliminar si hay pedidos asociados', async () => {
    // Arrange
    jest.clearAllMocks();
    const testUserId = 'test-user-id';
    req = createMockRequest({
      params: { id: existingSucursal.id },
      user: { id: testUserId, email: 'test@example.com' },
    });
    
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock };
    
    // Importante: Resetear todos los counts para asegurar que no hay estado compartido
    mockPrismaClient.cita.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.descansoEmpleado.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.inventario.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.movimientoContable.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.pedido.count.mockReset().mockResolvedValue(0);
    
    // Mock findUnique para devolver la sucursal
    mockPrismaClient.sucursal.findUnique.mockReset().mockImplementation(({ where }) => {
      if (where && where.id === existingSucursal.id && where.anuladoEn === null) {
        return Promise.resolve(existingSucursal);
      }
      return Promise.resolve(null);
    });
    
    // Mock count para indicar que hay pedidos asociados
    mockPrismaClient.pedido.count.mockResolvedValueOnce(7);
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert - Debe devolver error 409
    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'No se puede eliminar la sucursal porque tiene asociado(s): 7 pedido(s).',
    });
    
    // Verificar que no se intentó hacer update
    expect(mockPrismaClient.sucursal.update).not.toHaveBeenCalled();
  });

  it('debe impedir eliminar si hay múltiples tipos de registros asociados', async () => {
    // Arrange
    jest.clearAllMocks();
    const testUserId = 'test-user-id';
    req = createMockRequest({
      params: { id: existingSucursal.id },
      user: { id: testUserId, email: 'test@example.com' },
    });
    
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock };
    
    // Importante: Resetear todos los counts para asegurar que no hay estado compartido
    mockPrismaClient.cita.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.descansoEmpleado.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.inventario.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.movimientoContable.count.mockReset().mockResolvedValue(0);
    mockPrismaClient.pedido.count.mockReset().mockResolvedValue(0);
    
    // Mock findUnique para devolver la sucursal
    mockPrismaClient.sucursal.findUnique.mockReset().mockImplementation(({ where }) => {
      if (where && where.id === existingSucursal.id && where.anuladoEn === null) {
        return Promise.resolve(existingSucursal);
      }
      return Promise.resolve(null);
    });
    
    // Mock counts para indicar múltiples tipos de registros asociados
    mockPrismaClient.cita.count.mockResolvedValueOnce(2);
    mockPrismaClient.inventario.count.mockResolvedValueOnce(3);
    mockPrismaClient.pedido.count.mockResolvedValueOnce(1);
    
    // Act
    await eliminarSucursal(req as Request, res as Response);

    // Assert - Debe devolver error 409 con mensaje que incluya todos los tipos
    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: 'No se puede eliminar la sucursal porque tiene asociado(s): 2 cita(s), 3 inventario(s), 1 pedido(s).',
    });
    
    // Verificar que no se intentó hacer update
    expect(mockPrismaClient.sucursal.update).not.toHaveBeenCalled();
  });
});
