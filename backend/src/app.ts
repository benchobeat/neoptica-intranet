// src/app.ts

import 'module-alias/register';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import authRoutes from '@/routes/auth';
import usuariosRoutes from '@/routes/usuarios';
import rolesRoutes from '@/routes/roles';
import sucursalesRoutes from '@/routes/sucursales';
import productoRoutes from '@/routes/producto'; // Importamos la nueva ruta
import { authenticateJWT } from '@/middlewares/auth';
import { success } from '@/utils/response';
import { sendMail } from '@/utils/mailer';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/utils/swagger';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // o usa '*' solo para pruebas locales
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/sucursales', sucursalesRoutes);
app.use('/api/productos', productoRoutes); // Registramos la nueva ruta
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({ status: 'Backend OK!' });
});

app.get('/test-email', async (req, res) => {
  try {
    await sendMail({
      to: 'correo@tucorreo.com',
      subject: 'Correo de prueba Neóptica',
      text: '¡Este es un correo de prueba enviado desde el backend!',
      html: '<b>¡Este es un correo de prueba enviado desde el backend!</b>',
    });
    res.json({ ok: true, msg: 'Correo enviado correctamente.' });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json({ ok: false, error: errorMessage });
  }
});

app.get('/api/protegido', authenticateJWT, (req, res) => {
  res.json(success((req as any).user));
});

export default app;
