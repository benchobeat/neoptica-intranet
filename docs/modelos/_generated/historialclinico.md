# HistorialClinico

## Descripción
Modelo que representa HistorialClinico en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `clienteId` | `string?` | ❌ | `null` | - |  |
| `optometristaId` | `string?` | ❌ | `null` | - |  |
| `citaId` | `string?` | ❌ | `null` | - |  |
| `fecha` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `recetaId` | `string?` | ❌ | `null` | - |  |
| `version` | `number?` | ❌ | `null` | Valor por defecto |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **cita**: Uno a [Cita](./cita.md) `CitaToHistorialClinico`
- **cliente**: Uno a [Usuario](./usuario.md) `HistorialClinicoCliente`
- **optometrista**: Uno a [Usuario](./usuario.md) `HistorialClinicoOptometrista`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo HistorialClinico
const nuevoHistorialClinico = await prisma.historialclinico.create({
  data: {
    clienteId: null,
    optometristaId: null,
    citaId: null,
    fecha: null,
    descripcion: null,
    recetaId: null,
    version: null,
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
// Obtener todos los registros de HistorialClinico
const registros = await prisma.historialclinico.findMany({
    // Incluir relaciones
    include: {
      cita: true,
      cliente: true,
      optometrista: true
    }
});

// Obtener un HistorialClinico por ID
const registro = await prisma.historialclinico.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      cita: true,
      cliente: true,
      optometrista: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `historialclinico`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./historialclinico/reglas_negocio.md)
- [Seguridad y Permisos](./historialclinico/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **cita**: Uno a [Cita](./cita.md) `CitaToHistorialClinico`
- **cliente**: Uno a [Usuario](./usuario.md) `HistorialClinicoCliente`
- **optometrista**: Uno a [Usuario](./usuario.md) `HistorialClinicoOptometrista`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.931Z
