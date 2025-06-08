# Modelo de Usuario

## Visión General

El modelo de Usuario es fundamental en el sistema, ya que maneja la autenticación, autorización y perfiles de todos los usuarios de la plataforma, incluyendo administradores, optometristas, vendedores y clientes.

## Documentación Técnica

- [Documentación Generada](./_generated/usuario.md) - Estructura de la base de datos, campos y relaciones
- [Reglas de Negocio](./reglas_negocio.md) - Reglas de negocio y validaciones
- [Seguridad y Permisos](./seguridad.md) - Roles, permisos y políticas de seguridad
- [Auditoría](./auditoria.md) - Rastreo de cambios y registro de actividades

## Endpoints

### Autenticación
- [Login y Gestión de Sesión](./endpoints/autenticacion.md) - Inicio de sesión, renovación de tokens, cierre de sesión
- [Recuperación de Contraseña](./endpoints/autenticacion.md#post-apiauthforgot-password) - Solicitud y restablecimiento

### Gestión de Usuarios
- [Registro y Verificación](./endpoints/gestion.md) - Creación de cuenta y verificación de email
- [Perfil de Usuario](./endpoints/gestion.md#get-apiusuariosme) - Consulta y actualización de perfil
- [Seguridad](./endpoints/seguridad.md) - Cambio de contraseña, gestión de sesiones

### Administración (Solo Admin)
- [Gestión de Roles](./endpoints/seguridad.md#get-apiroles) - Consulta de roles disponibles
- [Auditoría](./endpoints/seguridad.md#get-apiauditoria) - Consulta de registros de auditoría

## Flujos Detallados

### Autenticación
- [Inicio de Sesión](./flujos/autenticacion/login.md) - Proceso completo de autenticación
- [Recuperación de Contraseña](./flujos/autenticacion/recuperacion.md) - Flujo de restablecimiento

### Gestión de Usuario
- [Registro](./flujos/gestion/registro.md) - Proceso de creación de cuenta
- [Perfil](./flujos/gestion/perfil.md) - Gestión de información personal y preferencias

## Integraciones

- [OAuth (Google/Facebook)](./integraciones/oauth.md)
- [Sincronización con ERP](./integraciones/erp.md)
