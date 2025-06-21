import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Crear funciones mock primero
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockLogSuccess = jest.fn();
const mockLogError = jest.fn();

// Configurar mocks
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    usuario: {
      findUnique: mockFindUnique,
      update: mockUpdate
    }
  }))
}));

jest.mock('@/utils/audit', () => ({
  logSuccess: (...args: any[]) => mockLogSuccess(...args),
  logError: (...args: any[]) => mockLogError(...args)
}));

// Importar el controlador después de configurar los mocks
import { actualizarPerfilUsuario } from '@/controllers/usuarioMeController';

// Función auxiliar para crear una solicitud mock
const createMockRequest = (body: any, user: any): Request => ({
  body,
  user: {
    id: user.id,
    roles: user.roles || ['usuario'],
    ...user
  },
  ip: '127.0.0.1',
  headers: {},
  method: 'PUT',
  url: '/api/usuarios/me/perfil'
} as unknown as Request);

// Función auxiliar para crear una respuesta mock
const createMockResponse = (): Response => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.links = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('actualizarPerfilUsuario', () => {
  // Datos de prueba
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const validUpdateData = {
    nombreCompleto: 'Nuevo Nombre',
    telefono: '9876543210',
    direccion: 'Nueva Dirección',
    dni: '87654321'
  };

  // Objetos de solicitud y respuesta mock
  let req: Request;
  let res: Response;

  // Datos de usuario mock
  const mockUser = {
    id: userId,
    email: 'usuario@ejemplo.com',
    nombreCompleto: 'Usuario Existente',
    telefono: '1234567890',
    direccion: 'Calle Falsa 123',
    dni: null,
    activo: true,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    roles: [
      { rol: { id: '1', nombre: 'usuario', descripcion: 'Usuario regular' } }
    ]
  };

  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Crear objetos de solicitud y respuesta nuevos para cada prueba
    req = createMockRequest(validUpdateData, { 
      id: userId,
      roles: ['usuario'] 
    });
    
    res = createMockResponse();
    
    // Configurar implementaciones mock por defecto
    mockFindUnique.mockResolvedValue(mockUser);
    mockUpdate.mockImplementation((params: any) => 
      Promise.resolve({
        ...mockUser,
        ...params.data,
        actualizadoEn: new Date(),
        modificadoEn: new Date(),
        modificadoPor: userId
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('actualizaciones exitosas', () => {
    it('debe actualizar el perfil del usuario con datos válidos', async () => {
      // Preparar
      const updatedUser = {
        ...mockUser,
        ...validUpdateData,
        roles: [
          { rol: { id: '1', nombre: 'usuario', descripcion: 'Usuario regular' } }
        ]
      };
      
      mockUpdate.mockResolvedValueOnce(updatedUser);

      // Actuar
      await actualizarPerfilUsuario(req, res);

      // Verificar
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: userId }
      });
      
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          ...validUpdateData,
          modificadoEn: expect.any(Date),
          modificadoPor: userId
        },
        include: { roles: { include: { rol: true } } }
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: expect.objectContaining({
          ...validUpdateData,
          id: userId,
          email: mockUser.email,
          roles: ['usuario']
        }),
        error: null
      });

      // Verificar registro de auditoría
      expect(mockLogSuccess).toHaveBeenCalledWith({
        userId: userId,
        ip: '127.0.0.1',
        entityType: 'usuario',
        entityId: userId,
        module: 'actualizarPerfilUsuario',
        action: 'actualizar_perfil_exitoso',
        message: 'Perfil actualizado exitosamente',
        details: expect.objectContaining({
          cambiosRealizados: expect.any(Array),
          camposActualizados: expect.objectContaining({
            nombreCompleto: true,
            telefono: true,
            direccion: true,
            dni: true
          })
        })
      });
    });
  });

  describe('manejo de errores', () => {
    it('debe retornar 404 si el usuario no existe', async () => {
      // Preparar
      mockFindUnique.mockResolvedValueOnce(null);

      // Actuar
      await actualizarPerfilUsuario(req, res);

      // Verificar
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: 'Usuario no encontrado',
        data: null
      });
      expect(mockLogError).toHaveBeenCalled();
    });

    it('debe retornar 400 para formato de teléfono inválido', async () => {
      // Preparar
      const invalidReq = createMockRequest(
        { ...validUpdateData, telefono: 'invalido' },
        { id: userId, roles: ['usuario'] }
      );

      // Actuar
      await actualizarPerfilUsuario(invalidReq, res);

      // Verificar
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: 'El teléfono debe ser un número celular de 10 dígitos',
        data: null
      });
    });

    it('debe retornar 400 al intentar modificar un DNI ya establecido', async () => {
      // Preparar
      const userWithDni = { ...mockUser, dni: '12345678' };
      mockFindUnique.mockResolvedValueOnce(userWithDni);
      
      const dniUpdateReq = createMockRequest(
        { ...validUpdateData, dni: '87654321' },
        { id: userId, roles: ['usuario'] }
      );

      // Actuar
      await actualizarPerfilUsuario(dniUpdateReq, res);
      
      // Verificar
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: 'El DNI ya está registrado y no puede ser modificado',
        data: null
      });
    });

    it('debe retornar 403 al intentar actualizar el email', async () => {
      // Preparar
      const emailUpdateReq = createMockRequest(
        { ...validUpdateData, email: 'nuevo@ejemplo.com' },
        { id: userId, roles: ['usuario'] }
      );

      // Actuar
      await actualizarPerfilUsuario(emailUpdateReq, res);
      
      // Verificar
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: 'No puedes modificar tu email desde este endpoint por seguridad',
        data: null
      });
    });

    it('debe manejar una solicitud de actualización vacía', async () => {
      // Preparar
      const emptyUpdateReq = createMockRequest(
        { /* cuerpo vacío */ },
        { id: userId, roles: ['usuario'] }
      );
      
      // Configurar para que la búsqueda de usuario retorne un usuario válido
      mockFindUnique.mockResolvedValueOnce(mockUser);
      mockUpdate.mockResolvedValueOnce(mockUser);

      // Actuar
      await actualizarPerfilUsuario(emptyUpdateReq, res);
      
      // Verificar
      // No debería registrar un error para actualizaciones vacías
      expect(mockLogError).not.toHaveBeenCalled();
      
      // Debería retornar éxito con los datos existentes del usuario
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: expect.objectContaining({
          id: userId,
          email: mockUser.email,
          roles: ['usuario']
        }),
        error: null
      });
    });

    it('debe manejar errores de base de datos', async () => {
      // Preparar
      const dbError = new Error('Error de base de datos');
      mockFindUnique.mockRejectedValueOnce(dbError);

      // Actuar
      await actualizarPerfilUsuario(req, res);
      
      // Verificar
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: 'Error al actualizar el perfil'
      });
      
      // Verificar que se registró el error
      expect(mockLogError).toHaveBeenCalledWith({
        userId: userId,
        ip: '127.0.0.1',
        entityType: 'usuario',
        entityId: userId,
        module: 'actualizarPerfilUsuario',
        action: 'error_actualizar_perfil',
        message: 'Error al actualizar el perfil',
        error: dbError,
        context: {
          datosSolicitud: {
            nombreCompleto: 'proporcionado',
            telefono: 'proporcionado',
            direccion: 'proporcionada',
            dni: 'proporcionado'
          },
          stack: expect.any(String)
        }
      });
    });
  });
});
