import 'module-alias/register';
import dotenv from 'dotenv';
import express from 'express';

import authRoutes from '@/routes/auth';
import { authenticateJWT } from '@/middlewares/auth';
import { success } from '@/utils/response';
import { sendMail } from '@/utils/mailer';

// 1. Cargar variables de entorno
dotenv.config();

// 2. Crear la app de Express
const app = express();

// 3. Middlewares globales
app.use(express.json()); // Para parsear JSON en requests

// 4. Montar rutas
app.use('/api/auth', authRoutes);

// 5. Endpoints de prueba y utilidad
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

// 6. Endpoint protegido de prueba
app.get('/api/protegido', authenticateJWT, (req, res) => {
  res.json(success((req as any).user));
});

// 7. Arrancar el servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
