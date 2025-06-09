# DetallePedido

## Descripción
Modelo que representa DetallePedido en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `pedidoId` | `string` | ✅ | - | - |  |
| `productoId` | `string?` | ❌ | `null` | - |  |
| `cantidad` | `number` | ✅ | - | - |  |
| `precioUnitario` | `number` | ✅ | - | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **pedido**: Uno a [Pedido](./pedido.md) `PedidoDetalles`
- **producto**: Uno a [Producto](./producto.md) `DetallePedidoToProducto`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo DetallePedido
const nuevoDetallePedido = await prisma.detallepedido.create({
  data: {
    pedidoId: "valor",
    productoId: null,
    cantidad: "valor",
    precioUnitario: "valor",
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
// Obtener todos los registros de DetallePedido
const registros = await prisma.detallepedido.findMany({
    // Incluir relaciones
    include: {
      pedido: true,
      producto: true
    }
});

// Obtener un DetallePedido por ID
const registro = await prisma.detallepedido.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      pedido: true,
      producto: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `detallepedido`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./detallepedido/reglas_negocio.md)
- [Seguridad y Permisos](./detallepedido/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **pedido**: Uno a [Pedido](./pedido.md) `PedidoDetalles`
- **producto**: Uno a [Producto](./producto.md) `DetallePedidoToProducto`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.921Z
