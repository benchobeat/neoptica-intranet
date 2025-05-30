# Neóptica Intranet — Backend API

## Módulos recientes: Color y Marca

Se han agregado los módulos **Color** y **Marca** al backend para una gestión más granular de productos ópticos:
- **Color**: Permite registrar, listar y administrar los colores disponibles para productos (lentes, armazones, etc.).
- **Marca**: Permite registrar, listar y administrar las marcas comerciales de productos.

Ambos módulos siguen la arquitectura, validación, seguridad y convenciones del proyecto (Express + Prisma + JWT + roles). Sus endpoints son RESTful y están alineados a la convención `{ ok, data, error }`.

**Endpoints esperados:**
- `/api/colores`: CRUD de colores
- `/api/marcas`: CRUD de marcas

Recuerda documentar estos módulos en Swagger y agregar tests una vez implementados.

## Repositorio oficial del backend de la plataforma Neóptica Intranet.
Desarrollado en Node.js + Express + TypeScript + Prisma ORM + PostgreSQL, seguro y escalable, con autenticación JWT y arquitectura modular.

## Tabla de contenidos
- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Scripts principales](#scripts-principales)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Variables de entorno](#variables-de-entorno)
- [Seed de base de datos](#seed-de-base-de-datos)
- [Convenciones de respuesta API](#convenciones-de-respuesta-api)
- [Guía para implementación de CRUD](#guía-para-implementación-de-crud)
- [Configuración de autenticación](#configuración-de-autenticación)
- [Testing y buenas prácticas](#testing-y-buenas-prácticas)
- [Endpoints principales](#endpoints-principales)
- [Documentación Swagger](#documentación-swagger)
- [Checklist de Fase 1](#checklist-de-fase-1)
- [Módulos recientes: Color y Marca](#modulos-recientes-color-y-marca)
- [Contribuciones y flujo de trabajo](#contribuciones-y-flujo-de-trabajo)
- [Licencia](#licencia)

## Características
- Módulos recientes: **Color** y **Marca** agregados al esquema y planificación (ver sección dedicada).
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
  ├── src/
  │   ├── controllers/
  │   │   ├── productoController.ts
  │   │   ├── colorController.ts        # Nuevo módulo
  │   │   └── marcaController.ts        # Nuevo módulo
  │   ├── routes/
  │   │   ├── producto.ts
  │   │   ├── color.ts                  # Nuevo módulo
  │   │   └── marca.ts                  # Nuevo módulo
  │   └── ...
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
- **Auth**
  - POST   `/api/auth/login`           — Login, retorna JWT y datos de usuario
  - POST   `/api/auth/google`          — Inicia autenticación con Google OAuth
  - GET    `/api/auth/google/callback` — Callback para autenticación Google
  - POST   `/api/auth/facebook`        — Inicia autenticación con Facebook OAuth
  - GET    `/api/auth/facebook/callback` — Callback para autenticación Facebook
  - POST   `/api/auth/instagram`       — Inicia autenticación con Instagram OAuth
  - GET    `/api/auth/instagram/callback` — Callback para autenticación Instagram

- **Usuarios**
  - GET    `/api/usuarios`             — Lista usuarios (admin)
  - POST   `/api/usuarios`             — Crea usuario (admin)
  - GET    `/api/usuarios/:id`         — Consulta usuario por ID (admin y self)
  - PUT    `/api/usuarios/:id`         — Edita usuario (admin y self)
  - DELETE `/api/usuarios/:id`         — Desactiva usuario (admin)
  - POST   `/api/usuarios/:id/reset-password` — Cambio de contraseña (admin)
  
- **Roles**
  - GET    `/api/roles`                — Lista roles disponibles (solo lectura)

- **Productos**
  - GET    `/api/productos`            — Lista productos (paginado y filtrado)
  - POST   `/api/productos`            — Crea producto (admin, vendedor, optometrista)
  - GET    `/api/productos/:id`        — Consulta producto por ID
  - PUT    `/api/productos/:id`        — Edita producto (admin, vendedor, optometrista)
  - DELETE `/api/productos/:id`        — Desactiva producto (admin)

- **Utilidades**
  - GET    `/api/protegido`            — Endpoint protegido de prueba (requiere JWT)
  - GET    `/test-email`               — Prueba de envío de correo
  - GET    `/api/docs`                 — Documentación Swagger/OpenAPI

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

## Guía para implementación de CRUD

Sigue estos lineamientos al crear nuevos endpoints CRUD para asegurar robustez y consistencia:

### 1. Estructura del controlador

Todo controlador debe seguir este patrón para cada operación CRUD:

```typescript
export const crearEntidad = async (req: Request, res: Response) => {
  try {
    // 1. Extraer y validar datos de entrada
    const { campo1, campo2, ... } = req.body;
    
    // 2. Validación estricta de tipos y valores
    if (typeof campo1 !== 'string' || campo1.trim().length < 2) {
      return res.status(400).json({ ok: false, data: null, error: 'Mensaje de error claro' });
    }
    
    // 3. Operación de base de datos con Prisma
    const nuevaEntidad = await prisma.entidad.create({
      data: {
        campo1: campo1.trim(),  // Siempre limpia strings
        campo2: campo2 ?? valorDefault,  // Usa valores default seguros
      },
    });
    
    // 4. Respuesta de éxito con formato estándar
    res.status(201).json({ ok: true, data: nuevaEntidad, error: null });
  } catch (error: any) {
    // 5. Manejo de errores específicos de Prisma
    console.error('Error detallado:', error);
    if (error.code === 'P2002') { // Error de unicidad
      return res.status(409).json({ ok: false, data: null, error: 'Ya existe un registro con ese valor único.' });
    }
    // 6. Error genérico
    res.status(500).json({ ok: false, data: null, error: 'Ocurrió un error al procesar la solicitud.' });
  }
};

export const listarEntidades = async (req: Request, res: Response) => {
  try {
    // 1. Procesar parámetros de filtrado y paginación
    const page = Number(normalizeParam(req.query.page, 1));
    const limit = Number(normalizeParam(req.query.limit, 20));
    const q = normalizeParam(req.query.q, '');
    
    // 2. Validar y normalizar parámetros
    const pageNum = page > 0 ? page : 1;
    const limitNum = limit > 0 && limit <= 100 ? limit : 20;
    const skip = (pageNum - 1) * limitNum;
    
    // 3. Construir condiciones de búsqueda
    const where: Record<string, any> = {};
    if (q.trim().length > 0) {
      where.OR = [
        { campo1: { contains: q.trim(), mode: 'insensitive' } },
        // Otros campos para búsqueda
      ];
    }
    
    // 4. Ejecutar consulta con contador total
    const [entidades, total] = await Promise.all([
      prisma.entidad.findMany({ where, skip, take: limitNum, orderBy: { campo1: 'asc' } }),
      prisma.entidad.count({ where })
    ]);
    
    // 5. Respuesta con datos y metadatos de paginación
    res.status(200).json({
      ok: true,
      data: entidades,
      error: null,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error al listar entidades:', error);
    res.status(500).json({ ok: false, data: null, error: 'Ocurrió un error al listar las entidades.' });
  }
};
```

### 2. Validaciones recomendadas por tipo de dato

- **Strings**: Validar longitud mínima/máxima y formato (ej. con regex para emails)
- **Números**: Validar rango, tipo y valor positivo/negativo según caso
- **URLs**: Validar formato con regex `^https?:\/\/.+`
- **Fechas**: Validar formato y rango válido
- **IDs**: Validar formato UUID si aplica
- **Arrays**: Validar longitud y contenido

### 3. Configuración de rutas

Toda ruta debe seguir este patrón:

```typescript
router.post('/', authenticateJWT, requireRole('admin', 'otroRol'), controlador.crearEntidad);
router.get('/', authenticateJWT, controlador.listarEntidades);
router.get('/:id', authenticateJWT, controlador.obtenerEntidad);
router.put('/:id', authenticateJWT, requireRole('admin'), controlador.actualizarEntidad);
router.delete('/:id', authenticateJWT, requireRole('admin'), controlador.eliminarEntidad);
```

### 4. Helpers recomendados

**Para normalizar query params:**

```typescript
function normalizeParam<T = string>(param: any, fallback: T): T {
  if (Array.isArray(param)) {
    return param[0] ?? fallback;
  }
  return (param ?? fallback) as T;
}

function normalizeBooleanParam(param: any): boolean | undefined {
  if (Array.isArray(param)) param = param[0];
  if (param === true || param === 'true' || param === 1 || param === '1') return true;
  if (param === false || param === 'false' || param === 0 || param === '0') return false;
  return undefined;
}
```

## Configuración de autenticación

### JWT y middleware de autenticación

Asegúrate de implementar correctamente la autenticación JWT:

1. **Configuración de secreto**: Usa una variable de entorno segura
   ```
   JWT_SECRET=clave_segura_y_compleja_min_32_caracteres
   ```

2. **Emisor de tokens**: Al emitir tokens en login/registro, incluye:
   - ID de usuario
   - Roles del usuario
   - Tiempo de expiración (max 24h)

3. **Middleware de autenticación**: Siempre usa el middleware centralizado:
   ```typescript
   import { authenticateJWT } from '@/middlewares/auth';
   router.get('/ruta-protegida', authenticateJWT, miControlador);
   ```

### OAuth (Google, Facebook, Instagram)

**Importante**: Los callbacks de OAuth deben configurarse correctamente:

```
# URLs de callback (deben coincidir EXACTAMENTE con las configuradas en cada proveedor)
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FACEBOOK_CALLBACK_URL=http://localhost:4000/api/auth/facebook/callback
INSTAGRAM_CALLBACK_URL=http://localhost:4000/api/auth/instagram/callback

# URL de redirección al frontend tras autenticación exitosa
FRONTEND_URL=http://localhost:3000
```

**Recordatorio**: 
- En desarrollo, los callbacks deben apuntar al backend, NO al frontend.
- En producción, actualiza las URLs en los dashboards de cada proveedor OAuth.

### Control de roles y permisos

Utiliza el middleware de roles para proteger endpoints:

```typescript
import { requireRole } from '@/middlewares/roles';

// Ruta accesible solo para admin
router.delete('/:id', authenticateJWT, requireRole('admin'), controlador.eliminarEntidad);

// Ruta accesible para admin O vendedor O optometrista
router.post('/', authenticateJWT, requireRole('admin','vendedor','optometrista'), controlador.crearEntidad);
```

## Testing y buenas prácticas

### Estructura de tests recomendada

Todos los tests deben seguir el patrón:

```typescript
describe('Módulo de Entidades', () => {
  let token: string;
  
  beforeAll(async () => {
    // Obtener token válido mediante login
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@neoptica.com',
      password: 'Admin1234!',
    });
    token = res.body.data.token;
  });
  
  describe('Creación de entidad', () => {
    it('debe crear una entidad válida', async () => { /* ... */ });
    it('debe rechazar datos inválidos', async () => { /* ... */ });
  });
  
  describe('Listado de entidades', () => {
    it('debe listar entidades paginadas', async () => { /* ... */ });
    it('debe filtrar por nombre', async () => { /* ... */ });
  });
});
```

### Buenas prácticas generales

- **TypeScript estricto**: Usa tipos explícitos y corrige todos los errores del compilador.
- **Imports absolutos**: Usa rutas absolutas (`@/controllers/...`) en lugar de relativas.
- **No exponer datos sensibles**: Nunca incluyas passwords en respuestas API.
- **Logging**: Registra eventos críticos (login, errores, acciones admin).
- **Documentación**: Documenta con Swagger todos los endpoints nuevos.
- **Validación estricta**: Valida todos los inputs, no confíes en datos del cliente.
- **Formato de respuesta**: Siempre usa el formato `{ ok, data, error }` para todas las respuestas.
- **Manejo de errores**: Captura y maneja específicamente los errores de Prisma.
- **Borrado lógico**: Implementa borrado lógico en lugar de físico para entidades principales.
- **Middleware JWT**: Siempre protege rutas no públicas con `authenticateJWT`.

## Checklist de Fase 1

### Productos
- [x] Crear producto
- [x] Listar productos
- [x] Obtener producto por ID
- [x] Actualizar producto
- [x] Eliminar producto (borrado lógico)

### Colores (nuevo)
- [ ] Crear color
- [ ] Listar colores
- [ ] Obtener color por ID
- [ ] Actualizar color
- [ ] Eliminar color (borrado lógico)

### Marcas (nuevo)
- [ ] Crear marca
- [ ] Listar marcas
- [ ] Obtener marca por ID
- [ ] Actualizar marca
- [ ] Eliminar marca (borrado lógico)


Utiliza esta lista para verificar el avance y completitud de la Fase 1 del proyecto:

### 1. Configuración y estructura base

- [x] Repositorio configurado con Git
- [x] Estructura de carpetas modular implementada
- [x] TypeScript configurado con tsconfig.json
- [x] Variables de entorno en .env (y .env.example)
- [x] Cliente Prisma y esquema de base de datos
- [x] Servidor Express configurado
- [x] Configuración CORS para frontend

### 2. Base de datos y modelos

- [x] Modelo Usuario implementado
- [x] Modelo Rol implementado
- [x] Modelo Producto implementado
- [ ] Modelo Sucursal implementado
- [ ] Modelo Stock implementado
- [ ] Modelo Venta implementado
- [ ] Modelo Cliente implementado
- [x] Relaciones entre modelos definidas
- [x] Migraciones de base de datos creadas
- [x] Seed de datos básicos implementado

### 3. Autenticación y seguridad

- [x] Login tradicional con JWT
- [x] OAuth con Google
- [x] OAuth con Facebook
- [x] OAuth con Instagram
- [x] Middleware authenticateJWT
- [x] Middleware requireRole
- [x] Validación de contraseñas seguras
- [x] Envío de emails configurado
- [ ] Recuperación de contraseña

### 4. Endpoints de Usuarios

- [x] Creación de usuario (validaciones)
- [x] Listado de usuarios (paginado/filtrado)
- [x] Obtener usuario por ID
- [x] Actualizar usuario
- [x] Eliminar usuario (borrado lógico)
- [x] Cambio de contraseña
- [x] Asignación de roles

### 5. Endpoints de Productos

- [x] Creación de producto (validaciones)
- [x] Listado de productos (paginado/filtrado)
- [ ] Obtener producto por ID
- [ ] Actualizar producto
- [ ] Eliminar producto (borrado lógico)

### 6. Endpoints de Roles

- [x] Listado de roles disponibles
- [x] Restricción de modificación de roles

### 7. Documentación

- [x] Swagger/OpenAPI implementado
- [x]## Endpoints principales

### Productos
- `GET    /api/productos`           — Lista productos (paginado, filtro)
- `POST   /api/productos`           — Crear producto (admin, vendedor, optometrista)
- `GET    /api/productos/:id`       — Obtener producto por ID
- `PUT    /api/productos/:id`       — Actualizar producto
- `DELETE /api/productos/:id`       — Eliminar producto (borrado lógico, admin)

### Colores (nuevo)
- `GET    /api/colores`             — Lista colores disponibles
- `POST   /api/colores`             — Crear color (admin)
- `GET    /api/colores/:id`         — Obtener color por ID
- `PUT    /api/colores/:id`         — Actualizar color
- `DELETE /api/colores/:id`         — Eliminar color (borrado lógico, admin)

### Marcas (nuevo)
- `GET    /api/marcas`              — Lista marcas disponibles
- `POST   /api/marcas`              — Crear marca (admin)
- `GET    /api/marcas/:id`          — Obtener marca por ID
- `PUT    /api/marcas/:id`          — Actualizar marca
- `DELETE /api/marcas/:id`          — Eliminar marca (borrado lógico, admin)
 documentados
- [ ] Diagrama de base de datos actualizado
- [x] README.md completo
- [ ] Ejemplos de uso en Postman

### 8. Testing

- [x] Tests de autenticación
- [x] Tests de usuarios
- [x] Tests de roles
- [x] Tests de productos
- [ ] Tests de sucursales

### 9. Listo para producción

- [x] Script de build configurado
- [ ] Variables de entorno de producción
- [ ] Logs de errores configurados
- [ ] Docker/Dockerización (opcional)
- [ ] CI/CD pipeline (opcional)

### 10. Próximos pasos (Fase 2)

- [ ] Gestión de sucursales
- [ ] Gestión de inventario
- [ ] Gestión de ventas
- [ ] Reportes y estadísticas
- [ ] Panel de administración

## Problemas comunes y soluciones

### Autenticación OAuth

**Problema**: Error `redirect_uri_mismatch` en OAuth de Google/Facebook/Instagram.

**Solución**: 
1. Asegurarse de que los callback URLs en `.env` coincidan EXACTAMENTE con los configurados en los dashboards de desarrollador de cada proveedor.
2. Recordar que los callbacks deben apuntar al backend (puerto 4000), no al frontend.
3. En desarrollo local usar `http://localhost:4000/api/auth/[proveedor]/callback`.

### Testing

**Problema**: Fallos en tests por falta de autenticación JWT válida.

**Solución**:
1. Siempre obtener un token válido mediante login real al inicio de cada suite de tests.
2. No confiar en tokens estáticos o variables de entorno para tests.
3. Utilizar `beforeAll` para realizar el login y obtener el token.

### Validación de datos

**Problema**: Errores 500 por datos inválidos no validados.

**Solución**:
1. Implementar validación estricta de todos los campos en cada controlador.
2. Verificar tipos, rangos y formatos antes de operaciones de base de datos.
3. Devolver código 400 con mensaje claro cuando la validación falla.

## Contribuciones y flujo de trabajo
- Crea ramas tipo feature/nombre, fix/nombre o hotfix/nombre.
- Usa Conventional Commits (feat, fix, docs, chore, etc).
- Siempre documenta los cambios en el README.

## Licencia
Propiedad de Neóptica. Todos los derechos reservados.
