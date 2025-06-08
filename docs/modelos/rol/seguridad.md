# Seguridad y Control de Acceso - Roles

## 1. Roles y Permisos

### 1.1 Matriz de Acceso

| Rol | Listar Roles | Ver Detalles | Crear | Actualizar | Eliminar |
|-----|--------------|---------------|-------|------------|----------|
| Administrador | ✅ | ✅ | ❌ | ❌ | ❌ |
| Usuario Autenticado | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invitado | ❌ | ❌ | ❌ | ❌ | ❌ |

### 1.2 Campos de Auditoría

Cada registro de rol incluye campos de auditoría que rastrean su ciclo de vida:
- `creado_en`: Fecha de creación del registro
- `creado_por`: ID del usuario que creó el registro
- `modificado_en`: Última fecha de modificación
- `modificado_por`: ID del último usuario que modificó
- `anulado_en`: Fecha de eliminación lógica (soft delete)
- `anulado_por`: ID del usuario que realizó la eliminación lógica

### 1.3 Niveles de Acceso

- **Público**: No aplica (todos los accesos requieren autenticación)
- **Autenticado**: Cualquier usuario autenticado puede listar y ver roles
- **Privado**: No aplica (todos los roles son visibles para usuarios autenticados)

## 2. Políticas de Seguridad

### 2.1 Control de Acceso

- **Autenticación Requerida**: Todas las operaciones requieren autenticación
- **Autorización Basada en Roles**: El acceso está determinado por el rol del usuario
- **Principio de Mínimo Privilegio**: Solo se otorga acceso a la información necesaria

### 2.2 Validaciones de Seguridad

1. **Validación de Entrada**
   - Verificar que el token JWT sea válido
   - Validar formato de UUID para parámetros de ruta
   - Aplicar límites de tasa (rate limiting) para prevenir abusos

2. **Validación de Salida**
   - Filtrar datos sensibles en las respuestas
   - Aplicar políticas CORS estrictas
   - Incluir encabezados de seguridad (HSTS, CSP, X-Content-Type-Options)

## 3. Auditoría

### 3.1 Registro de Eventos

Se registran los siguientes eventos de seguridad:

| Evento | Nivel | Descripción |
|--------|-------|-------------|
| ROL_CONSULTA | INFORMATIVO | Consulta de lista de roles |
| ROL_DETALLE | INFORMATIVO | Consulta de detalles de un rol |
| ROL_ACCESO_NO_AUTORIZADO | ALTO | Intento de acceso no autorizado |

### 3.2 Estructura del Registro de Auditoría

```json
{
  "timestamp": "2025-06-07T21:46:16Z",
  "evento": "ROL_CONSULTA",
  "usuario": "usuario@ejemplo.com",
  "rol": "usuario_estandar",
  "ip_origen": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "detalles": {
    "filtros_aplicados": {},
    "total_resultados": 5
  },
  "estado": "EXITO"
}
```

## 4. Respuesta a Incidentes

### 4.1 Procedimiento para Accesos No Autorizados

1. **Detección**: Monitorear intentos fallidos de autenticación
2. **Contención**: Bloquear temporalmente IPs con múltiples intentos fallidos
3. **Investigación**: Revisar registros de auditoría para identificar patrones
4. **Remediación**: Actualizar políticas de seguridad si es necesario
5. **Notificación**: Informar al equipo de seguridad en caso de incidentes graves

### 4.2 Contactos de Seguridad

| Rol | Nombre | Contacto |
|-----|--------|----------|
| Administrador de Seguridad | Equipo de Seguridad | seguridad@neoptica.com |
| Soporte Técnico | Soporte TI | soporte@neoptica.com |

## 5. Mejores Prácticas

1. **Seguridad de la Aplicación**
   - Validar y sanitizar todas las entradas
   - Implementar autenticación de dos factores para administradores
   - Mantener actualizadas las dependencias de seguridad

2. **Protección de Datos**
   - No registrar información sensible en los logs
   - Implementar encriptación en tránsito (HTTPS)
   - Aplicar políticas de retención de registros

3. **Monitoreo**
   - Alertar sobre patrones de acceso inusuales
   - Revisar regularmente los registros de auditoría
   - Realizar pruebas de penetración periódicas

## 6. Cumplimiento

Este documento cumple con los siguientes estándares y regulaciones:

- **Ley de Protección de Datos Personales**
- **OWASP Top 10**
- **GDPR** (para usuarios en la Unión Europea)

## 7. Historial de Cambios

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 2025-06-07 | 1.0.0 | Documentación inicial | Equipo de Desarrollo |
