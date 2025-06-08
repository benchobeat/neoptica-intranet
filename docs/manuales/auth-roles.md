# Módulo de Usuarios y Seguridad

## Modelos de Datos

### 1. Usuario (`usuario`)
Modelo que gestiona las cuentas de usuario del sistema.

#### Campos:
- **id**: Identificador único del usuario (UUID)
- **email**: Correo electrónico del usuario (único)
- **password_hash**: Hash de la contraseña (bcrypt)
- **nombre_completo**: Nombre completo del usuario
- **telefono**: Número de teléfono (opcional)
- **foto_url**: URL de la foto de perfil (opcional)
- **activo**: Indica si la cuenta está activa (booleano)
- **ultimo_inicio_sesion**: Fecha y hora del último inicio de sesión
- **intentos_fallidos**: Número de intentos fallidos de inicio de sesión
- **bloqueado_hasta**: Fecha hasta la que está bloqueada la cuenta (si aplica)
- **reset_token**: Token para restablecer contraseña (opcional)
- **reset_token_expiracion**: Fecha de expiración del token (opcional)
- **erp_id**: ID del usuario en el sistema ERP (opcional)
- **erp_tipo**: Tipo de entidad en el ERP (opcional)

#### Relaciones:
- `roles`: Roles asignados al usuario (a través de la tabla usuario_rol)
- `usuario_rol`: Relación muchos a muchos con roles
- `citas_como_cliente`: Citas donde el usuario es el cliente
- `citas_como_optometrista`: Citas donde el usuario es el optometrista
- `historiales_clinicos_como_cliente`: Historiales clínicos donde el usuario es el paciente
- `historiales_clinicos_como_optometrista`: Historiales clínicos donde el usuario es el profesional
- `pedidos`: Pedidos realizados por el usuario
- `facturas`: Facturas generadas por el usuario
- `reset_tokens`: Tokens de restablecimiento de contraseña
- `logs_auditoria`: Registros de auditoría generados por el usuario

### 2. Rol (`rol`)
Modelo que define los roles disponibles en el sistema.

#### Campos:
- **id**: Identificador único del rol (UUID)
- **nombre**: Nombre del rol (ej: "admin", "optometrista", "vendedor")
- **descripcion**: Descripción detallada del rol
- **nivel_permisos**: Nivel jerárquico del rol (para herencia de permisos)
- **activo**: Indica si el rol está activo

#### Relaciones:
- `usuarios`: Usuarios que tienen asignado este rol (a través de la tabla usuario_rol)
- `usuario_rol`: Relación muchos a muchos con usuarios
- `permisos`: Permisos asociados al rol

### 3. Reset Token (`reset_token`)
Modelo que gestiona los tokens de restablecimiento de contraseña.

#### Campos:
- **id**: Identificador único (UUID)
- **token**: Token único para restablecer la contraseña (encriptado)
- **usuario_id**: Referencia al usuario que solicitó el restablecimiento
- **email**: Correo electrónico al que se envió el token
- **fecha_expiracion**: Fecha y hora de expiración del token
- **usado**: Indica si el token ya fue utilizado
- **fecha_uso**: Fecha y hora en que se utilizó el token (opcional)
- **ip_solicitud**: Dirección IP desde donde se solicitó el restablecimiento
- **user_agent**: Información del navegador/dispositivo que realizó la solicitud
- **creado_en**: Fecha de creación del registro

#### Reglas de Negocio:
- Los tokens expiran después de 24 horas
- Cada token solo puede usarse una vez
- Se puede tener solo un token activo por usuario a la vez
- Los tokens usados o expirados no pueden ser reutilizados
- Se registra la IP y user agent para auditoría de seguridad

### 4. UsuarioRol (`usuario_rol`)
Tabla de unión para la relación muchos a muchos entre usuarios y roles.

#### Campos:
- **usuario_id**: ID del usuario (clave foránea)
- **rol_id**: ID del rol (clave foránea)
- **asignado_por**: ID del usuario que realizó la asignación
- **fecha_asignacion**: Fecha y hora de la asignación
- **activo**: Indica si la asignación está activa

#### Relaciones:
- `usuario`: Usuario asociado
- `rol`: Rol asociado

## Gestión de Autenticación y Autorización

### 1. Autenticación

#### Flujo de Inicio de Sesión
1. El usuario proporciona email y contraseña
2. El sistema verifica las credenciales
3. Se generan tokens de acceso y refresco
4. Se registra el inicio de sesión exitoso
5. Se devuelven los tokens al cliente

