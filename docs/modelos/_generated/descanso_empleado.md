# descanso_empleado

## Descripción
Modelo que representa descanso_empleado en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `empleado_id` | `string?` | ❌ | `null` | - |  |
| `sucursal_id` | `string?` | ❌ | `null` | - |  |
| `fecha_inicio` | `Date` | ✅ | - | - |  |
| `fecha_fin` | `Date` | ✅ | - | - |  |
| `motivo` | `string?` | ❌ | `null` | - |  |
| `estado` | `string?` | ❌ | `null` | Valor por defecto |  |
| `adjunto_id` | `string?` | ❌ | `null` | - |  |
| `revisado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `comentario_admin` | `string?` | ❌ | `null` | - |  |
| `revisado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **archivo_adjunto**: Uno a [archivo_adjunto](./archivo_adjunto.md) `archivo_adjuntoTodescanso_empleado`
- **usuario_descanso_empleado_empleado_idTousuario**: Uno a [usuario](./usuario.md) `descanso_empleado_empleado_idTousuario`
- **usuario_descanso_empleado_revisado_porTousuario**: Uno a [usuario](./usuario.md) `descanso_empleado_revisado_porTousuario`
- **sucursal**: Uno a [sucursal](./sucursal.md) `descanso_empleadoTosucursal`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo descanso_empleado
const nuevodescanso_empleado = await prisma.descanso_empleado.create({
  data: {
    empleado_id: null,
    sucursal_id: null,
    fecha_inicio: "valor",
    fecha_fin: "valor",
    motivo: null,
    estado: null,
    adjunto_id: null,
    comentario_admin: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de descanso_empleado
const registros = await prisma.descanso_empleado.findMany({
    // Incluir relaciones
    include: {
      archivo_adjunto: true,
      usuario_descanso_empleado_empleado_idTousuario: true,
      usuario_descanso_empleado_revisado_porTousuario: true,
      sucursal: true
    }
});

// Obtener un descanso_empleado por ID
const registro = await prisma.descanso_empleado.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      archivo_adjunto: true,
      usuario_descanso_empleado_empleado_idTousuario: true,
      usuario_descanso_empleado_revisado_porTousuario: true,
      sucursal: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `descanso_empleado`
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

- [Reglas de Negocio](./descanso_empleado/reglas_negocio.md)
- [Seguridad y Permisos](./descanso_empleado/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **archivo_adjunto**: Uno a [archivo_adjunto](./archivo_adjunto.md) `archivo_adjuntoTodescanso_empleado`
- **usuario_descanso_empleado_empleado_idTousuario**: Uno a [usuario](./usuario.md) `descanso_empleado_empleado_idTousuario`
- **usuario_descanso_empleado_revisado_porTousuario**: Uno a [usuario](./usuario.md) `descanso_empleado_revisado_porTousuario`
- **sucursal**: Uno a [sucursal](./sucursal.md) `descanso_empleadoTosucursal`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:19.990Z
