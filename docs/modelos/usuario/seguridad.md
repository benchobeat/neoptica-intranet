# Seguridad y Permisos - Usuario

## Roles del Sistema

### Administrador
- **Acceso completo** a todas las funcionalidades del sistema
- **Puede** crear, leer, actualizar y desactivar cualquier usuario
- **Puede** asignar y modificar roles
- **Puede** restablecer contraseñas sin restricciones
- **Acceso** a todos los informes y auditorías

### Vendedor
- **Puede** crear nuevos usuarios con rol 'cliente'
- **Puede** ver y editar información básica de clientes
- **Puede** modificar su propio perfil
- **No puede** modificar roles de otros usuarios
- **No puede** desactivar cuentas
- **Acceso limitado** a información sensible

### Optometrista
- **Puede** ver información de pacientes asignados
- **Puede** actualizar su propio perfil
- **No puede** crear ni modificar usuarios
- **Acceso** limitado a módulos clínicos

### Cliente
- **Puede** ver y actualizar su propio perfil
- **Puede** cambiar su contraseña
- **Requiere** verificación de email para cambios críticos
- **Acceso** solo a sus propios datos

## Políticas de Seguridad

### Contraseñas

#### 2.1. Validaciones de Contraseña
- **Longitud mínima**: 12 caracteres
- **Complejidad requerida**: 
  - Al menos una letra mayúscula
  - Al menos una letra minúscula
  - Al menos un número
  - Al menos un carácter especial (ej: !@#$%^&*)
- **Vigencia**: 90 días
- **Historial**: No se pueden reutilizar las últimas 5 contraseñas
- **Validación de fortaleza**:
  - Uso de la biblioteca `zxcvbn` con puntuación mínima de 3
  - No permitir contraseñas comunes o comprometidas
  - Rechazar patrones comunes (secuencias, repeticiones, etc.)
- **Recuperación**: 
  - Token de un solo uso con expiración de 1 hora
  - No permite el uso de contraseñas recientemente utilizadas

#### 2.2. Consideraciones de Seguridad para Recuperación
- **Tokens de recuperación**:
  - Invalidación inmediata después de su uso
  - Caducidad de 1 hora desde su generación
  - Un solo uso por token
- **Protección contra ataques**:
  - Rate limiting por IP (máx. 5 intentos por hora)
  - Límite de intentos de envío de formulario (3 intentos)
  - No revelar información sobre la validez del token en la URL
- **Gestión de sesiones**:
  - Forzar cierre de sesión en todos los dispositivos tras cambio de contraseña
  - Invalidar todos los tokens de acceso y refresco existentes
  - Notificar al usuario sobre el cambio de contraseña
- **Auditoría**:
  - Registrar todos los intentos de recuperación (exitosos y fallidos)
  - Almacenar hash del token utilizado (no el token en claro)
  - Registrar dirección IP y User-Agent de cada solicitud

### Tokens de Acceso
- **Duración**: 8 horas de validez
- **Renovación**: Mediante refresh token
- **Invalidez**: Al cerrar sesión explícitamente
- **Almacenamiento seguro**: Solo en memoria del cliente (no localStorage)

### Sesiones
- **Tiempo de inactividad**: 30 minutos
- **Máximo de dispositivos concurrentes**: 3
- **Notificaciones** en inicio de sesión desde:
  - Nuevos dispositivos
  - Ubicaciones inusuales
  - Horarios atípicos

### Rate Limiting
- **Límites por IP**:
  - 5 intentos de inicio de sesión por minuto
  - 100 peticiones por minuto por endpoint
- **Bloqueo temporal**:
  - Después de 5 intentos fallidos
  - Duración: 15 minutos
  - Se registra en auditoría
- **Desbloqueo**:
  - Automático después del tiempo de bloqueo
  - Inmediato por administrador

### Auditoría
Se registran las siguientes acciones:
- Inicios de sesión (éxito/fallo)
- Cambios de contraseña
- Modificaciones de perfil
- Cambios de estado de cuenta
- Asignación/remoción de roles

## Flujos de Autenticación

### Inicio de Sesión Estándar
1. Validación de credenciales
2. Verificación de estado de cuenta
3. Generación de token JWT
4. Registro de auditoría

### Recuperación de Contraseña
1. Solicitud con email
2. Generación de token seguro
3. Envío de enlace con token (1h de validez)
4. Establecimiento de nueva contraseña
5. Invalidación del token

### Autenticación OAuth
1. Redirección a proveedor
2. Validación de credenciales
3. Creación/actualización de usuario local
4. Generación de sesión

## Consideraciones de Privacidad

### Datos Personales
- Encriptación en tránsito (HTTPS)
- Almacenamiento seguro de contraseñas (bcrypt)
- Acceso restringido según roles

### Auditoría
- Registro de todas las acciones sensibles
- Trazabilidad completa de cambios
- Exportación de datos personales bajo solicitud

### Cumplimiento
- RGPD (para usuarios europeos)
- Ley de Protección de Datos locales
- Políticas internas de privacidad