#### Seguridad
- Límite de intentos fallidos (bloqueo temporal)
- Contraseñas con requisitos de complejidad
- Almacenamiento seguro de contraseñas (bcrypt)
- Tokens JWT con tiempo de expiración
- Renovación automática de tokens

### 2. Autorización

#### Asignación de Roles
1. Los administradores pueden asignar múltiples roles a un usuario
2. Cada rol tiene permisos específicos
3. Los permisos se heredan jerárquicamente

#### Verificación de Permisos
- Middleware para verificar roles y permisos
- Control de acceso a nivel de ruta
- Validación de permisos en tiempo de ejecución

## Endpoints API

### 1. Autenticación

#### POST /api/auth/login
- **Descripción**: Iniciar sesión en el sistema
- **Autenticación**: No requerida
- **Cuerpo**:
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "TuContraseña123"
  }
  ```
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "uuid-usuario",
      "nombre_completo": "Nombre Usuario",
      "email": "usuario@ejemplo.com",
      "roles": ["admin", "vendedor"]
    }
  }
  ```
- **Errores comunes**:
  - 400: Faltan credenciales
  - 401: Credenciales inválidas
  - 403: Usuario inactivo

#### POST /api/auth/forgot-password
- **Descripción**: Solicitar restablecimiento de contraseña
- **Autenticación**: No requerida
- **Cuerpo**:
  ```json
  {
    "email": "usuario@ejemplo.com"
  }
  ```
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "message": "Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña."
  }
  ```
- **Notas**:
  - Siempre devuelve éxito para no revelar si el email existe
  - Envía un correo con un enlace de restablecimiento

#### POST /api/auth/reset-password
- **Descripción**: Restablecer contraseña con token
- **Autenticación**: No requerida
- **Cuerpo**:
  ```json
  {
    "token": "token-de-restablecimiento",
    "email": "usuario@ejemplo.com",
    "password": "NuevaContraseña123"
  }
  ```
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "message": "Contraseña restablecida correctamente"
  }
  ```
- **Requisitos de contraseña**:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número

## Recuperación de Contraseña

El sistema implementa un flujo completo y seguro de recuperación de contraseña que sigue las mejores prácticas de seguridad:

### Características de la recuperación de contraseña:

1. **Solicitud de recuperación segura:**
   - Endpoint `/api/auth/forgot-password` para solicitar el restablecimiento
   - Generación de tokens seguros con crypto
   - Tokens encriptados con bcrypt antes de almacenarse
   - Tokens con expiración de 24 horas
   - Integración con sistema de correo electrónico

2. **Restablecimiento seguro:**
   - Endpoint `/api/auth/reset-password` para restablecer la contraseña
   - Validación de token, email y fuerza de la nueva contraseña
   - Invalidación automática de tokens después de su uso
   - Validación de contraseñas seguras (mayúsculas, minúsculas, números)

3. **Protección contra ataques:**
   - Ocultamiento de la existencia de emails en la base de datos
   - Respuesta genérica para solicitudes de emails válidos e inválidos
   - Auditoría detallada de todas las solicitudes y resultados
   - Control de campos temporales (creado_por, modificado_por)

4. **Auditoría completa:**
   - Registro de cada intento de recuperación
   - Registro de restablecimientos exitosos y fallidos
   - Trazabilidad del proceso completo

#### GET /api/auth/google
- **Descripción**: Iniciar autenticación con Google
- **Autenticación**: No requerida
- **Redirige a**: Google para autenticación
- **Respuesta exitosa**: Redirección a `/oauth-success` con token JWT

#### GET /api/auth/facebook
- **Descripción**: Iniciar autenticación con Facebook
- **Autenticación**: No requerida
- **Redirige a**: Facebook para autenticación
- **Respuesta exitosa**: Redirección a `/oauth-success` con token JWT

#### GET /api/auth/instagram
- **Descripción**: Iniciar autenticación con Instagram
- **Autenticación**: No requerida
- **Redirige a**: Instagram para autenticación
- **Respuesta exitosa**: Redirección a `/oauth-success` con token JWT

**Cuerpo de la solicitud:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseñaSegura123"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@ejemplo.com",
    "nombre_completo": "Nombre del Usuario",
    "roles": ["admin", "vendedor"]
  }
}
```

### 2. Gestión de Usuarios

#### Obtener todos los usuarios
```
GET /api/usuarios
```

**Parámetros de consulta:**
- `activo`: Filtrar por estado activo/inactivo
- `rol`: Filtrar por rol
- `buscar`: Búsqueda por nombre o email

**Respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "usuario@ejemplo.com",
      "nombre_completo": "Nombre del Usuario",
      "telefono": "+1234567890",
      "activo": true,
      "roles": ["admin", "vendedor"],
      "ultimo_inicio_sesion": "2023-05-10T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "pagina": 1,
    "por_pagina": 10
  }
}
```

