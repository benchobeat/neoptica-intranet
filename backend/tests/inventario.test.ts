import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
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
declare const it: any;
// @ts-ignore
declare const expect: any;

jest.setTimeout(30000); // Aumenta el timeout global de los tests a 30 segundos

// Agregamos un log para verificar que las pruebas están iniciando
console.log('Iniciando pruebas del módulo de inventario...');

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
let sucursalId: string;
let productoId: string;
let colorId: string;
let marcaId: string;

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
  // Asegurarse de que existan los roles necesarios
  let adminRole = await prisma.rol.findFirst({ where: { nombre: 'admin' } });
  if (!adminRole) {
    console.log('Creando rol admin...');
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
    console.log('Creando rol cliente...');
    userRole = await prisma.rol.create({
      data: {
        nombre: 'cliente',
        descripcion: 'Rol de cliente para pruebas'
      }
    });
  }

  // Crear usuario administrador para pruebas si no existe
  const adminEmail = 'admin.test.inventario@neoptica.com';
  let admin = await prisma.usuario.findFirst({
    where: { email: adminEmail }
  });

  if (!admin) {
    admin = await prisma.usuario.create({
      data: {
        email: adminEmail,
        nombre_completo: 'Admin Test Inventario',
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
  const userEmail = 'user.test.inventario@neoptica.com';
  let user = await prisma.usuario.findFirst({
    where: { email: userEmail }
  });

  if (!user) {
    user = await prisma.usuario.create({
      data: {
        email: userEmail,
        nombre_completo: 'User Test Inventario',
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
  userToken = generateAuthToken(userId, 'usuario');
  authToken = adminToken; // Por defecto usamos el token de admin

  // Crear datos de prueba si no existen
  // 1. Sucursal
  const sucursalTest = await prisma.sucursal.findFirst({
    where: { nombre: 'Sucursal Test Inventario' }
  });

  if (!sucursalTest) {
    const nuevaSucursal = await prisma.sucursal.create({
      data: {
        nombre: 'Sucursal Test Inventario',
        direccion: 'Dirección de prueba: Ciudad Test, País Test',
        telefono: '1234567890',
        email: 'sucursal.test@neoptica.com',
        estado: true,
        creado_por: adminId
      }
    });
    sucursalId = nuevaSucursal.id;
  } else {
    sucursalId = sucursalTest.id;
  }

  // 2. Color
  const colorTest = await prisma.color.findFirst({
    where: { nombre: 'Color Test Inventario' }
  });

  if (!colorTest) {
    const nuevoColor = await prisma.color.create({
      data: {
        nombre: 'Color Test Inventario',
        descripcion: 'Color para pruebas de inventario',
        activo: true,
        creado_por: adminId
      }
    });
    colorId = nuevoColor.id;
  } else {
    colorId = colorTest.id;
  }

  // 3. Marca
  const marcaTest = await prisma.marca.findFirst({
    where: { nombre: 'Marca Test Inventario' }
  });

  if (!marcaTest) {
    const nuevaMarca = await prisma.marca.create({
      data: {
        nombre: 'Marca Test Inventario',
        descripcion: 'Marca para pruebas de inventario',
        activo: true,
        creado_por: adminId
      }
    });
    marcaId = nuevaMarca.id;
  } else {
    marcaId = marcaTest.id;
  }

  // 4. Producto
  const productoTest = await prisma.producto.findFirst({
    where: { nombre: 'Producto Test Inventario' }
  });

  if (!productoTest) {
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: 'Producto Test Inventario',
        descripcion: 'Producto para pruebas de inventario',
        precio: 100,
        activo: true,
        creado_por: adminId
      }
    });
    productoId = nuevoProducto.id;
  } else {
    productoId = productoTest.id;
  }

  // Limpiar registros de prueba previos
  await prisma.movimiento_inventario.deleteMany({
    where: {
      inventario: {
        producto: {
          nombre: 'Producto Test Inventario'
        }
      }
    }
  });

  await prisma.inventario.deleteMany({
    where: {
      producto: {
        nombre: 'Producto Test Inventario'
      }
    }
  });
});

// Limpieza después de todas las pruebas
afterAll(async () => {
  try {
    console.log('Limpiando la base de datos después de las pruebas...');
    
    // Primero, eliminamos específicamente los datos creados en nuestras pruebas
    await prisma.movimiento_inventario.deleteMany({
      where: {
        inventario: {
          producto: {
            nombre: 'Producto Test Inventario'
          }
        }
      }
    });

    await prisma.inventario.deleteMany({
      where: {
        producto: {
          nombre: 'Producto Test Inventario'
        }
      }
    });
    
    // Ahora limpiamos toda la base de datos para dejarla vacía
    // Esto eliminará todos los registros excepto usuarios y roles
    await cleanDatabase();
    
    console.log('Base de datos limpiada exitosamente después de las pruebas.');
  } catch (error) {
    console.error('Error al limpiar la base de datos después de las pruebas:', error);
  } finally {
    // Cerrar conexión con la base de datos
    await prisma.$disconnect();
  }
});

describe('API de Inventario', () => {
  // Pruebas para el endpoint POST /api/inventario (crear inventario)
  describe('POST /api/inventario', () => {
    it('Debería crear un nuevo registro de inventario correctamente', async () => {
      const nuevoInventario = {
        producto_id: productoId,
        sucursal_id: sucursalId,
        color_id: colorId,
        marca_id: marcaId,
        stock: 10,
        stock_minimo: 5
      };

      const response = await request(app)
        .post('/api/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(nuevoInventario);

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.stock).toBe(10);
      expect(response.body.data.stock_minimo).toBe(5);

      // Guardar ID para pruebas posteriores
      inventarioId = response.body.data.id;
    });

    it('Debería rechazar crear inventario sin producto_id', async () => {
      const inventarioInvalido = {
        sucursal_id: sucursalId,
        color_id: colorId,
        marca_id: marcaId,
        stock: 10,
        stock_minimo: 5
      };

      const response = await request(app)
        .post('/api/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(inventarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('producto_id');
    });

    it('Debería rechazar crear inventario con stock negativo', async () => {
      const inventarioInvalido = {
        producto_id: productoId,
        sucursal_id: sucursalId,
        color_id: colorId,
        marca_id: marcaId,
        stock: -5,
        stock_minimo: 3
      };

      const response = await request(app)
        .post('/api/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(inventarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('stock');
    });

    it('Debería rechazar crear inventario con stock_minimo negativo', async () => {
      const inventarioInvalido = {
        producto_id: productoId,
        sucursal_id: sucursalId,
        color_id: colorId,
        marca_id: marcaId,
        stock: 5,
        stock_minimo: -1
      };

      const response = await request(app)
        .post('/api/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(inventarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('stock_minimo');
    });

    it('Debería rechazar crear inventario con producto inexistente', async () => {
      const inventarioInvalido = {
        producto_id: '00000000-0000-0000-0000-000000000000',
        sucursal_id: sucursalId,
        color_id: colorId,
        marca_id: marcaId,
        stock: 5,
        stock_minimo: 2
      };

      const response = await request(app)
        .post('/api/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(inventarioInvalido);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('producto');
    });

    it('Debería rechazar crear inventario duplicado (misma combinación)', async () => {
      const inventarioDuplicado = {
        producto_id: productoId,
        sucursal_id: sucursalId,
        color_id: colorId,
        marca_id: marcaId,
        stock: 15,
        stock_minimo: 7
      };

      const response = await request(app)
        .post('/api/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(inventarioDuplicado);

      expect(response.status).toBe(409);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('Ya existe');
    });
  });

  // Pruebas para el endpoint GET /api/inventario (listar inventario)
  describe('GET /api/inventario', () => {
    it('Debería listar todos los registros de inventario', async () => {
      const response = await request(app)
        .get('/api/inventario')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('Debería filtrar inventario por sucursal_id', async () => {
      const response = await request(app)
        .get(`/api/inventario?sucursal_id=${sucursalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verificar que todos los elementos pertenecen a la sucursal
      response.body.data.forEach((item: any) => {
        expect(item.sucursal_id).toBe(sucursalId);
      });
    });

    it('Debería filtrar inventario por producto_id', async () => {
      const response = await request(app)
        .get(`/api/inventario?producto_id=${productoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verificar que todos los elementos pertenecen al producto
      response.body.data.forEach((item: any) => {
        expect(item.producto_id).toBe(productoId);
      });
    });

    it('Debería filtrar inventario por estado "bajo"', async () => {
      const response = await request(app)
        .get('/api/inventario?estado=bajo')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
  });

  // Pruebas para el endpoint GET /api/inventario/alertas (listar alertas)
  describe('GET /api/inventario/alertas', () => {
    it('Debería listar alertas de stock bajo o agotado', async () => {
      const response = await request(app)
        .get('/api/inventario/alertas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Pruebas para el endpoint GET /api/inventario/:id (obtener por ID)
  describe('GET /api/inventario/:id', () => {
    it('Debería obtener un inventario por ID correctamente', async () => {
      const response = await request(app)
        .get(`/api/inventario/${inventarioId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('id', inventarioId);
      expect(response.body.data).toHaveProperty('producto');
      expect(response.body.data).toHaveProperty('sucursal');
      expect(response.body.data).toHaveProperty('color');
      expect(response.body.data).toHaveProperty('marca');
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const response = await request(app)
        .get('/api/inventario/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });

  // Pruebas para el endpoint PUT /api/inventario/:id (actualizar inventario)
  describe('PUT /api/inventario/:id', () => {
    it('Debería actualizar un inventario correctamente', async () => {
      const datosActualizados = {
        stock_minimo: 8
      };

      const response = await request(app)
        .put(`/api/inventario/${inventarioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(datosActualizados);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('stock_minimo', 8);
    });

    it('Debería rechazar actualizar con stock negativo', async () => {
      const datosInvalidos = {
        stock: -10
      };

      const response = await request(app)
        .put(`/api/inventario/${inventarioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(datosInvalidos);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('stock');
    });

    it('Debería devolver 404 para ID inexistente', async () => {
      const response = await request(app)
        .put('/api/inventario/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ stock_minimo: 5 });

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });

  // Pruebas para el endpoint POST /api/inventario/movimientos (registrar movimiento)
  describe('POST /api/inventario/movimientos', () => {
    it('Debería registrar un ingreso correctamente', async () => {
      const nuevoMovimiento = {
        inventario_id: inventarioId,
        tipo: 'ingreso',
        cantidad: 5,
        motivo: 'Ingreso por compra'
      };

      const response = await request(app)
        .post('/api/inventario/movimientos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(nuevoMovimiento);

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('tipo', 'ingreso');
      expect(response.body.data).toHaveProperty('cantidad', 5);
      expect(response.body.data).toHaveProperty('stock_resultante');

      // Guardar ID para pruebas posteriores
      movimientoId = response.body.data.id;

      // Verificar que el stock se actualizó
      const inventarioResponse = await request(app)
        .get(`/api/inventario/${inventarioId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(inventarioResponse.body.data.stock).toBe(15); // 10 inicial + 5 ingreso
    });

    it('Debería registrar una salida correctamente', async () => {
      const nuevoMovimiento = {
        inventario_id: inventarioId,
        tipo: 'salida',
        cantidad: 3,
        motivo: 'Salida por venta'
      };

      const response = await request(app)
        .post('/api/inventario/movimientos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(nuevoMovimiento);

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('tipo', 'salida');
      expect(response.body.data).toHaveProperty('cantidad', 3);

      // Verificar que el stock se actualizó
      const inventarioResponse = await request(app)
        .get(`/api/inventario/${inventarioId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(inventarioResponse.body.data.stock).toBe(12); // 15 previo - 3 salida
    });

    it('Debería rechazar salida con cantidad mayor al stock disponible', async () => {
      const movimientoInvalido = {
        inventario_id: inventarioId,
        tipo: 'salida',
        cantidad: 100,
        motivo: 'Salida imposible'
      };

      const response = await request(app)
        .post('/api/inventario/movimientos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movimientoInvalido);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('stock');
    });

    it('Debería rechazar movimiento con cantidad cero', async () => {
      const movimientoInvalido = {
        inventario_id: inventarioId,
        tipo: 'ingreso',
        cantidad: 0,
        motivo: 'Cantidad inválida'
      };

      const response = await request(app)
        .post('/api/inventario/movimientos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movimientoInvalido);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it('Debería rechazar movimiento con tipo inválido', async () => {
      const movimientoInvalido = {
        inventario_id: inventarioId,
        tipo: 'tipoInvalido',
        cantidad: 1,
        motivo: 'Tipo inválido'
      };

      const response = await request(app)
        .post('/api/inventario/movimientos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movimientoInvalido);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('tipo');
    });

    it('Debería rechazar movimiento sin motivo', async () => {
      const movimientoInvalido = {
        inventario_id: inventarioId,
        tipo: 'ingreso',
        cantidad: 1
      };

      const response = await request(app)
        .post('/api/inventario/movimientos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movimientoInvalido);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('motivo');
    });
  });

  // Pruebas para el endpoint POST /api/inventario/movimientos/:id/reversar (reversar movimiento)
  describe('POST /api/inventario/movimientos/:id/reversar', () => {
    it('Debería reversar un movimiento correctamente (solo admin)', async () => {
      const datosReversa = {
        motivo: 'Reversión por error de ingreso'
      };

      const response = await request(app)
        .post(`/api/inventario/movimientos/${movimientoId}/reversar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(datosReversa);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('tipo', 'salida'); // Reversa de ingreso es salida
      expect(response.body.data).toHaveProperty('cantidad', 5);
      expect(response.body.data).toHaveProperty('motivo');
      expect(response.body.data.motivo).toContain('Reversión');

      // Verificar que el stock se actualizó
      const inventarioResponse = await request(app)
        .get(`/api/inventario/${inventarioId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(inventarioResponse.body.data.stock).toBe(7); // 12 previo - 5 reversión
    });

    it('Debería rechazar reversa sin motivo', async () => {
      // Primero creamos un nuevo movimiento para reversar
      const nuevoMovimiento = {
        inventario_id: inventarioId,
        tipo: 'ingreso',
        cantidad: 2,
        motivo: 'Ingreso para prueba de reversa'
      };

      const movimientoResponse = await request(app)
        .post('/api/inventario/movimientos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevoMovimiento);

      const nuevoMovimientoId = movimientoResponse.body.data.id;

      // Intentamos reversar sin motivo
      const datosReversa = {};

      const response = await request(app)
        .post(`/api/inventario/movimientos/${nuevoMovimientoId}/reversar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(datosReversa);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('motivo');
    });

    it('Debería rechazar reversa por usuario no admin', async () => {
      const datosReversa = {
        motivo: 'Intento de reversión por usuario normal'
      };

      const response = await request(app)
        .post(`/api/inventario/movimientos/${movimientoId}/reversar`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(datosReversa);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // Pruebas para el endpoint DELETE /api/inventario/:id (eliminar inventario)
  describe('DELETE /api/inventario/:id', () => {
    it('Debería eliminar (soft delete) un inventario correctamente', async () => {
      // Crear un producto específico para este test
      const testProducto = await prisma.producto.create({
        data: {
          nombre: 'Producto Test Eliminar ' + Date.now(),
          descripcion: 'Producto para prueba de eliminación',
          precio: 99.99,
          activo: true,
          creado_por: adminId
        }
      });
      
      // Crear un inventario específico para la eliminación
      const nuevoInv = await prisma.inventario.create({
        data: {
          producto_id: testProducto.id,
          sucursal_id: sucursalId,
          color_id: colorId,
          marca_id: marcaId,
          stock: 0,
          stock_minimo: 1,
          creado_por: adminId
        }
      });
      const inventarioEliminarId = nuevoInv.id;

      const response = await request(app)
        .delete(`/api/inventario/${inventarioEliminarId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);

      // Verificar que está "eliminado" (anulado)
      const inventarioEliminado = await prisma.inventario.findUnique({
        where: { id: inventarioEliminarId }
      });

      // Utilizamos casting para manejar el tipo
      expect((inventarioEliminado as any)?.anulado_en).not.toBe(null);
      expect(inventarioEliminado?.anulado_por).toBe(adminId);
    });

    it('Debería rechazar eliminar inventario con stock mayor a cero', async () => {
      const response = await request(app)
        .delete(`/api/inventario/${inventarioId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('stock');
    });

    it('Debería rechazar eliminar inventario inexistente', async () => {
      const response = await request(app)
        .delete('/api/inventario/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });
});
