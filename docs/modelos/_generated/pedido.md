# pedido

## Descripción
Modelo que representa pedido en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `cliente_id` | `string?` | ❌ | `null` | - |  |
| `sucursal_id` | `string?` | ❌ | `null` | - |  |
| `estado` | `string?` | ❌ | `null` | Valor por defecto |  |
| `total` | `number?` | ❌ | `null` | - |  |
| `metodo_pago` | `string?` | ❌ | `null` | - |  |
| `estado_pago` | `string?` | ❌ | `null` | - |  |
| `asiento_contable_id` | `string?` | ❌ | `null` | - |  |
| `moneda` | `string?` | ❌ | `null` | Valor por defecto |  |
| `cupon_id` | `string?` | ❌ | `null` | - |  |
| `descuento_aplicado` | `number?` | ❌ | `null` | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `erp_id` | `number?` | ❌ | `null` | - |  |
| `erp_tipo` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **detalle_pedido**: Muchos a [detalle_pedido](./detalle_pedido.md) `detalle_pedidoTopedido`
- **factura**: Muchos a [factura](./factura.md) `facturaTopedido`
- **pago**: Muchos a [pago](./pago.md) `pagoTopedido`
- **usuario**: Uno a [usuario](./usuario.md) `pedidoTousuario`
- **sucursal**: Uno a [sucursal](./sucursal.md) `pedidoTosucursal`
- **asiento_contable**: Uno a [asiento_contable](./asiento_contable.md) `asiento_contableTopedido`
- **cupon**: Uno a [cupon](./cupon.md) `cuponTopedido`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo pedido
const nuevopedido = await prisma.pedido.create({
  data: {
    cliente_id: null,
    sucursal_id: null,
    estado: null,
    total: null,
    metodo_pago: null,
    estado_pago: null,
    asiento_contable_id: null,
    moneda: null,
    cupon_id: null,
    descuento_aplicado: null,
    erp_id: null,
    erp_tipo: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de pedido
const registros = await prisma.pedido.findMany({
    // Incluir relaciones
    include: {
      detalle_pedido: true,
      factura: true,
      pago: true,
      usuario: true,
      sucursal: true,
      asiento_contable: true,
      cupon: true
    }
});

// Obtener un pedido por ID
const registro = await prisma.pedido.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      detalle_pedido: true,
      factura: true,
      pago: true,
      usuario: true,
      sucursal: true,
      asiento_contable: true,
      cupon: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `pedido`
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

- [Reglas de Negocio](./pedido/reglas_negocio.md)
- [Seguridad y Permisos](./pedido/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **detalle_pedido**: Muchos a [detalle_pedido](./detalle_pedido.md) `detalle_pedidoTopedido`
- **factura**: Muchos a [factura](./factura.md) `facturaTopedido`
- **pago**: Muchos a [pago](./pago.md) `pagoTopedido`
- **usuario**: Uno a [usuario](./usuario.md) `pedidoTousuario`
- **sucursal**: Uno a [sucursal](./sucursal.md) `pedidoTosucursal`
- **asiento_contable**: Uno a [asiento_contable](./asiento_contable.md) `asiento_contableTopedido`
- **cupon**: Uno a [cupon](./cupon.md) `cuponTopedido`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:20.032Z
