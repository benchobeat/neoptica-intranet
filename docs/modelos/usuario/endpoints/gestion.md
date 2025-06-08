# Índice de Endpoints

## Administración de Usuarios (Admin)
- `GET /api/usuarios/paginados` - Listado paginado de usuarios con búsqueda
- `GET /api/usuarios` - Lista todos los usuarios (sin paginación)
- `GET /api/usuarios/:id` - Consultar usuario por ID
- `POST /api/usuarios` - Crear nuevo usuario (solo admin)
- `PUT /api/usuarios/:id` - Actualizar usuario existente
- `DELETE /api/usuarios/:id` - Eliminar usuario (borrado lógico)
- `POST /api/usuarios/:id/reset-password` - Restablecer contraseña de usuario (admin)

## Gestión de Perfil de Usuario
- `GET /api/usuarios/me` - Obtener perfil del usuario autenticado
- `PUT /api/usuarios/me` - Actualizar perfil del usuario autenticado
- `POST /api/usuarios/me/cambiar-password` - Cambiar contraseña del usuario autenticado

## Autoregistro
- `POST /api/usuarios/me/autoregistro` - Registro autónomo de usuario (público)

---

# Endpoints de Gestión de Usuarios

## GET /api/usuarios/paginados (Listado de Usuarios paginado)

### Detalle de endpoint
Lista todos los usuarios con paginación y búsqueda.

**Controlador**: usuarioController
**Función**: listarUsuariosPaginados
**Router**: /usuarios/paginados

**Autenticación**: Requerida (Rol: admin)

**Parámetros de consulta**:
- `page` (opcional, number): Número de página (por defecto: 1)
- `pageSize` (opcional, number): Tamaño de página (por defecto: 10)
- `searchText` (opcional, string): Texto para búsqueda en nombre (case insensitive)
- `activo` (opcional, boolean): Filtrar por estado activo/inactivo

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "usuario-uuid",
        "nombre_completo": "Nombre Usuario",
        "email": "usuario@ejemplo.com",
        "telefono": "0999999999",
        "activo": true,
        "roles": ["admin", "vendedor"]
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  },
  "error": null
}
```

**Validaciones**:
- `page` y `pageSize` deben ser números enteros positivos
- `searchText` se aplica como búsqueda parcial en `nombre_completo` (case insensitive)
- `activo` debe ser un booleano si se proporciona

**Códigos de error**:
- 401: No autenticado
- 403: No autorizado (se requiere rol admin)
- 500: Error del servidor

### Registro de Auditoría
**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del administrador que realiza la consulta |
| `accion` | `CONSULTA_USUARIOS` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la consulta (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | `null` (consulta múltiple) |
| `modulo` | `usuarios` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "CONSULTA",
  "entidad": "Usuario",
  "filtros": {
    "pagina": 1,
    "tamano_pagina": 10,
    "texto_busqueda": "texto",
    "activo": true
  },
  "total_registros": 42,
  "usuarioId": "admin-user-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    }
  }
}
```

**Campos sensibles**:
- No se registran datos sensibles en consultas de listado
- Se registra solo el conteo total de registros, no los datos completos

**Notas de seguridad**:
- Solo usuarios con rol 'admin' pueden listar usuarios
- Se registra la IP y dispositivo del administrador
- Se limita el número máximo de resultados por página
- Los filtros de búsqueda se registran para auditoría
- No se registra el contenido de la lista de usuarios, solo metadatos de la consulta




## GET /api/usuarios/ (Obtener lista de usuarios)

### Detalle de endpoint
Obtiene la lista de todos los usuarios.

**Controlador**: usuarioController
**Función**: listarUsuarios
**Router**: /usuarios

**Autenticación**: Requerida (Rol: admin, vendedor, optometrista)

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": [
    {
      "id": "usuario-uuid",
      "nombre_completo": "Nombre Usuario",
      "email": "usuario@ejemplo.com",
      "telefono": "0999999999",
      "activo": true,
      "roles": ["vendedor", "optometrista"]
    }
  ],
  "error": null
}
```

**Validaciones**:
- El usuario debe tener el rol 'admin'

**Códigos de error**:
- 401: No autenticado
- 403: No autorizado (se requiere rol admin)
- 500: Error del servidor

### Registro de Auditoría 
**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que realiza la consulta |
| `accion` | `CONSULTA_USUARIOS` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la consulta (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | `null` (consulta múltiple) |
| `modulo` | `usuarios` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "CONSULTA",
  "entidad": "Usuario",
  "filtros": {
    "pagina": 1,
    "tamano_pagina": 10,
    "texto_busqueda": "texto",
    "activo": true
  },
  "total_registros": 42,
  "usuarioId": "admin-user-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    }
  }
}
```

