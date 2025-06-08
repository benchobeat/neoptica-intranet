# Flujo de Gestión de Perfil de Administrador

## 1. Actualización de Perfil de Administrador

### 1.1. Diagrama de Flujo

```mermaid
flowchart TD
    A[Admin actualiza perfil] --> B[Validar rol de administrador]
    B -->|Admin| C[Validar datos de entrada]
    B -->|No Admin| D[Error 403]
    C -->|Válido| E[Actualizar perfil]
    C -->|Inválido| F[Mostrar errores de validación]
    E --> G[Registrar en auditoría]
    G --> H[Devolver perfil actualizado]
    
    I[Actualización email] --> J[Actualizar email directamente]
    J --> K[Registrar cambio en auditoría]
    
    %% Referencias a endpoints
    A -.->|Endpoint: PUT /api/usuarios/{id}| A
    I2[Cambio de contraseña] -.->|Endpoint: PUT /api/usuarios/{id}/password| I2
    
    %% Flujo de auditoría
    subgraph Auditoría
    G -->|Evento: PERFIL_ADMIN_ACTUALIZADO| GA[Registrar en log_auditoria]
    K -->|Evento: EMAIL_ADMIN_ACTUALIZADO| KA[Registrar en log_auditoria]
    end
```

### 1.2. Campos Actualizables

#### 1.2.1. Información Básica (Admin)
- Nombre completo
- Teléfono
- Foto de perfil (URL)
- Preferencias de notificación
- Configuración de roles (solo Super Admin)

#### 1.2.2. Seguridad
- Cambio de contraseña (sin requerir actual para admines)
- Configuración de autenticación de dos factores
- Gestión de sesiones activas
- Registro de actividades de administración

### 1.3. Validaciones

#### 1.3.1. Nombre
- Longitud: 3-100 caracteres
- Solo caracteres permitidos (a-z, A-Z, espacios, acentos)
- No solo espacios en blanco
- Validación de unicidad (opcional para administradores)

#### 1.3.2. Teléfono
- Formato internacional estándar
- Validación por país
- Campo obligatorio para administradores
- Formato: +[código país][número] (ej: +521234567890)

#### 1.3.3. Foto de Perfil
- URL válida (almacenamiento externo)
- Validación de dominio permitido
- Tamaño máximo: 2MB
- Procesamiento asíncrono

## 2. Gestión de Contraseñas de Administrador

### 2.1. Requisitos de Seguridad
- Contraseña actual NO requerida para administradores
- Nueva contraseña debe cumplir con políticas de seguridad
- No permitir contraseñas débiles o comprometidas
- Forzar cierre de sesión en todos los dispositivos
- Registro detallado en auditoría

### 2.2. Proceso de Cambio
1. Verificar permisos de administrador
2. Validar nueva contraseña contra políticas
3. Actualizar hash de contraseña
4. Invalidar TODOS los tokens de sesión existentes
5. Enviar notificación de cambio al correo registrado
6. Registrar evento de auditoría con IP y metadatos

### 2.3. Endpoints Relacionados
- `PUT /api/usuarios/{id}/password` - Actualizar contraseña de usuario (requiere rol admin)
- `POST /api/auditoria` - Registrar eventos de auditoría

## 3. Configuración de Administrador

### 3.1. Preferencias de Administración
- Idioma y región para reportes
- Preferencias de notificación
  - Alertas del sistema
  - Actividad de usuarios
  - Reportes programados
- Configuración de auditoría
  - Nivel de registro
  - Retención de logs

### 3.2. Seguridad y Acceso
- Lista de dispositivos autorizados
- Historial completo de inicios de sesión
- Alertas de actividad sospechosa
- Configuración de IPs permitidas
- Políticas de contraseñas

### 3.3. Endpoints de Configuración
- `GET /api/configuracion` - Obtener configuración actual
- `PUT /api/configuracion` - Actualizar configuración
- `GET /api/auditoria/accesos` - Ver historial de accesos

## 4. Notificaciones para Administradores

