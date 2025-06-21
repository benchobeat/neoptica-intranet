# Mejores Prácticas para el Desarrollo Backend

> **Versión:** 3.0 (Junio 2025)  
> **Autor:** Equipo de Desarrollo Neóptica  
> **Estado:** Documento vivo - Se actualizará con nuevas prácticas y lecciones aprendidas

## Tabla de Contenidos
- [1. Estructura de Controladores](#1-estructura-de-controladores)
- [2. Tipado con Prisma](#2-tipado-con-prisma)
- [3. Manejo de Errores](#3-manejo-de-errores)
- [4. Auditoría](#4-auditoría)
- [5. Validación de Datos](#5-validación-de-datos)
- [6. Estructura de Archivos](#6-estructura-de-archivos)
- [7. Pruebas](#7-pruebas)

## 1. Estructura de Controladores

### 1.1. Estructura Básica de un Controlador

Cada controlador debe seguir esta estructura básica:

```typescript
// 1. Importaciones
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { registrarAuditoria } from '../utils/audit';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import { validateEntityInput } from '../utils/validations';
import prisma from '../utils/prisma';

// 2. Tipos personalizados si son necesarios
type EntityWithRelations = Prisma.EntityGetPayload<{
  include: {
    // Relaciones a incluir
  };
}>;

// 3. Funciones del controlador
export const crearEntidad = async (
  req: Request<{}, {}, EntityCreateInput>,
  res: Response<ApiResponse<EntityWithRelations>>
) => {
  const userId = req.user?.id;
  
  try {
    // 4. Validación de entrada
    const validacion = validateEntityInput(req.body);
    if ('error' in validacion) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: validacion.error
      });
    }

    // 5. Lógica de negocio
    const entidad = await prisma.entity.create({
      data: {
        ...validacion,
        creadoPor: userId,
      },
      include: {
        // Incluir relaciones necesarias
      },
    });

    // 6. Auditoría
    await registrarAuditoria({
      userId,
      ip: req.ip,
      entityType: 'entidad',
      entityId: entidad.id,
      module: 'entidadController',
      action: 'crear_entidad',
      message: 'Entidad creada exitosamente',
    });

    // 7. Respuesta exitosa
    return res.status(201).json({
      ok: true,
      data: entidad,
      error: null,
    });
  } catch (error) {
    // 8. Manejo de errores
    console.error('Error al crear entidad:', error);
    
    await registrarAuditoria({
      userId,
      ip: req.ip,
      entityType: 'entidad',
      module: 'entidadController',
      action: 'error_crear_entidad',
      message: 'Error al crear entidad',
      error,
    });

    // 9. Respuesta de error
    const { status, response } = createErrorResponse(
      'Error interno del servidor al crear la entidad',
      500
    );
    return res.status(status).json(response);
  }
};
```

### 1.2. Convenciones de Nombrado

- Usar verbos para los nombres de las funciones: `crearProducto`, `actualizarProducto`, `eliminarProducto`
- Usar nombres descriptivos para variables y funciones
- Seguir el patrón `tipoAccion_entidad` para acciones de auditoría: `crear_producto`, `actualizar_producto`, `eliminar_producto`

## 2. Tipado con Prisma

### 2.1. Uso de Tipos Generados

Siempre usar los tipos generados por Prisma para garantizar la seguridad de tipos:

```typescript
// Usar tipos generados por Prisma
import { Prisma } from '@prisma/client';

type ProductoWithRelations = Prisma.ProductoGetPayload<{
  include: {
    marca: true;
    color: true;
    categoria: true;
    inventarios: {
      include: {
        sucursal: true;
      };
    };
  };
}>;
```

### 2.2. Operaciones CRUD Tipadas

```typescript
// Crear
const producto = await prisma.producto.create({
  data: {
    nombre: 'Producto de prueba',
    precio: 100,
    // Usar relaciones con connect
    marca: { connect: { id: marcaId } },
    color: { connect: { id: colorId } },
    // Usar campos de auditoría
    creadoPor: userId,
    creadoEn: new Date(),
  },
  // Incluir relaciones en la respuesta
  include: {
    marca: true,
    color: true,
  },
});

// Actualizar
const productoActualizado = await prisma.producto.update({
  where: { id: productoId },
  data: {
    nombre: 'Nuevo nombre',
    // Usar operaciones de actualización de Prisma
    precio: { increment: 10 },
    // Campos de auditoría
    actualizadoPor: userId,
    actualizadoEn: new Date(),
  },
  include: {
    marca: true,
    color: true,
  },
});

// Eliminación lógica
const productoEliminado = await prisma.producto.update({
  where: { id: productoId },
  data: {
    activo: false,
    eliminadoPor: userId,
    eliminadoEn: new Date(),
  },
});
```

## 3. Manejo de Errores

### 3.1. Estructura de Respuesta de Error

Todas las respuestas de error deben seguir el formato:

```typescript
{
  ok: false,
  data: null,
  error: 'Mensaje de error descriptivo',
  // Opcional: detalles adicionales para desarrollo
  meta?: any;
}
```

### 3.2. Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error de validación o datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No autorizado
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: duplicados)
- `500 Internal Server Error`: Error del servidor

### 3.3. Manejo de Errores de Prisma

```typescript
try {
  // Operación con Prisma
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Manejar errores conocidos de Prisma
    switch (error.code) {
      case 'P2002': // Violación de restricción única
        return res.status(409).json({
          ok: false,
          data: null,
          error: 'Ya existe un registro con estos datos',
        });
      case 'P2025': // Registro no encontrado
        return res.status(404).json({
          ok: false,
          data: null,
          error: 'Registro no encontrado',
        });
      default:
        throw error; // Pasar otros errores al manejador global
    }
  }
  throw error; // Pasar otros errores al manejador global
}
```

## 4. Auditoría

### 4.1. Registrar Todas las Acciones

Todas las operaciones CRUD deben registrar auditorías tanto en éxito como en error. Para esto, utilizamos las funciones auxiliares `logSuccess` y `logError` del módulo de auditoría:

#### 4.1.1. Registro de operaciones exitosas

```typescript
try {
  // Código de la operación exitosa...
  
  await logSuccess({
    userId: req.user?.id,
    ip: req.ip,
    entityType: 'producto',
    entityId: producto.id,
    module: 'productoController',
    action: 'crear_producto',
    message: 'Producto creado exitosamente',
    details: {
      // Datos relevantes del producto creado
      nombre: producto.nombre,
      precio: producto.precio,
      // ... otros campos relevantes
    },
  });
} catch (error) {
  // Manejo del error...
}
```

#### 4.1.2. Registro de operaciones fallidas

```typescript
try {
  // Código que podría fallar...
} catch (error) {
  await logError({
    userId: req.user?.id,
    ip: req.ip,
    entityType: 'producto',
    entityId: producto?.id, // Usar opcional en caso de que el producto no se haya creado
    module: 'productoController',
    action: 'error_crear_producto',
    message: 'Error al crear producto',
    error: error, // Pasar el error completo
    context: {
      // Datos relevantes del contexto al momento del error
      datosEntrada: req.body,
      // ... otros campos relevantes
    },
  });
  
  // Relanzar el error o manejarlo según corresponda
  throw error;
}
```

#### 4.1.3. Parámetros de las funciones de auditoría

**`logSuccess` - Para operaciones exitosas:**
- `userId`: ID del usuario que realizó la acción (opcional)
- `ip`: Dirección IP de la solicitud
- `entityType`: Tipo de entidad afectada (ej: 'producto', 'usuario')
- `entityId`: ID de la entidad afectada (opcional)
- `module`: Módulo o controlador donde ocurrió la acción
- `action`: Identificador de la acción realizada
- `message`: Mensaje descriptivo de la acción
- `details`: Objeto con detalles adicionales relevantes (opcional)

**`logError` - Para operaciones fallidas:**
- `userId`: ID del usuario que intentó realizar la acción (opcional)
- `ip`: Dirección IP de la solicitud
- `entityType`: Tipo de entidad afectada
- `entityId`: ID de la entidad afectada (opcional)
- `module`: Módulo o controlador donde ocurrió el error
- `action`: Identificador de la acción que falló
- `message`: Mensaje descriptivo del error
- `error`: Objeto de error o mensaje de error
- `context`: Objeto con información adicional del contexto del error

#### 4.1.4. Convenciones para los nombres de acciones

- Usar prefijos descriptivos:
  - `crear_` para operaciones de creación
  - `obtener_` para operaciones de lectura
  - `actualizar_` para operaciones de actualización
  - `eliminar_` para operaciones de eliminación
  - `error_` para prefijar acciones fallidas

- Usar nombres en minúsculas separados por guiones bajos (`_`)

Ejemplos:
- `crear_producto`
- `actualizar_usuario`
- `error_eliminar_producto`
- `iniciar_sesion`

### 4.2. Campos de Auditoría en Modelos

Todos los modelos deben incluir campos de auditoría:

```prisma
model Producto {
  id            String   @id @default(uuid())
  nombre        String
  // Otros campos...
  
  // Campos de auditoría
  creadoEn      DateTime @default(now())
  creadoPor     String?
  actualizadoEn DateTime @updatedAt
  actualizadoPor String?
  eliminadoEn   DateTime?
  eliminadoPor  String?
  activo        Boolean  @default(true)
  
  // Relaciones
  marca        Marca?   @relation(fields: [marcaId], references: [id])
  marcaId      String?
}
```

## 5. Validación de Datos

### 5.1. Validación de Entrada

Usar funciones de validación centralizadas:

```typescript
// utils/validations/producto.validations.ts
export const validateProductoInput = (
  data: any
): { error: string } | Prisma.ProductoCreateInput => {
  const errors: string[] = [];
  
  if (!data.nombre?.trim()) {
    errors.push('El nombre es requerido');
  }
  
  if (data.precio <= 0) {
    errors.push('El precio debe ser mayor a 0');
  }
  
  // Validar relaciones
  if (data.categoriaId && !isValidId(data.categoriaId)) {
    errors.push('ID de categoría inválido');
  }
  
  if (errors.length > 0) {
    return { error: errors.join(', ') };
  }
  
  // Retornar datos validados con el tipo correcto
  return data as Prisma.ProductoCreateInput;
};
```

### 5.2. Validación de Relaciones

Validar la existencia de relaciones antes de usarlas:

```typescript
const validarRelaciones = async (data: any) => {
  const { categoriaId, marcaId, colorId } = data;
  const errors: string[] = [];
  
  // Validar categoría
  if (categoriaId) {
    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId, activo: true },
    });
    
    if (!categoria) {
      errors.push('La categoría especificada no existe o está inactiva');
    }
  }
  
  // Validar marca y color de manera similar...
  
  return errors.length > 0 ? { error: errors.join(', ') } : { data };
};
```

## 6. Estructura de Archivos

```
src/
  controllers/          # Controladores
    producto.controller.ts
    marca.controller.ts
    # ...otros controladores
  
  middlewares/         # Middlewares de Express
    auth.middleware.ts
    error.middleware.ts
  
  routes/              # Rutas
    producto.routes.ts
    marca.routes.ts
    # ...otras rutas
  
  services/            # Lógica de negocio
    producto.service.ts
    marca.service.ts
    # ...otros servicios
  
  types/               # Tipos TypeScript
    index.d.ts
    response.ts
    # ...otros tipos
  
  utils/               # Utilidades
    audit.ts
    prisma.ts
    validations/
      producto.validations.ts
      marca.validations.ts
      # ...otras validaciones
    
  app.ts              # Configuración de Express
  index.ts             # Punto de entrada
```

## 7. Pruebas

### 7.1. Estructura de Pruebas

```
tests/
  unit/                # Pruebas unitarias
    controllers/
      producto.controller.test.ts
      marca.controller.test.ts
    services/
      producto.service.test.ts
      marca.service.test.ts
    
  integration/         # Pruebas de integración
    api/
      producto.api.test.ts
      marca.api.test.ts
    
  e2e/                # Pruebas de extremo a extremo
    flujos-completos.test.ts
    
  helpers/            # Utilidades para pruebas
    test-utils.ts
    test-db.ts
    
  __fixtures__/       # Datos de prueba
    productos.ts
    marcas.ts
```

### 7.2. Ejemplo de Prueba

```typescript
// tests/unit/controllers/producto.controller.test.ts
import { crearProducto } from '../../../src/controllers/producto.controller';
import { prisma } from '../../../src/utils/prisma';
import { registrarAuditoria } from '../../../src/utils/audit';
import { mockProducto, mockUsuario } from '../../__fixtures__/productos';

// Mock de Prisma y otras dependencias
jest.mock('../../../src/utils/prisma');
jest.mock('../../../src/utils/audit');

describe('Producto Controller', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    // Configurar mocks
    req = {
      body: { ...mockProducto },
      user: { id: mockUsuario.id },
      ip: '127.0.0.1',
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    next = jest.fn();
    
    // Resetear mocks
    jest.clearAllMocks();
  });
  
  describe('crearProducto', () => {
    it('debe crear un producto exitosamente', async () => {
      // Configurar mocks
      const productoMock = { id: '1', ...mockProducto };
      (prisma.producto.create as jest.Mock).mockResolvedValue(productoMock);
      
      // Ejecutar
      await crearProducto(req as any, res as any, next);
      
      // Verificar
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: productoMock,
        error: null,
      });
      
      // Verificar auditoría
      expect(registrarAuditoria).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'crear_producto',
          entityId: '1',
        })
      );
    });
    
    it('debe manejar errores de validación', async () => {
      // Configurar solicitud inválida
      req.body = { nombre: '' }; // Nombre vacío
      
      // Ejecutar
      await crearProducto(req as any, res as any, next);
      
      // Verificar
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          error: expect.any(String),
        })
      );
    });
  });
});
```

### 7.3. Configuración de Pruebas

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['./tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 10000, // 10 segundos
};

// tests/setup.ts
import { PrismaClient } from '@prisma/client';
import { clearDatabase } from './helpers/test-db';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Configuración antes de todas las pruebas
  await clearDatabase(prisma);
});

afterAll(async () => {
  // Limpieza después de todas las pruebas
  await prisma.$disconnect();
});

// tests/helpers/test-db.ts
export const clearDatabase = async (prisma: PrismaClient) => {
  const tablas = ['Producto', 'Marca', 'Categoria', 'Color'];
  
  // Desactivar restricciones de clave foránea temporalmente
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
  
  // Vaciar tablas
  for (const tabla of tablas) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tabla}\`;`);
    } catch (error) {
      console.error(`Error al vaciar tabla ${tabla}:`, error);
    }
  }
  
  // Reactivar restricciones
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
};
```

---

Este documento se actualizará continuamente a medida que evolucionen las prácticas recomendadas y se identifiquen nuevas oportunidades de mejora.

Este documento detalla las mejores prácticas establecidas para el desarrollo del backend de la Intranet Neóptica, basadas en nuestra experiencia y lecciones aprendidas durante el desarrollo. Seguir estas prácticas ayudará a mantener un código robusto, testeable y mantenible.

## 1. Arquitectura y estructura de la aplicación

### 1.1. Separación de configuración y arranque del servidor

La separación entre la configuración de la aplicación Express y el arranque del servidor HTTP es fundamental para permitir pruebas adecuadas:

```typescript
// app.ts - Configuración de la aplicación
import express from 'express';
// ...configuración de middlewares, rutas, etc.
const app = express();
// ...
export default app;

