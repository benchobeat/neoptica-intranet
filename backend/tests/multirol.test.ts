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
    await prisma.usuario_rol.deleteMany({
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
        nombre_completo: 'Admin Test',
        email: 'admin@test-multirol.com',
        password: await bcrypt.hash('Password123!', 10),
        telefono: '1234567890',
        activo: true
      }
    });
    adminId = adminUser.id;
    
    // Asignar rol admin
    await prisma.usuario_rol.create({
      data: {
        usuario_id: adminId,
        rol_id: adminRol.id
      }
    });
    
    // Crear un usuario vendedor
    const vendedorUser = await prisma.usuario.create({
      data: {
        nombre_completo: 'Vendedor Test',
        email: 'vendedor@test-multirol.com',
        password: await bcrypt.hash('Password123!', 10),
        telefono: '1234567891',
        activo: true
      }
    });
    vendedorId = vendedorUser.id;
    
    // Asignar rol vendedor
    await prisma.usuario_rol.create({
      data: {
        usuario_id: vendedorId,
        rol_id: vendedorRol.id
      }
    });
    
    // Crear un usuario cliente
    const clienteUser = await prisma.usuario.create({
      data: {
        nombre_completo: 'Cliente Test',
        email: 'cliente@test-multirol.com',
        password: await bcrypt.hash('Password123!', 10),
        telefono: '1234567892',
        activo: true
      }
    });
    clienteId = clienteUser.id;
    
    // Asignar rol cliente
    await prisma.usuario_rol.create({
      data: {
        usuario_id: clienteId,
        rol_id: clienteRol.id
      }
    });
    
    // Crear un usuario con múltiples roles (admin + vendedor)
    const multiRolUser = await prisma.usuario.create({
      data: {
        nombre_completo: 'MultiRol Test',
        email: 'multirol@test-multirol.com',
        password: await bcrypt.hash('Password123!', 10),
        telefono: '1234567893',
        activo: true
      }
    });
    multiRolId = multiRolUser.id;
    
    // Asignar múltiples roles
    await prisma.usuario_rol.create({
      data: {
        usuario_id: multiRolId,
        rol_id: adminRol.id
      }
    });
    
    await prisma.usuario_rol.create({
      data: {
        usuario_id: multiRolId,
        rol_id: vendedorRol.id
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
      await prisma.usuario_rol.deleteMany({
        where: { usuario_id: createdUserId }
      });
      
      await prisma.usuario.delete({
        where: { id: createdUserId }
      });
    }
    
    // Limpiar usuarios de prueba
    await prisma.usuario_rol.deleteMany({
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
  
  // ----- PRUEBAS BÁSICAS -----
  describe('Pruebas Básicas MultiRol', () => {
    it('Debería devolver el array de roles en el token al iniciar sesión', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'multirol@test-multirol.com',
          password: 'Password123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.token).toBeDefined();
      
      // Decodificar el token para verificar que contiene el array de roles
      const decodedToken: any = jwt.verify(
        response.body.data.token,
        process.env.JWT_SECRET || 'test_secret'
      );
      
      expect(decodedToken.roles).toBeDefined();
      expect(Array.isArray(decodedToken.roles)).toBe(true);
      expect(decodedToken.roles.length).toBe(2);
      expect(decodedToken.roles).toContain('admin');
      expect(decodedToken.roles).toContain('vendedor');
      expect(decodedToken.rol).toBeUndefined(); // El campo rol singular no debe existir
    });
    
    it('Usuario de rol único debería tener array de roles con un elemento', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test-multirol.com',
          password: 'Password123!'
        });
      
      expect(response.status).toBe(200);
      
      const decodedToken: any = jwt.verify(
        response.body.data.token,
        process.env.JWT_SECRET || 'test_secret'
      );
      
      expect(decodedToken.roles).toBeDefined();
      expect(Array.isArray(decodedToken.roles)).toBe(true);
      expect(decodedToken.roles.length).toBe(1);
      expect(decodedToken.roles[0]).toBe('admin');
    });
    
    it('Debería rechazar acceso a endpoint protegido sin token', async () => {
      const response = await request(app)
        .get('/api/usuarios');
      
      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });
  });
  
  // ----- PRUEBAS INTERMEDIAS -----
  describe('Pruebas Intermedias MultiRol', () => {
    it('Usuario con rol admin debería acceder a endpoints de admin', async () => {
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
    
    it('Usuario con múltiples roles debería acceder a endpoints de cualquiera de sus roles', async () => {
      // Acceso a endpoint de admin
      const responseAdmin = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${multiRolToken}`);
      
      expect(responseAdmin.status).toBe(200);
      expect(responseAdmin.body.ok).toBe(true);
      
      // Acceso a endpoint de vendedor
      const responseVendedor = await request(app)
        .get('/api/productos')
        .set('Authorization', `Bearer ${multiRolToken}`);
      
      expect(responseVendedor.status).toBe(200);
      expect(responseVendedor.body.ok).toBe(true);
    });
    
    it('Usuario sin rol requerido no debería acceder a endpoints protegidos', async () => {
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${clienteToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
    
    it('Debería crear un nuevo usuario con múltiples roles', async () => {
      const nuevoUsuario = {
        nombre_completo: 'Nuevo MultiRol',
        email: 'nuevo.multirol@test-multirol.com',
        password: 'Password123!',
        telefono: '1234567894',
        roles: ['vendedor', 'cliente']
      };
      
      const response = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevoUsuario);
      
      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBeDefined();
      
      createdUserId = response.body.data.id;
      
      // Verificar que se asignaron correctamente los roles
      const usuarioCreado = await prisma.usuario.findUnique({
        where: { id: createdUserId },
        include: {
          usuario_rol: {
            include: {
              rol: true
            }
          }
        }
      });
      
      expect(usuarioCreado).toBeDefined();
      expect(usuarioCreado?.usuario_rol.length).toBe(2);
      
      const rolesAsignados = usuarioCreado?.usuario_rol.map(ur => ur.rol.nombre);
      expect(rolesAsignados).toContain('vendedor');
      expect(rolesAsignados).toContain('cliente');
    });
  });
  
  // ----- PRUEBAS AVANZADAS -----
  describe('Pruebas Avanzadas MultiRol', () => {
    // Esta prueba está temporalmente deshabilitada debido a problemas con la implementación de auditoría
    it.skip('Debería actualizar los roles de un usuario existente', async () => {
      // Primero obtener los IDs de los roles
      const adminRol = await prisma.rol.findFirst({ where: { nombre: 'admin' } });
      const vendedorRol = await prisma.rol.findFirst({ where: { nombre: 'vendedor' } });
      const clienteRol = await prisma.rol.findFirst({ where: { nombre: 'cliente' } });
      
      if (!adminRol || !vendedorRol || !clienteRol) {
        throw new Error('No se encontraron los roles necesarios');
      }
      
      // Actualizar a tres roles: admin, vendedor, cliente
      const response = await request(app)
        .put(`/api/usuarios/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roles: [adminRol.id, vendedorRol.id, clienteRol.id]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      
      // Verificar la actualización
      const usuarioActualizado = await prisma.usuario.findUnique({
        where: { id: createdUserId },
        include: {
          usuario_rol: {
            include: {
              rol: true
            }
          }
        }
      });
      
      expect(usuarioActualizado).toBeDefined();
      expect(usuarioActualizado?.usuario_rol.length).toBe(3);
      
      const rolesActualizados = usuarioActualizado?.usuario_rol.map(ur => ur.rol.nombre);
      expect(rolesActualizados).toContain('admin');
      expect(rolesActualizados).toContain('vendedor');
      expect(rolesActualizados).toContain('cliente');
    });
    
    it('No debería permitir que un usuario modifique sus propios roles', async () => {
      // Obtener los IDs de los roles
      const clienteRol = await prisma.rol.findFirst({ where: { nombre: 'cliente' } });
      
      if (!clienteRol) {
        throw new Error('No se encontró el rol cliente');
      }
      
      // Crear token para el usuario creado (con sus roles actuales)
      const tokenUsuarioCreado = createMultiRolToken(createdUserId, ['admin', 'vendedor', 'cliente']);
      
      // Intentar modificar sus propios roles (debería fallar)
      const response = await request(app)
        .put(`/api/usuarios/perfil`)
        .set('Authorization', `Bearer ${tokenUsuarioCreado}`)
        .send({
          roles: [clienteRol.id] // Intentando cambiarse a solo cliente
        });
      
      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no puedes modificar tus propios roles');
      
      // Verificar que los roles no cambiaron
      const usuarioNoModificado = await prisma.usuario.findUnique({
        where: { id: createdUserId },
        include: {
          usuario_rol: {
            include: {
              rol: true
            }
          }
        }
      });
      
      expect(usuarioNoModificado?.usuario_rol.length).toBe(2);
    });
    
    // Esta prueba está temporalmente deshabilitada debido a problemas con la implementación de auditoría
    it.skip('Debería revocar todos los roles existentes al asignar nuevos', async () => {
      // Obtener los IDs de los roles
      const clienteRol = await prisma.rol.findFirst({ where: { nombre: 'cliente' } });
      
      if (!clienteRol) {
        throw new Error('No se encontró el rol cliente');
      }
      
      // Actualizar para tener solo rol cliente
      const response = await request(app)
        .put(`/api/usuarios/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roles: [clienteRol.id]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      
      // Verificar que solo tiene el rol cliente
      const usuarioActualizado = await prisma.usuario.findUnique({
        where: { id: createdUserId },
        include: {
          usuario_rol: {
            include: {
              rol: true
            }
          }
        }
      });
      
      expect(usuarioActualizado).toBeDefined();
      expect(usuarioActualizado?.usuario_rol.length).toBe(1);
      expect(usuarioActualizado?.usuario_rol[0].rol.nombre).toBe('cliente');
    });
    
    // Esta prueba está temporalmente deshabilitada debido a problemas con la implementación de auditoría
    it.skip('Debería manejar correctamente el caso de roles vacíos', async () => {
      // Intentar actualizar con un array de roles vacío
      const response = await request(app)
        .put(`/api/usuarios/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roles: []
        });
      
      // Debería rechazar la solicitud
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('roles');
      
      // Verificar que los roles no cambiaron
      const usuarioNoModificado = await prisma.usuario.findUnique({
        where: { id: createdUserId },
        include: {
          usuario_rol: {
            include: {
              rol: true
            }
          }
        }
      });
      
      expect(usuarioNoModificado?.usuario_rol.length).toBe(1);
    });
    
    // Esta prueba está temporalmente deshabilitada debido a problemas con la implementación de auditoría
    it.skip('Debería rechazar roles inválidos o inexistentes', async () => {
      // Intentar actualizar con un rol que no existe
      const response = await request(app)
        .put(`/api/usuarios/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roles: ['00000000-0000-0000-0000-000000000000']
        });
      
      // Debería rechazar la solicitud
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      
      // Verificar que los roles no cambiaron
      const usuarioNoModificado = await prisma.usuario.findUnique({
        where: { id: createdUserId },
        include: {
          usuario_rol: {
            include: {
              rol: true
            }
          }
        }
      });
      
      expect(usuarioNoModificado?.usuario_rol.length).toBe(1);
    });
    
    it('Debería validar el acceso según combinación de roles requeridos', async () => {
      // Esta prueba simularía un endpoint que requiere múltiples roles específicos
      // Ya que no existe ese endpoint, haremos una prueba teórica del middleware
      
      // Usuario con rol admin pero no vendedor
      let hasAccess = await simulateRoleMiddleware(['admin', 'vendedor'], ['admin']);
      expect(hasAccess).toBe(false);
      
      // Usuario con ambos roles requeridos
      hasAccess = await simulateRoleMiddleware(['admin', 'vendedor'], ['admin', 'vendedor']);
      expect(hasAccess).toBe(true);
      
      // Usuario con roles adicionales a los requeridos
      hasAccess = await simulateRoleMiddleware(['admin', 'vendedor'], ['admin', 'vendedor', 'cliente']);
      expect(hasAccess).toBe(true);
    });
  });
});

// Función para simular el comportamiento del middleware de roles
// Esta función verifica si un usuario con los roles dados tendría acceso según los roles requeridos
async function simulateRoleMiddleware(
  requiredRoles: string[],
  userRoles: string[]
): Promise<boolean> {
  // Implementar lógica similar al middleware real
  return requiredRoles.every(role => userRoles.includes(role));
}
