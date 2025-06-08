# Gestión de Usuarios

## Índice de Endpoints

### Administración de Usuarios (Admin)
- `GET /api/usuarios/paginados` - ✅ Implementado (Nombre de ruta incorrecto: api/usuarios/paginated)
- `GET /api/usuarios` - ✅ Implementado - Lista todos los usuarios (sin paginación)
- `GET /api/usuarios/:id` - ✅ Implementado - Consultar usuario por ID
- `POST /api/usuarios` - ✅ Implementado - Crear nuevo usuario (solo admin)
- `PUT /api/usuarios/:id` - ✅ Implementado - Actualizar usuario existente
- `DELETE /api/usuarios/:id` - ✅ Implementado - Eliminar usuario (borrado lógico)
- `PUT /api/usuarios/:id/reset-password` - ✅ Implementado - Restablecer contraseña de usuario (admin)

### Gestión de Perfil de Usuario
- `GET /api/usuarios/me` - ❌ Pendiente - Obtener perfil del usuario autenticado
- `PUT /api/usuarios/me` - ❌ Pendiente - Actualizar perfil del usuario autenticado
- `POST /api/usuarios/me/cambiar-password` - ✅ Implementado (Nombre de ruta incorrecta) - Cambiar contraseña del usuario autenticado
- `POST /api/usuarios/cambiar-password` - ⚠️ Obsoleto - Alternativa para cambiar contraseña (compatibilidad) Se debe quitar del código

### Autoregistro
- `POST /api/usuarios/autoregistro` - ✅ Implementado (Nombre de ruta incorrecta) - Registro autónomo de usuario (público)

---

# Endpoints de Gestión de Usuarios

## 🔄 `GET /api/usuarios/paginados` - Listado Paginado de Usuarios

### Estado: ✅ Implementado - Nombre de ruta incorrecto api/usuarios/paginated

### Detalle de endpoint
Lista todos los usuarios con paginación, búsqueda y filtros avanzados.

**Controlador**: usuarioController  
**Función**: listarUsuariosPaginados  
**Router**: /api/usuarios/paginados

**Autenticación**: Requerida (Rol: admin)

**Parámetros de consulta**:
- `page` (opcional, number): Número de página (por defecto: 1)
- `pageSize` (opcional, number): Tamaño de página (por defecto: 10)
- `searchText` (opcional, string): Texto para búsqueda en nombre y email (case insensitive)
- `activo` (opcional, boolean): Filtrar por estado activo/inactivo
- `rol` (opcional, string): Filtrar por rol específico
- `fechaInicio` (opcional, string): Filtrar usuarios creados después de esta fecha (ISO 8601)
- `fechaFin` (opcional, string): Filtrar usuarios creados antes de esta fecha (ISO 8601)

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
        "roles": ["admin", "vendedor"],
        "fecha_creacion": "2024-01-01T00:00:00.000Z",
        "fecha_actualizacion": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  },
  "error": null
}
```

**Validaciones**:
- [x] `page` debe ser un número entero positivo (default: 1)
- [x] `pageSize` debe ser un número entre 1 y 100 (default: 10)
- [x] `searchText` busca en `nombre_completo` y `email` (case insensitive, búsqueda parcial)
- [x] `activo` debe ser un booleano si se proporciona
- [x] `fechaInicio` y `fechaFin` deben ser fechas válidas en formato ISO 8601
- [x] `rol` debe ser un rol válido del sistema

**Códigos de error**:
- 401: No autenticado
- 403: No autorizado (se requiere rol admin)
- 400: Parámetros de consulta inválidos
- 500: Error del servidor

**Notas**:
- Los usuarios inactivos solo son visibles para administradores
- La búsqueda es insensible a mayúsculas/minúsculas
- Los resultados incluyen metadatos de paginación
- Se registra la consulta en el log de auditoría

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
    "activo": true,
    "rol": "admin",
    "fecha_inicio": "2024-01-01T00:00:00.000Z",
    "fecha_fin": "2024-12-31T23:59:59.999Z"
  },
  "resultados": 1,
  "paginas_totales": 1
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
- No se registra el contenido de la lista de usuarios, solo metadatos de la consulta




## 🔄 `GET /api/usuarios/:id` - Obtener Usuario por ID

### Estado: ✅ Implementado

### Detalle de endpoint
Obtiene un usuario por su ID.

**Controlador**: usuarioController  
**Función**: obtenerUsuario  
**Router**: /api/usuarios/:id

**Autenticación**: Requerida (Rol: admin, vendedor, optometrista)

**Parámetros de ruta**:
- `id` (requerido, string): ID del usuario a consultar (UUID)

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "id": "usuario-uuid",
    "nombre_completo": "Nombre Usuario",
    "email": "usuario@ejemplo.com",
    "telefono": "0999999999",
    "direccion": "Calle Principal 123",
    "dni": "12345678",
    "activo": true,
    "email_verificado": true,
    "roles": ["vendedor"],
    "fecha_creacion": "2024-01-01T00:00:00.000Z",
    "fecha_actualizacion": "2024-01-01T00:00:00.000Z"
  },
  "error": null
}
```

