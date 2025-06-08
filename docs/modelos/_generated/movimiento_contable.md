# movimiento_contable

## Descripción
Modelo que representa movimiento_contable en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `asiento_id` | `string?` | ❌ | `null` | - |  |
| `tipo` | `string` | ✅ | - | - |  |
| `monto` | `number` | ✅ | - | - |  |
| `cuenta_id` | `string?` | ❌ | `null` | - |  |
| `sucursal_id` | `string?` | ❌ | `null` | - |  |
| `usuario_id` | `string?` | ❌ | `null` | - |  |
| `referencia_externa` | `string?` | ❌ | `null` | - |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `entidad_tipo` | `string?` | ❌ | `null` | - |  |
| `entidad_id` | `string?` | ❌ | `null` | - |  |
| `exportado` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `exportado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `erp_id` | `number?` | ❌ | `null` | - |  |
| `erp_tipo` | `string?` | ❌ | `null` | - |  |
| `erp_payload` | `object?` | ❌ | `null` | - |  |
| `reversa_de` | `string?` | ❌ | `null` | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **log_auditoria**: Muchos a [log_auditoria](./log_auditoria.md) `log_auditoriaTomovimiento_contable`
- **asiento_contable**: Uno a [asiento_contable](./asiento_contable.md) `asiento_contableTomovimiento_contable`
- **cuenta_contable**: Uno a [cuenta_contable](./cuenta_contable.md) `cuenta_contableTomovimiento_contable`
- **movimiento_contable**: Uno a [movimiento_contable](./movimiento_contable.md) `movimiento_contableTomovimiento_contable`
- **other_movimiento_contable**: Muchos a [movimiento_contable](./movimiento_contable.md) `movimiento_contableTomovimiento_contable`
- **sucursal**: Uno a [sucursal](./sucursal.md) `movimiento_contableTosucursal`
- **usuario**: Uno a [usuario](./usuario.md) `movimiento_contableTousuario`
- **movimiento_contable_entidad**: Muchos a [movimiento_contable_entidad](./movimiento_contable_entidad.md) `movimiento_contableTomovimiento_contable_entidad`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo movimiento_contable
const nuevomovimiento_contable = await prisma.movimiento_contable.create({
  data: {
    asiento_id: null,
    tipo: "valor",
    monto: "valor",
    cuenta_id: null,
    sucursal_id: null,
    usuario_id: null,
    referencia_externa: null,
    descripcion: null,
    entidad_tipo: null,
    entidad_id: null,
    exportado: null,
    erp_id: null,
    erp_tipo: null,
    erp_payload: null,
    reversa_de: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de movimiento_contable
const registros = await prisma.movimiento_contable.findMany({
    // Incluir relaciones
    include: {
      log_auditoria: true,
      asiento_contable: true,
      cuenta_contable: true,
      movimiento_contable: true,
      other_movimiento_contable: true,
      sucursal: true,
      usuario: true,
      movimiento_contable_entidad: true
    }
});

// Obtener un movimiento_contable por ID
const registro = await prisma.movimiento_contable.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      log_auditoria: true,
      asiento_contable: true,
      cuenta_contable: true,
      movimiento_contable: true,
      other_movimiento_contable: true,
      sucursal: true,
      usuario: true,
      movimiento_contable_entidad: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `movimiento_contable`
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

- [Reglas de Negocio](./movimiento_contable/reglas_negocio.md)
- [Seguridad y Permisos](./movimiento_contable/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **log_auditoria**: Muchos a [log_auditoria](./log_auditoria.md) `log_auditoriaTomovimiento_contable`
- **asiento_contable**: Uno a [asiento_contable](./asiento_contable.md) `asiento_contableTomovimiento_contable`
- **cuenta_contable**: Uno a [cuenta_contable](./cuenta_contable.md) `cuenta_contableTomovimiento_contable`
- **movimiento_contable**: Uno a [movimiento_contable](./movimiento_contable.md) `movimiento_contableTomovimiento_contable`
- **other_movimiento_contable**: Muchos a [movimiento_contable](./movimiento_contable.md) `movimiento_contableTomovimiento_contable`
- **sucursal**: Uno a [sucursal](./sucursal.md) `movimiento_contableTosucursal`
- **usuario**: Uno a [usuario](./usuario.md) `movimiento_contableTousuario`
- **movimiento_contable_entidad**: Muchos a [movimiento_contable_entidad](./movimiento_contable_entidad.md) `movimiento_contableTomovimiento_contable_entidad`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-08T15:35:08.538Z
