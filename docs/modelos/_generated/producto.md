# producto

## Descripción
Modelo que representa producto en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombre` | `string` | ✅ | - | - |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `precio` | `number` | ✅ | - | - |  |
| `categoria` | `string?` | ❌ | `null` | - |  |
| `imagen_url` | `string?` | ❌ | `null` | - |  |
| `modelo_3d_url` | `string?` | ❌ | `null` | - |  |
| `activo` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `erp_id` | `number?` | ❌ | `null` | - |  |
| `erp_tipo` | `string?` | ❌ | `null` | - |  |
| `marca_id` | `string?` | ❌ | `null` | - |  |
| `color_id` | `string?` | ❌ | `null` | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **marca**: Uno a [marca](./marca.md) `marcaToproducto`
- **color**: Uno a [color](./color.md) `colorToproducto`
- **detalle_pedido**: Muchos a [detalle_pedido](./detalle_pedido.md) `detalle_pedidoToproducto`
- **inventario**: Muchos a [inventario](./inventario.md) `inventarioToproducto`
- **transferencia_stock**: Muchos a [transferencia_stock](./transferencia_stock.md) `productoTotransferencia_stock`
- **productos_cupones**: Muchos a [producto_cupon](./producto_cupon.md) `productoToproducto_cupon`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo producto
const nuevoproducto = await prisma.producto.create({
  data: {
    nombre: "valor",
    descripcion: null,
    precio: "valor",
    categoria: null,
    imagen_url: null,
    modelo_3d_url: null,
    activo: null,
    erp_id: null,
    erp_tipo: null,
    marca_id: null,
    color_id: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de producto
const registros = await prisma.producto.findMany({
    // Incluir relaciones
    include: {
      marca: true,
      color: true,
      detalle_pedido: true,
      inventario: true,
      transferencia_stock: true,
      productos_cupones: true
    }
});

// Obtener un producto por ID
const registro = await prisma.producto.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      marca: true,
      color: true,
      detalle_pedido: true,
      inventario: true,
      transferencia_stock: true,
      productos_cupones: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `producto`
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

- [Reglas de Negocio](./producto/reglas_negocio.md)
- [Seguridad y Permisos](./producto/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **marca**: Uno a [marca](./marca.md) `marcaToproducto`
- **color**: Uno a [color](./color.md) `colorToproducto`
- **detalle_pedido**: Muchos a [detalle_pedido](./detalle_pedido.md) `detalle_pedidoToproducto`
- **inventario**: Muchos a [inventario](./inventario.md) `inventarioToproducto`
- **transferencia_stock**: Muchos a [transferencia_stock](./transferencia_stock.md) `productoTotransferencia_stock`
- **productos_cupones**: Muchos a [producto_cupon](./producto_cupon.md) `productoToproducto_cupon`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:20.035Z