// index.ts - Arranque del servidor
import app from './app';

// Solo inicia el servidor si este archivo es ejecutado directamente
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on ${process.env.SWAGGER_BASE_URL}`);
  });
}
```

**Razón:** Esta separación permite importar la aplicación Express en las pruebas sin iniciar automáticamente un servidor HTTP, evitando errores de "open handle" en Jest y facilitando las pruebas con Supertest.

### 1.2. Estructura modular de carpetas

Mantener una estructura clara y modular:

```
/src
  /controllers    # Lógica de negocio y controladores
  /middlewares    # Middlewares de Express
  /routes         # Definiciones de rutas
  /utils          # Utilidades y helpers
  /services       # Servicios y lógica de negocio compleja
  /types          # Definiciones de tipos TypeScript
  app.ts          # Configuración de Express
  index.ts        # Punto de entrada y arranque del servidor
```

## 2. Gestión de conexiones a bases de datos

### 2.1. Cliente Prisma singleton

Usar una instancia única de Prisma Client para toda la aplicación:

```typescript
// src/utils/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;
```

### 2.2. Desconexión explícita en pruebas

Siempre cerrar las conexiones de Prisma al finalizar las pruebas:

```typescript
// En archivos de test
afterAll(async () => {
  await prisma.$disconnect();
});
```

