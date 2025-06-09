# Sucursal

## Descripción
Modelo que representa Sucursal en el sistema.

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
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **citas**: Muchos a [Cita](./cita.md) `CitaToSucursal`
- **descansosEmpleado**: Muchos a [DescansoEmpleado](./descansoempleado.md) `DescansoEmpleadoToSucursal`
- **gastos**: Muchos a [Gasto](./gasto.md) `GastoToSucursal`
- **inventarios**: Muchos a [Inventario](./inventario.md) `InventarioToSucursal`
- **movimientosContable**: Muchos a [MovimientoContable](./movimientocontable.md) `MovimientoContableToSucursal`
- **pedidos**: Muchos a [Pedido](./pedido.md) `PedidoToSucursal`
- **transferenciasOrigen**: Muchos a [TransferenciaStock](./transferenciastock.md) `transferencia_stock_sucursal_origenTosucursal`
- **transferenciasDestino**: Muchos a [TransferenciaStock](./transferenciastock.md) `transferencia_stock_sucursal_destinoTosucursal`
- **asientosContable**: Muchos a [AsientoContable](./asientocontable.md) `asiento_contable_sucursal`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Sucursal
const nuevoSucursal = await prisma.sucursal.create({
  data: {
    nombre: "valor",
    direccion: null,
    latitud: null,
    longitud: null,
    telefono: null,
    email: null,
    estado: null,
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
// Obtener todos los registros de Sucursal
const registros = await prisma.sucursal.findMany({
    // Incluir relaciones
    include: {
      citas: true,
      descansosEmpleado: true,
      gastos: true,
      inventarios: true,
      movimientosContable: true,
      pedidos: true,
      transferenciasOrigen: true,
      transferenciasDestino: true,
      asientosContable: true
    }
});

// Obtener un Sucursal por ID
const registro = await prisma.sucursal.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      citas: true,
      descansosEmpleado: true,
      gastos: true,
      inventarios: true,
      movimientosContable: true,
      pedidos: true,
      transferenciasOrigen: true,
      transferenciasDestino: true,
      asientosContable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `sucursal`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./sucursal/reglas_negocio.md)
- [Seguridad y Permisos](./sucursal/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **citas**: Muchos a [Cita](./cita.md) `CitaToSucursal`
- **descansosEmpleado**: Muchos a [DescansoEmpleado](./descansoempleado.md) `DescansoEmpleadoToSucursal`
- **gastos**: Muchos a [Gasto](./gasto.md) `GastoToSucursal`
- **inventarios**: Muchos a [Inventario](./inventario.md) `InventarioToSucursal`
- **movimientosContable**: Muchos a [MovimientoContable](./movimientocontable.md) `MovimientoContableToSucursal`
- **pedidos**: Muchos a [Pedido](./pedido.md) `PedidoToSucursal`
- **transferenciasOrigen**: Muchos a [TransferenciaStock](./transferenciastock.md) `transferencia_stock_sucursal_origenTosucursal`
- **transferenciasDestino**: Muchos a [TransferenciaStock](./transferenciastock.md) `transferencia_stock_sucursal_destinoTosucursal`
- **asientosContable**: Muchos a [AsientoContable](./asientocontable.md) `asiento_contable_sucursal`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.981Z
