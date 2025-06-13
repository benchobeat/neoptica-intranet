import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let adminToken: string;

beforeAll(async () => {
  // Autenticación admin para obtener token válido
  const admin = await prisma.usuario.findFirst({ where: { email: 'admin@neoptica.com' } });
  if (!admin) throw new Error('Usuario admin no encontrado en seed');
  // Login para obtener JWT
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: admin.email, password: 'Admin1234!' });
  adminToken = res.body.data.token;
}, 20000);

describe('Roles API', () => {
  it('Solo permite listar roles (GET /api/roles)', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('nombre');
  });

  it('No permite crear roles (POST /api/roles)', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'nuevo', descripcion: 'prohibido' });
    expect(res.status).toBe(405);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/no permitido|not allowed/i);
  });

  it('No permite modificar roles (PUT /api/roles/:id)', async () => {
    const rol = await prisma.rol.findFirst();
    const res = await request(app)
      .put(`/api/roles/${rol?.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'editado' });
    expect(res.status).toBe(405);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/no permitido|not allowed/i);
  });

  it('No permite borrar roles (DELETE /api/roles/:id)', async () => {
    const rol = await prisma.rol.findFirst();
    const res = await request(app)
      .delete(`/api/roles/${rol?.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(405);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/no permitido|not allowed/i);
  });

  it('Requiere autenticación JWT', async () => {
    const res = await request(app)
      .get('/api/roles');
    expect(res.status).toBe(401);
  });
});
