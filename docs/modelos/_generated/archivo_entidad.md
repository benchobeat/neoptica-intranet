# archivo_entidad

## Descripción
Modelo que representa archivo_entidad en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `archivo_id` | `string?` | ❌ | `null` | - |  |
| `entidad_tipo` | `string?` | ❌ | `null` | - |  |
| `entidad_id` | `string?` | ❌ | `null` | - |  |
| `fecha_vinculo` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **archivo_adjunto**: Uno a [archivo_adjunto](./archivo_adjunto.md) `archivo_adjuntoToarchivo_entidad`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo archivo_entidad
const nuevoarchivo_entidad = await prisma.archivo_entidad.create({
  data: {
    archivo_id: null,
    entidad_tipo: null,
    entidad_id: null,
    fecha_vinculo: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de archivo_entidad
const registros = await prisma.archivo_entidad.findMany({
    // Incluir relaciones
    include: {
      archivo_adjunto: true
    }
});

// Obtener un archivo_entidad por ID
const registro = await prisma.archivo_entidad.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      archivo_adjunto: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `archivo_entidad`
- **Clave primaria**: `id`
- **Campos de auditoría**: ✅ Sí

## Auditoría

### ✅ Auditoría Habilitada

Este modelo incluye soporte completo de auditoría con los siguientes campos de seguimiento:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `creado_en` | `DateTime` | Fecha y hora de creación del registro |
| `creado_por` | `string` | ID del usuario que creó el registro |
| `modificado_en` | `DateTime` | Última fecha de modificación del registro |
| `modificado_por` | `string` | ID del último usuario que modificó el registro |
| `anulado_en` | `DateTime?` | Fecha de eliminación lógica (soft delete) |
| `anulado_por` | `string?` | ID del usuario que realizó la eliminación lógica |

### Registro de Actividades

Todas las operaciones CRUD en este modelo generan registros de auditoría que incluyen:

- Usuario que realizó la acción
- Tipo de operación (CREAR, ACTUALIZAR, ELIMINAR, etc.)
- Fecha y hora exacta de la operación
- Dirección IP del solicitante
- Datos anteriores y nuevos (para actualizaciones)

### Consulta de Registros

Los registros de auditoría pueden consultarse a través de la API de auditoría con filtros por:

- Rango de fechas
- Usuario
- Tipo de acción
- Entidad afectada

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./archivo_entidad/reglas_negocio.md)
- [Seguridad y Permisos](./archivo_entidad/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **archivo_adjunto**: Uno a [archivo_adjunto](./archivo_adjunto.md) `archivo_adjuntoToarchivo_entidad`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:19.973Z
