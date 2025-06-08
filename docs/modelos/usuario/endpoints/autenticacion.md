# Autenticación

## Índice de Endpoints

### Autenticación Local (Todas ✅ Implementadas)
- `POST /api/auth/login` - ✅ Implementado - Iniciar sesión con email y contraseña

### Autenticación Social (Todas ✅ Implementadas)
- `GET /api/auth/google` - ✅ Implementado - Iniciar sesión con Google
- `GET /api/auth/facebook` - ✅ Implementado - Iniciar sesión con Facebook
- `GET /api/auth/instagram` - ✅ Implementado - Iniciar sesión con Instagram

### Recuperación de Contraseña (Todas ✅ Implementadas)
- `POST /api/auth/forgot-password` - ✅ Implementado - Solicitar recuperación de contraseña
- `POST /api/auth/reset-password` - ✅ Implementado - Restablecer contraseña con token

### Gestión de Sesiones (Todas ❌ Pendientes)
- `POST /api/auth/refresh-token` - ❌ Pendiente - Renovar token de autenticación
- `POST /api/auth/logout` - ❌ Pendiente - Cerrar sesión

### Verificación de Email (Todas ❌ Pendientes)
- `POST /api/auth/send-verification-email` - ❌ Pendiente - Enviar correo de verificación
- `GET /api/auth/verify-email/:token` - ❌ Pendiente - Verificar correo electrónico

---
# Autenticación Local

## 🔄 `POST /api/auth/login` - Iniciar Sesión

### Estado: ✅ Implementado

### Detalle de endpoint
Iniciar sesión en el sistema con email y contraseña.

**Controlador**: authController  
**Función**: login  
**Router**: /auth/login

**Autenticación**: No requerida

**Validaciones**:
- **Email**:
  - [x] Requerido
  - [x] Formato de email válido
- **Contraseña**:
  - [x] Requerida
  - [x] Mínimo 8 caracteres
  - [x] Máximo 72 caracteres (límite de bcrypt)
  - [x] Verificación con bcrypt
- **Usuario**:
  - [x] Debe existir un usuario con el email proporcionado
  - [x] La cuenta debe estar activa (activo = true)
  - [x] El usuario debe tener un password configurado

**Notas**:
- Genera un JWT con expiración de 7 días
- Incluye roles del usuario en el token
- Registra el inicio de sesión exitoso en auditoría

**Cuerpo de la solicitud**:
```json
{
  "email": "admin@neoptica.com",
  "password": "Admin1234!"
}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "uuid-usuario",
      "nombre_completo": "Administrador",
      "email": "admin@neoptica.com",
      "roles": ["admin"]
    }
  }
}
```



**Códigos de error**:
- 400: Email o password faltantes
- 401: Credenciales inválidas o usuario inactivo
- 403: Usuario deshabilitado o sin acceso
- 500: Error del servidor

**Ejemplo de error**:
```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario o `null` si falla autenticación |
| `accion` | `INICIO_SESION` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del intento (UTC) |
| `ip` | Dirección IP del cliente |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario o `null` si falla |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Motivo del fallo (si aplica) |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "INICIO_SESION",
  "entidad": "Usuario",
  "entidadId": "usuario-id-o-null",
  "usuarioId": "usuario-id-o-null",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "metodo_autenticacion": "email_password",
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "ubicacion_aproximada": {
      "pais": "Ecuador",
      "ciudad": "Quito",
      "region": "Pichincha"
    },
    "intentos_recientes": 1,
    "es_primera_vez": false
  },
  "resultado": {
    "estado": "exito",
    "fecha_hora": "2025-06-07T15:30:45.000Z",
    "codigo_estado": 200
  }
}
```

**Campos sensibles**:
- No se registran contraseñas en texto plano ni hasheadas
- El email se registra solo si la autenticación falla (para seguimiento de intentos)
- Se enmascara información sensible en los headers
- No se registra el token JWT generado

