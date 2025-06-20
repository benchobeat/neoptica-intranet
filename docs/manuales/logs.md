# Módulo de Auditoría y Registros de Actividad

## Modelo de Datos

### 1. Registro de Auditoría (`log_auditoria`)
Modelo centralizado que registra todas las acciones importantes realizadas en el sistema.

#### Campos:
- **id**: Identificador único del registro (UUID)
- **usuarioId**: ID del usuario que realizó la acción (opcional)
- **accion**: Tipo de acción realizada (ej: "CREAR", "ACTUALIZAR", "ELIMINAR", "INICIAR_SESION")
- **descripcion**: Descripción detallada de la acción
- **fecha**: Fecha y hora del registro (por defecto: fecha actual)
- **ip**: Dirección IP desde donde se realizó la acción
- **tipoCorreo**: Tipo de correo electrónico (si aplica)
- **correoDestino**: Dirección de correo electrónico del destinatario (si aplica)
- **usuarioDestino**: ID del usuario destinatario (si aplica)
- **entidadTipo**: Tipo de entidad afectada (ej: "USUARIO", "PRODUCTO", "CITA")
- **entidadId**: ID de la entidad afectada (UUID)
- **estadoEnvio**: Estado del envío (si aplica)
- **mensajeError**: Mensaje de error en caso de fallo
- **enviadoPor**: ID del usuario que realizó el envío (si aplica)
- **origenEnvio**: Origen del envío (si aplica)
- **intentos**: Número de intentos de envío (por defecto: 1)
- **modulo**: Módulo del sistema donde se originó la acción
- **entidadId**: ID alternativo de la entidad (compatibilidad)
- **entidadTipo**: Tipo alternativo de entidad (compatibilidad)
- **movimientoId**: ID del movimiento contable relacionado (si aplica)

#### Relaciones:
- `usuario`: Relación con el usuario que realizó la acción
- `movimiento_contable`: Relación con el movimiento contable relacionado (si aplica)

## Flujos de Auditoría

### 1. Registro de Acciones
1. El sistema detecta una acción que debe ser auditada
2. Se crea un nuevo registro en `log_auditoria` con todos los detalles relevantes
3. Se asocian los metadatos de la acción (usuario, IP, entidad afectada, etc.)
4. El registro queda disponible para consulta y generación de reportes

### 2. Búsqueda y Filtrado
1. Los usuarios con permisos pueden acceder al módulo de auditoría
2. Se aplican filtros según criterios de búsqueda
3. Los resultados se muestran en formato tabular con opciones de ordenamiento
4. Se pueden exportar los resultados a diferentes formatos

## Sistema de Auditoría Centralizada

El sistema implementa un módulo completo de auditoría que registra todas las acciones significativas en la plataforma, asegurando trazabilidad y cumplimiento. La auditoría está centralizada en el módulo `audit.ts` para garantizar consistencia y facilitar el mantenimiento.

### Arquitectura Centralizada

El control de auditoría está centralizado en el archivo `backend/src/utils/audit.ts`, que exporta dos funciones principales:

1. `logSuccess`: Para registrar operaciones exitosas
2. `logError`: Para registrar errores y fallos

### Uso de las Funciones de Auditoría

#### `logSuccess(params: SuccessAuditParams)`

Registra una operación exitosa en el sistema.

**Parámetros:**
- `userId`: ID del usuario que realizó la acción
- `ip`: Dirección IP del solicitante
- `entityType`: Tipo de entidad afectada (ej: 'color', 'marca')
- `entityId`: ID de la entidad afectada
- `module`: Módulo donde ocurrió la acción (ej: 'colorController')
- `action`: Tipo de acción (ej: 'crear_color', 'actualizar_marca')
- `message`: Mensaje descriptivo de la acción
- `details`: (Opcional) Objeto con detalles adicionales

