# archivo_adjunto

## Descripción
Modelo que representa archivo_adjunto en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombre_archivo` | `string` | ✅ | - | - |  |
| `url` | `string` | ✅ | - | - |  |
| `tipo` | `string?` | ❌ | `null` | - |  |
| `tamanio` | `number?` | ❌ | `null` | - |  |
| `extension` | `string?` | ❌ | `null` | - |  |
| `subido_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **usuario**: Uno a [usuario](./usuario.md) `archivo_adjuntoTousuario`
- **archivo_entidad**: Muchos a [archivo_entidad](./archivo_entidad.md) `archivo_adjuntoToarchivo_entidad`
- **descanso_empleado**: Muchos a [descanso_empleado](./descanso_empleado.md) `archivo_adjuntoTodescanso_empleado`
- **factura_factura_archivo_pdf_idToarchivo_adjunto**: Muchos a [factura](./factura.md) `factura_archivo_pdf_idToarchivo_adjunto`
- **factura_factura_archivo_xml_idToarchivo_adjunto**: Muchos a [factura](./factura.md) `factura_archivo_xml_idToarchivo_adjunto`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo archivo_adjunto
const nuevoarchivo_adjunto = await prisma.archivo_adjunto.create({
  data: {
    nombre_archivo: "valor",
    url: "valor",
    tipo: null,
    tamanio: null,
    extension: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de archivo_adjunto
const registros = await prisma.archivo_adjunto.findMany({
    // Incluir relaciones
    include: {
      usuario: true,
      archivo_entidad: true,
      descanso_empleado: true,
      factura_factura_archivo_pdf_idToarchivo_adjunto: true,
      factura_factura_archivo_xml_idToarchivo_adjunto: true
    }
});

// Obtener un archivo_adjunto por ID
const registro = await prisma.archivo_adjunto.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      usuario: true,
      archivo_entidad: true,
      descanso_empleado: true,
      factura_factura_archivo_pdf_idToarchivo_adjunto: true,
      factura_factura_archivo_xml_idToarchivo_adjunto: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `archivo_adjunto`
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

- [Reglas de Negocio](./archivo_adjunto/reglas_negocio.md)
- [Seguridad y Permisos](./archivo_adjunto/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **usuario**: Uno a [usuario](./usuario.md) `archivo_adjuntoTousuario`
- **archivo_entidad**: Muchos a [archivo_entidad](./archivo_entidad.md) `archivo_adjuntoToarchivo_entidad`
- **descanso_empleado**: Muchos a [descanso_empleado](./descanso_empleado.md) `archivo_adjuntoTodescanso_empleado`
- **factura_factura_archivo_pdf_idToarchivo_adjunto**: Muchos a [factura](./factura.md) `factura_archivo_pdf_idToarchivo_adjunto`
- **factura_factura_archivo_xml_idToarchivo_adjunto**: Muchos a [factura](./factura.md) `factura_archivo_xml_idToarchivo_adjunto`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:19.966Z
