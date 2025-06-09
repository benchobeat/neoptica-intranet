# Reglas de Negocio - Asignación de Roles

## 1. Validaciones de Datos

### 1.1 Validaciones de Estructura

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| usuario_id | UUID | Sí | - Formato UUID válido<br>- Debe existir en la tabla usuarios |
| rol_id | UUID | Sí | - Formato UUID válido<br>- Debe existir en la tabla roles |
| asignado_por | UUID | Sí | - Usuario con permisos de administración |
| fecha_asignacion | DateTime | No | - Se establece automáticamente<br>- Formato ISO 8601 |
| activo | Boolean | No | - Valor por defecto: true |

### 1.2 Validaciones de Negocio

#### 1.2.1 Reglas de Asignación
- **RB-001**: Un usuario no puede asignarse roles a sí mismo
- **RB-002**: No se pueden asignar roles inactivos
- **RB-003**: No se pueden asignar roles duplicados
- **RB-004**: Solo administradores pueden asignar roles

#### 1.2.2 Reglas de Jerarquía
- **RB-005**: Usuarios solo pueden asignar roles de igual o menor jerarquía
- **RB-006**: No se puede asignar el rol 'superadmin' a través de la API
- **RB-007**: Mínimo un rol debe estar asignado a cada usuario

## 2. Flujos de Trabajo

### 2.1 Asignación de Roles

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as API
    participant B as Base de Datos
    participant L as Log Auditoría
    
    C->>A: POST /api/usuarios/{id}/roles
    A->>A: Validar token JWT
    A->>B: Verificar permisos de usuario
    B-->>A: Datos de permisos
    A->>A: Validar reglas de negocio
    A->>B: Actualizar asignaciones
    B-->>A: Confirmación
    A->>L: Registrar auditoría
    L-->>A: OK
    A-->>C: 200 OK
```

### 2.2 Eliminación de Asignación

1. **Inicio**: Usuario solicita eliminar asignación
2. **Validación**:
   - Verificar autenticación
   - Validar permisos
   - Verificar que la asignación existe
3. **Ejecución**:
   - Actualizar estado a inactivo (soft delete)
   - Registrar auditoría
4. **Respuesta**:
   - Confirmación de eliminación
   - Código de estado HTTP apropiado

## 3. Reglas de Validación Detalladas

### 3.1 Validación de Roles (RB-001)

```typescript
function validarAutoAsignacion(usuarioId: string, roles: string[]): void {
  if (roles.some(rol => rol.usuario_id === usuarioId)) {
    throw new Error('No se puede asignar roles a sí mismo');
  }
}
```

### 3.2 Validación de Jerarquía (RB-005)

```typescript
async function validarJerarquia(usuarioId: string, rolesAsignar: string[]): Promise<void> {
  const usuario = await obtenerUsuarioConRoles(usuarioId);
  const maxNivelUsuario = Math.max(...usuario.roles.map(r => r.nivel));
  
  for (const rolId of rolesAsignar) {
    const rol = await obtenerRol(rolId);
    if (rol.nivel > maxNivelUsuario) {
      throw new Error(`No tiene permisos para asignar el rol: ${rol.nombre}`);
    }
  }
}
```

## 4. Integración con Otros Sistemas

### 4.1 API de Usuarios

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| /api/usuarios | POST | Crear usuario con roles |
| /api/usuarios/{id} | PUT | Actualizar usuario y roles |
| /api/usuarios/{id}/roles | GET | Obtener roles del usuario |
| /api/usuarios/{id}/roles | POST | Asignar roles adicionales |
| /api/usuarios/{id}/roles | DELETE | Eliminar asignación de roles |

### 4.2 Eventos del Sistema

| Evento | Descripción | Payload |
|--------|-------------|---------|
| rol.asignado | Se asignó un rol | { usuarioId, rolId, asignadoPor } |
| rol.eliminado | Se eliminó una asignación | { usuarioId, rolId, eliminadoPor } |
| rol.actualizado | Se actualizaron asignaciones | { usuarioId, cambios: { añadidos: [], eliminados: [] } } |

## 5. Ejemplos

### 5.1 Asignación Exitosa

**Petición**:
```http
POST /api/usuarios/550e8400-e29b-41d4-a716-446655440000/roles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "roles": ["vendedor", "cajero"]
}
```

**Respuesta**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "roles": ["vendedor", "cajero"],
  "actualizado_en": "2025-06-07T16:30:00Z"
}
```

### 5.2 Error de Validación

**Petición**:
```http
POST /api/usuarios/550e8400-e29b-41d4-a716-446655440000/roles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "roles": ["superadmin"]
}
```

**Respuesta**:
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "forbidden",
  "message": "No tiene permisos para asignar el rol: superadmin",
  "code": "RB-005"
}
```

## 6. Consideraciones Adicionales

### 6.1 Rendimiento
- Cachear roles de usuario para validaciones frecuentes
- Usar transacciones para operaciones atómicas
- Implementar paginación en consultas de listados

### 6.2 Seguridad
- Validar todos los inputs contra inyección SQL
- Implementar rate limiting para prevenir abuso
- Registrar todos los intentos de acceso

### 6.3 Auditoría
- Mantener historial completo de cambios
- Registrar IP y user agent del solicitante
- Almacenar hash de la petición original

## 7. Historial de Cambios

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 2025-06-07 | 1.0.0 | Documentación inicial | Equipo de Desarrollo |

## 8. Glosario

| Término | Definición |
|---------|------------|
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| UUID | Identificador único universal |
| Soft Delete | Eliminación lógica (marcado como inactivo) |
