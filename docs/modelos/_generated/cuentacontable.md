# CuentaContable

## Descripción
Modelo que representa CuentaContable en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `codigo` | `string` | ✅ | - | Valor único |  |
| `nombre` | `string` | ✅ | - | - |  |
| `tipo` | `string` | ✅ | - | - |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `cuentaPadreId` | `string?` | ❌ | `null` | - |  |
| `erpId` | `number?` | ❌ | `null` | - |  |
| `erpTipo` | `string?` | ❌ | `null` | - |  |
| `erpCodigo` | `string?` | ❌ | `null` | - |  |
| `activo` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **cuentaPadre**: Uno a [CuentaContable](./cuentacontable.md) `CuentaContableToCuentaContable`
- **cuentasHijas**: Muchos a [CuentaContable](./cuentacontable.md) `CuentaContableToCuentaContable`
- **movimientos**: Muchos a [MovimientoContable](./movimientocontable.md) `CuentaContableToMovimientoContable`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo CuentaContable
const nuevoCuentaContable = await prisma.cuentacontable.create({
  data: {
    codigo: "valor",
    nombre: "valor",
    tipo: "valor",
    descripcion: null,
    cuentaPadreId: null,
    erpId: null,
    erpTipo: null,
    erpCodigo: null,
    activo: null,
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
// Obtener todos los registros de CuentaContable
const registros = await prisma.cuentacontable.findMany({
    // Incluir relaciones
    include: {
      cuentaPadre: true,
      cuentasHijas: true,
      movimientos: true
    }
});

// Obtener un CuentaContable por ID
const registro = await prisma.cuentacontable.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      cuentaPadre: true,
      cuentasHijas: true,
      movimientos: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `cuentacontable`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./cuentacontable/reglas_negocio.md)
- [Seguridad y Permisos](./cuentacontable/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **cuentaPadre**: Uno a [CuentaContable](./cuentacontable.md) `CuentaContableToCuentaContable`
- **cuentasHijas**: Muchos a [CuentaContable](./cuentacontable.md) `CuentaContableToCuentaContable`
- **movimientos**: Muchos a [MovimientoContable](./movimientocontable.md) `CuentaContableToMovimientoContable`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.900Z
