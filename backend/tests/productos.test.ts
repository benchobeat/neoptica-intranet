import request from 'supertest';
import app from '../src/app';

jest.setTimeout(20000); // Aumenta el timeout global de los tests a 20 segundos

describe('Endpoints de Productos', () => {
  let token: string;

  beforeAll(async () => {
    // Obtener un token válido de administrador mediante login
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@neoptica.com',
      password: 'Admin1234!',
    });
    
    // console.log('Respuesta login:', res.body);
    
    if (!res.body.ok || !res.body.data || !res.body.data.token) {
      // console.error('No se pudo obtener un token válido:', res.body);
      throw new Error('No se pudo obtener un token válido para las pruebas');
    }
    
    token = res.body.data.token;
    // console.log('Token obtenido:', token ? 'Token válido' : 'Token vacío');
  });

  describe('POST /api/productos', () => {
    it('debe crear un producto válido', async () => {
      const res = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Producto Test',
          descripcion: 'Un producto de prueba',
          precio: 99.99,
          categoria: 'Test',
          imagen_url: 'https://example.com/img.jpg',
          modelo_3d_url: 'https://example.com/model.glb',
          activo: true
        });
      // console.log('POST /api/productos respuesta:', res.body);
      if (res.status !== 201) {
        // Log de error
        // console.error('Error al crear producto:', res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.nombre).toBe('Producto Test');
    });

    it('debe rechazar producto sin nombre', async () => {
      const res = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send({ precio: 10 });
      // console.log('POST /api/productos (sin nombre) respuesta:', res.body);
      if (res.status !== 400) {
        // console.error('Error esperado (sin nombre):', res.body);
      }
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });

    it('debe rechazar precio inválido', async () => {
      const res = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Test', precio: -5 });
      // console.log('POST /api/productos (precio inválido) respuesta:', res.body);
      if (res.status !== 400) {
        // console.error('Error esperado (precio inválido):', res.body);
      }
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });

  let productoId: string;

  describe('GET /api/productos/:id', () => {
    it('debe obtener un producto existente por ID', async () => {
      // Crear producto primero
      const createRes = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Producto Para GetById',
          descripcion: 'Producto para pruebas getById',
          precio: 50,
          categoria: 'Test',
          imagen_url: 'https://example.com/img2.jpg',
          modelo_3d_url: 'https://example.com/model2.glb',
          activo: true
        });
      expect(createRes.status).toBe(201);
      productoId = createRes.body.data.id;
      const res = await request(app)
        .get(`/api/productos/${productoId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.id).toBe(productoId);
    });
    it('debe devolver 404 si el producto no existe', async () => {
      // Usar un UUID válido pero que no existe
      const res = await request(app)
        .get('/api/productos/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
    });
    it('debe devolver 400 si el ID es inválido', async () => {
      const res = await request(app)
        .get('/api/productos/123')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });

  describe('PUT /api/productos/:id', () => {
    it('debe actualizar un producto existente', async () => {
      // Crear producto
      const createRes = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Producto Para Update',
          descripcion: 'Producto para pruebas update',
          precio: 70,
          categoria: 'Test',
          imagen_url: 'https://example.com/img3.jpg',
          modelo_3d_url: 'https://example.com/model3.glb',
          activo: true
        });
      expect(createRes.status).toBe(201);
      const id = createRes.body.data.id;
      const res = await request(app)
        .put(`/api/productos/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Producto Actualizado', precio: 80 });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.nombre).toBe('Producto Actualizado');
      expect(Number(res.body.data.precio)).toBe(80);
    });
    it('debe devolver 404 si el producto no existe', async () => {
      // Usar un UUID válido pero que no existe
      const res = await request(app)
        .put('/api/productos/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'No existe' });
      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
    });
    it('debe devolver 400 si el ID es inválido', async () => {
      const res = await request(app)
        .put('/api/productos/123')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Inválido' });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
    it('debe devolver 400 si el nombre es inválido', async () => {
      // Crear producto
      const createRes = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Producto Para Update2',
          descripcion: 'Producto para pruebas update2',
          precio: 70,
          categoria: 'Test',
          imagen_url: 'https://example.com/img4.jpg',
          modelo_3d_url: 'https://example.com/model4.glb',
          activo: true
        });
      expect(createRes.status).toBe(201);
      const id = createRes.body.data.id;
      const res = await request(app)
        .put(`/api/productos/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: '' });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });

  describe('DELETE /api/productos/:id', () => {
    it('debe desactivar (soft delete) un producto existente', async () => {
      // Crear producto
      const createRes = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Producto Para Delete',
          descripcion: 'Producto para pruebas delete',
          precio: 60,
          categoria: 'Test',
          imagen_url: 'https://example.com/img5.jpg',
          modelo_3d_url: 'https://example.com/model5.glb',
          activo: true
        });
      expect(createRes.status).toBe(201);
      const id = createRes.body.data.id;
      const res = await request(app)
        .delete(`/api/productos/${id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.activo).toBe(false);
    });
    it('debe devolver 404 si el producto no existe', async () => {
      // Usar un UUID válido pero que no existe
      const res = await request(app)
        .delete('/api/productos/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
    });
    it('debe devolver 400 si el ID es inválido', async () => {
      const res = await request(app)
        .delete('/api/productos/invalid-id')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });

  describe('GET /api/productos', () => {
    it('debe listar productos (paginado)', async () => {
      const res = await request(app)
        .get('/api/productos')
        .set('Authorization', `Bearer ${token}`);
      // console.log('GET /api/productos respuesta:', res.body);
      if (res.status !== 200) {
        // console.error('Error al listar productos:', res.body);
      }
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
    });
    it('debe filtrar por nombre', async () => {
      const res = await request(app)
        .get('/api/productos?q=Producto Test')
        .set('Authorization', `Bearer ${token}`);
      // console.log('GET /api/productos?q=Producto Test respuesta:', res.body);
      if (res.status !== 200) {
        // console.error('Error al filtrar productos:', res.body);
      }
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      if (!Array.isArray(res.body.data)) {
        // console.error('Respuesta inesperada al filtrar productos:', res.body);
      }
      expect(res.body.data.some((p: any) => p.nombre === 'Producto Test')).toBe(true);
    });
  });
});