**Notas de seguridad**:
- Se registran tanto los intentos exitosos como fallidos
- Se incluye información de geolocalización basada en IP
- Se registra el dispositivo y navegador del usuario
- Se mantiene un contador de intentos recientes para detección de fuerza bruta
- Se indica si es la primera vez que el usuario inicia sesión
- Se registra la hora exacta del intento en formato ISO 8601
- Se incluye el código de estado HTTP resultante
- Se recomienda implementar bloqueo temporal tras múltiples intentos fallidos
- Se puede usar para detectar intentos de cambio de contraseña sospechosos
- Se recomienda notificar al usuario por correo electrónico del cambio

# Autenticación Social

## 🔄 `GET /api/auth/google` - Iniciar Sesión con Google

### Estado: ✅ Implementado

### Detalle de endpoint
Iniciar sesión en el sistema usando Google OAuth2.

**Controlador**: auth.ts (manejador de rutas)  
**Función**: Google OAuth2  
**Router**: /auth/google

**Autenticación**: No requerida

**Flujo**:
1. Cliente redirige al usuario a esta URL
2. Usuario se autentica con Google
3. Google redirige a `/api/auth/google/callback`
4. Se genera un JWT y se redirige al frontend con el token

**Parámetros de consulta**:
- `redirect_uri` (opcional): URL de redirección personalizada

**Respuesta exitosa (302 Redirect)**:
Redirige al frontend con el JWT en la URL:
`{FRONTEND_URL}/oauth-success?token=eyJhbGciOiJ...`

**Códigos de error**:
- 400: Error en los parámetros de la solicitud
- 401: Autenticación fallida con Google
- 500: Error del servidor

**Notas**:
- Crea automáticamente el usuario si no existe
- El token JWT tiene una validez de 7 días
- Incluye los roles del usuario en el token
- Registra el inicio de sesión en auditoría

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario (si existe) o `null` |
| `accion` | `INICIO_SESION_GOOGLE` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del intento (UTC) |
| `ip` | Dirección IP del cliente |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario (si existe) o `null` |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "INICIO_SESION_GOOGLE",
  "entidad": "Usuario",
  "entidadId": "usuario-id-o-null",
  "usuarioId": "usuario-id-o-null",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "proveedor": "google",
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "ubicacion_aproximada": {
      "pais": "Ecuador",
      "ciudad": "Quito",
      "region": "Pichincha"
    },
    "es_nuevo_usuario": false
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-07T15:50:30.000Z",
    "codigo_estado": 200
  }
}
```

**Campos sensibles**:
- No se registran tokens de acceso de terceros
- Solo se guarda el ID del proveedor (google)
- Se enmascara información sensible en los headers

**Notas de seguridad**:
- Se registran tanto los inicios de sesión exitosos como fallidos
- Se incluye información de geolocalización basada en IP
- Se registra si el usuario es nuevo en el sistema
- Se recomienda implementar límites de tasa para prevenir abuso

## 🔄 `GET /api/auth/facebook` - Iniciar Sesión con Facebook

### Estado: ✅ Implementado

### Detalle de endpoint
Iniciar sesión en el sistema usando Facebook OAuth2.

**Controlador**: auth.ts (manejador de rutas)  
**Función**: Facebook OAuth2  
**Router**: /auth/facebook

**Autenticación**: No requerida

**Flujo**:
1. Cliente redirige al usuario a esta URL
2. Usuario se autentica con Facebook
3. Facebook redirige a `/api/auth/facebook/callback`
4. Se genera un JWT y se redirige al frontend con el token

**Parámetros de consulta**:
- `redirect_uri` (opcional): URL de redirección personalizada
- `scope` (opcional): Permisos solicitados (por defecto: `email,public_profile`)

**Respuesta exitosa (302 Redirect)**:
Redirige al frontend con el JWT en la URL:
`{FRONTEND_URL}/oauth-success?token=eyJhbGciOiJ...`

**Códigos de error**:
- 400: Error en los parámetros de la solicitud
- 401: Autenticación fallida con Facebook
- 500: Error del servidor

**Notas**:
- Crea automáticamente el usuario si no existe
- El token JWT tiene una validez de 7 días
- Incluye los roles del usuario en el token
- Registra el inicio de sesión en auditoría

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario (si existe) o `null` |
| `accion` | `INICIO_SESION_FACEBOOK` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del intento (UTC) |
| `ip` | Dirección IP del cliente |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario (si existe) o `null` |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "INICIO_SESION_FACEBOOK",
  "entidad": "Usuario",
  "entidadId": "usuario-id-o-null",
  "usuarioId": "usuario-id-o-null",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "proveedor": "facebook",
    "dispositivo": {
      "tipo": "mobile",
      "navegador": "Safari",
      "sistema_operativo": "iOS 15"
    },
    "ubicacion_aproximada": {
      "pais": "Ecuador",
      "ciudad": "Quito",
      "region": "Pichincha"
    },
    "es_nuevo_usuario": true
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-07T15:51:45.000Z",
    "codigo_estado": 200
  }
}
```

