# Auditoría - Modelo de Usuario

## Campos de Auditoría

El modelo de Usuario incluye los siguientes campos de auditoría para el rastreo de cambios:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `creado_en` | `DateTime` | Fecha y hora de creación del registro |
| `creado_por` | `string` | ID del usuario que creó el registro |
| `modificado_en` | `DateTime` | Última fecha de modificación del registro |
| `modificado_por` | `string` | ID del último usuario que modificó el registro |
| `anulado_en` | `DateTime?` | Fecha de eliminación lógica (soft delete) |
| `anulado_por` | `string?` | ID del usuario que realizó la eliminación lógica |

## Registro de Actividades

Todas las operaciones CRUD en el modelo de Usuario generan registros de auditoría en la tabla `log_auditoria` siguiendo la siguiente estructura:

| Campo en log_auditoria | Tipo | Requerido | Descripción |
|-----------------------|------|-----------|-------------|
| `usuarioId` | string | No | ID del usuario que realizó la acción |
| `accion` | string | Sí | Código de la acción realizada (ej: 'USUARIO_CREAR') |
| `descripcion` | string | No | Descripción detallada de la acción |
| `fecha` | Date | Sí | Fecha y hora del evento |
| `ip` | string | No | Dirección IP del solicitante |
| `entidad_tipo` | string | No | Nombre de la entidad afectada ('Usuario') |
| `entidad_id` | string | No | ID del registro afectado |
| `modulo` | string | No | Módulo del sistema donde ocurrió la acción |
| `estado_envio` | string | No | Estado de la operación (éxito/fallo) |
| `mensaje_error` | string | No | Mensaje de error en caso de fallo |
| `intentos` | number | No | Número de intentos (si aplica) |

### Estructura de Datos Adicionales

Para acciones complejas, se incluye un objeto JSON en el campo `descripcion` con la siguiente estructura:

```typescript
{
  "accion": "Tipo de acción (CREAR, ACTUALIZAR, ELIMINAR, CONSULTAR)",
  "entidad": "Usuario",
  "entidadId": "ID del usuario afectado",
  "usuarioId": "ID del usuario que realiza la acción",
  "ipOrigen": "Dirección IP del solicitante",
  "userAgent": "Información del navegador/dispositivo",
  "datosAnteriores": { /* Estado anterior del registro */ },
  "nuevosDatos": { /* Nuevo estado del registro */ },
  "metadatos": { /* Información adicional específica de la acción */ }
}
```

### Campos Sensibles

Los siguientes campos nunca se registran en los logs de auditoría:
- Contraseñas en texto plano
- Tokens de acceso
- Información de autenticación sensible
- Números de identificación personal completos
- Información financiera o de pago

## Flujo de Auditoría

### 1. Registro de auditoria de endpoints


