# Endpoints de Gestión - [NOMBRE_DEL_MODELO]

## `GET /api/[nombre_modelo]`

Obtiene una lista paginada de registros.

### Parámetros de Consulta

| Parámetro | Tipo | Requerido | Valor por Defecto | Descripción |
|-----------|------|-----------|-------------------|-------------|
| page | number | No | 1 | Número de página |
| limit | number | No | 10 | Cantidad de registros por página |
| sortBy | string | No | creado_en | Campo por el cual ordenar |
| sortOrder | 'asc'\|'desc' | No | desc | Orden de clasificación |
| search | string | No | - | Término de búsqueda |

### Respuesta Exitosa (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "campo1": "valor1",
      "campo2": "valor2",
      "creado_en": "2025-06-07T16:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## `GET /api/[nombre_modelo]/:id`

Obtiene un registro por su ID.

### Parámetros de Ruta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| id | string | Sí | ID del registro |

### Respuesta Exitosa (200)

```json
{
  "id": "uuid",
  "campo1": "valor1",
  "campo2": "valor2",
  "creado_en": "2025-06-07T16:30:00.000Z",
  "actualizado_en": "2025-06-07T16:30:00.000Z"
}
```

## `POST /api/[nombre_modelo]`

Crea un nuevo registro.

### Cuerpo de la Petición

```json
{
  "campo1": "valor1",
  "campo2": "valor2"
}
```

### Validaciones

| Campo | Reglas |
|-------|--------|
| campo1 | requerido, tipo string, longitud máxima 255 |
| campo2 | opcional, tipo number, mínimo 0 |

### Respuesta Exitosa (201)

```json
{
  "id": "nuevo-uuid",
  "mensaje": "[Nombre del modelo] creado exitosamente"
}
```

## `PUT /api/[nombre_modelo]/:id`

Actualiza un registro existente.

### Parámetros de Ruta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| id | string | Sí | ID del registro a actualizar |

### Cuerpo de la Petición

```json
{
  "campo1": "nuevo_valor",
  "campo2": 42
}
```

### Respuesta Exitosa (200)

```json
{
  "id": "uuid",
  "mensaje": "[Nombre del modelo] actualizado exitosamente"
}
```

## `DELETE /api/[nombre_modelo]/:id`

Elimina un registro (soft delete).

### Parámetros de Ruta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| id | string | Sí | ID del registro a eliminar |

### Respuesta Exitosa (200)

```json
{
  "mensaje": "[Nombre del modelo] eliminado exitosamente"
}
```

## Códigos de Error Comunes

| Código | Mensaje | Descripción |
|--------|---------|-------------|
| 400 | Petición inválida | Error de validación en los datos |
| 401 | No autorizado | Token inválido o expirado |
| 403 | Prohibido | No tiene permisos para realizar esta acción |
| 404 | No encontrado | El registro no existe |
| 409 | Conflicto | El registro tiene relaciones existentes |
| 500 | Error interno del servidor | Error inesperado |

## Seguridad

### Autenticación Requerida
- Método: Bearer Token
- Ámbito: `[nombre_modelo]:[operacion]` (ej: `[nombre_modelo]:read`, `[nombre_modelo]:write`)

### Headers Requeridos

```
Authorization: Bearer [token]
Content-Type: application/json
```

## Ejemplos de Uso

### Obtener todos los registros con paginación

```bash
curl -X GET \
  'http://api.ejemplo.com/api/[nombre_modelo]?page=1&limit=10' \
  -H 'Authorization: Bearer [token]'
```

### Crear un nuevo registro

```bash
curl -X POST \
  http://api.ejemplo.com/api/[nombre_modelo] \
  -H 'Authorization: Bearer [token]' \
  -H 'Content-Type: application/json' \
  -d '{
    "campo1": "valor1",
    "campo2": 42
  }'
```

### Actualizar un registro existente

```bash
curl -X PUT \
  http://api.ejemplo.com/api/[nombre_modelo]/[id] \
  -H 'Authorization: Bearer [token]' \
  -H 'Content-Type: application/json' \
  -d '{
    "campo1": "nuevo_valor"
  }'
```

### Eliminar un registro

```bash
curl -X DELETE \
  http://api.ejemplo.com/api/[nombre_modelo]/[id] \
  -H 'Authorization: Bearer [token]'
```

## Consideraciones de Rendimiento

- Tiempo máximo de respuesta: 2 segundos
- Tamaño máximo de respuesta: 1MB
- Tasa de solicitudes: 1000 solicitudes/minuto por IP

## Control de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| v1.0.0 | YYYY-MM-DD | Versión inicial |
| v1.1.0 | YYYY-MM-DD | Agregado filtrado por campo |

## Deprecación

Los endpoints marcados como obsoletos serán eliminados en la próxima versión mayor. Se recomienda actualizar las integraciones lo antes posible.