### 2.3. Uso de transacciones

Utilizar transacciones para operaciones que afectan múltiples tablas, especialmente para operaciones críticas como la gestión de usuarios y roles:

```typescript
// Ejemplo: Crear usuario con múltiples roles
const [nuevoUsuario, rolesAsignados] = await prisma.$transaction(async (tx) => {
  // 1. Crear usuario
  const usuario = await tx.usuario.create({
    data: {
      nombre_completo,
      email,
      password: passwordHash,
      telefono,
      activo: true,
      creado_en: new Date(),
      creado_por: usuarioId
    }
  });
  
  // 2. Asignar múltiples roles
  const asignaciones = await Promise.all(
    rolesAsignar.map(nombreRol => 
      tx.usuario_rol.create({
        data: {
          usuario_id: usuario.id,
          rol: { connect: { nombre: nombreRol } },
          creado_en: new Date(),
          creado_por: usuarioId
        }
      })
    )
  );
  
  return [usuario, asignaciones];
});
```

## 3. Pruebas y testing

### 3.1. Estructura de pruebas

La estructura de pruebas sigue el siguiente patrón:

```
/tests
  /unit                     # Pruebas unitarias
    /__fixtures__           # Datos de prueba reutilizables
    /__mocks__              # Mocks de módulos externos
    /controllers            # Pruebas de controladores
      /auth                 # Pruebas de autenticación
      /color                # Pruebas de módulo de colores
      /marca                # Pruebas de módulo de marcas
  /integration              # Pruebas de integración
  /e2e                      # Pruebas de extremo a extremo
```

### 3.2. Fixtures de prueba