#### 1.3. Reenvío de Verificación (`POST /api/usuarios/reenviar-verificacion`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario si está autenticado, de lo contrario `null` |
| `accion` | `USUARIO_REENVIO_VERIFICACION` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la solicitud (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario si se identifica, de lo contrario `null` |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |
| `intentos` | Número de intentos recientes desde esta IP |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "SOLICITUD",
  "entidad": "Usuario",
  "entidadId": "550e8400-e29b-41d4-a716-446655440000",
  "usuarioId": null,
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "tipo_verificacion": "registro",
    "email_destino": "us***@ejemplo.com",
    "token": {
      "nuevo": true,
      "hash": "a1b2c3..."
    },
    "metodo_envio": "email",
    "limites": {
      "max_intentos": 3,
      "ventana_tiempo_minutos": 60,
      "limite_alcanzado": false,
      "intentos_recientes": 1
    },
    "seguridad": {
      "ip_restringida": false,
      "user_agent_verificado": true
    }
  },
  "resultado": {
    "estado": "enviado",
    "fecha_envio": "2025-06-07T22:35:00.000Z",
    "canal_utilizado": "email"
  }
}
```

**Campos sensibles**:
- `email_destino`: Se enmascara parcialmente
- `token.raw`: No se registra el token original, solo su hash
- Direcciones IP se registran completas pero se anonimizan en reportes

**Notas de seguridad**:
- No se revela si el email existe en el sistema
- Se aplican límites de tasa (rate limiting) por IP
- Los tokens anteriores se invalidan al generar uno nuevo
- Se registra el dispositivo y ubicación para análisis de seguridad
- Se mantiene un registro de intentos para prevenir abusos

#### 1.4. Autenticación Social (`GET /api/auth/google`, `/facebook`, `/instagram`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario si ya existe, de lo contrario `null` |
| `accion` | `AUTENTICACION_SOCIAL_INICIADA`<br>`AUTENTICACION_SOCIAL_COMPLETADA`<br>`AUTENTICACION_SOCIAL_FALLIDA` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la operación (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario si existe, de lo contrario `null` |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |
| `intentos` | Número de intentos recientes desde esta IP |

**Estructura del campo `descripcion` para `AUTENTICACION_SOCIAL_INICIADA`:**

```json
{
  "accion": "INICIO",
  "entidad": "Usuario",
  "proveedor": "google",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "scopes_solicitados": ["profile", "email"],
    "estado_sesion": "iniciando",
    "dispositivo": {
      "tipo": "mobile",
      "navegador": "Chrome Mobile",
      "sistema_operativo": "Android 13"
    },
    "parametros": {
      "redirect_uri": "/dashboard",
      "prompt": "select_account"
    }
  }
}
```

**Estructura del campo `descripcion` para `AUTENTICACION_SOCIAL_COMPLETADA`:**

```json
{
  "accion": "AUTENTICACION_COMPLETA",
  "entidad": "Usuario",
  "entidadId": "550e8400-e29b-41d4-a716-446655440000",
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "proveedor": "google",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "nuevosDatos": {
    "ultimo_inicio_sesion": "2025-06-07T22:40:00.000Z",
    "proveedor_oauth": "google",
    "email_verificado": true
  },
  "metadatos": {
    "nuevo_registro": false,
    "scopes_otorgados": ["profile", "email"],
    "dispositivo": {
      "tipo": "mobile",
      "navegador": "Chrome Mobile",
      "sistema_operativo": "Android 13"
    },
    "oauth": {
      "id": "g1234567890",
      "email_verificado": true,
      "avatar_url": "https://..."
    }
  }
}
```

**Estructura del campo `descripcion` para `AUTENTICACION_SOCIAL_FALLIDA`:**

```json
{
  "accion": "ERROR_AUTENTICACION",
  "entidad": "Usuario",
  "proveedor": "google",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "codigo_error": "auth/account-exists-with-different-credential",
    "mensaje_error": "Ya existe una cuenta con el mismo correo electrónico",
    "email_asociado": "us***@ejemplo.com",
    "intentos_recientes": 1,
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Firefox",
      "sistema_operativo": "Windows 10"
    },
    "causa": "EMAIL_YA_EN_USO"
  }
}
```

**Campos sensibles**:
- `oauth.id`: Se enmascara parcialmente
- `email_asociado`: Se enmascara parcialmente
- No se registran tokens de acceso ni de actualización
- Se evita registrar información personal sensible

**Notas de seguridad**:
- Se registra el inicio y finalización del flujo OAuth
- Se validan los dominios de redirección permitidos
- Se implementa protección CSRF para flujos OAuth
- Se registran todos los intentos fallidos para detección de abuso
- Se aplican límites de tasa (rate limiting) por IP y cuenta
- Se invalidan códigos de autorización después de su uso

#### 1.6. Recuperación de Contraseña

##### 1.6.1. Solicitud de Recuperación (`POST /api/auth/forgot-password`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario si existe, de lo contrario `null` |
| `accion` | `SOLICITUD_RECUPERACION_CONTRASENA` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la solicitud (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario si existe, de lo contrario `null` |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |
| `intentos` | Número de intentos recientes para este email |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "SOLICITUD_RECUPERACION",
  "entidad": "Usuario",
  "entidadId": "550e8400-e29b-41d4-a716-446655440000",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "email_solicitado": "us***@ejemplo.com",
    "token": {
      "nuevo": true,
      "hash": "a1b2c3...",
      "expiracion": "2025-06-07T23:40:00.000Z"
    },
    "limites": {
      "max_intentos_por_hora": 3,
      "intentos_restantes": 2,
      "limite_alcanzado": false
    },
    "seguridad": {
      "ip_restringida": false,
      "user_agent_verificado": true
    }
  },
  "resultado": {
    "estado": "enviado",
    "metodo_envio": "email",
    "fecha_envio": "2025-06-07T22:40:00.000Z"
  }
}
```