**Campos sensibles**:
- No se registran datos sensibles en consultas de listado
- Se registra solo el conteo total de registros, no los datos completos

**Notas de seguridad**:
- Solo usuarios con rol 'admin' pueden listar usuarios
- Se registra la IP y dispositivo del administrador
- Se limita el número máximo de resultados por página
- Los filtros de búsqueda se registran para auditoría
- No se registra el contenido de la lista de usuarios, solo metadatos de la consulta

## GET /api/usuarios/:id (Consulta de usuario por ID)

### Detalle de endpoint
Obtiene un usuario por su ID.

**Controlador**: usuarioController
**Función**: obtenerUsuario
**Router**: /usuarios/:id

**Autenticación**: Requerida (Rol: admin, vendedor, optometrista)

**Parámetros de ruta**:
- `id` (string): ID del usuario a consultar (UUID)

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "id": "usuario-uuid",
    "nombre_completo": "Nombre Usuario",
    "email": "usuario@ejemplo.com",
    "telefono": "0999999999",
    "activo": true,
    "direccion": "Av. Siempre Viva 123",
    "dni": "12345678",
    "roles": ["vendedor", "optometrista"]
  },
  "error": null
}
```

**Validaciones**:
- El `id` debe ser un UUID válido
- El usuario debe existir en la base de datos
- Solo el propio usuario o un administrador pueden ver los detalles completos

**Códigos de error**:
- 400: ID no proporcionado o inválido
- 401: No autenticado
- 403: No autorizado para ver este usuario
- 404: Usuario no encontrado
- 500: Error del servidor

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que realiza la consulta |
| `accion` | `CONSULTA_USUARIO` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la consulta (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario consultado |
| `modulo` | `usuarios` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "CONSULTA",
  "entidad": "Usuario",
  "entidad_id": "usuario-consultado-id",
  "usuarioId": "usuario-consultor-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "acceso_autorizado": true,
    "es_propio": false
  }
}
```

**Campos sensibles**:
- No se registran datos sensibles del usuario consultado
- Se registra solo el ID del usuario consultado, no sus datos completos
- Se indica si el acceso fue autorizado y si el usuario consulta su propio perfil

**Notas de seguridad**:
- Se registra tanto el ID del usuario que realiza la consulta como el consultado
- Se verifica que el usuario tenga permisos para ver el perfil solicitado
- Se registra si el acceso fue autorizado o denegado
- Se incluye información del dispositivo para análisis de seguridad
- Solo se registra el acceso exitoso, no los datos sensibles del usuario consultado

## POST /api/usuarios (Creación de usuario solo admin) 

### Detalle de endpoint
Crea un nuevo usuario (solo administrador).

**Controlador**: usuarioController
**Función**: crearUsuario
**Router**: /usuarios

**Autenticación**: Requerida (Rol: admin)

**Cuerpo de la solicitud**:
```json
{
  "nombre_completo": "Nuevo Usuario",
  "email": "nuevo@ejemplo.com",
  "password": "Contraseña123!",
  "telefono": "0999999999",
  "direccion": "Av. Siempre Viva 123",
  "dni": "12345678",
  "roles": ["vendedor", "optometrista"]
}
```

**Respuesta exitosa (201 Created)**:
```json
{
  "ok": true,
  "data": {
    "id": "nuevo-usuario-uuid",
    "nombre_completo": "Nuevo Usuario",
    "email": "nuevo@ejemplo.com",
    "telefono": "0999999999",
    "activo": true,
    "direccion": "Av. Siempre Viva 123",
    "dni": "12345678",
    "roles": ["vendedor", "optometrista"]
  },
  "error": null
}
```

