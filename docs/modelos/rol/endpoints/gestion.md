# Gestión de Roles

## GET /api/roles

Obtiene la lista de roles disponibles en el sistema. Los roles son predefinidos y no pueden ser creados, modificados o eliminados a través de la API.

**Autenticación**: Requerida (Rol: admin)

**Parámetros de consulta**:
- `ordenar_por` (opcional): Campo por el que ordenar los resultados (`nombre`, `nivel_permisos`)
- `orden` (opcional): Dirección de ordenación (`asc` o `desc`)
- `incluir_inactivos` (opcional, boolean): Si incluir roles inactivos (por defecto: `false`)

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": [
    {
      "id": "rol-admin-uuid",
      "nombre": "admin",
      "descripcion": "Administrador del sistema",
      "nivel_permisos": 1000,
      "activo": true,
      "fecha_creacion": "2023-01-01T00:00:00.000Z",
      "modificado_por": null,
      "fecha_modificacion": null
    },
    {
      "id": "rol-vendedor-uuid",
      "nombre": "vendedor",
      "descripcion": "Vendedor",
      "nivel_permisos": 100,
      "activo": true,
      "fecha_creacion": "2023-01-01T00:00:00.000Z",
      "modificado_por": null,
      "fecha_modificacion": null
    },
    {
      "id": "rol-cliente-uuid",
      "nombre": "cliente",
      "descripcion": "Cliente",
      "nivel_permisos": 10,
      "activo": true,
      "fecha_creacion": "2023-01-01T00:00:00.000Z",
      "modificado_por": null,
      "fecha_modificacion": null
    }
  ],
  "error": null
}
```

**Campos de respuesta**:
- **id**: Identificador único del rol (UUID)
- **nombre**: Nombre único del rol (usado para permisos)
- **descripcion**: Descripción del rol
- **nivel_permisos**: Número que representa el nivel de permisos (mayor número = más permisos)
- **activo**: Indica si el rol está activo
- **fecha_creacion**: Fecha de creación del rol
- **modificado_por**: ID del usuario que realizó la última modificación (si aplica)
- **fecha_modificacion**: Fecha de la última modificación (si aplica)

**Notas**:
- Solo usuarios con rol de administrador pueden acceder a este endpoint
- Los roles son predefinidos en el sistema y no pueden ser modificados a través de la API
- El orden por defecto es por `nivel_permisos` en orden descendente

**Códigos de error**:
- 401: No autenticado
- 403: No autorizado (se requiere rol admin)
- 500: Error del servidor

**Ejemplo de error**:
```json
{
  "ok": false,
  "data": null,
  "error": "No autorizado para acceder a este recurso",
  "codigo": "FORBIDDEN"
}
```

**Ejemplo de solicitud**:
```http
GET /api/roles?ordenar_por=nivel_permisos&orden=desc&incluir_inactivos=false
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```
