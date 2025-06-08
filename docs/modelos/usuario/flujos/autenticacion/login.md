# Flujo de Autenticación Administrativa

## 1. Inicio de Sesión de Administrador, Optometrista, Vendedor

### 1.1. Diagrama de Flujo

```mermaid
flowchart TD
    A[Inicio] --> B[Administrador ingresa credenciales]
    B --> C[Validar formato de email y contraseña]
    C -->|Válido| D[Buscar usuario por email]
    C -->|Inválido| E[Error 400: Formato inválido]
    D -->|Encontrado| F[Verificar rol de administrador, optometrista, vendedor]
    D -->|No encontrado| G[Error 401: Credenciales inválidas]
    F -->|Es admin| H[Verificar cuenta activa]
    F -->|No es admin| I[Error 403: Acceso denegado]
    H -->|Activa| J[Verificar contraseña]
    H -->|Inactiva| K[Error 403: Cuenta inactiva]
    J -->|Válida| L[Generar token JWT]
    J -->|Inválida| M[Incrementar contador de intentos]
    M -->|>5 intentos| N[Bloquear cuenta y notificar]
    M --> O[Error 401: Credenciales inválidas]
    L --> P[Actualizar último inicio de sesión]
    P --> Q[Registrar en auditoría]
    Q --> R[Devolver token y datos de administrador]
    
    %% Referencias a endpoints
    B -.->|Endpoint: POST /api/auth/login| B
```

### 1.2. Proceso Detallado

1. **Validación de Entrada**
   - Verificar que el email tenga formato válido
   - Verificar que la contraseña cumpla con los requisitos mínimos
   - Validar longitud de campos

2. **Búsqueda de Usuario**
   - Buscar usuario por email (case insensitive)
   - Si no existe, devolver error genérico

3. **Verificación de Rol**
   - Verificar que el usuario tenga rol de administrador
   - Si no es administrador, denegar acceso

4. **Verificación de Estado**
   - Verificar que la cuenta esté activa
   - Si está inactiva, indicar motivo (bloqueada, eliminada, etc.)

5. **Validación de Credenciales**
   - Comparar contraseña hasheada con bcrypt
   - Si falla, incrementar contador de intentos fallidos
   - Si supera el límite de intentos, bloquear la cuenta y notificar

6. **Generación de Token**
   - Generar JWT con expiración corta (15-30 min)
   - Incluir roles y permisos en el payload

7. **Actualización y Respuesta**
   - Actualizar fecha de último inicio de sesión
   - Registrar evento de inicio de sesión exitoso en auditoría
   - Devolver token y datos básicos del administrador

## 2. Seguridad del Token

### 2.1. Estructura del Token JWT

```json
{
  "sub": "usuario-uuid",
  "email": "admin@neoptica.com",
  "roles": ["admin", "optometrista", "vendedor"],
  "iat": 1623000000,
  "exp": 1623001800
}
```

### 2.2. Consideraciones de Seguridad

- Usar HTTPS para todas las comunicaciones
- Almacenar el token en HttpOnly cookies
- Implementar protección CSRF
- Rotar las claves de firma periódicamente
- Monitorear intentos de acceso sospechosos

## 3. Cierre de Sesión

### 3.1. Proceso de Cierre de Sesión

1. Eliminar la cookie de autenticación del lado del cliente
2. Opcionalmente, invalidar el token del lado del servidor
3. Registrar el evento de cierre de sesión en auditoría

### 3.2. Consideraciones de Seguridad

- Los tokens expiran automáticamente después de su tiempo de vida
- Para mayor seguridad, mantener una lista blanca de tokens activos
- Implementar cierre de sesión remoto para dispositivos perdidos o robados
