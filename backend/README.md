# Neóptica Intranet — Backend API
## Repositorio oficial del backend de la plataforma Neóptica Intranet.
Desarrollado en Node.js + Express + TypeScript + Prisma ORM + PostgreSQL, seguro y escalable, con autenticación JWT y arquitectura modular.

## Tabla de contenidos
- Características
- Requisitos
- Instalación y puesta en marcha
- Scripts principales
- Estructura de carpetas (actualizada)
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


## Estructura de carpetas
```plaintext
backend/
├── .env                  # Variables de entorno
├── .gitignore
├── README.md
├── jest.config.js        # Configuración de tests
├── package.json
├── package-lock.json
├── tsconfig.json         # Configuración TS
├── tsconfig.test.json    # Configuración TS para tests
├── coverage/             # Reportes de cobertura
├── node_modules/
├── prisma/
│   ├── schema.prisma     # Esquema de base de datos
│   ├── seed.ts           # Script de datos iniciales
│   └── migrations/       # Migraciones Prisma
├── src/
│   ├── app.ts            # Configuración principal Express
│   ├── index.ts          # Entry point
│   ├── controllers/      # Lógica de negocio (usuarioController.ts, etc.)
│   ├── middlewares/      # Middlewares personalizados
│   ├── prisma/           # Cliente Prisma
│   ├── routes/           # Definición de rutas (API)
│   └── utils/            # Utilidades y helpers
├── tests/
│   └── usuarios.test.ts  # Test avanzado de usuarios y edge cases
```

## Variables de entorno
Ejemplo mínimo (`.env`):
```ini
DATABASE_URL=postgresql://user:password@localhost:5432/neoptica_db
JWT_SECRET=tu_clave_secreta_segura
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=clave
```
- Ajusta las variables según tu entorno local o de producción.
- **Nunca subas tus credenciales reales al repositorio.**

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


## Endpoints REST implementados (Fase 1)
- POST   `/api/auth/login`           — Login, retorna JWT y datos de usuario)
- GET    `/api/protegido`            — Endpoint protegido de prueba (requiere JWT)
- GET    `/test-email`               — Prueba de envío de correo
- CRUD   `/api/usuarios`             — Alta, baja lógica, edición y consulta de usuarios (admin y self)
- GET    `/api/usuarios/:id`         — Consulta de usuario por ID (admin y self)
- PUT    `/api/usuarios/:id`         — Edita usuario (admin y self)
- DELETE `/api/usuarios/:id`         — Desactiva usuario (admin)
- [Próximos] CRUD roles, sucursales, productos, movimientos...

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

## Validaciones implementadas (usuarios)

- **Email:** formato válido y único (regex)
- **Password:** mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
- **Teléfono:** exactamente 10 dígitos (celular Ecuador)
- **Rol:** Debe existir en la tabla `rol` y ser uno de los definidos (admin, optometrista, vendedor, cliente)
- **No se permite editar contraseña ni rol desde el endpoint de edición estándar** (sólo en módulo especial admin)

**Códigos de error usados:**
- 400 Bad Request: datos inválidos o formato incorrecto
- 409 Conflict: email duplicado
- 403 Forbidden: intento de crear usuario sin rol admin

## Seguridad y Middleware de Roles
El backend implementa control de acceso basado en roles para todos los endpoints protegidos. Usa JWT para autenticación y un middleware dedicado para verificar permisos mínimos requeridos en cada endpoint.
Ejemplo de uso del middleware en rutas:
```typescript
import { requireRole } from '@/middlewares/roles';

// Solo admins pueden crear usuarios
router.post('/', authenticateJWT, requireRole('admin'), usuarioController.crearUsuario);
```

### Opciones de roles disponibles:
- admin
- optometrista
- vendedor
- cliente

### Recuerda:
- El endpoint de creación de usuario permite especificar el rol.
- El sistema impide modificar el rol y la contraseña desde el endpoint de edición estándar (solo por módulos especiales de administración).


## Pruebas automáticas (Jest)
El backend incluye pruebas automáticas de integración usando Jest y Supertest.
Las pruebas cubren autenticación, CRUD de usuarios y reglas de negocio básicas, garantizando que todos los endpoints respondan en el formato uniforme **{ ok, data, error }**.
Ejecutar tests:
```bash
npx jest
```
### Recomendaciones:
- Antes de correr los tests, asegúrate de tener la base en estado limpio (**npx prisma db seed**).
- Los tests de usuarios limpian la base de datos (excepto el usuario admin) al finalizar.
- Puedes ejecutar en paralelo el backend (**npm run dev**) y los tests.

