import request from 'supertest';
import { PrismaClient } from "@prisma/client";

// Aumentar timeout a 30 segundos para todos los tests en este archivo
jest.setTimeout(30000);
import app from '../src/app';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
// Referencia a los tipos de Jest para resolver los errores de TS
/// <reference types="jest" />

const prisma = new PrismaClient();

// Función auxiliar para crear tokens JWT con múltiples roles
const createMultiRolToken = (id: string, roles: string[]) => {
  return jwt.sign(
    { 
      id, 
      email: 'test@example.com', 
      nombreCompleto: 'Usuario de Prueba', 
      roles 
    },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

describe('Sistema MultiRol', () => {
  // Variables para los tests
  let adminId: string;
  let vendedorId: string;
  let clienteId: string;
  let multiRolId: string;
  
  let adminToken: string;
  let vendedorToken: string;
  let clienteToken: string;
  let multiRolToken: string;
  
  let createdUserId: string;
  
  // Antes de todas las pruebas, preparar los usuarios y tokens
  beforeAll(async () => {
    // Limpiar usuarios de prueba anteriores
    await prisma.usuarioRol.deleteMany({
      where: {
        usuario: {
          email: {
            endsWith: '@test-multirol.com'
          }
        }
      }
    });
    
    await prisma.usuario.deleteMany({
      where: {
        email: {
          endsWith: '@test-multirol.com'
        }
      }
    });
    
    // Obtener los IDs de los roles
    const adminRol = await prisma.rol.findFirst({ where: { nombre: 'admin' } });
    const vendedorRol = await prisma.rol.findFirst({ where: { nombre: 'vendedor' } });
    const clienteRol = await prisma.rol.findFirst({ where: { nombre: 'cliente' } });
    
    if (!adminRol || !vendedorRol || !clienteRol) {
      throw new Error('No se encontraron los roles necesarios para las pruebas');
    }
    
    // Crear un usuario administrador
    const adminUser = await prisma.usuario.create({
      data: {
        nombreCompleto: 'Admin Test',
        email: 'admin@test-multirol.com',
        password: await bcrypt.hash('Password123!', 10),
        telefono: '1234567890',
        activo: true
      }
    });
    adminId = adminUser.id;
    
    // Asignar rol admin
    await prisma.usuarioRol.create({
      data: {
        usuarioId: adminUser.id,
        rolId: adminRol.id,
        creadoEn: new Date()
      }
    });
    
    // Crear un usuario vendedor
    const vendedorUser = await prisma.usuario.create({
      data: {
        nombreCompleto: 'Vendedor Test',
        email: 'vendedor@test-multirol.com',
        password: await bcrypt.hash('Password123!', 10),
        telefono: '1234567891',
        activo: true
      }
    });
    vendedorId = vendedorUser.id;
    
    // Asignar rol vendedor
    await prisma.usuarioRol.create({
      data: {
        usuarioId: vendedorId,
        rolId: vendedorRol.id,
        creadoEn: new Date()
      }
    });
    
    // Crear un usuario cliente
    const clienteUser = await prisma.usuario.create({
      data: {
        nombreCompleto: 'Cliente Test',
        email: 'cliente@test-multirol.com',
        password: await bcrypt.hash('Password123!', 10),
        telefono: '1234567892',
        activo: true
      }
    });
    clienteId = clienteUser.id;
    
    // Asignar rol cliente
    await prisma.usuarioRol.create({
      data: {
        usuarioId: clienteId,
        rolId: clienteRol.id,
        creadoEn: new Date()
      }
    });
    
    // Crear un usuario con múltiples roles (admin + vendedor)
    const multiRolUser = await prisma.usuario.create({
      data: {
        nombreCompleto: 'MultiRol Test',
        email: 'multirol@test-multirol.com',
        password: await bcrypt.hash('Password123!', 10),
        telefono: '1234567893',
        activo: true
      }
    });
    multiRolId = multiRolUser.id;
    
    // Asignar múltiples roles
    await prisma.usuarioRol.create({
      data: {
        usuarioId: multiRolId,
        rolId: adminRol.id,
        creadoEn: new Date()
      }
    });
    
    await prisma.usuarioRol.create({
      data: {
        usuarioId: multiRolId,
        rolId: vendedorRol.id,
        creadoEn: new Date()
      }
    });
    
    // Crear tokens JWT para cada usuario
    adminToken = createMultiRolToken(adminId, ['admin']);
    vendedorToken = createMultiRolToken(vendedorId, ['vendedor']);
    clienteToken = createMultiRolToken(clienteId, ['cliente']);
    multiRolToken = createMultiRolToken(multiRolId, ['admin', 'vendedor']);
  });
  
  // Después de todas las pruebas, limpiar los datos
  afterAll(async () => {
    if (createdUserId) {
      await prisma.usuarioRol.deleteMany({
        where: { usuarioId: createdUserId }
      });
      
      await prisma.usuario.delete({
        where: { id: createdUserId }
      });
    }
    
    // Limpiar usuarios de prueba
    await prisma.usuarioRol.deleteMany({
      where: {
        usuario: {
          email: {
            endsWith: '@test-multirol.com'
          }
        }
      }
    });
    
    await prisma.usuario.deleteMany({
      where: {
        email: {
          endsWith: '@test-multirol.com'
        }
      }
    });
    
    await prisma.$disconnect();
  });
  
  // Prueba de autenticación de usuario admin
  it('debe permitir el acceso a ruta de admin con token de admin', async () => {
    const response = await request(app)
      .get('/api/admin/ruta-protegida')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ok', true);
    expect(response.body.data).toHaveProperty('message', 'Acceso concedido');
  });
  
  // Prueba de acceso denegado a ruta de admin con token de cliente
  it('debe denegar el acceso a ruta de admin con token de cliente', async () => {
    const response = await request(app)
      .get('/api/admin/ruta-protegida')
      .set('Authorization', `Bearer ${clienteToken}`);
    
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });
  
  // Prueba de usuario con múltiples roles
  it('debe permitir el acceso a ruta de vendedor con usuario multirol', async () => {
    const response = await request(app)
      .get('/api/vendedor/ruta-protegida')
      .set('Authorization', `Bearer ${multiRolToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ok', true);
    expect(response.body.data).toHaveProperty('message', 'Acceso concedido');
  });
  
  // Función para simular el comportamiento del middleware de roles
  // Esta función verifica si un usuario con los roles dados tendría acceso según los roles requeridos
  async function simulateRoleMiddleware(requiredRoles: string[], userRoles: string[]): Promise<boolean> {
    return requiredRoles.some(role => userRoles.includes(role));
  }
});
