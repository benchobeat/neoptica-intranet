import { Request, Response } from 'express';
import { cambiarPasswordUsuario } from '@/controllers/usuarioMeController';
import prisma from '@/utils/prisma';
import { logSuccess, logError } from '@/utils/audit';
import bcrypt from 'bcrypt';
import { mockUsuarioAdmin, mockRequest, mockResponse } from '@/../tests/unit/__fixtures__/usuarioFixtures';

// Mocks para las dependencias
jest.mock('@/utils/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock para bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('nuevoHashContraseña123'),
}));

// Mock para el módulo de auditoría
jest.mock('@/utils/audit', () => ({
  logSuccess: jest.fn().mockResolvedValue(undefined),
  logError: jest.fn().mockResolvedValue(undefined),
}));

// Tipos para los mocks
const mockFindUnique = prisma.usuario.findUnique as jest.Mock;
const mockUpdate = prisma.usuario.update as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;
const mockHash = bcrypt.hash as jest.Mock;
const mockLogSuccess = logSuccess as jest.Mock;
const mockLogError = logError as jest.Mock;

// Extender el tipo de Request para incluir el usuario autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    nombreCompleto: string;
    email: string;
    roles?: string[];
  };
  ip: string; // Hacer ip requerida para coincidir con el tipo Request de Express
}

describe('Controlador cambiarPasswordUsuario', () => {
  let req: AuthenticatedRequest;
  let res: Response;
  
  // Datos de prueba
  const userId = 'usuario-123';
  const passwordActual = 'miContraseñaActual123';
  const passwordNuevo = 'nuevaContraseñaSegura123!';
  const hashedPassword = '$2b$10$unV4LkKq9PbjHx5n5X5XeOcXvJZvW8XKzY9XcYvB7dC3dF5gH6jK7l';
  const ip = '192.168.1.1';

  // Configuración inicial antes de cada prueba
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar mocks por defecto
    mockFindUnique.mockResolvedValue({
      id: userId,
      password: hashedPassword,
    });
    
    mockCompare.mockResolvedValue(true);
    mockHash.mockResolvedValue('nuevoHashContraseña123');
    
    // Configurar request de prueba
    req = {
      body: {
        passwordActual,
        passwordNuevo,
      },
      user: { 
        id: userId, 
        nombreCompleto: 'Usuario de Prueba',
        email: 'test@example.com',
        roles: ['usuario'] 
      },
      ip,
    } as AuthenticatedRequest;
    
    // Configurar response de prueba
    res = mockResponse() as unknown as Response;
  });

  describe('Éxito', () => {
    it('debe cambiar la contraseña correctamente cuando los datos son válidos', async () => {
      // Actuar
      await cambiarPasswordUsuario(req, res);

      // Verificar
      // 1. Se buscó el usuario en la base de datos
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });

      // 2. Se comparó la contraseña actual
      expect(mockCompare).toHaveBeenCalledWith(passwordActual, hashedPassword);

      // 3. Se hasheó la nueva contraseña
      expect(mockHash).toHaveBeenCalledWith(passwordNuevo, 10);

      // 4. Se actualizó el usuario con la nueva contraseña
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining({
          password: 'nuevoHashContraseña123',
          modificadoEn: expect.any(Date),
          modificadoPor: userId,
        }),
      });

      // 5. Se registró el éxito en el log de auditoría
      expect(mockLogSuccess).toHaveBeenCalledWith({
        userId,
        ip,
        entityType: 'usuario',
        entityId: userId,
        module: 'cambiarPasswordUsuario',
        action: 'cambiar_password_exitoso',
        message: 'Contraseña actualizada correctamente',
        details: expect.objectContaining({
          accion: 'cambio_password',
          realizadoPor: userId,
          requiereReinicioSesion: true,
        }),
      });

      // 6. Se envió la respuesta exitosa
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: 'Contraseña actualizada correctamente',
        error: null,
      });
    });
  });

  describe('Validaciones', () => {
    it('debe retornar error 401 si el usuario no está autenticado', async () => {
      // Preparar
      req.user = undefined;

      // Actuar
      await cambiarPasswordUsuario(req, res);

      // Verificar
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: 'Usuario no autenticado',
      });

      // Verificar que se registró el error de auditoría
      expect(mockLogError).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'sistema',
          module: 'cambiarPasswordUsuario',
          action: 'cambiar_password_fallido',
          message: 'Usuario no autenticado. 401',
          entityType: 'usuario',
          entityId: 'no-autenticado',
          ip: expect.any(String),
        })
      );
    });

    it('debe retornar error 400 si faltan campos obligatorios', async () => {
      // Preparar
      req.body = {};

      // Actuar
      await cambiarPasswordUsuario(req, res);

      // Verificar
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: 'Se requieren el password actual y el nuevo',
      });
    });

    it('debe retornar error 400 si la nueva contraseña no cumple con los requisitos', async () => {
      // Preparar
      req.body.passwordNuevo = 'debil';

      // Actuar
      await cambiarPasswordUsuario(req, res);

      // Verificar
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: expect.stringContaining('El password nuevo debe tener al menos 8 caracteres'),
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debe retornar error 404 si el usuario no existe', async () => {
      // Preparar
      mockFindUnique.mockResolvedValueOnce(null);

      // Actuar
      await cambiarPasswordUsuario(req, res);

      // Verificar
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: 'Usuario no encontrado',
      });

      // Verificar que se registró el error de auditoría
      expect(mockLogError).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          module: 'cambiarPasswordUsuario',
          action: 'cambiar_password_fallido',
          message: 'Usuario no encontrado',
          entityType: 'usuario',
          entityId: userId,
        })
      );
    });

    it('debe retornar error 400 si la contraseña actual es incorrecta', async () => {
      // Preparar
      mockCompare.mockResolvedValueOnce(false);

      // Actuar
      await cambiarPasswordUsuario(req, res);

      // Verificar
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: 'El password actual es incorrecto',
      });

      // Verificar que se registró el error de auditoría
      expect(mockLogError).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          module: 'cambiarPasswordUsuario',
          action: 'cambiar_password_fallido',
          message: 'El password actual es incorrecto',
          entityType: 'usuario',
          entityId: userId,
        })
      );
    });

    it('debe retornar error 400 si el usuario no tiene contraseña configurada', async () => {
      // Preparar
      mockFindUnique.mockResolvedValueOnce({
        id: userId,
        password: null,
      });

      // Actuar
      await cambiarPasswordUsuario(req, res);

      // Verificar
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: 'El usuario no tiene password local configurado',
      });
    });

    it('debe manejar errores inesperados y retornar 500', async () => {
      // Preparar
      const error = new Error('Error inesperado');
      mockFindUnique.mockRejectedValueOnce(error);

      // Actuar
      await cambiarPasswordUsuario(req, res);

      // Verificar
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        data: null,
        error: 'Error al cambiar la contraseña',
      });

      // Verificar que se registró el error de auditoría
      expect(mockLogError).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          module: 'cambiarPasswordUsuario',
          action: 'cambiar_password_error',
          message: expect.stringContaining('Error al cambiar la contraseña'),
          entityType: 'usuario',
          entityId: userId,
          error: expect.any(Error),
          context: expect.any(Object),
          ip: expect.any(String)
        })
      );
    });
  });
});
