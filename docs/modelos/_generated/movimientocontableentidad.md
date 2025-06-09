# MovimientoContableEntidad

## Descripción
Modelo que representa MovimientoContableEntidad en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `movimientoContableId` | `string?` | ❌ | `null` | - |  |
| `entidadTipo` | `string?` | ❌ | `null` | - |  |
| `entidadId` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **movimientoContable**: Uno a [MovimientoContable](./movimientocontable.md) `MovimientoContableToMovimientoContableEntidad`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo MovimientoContableEntidad
const nuevoMovimientoContableEntidad = await prisma.movimientocontableentidad.create({
  data: {
    movimientoContableId: null,
    entidadTipo: null,
    entidadId: null,
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
// Obtener todos los registros de MovimientoContableEntidad
const registros = await prisma.movimientocontableentidad.findMany({
    // Incluir relaciones
    include: {
      movimientoContable: true
    }
});

// Obtener un MovimientoContableEntidad por ID
const registro = await prisma.movimientocontableentidad.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      movimientoContable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `movimientocontableentidad`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./movimientocontableentidad/reglas_negocio.md)
- [Seguridad y Permisos](./movimientocontableentidad/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **movimientoContable**: Uno a [MovimientoContable](./movimientocontable.md) `MovimientoContableToMovimientoContableEntidad`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.951Z
