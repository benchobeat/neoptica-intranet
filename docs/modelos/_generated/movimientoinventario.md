# MovimientoInventario

## Descripción
Modelo que representa MovimientoInventario en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `inventarioId` | `string?` | ❌ | `null` | - |  |
| `usuarioId` | `string?` | ❌ | `null` | - |  |
| `tipo` | `string?` | ❌ | `null` | - |  |
| `cantidad` | `number` | ✅ | - | - |  |
| `stockResultante` | `number?` | ❌ | `null` | - |  |
| `motivo` | `string?` | ❌ | `null` | - |  |
| `fecha` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `reversaDe` | `string?` | ❌ | `null` | - |  |
| `anulado` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **inventario**: Uno a [Inventario](./inventario.md) `InventarioToMovimientoInventario`
- **movimientoReversa**: Uno a [MovimientoInventario](./movimientoinventario.md) `MovimientoInventarioReversa`
- **movimientosHijos**: Muchos a [MovimientoInventario](./movimientoinventario.md) `MovimientoInventarioReversa`
- **usuario**: Uno a [Usuario](./usuario.md) `MovimientoInventarioToUsuario`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo MovimientoInventario
const nuevoMovimientoInventario = await prisma.movimientoinventario.create({
  data: {
    inventarioId: null,
    usuarioId: null,
    tipo: null,
    cantidad: "valor",
    stockResultante: null,
    motivo: null,
    fecha: null,
    reversaDe: null,
    anulado: null,
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
// Obtener todos los registros de MovimientoInventario
const registros = await prisma.movimientoinventario.findMany({
    // Incluir relaciones
    include: {
      inventario: true,
      movimientoReversa: true,
      movimientosHijos: true,
      usuario: true
    }
});

// Obtener un MovimientoInventario por ID
const registro = await prisma.movimientoinventario.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      inventario: true,
      movimientoReversa: true,
      movimientosHijos: true,
      usuario: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `movimientoinventario`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./movimientoinventario/reglas_negocio.md)
- [Seguridad y Permisos](./movimientoinventario/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **inventario**: Uno a [Inventario](./inventario.md) `InventarioToMovimientoInventario`
- **movimientoReversa**: Uno a [MovimientoInventario](./movimientoinventario.md) `MovimientoInventarioReversa`
- **movimientosHijos**: Muchos a [MovimientoInventario](./movimientoinventario.md) `MovimientoInventarioReversa`
- **usuario**: Uno a [Usuario](./usuario.md) `MovimientoInventarioToUsuario`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.955Z