**Campos sensibles**:
- No se registran tokens de acceso de Facebook
- Solo se guarda el ID del proveedor (facebook)
- Se enmascara información sensible en los headers

**Notas de seguridad**:
- Se registran tanto los inicios de sesión exitosos como fallidos
- Se incluye información de geolocalización basada en IP
- Se registra si el usuario es nuevo en el sistema
- Se recomienda implementar límites de tasa para prevenir abuso

## 🔄 `GET /api/auth/instagram` - Iniciar Sesión con Instagram

### Estado: ✅ Implementado

### Detalle de endpoint
Iniciar sesión en el sistema usando Instagram OAuth2.

**Controlador**: auth.ts (manejador de rutas)  
**Función**: Instagram OAuth2  
**Router**: /auth/instagram

**Autenticación**: No requerida

**Flujo**:
1. Cliente redirige al usuario a esta URL
2. Usuario se autentica con Instagram
3. Instagram redirige a `/api/auth/instagram/callback`
4. Se genera un JWT y se redirige al frontend con el token

**Parámetros de consulta**:
- `redirect_uri` (opcional): URL de redirección personalizada
- `scope` (opcional): Permisos solicitados (por defecto: `user_profile,user_media`)

**Respuesta exitosa (302 Redirect)**:
Redirige al frontend con el JWT en la URL:
`{FRONTEND_URL}/oauth-success?token=eyJhbGciOiJ...`

**Códigos de error**:
- 400: Error en los parámetros de la solicitud
- 401: Autenticación fallida con Instagram
- 500: Error del servidor