Los fixtures contienen datos de prueba reutilizables. Por ejemplo, para el módulo de colores:

```typescript
// tests/unit/__fixtures__/colorFixtures.ts
export const validColorData = {
  nombre: 'Rojo',
  codigoHex: '#FF0000',
  descripcion: 'Color rojo estándar',
  activo: true,
};

export const mockColor = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  nombre: 'Rojo',
  codigoHex: '#FF0000',
  descripcion: 'Color rojo estándar',
  activo: true,
  creadoEn: new Date(),
  creadoPor: 'test@example.com',
  // ... otros campos de auditoría
};
```

### 3.3. Mocks

Los mocks se utilizan para simular dependencias externas:

```typescript
// tests/unit/__mocks__/utils/audit.ts
import { jest } from '@jest/globals';

export const registrarAuditoria = jest.fn(async (_params: any): Promise<void> => {});
```

### 3.4. Configuración de pruebas

Cada archivo de prueba sigue esta estructura básica:

```typescript
// Importar dependencias
import request from 'supertest';
import app from '../../../src/app';
import prisma from '../../../src/utils/prisma';
import { mockColor, validColorData } from '../../__fixtures__/colorFixtures';

// Mockear dependencias externas
jest.mock('../../../src/utils/audit');

// Configuración antes/después de las pruebas
describe('Color Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Casos de prueba
  describe('POST /api/colores', () => {
    it('debe crear un color válido', async () => {
      // Configurar mocks
      prisma.color.create.mockResolvedValue(mockColor);
      
      // Ejecutar petición
      const response = await request(app)
        .post('/api/colores')
        .send(validColorData);
      
      // Verificar resultados
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ok: true,
        data: expect.objectContaining({
          nombre: validColorData.nombre,
          codigoHex: validColorData.codigoHex,
        })
      });
      
      // Verificar auditoría
      expect(registrarAuditoria).toHaveBeenCalledWith(
        expect.objectContaining({
          accion: 'crear',
          entidadTipo: 'Color',
          resultado: 'exitoso',
        })
      );
    });
  });
});
```

### 3.5. Ejecución de pruebas

Las pruebas se pueden ejecutar con los siguientes comandos:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Generar cobertura de código
npm run test:coverage

