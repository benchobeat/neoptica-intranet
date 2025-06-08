# Integración con Servicios Externos - [NOMBRE_DEL_MODELO]

## Visión General

Este documento detalla la integración del modelo [NOMBRE_DEL_MODELO] con servicios externos, incluyendo APIs de terceros, proveedores de autenticación y otros sistemas complementarios.

## Servicios Integrados

### 1. Proveedor de Autenticación (Auth0/Keycloak)

#### Configuración

```javascript
const authConfig = {
  domain: 'tu-dominio.auth0.com',
  clientId: 'tu-client-id',
  audience: 'https://api.tudominio.com',
  scope: 'read:current_user update:current_user_metadata',
  callbackUrl: `${window.location.origin}/callback`
};
```

#### Flujo de Autenticación

1. **Inicio de Sesión**
   - Redirección al proveedor de identidad
   - Autorización de permisos
   - Intercambio de código por tokens

2. **Gestión de Tokens**
   - Almacenamiento seguro
   - Renovación automática
   - Validación de firma

### 2. Servicio de Notificaciones (SendGrid/Twilio)

#### Configuración

```env
NOTIFICATION_PROVIDER=sendgrid
SENDGRID_API_KEY=tu-api-key
TWILIO_ACCOUNT_SID=tu-sid
TWILIO_AUTH_TOKEN=tu-token
DEFAULT_SENDER=notificaciones@tudominio.com
```

#### Plantillas de Notificación

```handlebars
<!-- email/bienvenida.hbs -->
<div>
  <h1>Bienvenido, {{nombre}}!</h1>
  <p>Gracias por registrarte en nuestro servicio.</p>
  {{#if urlActivacion}}
    <a href="{{urlActivacion}}">Activar cuenta</a>
  {{/if}}
</div>
```

### 3. Almacenamiento en la Nube (AWS S3/Google Cloud Storage)

#### Configuración

```javascript
const storageConfig = {
  provider: process.env.STORAGE_PROVIDER || 's3',
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET_NAME
  },
  gcs: {
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GCP_KEY_FILE,
    bucket: process.env.GCS_BUCKET_NAME
  }
};
```

#### Operaciones Principales

```typescript
interface StorageService {
  upload(file: Buffer, path: string, metadata?: object): Promise<string>;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;
  delete(path: string): Promise<void>;
  move(source: string, destination: string): Promise<void>;
}
```

## Patrones de Integración

### Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure: Date | null = null;
  private readonly threshold: number;
  private readonly resetTimeout: number;
  
  constructor(threshold = 5, resetTimeout = 60000) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Service unavailable (circuit breaker open)');
    }
    
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  private isOpen(): boolean {
    if (this.failures >= this.threshold) {
      if (this.lastFailure && 
          Date.now() - this.lastFailure.getTime() > this.resetTimeout) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }
  
  private recordSuccess(): void {
    this.failures = 0;
    this.lastFailure = null;
  }
  
  private recordFailure(): void {
    this.failures++;
    this.lastFailure = new Date();
  }
  
  private reset(): void {
    this.failures = 0;
    this.lastFailure = null;
  }
}
```

### Retry con Backoff Exponencial

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) break;
      
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

## Seguridad

### Gestión de Secretos

```bash
# Usando HashiCorp Vault
export DATABASE_PASSWORD=$(vault read -field=password secret/database)
```

### Rotación de Credenciales

1. **Programada**
   - Rotación automática cada 90 días
   - Notificación al equipo 15 días antes
   
2. **Por Evento**
   - Rotación inmediata en caso de compromiso
   - Invalidación de tokens antiguos

## Monitoreo

### Métricas Clave

| Métrica | Umbral de Alerta | Acción |
|---------|------------------|--------|
| Tiempo de respuesta > 1s | > 5s | Investigar cuello de botella |
| Tasa de error > 1% | > 5% | Revisar logs del servicio |
| Uso de memoria > 80% | > 90% | Escalar recursos |

### Dashboard de Monitoreo

```json
{
  "title": "Estado de Servicios Externos",
  "panels": [
    {
      "title": "Disponibilidad",
      "type": "gauge",
      "queries": [
        "SELECT availability FROM services WHERE name='auth'"
      ]
    },
    {
      "title": "Tiempo de Respuesta",
      "type": "timeseries",
      "queries": [
        "SELECT response_time FROM http_requests WHERE endpoint='*'"
      ]
    }
  ]
}
```

## Pruebas

### Pruebas de Integración

```javascript
describe('Integración con Servicio de Notificaciones', () => {
  let notificationService;
  
  beforeAll(() => {
    // Configurar mock del servicio
    nock('https://api.sendgrid.com')
      .post('/v3/mail/send')
      .reply(202, { success: true });
    
    notificationService = new NotificationService();
  });
  
  test('debe enviar correo electrónico correctamente', async () => {
    const result = await notificationService.sendEmail({
      to: 'usuario@ejemplo.com',
      subject: 'Prueba',
      template: 'bienvenida',
      data: { nombre: 'Usuario' }
    });
    
    expect(result).toBeTruthy();
    expect(result.success).toBe(true);
  });
});
```

### Pruebas de Carga

```javascript
const { group } = require('k6');
const http = require('k6/http');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  group('API de Autenticación', function () {
    const response = http.post('https://api.tudominio.com/auth/login', {
      username: 'test_user',
      password: 'password123',
    });
    
    // Verificaciones
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response has token': (r) => r.json().hasOwnProperty('token'),
    });
  });
}
```

## Documentación de la API

### Autenticación

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

### Endpoints

```yaml
/notifications:
  post:
    summary: Enviar notificación
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/NotificationRequest'
    responses:
      '202':
        description: Notificación aceptada para procesar
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NotificationResponse'
      '429':
        description: Demasiadas solicitudes
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'
```

## Mantenimiento

### Actualizaciones Programadas

| Servicio | Frecuencia | Ventana | Contacto |
|----------|------------|---------|----------|
| Auth0 | Mensual | 1er domingo 2:00-4:00 | soporte@auth0.com |
| SendGrid | Trimestral | 2do sábado 1:00-3:00 | soporte@sendgrid.com |
| AWS S3 | Según necesario | 3:00-5:00 | aws-support@tudominio.com |

### Procedimiento de Actualización

1. **Preparación**
   - Revisar notas de la versión
   - Probar en entorno de desarrollo
   - Planear rollback

2. **Implementación**
   - Aplicar cambios en staging
   - Monitorear métricas
   - Verificar integración

3. **Verificación**
   - Pruebas de humo
   - Validación de rendimiento
   - Aprobación del equipo

## Resolución de Problemas

### Errores Comunes

| Código de Error | Causa Probable | Solución |
|-----------------|----------------|----------|
| 401 Unauthorized | Token inválido o expirado | Renovar token |
| 429 Too Many Requests | Límite de tasa excedido | Implementar backoff exponencial |
| 503 Service Unavailable | Servicio externo caído | Verificar estado del proveedor |

### Herramientas de Diagnóstico

```bash
# Verificar conectividad
curl -v https://api.servicio-externo.com/health

# Verificar certificados SSL
openssl s_client -connect api.servicio-externo.com:443 -servername api.servicio-externo.com

# Monitorear red
tcpdump -i eth0 -n port 443 -w captura.pcap
```

## Referencias

- [Documentación de Auth0](https://auth0.com/docs/)
- [Guía de API de SendGrid](https://docs.sendgrid.com/api-reference/)
- [AWS SDK para JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Mejores Prácticas de Integración](https://microservices.io/patterns/apigateway.html)