**Validaciones**:
- [x] ID debe ser un UUID válido
- [x] Usuario debe estar autenticado
- [x] Usuario debe ser administrador o el propietario del perfil
- [x] Solo administradores pueden ver usuarios inactivos

**Códigos de error**:
- 400: ID inválido o mal formado
- 401: No autenticado
- 403: No autorizado para ver este perfil
- 404: Usuario no encontrado o inactivo
- 500: Error del servidor

**Notas**:
- Los campos sensibles como contraseñas nunca se incluyen
- Los usuarios inactivos solo son visibles para administradores
- La respuesta incluye metadatos de auditoría (fechas de creación/actualización)
- Los roles se devuelven como un array de strings

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

## 🔄 `POST /api/usuarios` - Crear Usuario

### Estado: ✅ Implementado

### Detalle de endpoint
Crea un nuevo usuario en el sistema. Solo accesible por administradores.

**Controlador**: usuarioController  
**Función**: crearUsuario  
**Router**: /api/usuarios

**Autenticación**: Requerida (Rol: admin)

**Cuerpo de la solicitud**:
```json
{
  "nombre_completo": "Nombre Completo",
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!",
  "telefono": "0999999999",
  "direccion": "Av. Principal 123",
  "dni": "12345678",
  "roles": ["vendedor", "optometrista"],
  "activo": true
}
```

**Respuesta exitosa (201 Created)**:
```json
{
  "ok": true,
  "data": {
    "id": "nuevo-usuario-uuid",
    "nombre_completo": "Nombre Completo",
    "email": "usuario@ejemplo.com",
    "telefono": "0999999999",
    "direccion": "Av. Principal 123",
    "dni": "12345678",
    "roles": ["vendedor", "optometrista"],
    "activo": true
  },
  "error": null
}
```

**Validaciones**:
- [x] `nombre_completo` (requerido):
  - Mínimo 3 caracteres, máximo 100
  - Solo letras, espacios y caracteres especiales básicos
- [x] `email` (requerido):
  - Formato de email válido
  - Debe ser único en el sistema
- [x] `password` (requerido):
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula, 1 minúscula y 1 número
  - Máximo 72 caracteres (límite de bcrypt)
- [x] `telefono` (opcional):
  - 10 dígitos numéricos
  - Formato local sin prefijo internacional
- [x] `dni` (opcional):
  - 8-13 dígitos
  - Debe ser único en el sistema
- [x] `roles` (opcional, array):
  - Debe ser un array de strings
  - Solo roles existentes en el sistema
  - No se puede asignar rol de administrador a usuarios nuevos
- [x] `activo` (opcional, boolean):
  - Por defecto: true
  - Solo administradores pueden crear usuarios inactivos

**Códigos de error**:
- 400: Datos de entrada inválidos o faltantes
- 401: No autenticado
- 403: No autorizado (se requiere rol admin)
- 409: El correo electrónico o DNI ya está registrado
- 422: Validación fallida (detalles en el mensaje de error)
- 500: Error del servidor

**Notas**:
- La contraseña se almacena con hash bcrypt
- Se registra la IP y el usuario que realizó la creación
- Se genera un evento de auditoría con todos los cambios
- Los emails siempre se guardan en minúsculas

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

