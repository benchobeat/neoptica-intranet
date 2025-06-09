# Inventario

## Descripción
Modelo que representa Inventario en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `sucursalId` | `string?` | ❌ | `null` | - |  |
| `productoId` | `string?` | ❌ | `null` | - |  |
| `stock` | `number?` | ❌ | `null` | Valor por defecto |  |
| `stockMinimo` | `number?` | ❌ | `null` | Valor por defecto |  |
| `ubicacion` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **producto**: Uno a [Producto](./producto.md) `InventarioToProducto`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `InventarioToSucursal`
- **movimientosInventario**: Muchos a [MovimientoInventario](./movimientoinventario.md) `InventarioToMovimientoInventario`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Inventario
const nuevoInventario = await prisma.inventario.create({
  data: {
    sucursalId: null,
    productoId: null,
    stock: null,
    stockMinimo: null,
    ubicacion: null,
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
// Obtener todos los registros de Inventario
const registros = await prisma.inventario.findMany({
    // Incluir relaciones
    include: {
      producto: true,
      sucursal: true,
      movimientosInventario: true
    }
});

// Obtener un Inventario por ID
const registro = await prisma.inventario.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      producto: true,
      sucursal: true,
      movimientosInventario: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `inventario`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./inventario/reglas_negocio.md)
- [Seguridad y Permisos](./inventario/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **producto**: Uno a [Producto](./producto.md) `InventarioToProducto`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `InventarioToSucursal`
- **movimientosInventario**: Muchos a [MovimientoInventario](./movimientoinventario.md) `InventarioToMovimientoInventario`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.937Z
