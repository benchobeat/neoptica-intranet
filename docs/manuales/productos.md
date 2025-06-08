# Gestión de Productos

## Módulos del Sistema de Gestión de Productos

El sistema de gestión de productos incluye los siguientes módulos interconectados para una administración completa del catálogo de productos ópticos:

### 1. Módulo de Productos
- **Propósito**: Gestión central de todos los artículos del catálogo
- **Características principales**:
  - Registro de productos con múltiples atributos
  - Gestión de precios y categorías
  - Soporte para imágenes y modelos 3D
  - Integración con inventario

### 2. Módulo de Colores
- **Propósito**: Administración de la paleta de colores disponible para productos
- **Características principales**:
  - Registro de códigos de color (hexadecimal)
  - Asociación con productos
  - Gestión de disponibilidad

### 3. Módulo de Marcas
- **Propósito**: Administración de marcas comerciales
- **Características principales**:
  - Registro de marcas con logos y descripciones
  - Asociación con productos
  - Filtrado y búsqueda avanzada

### 4. Módulo de Sucursales
- **Propósito**: Gestión de puntos de venta
- **Características principales**:
  - Registro de ubicaciones físicas
  - Gestión de inventario por sucursal
  - Horarios y datos de contacto

### Características Comunes

Todos los módulos comparten las siguientes características:

- **Seguridad**:
  - Autenticación JWT requerida
  - Control de acceso basado en roles
  - Auditoría de todas las operaciones

- **API RESTful**:
  - Estructura consistente de endpoints
  - Respuestas estandarizadas `{ ok, data, error }`
  - Paginación y filtrado

- **Validación de Datos**:
  - Validación de entrada estricta
  - Mensajes de error descriptivos
  - Prevención de duplicados

## Modelos de Datos

### 1. Producto

El modelo `producto` representa los artículos que se venden en la óptica.

#### Campos:

| Campo         | Tipo         | Descripción                                | Requerido |
|---------------|--------------|--------------------------------------------|-----------|
| id            | UUID         | Identificador único                        | Sí        |
| nombre        | String(255)  | Nombre del producto                        | Sí        |
| descripcion   | Text         | Descripción detallada                      | No        |
| precio        | Decimal(10,2)| Precio de venta                           | Sí        |
| categoria     | String(50)   | Categoría del producto                     | No        |
| imagen_url    | String       | URL de la imagen del producto              | No        |
| modelo_3d_url | String       | URL del modelo 3D (para probar gafas)      | No        |
| activo        | Boolean      | Indica si el producto está activo          | No (true) |
| erp_id        | Integer      | ID de referencia en sistema ERP externo    | No        |
| erp_tipo      | String(30)   | Tipo de referencia en ERP                 | No        |
| marca_id      | UUID         | Referencia a la marca del producto         | No        |
| color_id      | UUID         | Referencia al color del producto           | No        |

#### Relaciones:
- Pertenece a una `marca`
- Pertenece a un `color`
- Tiene muchos `detalle_pedido`
- Tiene registros en `inventario`
- Tiene registros en `transferencia_stock`
- Tiene relaciones con `producto_cupon`

### 2. Marca

El modelo `marca` representa las marcas de los productos.

#### Campos:

| Campo       | Tipo        | Descripción                           | Requerido |
|-------------|-------------|---------------------------------------|-----------|
| id          | UUID        | Identificador único                   | Sí        |
| nombre      | String(100) | Nombre de la marca                    | Sí        |
| descripcion | Text        | Descripción de la marca               | No        |
| activo      | Boolean     | Indica si la marca está activa        | No (true) |

#### Relaciones:
- Tiene muchos `producto`
- Tiene registros en `inventario`

### 3. Color

El modelo `color` representa los colores disponibles para los productos.

#### Campos:

| Campo       | Tipo        | Descripción                           | Requerido |
|-------------|-------------|---------------------------------------|-----------|
| id          | UUID        | Identificador único                   | Sí        |
| nombre      | String(100) | Nombre del color                      | Sí        |
| codigo_hex  | String(10)  | Código hexadecimal del color (ej: #FFFFFF) | No     |
| descripcion | Text        | Descripción del color                 | No        |
| activo      | Boolean     | Indica si el color está activo        | No (true) |

#### Relaciones:
- Tiene muchos `producto`
- Tiene registros en `inventario`

## Endpoints

### Productos

#### GET /api/productos
- **Descripción**: Obtiene el listado paginado de productos con filtros opcionales
- **Autenticación**: Requerida (Roles: admin, vendedor, optometrista)
- **Parámetros de consulta**:
  - `page` (opcional, default: 1): Número de página
  - `limit` (opcional, default: 20): Cantidad de ítems por página
  - `categoria` (opcional): Filtrar por categoría
  - `marca_id` (opcional): Filtrar por ID de marca
  - `color_id` (opcional): Filtrar por ID de color
  - `activo` (opcional): Filtrar por estado (true/false)
  - `precio_min` (opcional): Precio mínimo
  - `precio_max` (opcional): Precio máximo
  - `busqueda` (opcional): Búsqueda por nombre o descripción

- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "nombre": "Gafas de sol Ray-Ban",
        "descripcion": "Gafas de sol con protección UV",
        "precio": 199.99,
        "categoria": "Gafas de sol",
        "imagen_url": "https://ejemplo.com/imagen.jpg",
        "modelo_3d_url": "https://ejemplo.com/modelo.glb",
        "activo": true,
        "marca": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "nombre": "Ray-Ban"
        },
        "color": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "nombre": "Negro",
          "codigo_hex": "#000000"
        }
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```
- **Errores comunes**:
  - 401: No autorizado
  - 500: Error del servidor

#### POST /api/productos
- **Descripción**: Crea un nuevo producto
- **Autenticación**: Requerida (Roles: admin, vendedor)
- **Cuerpo**:
  ```json
  {
    "nombre": "Gafas de sol Ray-Ban",
    "descripcion": "Gafas de sol con protección UV",
    "precio": 199.99,
    "categoria": "Gafas de sol",
    "imagen_url": "https://ejemplo.com/imagen.jpg",
    "modelo_3d_url": "https://ejemplo.com/modelo.glb",
    "activo": true,
    "marca_id": "550e8400-e29b-41d4-a716-446655440001",
    "color_id": "550e8400-e29b-41d4-a716-446655440002"
  }
  ```
- **Respuesta exitosa (201 Created)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Gafas de sol Ray-Ban",
      "descripcion": "Gafas de sol con protección UV",
      "precio": 199.99,
      "categoria": "Gafas de sol",
      "imagen_url": "https://ejemplo.com/imagen.jpg",
      "modelo_3d_url": "https://ejemplo.com/modelo.glb",
      "activo": true,
      "marca_id": "550e8400-e29b-41d4-a716-446655440001",
      "color_id": "550e8400-e29b-41d4-a716-446655440002"
    },
    "error": null
  }
  ```
- **Errores comunes**:
  - 400: Datos inválidos o faltantes
  - 401: No autorizado
  - 409: Ya existe un producto con ese nombre
  - 500: Error del servidor

#### GET /api/productos/:id
- **Descripción**: Obtiene los detalles de un producto específico
- **Autenticación**: Requerida (Roles: admin, vendedor, optometrista)
- **Parámetros de ruta**:
  - `id` (requerido): ID del producto (UUID)
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Gafas de sol Ray-Ban",
      "descripcion": "Gafas de sol con protección UV",
      "precio": 199.99,
      "categoria": "Gafas de sol",
      "imagen_url": "https://ejemplo.com/imagen.jpg",
      "modelo_3d_url": "https://ejemplo.com/modelo.glb",
      "activo": true,
      "marca": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "nombre": "Ray-Ban"
      },
      "color": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "nombre": "Negro",
        "codigo_hex": "#000000"
      }
    },
    "error": null
  }
  ```
- **Errores comunes**:
  - 401: No autorizado
  - 404: Producto no encontrado
  - 500: Error del servidor

#### PUT /api/productos/:id
- **Descripción**: Actualiza un producto existente
- **Autenticación**: Requerida (Roles: admin, vendedor)
- **Parámetros de ruta**:
  - `id` (requerido): ID del producto a actualizar (UUID)
- **Cuerpo** (campos opcionales, solo enviar los que se deseen actualizar):
  ```json
  {
    "nombre": "Nuevo nombre",
    "descripcion": "Nueva descripción",
    "precio": 249.99,
    "categoria": "Nueva categoría",
    "imagen_url": "https://nuevo-ejemplo.com/imagen.jpg",
    "modelo_3d_url": "https://nuevo-ejemplo.com/modelo.glb",
    "activo": false,
    "marca_id": "nuevo-uuid-marca",
    "color_id": "nuevo-uuid-color"
  }
  ```
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Nuevo nombre",
      "descripcion": "Nueva descripción",
      "precio": 249.99,
      "categoria": "Nueva categoría",
      "imagen_url": "https://nuevo-ejemplo.com/imagen.jpg",
      "modelo_3d_url": "https://nuevo-ejemplo.com/modelo.glb",
      "activo": false,
      "marca_id": "nuevo-uuid-marca",
      "color_id": "nuevo-uuid-color"
    },
    "error": null
  }
  ```
- **Errores comunes**:
  - 400: Datos inválidos
  - 401: No autorizado
  - 404: Producto no encontrado
  - 500: Error del servidor

#### DELETE /api/productos/:id
- **Descripción**: Desactiva un producto (soft delete)
- **Autenticación**: Requerida (Roles: admin)
- **Parámetros de ruta**:
  - `id` (requerido): ID del producto a desactivar (UUID)
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Gafas de sol Ray-Ban",
      "activo": false
    },
    "error": null
  }
  ```
- **Errores comunes**:
  - 401: No autorizado
  - 403: No tiene permisos para realizar esta acción
  - 404: Producto no encontrado
  - 500: Error del servidor

## Endpoints de Colores

#### GET /api/colores
- **Descripción**: Obtiene el listado de colores con paginación y filtros
- **Autenticación**: Requerida (Roles: admin, vendedor, optometrista)
- **Parámetros de consulta**:
  - `page` (opcional, default: 1): Número de página
  - `limit` (opcional, default: 20): Cantidad de ítems por página
  - `activo` (opcional): Filtrar por estado (true/false)
  - `busqueda` (opcional): Búsqueda por nombre

- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "nombre": "Negro",
        "codigo_hex": "#000000",
        "descripcion": "Color negro estándar",
        "activo": true
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```