##### 1.6.2. Restablecimiento de Contraseña (`POST /api/auth/reset-password`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario asociado al token |
| `accion` | `RESTABLECIMIENTO_CONTRASENA` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del restablecimiento (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "RESTABLECIMIENTO",
  "entidad": "Usuario",
  "entidadId": "550e8400-e29b-41d4-a716-446655440000",
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "token_utilizado": {
      "hash": "a1b2c3...",
      "valido": true,
      "expirado": false,
      "usado_anteriormente": false
    },
    "seguridad": {
      "fuerza_contrasena": "fuerte",
      "es_reutilizada": false,
      "dispositivo": {
        "tipo": "desktop",
        "navegador": "Chrome",
        "sistema_operativo": "Windows 10"
      }
    }
  },
  "resultado": {
    "estado": "exito",
    "contrasena_actualizada": true,
    "fecha_actualizacion": "2025-06-07T22:45:00.000Z",
    "sesiones_antiguas_invalidadas": true
  }
}
```

**Casos de Error**

1. **Token Inválido** (`INTENTO_RECUPERACION_INVALIDO`):
   ```json
   {
     "accion": "ERROR_RESTABLECIMIENTO",
     "entidad": "Usuario",
     "ipOrigen": "192.168.1.100",
     "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
     "metadatos": {
       "codigo_error": "TOKEN_INVALIDO",
       "mensaje_error": "El token de recuperación no es válido",
       "token_proporcionado": "***",
       "intentos_recientes": 1
     },
     "resultado": {
       "estado": "fallo",
       "razon": "token_invalido"
     }
   }
   ```

2. **Token Expirado** (`INTENTO_RECUPERACION_CADUCADO`):
   ```json
   {
     "accion": "ERROR_RESTABLECIMIENTO",
     "entidad": "Usuario",
     "ipOrigen": "192.168.1.100",
     "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
     "metadatos": {
       "codigo_error": "TOKEN_EXPIRADO",
       "mensaje_error": "El token de recuperación ha expirado",
       "token_proporcionado": "***",
       "fecha_expiracion": "2025-06-07T22:30:00.000Z",
       "tiempo_expirado_minutos": 25
     },
     "resultado": {
       "estado": "fallo",
       "razon": "token_expirado"
     }
   }
   ```

**Campos sensibles**:
- `token_proporcionado`: Se enmascara completamente
- `email_solicitado`: Se enmascara parcialmente
- No se registra la nueva contraseña en ningún momento
- Se evita registrar información personal sensible

**Notas de seguridad**:
- No se revela si el email existe en el sistema
- Se aplican límites de tasa (rate limiting) por IP y email
- Los tokens expiran después de 1 hora
- Se invalidan todos los tokens anteriores al generar uno nuevo
- Se registran todos los intentos fallidos para detección de abuso
- Se requiere confirmación de email antes de permitir el restablecimiento
- Se fuerza el cierre de sesión en todos los dispositivos tras el cambio de contraseña

#### 1.7. Inicio de Sesión (`POST /api/auth/login`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario si la autenticación es exitosa, de lo contrario `null` |
| `accion` | `INICIO_SESION` (éxito) o `INTENTO_INICIO_SESION_FALLIDO` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del intento (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario si se identifica, de lo contrario `null` |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la autenticación falla |
| `intentos` | Número de intentos recientes desde esta IP/email |

**Estructura del campo `descripcion` para inicio de sesión exitoso:**

```json
{
  "accion": "INICIO_SESION",
  "entidad": "Usuario",
  "entidadId": "550e8400-e29b-41d4-a716-446655440000",
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "autenticacion": {
      "metodo": "email",
      "factor_doble": false,
      "recordar_sesion": true,
      "dispositivo_anterior": false
    },
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10",
      "es_movil": false,
      "es_tablet": false,
      "es_bot": false
    },
    "ubicacion": {
      "pais": "Ecuador",
      "ciudad": "Quito",
      "region": "Pichincha",
      "codigo_pais": "EC",
      "es_ip_publica": true
    },
    "seguridad": {
      "nivel_riesgo": "bajo",
      "es_ip_sospechosa": false,
      "es_dispositivo_conocido": true,
      "es_ubicacion_conocida": true
    }
  },
  "resultado": {
    "estado": "exito",
    "fecha_acceso": "2025-06-07T23:00:00.000Z",
    "token_creado": true,
    "sesion_id": "sess_abc123xyz456"
  }
}
```

**Estructura del campo `descripcion` para intento fallido:**

```json
{
  "accion": "INTENTO_INICIO_SESION",
  "entidad": "Usuario",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "intento": {
      "identificador": "usuario@ejemplo.com",
      "tipo_identificador": "email",
      "factor_doble_requerido": false,
      "razon_fallo": "credenciales_invalidas"
    },
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10",
      "es_movil": false,
      "es_tablet": false,
      "es_bot": false
    },
    "limites": {
      "intentos_restantes": 2,
      "max_intentos": 5,
      "bloqueo_temporal": false,
      "tiempo_restante_bloqueo": 0
    },
    "seguridad": {
      "nivel_riesgo": "medio",
      "es_ataque_fuerza_bruta": false,
      "ip_en_lista_negra": false,
      "user_agent_sospechoso": false
    }
  },
  "resultado": {
    "estado": "fallo",
    "codigo_error": "CREDENCIALES_INVALIDAS",
    "mensaje_usuario": "Usuario o contraseña incorrectos",
    "fecha_intento": "2025-06-07T23:01:30.000Z"
  }
}
```

**Campos sensibles**:
- `intento.contrasena`: No se registra nunca
- `token`: Solo se registra el ID de sesión, no el token JWT
- `identificador`: Se enmascara si es un email o teléfono
- No se registra información personal sensible

**Notas de seguridad**:
- Se implementa límite de intentos fallidos por IP y cuenta
- Se detectan patrones de ataque de fuerza bruta
- Se registra la ubicación geográfica aproximada
- Se notifica al usuario sobre inicios de sesión exitosos desde nuevas ubicaciones
- Se mantiene un registro de dispositivos conocidos
- Se aplica bloqueo temporal después de múltiples intentos fallidos
- Se registra la información del dispositivo para análisis de seguridad
- Se implementa protección contra enumeración de usuarios token

#### 1.8. Renovación de Token (`POST /api/auth/refresh-token`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario asociado al token de actualización |
| `accion` | `RENOVACION_TOKEN` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la renovación (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Sesion` |
| `entidad_id` | ID de la sesión |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |

**Estructura del campo `descripcion` para renovación exitosa:**

```json
{
  "accion": "RENOVACION_TOKEN",
  "entidad": "Sesion",
  "entidadId": "sess_abc123xyz456",
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "tokens": {
      "token_anterior": {
        "id": "refresh_old123",
        "expiracion": "2025-06-08T10:00:00.000Z"
      },
      "nuevo_token": {
        "id": "refresh_new456",
        "expiracion": "2025-06-15T09:45:00.000Z"
      },
      "duracion_renovacion_horas": 168
    },
    "dispositivo": {
      "tipo": "mobile",
      "navegador": "Safari",
      "sistema_operativo": "iOS 16",
      "es_movil": true,
      "es_tablet": false,
      "es_bot": false
    },
    "seguridad": {
      "es_renovacion_valida": true,
      "es_dispositivo_conocido": true,
      "es_ubicacion_conocida": true,
      "tiempo_inactividad_minutos": 15
    }
  },
  "resultado": {
    "estado": "exito",
    "fecha_renovacion": "2025-06-08T09:45:00.000Z",
    "proxima_renovacion": "2025-06-15T09:45:00.000Z"
  }
}
```

**Estructura del campo `descripcion` para renovación fallida:**

```json
{
  "accion": "ERROR_RENOVACION_TOKEN",
  "entidad": "Sesion",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "token_solicitado": {
      "id": "refresh_invalid123",
      "estado": "invalido",
      "razon": "token_revocado"
    },
    "dispositivo": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "seguridad": {
      "nivel_riesgo": "alto",
      "es_posible_ataque": true,
      "acciones_tomadas": ["revocar_todos_los_tokens"]
    }
  },
  "resultado": {
    "estado": "fallo",
    "codigo_error": "TOKEN_INVALIDO",
    "mensaje_usuario": "La sesión ha expirado. Por favor inicie sesión nuevamente.",
    "fecha_error": "2025-06-08T10:15:00.000Z"
  }
}
```