# Ejecutar pruebas de un archivo específico
npm test -- tests/unit/controllers/color/createColor.test.ts
```

### 3.6. Cobertura de pruebas

Se debe mantener una cobertura de código mínima del 80% para todo el código nuevo. La cobertura actual se puede ver ejecutando:

```bash
npm run test:coverage
```

Esto generará un informe en la carpeta `coverage` que muestra qué líneas de código están cubiertas por pruebas.

### 3.7. Pruebas de integración

Además de las pruebas unitarias, se deben implementar pruebas de integración que verifiquen la interacción entre componentes:

```typescript
describe('Integración: Rutas de Colores', () => {
  let token: string;
  
  beforeAll(async () => {
    // Configurar autenticación
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@neoptica.com', password: 'password' });
    
    token = login.body.token;
  });
  
  it('debe crear, listar, actualizar y eliminar un color', async () => {
    // Crear
    const createRes = await request(app)
      .post('/api/colores')
      .set('Authorization', `Bearer ${token}`)
      .send(validColorData);
      
    expect(createRes.status).toBe(201);
    const colorId = createRes.body.data.id;
    
    // Listar
    const listRes = await request(app)
      .get('/api/colores')
      .set('Authorization', `Bearer ${token}`);
      
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: colorId })
      ])
    );
    
    // Actualizar
    const updateRes = await request(app)
      .put(`/api/colores/${colorId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Rojo Intenso' });
      
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.nombre).toBe('Rojo Intenso');
    
    // Eliminar
    const deleteRes = await request(app)
      .delete(`/api/colores/${colorId}`)
      .set('Authorization', `Bearer ${token}`);
      
    expect(deleteRes.status).toBe(200);
  });
});
```

## 4. Manejo de errores, auditoría y validaciones

### 4.1. Formato de respuesta uniforme

```typescript
// Ejemplo: tests/usuarios.test.ts
import app from '../src/app';
import request from 'supertest';
import prisma from '../src/utils/prisma';
import { generarJWT } from '../src/utils/jwt';

// Configuración para pruebas con usuarios multi-rol
let token;
let usuarioAdmin;

beforeAll(async () => {
  // Crear usuario de prueba con múltiples roles
  usuarioAdmin = await prisma.usuario.findFirst({
    where: { email: 'admin@neoptica.com' },
    include: { usuario_rol: { include: { rol: true } } }
  });
  
  // Generar token con array de roles
  const roles = usuarioAdmin.usuario_rol.map(ur => ur.rol.nombre);
  token = await generarJWT(usuarioAdmin.id, roles);
});

// Limpiar y desconectar después de todas las pruebas
afterAll(async () => {
  // Primero eliminar registros relacionados (respetando integridad referencial)
  await prisma.usuario_rol.deleteMany({
    where: { 
      usuario: { email: { not: 'admin@neoptica.com' } }
    }
  });
  
  // Luego eliminar usuarios excepto admin
  await prisma.usuario.deleteMany({
    where: { email: { not: 'admin@neoptica.com' } }
  });
  
  // Finalmente desconectar Prisma
  await prisma.$disconnect();
});

describe('CRUD Usuarios', () => {
  it('debería crear un usuario correctamente', async () => {
    const response = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        // datos de prueba
      });
    
    expect(response.status).toBe(201);
    expect(response.body.ok).toBe(true);
    // más assertions
  });
  
  // más tests...
});
```

### 3.2. Aislamiento de pruebas

- Usar una base de datos de prueba separada
- Limpiar datos creados al finalizar las pruebas
- Evitar dependencias entre pruebas (cada test debe ser independiente)

## 4. Estructura y patrones de controladores

### 4.1. Estructura estándar de un controlador

Cada controlador debe seguir una estructura estandarizada con secciones claramente definidas:

```typescript
// 1. Importaciones necesarias
import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { logSuccess, logError } from '../utils/audit';

// 2. Cliente Prisma
const prisma = new PrismaClient();

// 3. Funciones del controlador
export const listarEntidades = async (req: Request, res: Response) => {
  // Paso 1: Capturar ID de usuario para auditoría
  const userId = (req as any).usuario?.id || (req as any).user?.id;

  try {
    // Paso 2: Capturar y validar parámetros de consulta
    const { filtro1, filtro2 } = req.query;
    
    // Paso 3: Construir objeto de filtro para la consulta
    const where: any = {};
    if (filtro1) where.campo1 = filtro1;
    if (filtro2) where.campo2 = filtro2;
    
    // Paso 4: Realizar consulta a la base de datos
    const entidades = await prisma.entidad.findMany({ where });
    
    // Paso 5: Registrar éxito en auditoría
    await logSuccess({
      userId,
      ip: req.ip,
      entityType: 'entidad',
      module: 'listarEntidades',
      action: 'consultar_entidades',
      message: `Consulta exitosa de entidades`,
      details: { filtros: req.query }
    });
    
    // Paso 6: Retornar respuesta exitosa
    return res.status(200).json({
      ok: true,
      data: entidades,
      error: null
    });
  } catch (error) {
    // Paso 7: Manejar errores y registrar en auditoría
    await logError({
      userId,
      ip: req.ip,
      entityType: 'entidad',
      module: 'listarEntidades',
      action: 'error_listar_entidades',
      message: 'Error al listar entidades',
      error: error as Error,
      context: req.query
    });
    
    console.error('Error al listar entidades:', error);
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al obtener la lista de entidades.'
    });
  }
};
```

### 4.2. Patrón de validación de relaciones

Para validar relaciones entre entidades (como `categoriaId` en `Producto`), utilizar el siguiente patrón estandarizado:

```typescript
// Ejemplo: Validación por lotes de relaciones en crearProducto

// 1. Preparar consultas de validación para todas las relaciones
const validacionPromises = [];
const relacionesParaValidar = [];

if (productoData.categoriaId) {
  validacionPromises.push(
    prisma.categoria.findUnique({
      where: { id: productoData.categoriaId }
    })
  );
  relacionesParaValidar.push('categoria');
}

if (productoData.marcaId) {
  validacionPromises.push(
    prisma.marca.findUnique({
      where: { id: productoData.marcaId }
    })
  );
  relacionesParaValidar.push('marca');
}

// 2. Ejecutar todas las consultas en paralelo para optimizar rendimiento
if (validacionPromises.length > 0) {
  const resultados = await Promise.all(validacionPromises);
  
  // 3. Verificar resultados de cada relación
  for (let i = 0; i < resultados.length; i++) {
    const resultado = resultados[i];
    const tipoRelacion = relacionesParaValidar[i];
    let idRelacion;
    
    switch (tipoRelacion) {
      case 'categoria':
        idRelacion = productoData.categoriaId;
        
        // 3.1 Validar existencia
        if (!resultado) {
          await logError({
            userId,
            ip: req.ip,
            entityType: 'producto',
            module: 'crearProducto',
            action: 'error_crear_producto',
            message: `La categoría con ID ${idRelacion} no existe`,
            error: new Error(`La categoría con ID ${idRelacion} no existe. 400`),
            context: { categoriaId: idRelacion },
          });
          return res.status(400).json({
            ok: false,
            data: null,
            error: `La categoría con ID ${idRelacion} no existe.`
          });
        }
        
        // 3.2 Validar estado activo
        if (resultado.anuladoEn) {
          await logError({
            userId,
            ip: req.ip,
            entityType: 'producto',
            module: 'crearProducto',
            action: 'error_crear_producto',
            message: `La categoría con ID ${idRelacion} está inactiva`,
            error: new Error(`La categoría con ID ${idRelacion} está inactiva. 400`),
            context: { 
              categoriaId: idRelacion,
              anuladoEn: resultado.anuladoEn,
            },
          });
          return res.status(400).json({
            ok: false,
            data: null,
            error: `La categoría con ID ${idRelacion} está inactiva.`
          });
        }
        break;
      
      // Continuar con otras relaciones de manera similar
    }
  }
}
```

### 4.3. Manejo de errores y respuestas uniformes

Todas las respuestas de la API deben seguir un formato consistente utilizando las funciones `success` y `fail` del módulo `@/utils/response`:

```typescript
// Para respuestas exitosas
return res.status(200).json(
  success(datos)
);

// Para respuestas de error
return res.status(400).json(
  fail('Mensaje de error', detallesAdicionales)
);
```

### 4.4. Patrón para construir consultas de filtrado

Al construir consultas con filtros dinámicos, utilizar el siguiente patrón para manejar correctamente los tipos en Prisma:

```typescript
// Ejemplo: Construcción de objeto where para filtrado en listarProductos
export const listarProductos = async (req: Request, res: Response) => {
  try {
    // 1. Obtener parámetros de consulta
    const { search, categoriaId, marcaId, colorId } = req.query;

    // 2. Inicializar objeto where con tipo correspondiente
    let where: Prisma.ProductoWhereInput = {};

    // 3. Añadir filtros condicionales para campos directos
    if (marcaId) {
      where.marcaId = marcaId as string;
    }

    if (colorId) {
      where.colorId = colorId as string;
    }

    // 4. Añadir filtros para relaciones con objetos anidados
    if (categoriaId) {
      const categoryFilter = { id: categoriaId as string };
      where.categoria = { is: categoryFilter as any };
    }

    // 5. Añadir filtros de búsqueda para múltiples campos
    if (search) {
      where.OR = [
        { nombre: { contains: search as string, mode: 'insensitive' } },
        { descripcion: { contains: search as string, mode: 'insensitive' } },
        { modelo: { contains: search as string, mode: 'insensitive' } },
      ];
    }
```

### 4.5. Manejo seguro de tipos con Prisma

Para garantizar un manejo seguro de tipos al trabajar con Prisma, seguir estas prácticas:

#### 4.5.1. Definición explícita de tipos en relaciones

Definir tipos explícitos para las relaciones y evitar el uso de `Record<string, any>` o castings innecesarios:

```typescript
// Tipo para las relaciones de producto con otros modelos
type ProductoRelaciones = {
  categoria?: { connect: { id: string } };
  marca?: { connect: { id: string } };
  color?: { connect: { id: string } };
};

// Uso en el controlador
const relations: ProductoRelaciones = {};
if (productoData.categoriaId) {
  relations.categoria = { connect: { id: productoData.categoriaId } };
}
```

#### 4.5.2. Tipado de datos base sin relaciones

Usar `Omit` para definir tipos que excluyen las relaciones, facilitando la composición:

```typescript
// Tipado explícito de datos base sin relaciones
const baseData: Omit<Prisma.ProductoCreateInput, 'categoria' | 'marca' | 'color'> = {
  nombre: productoData.nombre,
  descripcion: productoData.descripcion || null,
  precio: productoData.precio,
  // ... otros campos
};
```

#### 4.5.3. Evitar conversiones de tipo innecesarias

Evitar el uso de `as unknown as Prisma.ProductoCreateInput` ya que esto anula las comprobaciones de tipo. En su lugar, usar tipos explícitos:

```typescript
// Incorrecto: Anula las comprobaciones de tipo
const productoCreateData = {
  ...baseData,
  ...relations,
} as unknown as Prisma.ProductoCreateInput;

// Correcto: Mantiene las comprobaciones de tipo
const productoCreateData: Prisma.ProductoCreateInput = {
  ...baseData,
  ...relations,
};
```

#### 4.5.4. Tratamiento de campos opcionales

Para campos opcionales, usar técnicas de limpieza de `undefined` en lugar de castings:

```typescript
// Filtrar campos undefined para consultas
const cleanObject = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

const filters = cleanObject({
  name: searchName,
  categoryId: req.query.category,
  // Otros filtros
});
```

    // 6. Añadir filtro para elementos activos
    where.anuladoEn = null;

    // 7. Realizar consulta con el objeto where construido
    const productos = await prisma.producto.findMany({
      where,
      include: {
        marca: true,
        color: true,
        categoria: true,
      },
    });

    return res.status(200).json({
      ok: true,
      data: productos,
      error: null
    });
  } catch (error) {
    // Manejo de errores...
  }
};
```

### 4.5. Estructura estándar de rutas

Las definiciones de rutas deben seguir esta estructura estandarizada:

```typescript
// src/routes/entidad.ts
import { Router } from 'express';
import {
  listarEntidades,
  obtenerEntidadPorId,
  crearEntidad,
  actualizarEntidad,
  eliminarEntidad
} from '../controllers/entidadController';
import { authenticateJWT, hasRole } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { entidadSchemas } from '../validators/schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Entidades
 *   description: API para gestionar entidades
 */

