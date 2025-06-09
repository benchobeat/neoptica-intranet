# AsientoContable

## Descripción
Modelo que representa AsientoContable en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `fecha` | `Date` | ✅ | - | Valor por defecto |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `referenciaExterna` | `string?` | ❌ | `null` | - |  |
| `tipo` | `string` | ✅ | - | - |  |
| `entidadTipo` | `string?` | ❌ | `null` | - |  |
| `entidadId` | `string?` | ❌ | `null` | - |  |
| `sucursalId` | `string?` | ❌ | `null` | - |  |
| `usuarioId` | `string?` | ❌ | `null` | - |  |
| `estado` | `string` | ✅ | - | Valor por defecto |  |
| `exportado` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `exportadoEn` | `Date?` | ❌ | `null` | - |  |
| `erpId` | `number?` | ❌ | `null` | - |  |
| `erpTipo` | `string?` | ❌ | `null` | - |  |
| `erpPayload` | `object?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **movimientos**: Muchos a [MovimientoContable](./movimientocontable.md) `AsientoContableToMovimientoContable`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `asiento_contable_sucursal`
- **usuario**: Uno a [Usuario](./usuario.md) `asiento_contable_usuario`
- **facturas**: Muchos a [Factura](./factura.md) `AsientoContableToFactura`
- **gastos**: Muchos a [Gasto](./gasto.md) `AsientoContableToGasto`
- **pagos**: Muchos a [Pago](./pago.md) `AsientoContableToPago`
- **pedidos**: Muchos a [Pedido](./pedido.md) `AsientoContableToPedido`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo AsientoContable
const nuevoAsientoContable = await prisma.asientocontable.create({
  data: {
    fecha: "valor",
    descripcion: null,
    referenciaExterna: null,
    tipo: "valor",
    entidadTipo: null,
    entidadId: null,
    sucursalId: null,
    usuarioId: null,
    estado: "valor",
    exportado: null,
    exportadoEn: null,
    erpId: null,
    erpTipo: null,
    erpPayload: null,
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
// Obtener todos los registros de AsientoContable
const registros = await prisma.asientocontable.findMany({
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

// Obtener un AsientoContable por ID
const registro = await prisma.asientocontable.findUnique({
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

- **Tabla en BD**: `asientocontable`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./asientocontable/reglas_negocio.md)
- [Seguridad y Permisos](./asientocontable/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **movimientos**: Muchos a [MovimientoContable](./movimientocontable.md) `AsientoContableToMovimientoContable`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `asiento_contable_sucursal`
- **usuario**: Uno a [Usuario](./usuario.md) `asiento_contable_usuario`
- **facturas**: Muchos a [Factura](./factura.md) `AsientoContableToFactura`
- **gastos**: Muchos a [Gasto](./gasto.md) `AsientoContableToGasto`
- **pagos**: Muchos a [Pago](./pago.md) `AsientoContableToPago`
- **pedidos**: Muchos a [Pedido](./pedido.md) `AsientoContableToPedido`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.944Z