## Documentación Swagger/OpenAPI
Toda la API está documentada con Swagger/OpenAPI disponible en:
```bash
GET /api/docs
```
### Incluye:
- Schemas detallados para request/response.
- Ejemplos por cada endpoint.
- Documentación de errores y validaciones.
- Autenticación JWT Bearer (token) configurable en la UI.

¿No ves el botón "Authorize" o los endpoints protegidos fallan por token?
Verifica que en **src/utils/swagger.ts** esté configurada la seguridad así:
```typescript
components: {
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }
  }
},
security: [
  {
    BearerAuth: []
  }
]
```
Y que tus endpoints incluyan **@swagger** con **security: [ { BearerAuth: [] } ]** donde corresponda.

## Validaciones y mensajes de error
Todos los campos sensibles (email, password, teléfono) tienen validaciones estrictas.
- Email: formato válido requerido (valida con regex).
- Password: debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
- Teléfono: formato celular ecuatoriano (10 dígitos).
Errores de validación retornan código 400 y mensaje claro en el campo error del response.

## Ejemplo de tests automáticos recomendados
Incluye en tu archivo **tests/usuarios.test.ts** pruebas como:
- No permite crear usuario con email inválido
- No permite crear usuario con password débil
- No permite crear usuario con número celular inválido
- No permite editar usuario si no es admin ni self
- El propio usuario puede editar sus datos
- No permite login si usuario está inactivo
### Estrategia de limpieza en tests automáticos
Las pruebas automáticas limpian la base de datos eliminando todos los usuarios excepto el admin.  
**Importante:** Se eliminan primero las asociaciones `usuario_rol`, luego los usuarios, para evitar errores de integridad referencial.
```typescript
await prisma.usuario_rol.deleteMany({ ... });
await prisma.usuario.deleteMany({ ... });
```
## Advertencia: Los roles del sistema no pueden ser modificados vía API
### Roles predefinidos y protegidos
En Neóptica Intranet, los roles de usuario (admin, optometrista, vendedor, cliente) están predefinidos y son parte de la lógica central del sistema. Por motivos de seguridad y coherencia:
- No existe ningún endpoint para crear, editar ni eliminar roles.
- Ni siquiera los usuarios con rol admin pueden modificar la tabla de roles vía API.
- Los roles solo pueden ser consultados mediante el endpoint de lectura (GET /api/roles).
- Intentar cualquier otro método (POST, PUT, DELETE) en /api/roles devolverá un error 405 (Método no permitido).
### ¿Por qué?
Permitir la manipulación dinámica de roles podría afectar la integridad, seguridad y lógica de permisos en toda la plataforma. Los cambios en roles requieren migraciones y validaciones estrictas a nivel de base de datos y código fuente.

## Ejemplo de uso del endpoint seguro de roles
Consulta de roles (solo lectura)
```sql
GET /api/roles
Authorization: Bearer <JWT>
```
Respuesta esperada:
```json
{
  "ok": true,
  "data": [
    { "id": "uuid1", "nombre": "admin", "descripcion": "Administrador global" },
    { "id": "uuid2", "nombre": "optometrista", "descripcion": "Optometrista" },
    { "id": "uuid3", "nombre": "vendedor", "descripcion": "Vendedor de óptica" },
    { "id": "uuid4", "nombre": "cliente", "descripcion": "Cliente de la óptica" }
  ],
  "error": null
}
```

## Documentación Swagger recomendada (Roles)
Agrega esto en tu archivo de rutas o controladores de roles para Swagger (puedes ajustar la sintaxis):
```typescript
/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles de usuario (SOLO lectura)
 *
 * /api/roles:
 *   get:
 *     summary: Lista todos los roles predefinidos (solo lectura)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rol'
 *                 error:
 *                   type: string
 *                   example: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       405:
 *         description: Método no permitido para roles.
 */
```
En tus schemas de Swagger:
```yaml
components:
  schemas:
    Rol:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f"
        nombre:
          type: string
          example: "admin"
        descripcion:
          type: string
          example: "Administrador global"
```

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

