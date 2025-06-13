// Mock Prisma client first to avoid hoisting issues
const mockCount = jest.fn();
const mockFindMany = jest.fn();
const mockPrisma = {
  usuario: {
    count: mockCount,
    findMany: mockFindMany,
  },
};

// Mock the modules
jest.mock('../../../../src/utils/audit', () => ({
  registrarAuditoria: jest.fn().mockResolvedValue(undefined),
}));

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Import the controller and fixtures after setting up mocks
import { listarUsuariosPaginados } from '../../../../src/controllers/usuarioController';
import { mockUsuarioAdmin, mockUsuarioVendedor } from '../../__fixtures__/usuarioFixtures';

// Mock the PrismaClient from @prisma/client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

// Mock request and response
const mockRequest = (query = {}) => ({
  query,
  ip: '127.0.0.1',
  user: { id: 'test-user-id', roles: ['ADMIN'] },
  get: jest.fn(),
  header: jest.fn(),
  accepts: jest.fn().mockReturnValue('application/json'),
});

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('listarUsuariosPaginados', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  const mockUsuarios = [
    { ...mockUsuarioAdmin, password: undefined, roles: [{ rol: { nombre: 'ADMIN' } }] },
    { ...mockUsuarioVendedor, password: undefined, roles: [{ rol: { nombre: 'VENDEDOR' } }] },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default request and response
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();

    // Default mock implementations
    mockCount.mockResolvedValue(2);
    mockFindMany.mockResolvedValue(mockUsuarios);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver una lista paginada de usuarios', async () => {
    // Arrange
    const mockUsers = mockUsuarios.map(user => ({
      ...user,
      roles: [{
        id: 'mocked-role-id',
        rol: { nombre: user.roles[0].rol.nombre },
        rolId: 'mocked-role-id',
        usuarioId: user.id
      }]
    }));

    mockCount.mockResolvedValue(2);
    mockFindMany.mockResolvedValue(mockUsers);

    // Act
    await listarUsuariosPaginados(req, res);

    // Assert
    expect(mockCount).toHaveBeenCalledWith({
      where: { anuladoEn: null }
    });
    expect(mockFindMany).toHaveBeenCalledWith({
      take: 10,
      skip: 0,
      orderBy: { nombreCompleto: 'asc' },
      where: { anuladoEn: null },
      include: { roles: { include: { rol: true } } },
    });
    
    const response = res.json.mock.calls[0][0];
    expect(response).toMatchObject({
      ok: true,
      error: null,
      data: {
        items: expect.any(Array),
        page: 1,
        pageSize: 10,
        total: 2
      }
    });
  });

  it('debe filtrar por búsqueda si se proporciona searchText', async () => {
    // Arrange
    req.query.searchText = 'admin';
    
    const mockUserWithRoles = {
      ...mockUsuarioAdmin,
      roles: [{
        id: '1',
        rol: { nombre: 'ADMIN' },
        rolId: '1',
        usuarioId: mockUsuarioAdmin.id
      }]
    };
    
    // The controller maps roles to a simple array of role names
    const expectedResponseUser = {
      ...mockUsuarioAdmin,
      roles: ['ADMIN']
    };

    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue([mockUserWithRoles]);

    // Act
    await listarUsuariosPaginados(req, res);

    // Assert
    expect(mockCount).toHaveBeenCalledWith({
      where: {
        anuladoEn: null,
        nombreCompleto: {
          contains: 'admin',
          mode: 'insensitive'
        }
      }
    });

    const response = res.json.mock.calls[0][0];
    expect(response).toHaveProperty('ok', true);
    expect(response.error).toBeNull();
    expect(response.data).toHaveProperty('items');
    expect(response.data.items).toHaveLength(1);
    expect(response.data.items[0]).toMatchObject({
      ...expectedResponseUser
    });
  });

  it('debe manejar la paginación personalizada correctamente', async () => {
    // Arrange
    const page = 2;
    const pageSize = 5;
    const totalItems = 15;
    
    req = mockRequest({ 
      page: page.toString(), 
      pageSize: pageSize.toString() 
    });
    
    mockCount.mockResolvedValue(totalItems);
    
    const mockPaginatedUsers = mockUsuarios.map(user => ({
      ...user,
      roles: [{
        id: '1',
        rol: { nombre: user.roles[0].rol.nombre },
        rolId: '1',
        usuarioId: user.id
      }]
    }));
    
    mockFindMany.mockResolvedValue(mockPaginatedUsers);

    // Act
    await listarUsuariosPaginados(req, res);

    // Assert
    expect(mockCount).toHaveBeenCalledWith({
      where: { anuladoEn: null }
    });
    
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { anuladoEn: null },
      orderBy: { nombreCompleto: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { 
        roles: { 
          include: { rol: true } 
        } 
      },
    });

    const response = res.json.mock.calls[0][0];
    expect(response).toMatchObject({
      ok: true,
      error: null,
      data: {
        items: expect.any(Array),
        page: page,
        pageSize: pageSize,
        total: totalItems
      }
    });
  });

  it('debe manejar errores correctamente', async () => {
    // Arrange
    const error = new Error('Error de base de datos');
    mockCount.mockRejectedValueOnce(error);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      // Act
      await listarUsuariosPaginados(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: 'Ocurrió un error al obtener el listado paginado de usuarios.'
      });
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
