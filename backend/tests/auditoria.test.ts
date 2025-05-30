import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/app';
import jwt from 'jsonwebtoken';
// Referencia a los tipos de Jest para resolver los errores de TS
/// <reference types="jest" />

const prisma = new PrismaClient();

// Token de prueba para simular un usuario administrador
const createTestToken = (id: string, rol: string) => {
  return jwt.sign(
    { 
      id, 
      email: 'test@example.com', 
      rol 
    },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

describe('Auditoría Controller', () => {
  let adminToken: string;
  let usuarioToken: string;
  let adminId: string;
  let usuarioId: string;
  let logAuditoriaId: string;

  // Antes de todas las pruebas, crear usuarios de prueba y obtener tokens
  beforeAll(async () => {
    // Encontrar usuario administrador existente
    const adminUser = await prisma.usuario.findFirst({
      where: { usuario_rol: { some: { rol: { nombre: 'admin' } } } },
      include: { usuario_rol: { include: { rol: true } } },
    });

    if (adminUser) {
      adminId = adminUser.id;
      adminToken = createTestToken(adminUser.id, 'admin');
    } else {
      throw new Error('No se encontró usuario administrador para pruebas');
    }

    // Encontrar usuario normal existente
    const normalUser = await prisma.usuario.findFirst({
      where: { 
        usuario_rol: { 
          some: { 
            rol: { 
              nombre: { notIn: ['admin'] } 
            } 
          } 
        } 
      },
      include: { usuario_rol: { include: { rol: true } } },
    });

    if (normalUser) {
      usuarioId = normalUser.id;
      const rolNombre = normalUser.usuario_rol[0]?.rol?.nombre || 'cliente';
      usuarioToken = createTestToken(normalUser.id, rolNombre);
    } else {
      // Crear usuario normal si no existe
      const nuevoUsuario = await prisma.usuario.create({
        data: {
          nombre_completo: 'Usuario Prueba',
          email: 'usuario.prueba@example.com',
          password: 'hasheado-password-123',
          telefono: '0987654321',
          activo: true,
        },
      });

      const rolCliente = await prisma.rol.findFirst({
        where: { nombre: 'cliente' },
      });

      if (rolCliente) {
        await prisma.usuario_rol.create({
          data: {
            usuario_id: nuevoUsuario.id,
            rol_id: rolCliente.id,
          },
        });
      }

      usuarioId = nuevoUsuario.id;
      usuarioToken = createTestToken(nuevoUsuario.id, 'cliente');
    }

    // Crear un registro de auditoría de prueba
    const registroAuditoria = await prisma.log_auditoria.create({
      data: {
        usuarioId: adminId,
        accion: 'test_accion',
        descripcion: 'Registro de prueba para tests',
        ip: '127.0.0.1',
        entidadTipo: 'test',
        modulo: 'test',
      },
    });

    logAuditoriaId = registroAuditoria.id;
  });

  // Después de todas las pruebas, limpiar registros de auditoría de prueba
  afterAll(async () => {
    // No eliminaremos los registros de auditoría de prueba
    // ya que la auditoría no debe permitir eliminación
    // Solo cerrar la conexión de prisma
    await prisma.$disconnect();
  });

  describe('GET /api/auditoria', () => {
    it('Debería rechazar acceso sin autenticación', async () => {
      const response = await request(app).get('/api/auditoria');
      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });

    it('Debería rechazar acceso con token de usuario no administrador', async () => {
      const response = await request(app)
        .get('/api/auditoria')
        .set('Authorization', `Bearer ${usuarioToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });

    it('Debería listar registros de auditoría con token de administrador', async () => {
      const response = await request(app)
        .get('/api/auditoria')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.registros).toBeDefined();
      expect(Array.isArray(response.body.data.registros)).toBe(true);
      expect(response.body.data.paginacion).toBeDefined();
    });

    it('Debería permitir paginación', async () => {
      const response = await request(app)
        .get('/api/auditoria?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.paginacion.limite).toBe(5);
      expect(response.body.data.paginacion.pagina).toBe(1);
    });

    it('Debería rechazar parámetros de paginación inválidos', async () => {
      const response = await request(app)
        .get('/api/auditoria?page=0&limit=200')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it('Debería filtrar por módulo', async () => {
      const response = await request(app)
        .get('/api/auditoria?modulo=test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      
      // Verificar que todos los registros pertenecen al módulo especificado
      if (response.body.data.registros.length > 0) {
        const todosDelModulo = response.body.data.registros.every(
          (registro: any) => registro.modulo === 'test'
        );
        expect(todosDelModulo).toBe(true);
      }
    });

    it('Debería filtrar por acción', async () => {
      const response = await request(app)
        .get('/api/auditoria?accion=test_accion')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      
      // Verificar que todos los registros tienen la acción especificada
      if (response.body.data.registros.length > 0) {
        const todasLasAcciones = response.body.data.registros.every(
          (registro: any) => registro.accion === 'test_accion'
        );
        expect(todasLasAcciones).toBe(true);
      }
    });

    it('Debería filtrar por usuarioId', async () => {
      const response = await request(app)
        .get(`/api/auditoria?usuarioId=${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      
      // Verificar que todos los registros tienen el usuarioId especificado
      if (response.body.data.registros.length > 0) {
        const todosLosUsuarios = response.body.data.registros.every(
          (registro: any) => registro.usuarioId === adminId
        );
        expect(todosLosUsuarios).toBe(true);
      }
    });
  });

  describe('GET /api/auditoria/:id', () => {
    it('Debería rechazar acceso sin autenticación', async () => {
      const response = await request(app).get(`/api/auditoria/${logAuditoriaId}`);
      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });

    it('Debería rechazar acceso con token de usuario no administrador', async () => {
      const response = await request(app)
        .get(`/api/auditoria/${logAuditoriaId}`)
        .set('Authorization', `Bearer ${usuarioToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });

    it('Debería obtener un registro específico por ID', async () => {
      const response = await request(app)
        .get(`/api/auditoria/${logAuditoriaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(logAuditoriaId);
    });

    it('Debería retornar 404 para ID no existente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/auditoria/${idInexistente}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it('Debería rechazar ID inválido', async () => {
      const response = await request(app)
        .get('/api/auditoria/id-invalido')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });

  describe('GET /api/auditoria/modulo/:modulo', () => {
    it('Debería rechazar acceso sin autenticación', async () => {
      const response = await request(app).get('/api/auditoria/modulo/test');
      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });

    it('Debería rechazar acceso con token de usuario no administrador', async () => {
      const response = await request(app)
        .get('/api/auditoria/modulo/test')
        .set('Authorization', `Bearer ${usuarioToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });

    it('Debería filtrar registros por módulo', async () => {
      const response = await request(app)
        .get('/api/auditoria/modulo/test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.modulo).toBe('test');
      
      // Verificar que todos los registros pertenecen al módulo especificado
      if (response.body.data.registros.length > 0) {
        const todosDelModulo = response.body.data.registros.every(
          (registro: any) => registro.modulo === 'test'
        );
        expect(todosDelModulo).toBe(true);
      }
    });

    it('Debería permitir paginación al filtrar por módulo', async () => {
      const response = await request(app)
        .get('/api/auditoria/modulo/test?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.paginacion.limite).toBe(5);
      expect(response.body.data.paginacion.pagina).toBe(1);
    });

    it('Debería rechazar parámetros de paginación inválidos', async () => {
      const response = await request(app)
        .get('/api/auditoria/modulo/test?page=0&limit=200')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });

  describe('GET /api/auditoria/usuario/:id', () => {
    it('Debería rechazar acceso sin autenticación', async () => {
      const response = await request(app).get(`/api/auditoria/usuario/${adminId}`);
      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });

    it('Debería rechazar acceso con token de usuario no administrador', async () => {
      const response = await request(app)
        .get(`/api/auditoria/usuario/${adminId}`)
        .set('Authorization', `Bearer ${usuarioToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });

    it('Debería filtrar registros por usuario', async () => {
      const response = await request(app)
        .get(`/api/auditoria/usuario/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.usuario).toBeDefined();
      expect(response.body.data.usuario.id).toBe(adminId);
      
      // Verificar que todos los registros pertenecen al usuario especificado
      if (response.body.data.registros.length > 0) {
        const todosDelUsuario = response.body.data.registros.every(
          (registro: any) => registro.usuarioId === adminId
        );
        expect(todosDelUsuario).toBe(true);
      }
    });

    it('Debería permitir paginación al filtrar por usuario', async () => {
      const response = await request(app)
        .get(`/api/auditoria/usuario/${adminId}?page=1&limit=5`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.paginacion.limite).toBe(5);
      expect(response.body.data.paginacion.pagina).toBe(1);
    });

    it('Debería rechazar parámetros de paginación inválidos', async () => {
      const response = await request(app)
        .get(`/api/auditoria/usuario/${adminId}?page=0&limit=200`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it('Debería retornar 404 para usuario no existente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/auditoria/usuario/${idInexistente}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it('Debería rechazar ID de usuario inválido', async () => {
      const response = await request(app)
        .get('/api/auditoria/usuario/id-invalido')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });
});