## 🔄 `PUT /api/usuarios/:id` - Actualizar Usuario

### Estado: ✅ Implementado

### Detalle de endpoint
Actualiza un usuario existente. Los administradores pueden actualizar cualquier campo permitido, mientras que los usuarios solo pueden actualizar su propio perfil con restricciones.

**Controlador**: usuarioController  
**Función**: actualizarUsuario  
**Router**: /api/usuarios/:id

**Autenticación**: Requerida (Rol: admin)

**Parámetros de ruta**:
- `id` (requerido, string): ID del usuario a actualizar (UUID)

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

**Nota**: Solo los administradores pueden modificar los campos `activo` y `roles`.

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
    "email_verificado": true,
    "roles": ["vendedor", "optometrista"],
    "fecha_creacion": "2024-01-01T00:00:00.000Z",
    "fecha_actualizacion": "2024-06-08T14:30:00.000Z"
  },
  "error": null
}
```

**Validaciones**:
- [x] `id` debe ser un UUID válido existente
- [x] Usuario debe estar autenticado
- [x] Usuario debe ser administrador o el propietario del perfil
- [x] `nombre_completo` (opcional):
  - Mínimo 3 caracteres, máximo 100
  - Solo letras, espacios y caracteres especiales básicos
- [x] `telefono` (opcional):
  - 10 dígitos numéricos
  - Formato local sin prefijo internacional
- [x] `dni` (opcional, solo si no estaba previamente establecido):
  - 8-13 dígitos
  - Debe ser único en el sistema
- [x] `roles` (solo admin):
  - Debe ser un array de strings
  - Solo roles existentes en el sistema
  - No se puede quitar el último rol de administrador
- [x] `activo` (solo admin):
  - Boolean
  - No se puede desactivar a sí mismo

**Restricciones de seguridad**:
- El email no se puede modificar (requiere flujo de verificación)
- Solo administradores pueden modificar roles y estado activo
- No se puede modificar la contraseña (usar endpoints específicos)

**Códigos de error**:
- 400: Datos de entrada inválidos
- 401: No autenticado
- 403: No autorizado para modificar este usuario
- 404: Usuario no encontrado
- 409: Conflicto (email o DNI ya existen)
- 422: Validación fallida (detalles en el mensaje)
- 500: Error del servidor

**Notas**:
- Se registra la IP y el usuario que realizó la modificación
- Se genera un evento de auditoría con los cambios realizados
- Los campos no proporcionados mantienen su valor actual
- Los usuarios regulares solo pueden modificar sus datos básicos (nombre, teléfono, dirección, DNI si no estaba establecido)

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

## 🔄 `DELETE /api/usuarios/:id` - Eliminar Usuario (Borrado Lógico)

### Estado: ✅ Implementado

### Detalle de endpoint
Realiza un borrado lógico de un usuario, marcándolo como inactivo en lugar de eliminarlo físicamente. Esto permite mantener la integridad referencial de los datos históricos. Solo los administradores pueden realizar esta acción.

**Controlador**: usuarioController  
**Función**: eliminarUsuario  
**Router**: /api/usuarios/:id

**Autenticación**: Requerida (Rol: admin)

**Parámetros de ruta**:
- `id` (requerido, string): ID del usuario a desactivar (UUID)

**Respuesta exitosa (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "id": "usuario-uuid",
    "mensaje": "Usuario desactivado correctamente",
    "fecha_desactivacion": "2024-06-08T15:45:30.000Z"
  },
  "error": null
}
```

**Validaciones**:
- [x] `id` debe ser un UUID válido existente
- [x] Usuario debe estar autenticado como administrador
- [x] No se puede desactivar a sí mismo
- [x] No se pueden desactivar usuarios del sistema (`is_system = true`)
- [x] No se pueden desactivar usuarios con roles de sistema críticos
- [x] Verificación de dependencias activas antes de la desactivación

**Proceso de desactivación**:
1. Se marca el usuario como `activo = false`
2. Se registra la fecha de desactivación
3. Se revocan todos los tokens activos del usuario
4. Se registra el evento en el log de auditoría
5. Se notifica al usuario por email (opcional)