**Validaciones**:
- **nombre_completo**:
  - Requerido
  - Mínimo 3 caracteres, máximo 100 caracteres
  - Solo letras, espacios y caracteres especiales básicos (.,-)
- **email**:
  - Requerido
  - Formato de email válido (`usuario@dominio.com`)
  - Debe ser único en el sistema
- **password**:
  - Requerido
  - Mínimo 8 caracteres
  - Debe contener al menos una mayúscula, una minúscula y un número
  - No puede ser una contraseña común o comprometida
- **telefono**:
  - Opcional
  - Formato: exactamente 10 dígitos numéricos
- **direccion**:
  - Opcional
  - Máximo 255 caracteres
- **dni**:
  - Opcional
  - Máximo 20 caracteres
- **roles**:
  - Debe ser un array de strings
  - Valores permitidos: 'admin', 'vendedor', 'optometrista', 'cliente'
  - Al menos un rol debe ser proporcionado

**Códigos de error**:
- 400: Datos de entrada inválidos o faltantes
- 401: No autenticado
- 403: No autorizado (se requiere rol admin)
- 409: El correo electrónico ya está registrado
- 500: Error del servidor

### Registro de auditoria

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del administrador que crea el usuario |
| `accion` | `CREACION_USUARIO` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de creación (UTC) |
| `ip` | Dirección IP del administrador |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del nuevo usuario |
| `modulo` | `usuarios` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "CREAR",
  "entidad": "Usuario",
  "entidadId": "nuevo-usuario-id",
  "usuarioId": "admin-user-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "nuevosDatos": {
    "nombre_completo": "Nuevo Usuario",
    "email": "nuevo@ejemplo.com",
    "roles": ["usuario"],
    "activo": true
  },
  "metadatos": {
    "metodo_creacion": "admin",
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    }
  }
}
```

**Campos sensibles**:
- `password`: No se registra
- `email`: Se registra completo
- Cualquier token de verificación: Se enmascara

**Notas de seguridad**:
- Solo usuarios con rol 'admin' pueden crear usuarios
- Se registra la IP y dispositivo del administrador
- Se valida que el email no esté en uso
- Se generan tokens de verificación si es necesario

## PUT /api/usuarios/:id (Actualización de usuario)

### Detalle de endpoint
Actualiza un usuario existente. Solo el administrador puede actualizar cualquier usuario, los usuarios solo pueden actualizar su propio perfil.

**Controlador**: usuarioController
**Función**: actualizarUsuario
**Router**: /usuarios/:id

**Autenticación**: Requerida (Rol: admin)

**Parámetros de ruta**:
- `id` (string): ID del usuario a actualizar (UUID)

**Cuerpo de la solicitud**:
```json
{
  "nombre_completo": "Nombre Actualizado",
  "telefono": "0999999999",
  "direccion": "Nueva Dirección 456",
  "dni": "87654321",
  "activo": true,
  "roles": ["vendedor", "optometrista"]
}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "id": "usuario-uuid",
    "nombre_completo": "Nombre Actualizado",
    "email": "usuario@ejemplo.com",
    "telefono": "0999999999",
    "direccion": "Nueva Dirección 456",
    "dni": "87654321",
    "activo": true,
    "roles": ["vendedor", "optometrista"]
  },
  "error": null
}
```

**Validaciones**:
- **Solo administradores** pueden actualizar el campo `activo` y `roles`
- **Usuarios no administradores** solo pueden actualizar su propio perfil
- **No se puede modificar** el email después de creado el usuario

### Registro de auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que realiza la actualización |
| `accion` | `ACTUALIZACION_USUARIO` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la actualización (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario actualizado |
| `modulo` | `usuarios` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "ACTUALIZAR",
  "entidad": "Usuario",
  "entidadId": "usuario-actualizado-id",
  "usuarioId": "usuario-actualizador-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "datosAnteriores": {
    "nombre_completo": "Nombre Anterior",
    "roles": ["rol_anterior"],
    "activo": false
  },
  "nuevosDatos": {
    "nombre_completo": "Nombre Actualizado",
    "roles": ["vendedor", "optometrista"],
    "activo": true
  },
  "metadatos": {
    "es_autoperfil": false,
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "campos_modificados": ["nombre_completo", "roles", "activo"]
  }
}
```

