# Gasto

## Descripción
Modelo que representa Gasto en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `monto` | `number` | ✅ | - | - |  |
| `fechaGasto` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `categoria` | `string?` | ❌ | `null` | - |  |
| `usuarioId` | `string?` | ❌ | `null` | - |  |
| `sucursalId` | `string?` | ❌ | `null` | - |  |
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

- **sucursal**: Uno a [Sucursal](./sucursal.md) `GastoToSucursal`
- **usuario**: Uno a [Usuario](./usuario.md) `GastoToUsuario`
- **asientoContable**: Uno a [AsientoContable](./asientocontable.md) `AsientoContableToGasto`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Gasto
const nuevoGasto = await prisma.gasto.create({
  data: {
    descripcion: null,
    monto: "valor",
    fechaGasto: null,
    categoria: null,
    usuarioId: null,
    sucursalId: null,
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
// Obtener todos los registros de Gasto
const registros = await prisma.gasto.findMany({
    // Incluir relaciones
    include: {
      sucursal: true,
      usuario: true,
      asientoContable: true
    }
});

// Obtener un Gasto por ID
const registro = await prisma.gasto.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      sucursal: true,
      usuario: true,
      asientoContable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `gasto`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./gasto/reglas_negocio.md)
- [Seguridad y Permisos](./gasto/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **sucursal**: Uno a [Sucursal](./sucursal.md) `GastoToSucursal`
- **usuario**: Uno a [Usuario](./usuario.md) `GastoToUsuario`
- **asientoContable**: Uno a [AsientoContable](./asientocontable.md) `AsientoContableToGasto`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.927Z
