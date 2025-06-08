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
- **tipo_correo**: Tipo de correo electrónico (si aplica)
- **correo_destino**: Dirección de correo electrónico del destinatario (si aplica)
- **usuario_destino**: ID del usuario destinatario (si aplica)
- **entidad_tipo**: Tipo de entidad afectada (ej: "USUARIO", "PRODUCTO", "CITA")
- **entidad_id**: ID de la entidad afectada (UUID)
- **estado_envio**: Estado del envío (si aplica)
- **mensaje_error**: Mensaje de error en caso de fallo
- **enviado_por**: ID del usuario que realizó el envío (si aplica)
- **origen_envio**: Origen del envío (si aplica)
- **intentos**: Número de intentos de envío (por defecto: 1)
- **modulo**: Módulo del sistema donde se originó la acción
- **entidadId**: ID alternativo de la entidad (compatibilidad)
- **entidadTipo**: Tipo alternativo de entidad (compatibilidad)
- **movimiento_id**: ID del movimiento contable relacionado (si aplica)

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

## Sistema de Auditoría

El sistema implementa un módulo completo de auditoría que registra todas las acciones significativas en la plataforma, asegurando trazabilidad y cumplimiento.

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
  - `usuarios`: Gestión de usuarios y permisos
  - `productos`: Catálogo de productos
  - `inventario`: Control de existencias
  - `ventas`: Procesos de venta
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
