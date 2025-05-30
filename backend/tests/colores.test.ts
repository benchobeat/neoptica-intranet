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
let colorId: string;
let secondColorId: string;

// Función auxiliar para generar token JWT para pruebas
const generateAuthToken = (userId: string, role: string) => {
  return jwt.sign(
    { id: userId, rol: role },
    process.env.JWT_SECRET || 'secret-de-prueba',
    { expiresIn: '1h' }
  );
};

// Configuración previa a todas las pruebas
beforeAll(async () => {
  // Crear usuario administrador para pruebas si no existe
  const adminEmail = 'admin.test.colores@neoptica.com';
  let admin = await prisma.usuario.findFirst({
    where: { email: adminEmail }
  });

  if (!admin) {
    admin = await prisma.usuario.create({
      data: {
        email: adminEmail,
        nombre_completo: 'Admin Test Colores',
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

  // Limpiar colores de prueba previos
  await prisma.color.deleteMany({
    where: {
      nombre: {
        startsWith: 'Test Color'
      }
    }
  });
});

// Limpieza después de todas las pruebas
afterAll(async () => {
  // Eliminar colores creados durante las pruebas
  await prisma.color.deleteMany({
    where: {
      nombre: {
        startsWith: 'Test Color'
      }
    }
  });

  // Cerrar conexión con la base de datos
  await prisma.$disconnect();
});

describe('API de Colores', () => {
  // Pruebas para el endpoint POST /api/colores (crear color)
  describe('POST /api/colores', () => {
    it('Debería crear un color correctamente', async () => {
      const colorData = {
        nombre: 'Test Color 1',
        descripcion: 'Descripción de color para pruebas',
        activo: true
      };

      const response = await request(app)
        .post('/api/colores')
        .set('Authorization', `Bearer ${authToken}`)
        .send(colorData);

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nombre).toBe(colorData.nombre);
      expect(response.body.data.descripcion).toBe(colorData.descripcion);
      expect(response.body.data.activo).toBe(colorData.activo);

      // Guardar ID para pruebas posteriores
      colorId = response.body.data.id;
    });

    it('Debería rechazar un color con nombre duplicado', async () => {
      const colorData = {
        nombre: 'Test Color 1', // Mismo nombre que la prueba anterior
        descripcion: 'Otra descripción'
      };

      const response = await request(app)
        .post('/api/colores')
        .set('Authorization', `Bearer ${authToken}`)
        .send(colorData);

      expect(response.status).toBe(409);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('Ya existe');
    });

    it('Debería rechazar un color sin nombre', async () => {
      const colorData = {
        descripcion: 'Color sin nombre'
      };

      const response = await request(app)
        .post('/api/colores')
        .set('Authorization', `Bearer ${authToken}`)
        .send(colorData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('obligatorio');
    });

    it('Debería rechazar un color con nombre muy corto', async () => {
      const colorData = {
        nombre: 'A', // Solo un carácter
        descripcion: 'Nombre demasiado corto'
      };

      const response = await request(app)
        .post('/api/colores')
        .set('Authorization', `Bearer ${authToken}`)
        .send(colorData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('al menos 2 caracteres');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const colorData = {
        nombre: 'Test Color Sin Auth',
        descripcion: 'No debería crearse'
      };

      const response = await request(app)
        .post('/api/colores')
        .send(colorData);

      expect(response.status).toBe(401);
    });

    // Crear un segundo color para pruebas posteriores
    it('Debería crear un segundo color para pruebas', async () => {
      const colorData = {
        nombre: 'Test Color 2',
        descripcion: 'Segundo color para pruebas',
        activo: true
      };

      const response = await request(app)
        .post('/api/colores')
        .set('Authorization', `Bearer ${authToken}`)
        .send(colorData);

      expect(response.status).toBe(201);
      secondColorId = response.body.data.id;
    });
  });

  // Pruebas para el endpoint GET /api/colores (listar colores)
  describe('GET /api/colores', () => {
    it('Debería listar colores correctamente', async () => {
      const response = await request(app)
        .get('/api/colores')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verificar que los colores creados estén en la lista
      const coloresIds = response.body.data.map((color: any) => color.id);
      expect(coloresIds).toContain(colorId);
      expect(coloresIds).toContain(secondColorId);
    });

    it('Debería filtrar colores por estado activo', async () => {
      const response = await request(app)
        .get('/api/colores?activo=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      
      // Todos los resultados deben tener activo = true
      const todosActivos = response.body.data.every((color: any) => color.activo === true);
      expect(todosActivos).toBe(true);
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const response = await request(app)
        .get('/api/colores');

      expect(response.status).toBe(401);
    });
  });

  // Pruebas para el endpoint GET /api/colores/:id (obtener color por ID)
  describe('GET /api/colores/:id', () => {
    it('Debería obtener un color por ID correctamente', async () => {
      const response = await request(app)
        .get(`/api/colores/${colorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.id).toBe(colorId);
      expect(response.body.data.nombre).toBe('Test Color 1');
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000'; // UUID válido pero no existente
      
      const response = await request(app)
        .get(`/api/colores/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrado');
    });

    it('Debería rechazar ID inválido', async () => {
      const invalidId = 'not-a-uuid';
      
      const response = await request(app)
        .get(`/api/colores/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('ID inválido');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const response = await request(app)
        .get(`/api/colores/${colorId}`);

      expect(response.status).toBe(401);
    });
  });

  // Pruebas para el endpoint PUT /api/colores/:id (actualizar color)
  describe('PUT /api/colores/:id', () => {
    it('Debería actualizar un color correctamente', async () => {
      const updateData = {
        nombre: 'Test Color 1 Actualizado',
        descripcion: 'Descripción actualizada'
      };

      const response = await request(app)
        .put(`/api/colores/${colorId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.nombre).toBe(updateData.nombre);
      expect(response.body.data.descripcion).toBe(updateData.descripcion);
    });

    it('Debería rechazar actualización con nombre duplicado', async () => {
      const updateData = {
        nombre: 'Test Color 2' // Nombre que ya existe en el segundo color
      };

      const response = await request(app)
        .put(`/api/colores/${colorId}`)
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
        .put(`/api/colores/${colorId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('al menos 2 caracteres');
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000';
      const updateData = {
        nombre: 'Color Inexistente',
      };
      
      const response = await request(app)
        .put(`/api/colores/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrado');
    });

    it('Debería rechazar ID inválido', async () => {
      const invalidId = 'not-a-uuid';
      const updateData = {
        nombre: 'Color ID Inválido',
      };
      
      const response = await request(app)
        .put(`/api/colores/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('ID inválido');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const updateData = {
        nombre: 'Color Sin Auth',
      };

      const response = await request(app)
        .put(`/api/colores/${colorId}`)
        .send(updateData);

      expect(response.status).toBe(401);
    });
  });

  // Pruebas para el endpoint DELETE /api/colores/:id (eliminar color)
  describe('DELETE /api/colores/:id', () => {
    it('Debería eliminar (soft delete) un color correctamente', async () => {
      const response = await request(app)
        .delete(`/api/colores/${secondColorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toContain('eliminado');

      // Verificar que el color ya no se puede obtener
      const getResponse = await request(app)
        .get(`/api/colores/${secondColorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-4000-a000-000000000000';
      
      const response = await request(app)
        .delete(`/api/colores/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrado');
    });

    it('Debería rechazar ID inválido', async () => {
      const invalidId = 'not-a-uuid';
      
      const response = await request(app)
        .delete(`/api/colores/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('ID inválido');
    });

    it('Debería rechazar petición sin autenticación', async () => {
      const response = await request(app)
        .delete(`/api/colores/${colorId}`);

      expect(response.status).toBe(401);
    });
  });
});
