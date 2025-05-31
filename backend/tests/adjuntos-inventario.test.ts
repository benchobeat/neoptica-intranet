import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { cleanDatabase, cleanTestData } from './utils/cleanDb';

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
declare const beforeEach: any;
// @ts-ignore
declare const afterEach: any;
// @ts-ignore
declare const it: any;
// @ts-ignore
declare const expect: any;

jest.setTimeout(30000); // Aumenta el timeout global de los tests a 30 segundos

// Agregamos un log para verificar que las pruebas están iniciando
// console.log('Iniciando pruebas del módulo de adjuntos de inventario...');

// Cliente Prisma para operaciones directas en la BD durante pruebas
const prisma = new PrismaClient();

// Variables globales para las pruebas
let authToken: string;
let adminToken: string;
let userToken: string;
let adminId: string;
let userId: string;
let inventarioId: string;
let movimientoId: string;
let adjuntoId: string;
let sucursalId: string;
let productoId: string;

// Rutas de archivos temporales para pruebas
const tempDir = path.join(__dirname, 'temp');
const pdfTestFilePath = path.join(tempDir, 'test-pdf.pdf');
const imageTestFilePath = path.join(tempDir, 'test-image.png');
const oversizedFilePath = path.join(tempDir, 'oversized-file.pdf');

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
  // Crear directorio temporal si no existe
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Crear archivos de prueba
  // PDF simple de prueba
  fs.writeFileSync(pdfTestFilePath, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF\n');

  // Imagen simple de prueba (1x1 pixel PNG)
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
    0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59, 0xE7, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  fs.writeFileSync(imageTestFilePath, pngHeader);

  // Archivo de más de 2MB para pruebas de validación de tamaño
  const oversizedBuffer = Buffer.alloc(2.1 * 1024 * 1024); // 2.1MB
  fs.writeFileSync(oversizedFilePath, oversizedBuffer);

  // Asegurarse de que existan los roles necesarios
  let adminRole = await prisma.rol.findFirst({ where: { nombre: 'admin' } });
  if (!adminRole) {
    // console.log('Creando rol admin...');
    adminRole = await prisma.rol.create({
      data: {
        nombre: 'admin',
        descripcion: 'Rol de administrador para pruebas'
      }
    });
  }

  // Usar el rol 'cliente' que ya existe en lugar de 'usuario'
  let userRole = await prisma.rol.findFirst({ where: { nombre: 'cliente' } });
  if (!userRole) {
    // console.log('Creando rol cliente...');
    userRole = await prisma.rol.create({
      data: {
        nombre: 'cliente',
        descripcion: 'Rol de cliente para pruebas'
      }
    });
  }

  // Crear usuario administrador para pruebas si no existe
  const adminEmail = 'admin.test.adjuntos@neoptica.com';
  let admin = await prisma.usuario.findFirst({
    where: { email: adminEmail }
  });

  if (!admin) {
    admin = await prisma.usuario.create({
      data: {
        email: adminEmail,
        nombre_completo: 'Admin Test Adjuntos',
        password: '$2b$10$vIF3vH4GQVDUMnW1EXvLWOCfueFpMLrpU9UyzFv0vSPGZe61/DLi2', // Admin1234!
        activo: true,
      }
    });

    // Asignar rol de administrador
    await prisma.usuario_rol.create({
      data: {
        usuario_id: admin.id,
        rol_id: adminRole.id,
        creado_por: null
      }
    });
  }

  // Crear usuario regular para pruebas si no existe
  const userEmail = 'user.test.adjuntos@neoptica.com';
  let user = await prisma.usuario.findFirst({
    where: { email: userEmail }
  });

  if (!user) {
    user = await prisma.usuario.create({
      data: {
        email: userEmail,
        nombre_completo: 'User Test Adjuntos',
        password: '$2b$10$vIF3vH4GQVDUMnW1EXvLWOCfueFpMLrpU9UyzFv0vSPGZe61/DLi2', // Admin1234!
        activo: true,
      }
    });

    // Asignar rol de usuario regular
    await prisma.usuario_rol.create({
      data: {
        usuario_id: user.id,
        rol_id: userRole.id,
        creado_por: null
      }
    });
  }

  adminId = admin.id;
  userId = user.id;
  adminToken = generateAuthToken(adminId, 'admin');
  userToken = generateAuthToken(userId, 'cliente');
  authToken = adminToken; // Por defecto usamos el token de admin

  // Crear datos de prueba para el inventario y movimiento
  // 1. Sucursal
  const sucursalTest = await prisma.sucursal.findFirst({
    where: { nombre: 'Sucursal Test Adjuntos' }
  });

  if (!sucursalTest) {
    const nuevaSucursal = await prisma.sucursal.create({
      data: {
        nombre: 'Sucursal Test Adjuntos',
        direccion: 'Dirección de prueba: Ciudad Test, País Test',
        telefono: '1234567890',
        email: 'sucursal.test.adjuntos@neoptica.com',
        estado: true,
        creado_por: adminId
      }
    });
    sucursalId = nuevaSucursal.id;
  } else {
    sucursalId = sucursalTest.id;
  }

  // 2. Producto
  const productoTest = await prisma.producto.findFirst({
    where: { nombre: 'Producto Test Adjuntos' }
  });

  if (!productoTest) {
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: 'Producto Test Adjuntos',
        descripcion: 'Producto para pruebas de adjuntos',
        precio: 100.50,
        creado_por: adminId
      }
    });
    productoId = nuevoProducto.id;
  } else {
    productoId = productoTest.id;
  }

  // 3. Inventario
  const inventarioTest = await prisma.inventario.findFirst({
    where: {
      producto_id: productoId,
      sucursal_id: sucursalId
    }
  });

  if (!inventarioTest) {
    const nuevoInventario = await prisma.inventario.create({
      data: {
        producto_id: productoId,
        sucursal_id: sucursalId,
        creado_por: adminId
      }
    });
    inventarioId = nuevoInventario.id;
  } else {
    inventarioId = inventarioTest.id;
  }

  // 4. Movimiento de inventario
  const movimientoTest = await prisma.movimiento_inventario.findFirst({
    where: {
      inventario_id: inventarioId,
      tipo: 'INGRESO',
      motivo: 'Movimiento para pruebas de adjuntos'
    }
  });

  if (!movimientoTest) {
    const nuevoMovimiento = await prisma.movimiento_inventario.create({
      data: {
        inventario_id: inventarioId,
        tipo: 'INGRESO',
        cantidad: 5,
        motivo: 'Movimiento para pruebas de adjuntos',
        usuario_id: adminId,
        creado_por: adminId
      }
    });
    movimientoId = nuevoMovimiento.id;
  } else {
    movimientoId = movimientoTest.id;
  }
});