/**
 * @swagger
 * /api/entidades:
 *   get:
 *     summary: Lista todas las entidades
 *     tags: [Entidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar entidades
 *     responses:
 *       200:
 *         description: Lista de entidades
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaEntidadesResponse'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticateJWT, listarEntidades);

/**
 * @swagger
 * /api/entidades/{id}:
 *   get:
 *     summary: Obtiene una entidad por su ID
 *     tags: [Entidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la entidad
 *     responses:
 *       200:
 *         description: Detalles de la entidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EntidadResponse'
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error en el servidor
 */
router.get('/:id', authenticateJWT, obtenerEntidadPorId);

/**
 * @swagger
 * /api/entidades:
 *   post:
 *     summary: Crea una nueva entidad
 *     tags: [Entidades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EntidadInput'
 *     responses:
 *       201:
 *         description: Entidad creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error en el servidor
 */
router.post('/', 
  authenticateJWT, 
  hasRole(['admin', 'gerente']), 
  validateRequest(entidadSchemas.crearEntidad),
  crearEntidad
);

/**
 * @swagger
 * /api/entidades/{id}:
 *   put:
 *     summary: Actualiza una entidad existente
 *     tags: [Entidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EntidadUpdateInput'
 *     responses:
 *       200:
 *         description: Entidad actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error en el servidor
 */
router.put('/:id',
  authenticateJWT,
  hasRole(['admin', 'gerente']),
  validateRequest(entidadSchemas.actualizarEntidad),
  actualizarEntidad
);

/**
 * @swagger
 * /api/entidades/{id}:
 *   delete:
 *     summary: Elimina una entidad (desactivación lógica)
 *     tags: [Entidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Entidad eliminada exitosamente
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error en el servidor
 */
router.delete('/:id',
  authenticateJWT,
  hasRole(['admin']),
  eliminarEntidad
);

export default router;
```

### 4.6. Documentación Swagger estandarizada

Toda nueva API debe incluir esquemas Swagger correctamente definidos en `src/routes/swagger.ts`:

```typescript
// Definición de esquemas para una entidad
const entidadSchemas = {
  // Modelo base
  Entidad: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Identificador único UUID',
      },
      nombre: {
        type: 'string',
        description: 'Nombre de la entidad',
      },
      descripcion: {
        type: 'string',
        description: 'Descripción detallada',
      },
      creadoEn: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de creación',
      },
      creadoPor: {
        type: 'string',
        description: 'ID del usuario que creó la entidad',
      },
      modificadoEn: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de última modificación',
        nullable: true,
      },
      modificadoPor: {
        type: 'string',
        description: 'ID del usuario que modificó por última vez',
        nullable: true,
      },
      anuladoEn: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de anulación/eliminación lógica',
        nullable: true,
      },
      anuladoPor: {
        type: 'string',
        description: 'ID del usuario que anuló la entidad',
        nullable: true,
      },
    },
  },
  
  // Input para creación
  EntidadInput: {
    type: 'object',
    required: ['nombre'],
    properties: {
      nombre: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      descripcion: {
        type: 'string',
        maxLength: 500,
      },
      // Otras propiedades específicas
    },
  },
  
  // Input para actualización
  EntidadUpdateInput: {
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      descripcion: {
        type: 'string',
        maxLength: 500,
      },
      // Otras propiedades específicas
    },
  },
  
  // Respuesta para listar entidades
  ListaEntidadesResponse: {
    type: 'object',
    properties: {
      ok: {
        type: 'boolean',
      },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Entidad',
        },
      },
      error: {
        type: 'string',
        nullable: true,
      },
    },
  },
  
  // Respuesta para una sola entidad
  EntidadResponse: {
    type: 'object',
    properties: {
      ok: {
        type: 'boolean',
      },
      data: {
        $ref: '#/components/schemas/Entidad',
      },
      error: {
        type: 'string',
        nullable: true,
      },
    },
  },
};