**Campos sensibles**:
- `password`: No se registra
- `email`: No se registra (solo se indica si fue modificado)
- Campos de verificación: Se enmascaran
- Se registran solo los campos modificados

**Notas de seguridad**:
- Se registra si el usuario está actualizando su propio perfil o el de otro usuario
- Se validan los permisos antes de permitir la actualización
- Se registra la IP y dispositivo del usuario que realiza la actualización
- Se mantiene un histórico de cambios para auditoría
- Se registran tanto los datos anteriores como los nuevos para trazabilidad
- Se incluye lista de campos modificados para facilitar el análisis de cambios
- Se registra si la operación fue exitosa o fallida

## DELETE /api/usuarios/:id (Eliminación de Usuario)

### Detalle de endpoint
Realiza un borrado lógico de un usuario, marcándolo como inactivo. Solo los administradores pueden realizar esta acción.

**Controlador**: usuarioController
**Función**: eliminarUsuario
**Router**: /usuarios/:id

**Autenticación**: Requerida (Rol: admin)

**Parámetros de ruta**:
- `id` (string): ID del usuario a eliminar (UUID)

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "id": "usuario-uuid",
    "mensaje": "Usuario desactivado correctamente"
  },
  "error": null
}
```

**Validaciones**:
- El usuario debe existir en la base de datos
- No se puede eliminar a sí mismo
- No se pueden eliminar usuarios del sistema (is_system = true)
- Solo los administradores pueden realizar esta acción

**Códigos de error**:
- 400: ID no proporcionado o inválido
- 401: No autenticado
- 403: No autorizado (se requiere rol admin)
- 404: Usuario no encontrado
- 403: No se puede eliminar a sí mismo
- 403: No se pueden eliminar usuarios del sistema
- 500: Error del servidor

### Registro de auditoría
**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que realiza la acción |
| `accion` | `ELIMINACION_USUARIO` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de eliminación (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario eliminado |
| `modulo` | `usuarios` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "ELIMINAR",
  "entidad": "Usuario",
  "entidadId": "usuario-eliminado-id",
  "usuarioId": "usuario-que-elimina-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "datosAnteriores": {
    "nombre_completo": "Usuario Eliminado",
    "email": "eliminado@ejemplo.com",
    "roles": ["usuario"],
    "activo": true
  },
  "metadatos": {
    "tipo_eliminacion": "blanda",
    "razon": "solicitud_usuario",
    "comentario": "Usuario solicitó la eliminación de su cuenta",
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    }
  },
  "resultado": {
    "estado": "exito",
    "fecha_eliminacion": "2025-06-08T00:15:00.000Z",
    "sesiones_cerradas": 3,
    "tokens_revocados": 2
  }
}
```

**Campos sensibles**:
- Se registran solo datos básicos del usuario eliminado
- No se registra información sensible

**Notas de seguridad**:
- Eliminación lógica (soft delete) por defecto
- Solo administradores pueden eliminar usuarios permanentemente
- Se revocan todos los tokens activos
- Se cierran todas las sesiones activas
- Se mantiene registro de quién realizó la acción

## POST /api/usuarios/:id/reset-password (Restablecimiento de contraseña solo admin)

### Detalle de endpoint
Restablece la contraseña de un usuario sin necesidad de conocer la contraseña actual. Solo disponible para administradores.

**Controlador**: usuarioController
**Función**: resetPasswordAdmin
**Router**: /usuarios/:id/reset-password

**Autenticación**: Requerida (Rol: admin)

**Parámetros de ruta**:
- `id` (string): ID del usuario (UUID)

**Cuerpo de la solicitud**:
```json
{
  "nueva": "NuevaContraseña123!"
}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "mensaje": "Contraseña restablecida correctamente"
  },
  "error": null
}
```

**Validaciones**:
- **nueva**:
  - Requerido
  - Mínimo 8 caracteres
  - Debe contener al menos una mayúscula, una minúscula y un número
  - No puede ser una contraseña común o comprometida
- El usuario debe existir en la base de datos
- Solo los administradores pueden realizar esta acción

