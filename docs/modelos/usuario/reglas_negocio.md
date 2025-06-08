# Reglas de Negocio - Usuario

## Validaciones de Datos

### Email
- **Formato**: Debe ser un email válido
- **Unicidad**: Debe ser único en el sistema
- **Modificación**: 
  - Usuarios estándar: Requiere verificación por correo
  - Admin/Vendedor: Pueden modificar sin verificación

### Contraseña
- **Almacenamiento**: 
  - Se almacena con hash bcrypt (costo 12)
  - Nunca se envía en respuestas de la API
  - No se registra en logs de auditoría

- **Requisitos de complejidad**:
  - Longitud mínima: 12 caracteres
  - Debe contener al menos:
    - Una letra mayúscula (A-Z)
    - Una letra minúscula (a-z)
    - Un número (0-9)
    - Un carácter especial (!@#$%^&*)
  - No puede contener información personal (nombre, email, etc.)
  - No puede ser una contraseña común (se verifica contra listas de contraseñas débiles)

- **Políticas de renovación**:
  - Caducidad: 90 días
  - Historial: No se puede reutilizar ninguna de las últimas 5 contraseñas
  - Notificación: Se envía recordatorio 7 días antes de la expiración

- **Recuperación segura**:
  - Tokens de un solo uso
  - Expiración: 1 hora
  - Invalida tokens anteriores al solicitar uno nuevo
  - Requiere verificación de identidad adicional para cuentas sensibles

### DNI
- **Formato**: 8-10 dígitos
- **Unicidad**: Debe ser único en el sistema
- **Inmutabilidad**: No se puede modificar después de creado
- **Opcional**: No es requerido al crear el usuario

### Teléfono
- **Formato**: Internacional estándar
- **Validación**: Según el país
- **Opcional**: No es requerido

## Estados del Usuario

| Estado | Descripción | Acciones permitidas |
|--------|-------------|-------------------|
| Pendiente | Email no verificado | Verificar email, Reenviar correo |
| Activo | Cuenta verificada | Todas las permitidas por rol |
| Suspendido | Acceso temporalmente deshabilitado | Ninguna (excepto admin) |
| Inactivo | Cuenta deshabilitada permanentemente | Reactivación solo por admin |

## Flujos de Negocio

### Registro de Clientes
1. Usuario completa formulario de registro
2. Sistema valida datos y crea cuenta en estado "Pendiente"
3. Se envía correo de verificación
4. Usuario verifica email y la cuenta pasa a estado "Activo"

### Creación por Personal Autorizado
1. Admin/Vendedor completa formulario
2. Sistema genera contraseña temporal
3. Se crea cuenta en estado "Activo"
4. Se envía correo con credenciales

### Cambio de Contraseña
1. Usuario accede a sección de perfil
2. Ingresa contraseña actual y nueva
3. Sistema valida y actualiza la contraseña
4. Se registra en el historial de contraseñas

## Reglas de Negocio Específicas

### Para Vendedores
- Solo pueden crear usuarios con rol 'cliente'
- No pueden modificar roles existentes
- Acceso limitado a información de contacto

### Para Administradores
- Acceso completo a todos los perfiles
- Pueden modificar cualquier campo
- Gestión de roles y estados de cuenta

### Para Clientes
- Autogestión de perfil propio
- Verificación de email obligatoria para cambios
- Acceso limitado a su propia información