// Asegurarse de exportar el esquema
export { entidadSchemas };
```

## 5. Auditoría y manejo de errores

### 5.1. Auditoría de operaciones

Todas las operaciones que modifican datos deben ser registradas en el sistema de auditoría utilizando las utilidades proporcionadas:

#### Registro de operaciones exitosas

```typescript
import { logSuccess } from '@/utils/audit';

// En un controlador, después de una operación exitosa
await logSuccess({
  userId: req.userId,
  ip: req.ip,
  entityType: 'Producto',
  entityId: producto.id,
  module: 'Productos',
  action: 'crear',
  message: 'Producto creado exitosamente',
  details: { /* Datos relevantes */ }
});
```

#### Registro de errores

```typescript
import { logError } from '@/utils/audit';

try {
  // Operación que puede fallar
} catch (error) {
  await logError({
    userId: req.userId,
    ip: req.ip,
    entityType: 'Producto',
    entityId: req.params.id,
    module: 'Productos',
    action: 'actualizar',
    message: 'Error al actualizar el producto',
    error,
    context: { /* Contexto adicional */ }
  });
  
  return res.status(500).json(
    fail('Error al actualizar el producto')
  );
}
```

#### Parámetros de auditoría

| Parámetro    | Tipo     | Descripción |
|-------------|----------|-------------|
| userId      | string   | ID del usuario que realiza la acción |
| ip          | string   | Dirección IP del solicitante |
| entityType  | string   | Tipo de entidad afectada (ej. 'Producto', 'Usuario') |
| entityId    | string   | ID de la entidad afectada |
| module      | string   | Módulo del sistema (ej. 'Productos', 'Usuarios') |
| action      | string   | Acción realizada (ej. 'crear', 'actualizar', 'eliminar') |
| message     | string   | Mensaje descriptivo de la acción |
| details     | object   | (Opcional) Datos adicionales relevantes |
| error       | Error    | (Solo para logError) Error capturado |
| context     | object   | (Opcional) Contexto adicional para errores |

### 4.3. Validaciones de entrada

Todas las entradas deben ser validadas utilizando el middleware `validateRequest` de `@/middlewares/validate`:

Siempre usar el formato estandarizado de respuesta para consistencia:

```typescript
// Éxito
return res.status(200).json({
  ok: true,
  data: resultado,
  error: null
});

// Error
return res.status(400).json({
  ok: false,
  data: null,
  error: 'Mensaje de error descriptivo'
});
```

### 4.2. Validaciones exhaustivas

Validar todos los campos de entrada en los controladores:

- Tipos de datos correctos
- Valores dentro de rangos esperados
- Formatos válidos (email, teléfono, etc.)
- Existencia de entidades relacionadas

### 4.3. Logs y auditoría

Registrar operaciones importantes y errores:

```typescript
try {
  // operación principal
  registrarAuditoria({
    usuario_id: req.usuario.id,
    accion: 'CREAR',
    descripcion: 'Creación exitosa de entidad',
    modulo: 'entidades',
    entidad_id: nuevaEntidad.id
  });
} catch (error) {
  console.error('Error detallado:', error);
  registrarAuditoria({
    usuario_id: req.usuario.id,
    accion: 'ERROR',
    descripcion: `Error al crear entidad: ${error.message}`,
    modulo: 'entidades'
  });
  // manejo de error y respuesta
}
```

## 6. Patrones de pruebas estandarizadas

### 6.1. Estructura de archivos de prueba

Cada módulo debe tener una estructura de pruebas estandarizada:

```
/tests
  /unit
    /controllers
      /[entidad]
        listarEntidades.test.ts     # Pruebas de listado
        obtenerEntidadPorId.test.ts # Pruebas de obtener por ID
        crearEntidad.test.ts        # Pruebas de creación
        actualizarEntidad.test.ts   # Pruebas de actualización
        eliminarEntidad.test.ts     # Pruebas de eliminación
    /utils
      /[utilidad].test.ts          # Pruebas de utilitarios
  /integration
    /[entidad].integration.test.ts  # Pruebas de integración
```

### 6.2. Patrón para pruebas de controlador

Las pruebas deben seguir esta estructura estandarizada:

```typescript
// tests/unit/controllers/entidad/crearEntidad.test.ts
import { Request, Response } from 'express';
import { crearEntidad } from '../../../../src/controllers/entidadController';
import prisma from '../../../../src/utils/prisma';
import { logSuccess, logError } from '../../../../src/utils/audit';
import { mockEntidadData, expectedEntidad } from '../../../__fixtures__/entidadFixtures';

// Mock de dependencias
jest.mock('../../../../src/utils/prisma');
jest.mock('../../../../src/utils/audit');

describe('Controller: crearEntidad', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  
  beforeEach(() => {
    // Configuración estándar para cada prueba
    mockReq = {
      body: { ...mockEntidadData },
      ip: '127.0.0.1',
      usuario: { id: 'mock-user-id' }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });
  
  it('debe crear una entidad correctamente', async () => {
    // 1. Configurar mocks
    (prisma.entidad.create as jest.Mock).mockResolvedValue(expectedEntidad);
    
    // 2. Ejecutar función del controlador
    await crearEntidad(mockReq as Request, mockRes as Response);
    
    // 3. Verificar respuesta HTTP
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      ok: true,
      data: expectedEntidad,
      error: null
    });
    
    // 4. Verificar llamada a Prisma
    expect(prisma.entidad.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nombre: mockEntidadData.nombre,
        descripcion: mockEntidadData.descripcion,
        creadoPor: 'mock-user-id'
      })
    });
    
    // 5. Verificar auditoría
    expect(logSuccess).toHaveBeenCalled();
  });
  
  it('debe manejar errores de validación', async () => {
    // 1. Configurar datos inválidos
    mockReq.body = { /* datos inválidos */ };
    
    // 2. Ejecutar función del controlador
    await crearEntidad(mockReq as Request, mockRes as Response);
    
    // 3. Verificar respuesta de error
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: expect.any(String)
    });
    
    // 4. Verificar auditoría de error
    expect(logError).toHaveBeenCalled();
  });
  
  it('debe manejar errores de base de datos', async () => {
    // 1. Configurar error en Prisma
    const dbError = new Error('Database error');
    (prisma.entidad.create as jest.Mock).mockRejectedValue(dbError);
    
    // 2. Ejecutar función del controlador
    await crearEntidad(mockReq as Request, mockRes as Response);
    
    // 3. Verificar respuesta de error
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      ok: false,
      data: null,
      error: expect.any(String)
    });
    
    // 4. Verificar auditoría de error
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: dbError
      })
    );
  });
});
```

### 6.3. Fixtures y mocks reutilizables

Cada entidad debe tener sus propios fixtures y mocks:

```typescript
// tests/__fixtures__/entidadFixtures.ts
export const mockEntidadData = {
  nombre: 'Entidad de prueba',
  descripcion: 'Descripción de prueba'
};