**Seguridad**:
- La contraseña se almacena con hash bcrypt
- Se registra el cambio en el log de auditoría
- Se cierran todas las sesiones activas del usuario
- Se notifica al usuario por correo electrónico sobre el cambio de contraseña

**Códigos de error**:
- 400: Datos de entrada inválidos o faltantes
- 401: No autenticado
- 403: No autorizado (se requiere rol admin)
- 404: Usuario no encontrado
- 500: Error del servidor

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del administrador que realiza el cambio |
| `accion` | `ADMIN_RESET_CONTRASENA` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del cambio (UTC) |
| `ip` | Dirección IP del administrador |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario afectado |
| `modulo` | `seguridad` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "ADMIN_RESET_CONTRASENA",
  "entidad": "Usuario",
  "entidadId": "usuario-afectado-id",
  "usuarioId": "admin-user-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
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
    "sesiones_cerradas": true,
    "notificacion_enviada": true
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-08T10:18:28.000Z",
    "codigo_estado": 200
  }
}
```

**Campos sensibles**:
- No se registra la nueva contraseña
- No se almacena el hash de la contraseña
- Solo se registra la fortaleza de la nueva contraseña
- Se registra el ID del administrador que realizó el cambio

**Notas de seguridad**:
- Se registra tanto el éxito como el fallo del restablecimiento
- Se incluye información del dispositivo y ubicación del administrador
- Se registra si la nueva contraseña cumple con los requisitos de seguridad
- Se registra si se cerraron las sesiones activas del usuario
- Se registra si se envió la notificación al usuario
- Se puede usar para auditar cambios de contraseña realizados por administradores
- Se recomienda notificar al usuario por correo electrónico sobre el cambio de contraseña
- Se debe incluir la dirección IP desde donde se realizó el cambio
- Se registra el ID del usuario afectado para trazabilidad

## POST /api/usuarios/me/autoregistro (Registro autónomo de usuario)

### Detalle de endpoint
Permite a un nuevo usuario registrarse en el sistema. Este endpoint es de acceso público y no requiere autenticación.

**Controlador**: autoregistroController
**Función**: autoregistroCliente
**Router**: /usuarios/me/autoregistro

**Autenticación**: No requerida

**Cuerpo de la solicitud**:
```json
{
  "nombre_completo": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "ContraseñaSegura123!",
  "telefono": "0999999999",
  "direccion": "Calle Falsa 123",
  "dni": "12345678"
}
```

**Respuesta exitosa (201 Created)**:
```json
{
  "ok": true,
  "data": {
    "id": "usuario-uuid",
    "email": "juan@ejemplo.com",
    "nombre_completo": "Juan Pérez",
    "estado": "pendiente_verificacion",
    "mensaje": "Usuario registrado exitosamente. Por favor verifica tu correo electrónico."
  },
  "error": null
}
```

**Validaciones**:
- **nombre_completo**:
  - Requerido
  - Mínimo 3 caracteres, máximo 100 caracteres
  - Solo letras, espacios y caracteres especiales básicos (.,-)
- **email**:
  - Requerido
  - Formato de email válido (`usuario@dominio.com`)
  - Mínimo 5 caracteres, máximo 255 caracteres
  - No puede estar registrado previamente
- **password**:
  - Requerido
  - Mínimo 8 caracteres
  - Debe contener al menos una mayúscula, una minúscula y un número
  - No puede ser una contraseña común o comprometida
- **telefono**:
  - Opcional
  - Formato: exactamente 10 dígitos numéricos
- **direccion**:
  - Opcional
  - Máximo 255 caracteres
- **dni**:
  - Opcional
  - Máximo 20 caracteres

**Notas de seguridad**:
- La contraseña se almacena con hash bcrypt
- Se genera un token de verificación de email con expiración de 24 horas
- Se envía un correo de verificación con un enlace seguro
- Se registra el evento en el log de auditoría
- No se revela si un correo ya está registrado (para evitar enumeración de usuarios)

**Códigos de error**:
- 400: Datos de entrada inválidos o faltantes
- 409: El correo electrónico ya está registrado
- 422: Validación de datos fallida
- 500: Error del servidor

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | `null` (no autenticado) o ID del usuario si está autenticado |
| `accion` | `REGISTRO_USUARIO` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del registro (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del nuevo usuario |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "REGISTRO_USUARIO",
  "entidad": "Usuario",
  "entidadId": "nuevo-usuario-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "nuevosDatos": {
    "nombre_completo": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "estado": "pendiente_verificacion"
  },
  "metadatos": {
    "metodo_registro": "autoregistro",
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
    "verificacion_email": {
      "requerida": true,
      "token_generado": true,
      "fecha_expiracion": "2025-06-09T05:22:57.000Z"
    }
  }
}
```

