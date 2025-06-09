# Pedido

## Descripción
Modelo que representa Pedido en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `clienteId` | `string?` | ❌ | `null` | - |  |
| `sucursalId` | `string?` | ❌ | `null` | - |  |
| `estado` | `string?` | ❌ | `null` | Valor por defecto |  |
| `total` | `number?` | ❌ | `null` | - |  |
| `metodoPago` | `string?` | ❌ | `null` | - |  |
| `estadoPago` | `string?` | ❌ | `null` | - |  |
| `asientoContableId` | `string?` | ❌ | `null` | - |  |
| `moneda` | `string?` | ❌ | `null` | Valor por defecto |  |
| `cuponId` | `string?` | ❌ | `null` | - |  |
| `descuentoAplicado` | `number?` | ❌ | `null` | - |  |
| `erpId` | `number?` | ❌ | `null` | - |  |
| `erpTipo` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **detallesPedido**: Muchos a [DetallePedido](./detallepedido.md) `PedidoDetalles`
- **facturas**: Muchos a [Factura](./factura.md) `FacturaToPedido`
- **pagos**: Muchos a [Pago](./pago.md) `PagoToPedido`
- **usuario**: Uno a [Usuario](./usuario.md) `PedidoToUsuario`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `PedidoToSucursal`
- **asientoContable**: Uno a [AsientoContable](./asientocontable.md) `AsientoContableToPedido`
- **cupon**: Uno a [Cupon](./cupon.md) `CuponToPedido`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Pedido
const nuevoPedido = await prisma.pedido.create({
  data: {
    clienteId: null,
    sucursalId: null,
    estado: null,
    total: null,
    metodoPago: null,
    estadoPago: null,
    asientoContableId: null,
    moneda: null,
    cuponId: null,
    descuentoAplicado: null,
    erpId: null,
    erpTipo: null,
    creadoEn: null,
    creadoPor: null,
    modificadoEn: null,
    modificadoPor: null,
    anuladoEn: null,
    anuladoPor: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de Pedido
const registros = await prisma.pedido.findMany({
    // Incluir relaciones
    include: {
      detallesPedido: true,
      facturas: true,
      pagos: true,
      usuario: true,
      sucursal: true,
      asientoContable: true,
      cupon: true
    }
});

// Obtener un Pedido por ID
const registro = await prisma.pedido.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      detallesPedido: true,
      facturas: true,
      pagos: true,
      usuario: true,
      sucursal: true,
      asientoContable: true,
      cupon: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `pedido`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./pedido/reglas_negocio.md)
- [Seguridad y Permisos](./pedido/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **detallesPedido**: Muchos a [DetallePedido](./detallepedido.md) `PedidoDetalles`
- **facturas**: Muchos a [Factura](./factura.md) `FacturaToPedido`
- **pagos**: Muchos a [Pago](./pago.md) `PagoToPedido`
- **usuario**: Uno a [Usuario](./usuario.md) `PedidoToUsuario`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `PedidoToSucursal`
- **asientoContable**: Uno a [AsientoContable](./asientocontable.md) `AsientoContableToPedido`
- **cupon**: Uno a [Cupon](./cupon.md) `CuponToPedido`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.960Z
