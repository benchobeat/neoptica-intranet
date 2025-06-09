import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Declaraciones globales para resolver problemas de tipado con Jest
// @ts-ignore
declare const jest: any;
// @ts-ignore
declare const describe: any;
// @ts-ignore
declare const beforeAll: any;
// @ts-ignore
declare const afterAll: any;
// @ts-ignore
declare const it: any;
// @ts-ignore
declare const expect: any;

jest.setTimeout(20000); // Aumenta el timeout global de los tests a 20 segundos

// Cliente Prisma para operaciones directas en la BD durante pruebas
const prisma = new PrismaClient();

// Variables globales para las pruebas
let authToken: string;
let adminId: string;
let sucursalId: string;
let secondSucursalId: string;

// Función auxiliar para generar token JWT para pruebas
const generateAuthToken = (userId: string, role: string) => {
  return jwt.sign(
    { 
      id: userId, 
      email: 'admin.test.sucursales@neoptica.com',
      nombre_completo: 'Admin Test Sucursales',
      roles: [role] 
    },
    process.env.JWT_SECRET || 'secret-de-prueba',
    { expiresIn: '1h' }
  );
};

// Configuración previa a todas las pruebas
beforeAll(async () => {
  // Crear usuario administrador para pruebas si no existe
  const adminEmail = 'admin.test.sucursales@neoptica.com';
  let admin = await prisma.usuario.findFirst({
    where: { email: adminEmail }
  });

  if (!admin) {
    admin = await prisma.usuario.create({
      data: {
        email: adminEmail,
        nombre_completo: 'Admin Test Sucursales',
        password: '$2b$10$vIF3vH4GQVDUMnW1EXvLWOCfueFpMLrpU9UyzFv0vSPGZe61/DLi2', // Admin1234!
        activo: true,
      }
    });

    // Asignar rol de administrador
    // Buscar el rol 'admin' y asignar el id
    const adminRole = await prisma.rol.findFirst({ where: { nombre: 'admin' } });
    if (!adminRole) throw new Error('No existe el rol admin en la base de datos');
    await prisma.usuario_rol.create({
      data: {
        usuario_id: admin.id,
        rol_id: adminRole.id,
        creado_por: null // Explícitamente null para evitar error de tipo
      }
    });
  }

  adminId = admin.id;
  authToken = generateAuthToken(adminId, 'admin');

  // Limpiar sucursales de prueba previas
  await prisma.sucursal.deleteMany({
    where: {
      nombre: {
        startsWith: 'Test Sucursal'
      }
    }
  });
});

// Limpieza después de todas las pruebas
afterAll(async () => {
  // Cerrar conexión con la base de datos
  await prisma.$disconnect();
});

