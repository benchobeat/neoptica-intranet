# LogAuditoria

## Descripción
Modelo que representa LogAuditoria en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `usuarioId` | `string?` | ❌ | `null` | - |  |
| `accion` | `string` | ✅ | - | - |  |
| `descripcion` | `object?` | ❌ | `null` | - |  |
| `fecha` | `Date` | ✅ | - | Valor por defecto |  |
| `ip` | `string?` | ❌ | `null` | - |  |
| `tipoCorreo` | `string?` | ❌ | `null` | - |  |
| `correoDestino` | `string?` | ❌ | `null` | - |  |
| `usuarioDestino` | `string?` | ❌ | `null` | - |  |
| `entidadTipo` | `string?` | ❌ | `null` | - |  |
| `entidadId` | `string?` | ❌ | `null` | - |  |
| `estadoEnvio` | `string?` | ❌ | `null` | - |  |
| `mensajeError` | `string?` | ❌ | `null` | - |  |
| `enviadoPor` | `string?` | ❌ | `null` | - |  |
| `origenEnvio` | `string?` | ❌ | `null` | - |  |
| `intentos` | `number?` | ❌ | `null` | Valor por defecto |  |
| `modulo` | `string?` | ❌ | `null` | - |  |
| `movimientoId` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **usuario**: Uno a [Usuario](./usuario.md) `LogAuditoriaToUsuario`
- **movimientoContable**: Uno a [MovimientoContable](./movimientocontable.md) `MovimientoContableLogs`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo LogAuditoria
const nuevoLogAuditoria = await prisma.logauditoria.create({
  data: {
    usuarioId: null,
    accion: "valor",
    descripcion: null,
    fecha: "valor",
    ip: null,
    tipoCorreo: null,
    correoDestino: null,
    usuarioDestino: null,
    entidadTipo: null,
    entidadId: null,
    estadoEnvio: null,
    mensajeError: null,
    enviadoPor: null,
    origenEnvio: null,
    intentos: null,
    modulo: null,
    movimientoId: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de LogAuditoria
const registros = await prisma.logauditoria.findMany({
    // Incluir relaciones
    include: {
      usuario: true,
      movimientoContable: true
    }
});

// Obtener un LogAuditoria por ID
const registro = await prisma.logauditoria.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      usuario: true,
      movimientoContable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `logauditoria`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./logauditoria/reglas_negocio.md)
- [Seguridad y Permisos](./logauditoria/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **usuario**: Uno a [Usuario](./usuario.md) `LogAuditoriaToUsuario`
- **movimientoContable**: Uno a [MovimientoContable](./movimientocontable.md) `MovimientoContableLogs`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.941Z
