// src/index.ts

import 'dotenv/config';
import express, { Request, Response } from 'express';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '@/config/swagger';

import { authenticateJWT } from '@/middlewares/auth';
import { success } from '@/utils/response';
import { sendMail } from '@/utils/mailer';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Endpoint de salud
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'Backend OK!' });
});

// Endpoint de prueba de correo
app.get('/test-email', async (req: Request, res: Response) => {
  try {
    await sendMail({
      to: 'correo@tucorreo.com', // Cambia por tu email real si quieres
      subject: 'Correo de prueba Neóptica',
      text: '¡Este es un correo de prueba enviado desde el backend!',
      html: '<b>¡Este es un correo de prueba enviado desde el backend!</b>',
    });
    res.json({ ok: true, msg: 'Correo enviado correctamente.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Endpoint protegido de prueba
app.get('/api/protegido', authenticateJWT, (req: Request, res: Response) => {
  // El usuario autenticado estará en req.user (asignado por el middleware)
  return res.json(success((req as any).user));
});

// Swagger/OpenAPI docs (deja esto al final para evitar pisar otras rutas)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
