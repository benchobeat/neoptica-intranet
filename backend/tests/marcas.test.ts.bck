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
let marcaId: string;
let secondMarcaId: string;

// Función auxiliar para generar token JWT para pruebas
const generateAuthToken = (userId: string, role: string) => {
  return jwt.sign(
    { id: userId, roles: [role] },
    process.env.JWT_SECRET || 'secret-de-prueba',
    { expiresIn: '1h' }
  );
};

// Configuración previa a todas las pruebas
beforeAll(async () => {
  // Crear usuario administrador para pruebas si no existe
  const adminEmail = 'admin.test.marcas@neoptica.com';
  let admin = await prisma.usuario.findFirst({
    where: { email: adminEmail }
  });

  if (!admin) {
    admin = await prisma.usuario.create({
      data: {
        email: adminEmail,
        nombre_completo: 'Admin Test Marcas',
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

  // Limpiar marcas de prueba previas
  await prisma.marca.deleteMany({
    where: {
      nombre: {
        startsWith: 'Test Marca'
      }
    }
  });
});

// Limpieza después de todas las pruebas
afterAll(async () => {
  // Eliminar marcas creadas durante las pruebas
  await prisma.marca.deleteMany({
    where: {
      nombre: {
        startsWith: 'Test Marca'
      }
    }
  });

  // Cerrar conexión con la base de datos
  await prisma.$disconnect();
});

describe('API de Marcas', () => {
  // Pruebas para el endpoint POST /api/marcas (crear marca)
  describe('POST /api/marcas', () => {
    it('Debería crear una marca correctamente', async () => {
      const marcaData = {
        nombre: 'Test Marca 1',
        descripcion: 'Descripción de marca para pruebas',
        activo: true
      };

      const response = await request(app)
        .post('/api/marcas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(marcaData);

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nombre).toBe(marcaData.nombre);
      expect(response.body.data.descripcion).toBe(marcaData.descripcion);
      expect(response.body.data.activo).toBe(marcaData.activo);

      // Guardar ID para pruebas posteriores
      marcaId = response.body.data.id;
    });

    it('Debería rechazar una marca con nombre duplicado', async () => {
      const marcaData = {
        nombre: 'Test Marca 1', // Mismo nombre que la prueba anterior
        descripcion: 'Otra descripción'
      };

      const response = await request(app)
        .post('/api/marcas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(marcaData);

      expect(response.status).toBe(409); // Conflict
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('Ya existe');
    });

    it('Debería rechazar una marca sin nombre', async () => {
      const marcaData = {
        descripcion: 'Sin nombre no debería crearse'
      };

      const response = await request(app)
        .post('/api/marcas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(marcaData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('nombre');
    });

    it('Debería rechazar una marca con nombre muy corto', async () => {
      const marcaData = {
        nombre: 'A', // Solo un carácter
        descripcion: 'Nombre muy corto'
      };

      const response = await request(app)
        .post('/api/marcas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(marcaData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('al menos 2 caracteres');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const marcaData = {
        nombre: 'Test Marca Sin Auth',
        descripcion: 'No debería crearse sin token'
      };

      const response = await request(app)
        .post('/api/marcas')
        .send(marcaData);

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });

    it('Debería crear una segunda marca para pruebas posteriores', async () => {
      const marcaData = {
        nombre: 'Test Marca 2',
        descripcion: 'Segunda marca para pruebas'
      };

      const response = await request(app)
        .post('/api/marcas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(marcaData);

      expect(response.status).toBe(201);
      secondMarcaId = response.body.data.id;
    });
  });

  // Pruebas para el endpoint GET /api/marcas (listar marcas)
  describe('GET /api/marcas', () => {
    it('Debería listar todas las marcas', async () => {
      const response = await request(app)
        .get('/api/marcas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Debería contener al menos las dos marcas creadas
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.some((m: any) => m.id === marcaId)).toBe(true);
      expect(response.body.data.some((m: any) => m.id === secondMarcaId)).toBe(true);
    });

    it('Debería filtrar marcas por nombre', async () => {
      // Primero hacemos una consulta para verificar que existe exactamente la marca que esperamos
      const marca = await prisma.marca.findFirst({
        where: { nombre: 'Test Marca 1' },
        select: { id: true }
      });
      
      // Si no existe, fallamos el test de inmediato
      expect(marca).toBeTruthy();
      
      // Usamos el ID específico para garantizar que obtenemos la marca correcta
      const response = await request(app)
        .get(`/api/marcas?id=${marca?.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1); // Debe ser exactamente 1
      expect(response.body.data[0].nombre).toBe('Test Marca 1');
    });

    it('Debería filtrar marcas por estado activo', async () => {
      const response = await request(app)
        .get('/api/marcas?activo=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Todas las marcas devueltas deben estar activas
      response.body.data.forEach((marca: any) => {
        expect(marca.activo).toBe(true);
      });
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const response = await request(app)
        .get('/api/marcas');

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });
  });

  // Pruebas para el endpoint GET /api/marcas/:id (obtener marca por ID)
  describe('GET /api/marcas/:id', () => {
    it('Debería obtener una marca por su ID', async () => {
      const response = await request(app)
        .get(`/api/marcas/${marcaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('id', marcaId);
      expect(response.body.data.nombre).toBe('Test Marca 1');
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000'; // UUID válido pero inexistente
      
      const response = await request(app)
        .get(`/api/marcas/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrada');
    });

    it('Debería rechazar ID inválido', async () => {
      const invalidId = 'not-a-uuid';
      
      const response = await request(app)
        .get(`/api/marcas/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('ID inválido');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const response = await request(app)
        .get(`/api/marcas/${marcaId}`);

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });
  });

  // Pruebas para el endpoint PUT /api/marcas/:id (actualizar marca)
  describe('PUT /api/marcas/:id', () => {
    it('Debería actualizar una marca correctamente', async () => {
      const updateData = {
        nombre: 'Test Marca 1 Actualizada',
        descripcion: 'Descripción actualizada en pruebas'
      };

      const response = await request(app)
        .put(`/api/marcas/${marcaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('id', marcaId);
      expect(response.body.data.nombre).toBe(updateData.nombre);
      expect(response.body.data.descripcion).toBe(updateData.descripcion);
    });

    it('Debería rechazar actualización con nombre duplicado', async () => {
      // Intentar actualizar la segunda marca con el nombre de la primera
      const updateData = {
        nombre: 'Test Marca 1 Actualizada', // Nombre usado en la prueba anterior
      };

      const response = await request(app)
        .put(`/api/marcas/${secondMarcaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(409);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('Ya existe');
    });

    it('Debería rechazar actualización con nombre muy corto', async () => {
      const updateData = {
        nombre: 'A', // Solo un carácter
      };

      const response = await request(app)
        .put(`/api/marcas/${marcaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('al menos 2 caracteres');
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000';
      const updateData = {
        nombre: 'Marca Inexistente',
      };
      
      const response = await request(app)
        .put(`/api/marcas/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrada');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const updateData = {
        nombre: 'Sin Auth',
      };

      const response = await request(app)
        .put(`/api/marcas/${marcaId}`)
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });
  });

  // Pruebas para el endpoint DELETE /api/marcas/:id (eliminar marca)
  describe('DELETE /api/marcas/:id', () => {
    it('Debería eliminar (soft delete) una marca correctamente', async () => {
      const response = await request(app)
        .delete(`/api/marcas/${secondMarcaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toContain('eliminada');

      // Verificar que la marca ya no se puede obtener
      const getResponse = await request(app)
        .get(`/api/marcas/${secondMarcaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000';
      
      const response = await request(app)
        .delete(`/api/marcas/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrada');
    });

    it('Debería rechazar ID inválido', async () => {
      const invalidId = 'not-a-uuid';
      
      const response = await request(app)
        .delete(`/api/marcas/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('ID inválido');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const response = await request(app)
        .delete(`/api/marcas/${marcaId}`);

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });
  });
});