// Limpieza después de todas las pruebas
afterAll(async () => {
  try {
    // console.log('Limpiando los archivos temporales...');
    
    // Eliminar archivos temporales creados para las pruebas
    if (fs.existsSync(pdfTestFilePath)) fs.unlinkSync(pdfTestFilePath);
    if (fs.existsSync(imageTestFilePath)) fs.unlinkSync(imageTestFilePath);
    if (fs.existsSync(oversizedFilePath)) fs.unlinkSync(oversizedFilePath);
    
    // Intentar eliminar el directorio
    if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    
    // Limpieza de la base de datos (opcional, depende de la política de pruebas)
    // await cleanTestData(prisma, adminId);
    
    // Cerrar la conexión a la base de datos
    await prisma.$disconnect();
  } catch (error) {
    // console.error('Error durante la limpieza:', error);
  }
});

describe('API de Adjuntos de Inventario', () => {
  // Test 1: Pruebas básicas para subir adjuntos
  describe('POST /api/inventario/:movimientoId/adjuntos', () => {
    it('Debería subir un archivo PDF correctamente', async () => {
      const response = await request(app)
        .post(`/api/inventario/${movimientoId}/adjuntos`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', pdfTestFilePath);
      
      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].extension).toBe('pdf');
      
      // Guardar el ID del adjunto para pruebas posteriores
      adjuntoId = response.body.data[0].id;
    });

    it('Debería subir una imagen correctamente', async () => {
      const response = await request(app)
        .post(`/api/inventario/${movimientoId}/adjuntos`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', imageTestFilePath);
      
      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].extension).toBe('png');
    });

    it('Debería rechazar archivos que exceden el tamaño máximo', async () => {
      const response = await request(app)
        .post(`/api/inventario/${movimientoId}/adjuntos`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', oversizedFilePath);
      
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('tamaño máximo');
    });

    it('Debería fallar si el movimiento no existe', async () => {
      const fakeMovimientoId = '00000000-0000-4000-a000-000000000000'; // UUID inexistente
      
      const response = await request(app)
        .post(`/api/inventario/${fakeMovimientoId}/adjuntos`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', pdfTestFilePath);
      
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrado');
    });

    it('Debería rechazar la solicitud sin autenticación', async () => {
      // En lugar de adjuntar un archivo, solo enviamos la solicitud para probar la autenticación
      const response = await request(app)
        .post(`/api/inventario/${movimientoId}/adjuntos`);
      
      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });
  });

  // Test 2: Pruebas para listar adjuntos
  describe('GET /api/inventario/:movimientoId/adjuntos', () => {
    it('Debería listar todos los adjuntos de un movimiento', async () => {
      const response = await request(app)
        .get(`/api/inventario/${movimientoId}/adjuntos`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2); // Al menos los 2 que subimos antes
    });

    it('Debería devolver una lista vacía para un movimiento sin adjuntos', async () => {
      // Crear un nuevo movimiento sin adjuntos
      const nuevoMovimiento = await prisma.movimiento_inventario.create({
        data: {
          inventario_id: inventarioId,
          tipo: 'INGRESO',
          cantidad: 1,
          motivo: 'Movimiento sin adjuntos para pruebas',
          usuario_id: adminId,
          creado_por: adminId
        }
      });
      
      const response = await request(app)
        .get(`/api/inventario/${nuevoMovimiento.id}/adjuntos`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
      
      // Eliminar el movimiento temporal
      await prisma.movimiento_inventario.delete({
        where: { id: nuevoMovimiento.id }
      });
    });

    it('Debería fallar si el movimiento no existe', async () => {
      const fakeMovimientoId = '00000000-0000-4000-a000-000000000000'; // UUID inexistente
      
      const response = await request(app)
        .get(`/api/inventario/${fakeMovimientoId}/adjuntos`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it('Debería rechazar la solicitud sin autenticación', async () => {
      const response = await request(app)
        .get(`/api/inventario/${movimientoId}/adjuntos`);
      
      expect(response.status).toBe(401);
    });
  });

  // Test 3: Pruebas para descargar adjuntos
  describe('GET /api/inventario/adjuntos/:adjuntoId', () => {
    it('Debería descargar un adjunto correctamente', async () => {
      // Necesitamos tener un ID de adjunto válido
      expect(adjuntoId).toBeDefined();
      
      const response = await request(app)
        .get(`/api/inventario/adjuntos/${adjuntoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-disposition']).toBeDefined();
    });

    it('Debería fallar si el adjunto no existe', async () => {
      const fakeAdjuntoId = '00000000-0000-4000-a000-000000000000'; // UUID inexistente
      
      const response = await request(app)
        .get(`/api/inventario/adjuntos/${fakeAdjuntoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it('Debería rechazar la solicitud sin autenticación', async () => {
      const response = await request(app)
        .get(`/api/inventario/adjuntos/${adjuntoId}`);
      
      expect(response.status).toBe(401);
    });
  });

  // Test 4: Pruebas para eliminar adjuntos
  describe('DELETE /api/inventario/adjuntos/:adjuntoId', () => {
    it('Debería rechazar la eliminación para usuarios no administradores', async () => {
      const response = await request(app)
        .delete(`/api/inventario/adjuntos/${adjuntoId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });

    it('Debería eliminar (soft delete) un adjunto correctamente con rol admin', async () => {
      const response = await request(app)
        .delete(`/api/inventario/adjuntos/${adjuntoId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.id).toBe(adjuntoId);
      expect(response.body.data.mensaje).toContain('eliminado');
      
      // Verificar que se realizó el soft delete correctamente
      const adjuntoEliminado = await prisma.archivo_adjunto.findUnique({
        where: { id: adjuntoId }
      });
      
      expect(adjuntoEliminado).toBeDefined();
      expect(adjuntoEliminado?.anulado_en).not.toBeNull();
      expect(adjuntoEliminado?.anulado_por).toBe(adminId);
    });

    it('Debería fallar al intentar eliminar un adjunto ya eliminado', async () => {
      const response = await request(app)
        .delete(`/api/inventario/adjuntos/${adjuntoId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('no encontrado o ya anulado');
    });

    it('Debería fallar si el adjunto no existe', async () => {
      const fakeAdjuntoId = '00000000-0000-4000-a000-000000000000'; // UUID inexistente
      
      const response = await request(app)
        .delete(`/api/inventario/adjuntos/${fakeAdjuntoId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it('Debería rechazar la solicitud sin autenticación', async () => {
      const response = await request(app)
        .delete(`/api/inventario/adjuntos/${adjuntoId}`);
      
      expect(response.status).toBe(401);
    });
  });
});
