import request from 'supertest';
import app from '@/app'; // en vez de '@/index'

describe('Usuarios API', () => {
  let token: string;

  it('Debe hacer login correctamente y devolver un token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@neoptica.com',
        password: 'Admin1234!' // ajusta si tu seed cambió el password
      });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  it('Debe listar usuarios si se provee un JWT válido', async () => {
    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
