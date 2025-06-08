# asiento_contable

## Descripción
Modelo que representa asiento_contable en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `fecha` | `Date` | ✅ | - | Valor por defecto |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `referencia_externa` | `string?` | ❌ | `null` | - |  |
| `tipo` | `string` | ✅ | - | - |  |
| `entidad_tipo` | `string?` | ❌ | `null` | - |  |
| `entidad_id` | `string?` | ❌ | `null` | - |  |
| `sucursal_id` | `string?` | ❌ | `null` | - |  |
| `usuario_id` | `string?` | ❌ | `null` | - |  |
| `estado` | `string` | ✅ | - | Valor por defecto |  |
| `exportado` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `exportado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `erp_id` | `number?` | ❌ | `null` | - |  |
| `erp_tipo` | `string?` | ❌ | `null` | - |  |
| `erp_payload` | `object?` | ❌ | `null` | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **movimientos**: Muchos a [movimiento_contable](./movimiento_contable.md) `asiento_contableTomovimiento_contable`
- **sucursal**: Uno a [sucursal](./sucursal.md) `asiento_contable_sucursal`
- **usuario**: Uno a [usuario](./usuario.md) `asiento_contable_usuario`
- **facturas**: Muchos a [factura](./factura.md) `asiento_contableTofactura`
- **gastos**: Muchos a [gasto](./gasto.md) `asiento_contableTogasto`
- **pagos**: Muchos a [pago](./pago.md) `asiento_contableTopago`
- **pedidos**: Muchos a [pedido](./pedido.md) `asiento_contableTopedido`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo asiento_contable
const nuevoasiento_contable = await prisma.asiento_contable.create({
  data: {
    fecha: "valor",
    descripcion: null,
    referencia_externa: null,
    tipo: "valor",
    entidad_tipo: null,
    entidad_id: null,
    sucursal_id: null,
    usuario_id: null,
    estado: "valor",
    exportado: null,
    erp_id: null,
    erp_tipo: null,
    erp_payload: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de asiento_contable
const registros = await prisma.asiento_contable.findMany({
    // Incluir relaciones
    include: {
      movimientos: true,
      sucursal: true,
      usuario: true,
      facturas: true,
      gastos: true,
      pagos: true,
      pedidos: true
    }
});

// Obtener un asiento_contable por ID
const registro = await prisma.asiento_contable.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      movimientos: true,
      sucursal: true,
      usuario: true,
      facturas: true,
      gastos: true,
      pagos: true,
      pedidos: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `asiento_contable`
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

- [Reglas de Negocio](./asiento_contable/reglas_negocio.md)
- [Seguridad y Permisos](./asiento_contable/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **movimientos**: Muchos a [movimiento_contable](./movimiento_contable.md) `asiento_contableTomovimiento_contable`
- **sucursal**: Uno a [sucursal](./sucursal.md) `asiento_contable_sucursal`
- **usuario**: Uno a [usuario](./usuario.md) `asiento_contable_usuario`
- **facturas**: Muchos a [factura](./factura.md) `asiento_contableTofactura`
- **gastos**: Muchos a [gasto](./gasto.md) `asiento_contableTogasto`
- **pagos**: Muchos a [pago](./pago.md) `asiento_contableTopago`
- **pedidos**: Muchos a [pedido](./pedido.md) `asiento_contableTopedido`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-08T15:35:08.536Z