**Notas**:
- Crea automáticamente el usuario si no existe
- El token JWT tiene una validez de 7 días
- Incluye los roles del usuario en el token
- Registra el inicio de sesión en auditoría

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario (si existe) o `null` |
| `accion` | `INICIO_SESION_INSTAGRAM` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del intento (UTC) |
| `ip` | Dirección IP del cliente |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario (si existe) o `null` |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "INICIO_SESION_INSTAGRAM",
  "entidad": "Usuario",
  "entidadId": "usuario-id-o-null",
  "usuarioId": "usuario-id-o-null",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
  "metadatos": {
    "proveedor": "instagram",
    "dispositivo": {
      "tipo": "mobile",
      "navegador": "Safari",
      "sistema_operativo": "iOS 15"
    },
    "ubicacion_aproximada": {
      "pais": "Ecuador",
      "ciudad": "Quito",
      "region": "Pichincha"
    },
    "es_nuevo_usuario": false
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-07T15:53:20.000Z",
    "codigo_estado": 200
  }
}
```

**Campos sensibles**:
- No se registran tokens de acceso de Instagram
- Solo se guarda el ID del proveedor (instagram)
- Se enmascara información sensible en los headers

**Notas de seguridad**:
- Se registran tanto los inicios de sesión exitosos como fallidos
- Se incluye información de geolocalización basada en IP
- Se registra si el usuario es nuevo en el sistema
- Se recomienda implementar límites de tasa para prevenir abuso

**Nota**: Para todos los proveedores OAuth, el frontend debe manejar la redirección a `/oauth-success?token=...`

# Recuperación de Contraseña

## 🔄 `POST /api/auth/forgot-password` - Solicitar Recuperación de Contraseña

### Estado: ✅ Implementado

### Detalle de endpoint
Solicitar un correo electrónico con instrucciones para restablecer la contraseña.

**Controlador**: authController  
**Función**: forgotPassword  
**Router**: /auth/forgot-password

**Autenticación**: No requerida

**Validaciones**:
- **email**:
  - [x] Requerido
  - [x] Formato de email válido

**Cuerpo de la solicitud**:
```json
{
  "email": "usuario@example.com"
}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "status": "success",
  "message": "Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña."
}
```

**Validaciones**:
- **email**:
  - Requerido
  - Formato de email válido
- **Seguridad**:
  - No revela si el email existe en el sistema (siempre devuelve éxito)
  - Genera un token seguro de un solo uso
  - El token expira en 24 horas

**Códigos de error**:
- 400: Email no proporcionado
- 500: Error del servidor

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario (si existe) o `null` |
| `accion` | `SOLICITUD_RECUPERACION` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la solicitud (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario (si existe) o `null` |
| `modulo` | `seguridad` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "SOLICITUD_RECUPERACION",
  "entidad": "Usuario",
  "entidadId": "usuario-id-o-null",
  "usuarioId": "usuario-id-o-null",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "tipo_recuperacion": "email",
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "ubicacion_aproximada": {
      "pais": "Ecuador",
      "ciudad": "Quito",
      "region": "Pichincha"
    },
    "token_generado": true,
    "expiracion_token": "2025-06-08T15:50:30.000Z"
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-07T15:50:30.000Z",
    "codigo_estado": 200,
    "notificacion_enviada": true
  }
}
```

**Campos sensibles**:
- No se registra el token de recuperación generado
- Solo se indica si se generó un token exitosamente
- Se registra la fecha de expiración del token

**Notas de seguridad**:
- Se registra la solicitud incluso si el email no existe
- Se incluye información de geolocalización basada en IP
- Se recomienda monitorear intentos frecuentes para el mismo email
- Se debe implementar rate limiting para prevenir abuso

## 🔄 `POST /api/auth/reset-password` - Restablecer Contraseña

### Estado: ✅ Implementado

### Detalle de endpoint
Restablecer la contraseña con un token válido recibido por correo.

**Controlador**: authController  
**Función**: resetPassword  
**Router**: /auth/reset-password

**Autenticación**: No requerida

**Validaciones**:
- **token**:
  - [x] Requerido
  - [x] Debe ser un token válido y no expirado
- **email**:
  - [x] Requerido
  - [x] Formato de email válido
  - [x] Debe corresponder a un usuario existente
- **password**:
  - [x] Requerido
  - [x] Mínimo 8 caracteres
  - [x] Máximo 72 caracteres (límite de bcrypt)
  - [x] Debe contener al menos una mayúscula, una minúscula y un número

**Cuerpo de la solicitud**:
```json
{
  "token": "token-recibido-por-email",
  "email": "usuario@example.com",
  "password": "NuevaContraseña123!"
}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "status": "success",
  "message": "Contraseña restablecida correctamente"
}
```

**Validaciones**:
- **token**:
  - Requerido
  - Debe ser un token válido y no expirado
- **email**:
  - Requerido
  - Debe corresponder a un usuario existente
- **password**:
  - Requerido
  - Mínimo 8 caracteres
  - Debe contener al menos una mayúscula, una minúscula y un número
  - Se valida con la función `passwordFuerte`