### 4.1. Notificación de Cambio de Contraseña
**Asunto**: [ADMIN] Contraseña de administrador actualizada

```
Estimado Administrador,

Se ha realizado un cambio en la contraseña de tu cuenta de administrador.

Detalles del cambio:
- Fecha y hora: [Fecha y hora]
- IP de origen: [IP]
- Navegador: [User-Agent]
- Ubicación: [Ciudad, País]

Si no reconoces esta actividad, contacta de inmediato al equipo de seguridad.

Este es un mensaje automático, por favor no responder.
```

### 4.2. Notificación de Acceso Sospechoso
**Asunto**: [SEGURIDAD] Actividad inusual detectada

```
Alerta de Seguridad:

Se ha detectado un inicio de sesión inusual en tu cuenta de administrador.

Detalles del acceso:
- Fecha y hora: [Fecha y hora]
- IP: [IP]
- Ubicación: [Ubicación]
- Dispositivo: [Dispositivo/Navegador]

Si reconoces esta actividad, puedes ignorar este mensaje.

¿No reconoces este acceso?
1. Cambia tu contraseña inmediatamente
2. Revisa la actividad reciente
3. Contacta al equipo de seguridad

Enlace directo: [Enlace seguro al panel de control]
```

## 5. Auditoría para Administradores

### 5.1. Eventos de Auditoría
- `PERFIL_ADMIN_ACTUALIZADO`: Cambios en perfil de administrador
- `PASSWORD_ADMIN_ACTUALIZADO`: Cambio de contraseña
- `ROLES_MODIFICADOS`: Cambios en asignación de roles
- `INTENTO_ACCESO_NO_AUTORIZADO`: Acceso denegado
- `CONFIGURACION_ACTUALIZADA`: Cambios en configuración
- `AUDITORIA_CONSULTADA`: Consulta de registros de auditoría

### 5.2. Medidas de Seguridad
- Autenticación de dos factores obligatoria
- Registro detallado de todas las acciones
- Alertas en tiempo real para actividades críticas
- Revisión periódica de registros de auditoría
- Políticas de retención de logs

### 5.3. Métricas Clave
- Actividad de administradores por hora/día/semana
- Tasa de intentos fallidos de autenticación
- Cambios en configuración del sistema
- Eventos de seguridad registrados
- Uso de la API de administración

## 6. Gestión de Sesiones

### 6.1. Control de Sesiones
- Lista de sesiones activas
- Capacidad de cerrar sesiones remotas
- Tiempos de expiración configurables
- Detección de dispositivos no reconocidos

### 6.2. Seguridad Avanzada
- Políticas de contraseñas para administradores
  - Longitud mínima: 16 caracteres
  - Requerir caracteres especiales
  - Rotación obligatoria cada 90 días
  - Historial de contraseñas (últimas 5)
- Autenticación de múltiples factores
  - Aplicación autenticadora
  - Claves de seguridad física
  - Códigos de respaldo seguros

### 6.3. Monitoreo en Tiempo Real
- Panel de control de seguridad
- Alertas configurables
- Reportes de actividad
- Análisis de patrones de acceso

## 7. Recuperación de Acceso

### 7.1. Proceso de Recuperación
1. Verificación de identidad en múltiples pasos
2. Aprobación de otro administrador
3. Generación de credenciales temporales
4. Forzar cambio de contraseña en primer acceso
5. Notificación a todos los administradores

### 7.2. Consideraciones de Seguridad
- Registro detallado de recuperaciones
- Límite de intentos
- Período de enfriamiento entre solicitudes
- Verificación de identidad adicional para operaciones sensibles

## 8. Integración con Sistemas Externos

### 8.1. Directorio Activo/LDAP
- Sincronización de cuentas
- Mapeo de grupos a roles
- Políticas de contraseñas unificadas

### 8.2. SIEM/Sistemas de Monitoreo
- Exportación de logs en formato estándar
- Webhooks para eventos críticos
- API para consultas de auditoría

### 8.3. Herramientas de Administración
- Scripts de automatización
- Herramientas de línea de comandos
- API para integraciones personalizadas