**Casos de Error Comunes**

1. **Token Revocado** (`TOKEN_REVOCADO`):
   ```json
   {
     "accion": "ERROR_RENOVACION_TOKEN",
     "entidad": "Sesion",
     "ipOrigen": "192.168.1.100",
     "metadatos": {
       "token_solicitado": {
         "id": "refresh_revoked123",
         "estado": "revocado",
         "fecha_revocacion": "2025-06-07T15:30:00.000Z",
         "razon": "cierre_sesion_usuario"
       },
       "seguridad": {
         "nivel_riesgo": "medio",
         "acciones_tomadas": ["invalidar_sesion"]
       }
     },
     "resultado": {
       "estado": "fallo",
       "codigo_error": "TOKEN_REVOCADO",
       "mensaje_usuario": "Esta sesión ha sido cerrada. Por favor inicie sesión nuevamente."
     }
   }
   ```

2. **Token Expirado** (`TOKEN_EXPIRADO`):
   ```json
   {
     "accion": "ERROR_RENOVACION_TOKEN",
     "entidad": "Sesion",
     "ipOrigen": "192.168.1.100",
     "metadatos": {
       "token_solicitado": {
         "id": "refresh_expired123",
         "estado": "expirado",
         "fecha_expiracion": "2025-06-07T10:00:00.000Z",
         "tiempo_expirado_horas": 24.5
       },
       "seguridad": {
         "nivel_riesgo": "bajo",
         "acciones_tomadas": []
       }
     },
     "resultado": {
       "estado": "fallo",
       "codigo_error": "TOKEN_EXPIRADO",
       "mensaje_usuario": "La sesión ha expirado por inactividad. Por favor inicie sesión nuevamente."
     }
   }
   ```

**Campos sensibles**:
- `token_solicitado.valor`: No se registra nunca
- `nuevo_token.valor`: No se registra nunca
- Se registran solo los IDs de los tokens, no los valores reales
- No se registra información personal sensible

**Notas de seguridad**:
- Se implementa rotación de tokens de actualización
- Se revocan todos los tokens anteriores al generar uno nuevo
- Se registra la información del dispositivo y ubicación
- Se implementa detección de patrones sospechosos
- Se notifica al usuario sobre renovaciones desde nuevos dispositivos
- Se mantiene un registro de todas las sesiones activas
- Se permite la revocación remota de sesiones

### 2. Gestión de Usuarios


