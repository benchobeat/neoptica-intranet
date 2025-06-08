# sucursal

## Descripción
Modelo que representa sucursal en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombre` | `string` | ✅ | - | - |  |
| `direccion` | `string?` | ❌ | `null` | - |  |
| `latitud` | `number?` | ❌ | `null` | - |  |
| `longitud` | `number?` | ❌ | `null` | - |  |
| `telefono` | `string?` | ❌ | `null` | - |  |
| `email` | `string?` | ❌ | `null` | - |  |
| `estado` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **cita**: Muchos a [cita](./cita.md) `citaTosucursal`
- **descanso_empleado**: Muchos a [descanso_empleado](./descanso_empleado.md) `descanso_empleadoTosucursal`
- **gasto**: Muchos a [gasto](./gasto.md) `gastoTosucursal`
- **inventario**: Muchos a [inventario](./inventario.md) `inventarioTosucursal`
- **movimiento_contable**: Muchos a [movimiento_contable](./movimiento_contable.md) `movimiento_contableTosucursal`
- **pedido**: Muchos a [pedido](./pedido.md) `pedidoTosucursal`
- **transferencia_stock_transferencia_stock_sucursal_destinoTosucursal**: Muchos a [transferencia_stock](./transferencia_stock.md) `transferencia_stock_sucursal_destinoTosucursal`
- **transferencia_stock_transferencia_stock_sucursal_origenTosucursal**: Muchos a [transferencia_stock](./transferencia_stock.md) `transferencia_stock_sucursal_origenTosucursal`
- **asiento_contable**: Muchos a [asiento_contable](./asiento_contable.md) `asiento_contable_sucursal`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo sucursal
const nuevosucursal = await prisma.sucursal.create({
  data: {
    nombre: "valor",
    direccion: null,
    latitud: null,
    longitud: null,
    telefono: null,
    email: null,
    estado: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de sucursal
const registros = await prisma.sucursal.findMany({
    // Incluir relaciones
    include: {
      cita: true,
      descanso_empleado: true,
      gasto: true,
      inventario: true,
      movimiento_contable: true,
      pedido: true,
      transferencia_stock_transferencia_stock_sucursal_destinoTosucursal: true,
      transferencia_stock_transferencia_stock_sucursal_origenTosucursal: true,
      asiento_contable: true
    }
});

// Obtener un sucursal por ID
const registro = await prisma.sucursal.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      cita: true,
      descanso_empleado: true,
      gasto: true,
      inventario: true,
      movimiento_contable: true,
      pedido: true,
      transferencia_stock_transferencia_stock_sucursal_destinoTosucursal: true,
      transferencia_stock_transferencia_stock_sucursal_origenTosucursal: true,
      asiento_contable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `sucursal`
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

- [Reglas de Negocio](./sucursal/reglas_negocio.md)
- [Seguridad y Permisos](./sucursal/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **cita**: Muchos a [cita](./cita.md) `citaTosucursal`
- **descanso_empleado**: Muchos a [descanso_empleado](./descanso_empleado.md) `descanso_empleadoTosucursal`
- **gasto**: Muchos a [gasto](./gasto.md) `gastoTosucursal`
- **inventario**: Muchos a [inventario](./inventario.md) `inventarioTosucursal`
- **movimiento_contable**: Muchos a [movimiento_contable](./movimiento_contable.md) `movimiento_contableTosucursal`
- **pedido**: Muchos a [pedido](./pedido.md) `pedidoTosucursal`
- **transferencia_stock_transferencia_stock_sucursal_destinoTosucursal**: Muchos a [transferencia_stock](./transferencia_stock.md) `transferencia_stock_sucursal_destinoTosucursal`
- **transferencia_stock_transferencia_stock_sucursal_origenTosucursal**: Muchos a [transferencia_stock](./transferencia_stock.md) `transferencia_stock_sucursal_origenTosucursal`
- **asiento_contable**: Muchos a [asiento_contable](./asiento_contable.md) `asiento_contable_sucursal`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:20.045Z
