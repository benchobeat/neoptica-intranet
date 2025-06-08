# Gestión de Auditoría

## GET /api/auditoria

Consultar registros de auditoría del sistema. Este endpoint permite a los administradores revisar el historial de acciones realizadas en el sistema.

**Autenticación**: Requerida (Rol: admin)

**Parámetros de consulta**:
- `usuarioId` (opcional, string): Filtrar por ID de usuario (formato UUID)
- `accion` (opcional, string): Filtrar por tipo de acción (ej: 'INICIO_SESION', 'CAMBIO_CONTRASENA')
- `fechaDesde` (opcional, string): Fecha de inicio (formato ISO 8601)
- `fechaHasta` (opcional, string): Fecha de fin (formato ISO 8601)
- `pagina` (opcional, number): Número de página (mínimo: 1, por defecto: 1)
- `limite` (opcional, number): Resultados por página (mínimo: 1, máximo: 100, por defecto: 20)
- `orden` (opcional, string): Ordenación por fecha ('asc' o 'desc', por defecto: 'desc')

**Headers requeridos**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": [
    {
      "id": "audit-uuid",
      "usuarioId": "usuario-uuid",
      "accion": "INICIO_SESION",
      "descripcion": "Inicio de sesión exitoso",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "fecha": "2023-06-07T12:00:00.000Z"
    }
  ],
  "paginacion": {
    "paginaActual": 1,
    "totalPaginas": 5,
    "totalRegistros": 95,
    "limite": 20
  },
  "error": null
}
```

**Campos de respuesta**:
- **data**: Array de registros de auditoría
  - **id**: Identificador único del registro (UUID)
  - **usuarioId**: ID del usuario que realizó la acción
  - **accion**: Tipo de acción realizada
  - **descripcion**: Descripción detallada de la acción
  - **ip**: Dirección IP desde donde se realizó la acción
  - **userAgent**: Agente de usuario del navegador
  - **fecha**: Fecha y hora de la acción (ISO 8601)
- **paginacion**: Información de paginación
  - **paginaActual**: Página actual
  - **totalPaginas**: Total de páginas disponibles
  - **totalRegistros**: Total de registros que coinciden con los filtros
  - **limite**: Número de registros por página

**Validaciones**:
- **Autenticación**:
  - Requiere token JWT válido
  - El token no debe estar expirado
  - El usuario debe tener el rol de 'admin'
- **Parámetros**:
  - `fechaDesde` y `fechaHasta` deben ser fechas ISO 8601 válidas
  - El rango de fechas no puede ser mayor a 90 días
  - `pagina` y `limite` deben ser números enteros positivos
  - `usuarioId` debe ser un UUID válido si se proporciona

**Notas de seguridad**:
- Solo los administradores pueden acceder a los registros de auditoría
- Los registros de auditoría son inmutables y no pueden ser modificados
- Los datos sensibles se enmascaran antes de mostrarse
- Se aplica rate limiting (máximo 30 solicitudes por minuto por IP)
- Las consultas se registran en un log separado para auditoría de acceso

**Códigos de error**:
- 400: Parámetros de consulta inválidos
- 401: No autenticado o token inválido
- 403: No autorizado para acceder a los registros de auditoría
- 413: Rango de fechas demasiado amplio (máximo 90 días)
- 429: Demasiadas solicitudes
- 500: Error interno del servidor

**Ejemplo de error**:
```json
{
  "ok": false,
  "data": null,
  "error": "Rango de fechas no válido",
  "codigo": "INVALID_DATE_RANGE",
  "detalles": {
    "max_dias": 90,
    "rango_solicitado": 120
  }
}
```

**Ejemplo de solicitud**:
```http
GET /api/auditoria?usuarioId=usuario-uuid&fechaDesde=2023-01-01T00:00:00Z&fechaHasta=2023-01-31T23:59:59Z&pagina=1&limite=20&orden=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```