**Seguridad**:
- Invalida todos los tokens de restablecimiento existentes para el usuario
- Actualiza la fecha de modificación de la contraseña
- Registra el evento en el log de auditoría

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario |
| `accion` | `RESTABLECIMIENTO_CONTRASENA` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del restablecimiento (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario |
| `modulo` | `seguridad` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "RESTABLECIMIENTO_CONTRASENA",
  "entidad": "Usuario",
  "entidadId": "usuario-id",
  "usuarioId": "usuario-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "metodo_recuperacion": "email",
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "ubicacion_aproximada": {
      "pais": "Ecuador",
      "ciudad": "Quito",
      "region": "Pichincha"
    },
    "fuerza_contrasena": "fuerte",
    "requiere_actualizacion": false,
    "tokens_invalidados": 1
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-07T16:20:15.000Z",
    "codigo_estado": 200,
    "notificacion_enviada": true
  }
}
```

**Campos sensibles**:
- No se registra la nueva contraseña
- No se almacena el token utilizado
- Solo se registra la fortaleza de la nueva contraseña

**Notas de seguridad**:
- Se registra tanto el éxito como el fallo del restablecimiento
- Se incluye información del dispositivo y ubicación
- Se registra si la nueva contraseña cumple con los requisitos de seguridad
- Se debe notificar al usuario por correo electrónico cuando se complete el restablecimiento
- Se recomienda registrar si la operación fue realizada desde un dispositivo conocido

**Códigos de error**:
- 400: Token, email o password faltantes
- 400: Token inválido o expirado
- 404: Usuario no encontrado
- 400: La contraseña no cumple con los requisitos de seguridad
- 500: Error del servidor

**Ejemplo de error**:
```json
{
  "status": "error",
  "message": "Token inválido o expirado"
}
```


# Gestión de Sesiones

## 🔄 `POST /api/auth/refresh-token` - Renovar Token de Acceso

### Estado: ❌ Pendiente

### Detalle de endpoint
Renueva el token de autenticación utilizando un refresh token válido.

**Controlador**: authController  
**Función**: refreshToken  
**Router**: /auth/refresh-token

**Autenticación**: Requerido (Refresh token en cookie)

**Validaciones**:
- [ ] Refresh token debe ser válido y no expirado
- [ ] Token debe estar en una cookie HTTP-only
- [ ] Usuario asociado debe existir y estar activo

**Headers requeridos**:
```
Cookie: refreshToken=<refresh-token>
```

**Respuesta exitosa (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "token": "nuevo-jwt-token",
    "usuario": {
      "id": "usuario-uuid",
      "nombre_completo": "Nombre Usuario",
      "email": "usuario@ejemplo.com",
      "roles": ["usuario"]
    }
  }
}
```

**Códigos de error**:
- 401: Token no proporcionado o inválido
- 403: Token expirado o revocado
- 404: Usuario no encontrado
- 500: Error del servidor

**Notas de seguridad**:
- El refresh token debe tener un tiempo de expiración (ej. 7 días)
- Después de usar un refresh token, se debe generar uno nuevo
- Los tokens comprometidos deben ser revocados

**Headers requeridos**:
- `Cookie`: Debe contener el refresh token como `refreshToken`