#### 2.3. Cambio de Contraseña (`PUT /api/usuarios/me/cambiar-password`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que cambia la contraseña |
| `accion` | `CAMBIO_PASSWORD` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del cambio (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario |
| `modulo` | `seguridad` |
| `estado_envio` | `exito` o `fallo` |

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
    "seguridad": {
      "fuerza_contrasena": "fuerte",
      "es_reutilizada": false,
      "longitud": 12,
      "contiene_mayusculas": true,
      "contiene_numeros": true,
      "contiene_simbolos": true
    }
  },
  "resultado": {
    "estado": "exito",
    "fecha_cambio": "2025-06-07T23:30:00.000Z",
    "sesiones_invalidadas": true
  }
}
```

**Campos sensibles**:
- `contrasena_anterior`: No se registra
- `nueva_contrasena`: No se registra
- `token_recuperacion`: No se registra

**Notas de seguridad**:
- Validación de contraseña segura
- Verificación de contraseña anterior
- Invalidación de sesiones existentes
- Notificación al usuario por correo electrónico


### 3. Administración de Sesiones

#### 3.1. Cierre de Sesión (`POST /api/auth/logout`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que cierra sesión |
| `accion` | `CIERRE_SESION` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de cierre (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Sesion` |
| `entidad_id` | ID de la sesión cerrada |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "CIERRE_SESION",
  "entidad": "Sesion",
  "entidadId": "sesion-id",
  "usuarioId": "usuario-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "dispositivo": {
      "tipo": "mobile",
      "navegador": "Safari",
      "sistema_operativo": "iOS 15"
    },
    "sesion": {
      "fecha_inicio": "2025-06-07T10:30:00.000Z",
      "duracion_minutos": 120,
      "ubicacion": {
        "pais": "Ecuador",
        "ciudad": "Quito",
        "region": "Pichincha"
      }
    }
  },
  "resultado": {
    "estado": "exito",
    "fecha_cierre": "2025-06-07T12:30:00.000Z",
    "token_revocado": true
  }
}
```

**Campos sensibles**:
- `token`: Solo se registra el ID del token, no su valor
- Direcciones IP completas se registran pero se anonimizan en reportes

**Notas de seguridad**:
- Invalida el token de refresco
- Registra la duración de la sesión
- Mantiene registro del dispositivo y ubicación

#### 3.2. Cierre de Sesión Global (`POST /api/auth/logout-all`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que cierra las sesiones |
| `accion` | `CIERRE_SESION_GLOBAL` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del cierre (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario |
| `modulo` | `seguridad` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "CIERRE_SESION_GLOBAL",
  "entidad": "Usuario",
  "entidadId": "usuario-id",
  "usuarioId": "usuario-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "dispositivo_actual": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "exclusiones": ["sesion-actual-id"]
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-08T01:00:00.000Z",
    "sesiones_cerradas": 3,
    "tokens_revocados": 3,
    "dispositivos_afectados": [
      {
        "tipo": "mobile",
        "sistema_operativo": "Android",
        "ultima_actividad": "2025-06-07T23:45:00.000Z"
      },
      {
        "tipo": "tablet",
        "sistema_operativo": "iOS",
        "ultima_actividad": "2025-06-07T22:30:00.000Z"
      }
    ]
  }
}
```

**Campos sensibles**:
- Solo se registran metadatos de dispositivos, no información personal
- No se registran tokens completos

**Notas de seguridad**:
- Invalida todos los tokens de refresco excepto el actual
- Notifica al usuario por correo electrónico
- Registra todos los dispositivos afectados
- Permite exclusión de la sesión actual

#### 3.3. Revocación de Tokens (`POST /api/auth/revoke-tokens`)

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
- Se registra el motivo de la revocación
- Se mantiene registro de todas las revocaciones
- Se notifica al usuario por correo electrónico

### 4. Recuperación de Cuenta

#### 4.1. Solicitud de Recuperación (`POST /api/auth/forgot-password`)
- **Acción**: `SOLICITUD_RECUPERACION`
- **Datos registrados**:
  - Email solicitado
  - IP de origen
  - User-Agent
  - Estado de la solicitud

#### 4.2. Restablecimiento de Contraseña (`POST /api/auth/reset-password`)
- **Acción**: `RESTABLECIMIENTO_PASSWORD`
- **Datos registrados**:
  - ID de usuario
  - IP de origen
  - Estado de la operación
  - No se registra la nueva contraseña

### 5. Gestión de Cuenta

### 4. Recuperación de Cuenta