describe('API de Sucursales', () => {
  // Pruebas para el endpoint POST /api/sucursales (crear sucursal)
  describe('POST /api/sucursales', () => {
    it('Debería crear una sucursal correctamente', async () => {
      const sucursalData = {
        nombre: 'Test Sucursal 1',
        direccion: 'Calle Test 123, Ciudad Test',
        telefono: '1234567890',
        email: 'sucursal1@test.com',
        latitud: 19.4326,
        longitud: -99.1332,
        estado: true
      };

      const response = await request(app)
        .post('/api/sucursales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sucursalData);

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nombre).toBe(sucursalData.nombre);
      expect(response.body.data.direccion).toBe(sucursalData.direccion);
      expect(response.body.data.telefono).toBe(sucursalData.telefono);
      expect(response.body.data.email).toBe(sucursalData.email);
      expect(response.body.data.latitud).toBe(sucursalData.latitud);
      expect(response.body.data.longitud).toBe(sucursalData.longitud);
      expect(response.body.data.estado).toBe(sucursalData.estado);

      // Guardar ID para pruebas posteriores
      sucursalId = response.body.data.id;
    });

    it('Debería rechazar una sucursal con nombre duplicado', async () => {
      const sucursalData = {
        nombre: 'Test Sucursal 1', // Mismo nombre que la prueba anterior
        direccion: 'Otra dirección'
      };

      const response = await request(app)
        .post('/api/sucursales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sucursalData);

      expect(response.status).toBe(409);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('Ya existe');
    });

    it('Debería rechazar una sucursal con email duplicado', async () => {
      const sucursalData = {
        nombre: 'Test Sucursal Duplicada',
        email: 'sucursal1@test.com' // Mismo email que la primera sucursal
      };

      const response = await request(app)
        .post('/api/sucursales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sucursalData);

      expect(response.status).toBe(409);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('email');
    });

    it('Debería rechazar una sucursal sin nombre', async () => {
      const sucursalData = {
        direccion: 'Sucursal sin nombre'
      };

      const response = await request(app)
        .post('/api/sucursales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sucursalData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('obligatorio');
    });

    it('Debería rechazar una sucursal con nombre muy corto', async () => {
      const sucursalData = {
        nombre: 'AB', // Solo dos caracteres (mínimo 3)
        direccion: 'Nombre demasiado corto'
      };

      const response = await request(app)
        .post('/api/sucursales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sucursalData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('al menos 3 caracteres');
    });

    it('Debería rechazar una sucursal con teléfono inválido', async () => {
      const sucursalData = {
        nombre: 'Test Sucursal Teléfono',
        telefono: '123456' // Menos de 10 dígitos
      };

      const response = await request(app)
        .post('/api/sucursales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sucursalData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('10 dígitos');
    });

    it('Debería rechazar una sucursal con email inválido', async () => {
      const sucursalData = {
        nombre: 'Test Sucursal Email',
        email: 'no-es-email'
      };

      const response = await request(app)
        .post('/api/sucursales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sucursalData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('formato inválido');
    });

    it('Debería rechazar una sucursal con coordenadas inválidas', async () => {
      const sucursalData = {
        nombre: 'Test Sucursal Coordenadas',
        latitud: 100, // Mayor que 90
        longitud: -200 // Menor que -180
      };

      const response = await request(app)
        .post('/api/sucursales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sucursalData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('latitud');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const sucursalData = {
        nombre: 'Test Sucursal Sin Auth',
        direccion: 'No debería crearse'
      };

      const response = await request(app)
        .post('/api/sucursales')
        .send(sucursalData);

      expect(response.status).toBe(401);
    });

    // Crear una segunda sucursal para pruebas posteriores
    it('Debería crear una segunda sucursal para pruebas', async () => {
      const sucursalData = {
        nombre: 'Test Sucursal 2',
        direccion: 'Segunda sucursal para pruebas',
        telefono: '9876543210',
        email: 'sucursal2@test.com',
        estado: true
      };

      const response = await request(app)
        .post('/api/sucursales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sucursalData);

      expect(response.status).toBe(201);
      secondSucursalId = response.body.data.id;
    });
  });

  // Pruebas para el endpoint GET /api/sucursales (listar sucursales)
  describe('GET /api/sucursales', () => {
    it('Debería listar sucursales correctamente', async () => {
      const response = await request(app)
        .get('/api/sucursales')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verificar que las sucursales creadas estén en la lista
      const sucursalesIds = response.body.data.map((sucursal: any) => sucursal.id);
      expect(sucursalesIds).toContain(sucursalId);
      expect(sucursalesIds).toContain(secondSucursalId);
    });

    it('Debería filtrar sucursales por estado', async () => {
      const response = await request(app)
        .get('/api/sucursales?estado=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      
      // Todos los resultados deben tener estado = true
      const todasActivas = response.body.data.every((sucursal: any) => sucursal.estado === true);
      expect(todasActivas).toBe(true);
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const response = await request(app)
        .get('/api/sucursales');

      expect(response.status).toBe(401);
    });
  });

  // Pruebas para el endpoint GET /api/sucursales/:id (obtener sucursal por ID)
  describe('GET /api/sucursales/:id', () => {
    it('Debería obtener una sucursal por ID correctamente', async () => {
      const response = await request(app)
        .get(`/api/sucursales/${sucursalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.id).toBe(sucursalId);
      expect(response.body.data.nombre).toBe('Test Sucursal 1');
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000'; // UUID válido pero no existente
      
      const response = await request(app)
        .get(`/api/sucursales/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrada');
    });

    it('Debería rechazar ID inválido', async () => {
      const invalidId = 'not-a-uuid';
      
      const response = await request(app)
        .get(`/api/sucursales/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('ID inválido');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const response = await request(app)
        .get(`/api/sucursales/${sucursalId}`);

      expect(response.status).toBe(401);
    });
  });

  // Pruebas para el endpoint PUT /api/sucursales/:id (actualizar sucursal)
  describe('PUT /api/sucursales/:id', () => {
    it('Debería actualizar una sucursal correctamente', async () => {
      const updateData = {
        nombre: 'Test Sucursal 1 Actualizada',
        direccion: 'Dirección actualizada',
        telefono: '5555555555'
      };

      const response = await request(app)
        .put(`/api/sucursales/${sucursalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.nombre).toBe(updateData.nombre);
      expect(response.body.data.direccion).toBe(updateData.direccion);
      expect(response.body.data.telefono).toBe(updateData.telefono);
    });

    it('Debería rechazar actualización con nombre duplicado', async () => {
      const updateData = {
        nombre: 'Test Sucursal 2' // Nombre que ya existe en la segunda sucursal
      };

      const response = await request(app)
        .put(`/api/sucursales/${sucursalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(409);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('Ya existe');
    });

    it('Debería rechazar actualización con email duplicado', async () => {
      const updateData = {
        email: 'sucursal2@test.com' // Email que ya existe en la segunda sucursal
      };

      const response = await request(app)
        .put(`/api/sucursales/${sucursalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(409);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('email');
    });

    it('Debería rechazar actualización con nombre muy corto', async () => {
      const updateData = {
        nombre: 'AB', // Solo dos caracteres (mínimo 3)
      };

      const response = await request(app)
        .put(`/api/sucursales/${sucursalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('al menos 3 caracteres');
    });

    it('Debería rechazar actualización con teléfono inválido', async () => {
      const updateData = {
        telefono: '123456' // Menos de 10 dígitos
      };

      const response = await request(app)
        .put(`/api/sucursales/${sucursalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('10 dígitos');
    });

    it('Debería permitir actualización de algunos campos manteniendo otros', async () => {
      const updateData = {
        direccion: 'Nueva dirección parcial'
      };

      const response = await request(app)
        .put(`/api/sucursales/${sucursalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.direccion).toBe(updateData.direccion);
      expect(response.body.data.nombre).toBe('Test Sucursal 1 Actualizada'); // Nombre no cambia
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000';
      const updateData = {
        nombre: 'Sucursal Inexistente',
      };
      
      const response = await request(app)
        .put(`/api/sucursales/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrada');
    });

    it('Debería rechazar ID inválido', async () => {
      const invalidId = 'not-a-uuid';
      const updateData = {
        nombre: 'Sucursal ID Inválido',
      };
      
      const response = await request(app)
        .put(`/api/sucursales/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('ID inválido');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const updateData = {
        nombre: 'Sucursal Sin Auth',
      };

      const response = await request(app)
        .put(`/api/sucursales/${sucursalId}`)
        .send(updateData);

      expect(response.status).toBe(401);
    });
  });

  // Pruebas para el endpoint DELETE /api/sucursales/:id (eliminar sucursal)
  describe('DELETE /api/sucursales/:id', () => {
    it('Debería eliminar (soft delete) una sucursal correctamente', async () => {
      const response = await request(app)
        .delete(`/api/sucursales/${secondSucursalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toContain('eliminada');

      // Verificar que la sucursal ya no se puede obtener
      const getResponse = await request(app)
        .get(`/api/sucursales/${secondSucursalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000';
      
      const response = await request(app)
        .delete(`/api/sucursales/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrada');
    });

    it('Debería rechazar ID inválido', async () => {
      const invalidId = 'not-a-uuid';
      
      const response = await request(app)
        .delete(`/api/sucursales/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('ID inválido');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const response = await request(app)
        .delete(`/api/sucursales/${sucursalId}`);

      expect(response.status).toBe(401);
    });
  });
});
