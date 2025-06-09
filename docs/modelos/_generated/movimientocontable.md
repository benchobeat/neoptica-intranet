# MovimientoContable

## Descripción
Modelo que representa MovimientoContable en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `asientoId` | `string?` | ❌ | `null` | - |  |
| `tipo` | `string` | ✅ | - | - |  |
| `monto` | `number` | ✅ | - | - |  |
| `cuentaId` | `string?` | ❌ | `null` | - |  |
| `sucursalId` | `string?` | ❌ | `null` | - |  |
| `usuarioId` | `string?` | ❌ | `null` | - |  |
| `referenciaExterna` | `string?` | ❌ | `null` | - |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `entidadTipo` | `string?` | ❌ | `null` | - |  |
| `entidadId` | `string?` | ❌ | `null` | - |  |
| `exportado` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `exportadoEn` | `Date?` | ❌ | `null` | - |  |
| `erpId` | `number?` | ❌ | `null` | - |  |
| `erpTipo` | `string?` | ❌ | `null` | - |  |
| `erpPayload` | `object?` | ❌ | `null` | - |  |
| `reversaDe` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **logsAuditoria**: Muchos a [LogAuditoria](./logauditoria.md) `MovimientoContableLogs`
- **asientoContable**: Uno a [AsientoContable](./asientocontable.md) `AsientoContableToMovimientoContable`
- **cuentaContable**: Uno a [CuentaContable](./cuentacontable.md) `CuentaContableToMovimientoContable`
- **movimientoReversa**: Uno a [MovimientoContable](./movimientocontable.md) `MovimientoContableReversa`
- **movimientosHijos**: Muchos a [MovimientoContable](./movimientocontable.md) `MovimientoContableReversa`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `MovimientoContableToSucursal`
- **usuario**: Uno a [Usuario](./usuario.md) `MovimientoContableToUsuario`
- **entidadesMovimiento**: Muchos a [MovimientoContableEntidad](./movimientocontableentidad.md) `MovimientoContableToMovimientoContableEntidad`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo MovimientoContable
const nuevoMovimientoContable = await prisma.movimientocontable.create({
  data: {
    asientoId: null,
    tipo: "valor",
    monto: "valor",
    cuentaId: null,
    sucursalId: null,
    usuarioId: null,
    referenciaExterna: null,
    descripcion: null,
    entidadTipo: null,
    entidadId: null,
    exportado: null,
    exportadoEn: null,
    erpId: null,
    erpTipo: null,
    erpPayload: null,
    reversaDe: null,
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
// Obtener todos los registros de MovimientoContable
const registros = await prisma.movimientocontable.findMany({
    // Incluir relaciones
    include: {
      logsAuditoria: true,
      asientoContable: true,
      cuentaContable: true,
      movimientoReversa: true,
      movimientosHijos: true,
      sucursal: true,
      usuario: true,
      entidadesMovimiento: true
    }
});

// Obtener un MovimientoContable por ID
const registro = await prisma.movimientocontable.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      logsAuditoria: true,
      asientoContable: true,
      cuentaContable: true,
      movimientoReversa: true,
      movimientosHijos: true,
      sucursal: true,
      usuario: true,
      entidadesMovimiento: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `movimientocontable`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./movimientocontable/reglas_negocio.md)
- [Seguridad y Permisos](./movimientocontable/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **logsAuditoria**: Muchos a [LogAuditoria](./logauditoria.md) `MovimientoContableLogs`
- **asientoContable**: Uno a [AsientoContable](./asientocontable.md) `AsientoContableToMovimientoContable`
- **cuentaContable**: Uno a [CuentaContable](./cuentacontable.md) `CuentaContableToMovimientoContable`
- **movimientoReversa**: Uno a [MovimientoContable](./movimientocontable.md) `MovimientoContableReversa`
- **movimientosHijos**: Muchos a [MovimientoContable](./movimientocontable.md) `MovimientoContableReversa`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `MovimientoContableToSucursal`
- **usuario**: Uno a [Usuario](./usuario.md) `MovimientoContableToUsuario`
- **entidadesMovimiento**: Muchos a [MovimientoContableEntidad](./movimientocontableentidad.md) `MovimientoContableToMovimientoContableEntidad`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.947Z