**Respuesta exitosa (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "token": "nuevo-jwt-token",
    "usuario": {
      "id": "usuario-uuid",
      "nombre_completo": "Nombre Usuario",
      "email": "usuario@ejemplo.com",
      "roles": ["usuario"]
    }
  }
}
```

**Validaciones**:
- El refresh token debe ser válido y no expirado
- El token debe estar en una cookie HTTP-only
- El usuario asociado al token debe existir y estar activo

**Seguridad**:
- El refresh token debe tener un tiempo de expiración (ej. 7 días)
- Después de usar un refresh token, se debe generar uno nuevo
- Los tokens comprometidos deben ser revocados

**Códigos de error**:
- 401: Token no proporcionado o inválido
- 403: Token expirado o revocado
- 404: Usuario no encontrado
- 500: Error del servidor

**Ejemplo de error**:
```json
{
  "status": "error",
  "message": "Token de refresco inválido o expirado"
}
```
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Respuesta exitosa (200 OK)**:
```json
{
  "status": "success",
  "message": "Sesión cerrada exitosamente"
}
```

**Notas de implementación**:
1. El cliente debe eliminar el token JWT almacenado localmente
2. Para mayor seguridad, se recomienda implementar una lista negra de tokens revocados
3. El token JWT seguirá siendo válido hasta su expiración a menos que se implemente un mecanismo de revocación

**Códigos de error**:
- 401: No autenticado o token inválido
- 500: Error del servidor

### Registro de Auditoría
**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que realiza la acción |
| `accion` | `REVOCACION_TOKENS` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la revocación (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario afectado |
| `modulo` | `seguridad` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "REVOCACION_TOKENS",
  "entidad": "Usuario",
  "entidadId": "usuario-afectado-id",
  "usuarioId": "usuario-que-revoca-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "ambito": "todos",
    "exclusiones": ["token-actual"],
    "razon": "rotacion_seguridad",
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    }
  },
  "resultado": {
    "estado": "exito",
    "fecha_revocacion": "2025-06-08T01:30:00.000Z",
    "tokens_revocados": 5,
    "sesiones_cerradas": 4,
    "detalle": {
      "por_tipo": {
        "access_token": 5,
        "refresh_token": 5
      },
      "por_dispositivo": [
        {
          "tipo": "mobile",
          "cantidad": 3
        },
        {
          "tipo": "desktop",
          "cantidad": 2
        }
      ]
    }
  }
}
```
**Campos sensibles**:
- Solo se registran hashes o IDs de tokens
- No se registran valores completos de tokens

**Notas de seguridad**:
- Solo administradores pueden revocar tokens de otros usuarios
- Los usuarios solo pueden revocar sus propios tokens
**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que cierra sesión |
| `accion` | `CIERRE_SESION` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del cierre de sesión (UTC) |
| `ip` | Dirección IP del cliente |
| `entidad_tipo` | `Sesion` |
| `entidad_id` | ID del token JWT (sin firmar) |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "CERRAR_SESION",
  "entidad": "Sesion",
  "entidadId": "jwt-id-sin-firmar",
  "usuarioId": "usuario-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "tipo_cierre": "manual",
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "duracion_sesion": "02:30:45"
  }
}
```

**Campos sensibles**:
- No se registra el token JWT completo, solo el ID
- No se almacenan credenciales de autenticación
- Se enmascara cualquier información sensible en los headers

**Notas de seguridad**:
- Se registra el cierre de sesión exitoso o fallido
- Se incluye la duración aproximada de la sesión
- Se registra la IP y dispositivo del usuario
- Se indica si el cierre fue manual o por expiración
- El token JWT se invalida en el cliente
- No se mantiene estado de sesión en el servidor
- Se recomienda implementar token blacklist para invalidación forzada


# Verificación de Email

## 🔄 `POST /api/auth/send-verification-email` - Enviar Correo de Verificación

### Estado: ❌ Pendiente

### Detalle de endpoint
Envía un correo electrónico con un enlace para verificar la dirección de correo electrónico del usuario.

**Controlador**: authController  
**Función**: sendVerificationEmail  
**Router**: /auth/send-verification-email

**Autenticación**: Requerido (JWT en header)

**Headers requeridos**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Respuesta exitosa (200 OK)**:
```json
{
  "status": "success",
  "message": "Correo de verificación enviado exitosamente"
}
```

**Códigos de error**:
- 400: El correo ya está verificado
- 401: No autenticado o token inválido
- 429: Demasiadas solicitudes (rate limiting)
- 500: Error al enviar el correo de verificación

**Notas**:
- El enlace de verificación expira en 24 horas
- Se debe implementar rate limiting para prevenir abuso
- Se recomienda un tiempo mínimo entre solicitudes (ej. 1 minuto)

### Registro de Auditoría
**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario autenticado |
| `accion` | `SOLICITUD_VERIFICACION_EMAIL` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la solicitud (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "SOLICITUD_VERIFICACION_EMAIL",
  "entidad": "Usuario",
  "entidadId": "usuario-id",
  "usuarioId": "usuario-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "email_solicitado": "usuario@ejemplo.com",
    "email_ya_verificado": false,
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "ubicacion_aproximada": {
      "pais": "Ecuador",
      "ciudad": "Quito",
      "region": "Pichincha"
    },
    "intentos_recientes": 1,
    "expiracion_token": "2025-06-09T15:30:00.000Z"
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-08T15:30:00.000Z",
    "codigo_estado": 200,
    "notificacion_enviada": true
  }
}
```