#### POST /api/colores
- **Descripción**: Crea un nuevo color
- **Autenticación**: Requerida (Roles: admin, vendedor)
- **Cuerpo**:
  ```json
  {
    "nombre": "Azul Marino",
    "codigo_hex": "#003366",
    "descripcion": "Color azul marino oscuro",
    "activo": true
  }
  ```
- **Respuesta exitosa (201 Created)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Azul Marino",
      "codigo_hex": "#003366",
      "descripcion": "Color azul marino oscuro",
      "activo": true
    },
    "error": null
  }
  ```

#### GET /api/colores/:id
- **Descripción**: Obtiene un color por su ID
- **Autenticación**: Requerida (Roles: admin, vendedor, optometrista)
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Azul Marino",
      "codigo_hex": "#003366",
      "descripcion": "Color azul marino oscuro",
      "activo": true
    },
    "error": null
  }
  ```

#### PUT /api/colores/:id
- **Descripción**: Actualiza un color existente
- **Autenticación**: Requerida (Roles: admin, vendedor)
- **Cuerpo** (campos opcionales):
  ```json
  {
    "nombre": "Azul Marino Oscuro",
    "codigo_hex": "#002244",
    "descripcion": "Color azul marino más oscuro"
  }
  ```
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Azul Marino Oscuro",
      "codigo_hex": "#002244",
      "descripcion": "Color azul marino más oscuro",
      "activo": true
    },
    "error": null
  }
  ```

#### DELETE /api/colores/:id
- **Descripción**: Desactiva un color (soft delete)
- **Autenticación**: Requerida (Roles: admin)
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Azul Marino Oscuro",
      "activo": false
    },
    "error": null
  }
  ```

## Endpoints de Marcas

#### GET /api/marcas
- **Descripción**: Obtiene el listado de marcas con paginación y filtros
- **Autenticación**: Requerida (Roles: admin, vendedor, optometrista)
- **Parámetros de consulta**:
  - `page` (opcional, default: 1): Número de página
  - `limit` (opcional, default: 20): Cantidad de ítems por página
  - `activo` (opcional): Filtrar por estado (true/false)
  - `busqueda` (opcional): Búsqueda por nombre

- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "nombre": "Ray-Ban",
        "descripcion": "Marca líder en gafas de sol",
        "activo": true
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```

#### POST /api/marcas
- **Descripción**: Crea una nueva marca
- **Autenticación**: Requerida (Roles: admin, vendedor)
- **Cuerpo**:
  ```json
  {
    "nombre": "Oakley",
    "descripcion": "Marca de gafas deportivas",
    "activo": true
  }
  ```
- **Respuesta exitosa (201 Created)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "nombre": "Oakley",
      "descripcion": "Marca de gafas deportivas",
      "activo": true
    },
    "error": null
  }
  ```

#### GET /api/marcas/:id
- **Descripción**: Obtiene una marca por su ID
- **Autenticación**: Requerida (Roles: admin, vendedor, optometrista)
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "nombre": "Oakley",
      "descripcion": "Marca de gafas deportivas",
      "activo": true
    },
    "error": null
  }
  ```

#### PUT /api/marcas/:id
- **Descripción**: Actualiza una marca existente
- **Autenticación**: Requerida (Roles: admin, vendedor)
- **Cuerpo** (campos opcionales):
  ```json
  {
    "nombre": "Oakley Sports",
    "descripcion": "Marca líder en gafas deportivas"
  }
  ```
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "nombre": "Oakley Sports",
      "descripcion": "Marca líder en gafas deportivas",
      "activo": true
    },
    "error": null
  }
  ```

#### DELETE /api/marcas/:id
- **Descripción**: Desactiva una marca (soft delete)
- **Autenticación**: Requerida (Roles: admin)
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "nombre": "Oakley Sports",
      "activo": false
    },
    "error": null
  }
  ```

## Flujos de Trabajo

### 1. Creación de un Nuevo Producto
1. Verificar que la marca y color existan
2. Crear el producto con los datos proporcionados
3. Registrar el movimiento de inventario inicial si corresponde
4. Retornar el producto creado con sus relaciones

### 2. Actualización de Producto
1. Verificar que el producto exista y esté activo
2. Actualizar los campos proporcionados
3. Si se actualiza el precio, registrar el cambio histórico
4. Retornar el producto actualizado

### 3. Desactivación de Producto
1. Verificar que el producto exista y esté activo
2. Verificar que no tenga inventario pendiente
3. Marcar como inactivo (soft delete)
4. Registrar la operación en el log de auditoría