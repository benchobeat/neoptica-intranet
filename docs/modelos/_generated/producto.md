# Producto

## Descripción
Modelo que representa Producto en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombre` | `string` | ✅ | - | - |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `precio` | `number` | ✅ | - | - |  |
| `categoria` | `string?` | ❌ | `null` | - |  |
| `imagenUrl` | `string?` | ❌ | `null` | - |  |
| `modelo3dUrl` | `string?` | ❌ | `null` | - |  |
| `tipoProducto` | `string?` | ❌ | `null` | - |  |
| `tipoLente` | `string?` | ❌ | `null` | - |  |
| `materialLente` | `string?` | ❌ | `null` | - |  |
| `tratamientoLente` | `string?` | ❌ | `null` | - |  |
| `graduacionEsfera` | `number?` | ❌ | `null` | - |  |
| `graduacionCilindro` | `number?` | ❌ | `null` | - |  |
| `eje` | `number?` | ❌ | `null` | - |  |
| `adicion` | `number?` | ❌ | `null` | - |  |
| `tipoArmazon` | `string?` | ❌ | `null` | - |  |
| `materialArmazon` | `string?` | ❌ | `null` | - |  |
| `tamanoPuente` | `number?` | ❌ | `null` | - |  |
| `tamanoAros` | `number?` | ❌ | `null` | - |  |
| `tamanoVarillas` | `number?` | ❌ | `null` | - |  |
| `activo` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `erpId` | `number?` | ❌ | `null` | - |  |
| `erpTipo` | `string?` | ❌ | `null` | - |  |
| `marcaId` | `string?` | ❌ | `null` | - |  |
| `colorId` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **marca**: Uno a [Marca](./marca.md) `MarcaToProducto`
- **color**: Uno a [Color](./color.md) `ColorToProducto`
- **detallesPedido**: Muchos a [DetallePedido](./detallepedido.md) `DetallePedidoToProducto`
- **inventarios**: Muchos a [Inventario](./inventario.md) `InventarioToProducto`
- **transferenciasStock**: Muchos a [TransferenciaStock](./transferenciastock.md) `ProductoToTransferenciaStock`
- **cupones**: Muchos a [ProductoCupon](./productocupon.md) `ProductoToProductoCupon`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Producto
const nuevoProducto = await prisma.producto.create({
  data: {
    nombre: "valor",
    descripcion: null,
    precio: "valor",
    categoria: null,
    imagenUrl: null,
    modelo3dUrl: null,
    tipoProducto: null,
    tipoLente: null,
    materialLente: null,
    tratamientoLente: null,
    graduacionEsfera: null,
    graduacionCilindro: null,
    eje: null,
    adicion: null,
    tipoArmazon: null,
    materialArmazon: null,
    tamanoPuente: null,
    tamanoAros: null,
    tamanoVarillas: null,
    activo: null,
    erpId: null,
    erpTipo: null,
    marcaId: null,
    colorId: null,
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
// Obtener todos los registros de Producto
const registros = await prisma.producto.findMany({
    // Incluir relaciones
    include: {
      marca: true,
      color: true,
      detallesPedido: true,
      inventarios: true,
      transferenciasStock: true,
      cupones: true
    }
});

// Obtener un Producto por ID
const registro = await prisma.producto.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      marca: true,
      color: true,
      detallesPedido: true,
      inventarios: true,
      transferenciasStock: true,
      cupones: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `producto`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./producto/reglas_negocio.md)
- [Seguridad y Permisos](./producto/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **marca**: Uno a [Marca](./marca.md) `MarcaToProducto`
- **color**: Uno a [Color](./color.md) `ColorToProducto`
- **detallesPedido**: Muchos a [DetallePedido](./detallepedido.md) `DetallePedidoToProducto`
- **inventarios**: Muchos a [Inventario](./inventario.md) `InventarioToProducto`
- **transferenciasStock**: Muchos a [TransferenciaStock](./transferenciastock.md) `ProductoToTransferenciaStock`
- **cupones**: Muchos a [ProductoCupon](./productocupon.md) `ProductoToProductoCupon`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.964Z
