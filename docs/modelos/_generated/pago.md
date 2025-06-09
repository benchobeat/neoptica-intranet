# Pago

## Descripción
Modelo que representa Pago en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `pedidoId` | `string?` | ❌ | `null` | - |  |
| `monto` | `number` | ✅ | - | - |  |
| `fechaPago` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `metodo` | `string?` | ❌ | `null` | - |  |
| `referenciaExterna` | `string?` | ❌ | `null` | - |  |
| `usuarioId` | `string?` | ❌ | `null` | - |  |
| `moneda` | `string?` | ❌ | `null` | Valor por defecto |  |
| `erpId` | `number?` | ❌ | `null` | - |  |
| `erpTipo` | `string?` | ❌ | `null` | - |  |
| `erpPayload` | `object?` | ❌ | `null` | - |  |
| `asientoContableId` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **pedido**: Uno a [Pedido](./pedido.md) `PagoToPedido`
- **usuario**: Uno a [Usuario](./usuario.md) `PagoToUsuario`
- **asientoContable**: Uno a [AsientoContable](./asientocontable.md) `AsientoContableToPago`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Pago
const nuevoPago = await prisma.pago.create({
  data: {
    pedidoId: null,
    monto: "valor",
    fechaPago: null,
    metodo: null,
    referenciaExterna: null,
    usuarioId: null,
    moneda: null,
    erpId: null,
    erpTipo: null,
    erpPayload: null,
    asientoContableId: null,
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
// Obtener todos los registros de Pago
const registros = await prisma.pago.findMany({
    // Incluir relaciones
    include: {
      pedido: true,
      usuario: true,
      asientoContable: true
    }
});

// Obtener un Pago por ID
const registro = await prisma.pago.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      pedido: true,
      usuario: true,
      asientoContable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `pago`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./pago/reglas_negocio.md)
- [Seguridad y Permisos](./pago/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **pedido**: Uno a [Pedido](./pedido.md) `PagoToPedido`
- **usuario**: Uno a [Usuario](./usuario.md) `PagoToUsuario`
- **asientoContable**: Uno a [AsientoContable](./asientocontable.md) `AsientoContableToPago`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.957Z