**Códigos de error**:
- 400: ID no proporcionado o inválido
- 401: No autenticado
- 403: No autorizado (se requiere rol admin)
- 403: No se puede desactivar a sí mismo
- 403: No se pueden desactivar usuarios del sistema
- 403: Usuario tiene dependencias activas
- 404: Usuario no encontrado
- 409: Usuario ya está inactivo
- 500: Error del servidor

**Notas**:
- El borrado es lógico, no físico (soft delete)
- Se mantiene el registro en la base de datos con estado inactivo
- Se registra la IP y usuario que realizó la desactivación
- Se genera un evento de auditoría detallado
- Los usuarios desactivados no pueden iniciar sesión
- Solo un administrador puede reactivar un usuario desactivado

**Consideraciones de seguridad**:
- Validación de permisos a nivel de ruta y controlador
- Verificación de doble capa para operaciones sensibles
- Registro detallado de la operación
- No se permite la desactivación de cuentas críticas del sistema

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

## 🔄 `POST /api/usuarios/:id/reset-password` - Restablecer Contraseña (Admin)

### Estado: ✅ Implementado

### Detalle de endpoint
Permite a un administrador restablecer la contraseña de cualquier usuario sin necesidad de conocer la contraseña actual. Esta operación es de alto privilegio y está estrictamente limitada a administradores.

**Controlador**: usuarioController  
**Función**: resetPasswordAdmin  
**Router**: /api/usuarios/:id/reset-password

**Autenticación**: Requerida (Rol: admin)

**Parámetros de ruta**:
- `id` (requerido, string): ID del usuario objetivo (UUID)

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
    "mensaje": "Contraseña restablecida correctamente",
    "usuario_id": "usuario-uuid",
    "email_notificado": "usuario@ejemplo.com",
    "fecha_cambio": "2024-06-08T15:30:45.000Z"
  },
  "error": null
}
```

**Validaciones**:
- [x] `id` debe ser un UUID válido existente
- [x] Usuario debe estar autenticado como administrador
- [x] `nueva` (requerido):
  - Mínimo 8 caracteres, máximo 72 (límite bcrypt)
  - Al menos 1 mayúscula, 1 minúscula y 1 número
  - No puede ser una contraseña común o comprometida
  - No puede ser similar a información personal del usuario
  - No puede ser una de las últimas 5 contraseñas utilizadas
- [x] Verificación de que el usuario objetivo existe y está activo
- [x] Validación de que el administrador no está intentando restablecer su propia contraseña (debe usar el flujo de cambio normal)

**Proceso de restablecimiento**:
1. Validación de permisos y datos de entrada
2. Verificación de que la nueva contraseña cumple con las políticas de seguridad
3. Cálculo del hash de la nueva contraseña usando bcrypt
4. Actualización del hash en la base de datos
5. Revocación de todos los tokens activos del usuario
6. Cierre de todas las sesiones activas
7. Registro del evento en el log de auditoría
8. Envío de notificación al usuario por email
9. Retorno de confirmación

**Códigos de error**:
- 400: Datos de entrada inválidos o faltantes
- 401: No autenticado
- 403: No autorizado (se requiere rol admin)
- 404: Usuario no encontrado
- 409: La nueva contraseña no cumple con las políticas de seguridad
- 422: Validación fallida (detalles en el mensaje)
- 429: Demasiados intentos (rate limiting)
- 500: Error del servidor

**Notas de seguridad**:
- La contraseña nunca se almacena en texto plano
- Se utiliza un factor de costo alto para el hash bcrypt (12 rondas)
- Se registra la IP y dispositivo del administrador que realiza el cambio
- Se notifica al usuario del cambio por múltiples canales (email, notificación en el sistema)
- Se recomienda al usuario cambiar la contraseña en el próximo inicio de sesión

**Consideraciones de auditoría**:
- Se registra el ID del administrador que realizó el cambio
- Se registra la fecha/hora exacta del cambio
- Se incluye el método de autenticación utilizado
- Se registra si la notificación fue enviada exitosamente
- Se mantiene un historial de cambios de contraseña para auditoría

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
    "requiere_cambio": true,
    "sesiones_cerradas": 3,
    "tokens_revocados": 2,
    "notificacion_enviada": true,
    "metodo_notificacion": ["email"],
    "politicas_cumplidas": {
      "longitud_minima": true,
      "complejidad": true,
      "no_es_repetida": true,
      "no_es_comun": true
    }
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2024-06-08T15:30:45.000Z",
    "codigo_estado": 200,
    "mensaje": "Contraseña restablecida exitosamente"
  }
}
```