**Ejemplo de Uso:**
```typescript
try {
  // Lógica de negocio exitosa
  await logSuccess({
    userId: req.user.id,
    ip: req.ip,
    entityType: 'color',
    entityId: colorCreado.id,
    module: 'colorController',
    action: 'crear_color',
    message: 'Color creado exitosamente',
    details: {
      nombre: colorCreado.nombre,
      codigoHex: colorCreado.codigoHex
    }
  });
} catch (error) {
  // Manejo de errores...
}
```

#### `logError(params: ErrorAuditParams)`

Registra un error o fallo en el sistema.

**Parámetros adicionales a los de `logSuccess`:**
- `error`: Objeto de error o mensaje de error
- `context`: (Opcional) Contexto adicional para ayudar en la depuración

**Ejemplo de Uso:**
```typescript
try {
  // Código que puede fallar
} catch (error) {
  await logError({
    userId: req.user?.id,
    ip: req.ip,
    entityType: 'color',
    entityId: req.params.id,
    module: 'colorController',
    action: 'actualizar_color',
    message: 'Error al actualizar el color',
    error: error,
    context: {
      datosSolicitud: req.body,
      idSolicitado: req.params.id
    }
  });
  // Manejo del error...
}
```

### Ventajas del Sistema Centralizado

1. **Consistencia**: Todas las operaciones de auditoría siguen el mismo formato
2. **Mantenibilidad**: Los cambios en el formato de auditoría se realizan en un solo lugar
3. **Trazabilidad**: Fácil seguimiento de todas las acciones en el sistema
4. **Rendimiento**: Optimizado para registrar operaciones sin afectar el rendimiento
5. **Flexibilidad**: Fácil de extender con nueva funcionalidad

### Mejores Prácticas

1. **Siempre** usar `logSuccess` después de operaciones exitosas
2. **Siempre** usar `logError` en bloques catch
3. Proporcionar mensajes claros y descriptivos
4. Incluir suficiente contexto para facilitar la depuración
5. No registrar información sensible en los logs
6. Usar nombres de acciones consistentes (ej: `verbo_entidad`)

### Estructura del Log de Auditoría

Cada entrada de auditoría incluye:

```typescript
{
  usuarioId: string;          // ID del usuario
  accion: string;             // Acción realizada
  resultado: 'exitoso' | 'fallido';
  descripcion: {
    mensaje: string;         // Mensaje descriptivo
    timestamp: string;        // Fecha y hora ISO
    detalles?: any;           // Detalles adicionales (opcional)
  };
  ip?: string;               // Dirección IP
  entidadTipo?: string;       // Tipo de entidad afectada
  entidadId?: string;         // ID de la entidad afectada
  modulo?: string;            // Módulo donde ocurrió la acción
}
```

### Ejemplo de Integración en un Controlador

```typescript
import { logSuccess, logError } from '../utils/audit';

class ColorController {
  async crearColor(req: Request, res: Response) {
    try {
      // Validar entrada...
      
      const color = await prisma.color.create({
        data: {
          // ...datos del color
          creadoPor: req.user.id
        }
      });

      // Registrar éxito
      await logSuccess({
        userId: req.user.id,
        ip: req.ip,
        entityType: 'color',
        entityId: color.id,
        module: 'colorController',
        action: 'crear_color',
        message: 'Color creado exitosamente',
        details: {
          nombre: color.nombre,
          codigoHex: color.codigoHex
        }
      });

      return res.status(201).json(color);
    } catch (error) {
      // Registrar error
      await logError({
        userId: req.user?.id,
        ip: req.ip,
        entityType: 'color',
        module: 'colorController',
        action: 'crear_color',
        message: 'Error al crear el color',
        error: error,
        context: {
          datosSolicitud: req.body
        }
      });

      // Manejar el error...
    }
  }
}
```

### Características Principales

1. **Registro Detallado**
   - Acciones de usuarios autenticados
   - Operaciones CRUD en todas las entidades
   - Eventos del sistema importantes
   - Intentos de acceso fallidos

2. **Información Capturada**
   - Usuario responsable
   - Tipo de acción realizada
   - Entidad afectada y su ID
   - Módulo del sistema
   - Dirección IP de origen
   - Marca de tiempo exacta
   - Datos relevantes del cambio