export const expectedEntidad = {
  id: 'mock-uuid',
  nombre: 'Entidad de prueba',
  descripcion: 'Descripción de prueba',
  creadoEn: new Date(),
  creadoPor: 'mock-user-id',
  modificadoEn: null,
  modificadoPor: null,
  anuladoEn: null,
  anuladoPor: null
};

export const mockEntidadList = [
  expectedEntidad,
  {
    id: 'mock-uuid-2',
    nombre: 'Segunda entidad',
    descripcion: 'Otra descripción',
    creadoEn: new Date(),
    creadoPor: 'mock-user-id',
    modificadoEn: null,
    modificadoPor: null,
    anuladoEn: null,
    anuladoPor: null
  }
];
```

### 6.4. Pruebas de integración de rutas

Las pruebas de integración deben probar el ciclo completo:

```typescript
// tests/integration/entidad.integration.test.ts
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/utils/prisma';
import { mockEntidadData } from '../__fixtures__/entidadFixtures';
import { generarJWT } from '../../src/utils/jwt';

describe('Integración: API de Entidades', () => {
  let token: string;
  let entidadId: string;
  
  beforeAll(async () => {
    // Generar token JWT para pruebas
    token = await generarJWT('test-user-id', ['admin']);
  });
  
  afterAll(async () => {
    // Limpieza de datos de prueba
    await prisma.entidad.deleteMany({
      where: { nombre: { startsWith: 'Test' } }
    });
    await prisma.$disconnect();
  });
  
  it('debe crear, obtener, actualizar y eliminar una entidad', async () => {
    // 1. Crear entidad
    const createResponse = await request(app)
      .post('/api/entidades')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...mockEntidadData,
        nombre: 'Test Entidad'
      });
    
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.ok).toBe(true);
    entidadId = createResponse.body.data.id;
    
    // 2. Obtener entidad por ID
    const getResponse = await request(app)
      .get(`/api/entidades/${entidadId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.nombre).toBe('Test Entidad');
    
    // 3. Listar entidades con filtro
    const listResponse = await request(app)
      .get('/api/entidades?search=Test')
      .set('Authorization', `Bearer ${token}`);
    
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.length).toBeGreaterThanOrEqual(1);
    expect(listResponse.body.data.some(e => e.id === entidadId)).toBe(true);
    
    // 4. Actualizar entidad
    const updateResponse = await request(app)
      .put(`/api/entidades/${entidadId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Test Entidad Actualizada'
      });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.nombre).toBe('Test Entidad Actualizada');
    
    // 5. Eliminar entidad
    const deleteResponse = await request(app)
      .delete(`/api/entidades/${entidadId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(deleteResponse.status).toBe(200);
    
    // 6. Verificar eliminación lógica
    const verifyResponse = await request(app)
      .get(`/api/entidades/${entidadId}`)
      .set('Authorization', `Bearer ${token}`);
    
    // La entidad está anulada, pero aún existe
    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.data.anuladoEn).not.toBeNull();
  });
});
```

## 7. Seguridad

### 7.1. Autenticación y autorización

- Usar JWT para autenticación con tiempos de expiración adecuados
- Incluir array de roles en JWT para sistema multi-rol
- Implementar middleware de roles para autorización granular que valide múltiples roles
- Verificar permisos en cada endpoint protegido considerando que un usuario puede tener múltiples roles
- Validar permisos basados en el rol activo seleccionado por el usuario
- Implementar verificaciones para prevenir modificaciones no autorizadas de roles

### 5.2. Protección de datos sensibles

- Nunca devolver passwords ni datos sensibles en respuestas API
- Hashear passwords con bcrypt antes de almacenar
- Usar variables de entorno para configuraciones sensibles
- Implementar rate limiting para prevenir ataques de fuerza bruta

## 6. Rendimiento y optimización

### 6.1. Consultas eficientes

- Usar selectores específicos en Prisma para obtener solo los campos necesarios
- Implementar paginación para listas grandes
- Usar índices adecuados en la base de datos

### 6.2. Caché

- Considerar caché para datos estáticos o de cambio poco frecuente
- Implementar etags para respuestas API cuando sea apropiado

## 7. Mantenimiento y documentación

### 7.1. Documentación API

- Mantener actualizada la documentación Swagger/OpenAPI
- Incluir ejemplos de request/response para cada endpoint
- Documentar todos los posibles códigos de error
- Documentar claramente cómo se manejan los roles múltiples en cada endpoint
- Incluir ejemplos de tokens JWT con múltiples roles

### 7.2. Comentarios en código

- Documentar funciones complejas con JSDoc
- Explicar decisiones no obvias con comentarios
- Mantener el README actualizado
- Documentar la lógica de autorización multi-rol en middlewares y controladores

### 7.3. Gestión de sistema multi-rol

- Documentar claramente la relación usuario_rol en el esquema de base de datos
- Explicar el proceso de asignación, actualización y revocación de roles
- Mantener diagramas actualizados del flujo de autorización multi-rol
- Documentar los casos de uso principales para escenarios multi-rol

---

Este documento se actualizará periódicamente con nuevas lecciones aprendidas y mejores prácticas identificadas durante el desarrollo continuo de la Intranet Neóptica.
