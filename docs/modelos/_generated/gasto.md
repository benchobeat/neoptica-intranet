# gasto

## Descripción
Modelo que representa gasto en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `monto` | `number` | ✅ | - | - |  |
| `fecha_gasto` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `categoria` | `string?` | ❌ | `null` | - |  |
| `usuario_id` | `string?` | ❌ | `null` | - |  |
| `sucursal_id` | `string?` | ❌ | `null` | - |  |
| `moneda` | `string?` | ❌ | `null` | Valor por defecto |  |
| `erp_id` | `number?` | ❌ | `null` | - |  |
| `erp_tipo` | `string?` | ❌ | `null` | - |  |
| `erp_payload` | `object?` | ❌ | `null` | - |  |
| `asiento_contable_id` | `string?` | ❌ | `null` | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **sucursal**: Uno a [sucursal](./sucursal.md) `gastoTosucursal`
- **usuario**: Uno a [usuario](./usuario.md) `gastoTousuario`
- **asiento_contable**: Uno a [asiento_contable](./asiento_contable.md) `asiento_contableTogasto`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo gasto
const nuevogasto = await prisma.gasto.create({
  data: {
    descripcion: null,
    monto: "valor",
    fecha_gasto: null,
    categoria: null,
    usuario_id: null,
    sucursal_id: null,
    moneda: null,
    erp_id: null,
    erp_tipo: null,
    erp_payload: null,
    asiento_contable_id: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de gasto
const registros = await prisma.gasto.findMany({
    // Incluir relaciones
    include: {
      sucursal: true,
      usuario: true,
      asiento_contable: true
    }
});

// Obtener un gasto por ID
const registro = await prisma.gasto.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      sucursal: true,
      usuario: true,
      asiento_contable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `gasto`
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

- [Reglas de Negocio](./gasto/reglas_negocio.md)
- [Seguridad y Permisos](./gasto/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **sucursal**: Uno a [sucursal](./sucursal.md) `gastoTosucursal`
- **usuario**: Uno a [usuario](./usuario.md) `gastoTousuario`
- **asiento_contable**: Uno a [asiento_contable](./asiento_contable.md) `asiento_contableTogasto`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-08T15:35:08.520Z