**Campos sensibles**:
- `password`: No se registra en ningún momento
- `email`: Se registra completo para seguimiento
- `token_verificacion`: Solo se registra si se generó, nunca el valor completo

**Notas de seguridad**:
- Se registra el intento de registro independientemente del resultado
- Se incluye información del dispositivo y ubicación aproximada
- Se registra si se generó el token de verificación de email
- No se revela si un correo ya está registrado en los logs de error
- Se recomienda implementar rate limiting para prevenir abuso de registro
- Los datos personales se registran de forma mínima necesaria
- Se debe registrar la dirección IP para seguimiento de seguridad
- Se recomienda monitorear patrones de registro sospechosos

**Ejemplo de error**:
```json
{
  "ok": false,
  "data": null,
  "error": "El correo electrónico ya está registrado",
  "codigo": "EMAIL_ALREADY_EXISTS"
}
```

## GET /api/usuarios/me (Obtener perfil del usuario autenticado)

### Detalle de endpoint
Obtiene el perfil del usuario autenticado actualmente. Este endpoint devuelve la información completa del perfil del usuario basado en el token JWT proporcionado.

**Controlador**: usuarioController
**Función**: obtenerUsuarioAutenticado
**Router**: /usuarios/me

**Autenticación**: Requerida (JWT en el header de autorización)

**Headers requeridos**:
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "id": "usuario-uuid",
    "nombre_completo": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "0999999999",
    "direccion": "Calle Falsa 123",
    "dni": "12345678",
    "activo": true,
    "roles": ["vendedor", "optometrista"],
    "fecha_creacion": "2023-01-01T00:00:00.000Z",
    "ultimo_inicio_sesion": "2023-06-07T12:00:00.000Z"
  },
  "error": null
}
```

**Validaciones**:
- **Autenticación**:
  - Requiere token JWT válido en el header `Authorization`
  - El token debe estar firmado correctamente y no expirado
  - El usuario asociado al token debe existir y estar activo
- **Seguridad**:
  - Solo se devuelve la información del usuario autenticado
  - Los campos sensibles (como contraseñas) nunca se incluyen en la respuesta
  - Se registra el acceso en el log de auditoría
  - El token debe tener una firma válida y no estar en la lista de revocados

**Campos de respuesta**:
- **id**: Identificador único del usuario (UUID)
- **nombre_completo**: Nombre completo del usuario
- **email**: Correo electrónico (único por usuario)
- **telefono**: Número de teléfono (formato: 10 dígitos)
- **direccion**: Dirección física (opcional)
- **dni**: Número de documento (opcional)
- **activo**: Indica si la cuenta está activa
- **roles**: Array con los roles del usuario
- **fecha_creacion**: Fecha y hora de creación de la cuenta (ISO 8601)
- **ultimo_inicio_sesion**: Último inicio de sesión exitoso (ISO 8601)

**Códigos de error**:
- 401: No autenticado o token inválido
- 403: Token expirado o revocado
- 404: Usuario no encontrado
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

**Notas**:
- Este endpoint es de solo lectura
- La información devuelta varía según los permisos del usuario
- Los usuarios solo pueden ver su propio perfil a través de este endpoint

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario autenticado |
| `accion` | `CONSULTA_PERFIL_PROPIO` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la consulta (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario autenticado |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "CONSULTA_PERFIL_PROPIO",
  "entidad": "Usuario",
  "entidad_id": "usuario-autenticado-id",
  "usuarioId": "usuario-autenticado-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "ubicacion_aproximada": {
      "pais": "Ecuador",
      "ciudad": "Quito"
    },
    "hora_acceso": "2025-06-08T08:42:00.000Z",
    "campos_solicitados": ["id", "nombre_completo", "email", "roles"],
    "es_consulta_propia": true
  }
}
```