#### Crear un nuevo usuario
```
POST /api/usuarios
```

**Cuerpo de la solicitud:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseñaSegura123",
  "nombre_completo": "Nuevo Usuario",
  "telefono": "+1234567890",
  "roles": ["vendedor"]
}
```

**Respuesta exitosa (201 Created):**
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174001",
  "email": "nuevo@ejemplo.com",
  "nombre_completo": "Nuevo Usuario",
  "telefono": "+1234567890",
  "activo": true,
  "roles": ["vendedor"]
}
```

### 3. Gestión de Roles

#### Obtener todos los roles
```
GET /api/roles
```

**Respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": "323e4567-e89b-12d3-a456-426614174002",
      "nombre": "admin",
      "descripcion": "Administrador del sistema con acceso completo",
      "nivel_permisos": 1000,
      "activo": true
    },
    {
      "id": "423e4567-e89b-12d3-a456-426614174003",
      "nombre": "optometrista",
      "descripcion": "Personal médico encargado de exámenes de la vista",
      "nivel_permisos": 500,
      "activo": true
    }
  ]
}
```

## Flujos de Trabajo

### 1. Registro de Usuario
1. El administrador crea un nuevo usuario
2. Se asigna al menos un rol
3. El sistema envía un correo de bienvenida con instrucciones
4. El usuario recibe un enlace para establecer su contraseña
5. El usuario inicia sesión con sus credenciales

### 2. Recuperación de Contraseña
1. El usuario solicita restablecer su contraseña
2. El sistema genera un token de un solo uso
3. Se envía un correo con enlace de restablecimiento
4. El usuario establece una nueva contraseña
5. Se invalida el token después de su uso

### 3. Gestión de Sesiones
1. El usuario inicia sesión con sus credenciales
2. Se generan tokens de acceso y refresco
3. El token de acceso expira después de un tiempo corto
4. El token de refresco permite obtener un nuevo token de acceso
5. La sesión se cierra automáticamente después de inactividad prolongada

## Seguridad

### 1. Contraseñas
- Mínimo 12 caracteres
- Requiere mayúsculas, minúsculas, números y caracteres especiales
- No se permite el uso de contraseñas comunes
- Se verifica contra bases de datos de contraseñas comprometidas

### 2. Tokens
- Firmados con clave secreta segura
- Tiempo de expiración corto para tokens de acceso (15-60 minutos)
- Tiempo de expiración moderado para tokens de refresco (7-30 días)
- Revocación de tokens en caso de compromiso

### 3. Auditoría
- Registro de todos los inicios de sesión exitosos y fallidos
- Historial de cambios en roles y permisos
- Alertas por actividad sospechosa

## Integraciones

### 1. Directorio Activo/LDAP
- Autenticación contra directorios corporativos
- Sincronización de usuarios y grupos

### 2. Proveedores de Identidad (OAuth/OpenID)
- Google Workspace
- Microsoft 365
- Otros proveedores empresariales

### 3. Sistemas de Monitoreo
- Integración con SIEM para análisis de seguridad
- Alertas en tiempo real de actividades sospechosas
- `anulado_en`: Timestamp de anulación (si aplica)
- `anulado_por`: ID del usuario que anuló la asignación (si aplica)

Esta tabla asociativa incluye todos los campos de control temporal estándar para mantener la integridad de la auditoría.

### 3.2. JWT con Múltiples Roles

Los tokens JWT generados al autenticarse incluyen un array de todos los roles asignados al usuario:

```json
{
  "uid": "123",
  "roles": ["vendedor", "optometrista", "admin"],
  "iat": 1669842000,
  "exp": 1669928400
}
```

Este diseño permite:
- Verificar permisos basados en múltiples roles
- Facilitar el cambio dinámico de rol activo en la UI
- Mantener una única sesión para todas las capacidades del usuario

## 4. Implementación

### 4.1. Autenticación

```typescript
// Ejemplo simplificado de generación de JWT con múltiples roles
export const generarJWT = async (uid: number, roles: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = { uid, roles };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || '',
      {
        expiresIn: '24h',
      },
      (err, token) => {
        if (err) {
          console.error('Error al generar token:', err);
          reject('No se pudo generar el token');
        } else {
          resolve(token || '');
        }
      }
    );
  });
};
```

### 4.2. Middleware de Validación de Roles

```typescript
// Middleware que verifica si el usuario tiene alguno de los roles requeridos
export const validarRoles = (rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Token ya validado por validarJWT
    if (!req.usuario || !req.roles) {
      return res.status(401).json({
        ok: false,
        error: 'Token no válido - usuario no autenticado'
      });
    }

    // Verificar si el usuario tiene alguno de los roles permitidos
    const tieneRol = req.roles.some(rol => rolesPermitidos.includes(rol));
    
    if (!tieneRol) {
      return res.status(403).json({
        ok: false,
        error: `El usuario no tiene los permisos necesarios. Requiere uno de estos roles: ${rolesPermitidos.join(', ')}`
      });
    }

    next();
  };
};
```

### 3.3. Creación de Usuarios con Múltiples Roles

```typescript
// Ejemplo simplificado de creación de usuario con múltiples roles
const crearUsuario = async (req: Request, res: Response) => {
  const { nombre_completo, email, password, telefono, roles } = req.body;
  const usuarioId = req.usuario.uid;

  try {
    // Validar roles existentes
    const rolesValidos = await prisma.rol.findMany({
      where: { nombre: { in: roles }, activo: true }
    });

    if (rolesValidos.length !== roles.length) {
      return res.status(400).json({
        ok: false,
        error: 'Uno o más roles no existen o no están activos'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Crear usuario y asignar roles en una transacción
    const [usuario, rolesAsignados] = await prisma.$transaction(async (tx) => {
      // 1. Crear usuario
      const nuevoUsuario = await tx.usuario.create({
        data: {
          nombre_completo,
          email,
          password: passwordHash,
          telefono,
          activo: true,
          creado_en: new Date(),
          creado_por: usuarioId
        }
      });
      
      // 2. Asignar múltiples roles
      const asignaciones = await Promise.all(
        roles.map(nombreRol => 
          tx.usuario_rol.create({
            data: {
              usuario_id: nuevoUsuario.id,
              rol: { connect: { nombre: nombreRol } },
              creado_en: new Date(),
              creado_por: usuarioId
            }
          })
        )
      );
      
      return [nuevoUsuario, asignaciones];
    });

    // Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'CREAR',
      descripcion: `Usuario creado: ${nombre_completo} (${email}) con roles: ${roles.join(', ')}`,
      modulo: 'usuarios',
      entidad_id: usuario.id
    });

    return res.status(201).json({
      ok: true,
      data: {
        usuario: {
          id: usuario.id,
          nombre_completo: usuario.nombre_completo,
          email: usuario.email,
          telefono: usuario.telefono,
          roles: roles
        }
      },
      error: null
    });
    
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    
    // Auditoría de error
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'ERROR',
      descripcion: `Error al crear usuario: ${error.message}`,
      modulo: 'usuarios'
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al crear usuario'
    });
  }
};
```

## 4. Experiencia de Usuario Multi-Rol

El sistema permite a los usuarios con múltiples roles:

1. **Autenticación unificada**: Login único que carga todos los roles asignados
2. **Cambio dinámico de rol**: Seleccionar el rol activo en cualquier momento de la sesión
3. **Interfaz adaptativa**: La UI se adapta según el rol activo, mostrando solo las opciones pertinentes
4. **Permisos dinámicos**: Las operaciones permitidas cambian según el rol activo seleccionado

## 5. Seguridad y Consideraciones

### 5.1. Validaciones y Protecciones

- Verificación en cada endpoint para prevenir modificaciones no autorizadas de roles
- Validación de roles existentes antes de asignación
- Registro detallado de auditoría para todas las operaciones de gestión de roles
- Endpoints protegidos por middleware que valida permisos basados en roles

### 5.2. Pruebas y Validación

El sistema incluye pruebas automatizadas para:

- Creación de usuarios con múltiples roles
- Actualización de roles de usuarios
- Verificación de JWT con múltiples roles
- Validación de acceso según rol activo
- Manejo de escenarios de error

### 5.3. Limitaciones y Consideraciones

- Los usuarios pueden tener múltiples roles, pero operan en un rol "activo" a la vez en la interfaz
- Las operaciones se auditan indicando el rol activo utilizado para realizarlas
- La revocación de roles respeta las restricciones de integridad referencial con auditoría

## 6. Escalabilidad y Evolución

El sistema está diseñado para soportar:

- Creación de nuevos roles sin cambios estructurales
- Expansión de permisos dentro de cada rol
- Reportes por rol y por usuario
- Estadísticas de uso por rol

---

Este documento será actualizado según evolucionen los requerimientos del sistema multi-rol y se implementen mejoras en la gestión de roles y permisos.