**Campos sensibles**:
- Nunca se registra la contraseña en texto plano
- No se almacena el hash de la contraseña en los logs
- Se registra solo un indicador de fortaleza de la contraseña
- Se registra el ID del administrador que realizó el cambio
- Se registra si la operación fue exitosa o fallida

**Notas de seguridad**:
- Se registran todos los intentos, exitosos o fallidos
- Se incluye información del dispositivo y ubicación del administrador
- Se registra el cumplimiento de las políticas de contraseña
- Se registra el cierre de sesiones y revocación de tokens
- Se registra el envío de notificaciones al usuario
- Se mantiene un historial de auditoría para cumplimiento normativo
- Los registros se retienen según la política de retención de la organización
- Se pueden generar alertas para cambios sospechosos o inusuales
- Se recomienda notificar al usuario por correo electrónico sobre el cambio de contraseña
- Se debe incluir la dirección IP desde donde se realizó el cambio
- Se registra el ID del usuario afectado para trazabilidad


# Autoregistro

## 🔄 `POST /api/usuarios/me/autoregistro` - Registro autónomo de usuario

### Estado: ✅ Implementado (Nombre de ruta incorrecta)

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
- [x] **nombre_completo**:
  - Requerido
  - Mínimo 3 caracteres, máximo 100 caracteres
  - Solo letras, espacios y caracteres especiales básicos (.,-)
- [x] **email**:
  - Requerido
  - Formato de email válido (`usuario@dominio.com`)
  - Mínimo 5 caracteres, máximo 255 caracteres
  - No puede estar registrado previamente
- [x] **password**:
  - Requerido
  - Mínimo 8 caracteres
  - Debe contener al menos una mayúscula, una minúscula y un número
  - No puede ser una contraseña común o comprometida
- [X] **telefono**:
  - Opcional
  - Formato: exactamente 10 dígitos numéricos
- [X] **direccion**:
  - Opcional
  - Máximo 255 caracteres
- [X] **dni**:
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

# Gestión de Perfil de Usuario Autenticado

## 🔄 `GET /api/usuarios/me` - Obtener perfil del usuario autenticado

### Estado: ❌ Pendiente

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


## 🔄 `PUT /api/usuarios/me` - Actualizar Perfil de Usuario

### Estado: ❌ Pendiente

### Detalle de endpoint
Permite a un usuario autenticado actualizar su propia información de perfil. Este endpoint está restringido para modificar solo ciertos campos y no permite cambios en información sensible como correo electrónico o roles.

**Controlador**: usuarioController  
**Función**: actualizarPerfilAutenticado
**Router**: /usuarios/me