**Campos sensibles**:
- No se registran datos sensibles como contraseñas o tokens
- Solo se registra el ID del usuario, no su información completa
- Se incluye información de ubicación aproximada basada en IP

**Notas de seguridad**:
- Se registra cada acceso al perfil propio del usuario
- Se incluye información del dispositivo para detección de accesos sospechosos
- Se registra la hora exacta del acceso
- Se puede usar para detectar accesos no autorizados a cuentas
- Se recomienda monitorear patrones inusuales de acceso
- La información de ubicación se obtiene de forma aproximada basada en la IP


## PUT /api/usuarios/me (Actualización de Perfil del usuario autenticado)

### Actualización de Perfil
Actualiza el perfil del usuario autenticado actualmente. Este endpoint permite a los usuarios actualizar su propia información de perfil.

**Controlador**: usuarioController
**Función**: actualizarPerfilAutenticado
**Router**: /usuarios/me

**Autenticación**: Requerida (JWT en el header de autorización)

**Headers requeridos**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Cuerpo de la solicitud**:
```json
{
  "nombre_completo": "Juan Pérez Actualizado",
  "telefono": "0999999998",
  "direccion": "Nueva Dirección 456",
  "dni": "87654321"
}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "id": "usuario-uuid",
    "nombre_completo": "Juan Pérez Actualizado",
    "email": "juan@ejemplo.com",
    "telefono": "0999999998",
    "direccion": "Nueva Dirección 456",
    "dni": "87654321",
    "activo": true,
    "roles": ["vendedor", "optometrista"],
    "fecha_creacion": "2023-01-01T00:00:00.000Z",
    "ultima_actualizacion": "2023-06-07T12:30:00.000Z"
  },
  "error": null
}
```

**Validaciones**:
- **nombre_completo** (opcional):
  - Mínimo 3 caracteres, máximo 100 caracteres
  - Solo letras, espacios y caracteres especiales básicos (.,-)
- **telefono** (opcional):
  - Exactamente 10 dígitos numéricos
  - Único en el sistema (opcional, si se proporciona)
- **direccion** (opcional):
  - Máximo 255 caracteres
- **dni** (opcional):
  - Máximo 20 caracteres
  - Único en el sistema (opcional, si se proporciona)

**Restricciones de seguridad**:
- Solo el usuario autenticado puede actualizar su propio perfil
- No se permite actualizar el campo `email` a través de este endpoint
- No se permite actualizar los `roles` a través de este endpoint
- No se permite actualizar el estado `activo` a través de este endpoint
- Se registra la actualización en el log de auditoría con el ID del usuario
- Se actualiza automáticamente el campo `modificado_por` y `modificado_en`

**Códigos de error**:
- 400: Datos de entrada inválidos o faltantes
- 401: No autenticado o token inválido
- 403: No autorizado para actualizar este perfil
- 404: Usuario no encontrado
- 409: Conflicto (email, teléfono o DNI ya registrados)
- 422: Error de validación de datos
- 500: Error del servidor

**Ejemplo de error**:
```json
{
  "ok": false,
  "data": null,
  "error": "El formato del teléfono no es válido (debe tener 10 dígitos)",
  "codigo": "INVALID_PHONE_FORMAT"
}
```

**Notas**:
- Los campos no proporcionados en la solicitud permanecerán sin cambios
- Solo se pueden actualizar los campos permitidos (nombre_completo, telefono, direccion, dni)
- Se recomienda solicitar solo los campos que necesitan ser actualizados

