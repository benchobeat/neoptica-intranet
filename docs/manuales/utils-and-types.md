# Utilidades y Tipos del Backend

## Tipos Principales

### ApiResponse
```typescript
// src/types/response.ts
export interface ApiResponse<T = any> {
  ok: boolean;
  data: T | null;
  error: string | null;
  meta?: any;
}
```

### Tipos de Auditoría
```typescript
// src/types/audit.ts
export interface AuditLogParams {
  userId?: string | null;
  ip: string;
  entityType: string;
  entityId?: string;
  module: string;
  action: string;
  message: string;
  details?: Record<string, any>;
  error?: any;
}
```

### Tipos de Autenticación
```typescript
// src/types/auth.d.ts
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      roles: string[];
    }
  }
}
```

## Utilidades Principales

### 1. Manejo de Auditoría

#### `registrarAuditoria`
```typescript
// src/utils/audit.ts
export const registrarAuditoria = async (params: AuditLogParams): Promise<void>;
```

**Uso:**
```typescript
await registrarAuditoria({
  userId: req.user?.id,
  ip: req.ip,
  entityType: 'producto',
  entityId: producto.id,
  module: 'productoController',
  action: 'crear_producto',
  message: 'Producto creado exitosamente',
  details: { /* datos adicionales */ }
});
```

### 2. Utilidades de Prisma

#### `convertIdsToRelations`
```typescript
// src/utils/prisma.ts
export const convertIdsToRelations = (
  data: Record<string, any>,
  fieldMap: Record<string, string>
): Record<string, any>;
```

**Uso:**
```typescript
const relations = convertIdsToRelations(
  { categoriaId: '123', marcaId: '456' },
  { categoriaId: 'categoria', marcaId: 'marca' }
);
// Retorna: { categoria: { connect: { id: '123' } }, marca: { connect: { id: '456' } } }
```

#### `toStringFieldUpdateOperation`
```typescript
// src/utils/prisma.ts
export const toStringFieldUpdateOperation = (
  value: string | undefined | null | { set?: string | null }
): { set: string | null } | undefined;
```

### 3. Utilidades de Validación

#### `validateProductoInput`
```typescript
// src/utils/validacions.ts
export const validateProductoInput = (
  data: any
): { error: string } | Prisma.ProductoCreateInput;
```

**Uso:**
```typescript
const validacion = validateProductoInput(req.body);
if ('error' in validacion) {
  return res.status(400).json({ ok: false, error: validacion.error });
}
```

#### `validarCamposNumericosProducto`
```typescript
// src/utils/validacionesNumericas.ts
export const validarCamposNumericosProducto = (
  data: Record<string, any>
): string | null;
```

### 4. Utilidades de Respuesta

#### `createSuccessResponse`
```typescript
// src/utils/response.ts
export const createSuccessResponse = <T>(
  data: T,
  meta?: any
): ApiResponse<T> => ({
  ok: true,
  data,
  error: null,
  meta
});
```

#### `createErrorResponse`
```typescript
// src/utils/response.ts
export const createErrorResponse = (
  error: string,
  status: number = 500
): { status: number; response: ApiResponse } => ({
  status,
  response: {
    ok: false,
    data: null,
    error
  }
});
```

## Estructura de Carpetas

```
src/
  types/                 # Definiciones de tipos TypeScript
    audit.ts            # Tipos para auditoría
    auth.d.ts           # Tipos de autenticación
    express.d.ts        # Extensiones de tipos de Express
    response.ts         # Tipos de respuesta de la API
  utils/
    audit.ts           # Utilidades de auditoría
    mailer.ts          # Utilidades de envío de correos
    prisma.ts          # Utilidades para Prisma
    requestUtils.ts    # Utilidades para procesar requests
    response.ts        # Utilidades para construir respuestas
    swagger.ts         # Configuración de Swagger
    validacionesNumericas.ts  # Validaciones numéricas
    validacions.ts     # Validaciones generales
```

## Buenas Prácticas

1. **Tipado Estricto**
   - Usar siempre tipos explícitos en lugar de `any`
   - Crear interfaces para estructuras de datos complejas
   - Usar los tipos generados por Prisma cuando sea posible

2. **Manejo de Errores**
   - Usar `try/catch` para operaciones asíncronas
   - Registrar errores con `logError`
   - Proporcionar mensajes de error útiles al cliente

3. **Auditoría**
   - Registrar todas las operaciones importantes
   - Incluir contexto relevante en los logs
   - Usar `logSuccess` para operaciones exitosas

4. **Validación**
   - Validar todos los datos de entrada
   - Usar las funciones de validación proporcionadas
   - Devolver mensajes de error claros

## Ejemplo de Uso en un Controlador

```typescript
import { Request, Response } from 'express';
import { registrarAuditoria } from '../utils/audit';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import { validateProductoInput } from '../utils/validacions';
import prisma from '../utils/prisma';

export const crearProducto = async (req: Request, res: Response) => {
  try {
    // Validar entrada
    const validacion = validateProductoInput(req.body);
    if ('error' in validacion) {
      return res.status(400).json(createErrorResponse(validacion.error, 400).response);
    }

    // Crear producto
    const producto = await prisma.producto.create({
      data: validacion
    });

    // Registrar auditoría
    await registrarAuditoria({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'producto',
      entityId: producto.id,
      module: 'productoController',
      action: 'crear_producto',
      message: 'Producto creado exitosamente'
    });

    // Responder
    return res.status(201).json(createSuccessResponse(producto));
  } catch (error) {
    console.error('Error al crear producto:', error);
    
    // Registrar error
    await registrarAuditoria({
      userId: req.user?.id,
      ip: req.ip,
      entityType: 'producto',
      module: 'productoController',
      action: 'error_crear_producto',
      message: 'Error al crear producto',
      error
    });

    // Responder con error
    const { status, response } = createErrorResponse(
      'Error interno del servidor al crear el producto',
      500
    );
    return res.status(status).json(response);
  }
};
```