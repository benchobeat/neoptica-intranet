# Seguridad y Control de Acceso - Asignación de Roles

## Roles del Sistema

| Rol | Descripción | Nivel de Acceso |
|-----|-------------|-----------------|
| superadmin | Administrador del sistema | Completo |
| administrador | Gestión de usuarios y roles | Alto |
| gerente | Visualización de asignaciones | Medio |
| usuario | Sin acceso a la gestión | Ninguno |

## Matriz de Permisos

| Operación | Ruta | Método | Roles Permitidos |
|-----------|------|--------|------------------|
| Asignar rol | /api/usuarios | POST | superadmin, administrador |
| Actualizar roles | /api/usuarios/{id} | PUT | superadmin, administrador |
| Ver asignaciones | /api/usuarios/{id} | GET | superadmin, administrador, gerente |
| Eliminar asignación | /api/usuarios/{id}/roles | DELETE | superadmin |

## Validaciones de Seguridad

1. **Autenticación**
   - Todas las operaciones requieren autenticación mediante JWT
   - Los tokens expiran después de 8 horas de inactividad

2. **Autorización**
   - Los usuarios solo pueden gestionar roles de igual o menor jerarquía
   - No se permite la auto-asignación de roles
   - Validación de asignaciones duplicadas

3. **Protección de Datos**
   - Enmascaramiento de datos sensibles en logs
   - Cifrado de datos en tránsito (HTTPS/TLS 1.2+)
   - No se registran contraseñas en los logs

## Auditoría de Seguridad

### Eventos Auditados
- Asignación de roles
- Eliminación de asignaciones
- Intentos de acceso no autorizados
- Cambios en la configuración de seguridad

### Estructura del Log de Auditoría

```json
{
  "timestamp": "2025-06-07T16:30:00.000Z",
  "usuario_id": "uuid-del-usuario",
  "accion": "ASIGNAR_ROL",
  "entidad": "usuario_rol",
  "entidad_id": "uuid-de-la-asignacion",
  "ip_origen": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "detalles": {
    "usuario_afectado": "uuid-del-usuario-afectado",
    "rol_asignado": "nombre-del-rol",
    "anterior_estado": null,
    "nuevo_estado": "ACTIVO"
  }
}
```

## Incidentes de Seguridad

### Procedimiento de Respuesta
1. **Detección**
   - Monitoreo de intentos de acceso sospechosos
   - Alertas automáticas para patrones inusuales

2. **Contención**
   - Bloqueo temporal de cuentas comprometidas
   - Revocación de tokens afectados

3. **Eradicación**
   - Análisis forense
   - Parche de vulnerabilidades identificadas

4. **Recuperación**
   - Restauración desde backup si es necesario
   - Cambio de credenciales afectadas

## Mejores Prácticas

1. **Principio de Mínimo Privilegio**
   - Asignar solo los roles estrictamente necesarios
   - Revisar periódicamente los permisos otorgados

2. **Monitoreo Continuo**
   - Alertas para asignaciones de alto privilegio
   - Revisión semanal de logs de auditoría

3. **Capacitación**
   - Entrenamiento en seguridad para administradores
   - Simulacros de respuesta a incidentes

## Contactos Clave

| Rol | Nombre | Contacto | Disponibilidad |
|-----|--------|----------|----------------|
| Responsable de Seguridad | Ana López | seguridad@empresa.com | 24/7 |
| Administrador de Sistemas | Carlos M. | sistemas@empresa.com | Horario laboral |
| Soporte Técnico | Equipo TI | soporte@empresa.com | 24/7 |

## Cumplimiento Normativo

- **LGPD**: Registro de consentimiento para tratamiento de datos
- **ISO 27001**: Controles de gestión de identidades
- **NIST 800-53**: Controles de control de acceso lógico

## Historial de Cambios

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 2025-06-07 | 1.0.0 | Documentación inicial | Equipo de Seguridad |