### Actualización de Perfil
**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que actualiza |
| `accion` | `ACTUALIZACION_PERFIL` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de actualización (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario actualizado |
| `modulo` | `usuarios` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "ACTUALIZAR",
  "entidad": "Usuario",
  "entidadId": "usuario-actualizado-id",
  "usuarioId": "usuario-actualizado-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "datosAnteriores": {
    "nombre_completo": "Nombre Anterior",
    "telefono": "0999999999"
  },
  "nuevosDatos": {
    "nombre_completo": "Nuevo Nombre",
    "telefono": "0987654321"
  },
  "metadatos": {
    "dispositivo": {
      "tipo": "mobile",
      "navegador": "Safari",
      "sistema_operativo": "iOS 15"
    },
    "campos_modificados": ["nombre_completo", "telefono"]
  }
}
```

**Campos sensibles**:
- No se registran contraseñas
- Se enmascaran datos sensibles si es necesario

**Notas de seguridad**:
- Solo el propietario puede actualizar su perfil
- Validación de formato de datos actualizados
- Registro de campos modificados

## POST /api/usuarios/me/cambiar-password (Cambio de contraseña del usuario autenticado)

### Detalle de endpoint
Permite a un usuario autenticado cambiar su propia contraseña. Requiere la contraseña actual para verificar la identidad. Este endpoint es compatible con dos formatos de solicitud para facilitar la migración de clientes antiguos.

**Controlador**: usuarioController
**Función**: cambiarPasswordAutenticado
**Router**: /usuarios/me/cambiar-password

**Autenticación**: Requerida (JWT en el header de autorización)

**Headers requeridos**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Cuerpo de la solicitud** (formato preferido):
```json
{
  "actual": "ContraseñaActual123!",
  "nueva": "NuevaContraseña123!"
}
```

**Cuerpo de la solicitud** (formato alternativo para compatibilidad):
```json
{
  "password_actual": "ContraseñaActual123!",
  "password_nuevo": "NuevaContraseña123!"
}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": "Contraseña actualizada correctamente",
  "error": null
}
```

**Validaciones**:
- **actual** (o **password_actual**):
  - Requerido
  - Debe coincidir con la contraseña actual del usuario
  - No puede estar vacío
- **nueva** (o **password_nuevo**):
  - Requerido
  - Mínimo 8 caracteres
  - Debe contener al menos una mayúscula, una minúscula y un número
  - Se valida la fortaleza antes de verificar el usuario actual (por seguridad)

**Restricciones de seguridad**:
- Solo el usuario autenticado puede cambiar su propia contraseña
- La contraseña se almacena con hash bcrypt (10 rondas de sal)
- Se registra el cambio en el log de auditoría
- No se permite el cambio si el usuario no tiene contraseña local configurada
- Las contraseñas débiles son rechazadas antes de verificar la identidad del usuario

**Códigos de error**:
- 400: Datos de entrada inválidos o faltantes
- 400: La nueva contraseña no cumple con los requisitos de seguridad
- 401: No autenticado o contraseña actual incorrecta
- 403: No autorizado para cambiar la contraseña de otro usuario
- 404: Usuario no encontrado
- 500: Error del servidor

**Ejemplo de error**:
```json
{
  "ok": false,
  "data": null,
  "error": "El password actual es incorrecto"
}
```

**Notas**:
- Se recomienda usar el formato `{ "actual": "...", "nueva": "..." }` para nuevas implementaciones
- El formato `{ "password_actual": "...", "password_nuevo": "..." }` se mantiene por compatibilidad
- La validación de fortaleza de contraseña ocurre antes de verificar la identidad del usuario por seguridad

### Registro de Auditoría

**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que realiza el cambio |
| `accion` | `CAMBIO_CONTRASENA` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del cambio (UTC) |
| `ip` | Dirección IP del cliente |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario |
| `modulo` | `seguridad` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "CAMBIO_CONTRASENA",
  "entidad": "Usuario",
  "entidadId": "usuario-id",
  "usuarioId": "usuario-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
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
    "requiere_actualizacion": false,
    "fuerza_contrasena": "fuerte"
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-07T15:45:30.000Z",
    "codigo_estado": 200
  }
}
```

**Campos sensibles**:
- No se registra la contraseña actual ni la nueva
- No se almacena el hash de la contraseña
- Solo se registra la fortaleza de la nueva contraseña

**Notas de seguridad**:
- Se registra tanto el éxito como el fallo del cambio de contraseña
- Se incluye información del dispositivo y ubicación
- Se registra si la nueva contraseña cumple con los requisitos de seguridad
- Se puede usar para detectar intentos de cambio de contraseña sospechosos
- Se recomienda notificar al usuario por correo electrónico del cambio
- Se debe registrar si el cambio fue forzado (ej. por expiración de contraseña)
- Se debe incluir la dirección IP desde donde se realizó el cambio