3. **Seguridad**
   - Registros inmutables
   - Control de acceso basado en roles
   - Protección contra manipulaciones
   - Encriptación de datos sensibles

## Gestión de Registros de Auditoría

### Filtros Avanzados

- **Por módulo**: Filtra acciones por área funcional
- **Por usuario**: Consulta acciones de usuarios específicos
- **Por tipo de acción**: Crea, Lee, Actualiza, Elimina
- **Por rango de fechas**: Consulta históricos específicos
- **Por entidad**: Seguimiento de cambios en registros específicos

### Exportación de Datos

- Formato CSV para análisis externos
- Integración con herramientas de BI
- Reportes programados
- Cumplimiento normativo

## Endpoints API

### 1. Gestión de Auditoría

#### GET /api/auditoria
- **Descripción**: Lista paginada de registros de auditoría
- **Autenticación**: Requerida (Rol: admin)
- **Query Params**:
  - `page`: Número de página (default: 1)
  - `limit`: Registros por página (default: 20, max: 100)
  - `modulo`: Filtrar por módulo
  - `usuarioId`: Filtrar por ID de usuario
  - `accion`: Filtrar por tipo de acción
  - `entidadTipo`: Filtrar por tipo de entidad
  - `fechaInicio`: Fecha de inicio (ISO 8601)
  - `fechaFin`: Fecha de fin (ISO 8601)
- **Ejemplo de respuesta (200 OK)**:
  ```json
  {
    "data": [/* ... registros ... */],
    "paginacion": {
      "total": 150,
      "pagina": 1,
      "limite": 20,
      "totalPaginas": 8
    }
  }
  ```

#### GET /api/auditoria/:id
- **Descripción**: Obtiene un registro de auditoría específico
- **Autenticación**: Requerida (Rol: admin)
- **Path Params**:
  - `id`: ID del registro de auditoría (UUID)
- **Respuestas**:
  - 200: Registro encontrado
  - 404: Registro no encontrado
  - 403: No autorizado

#### GET /api/auditoria/modulo/:modulo
- **Descripción**: Filtra registros por módulo del sistema
- **Módulos disponibles**:
  - `auth`: Autenticación y autorización
  - `usuarios`: Gestión de usuarios y permisos
  - `productos`: Catálogo de productos
  - `inventario`: Control de existencias
  - `ventas`: Procesos de venta
  - `colores`: Gestión de colores de productos
  - `marcas`: Gestión de marcas de productos
  - `sucursales`: Gestión de sucursales
  - `auditoria`: Consulta de registros de auditoría

## Ejemplos de Consultas

### Buscar todas las acciones de un usuario específico
```sql
SELECT * FROM log_auditoria 
WHERE usuario_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY fecha DESC;
```

### Buscar acciones recientes en un módulo específico
```sql
SELECT * FROM log_auditoria 
WHERE modulo = 'colorController' 
  AND fecha > NOW() - INTERVAL '7 days'
ORDER BY fecha DESC;
```

### Buscar errores recientes
```sql
SELECT * FROM log_auditoria 
WHERE resultado = 'fallido'
  AND fecha > NOW() - INTERVAL '24 hours'
ORDER BY fecha DESC;
```

### Extraer datos específicos del JSON
```sql
SELECT 
  id,
  fecha,
  usuario_id,
  accion,
  descripcion->>'message' as mensaje,
  descripcion->'context'->>'datosAnteriores' as datos_anteriores
FROM log_auditoria
WHERE entidad_tipo = 'color'
ORDER BY fecha DESC
LIMIT 10;
```
  - `citas`: Agendamiento
  - `configuracion`: Ajustes del sistema

#### GET /api/auditoria/usuario/:id
- **Descripción**: Obtiene el historial de acciones de un usuario
- **Autenticación**: Requerida (Rol: admin o el propio usuario)
- **Path Params**:
  - `id`: ID del usuario (UUID)