#### 4.1. Solicitud de Recuperación (`POST /api/auth/forgot-password`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario si existe, de lo contrario `null` |
| `accion` | `SOLICITUD_RECUPERACION_CONTRASENA` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora de la solicitud (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario si existe, de lo contrario `null` |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |
| `mensaje_error` | Mensaje de error si la operación falla |
| `intentos` | Número de intentos recientes para este email |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "SOLICITUD_RECUPERACION",
  "entidad": "Usuario",
  "entidadId": "550e8400-e29b-41d4-a716-446655440000",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "email_solicitado": "us***@ejemplo.com",
    "token": {
      "nuevo": true,
      "hash": "a1b2c3...",
      "expiracion": "2025-06-07T23:40:00.000Z"
    },
    "limites": {
      "max_intentos_por_hora": 3,
      "intentos_restantes": 2,
      "limite_alcanzado": false
    },
    "seguridad": {
      "ip_restringida": false,
      "user_agent_verificado": true
    }
  },
  "resultado": {
    "estado": "enviado",
    "metodo_envio": "email",
    "fecha_envio": "2025-06-07T22:40:00.000Z"
  }
}
```

**Campos sensibles**:
- `email_solicitado`: Se enmascara parcialmente
- `token.valor`: No se registra el token real, solo su hash
- No se revela si el email existe en el sistema

**Notas de seguridad**:
- No se revela si el email existe en el sistema
- Se aplican límites de tasa (rate limiting) por IP y email
- Los tokens expiran después de 1 hora
- Se invalidan tokens anteriores al generar uno nuevo
- Se registran todos los intentos para detección de abuso

#### 4.2. Restablecimiento de Contraseña (`POST /api/auth/reset-password`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario asociado al token |
| `accion` | `RESTABLECIMIENTO_CONTRASENA` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del restablecimiento (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario |
| `modulo` | `autenticacion` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "RESTABLECIMIENTO",
  "entidad": "Usuario",
  "entidadId": "550e8400-e29b-41d4-a716-446655440000",
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "token_utilizado": {
      "hash": "a1b2c3...",
      "valido": true,
      "expirado": false,
      "usado_anteriormente": false
    },
    "seguridad": {
      "fuerza_contrasena": "fuerte",
      "es_reutilizada": false,
      "dispositivo": {
        "tipo": "desktop",
        "navegador": "Chrome",
        "sistema_operativo": "Windows 10"
      }
    }
  },
  "resultado": {
    "estado": "exito",
    "contrasena_actualizada": true,
    "fecha_actualizacion": "2025-06-07T22:45:00.000Z",
    "sesiones_antiguas_invalidadas": true
  }
}
```

**Casos de Error**

1. **Token Inválido** (`INTENTO_RECUPERACION_INVALIDO`):
   ```json
   {
     "accion": "ERROR_RESTABLECIMIENTO",
     "entidad": "Usuario",
     "ipOrigen": "192.168.1.100",
     "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
     "metadatos": {
       "codigo_error": "TOKEN_INVALIDO",
       "mensaje_error": "El token de recuperación no es válido",
       "token_proporcionado": "***",
       "intentos_recientes": 1
     },
     "resultado": {
       "estado": "fallo",
       "razon": "token_invalido"
     }
   }
   ```

2. **Token Expirado** (`INTENTO_RECUPERACION_CADUCADO`):
   ```json
   {
     "accion": "ERROR_RESTABLECIMIENTO",
     "entidad": "Usuario",
     "ipOrigen": "192.168.1.100",
     "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
     "metadatos": {
       "codigo_error": "TOKEN_EXPIRADO",
       "mensaje_error": "El token de recuperación ha expirado",
       "token_proporcionado": "***",
       "fecha_expiracion": "2025-06-07T22:30:00.000Z",
       "tiempo_expirado_minutos": 25
     },
     "resultado": {
       "estado": "fallo",
       "razon": "token_expirado"
     }
   }
   ```

**Campos sensibles**:
- `token_proporcionado`: Se enmascara completamente
- `nueva_contrasena`: No se registra nunca
- `token_recuperacion`: No se registra nunca
- Se evita registrar información personal sensible

**Notas de seguridad**:
- Se valida la fortaleza de la nueva contraseña
- Se verifica que el token sea válido y no haya expirado
- Se invalidan todas las sesiones activas del usuario
- Se notifica al usuario por correo electrónico
- Se registra el dispositivo y ubicación del restablecimiento


### 6. Gestión de Sesiones

#### 6.1. Cierre de Sesión Global (`POST /api/auth/logout-all`)

**Audit Log Entry**

| Campo | Valor |
|-------|-------|
| `usuarioId` | ID del usuario que cierra las sesiones |
| `accion` | `CIERRE_SESION_GLOBAL` |
| `descripcion` | Ver estructura JSON abajo |
| `fecha` | Fecha y hora del cierre (UTC) |
| `ip` | Dirección IP del solicitante |
| `entidad_tipo` | `Usuario` |
| `entidad_id` | ID del usuario |
| `modulo` | `seguridad` |
| `estado_envio` | `exito` o `fallo` |

**Estructura del campo `descripcion`:**