**Autenticación**: Requerida (Cualquier rol autenticado)

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
    "fecha_actualizacion": "2023-06-08T10:30:00.000Z"
  },
  "error": null
}
```

**Validaciones**:
- [ ] Usuario debe estar autenticado
- [ ] `nombre_completo` (opcional):
  - Mínimo 3 caracteres, máximo 100 caracteres
  - Solo letras, espacios y caracteres especiales básicos (.,-)
- [ ] `telefono` (opcional):
  - Exactamente 10 dígitos numéricos
- [ ] `direccion` (opcional):
  - Máximo 255 caracteres
- [ ] `dni` (opcional):
  - Máximo 20 caracteres
  - Solo se puede establecer una vez (si es null)
  - Único en el sistema (si se proporciona)

**Restricciones de seguridad**:
- Solo el usuario autenticado puede actualizar su propio perfil
- No se permite actualizar el campo `email`
- No se permite actualizar los `roles`
- No se permite actualizar el estado `activo`
- El campo `dni` solo se puede establecer una vez (si es null)
- Se registra la actualización en el log de auditoría
- Se actualiza automáticamente el campo `modificado_por` y `modificado_en`

**Códigos de error**:
- 400: Datos de entrada inválidos o faltantes
- 401: No autenticado o token inválido
- 403: No autorizado para actualizar este perfil
- 404: Usuario no encontrado
- 409: Conflicto (teléfono o DNI ya registrados)
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
- El campo `dni` solo se puede establecer una vez y no se puede modificar después

### Registro de Auditoría
**Entrada de Auditoría**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que realiza la acción |
| `accion` | `ACTUALIZAR_PERFIL` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la actualización (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario actualizado |
| `modulo` | `perfil` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "ACTUALIZAR_PERFIL",
  "entidad": "Usuario",
  "entidadId": "usuario-actualizado-id",
  "usuarioId": "usuario-actualizado-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "datosAnteriores": {
    "nombre_completo": "Nombre Anterior",
    "telefono": "0999999999",
    "direccion": "Dirección Anterior",
    "dni": null
  },
  "nuevosDatos": {
    "nombre_completo": "Juan Pérez Actualizado",
    "telefono": "0999999998",
    "direccion": "Nueva Dirección 456",
    "dni": "87654321"
  },
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
    "campos_modificados": ["nombre_completo", "telefono", "direccion", "dni"],
    "tipo_operacion": "actualizacion_perfil"
  }
}
```

**Campos sensibles**:
- No se registran datos sensibles como contraseñas
- Se registran los cambios realizados en los campos del perfil
- Se incluye información del dispositivo y ubicación

**Notas de seguridad**:
- Se valida que el usuario solo pueda actualizar su propio perfil
- Se registra el historial de cambios para auditoría
- Se recomienda implementar validación de datos en el frontend
- Se debe notificar al usuario por correo electrónico sobre cambios importantes
- Se recomienda implementar autenticación de dos factores para cambios sensibles

## 🔄 `POST /api/usuarios/me/cambiar-password` - Cambio de Contraseña de Usuario autenticado

### Estado: ✅ Implementado (Nombre de ruta incorrecta)

### Detalle de endpoint
Permite a un usuario autenticado cambiar su propia contraseña. Requiere la contraseña actual para verificar la identidad. Este endpoint es compatible con dos formatos de solicitud para facilitar la migración de clientes antiguos.

**Controlador**: usuarioController  
**Función**: cambiarPasswordAutenticado
**Router**: /usuarios/me/cambiar-password

**Autenticación**: Requerida (Cualquier rol autenticado)

**Headers requeridos**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Cuerpo de la solicitud**:
```json
{
  "password_actual": "MiContraseñaActual123",
  "password_nuevo": "MiNuevaContraseñaSegura456"
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
- [x] Usuario debe estar autenticado
- [x] `password_actual` (requerido):
  - No puede estar vacío
  - Debe coincidir con la contraseña actual del usuario
- [x] `password_nuevo` (requerido):
  - Mínimo 8 caracteres
  - Debe contener al menos una letra mayúscula
  - Debe contener al menos una letra minúscula
  - Debe contener al menos un número
  - No puede ser igual a la contraseña actual
  - Se valida antes de verificar el usuario para evitar ataques de tiempo

**Restricciones de seguridad**:
- Solo el usuario autenticado puede cambiar su propia contraseña
- Se registra el cambio en el log de auditoría
- La contraseña se hashea con bcrypt antes de almacenarse
- No se almacena ni registra la contraseña en texto plano
- Se recomienda invalidar tokens JWT existentes después del cambio

**Códigos de error**:
- 400: Datos de entrada inválidos o faltantes
- 401: No autenticado o contraseña actual incorrecta
- 403: No autorizado para cambiar esta contraseña
- 404: Usuario no encontrado
- 422: Error de validación de datos (contraseña débil, igual a la actual, etc.)
- 500: Error del servidor

**Ejemplo de error**:
```json
{
  "ok": false,
  "data": null,
  "error": "El password nuevo debe ser fuerte: mínimo 8 caracteres, incluir mayúsculas, minúsculas y números"
}
```

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