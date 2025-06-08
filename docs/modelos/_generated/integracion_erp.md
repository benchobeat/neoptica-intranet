# integracion_erp

## Descripción
Modelo que representa integracion_erp en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `entidad_tipo` | `EntidadTipoERP?` | ❌ | `null` | - |  |
| `entidad_id` | `string?` | ❌ | `null` | - |  |
| `erp_id` | `number?` | ❌ | `null` | - |  |
| `erp_tipo` | `string?` | ❌ | `null` | - |  |
| `fecha_sync` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `estado` | `EstadoIntegracionERP?` | ❌ | `null` | Valor por defecto |  |
| `request_payload` | `object?` | ❌ | `null` | - |  |
| `response_payload` | `object?` | ❌ | `null` | - |  |
| `error` | `string?` | ❌ | `null` | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

Este modelo no tiene relaciones definidas.

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo integracion_erp
const nuevointegracion_erp = await prisma.integracion_erp.create({
  data: {
    entidad_tipo: null,
    entidad_id: null,
    erp_id: null,
    erp_tipo: null,
    fecha_sync: null,
    estado: null,
    request_payload: null,
    response_payload: null,
    error: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de integracion_erp
const registros = await prisma.integracion_erp.findMany({
});

// Obtener un integracion_erp por ID
const registro = await prisma.integracion_erp.findUnique({
  where: { id: 'ID_DEL_REGISTRO' }
});
```

## Notas Técnicas

- **Tabla en BD**: `integracion_erp`
- **Clave primaria**: `id`
- **Campos de auditoría**: ✅ Sí

## Auditoría

### ✅ Auditoría Habilitada

Este modelo incluye soporte completo de auditoría con los siguientes campos de seguimiento:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `creado_en` | `DateTime` | Fecha y hora de creación del registro |
| `creado_por` | `string` | ID del usuario que creó el registro |
| `modificado_en` | `DateTime` | Última fecha de modificación del registro |
| `modificado_por` | `string` | ID del último usuario que modificó el registro |
| `anulado_en` | `DateTime?` | Fecha de eliminación lógica (soft delete) |
| `anulado_por` | `string?` | ID del usuario que realizó la eliminación lógica |

### Registro de Actividades

Todas las operaciones CRUD en este modelo generan registros de auditoría que incluyen:

- Usuario que realizó la acción
- Tipo de operación (CREAR, ACTUALIZAR, ELIMINAR, etc.)
- Fecha y hora exacta de la operación
- Dirección IP del solicitante
- Datos anteriores y nuevos (para actualizaciones)

### Consulta de Registros

Los registros de auditoría pueden consultarse a través de la API de auditoría con filtros por:

- Rango de fechas
- Usuario
- Tipo de acción
- Entidad afectada

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./integracion_erp/reglas_negocio.md)
- [Seguridad y Permisos](./integracion_erp/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

Este modelo no tiene relaciones definidas.

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:20.007Z
