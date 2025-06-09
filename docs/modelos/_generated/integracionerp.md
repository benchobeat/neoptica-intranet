# IntegracionErp

## Descripción
Modelo que representa IntegracionErp en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `entidadTipo` | `EntidadTipoErp?` | ❌ | `null` | - |  |
| `entidadId` | `string?` | ❌ | `null` | - |  |
| `erpId` | `number?` | ❌ | `null` | - |  |
| `erpTipo` | `string?` | ❌ | `null` | - |  |
| `fechaSync` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `estado` | `EstadoIntegracionErp?` | ❌ | `null` | Valor por defecto |  |
| `requestPayload` | `object?` | ❌ | `null` | - |  |
| `responsePayload` | `object?` | ❌ | `null` | - |  |
| `error` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

Este modelo no tiene relaciones definidas.

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo IntegracionErp
const nuevoIntegracionErp = await prisma.integracionerp.create({
  data: {
    entidadTipo: null,
    entidadId: null,
    erpId: null,
    erpTipo: null,
    fechaSync: null,
    estado: null,
    requestPayload: null,
    responsePayload: null,
    error: null,
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
// Obtener todos los registros de IntegracionErp
const registros = await prisma.integracionerp.findMany({
});

// Obtener un IntegracionErp por ID
const registro = await prisma.integracionerp.findUnique({
  where: { id: 'ID_DEL_REGISTRO' }
});
```

## Notas Técnicas

- **Tabla en BD**: `integracionerp`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./integracionerp/reglas_negocio.md)
- [Seguridad y Permisos](./integracionerp/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

Este modelo no tiene relaciones definidas.

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.934Z
