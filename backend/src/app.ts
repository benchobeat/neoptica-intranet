// src/app.ts

import 'module-alias/register';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

// Extendemos el tipo Request para incluir las propiedades que añadimos en los middlewares
interface ExtendedRequest extends Request {
  invalidJson?: boolean;
  jsonError?: string;
}

import { authenticateJWT } from '@/middlewares/auth';
import auditoriaRoutes from '@/routes/auditoria'; // Importamos la ruta de auditoría
import authRoutes from '@/routes/auth';
import categoriaRoutes from '@/routes/categoria'; // Importamos la ruta de categorías
import colorRoutes from '@/routes/color'; // Importamos la ruta de colores
import marcaRoutes from '@/routes/marca'; // Importamos la ruta de marcas
import productoRoutes from '@/routes/producto';
import rolesRoutes from '@/routes/roles';
import sucursalesRoutes from '@/routes/sucursales';
import testMultirolRoutes from '@/routes/test-multirol'; // Importamos rutas de prueba para multirol
import usuariosRoutes from '@/routes/usuarios';
import { sendMail } from '@/utils/mailer';
import { success, fail } from '@/utils/response';
import { swaggerSpec } from '@/utils/swagger';

import passport from './config/passport';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Usar variable de entorno para el frontend
    credentials: true,
  })
);

// Configuración de express.json con manejo de errores personalizado
app.use(
  express.json({
    strict: true, // Solo acepta objetos y arrays
    verify: (
      req: Request & { invalidJson?: boolean; jsonError?: string },
      res: Response,
      buf: Buffer
    ) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        const error = e as Error;
        req.invalidJson = true;
        req.jsonError = error.message;
      }
    },
  })
);

// Middleware para manejar errores de JSON inválido
app.use((err: Error & { body?: unknown }, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json(
      fail('JSON inválido en el cuerpo de la petición', {
        field: 'body',
        message: 'El cuerpo de la petición no es un JSON válido',
        details: err.message,
      })
    );
  }
  next();
});

// Middleware para verificar si el JSON era inválido
app.use((req: ExtendedRequest, res: Response, next: NextFunction) => {
  if (req.invalidJson) {
    return res.status(400).json(
      fail('JSON inválido', {
        field: 'body',
        message: 'El cuerpo de la petición no es un JSON válido',
        details: req.jsonError,
      })
    );
  }
  next();
});
app.use(passport.initialize());
// Si usas sesiones:
// import session from 'express-session';
// app.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }));
// app.use(passport.session());
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/sucursales', sucursalesRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/marcas', marcaRoutes); // Registramos la ruta de marcas
app.use('/api/categorias', categoriaRoutes); // Registramos la ruta de categorías
app.use('/api/colores', colorRoutes); // Registramos la ruta de colores
app.use('/api/auditoria', auditoriaRoutes); // Registramos la ruta de auditoría
app.use('/api', testMultirolRoutes); // Registramos las rutas de prueba para multirol
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

// Usamos la definición global de Express.User que ya existe en src/types/express.d.ts
interface RequestWithUser extends Request {
  user?: Express.User;
}

// Usamos el tipo extendido
app.get('/api/protegido', authenticateJWT, ((req: RequestWithUser, res: Response) => {
  res.json(success(req.user));
}) as RequestHandler);

export default app;
