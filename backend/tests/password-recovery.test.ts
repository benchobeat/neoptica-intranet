import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/app';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/// <reference types="jest" />

const prisma = new PrismaClient();

describe('Password Recovery', () => {
  let testUser: any;
  let testEmail: string;
  let resetToken: string;
  
  // Crear un usuario de prueba antes de todos los tests
  beforeAll(async () => {
    // Generar email único para evitar conflictos en tests concurrentes
    testEmail = `test.recovery.${Date.now()}@example.com`;
    
    // Crear usuario de prueba
    testUser = await prisma.usuario.create({
      data: {
        nombre_completo: 'Usuario Test Recuperación',
        email: testEmail,
        password: await bcrypt.hash('TestPass123!', 10),
        telefono: '0987654321',
        activo: true
        // No incluimos creado_por ya que es un UUID y el sistema asignará el valor por defecto
      }
    });

    // Buscar rol cliente
    const rolCliente = await prisma.rol.findFirst({
      where: { nombre: 'cliente' }
    });

    if (rolCliente) {
      // Asignar rol al usuario
      await prisma.usuario_rol.create({
        data: {
          usuario_id: testUser.id,
          rol_id: rolCliente.id
        }
      });
    }
  });

  // Limpiar datos de prueba después de todos los tests
  afterAll(async () => {
    // Solo limpiar si se creó el usuario de prueba
    if (testUser?.id) {
      // Eliminar tokens de recuperación
      await prisma.reset_token.deleteMany({
        where: { usuario_id: testUser.id }
      });
      
      // Eliminar roles del usuario
      await prisma.usuario_rol.deleteMany({
        where: { usuario_id: testUser.id }
      });
      
      // Eliminar usuario de prueba
      await prisma.usuario.delete({
        where: { id: testUser.id }
      });
    }

    // Cerrar conexión
    await prisma.$disconnect();
  });

  describe('POST /api/auth/forgot-password', () => {
    it('debería rechazar una petición sin email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('debería procesar un email existente y crear token', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testEmail });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      
      // Verificar que se haya creado un token
      const token = await prisma.reset_token.findFirst({
        where: { usuario_id: testUser.id }
      });
      
      expect(token).toBeDefined();
      
      // Guardar token para pruebas siguientes (nota: en un caso real no tendríamos acceso directo)
      resetToken = crypto.randomBytes(32).toString('hex');
      
      // Actualizar el token en la base de datos para que coincida con el que usaremos
      await prisma.reset_token.update({
        where: { id: token!.id },
        data: { token: await bcrypt.hash(resetToken, 10) }
      });
    });

    it('debería responder con éxito a un email inexistente (por seguridad)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'noexiste@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      // No verificamos el mensaje para no dar pistas
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('debería rechazar una petición sin datos completos', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: resetToken });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it('debería rechazar un token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          token: 'token-invalido',
          email: testEmail,
          password: 'NuevaPass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it('debería rechazar un email que no existe', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          token: resetToken,
          email: 'noexiste@example.com',
          password: 'NuevaPass123!'
        });

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it('debería rechazar una contraseña débil', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          token: resetToken,
          email: testEmail,
          password: 'debil'
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it('debería restablecer la contraseña con datos válidos', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          token: resetToken,
          email: testEmail,
          password: 'NuevaPass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      
      // Verificar que podemos iniciar sesión con la nueva contraseña
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: testEmail,
          password: 'NuevaPass123!'
        });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.ok).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();
    });

    it('debería invalidar el token después de usarlo', async () => {
      // Intentar usar el mismo token nuevamente
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          token: resetToken,
          email: testEmail,
          password: 'OtraPass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });
});