**Campos sensibles**:
- No se registra el token de verificación completo
- Solo se indica si el correo ya estaba verificado
- Se registra el hash del token, no su valor en texto plano

**Notas de seguridad**:
- Se registran todos los intentos, exitosos o fallidos
- Se incluye información de geolocalización basada en IP
- Se recomienda implementar rate limiting para prevenir abuso
- Se debe registrar si el correo ya estaba verificado

## 🔄 `GET /api/auth/verify-email/:token` - Verificar Correo Electrónico

### Estado: ❌ Pendiente

### Detalle de endpoint
Verifica la dirección de correo electrónico del usuario utilizando un token de verificación.

**Controlador**: authController  
**Función**: verifyEmail  
**Router**: /auth/verify-email/:token

**Autenticación**: No requerida

**Parámetros de ruta**:
- `token` (requerido): Token de verificación enviado por correo electrónico

**Respuesta exitosa (200 OK)**:
Redirige a la página de éxito en el frontend:
`{FRONTEND_URL}/email-verified`
  "message": "Email verificado correctamente"
}
```

**Códigos de error**:
- 400: Token inválido o expirado
- 404: Usuario no encontrado
- 500: Error del servidor

### Registro de Auditoría
**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario (si se puede determinar) o `null` |
| `accion` | `VERIFICACION_EMAIL` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la verificación (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario o `null` si no se puede determinar |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "VERIFICACION_EMAIL",
  "entidad": "Usuario",
  "entidadId": "usuario-id-o-null",
  "usuarioId": "usuario-id-o-null",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "token_valido": true,
    "token_expirado": false,
    "dispositivo": {
      "tipo": "mobile",
      "navegador": "Safari",
      "sistema_operativo": "iOS 15"
    },
    "ubicacion_aproximada": {
      "pais": "Ecuador",
      "ciudad": "Quito",
      "region": "Pichincha"
    },
    "tiempo_desde_solicitud": "00:15:30",
    "intentos_previos": 0
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-08T15:45:30.000Z",
    "codigo_estado": 200,
    "detalle": "Email verificado exitosamente"
  }
}
```

**Campos sensibles**:
- No se registra el token de verificación
- Solo se indica si el token fue válido/expirado
- No se registra información sensible del usuario en caso de error

**Notas de seguridad**:
- Se registran tanto las verificaciones exitosas como fallidas
- Se incluye información del dispositivo y ubicación
- Se registra el tiempo transcurrido desde la solicitud
- Se debe registrar si el token fue usado previamente
- Se recomienda invalidar el token después de su uso exitoso

- **telefono**:
  - Opcional
  - Formato: exactamente 10 dígitos numéricos si se proporciona
- **direccion**:
  - Opcional
  - Máximo 255 caracteres
- **dni**:
  - Opcional
  - Máximo 20 caracteres
  - Solo se puede actualizar si actualmente es null
- **roles**:
  - Solo puede ser modificado por administradores
  - Debe ser un array de strings
  - Valores permitidos: 'admin', 'vendedor', 'optometrista', 'cliente'
  - Al menos un rol debe ser proporcionado si se envía este campo

**Códigos de error**:
- 400: Datos de entrada inválidos
- 401: No autenticado
- 403: No autorizado para actualizar este usuario
- 404: Usuario no encontrado
- 409: Intento de modificar DNI existente o email
- 500: Error del servidor
