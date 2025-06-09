# Cupon

## Descripción
Modelo que representa Cupon en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `codigo` | `string` | ✅ | - | Valor único |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `montoDescuento` | `number?` | ❌ | `null` | - |  |
| `vigenciaInicio` | `Date?` | ❌ | `null` | - |  |
| `vigenciaFin` | `Date?` | ❌ | `null` | - |  |
| `limiteUso` | `number?` | ❌ | `null` | - |  |
| `usosRealizados` | `number?` | ❌ | `null` | Valor por defecto |  |
| `activo` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `tipo` | `string?` | ❌ | `null` | - |  |
| `usuarioId` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **pedidos**: Muchos a [Pedido](./pedido.md) `CuponToPedido`
- **usuario**: Uno a [Usuario](./usuario.md) `CuponToUsuario`
- **productosCupones**: Muchos a [ProductoCupon](./productocupon.md) `CuponToProductoCupon`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Cupon
const nuevoCupon = await prisma.cupon.create({
  data: {
    codigo: "valor",
    descripcion: null,
    montoDescuento: null,
    vigenciaInicio: null,
    vigenciaFin: null,
    limiteUso: null,
    usosRealizados: null,
    activo: null,
    tipo: null,
    usuarioId: null,
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
// Obtener todos los registros de Cupon
const registros = await prisma.cupon.findMany({
    // Incluir relaciones
    include: {
      pedidos: true,
      usuario: true,
      productosCupones: true
    }
});

// Obtener un Cupon por ID
const registro = await prisma.cupon.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      pedidos: true,
      usuario: true,
      productosCupones: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `cupon`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./cupon/reglas_negocio.md)
- [Seguridad y Permisos](./cupon/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **pedidos**: Muchos a [Pedido](./pedido.md) `CuponToPedido`
- **usuario**: Uno a [Usuario](./usuario.md) `CuponToUsuario`
- **productosCupones**: Muchos a [ProductoCupon](./productocupon.md) `CuponToProductoCupon`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.903Z
