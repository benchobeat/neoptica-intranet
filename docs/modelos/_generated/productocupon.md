# ProductoCupon

## Descripción
Modelo que representa ProductoCupon en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `productoId` | `string` | ✅ | - | - |  |
| `cuponId` | `string` | ✅ | - | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **producto**: Uno a [Producto](./producto.md) `ProductoToProductoCupon`
- **cupon**: Uno a [Cupon](./cupon.md) `CuponToProductoCupon`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo ProductoCupon
const nuevoProductoCupon = await prisma.productocupon.create({
  data: {
    productoId: "valor",
    cuponId: "valor",
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
// Obtener todos los registros de ProductoCupon
const registros = await prisma.productocupon.findMany({
    // Incluir relaciones
    include: {
      producto: true,
      cupon: true
    }
});

// Obtener un ProductoCupon por ID
const registro = await prisma.productocupon.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      producto: true,
      cupon: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `productocupon`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./productocupon/reglas_negocio.md)
- [Seguridad y Permisos](./productocupon/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **producto**: Uno a [Producto](./producto.md) `ProductoToProductoCupon`
- **cupon**: Uno a [Cupon](./cupon.md) `CuponToProductoCupon`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.912Z
