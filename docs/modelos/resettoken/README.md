# Modelo Reset Token

## Visión General

El modelo `reset_token` gestiona los tokens de restablecimiento de contraseña en el sistema, permitiendo a los usuarios recuperar el acceso a sus cuentas de manera segura.

## Documentación Técnica

- [Estructura del Modelo](./_generated/reset_token.md)

## Estructura de Datos

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único del token |
| token | String | Token único para restablecer la contraseña (encriptado) |
| usuario_id | UUID | Referencia al usuario que solicitó el restablecimiento |
| email | String | Correo electrónico al que se envió el token |
| fecha_expiracion | DateTime | Fecha y hora de expiración del token |
| usado | Boolean | Indica si el token ya fue utilizado |
| fecha_uso | DateTime | Fecha y hora en que se utilizó el token |
| ip_solicitud | String | Dirección IP desde donde se solicitó el restablecimiento |
| user_agent | String | Información del navegador/dispositivo |
| creado_en | DateTime | Fecha de creación del registro |

### Relaciones

- **usuario**: Relación con el modelo `Usuario`
- **logs_auditoria**: Registros de auditoría asociados

## Reglas de Negocio

1. **Vigencia de Tokens**
   - Los tokens expiran después de 24 horas
   - No se pueden utilizar tokens expirados

2. **Uso Único**
   - Cada token solo puede usarse una vez
   - Después de su uso, se marca como `usado = true`
   - Se registra la fecha y hora de uso

3. **Seguridad**
   - Solo se permite un token activo por usuario a la vez
   - Se registra la IP y user agent para auditoría
   - Los tokens se almacenan encriptados

4. **Validaciones**
   - El email debe coincidir con el usuario asociado
   - No se pueden reutilizar tokens expirados o usados
   - Se valida la vigencia del token en cada intento de uso

## Flujo de Restablecimiento

1. Usuario solicita restablecimiento
2. Sistema genera token único
3. Se envía enlace con token al email
4. Usuario hace clic en el enlace
5. Sistema valida el token
6. Usuario establece nueva contraseña
7. Token se marca como usado

## Auditoría

Todas las operaciones con tokens de restablecimiento generan registros de auditoría que incluyen:
- Fecha y hora de la operación
- IP del solicitante
- User agent
- Estado de la operación

## Consideraciones de Seguridad

- Los tokens nunca se envían en texto plano por correo
- Se utiliza HTTPS para todas las comunicaciones
- Se implementa rate limiting para prevenir ataques por fuerza bruta
- Los tokens expirados se eliminan periódicamente

## Ejemplo de Uso

```typescript
// Generar token de restablecimiento
const token = await prisma.reset_token.create({
  data: {
    token: hashedToken,
    usuario_id: userId,
    email: userEmail,
    fecha_expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    ip_solicitud: clientIp,
    user_agent: userAgent
  }
});

// Validar token
const isValid = await validateResetToken(token, email);
```
