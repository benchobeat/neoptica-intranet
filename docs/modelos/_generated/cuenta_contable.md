# cuenta_contable

## Descripción
Modelo que representa cuenta_contable en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `codigo` | `string` | ✅ | - | Valor único |  |
| `nombre` | `string` | ✅ | - | - |  |
| `tipo` | `string` | ✅ | - | - |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `cuenta_padre_id` | `string?` | ❌ | `null` | - |  |
| `erp_id` | `number?` | ❌ | `null` | - |  |
| `erp_tipo` | `string?` | ❌ | `null` | - |  |
| `erp_codigo` | `string?` | ❌ | `null` | - |  |
| `activo` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **cuenta_contable**: Uno a [cuenta_contable](./cuenta_contable.md) `cuenta_contableTocuenta_contable`
- **other_cuenta_contable**: Muchos a [cuenta_contable](./cuenta_contable.md) `cuenta_contableTocuenta_contable`
- **movimiento_contable**: Muchos a [movimiento_contable](./movimiento_contable.md) `cuenta_contableTomovimiento_contable`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo cuenta_contable
const nuevocuenta_contable = await prisma.cuenta_contable.create({
  data: {
    codigo: "valor",
    nombre: "valor",
    tipo: "valor",
    descripcion: null,
    cuenta_padre_id: null,
    erp_id: null,
    erp_tipo: null,
    erp_codigo: null,
    activo: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de cuenta_contable
const registros = await prisma.cuenta_contable.findMany({
    // Incluir relaciones
    include: {
      cuenta_contable: true,
      other_cuenta_contable: true,
      movimiento_contable: true
    }
});

// Obtener un cuenta_contable por ID
const registro = await prisma.cuenta_contable.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      cuenta_contable: true,
      other_cuenta_contable: true,
      movimiento_contable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `cuenta_contable`
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

- [Reglas de Negocio](./cuenta_contable/reglas_negocio.md)
- [Seguridad y Permisos](./cuenta_contable/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **cuenta_contable**: Uno a [cuenta_contable](./cuenta_contable.md) `cuenta_contableTocuenta_contable`
- **other_cuenta_contable**: Muchos a [cuenta_contable](./cuenta_contable.md) `cuenta_contableTocuenta_contable`
- **movimiento_contable**: Muchos a [movimiento_contable](./movimiento_contable.md) `cuenta_contableTomovimiento_contable`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:19.978Z