```json
{
  "accion": "CIERRE_SESION_GLOBAL",
  "entidad": "Usuario",
  "entidadId": "usuario-id",
  "usuarioId": "usuario-id",
  "ipOrigen": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "metadatos": {
    "dispositivo_actual": {
      "tipo": "desktop",
      "navegador": "Chrome",
      "sistema_operativo": "Windows 10"
    },
    "exclusiones": ["sesion-actual-id"],
    "seguridad": {
      "es_autoservicio": true,
      "dispositivo_actual_excluido": true
    }
  },
  "resultado": {
    "estado": "exito",
    "fecha_operacion": "2025-06-08T02:00:00.000Z",
    "sesiones_cerradas": 3,
    "tokens_revocados": 3,
    "dispositivos_afectados": [
      {
        "tipo": "mobile",
        "sistema_operativo": "Android",
        "ultima_actividad": "2025-06-07T23:45:00.000Z",
        "ubicacion": "Quito, Ecuador"
      },
      {
        "tipo": "tablet",
        "sistema_operativo": "iOS",
        "ultima_actividad": "2025-06-07T22:30:00.000Z",
        "ubicacion": "Guayaquil, Ecuador"
      }
    ]
  }
}
```

**Campos sensibles**:
- Solo se registran metadatos de dispositivos, no información personal
- No se registran tokens completos
- Se anonimizan direcciones IP en reportes

**Notas de seguridad**:
- Invalida todos los tokens de refresco excepto el actual
- Notifica al usuario por correo electrónico
- Registra todos los dispositivos afectados
- Permite exclusión de la sesión actual
- Se puede configurar para requerir autenticación adicional
- Mantiene registro de ubicaciones de dispositivos

### 7. Seguridad Avanzada

#### 6.1. Verificación en Dos Pasos (`POST /api/auth/verificar-2fa`)
- **Acción**: `VERIFICACION_2FA`
- **Datos registrados**:
  - ID de usuario
  - Tipo de verificación (SMS/App)
  - Estado (éxito/fallo)
  - IP de origen
  - Dispositivo



### Campos Comunes en Todos los Registros

Cada entrada en el log de auditoría incluye:
- **ID único**: Identificador único del registro
- **Timestamp**: Fecha y hora exacta de la acción (UTC)
- **ID de Usuario**: Usuario que realizó la acción
- **ID de Sesión**: Identificador de la sesión
- **Dirección IP**: Origen de la solicitud
- **User-Agent**: Información del navegador/dispositivo
- **Acción**: Tipo de acción realizada
- **Entidad Afectada**: Tabla o recurso principal
- **ID de Entidad**: Identificador del recurso afectado
- **Metadatos**: Información adicional específica de la acción
- **Estado**: Éxito o fallo de la operación

### Retención y Almacenamiento

- Los registros de auditoría se almacenan de forma segura y cifrada
- Período de retención: 365 días
- Rotación automática: Diaria para registros detallados, mensual para resúmenes
- Los registros antiguos se archivan automáticamente
- Solo personal autorizado puede acceder a los registros de auditoría

## Seguimiento de Seguridad

### Registro de Intentos Fallidos
Se registran todos los intentos fallidos de autenticación con la siguiente información:
- Dirección IP del solicitante
- User-Agent del navegador/dispositivo
- Timestamp del intento
- Nombre de usuario proporcionado (si existe)
- Razón del fallo (credenciales incorrectas, cuenta bloqueada, etc.)

### Notificaciones de Seguridad
Se generan notificaciones automáticas para:
- Inicios de sesión exitosos desde nuevas ubicaciones/dispositivos
- Intentos de cambio de contraseña
- Actualizaciones de información sensible
- Actividades sospechosas detectadas

## Monitoreo de Seguridad
- Se generan alertas automáticas para actividades sospechosas:
  - Múltiples intentos fallidos de inicio de sesión
  - Cambios en roles o permisos
  - Acceso desde ubicaciones inusuales
  - Patrones de actividad inusuales

## Integración con el Sistema de Notificaciones

- Se envían notificaciones a los administradores para acciones críticas:
  - Creación de cuentas con privilegios elevados
  - Cambios en la información de autenticación
  - Intentos de acceso no autorizados
