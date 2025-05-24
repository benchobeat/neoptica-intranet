# Neóptica Intranet — Backend API
## Repositorio oficial del backend de la plataforma Neóptica Intranet.
Desarrollado en Node.js + Express + TypeScript + Prisma ORM + PostgreSQL, seguro y escalable, con autenticación JWT y arquitectura modular.

## Tabla de contenidos
- Características
- Requisitos
- Configuración inicial
- Scripts principales
- Estructura de carpetas
- Variables de entorno
- Seed de base de datos
- Convenciones de respuesta API
- Endpoints principales
- Ejemplo de request/response
- Buenas prácticas
- Contribuciones y flujo de trabajo
- Licencia

## Características
- TypeScript y tipado estricto
- Express modular, imports absolutos (@/)
- Prisma ORM con PostgreSQL
- Autenticación JWT
- Sistema de roles
- Helpers estándar para responses y errores
- Semillas (seed) iniciales de usuarios y roles
- Testing y build para producción
- Fácil integración con frontend (RESTful)

## Requisitos
- Node.js v18+
- npm v9+
- PostgreSQL 13+
- [Opcional] Docker para entorno controlado

## Configuración inicial
1. Clona el repositorio
```bash
git clone <tu-repo-url>
cd neoptica-intranet/backend
```
2. Instala dependencias
```bash
npm install
```
3. Copia y edita el archivo de variables de entorno
```bash
cp .env.example .env
# Edita tus credenciales de base de datos, JWT_SECRET, SMTP, etc.
```
4. Genera el cliente Prisma y aplica migraciones
```bash
npx prisma generate
npx prisma migrate deploy # o migrate dev si estás en desarrollo
```
5. Ejecuta el seed para datos iniciales
```bash
npx prisma db seed
```
6. Arranca el backend en desarrollo
```bash
npm run dev
```

## Estructura de carpetas
```plaintext
backend/
│
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   └── index.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── build/              # Salida compilada (production)
├── .env
├── tsconfig.json
├── package.json
└── README.md
```

## Variables de entorno
Ejemplo mínimo (.env):
```ini
DATABASE_URL=postgresql://user:password@localhost:5432/neoptica_db
JWT_SECRET=tu_clave_secreta_segura
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=clave
```

## Seed de base de datos
- El script de seed crea los roles base (admin, optometrista, vendedor), un usuario administrador y asocia roles.
- Ejecuta:
```bash
npx prisma db seed
```
- Verifica que los datos iniciales estén en la base o usa npx prisma studio para inspeccionar.

## Scripts principales
```json
"scripts": {
  "dev": "nodemon --watch 'src/**/*.ts' --exec ts-node -r tsconfig-paths/register src/index.ts",
  "build": "tsc",
  "start": "node build/index.js"
}
```
- dev: desarrollo con hot reload
- build: compila TypeScript a JavaScript (/build)
- start: ejecuta el servidor en modo producción

## Helper global de respuestas
Para garantizar consistencia en las respuestas de la API (tanto en éxito como en error), el backend utiliza un helper global centralizado en src/utils/response.ts.
### Estructura
Para centralizar y garantizar este formato en todo el backend, se utiliza un helper en src/utils/response.ts:
```typescript
// src/utils/response.ts

export interface ApiResponse<T = any> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

export function success<T = any>(data: T): ApiResponse<T> {
  return {
    ok: true,
    data,
    error: null,
  };
}

export function fail(error: string, data: any = null): ApiResponse {
  return {
    ok: false,
    data,
    error,
  };
}
```

## Convenciones de respuesta API
Todas las respuestas siguen este formato uniforme:
```json
{
  "ok": true,          // Indica éxito (true) o error (false)
  "data": { ... },     // Objeto o arreglo con los datos de la respuesta (null si hubo error)
  "error": null        // Mensaje de error en caso de fallo, null si es éxito
}
```

Ejemplo de éxito:
```json
{
  "ok": true,
  "data": {
    "id": "0cd2bebd-d1eb-42b0-b040-b555cd726322",
    "nombre_completo": "Administrador General",
    "email": "admin@neoptica.com"
    // ...otros campos
  },
  "error": null
}
```

Ejemplo de error:
```json
{
  "ok": false,
  "data": null,
  "error": "Usuario no encontrado"
}
```


## Endpoints principales
- POST /api/auth/login — Login, retorna JWT y datos de usuario
- GET /api/protegido — Ruta protegida por JWT
- GET /test-email — Prueba de envío de correo
- [CRUD de usuarios, roles, sucursales, productos...] (próximos endpoints)

## Ejemplo de request/response (login)
Request
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@neoptica.com",
  "password": "Admin1234!"
}
```
Response
```json
{
  "ok": true,
  "data": {
    "token": "<jwt_token>",
    "usuario": {
      "id": "xxx-xxx-xxx",
      "nombre_completo": "Administrador General",
      "email": "admin@neoptica.com",
      "rol": "admin"
    }
  },
  "error": null
}
```
Errores comunes
Código  Causa	                    Formato de respuesta
400	    Campos faltantes	        { "ok": false, "data": null, "error": "Email y password son requeridos" }
404	    Usuario no existe	        { "ok": false, "data": null, "error": "Usuario no encontrado" }
401     Password incorrecta/JWT	  { "ok": false, "data": null, "error": "Password incorrecto" }
500	    Error interno	            { "ok": false, "data": null, "error": "Error detallado" }

## Buenas prácticas
- Usa TypeScript estricto y corrige todos los errores del compilador.
- Importa helpers, controladores y rutas con imports absolutos (@/controllers/...).
- Nunca incluyas passwords en respuestas API.
- Registra en los logs los eventos críticos (login, errores, acciones admin).
- Versiona y documenta todos los cambios y endpoints nuevos.

## Contribuciones y flujo de trabajo
- Crea ramas tipo feature/nombre, fix/nombre o hotfix/nombre.
- Haz PR hacia develop, revisa y prueba antes de mergear a main.
- Ejecuta siempre las pruebas y el seed antes de push o deploy.

## Licencia
MIT — Neóptica Intranet