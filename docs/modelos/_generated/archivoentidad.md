# ArchivoEntidad

## Descripción
Modelo que representa ArchivoEntidad en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `archivoId` | `string?` | ❌ | `null` | - |  |
| `entidadTipo` | `string?` | ❌ | `null` | - |  |
| `entidadId` | `string?` | ❌ | `null` | - |  |
| `fechaVinculo` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **archivoAdjunto**: Uno a [ArchivoAdjunto](./archivoadjunto.md) `ArchivoAdjuntoToArchivoEntidad`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo ArchivoEntidad
const nuevoArchivoEntidad = await prisma.archivoentidad.create({
  data: {
    archivoId: null,
    entidadTipo: null,
    entidadId: null,
    fechaVinculo: null,
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
// Obtener todos los registros de ArchivoEntidad
const registros = await prisma.archivoentidad.findMany({
    // Incluir relaciones
    include: {
      archivoAdjunto: true
    }
});

// Obtener un ArchivoEntidad por ID
const registro = await prisma.archivoentidad.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      archivoAdjunto: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `archivoentidad`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./archivoentidad/reglas_negocio.md)
- [Seguridad y Permisos](./archivoentidad/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **archivoAdjunto**: Uno a [ArchivoAdjunto](./archivoadjunto.md) `ArchivoAdjuntoToArchivoEntidad`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.894Z