- **Notas**:
  - Los usuarios solo pueden ver su propio historial
  - Los administradores pueden ver cualquier historial

### 2. Obtener registros de auditoría
```
GET /api/auditoria/logs
```

**Parámetros de consulta:**
- `usuarioId`: Filtrar por ID de usuario
- `accion`: Filtrar por tipo de acción
- `fecha_desde`: Filtrar por fecha de inicio
- `fecha_hasta`: Filtrar por fecha de fin
- `entidad_tipo`: Filtrar por tipo de entidad
- `entidad_id`: Filtrar por ID de entidad
- `modulo`: Filtrar por módulo del sistema
- `pagina`: Número de página (paginación)
- `limite`: Cantidad de registros por página

**Respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "fecha": "2023-05-15T10:30:00.000Z",
      "accion": "ACTUALIZAR",
      "descripcion": "Actualización de datos del usuario",
      "usuario": {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "nombre_completo": "Juan Pérez",
        "email": "juan.perez@ejemplo.com"
      },
      "entidad_tipo": "USUARIO",
      "entidad_id": "323e4567-e89b-12d3-a456-426614174002",
      "ip": "192.168.1.100",
      "modulo": "Seguridad"
    }
  ],
  "meta": {
    "total": 1,
    "pagina": 1,
    "por_pagina": 10
  }
}
```

## Seguridad y Cumplimiento

### 1. Políticas de Retención
- Los registros de auditoría se conservan por un período mínimo de 5 años
- Los registros antiguos pueden ser archivados en frío para optimizar el rendimiento
- Solo los administradores pueden eliminar registros de auditoría, con registro de la acción

### 2. Control de Acceso
- Solo usuarios con el rol `ADMIN` pueden acceder a los registros completos
- El acceso a información sensible está restringido según el nivel de privilegios
- Todas las consultas a los registros de auditoría quedan registradas

### 3. Cumplimiento Normativo
- El sistema cumple con los requisitos de:
  - Ley de Protección de Datos Personales
  - Regulaciones de salud (historial clínico)
  - Estándares de seguridad de la información (ISO 27001)
  - Requisitos de auditoría financiera

## Reportes

### 1. Reporte de Actividad por Usuario
Muestra un resumen de las acciones realizadas por un usuario en un período determinado.

**Parámetros:**
- ID del usuario
- Fecha de inicio
- Fecha de fin
- Tipo de acción (opcional)

### 2. Reporte de Cambios en Entidades
Lista todos los cambios realizados sobre un tipo específico de entidad.

**Parámetros:**
- Tipo de entidad (ej: "USUARIO", "PRODUCTO")
- ID de la entidad (opcional)
- Fecha de inicio
- Fecha de fin

### 3. Reporte de Seguridad
Identifica patrones de actividad sospechosa o inusual.

**Alertas automáticas para:**
- Múltiples intentos fallidos de inicio de sesión
- Acceso desde ubicaciones inusuales
- Cambios masivos de datos
- Acciones fuera del horario laboral

## Integraciones

### 1. SIEM (Security Information and Event Management)
- Envío de eventos de seguridad a sistemas SIEM centralizados
- Formato estandarizado (CEF, LEEF, JSON)
- Filtrado y priorización de eventos

### 2. Notificaciones
- Alertas en tiempo real para actividades críticas
- Notificaciones por correo electrónico o mensajería
- Umbrales configurables para diferentes tipos de eventos

### 3. Almacenamiento Seguro
- Cifrado de datos sensibles en reposo
- Rotación automática de claves
- Copias de seguridad encriptadas

## Mejoras Futuras

### 1. Análisis de Comportamiento
- Detección de anomalías basada en machine learning
- Línea base de comportamiento por usuario
- Alertas proactivas

### 2. Auditoría Forense
- Reconstrucción de secuencias de eventos
- Línea de tiempo interactiva
- Exportación para análisis forense

### 3. Dashboard en Tiempo Real
- Visualización de actividad en tiempo real
- Mapas de calor de actividad
- Métricas de rendimiento del sistema
