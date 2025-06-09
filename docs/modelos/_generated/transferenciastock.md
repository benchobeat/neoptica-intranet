# TransferenciaStock

## Descripción
Modelo que representa TransferenciaStock en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `productoId` | `string?` | ❌ | `null` | - |  |
| `sucursalOrigen` | `string?` | ❌ | `null` | - |  |
| `sucursalDestino` | `string?` | ❌ | `null` | - |  |
| `solicitadoPor` | `string?` | ❌ | `null` | - |  |
| `cantidad` | `number` | ✅ | - | - |  |
| `motivo` | `string?` | ❌ | `null` | - |  |
| `estado` | `string?` | ❌ | `null` | Valor por defecto |  |
| `revisadoPor` | `string?` | ❌ | `null` | - |  |
| `comentarioAdmin` | `string?` | ❌ | `null` | - |  |
| `solicitadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `revisadoEn` | `Date?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **producto**: Uno a [Producto](./producto.md) `ProductoToTransferenciaStock`
- **revisor**: Uno a [Usuario](./usuario.md) `transferencia_stock_revisado_porTousuario`
- **solicitante**: Uno a [Usuario](./usuario.md) `transferencia_stock_solicitado_porTousuario`
- **destino**: Uno a [Sucursal](./sucursal.md) `transferencia_stock_sucursal_destinoTosucursal`
- **origen**: Uno a [Sucursal](./sucursal.md) `transferencia_stock_sucursal_origenTosucursal`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo TransferenciaStock
const nuevoTransferenciaStock = await prisma.transferenciastock.create({
  data: {
    productoId: null,
    sucursalOrigen: null,
    sucursalDestino: null,
    solicitadoPor: null,
    cantidad: "valor",
    motivo: null,
    estado: null,
    revisadoPor: null,
    comentarioAdmin: null,
    solicitadoEn: null,
    revisadoEn: null,
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
// Obtener todos los registros de TransferenciaStock
const registros = await prisma.transferenciastock.findMany({
    // Incluir relaciones
    include: {
      producto: true,
      revisor: true,
      solicitante: true,
      destino: true,
      origen: true
    }
});

// Obtener un TransferenciaStock por ID
const registro = await prisma.transferenciastock.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      producto: true,
      revisor: true,
      solicitante: true,
      destino: true,
      origen: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `transferenciastock`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./transferenciastock/reglas_negocio.md)
- [Seguridad y Permisos](./transferenciastock/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **producto**: Uno a [Producto](./producto.md) `ProductoToTransferenciaStock`
- **revisor**: Uno a [Usuario](./usuario.md) `transferencia_stock_revisado_porTousuario`
- **solicitante**: Uno a [Usuario](./usuario.md) `transferencia_stock_solicitado_porTousuario`
- **destino**: Uno a [Sucursal](./sucursal.md) `transferencia_stock_sucursal_destinoTosucursal`
- **origen**: Uno a [Sucursal](./sucursal.md) `transferencia_stock_sucursal_origenTosucursal`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:16.001Z
