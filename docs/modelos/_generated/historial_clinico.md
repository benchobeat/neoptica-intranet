# historial_clinico

## Descripción
Modelo que representa historial_clinico en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `cliente_id` | `string?` | ❌ | `null` | - |  |
| `optometrista_id` | `string?` | ❌ | `null` | - |  |
| `cita_id` | `string?` | ❌ | `null` | - |  |
| `fecha` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `receta_id` | `string?` | ❌ | `null` | - |  |
| `version` | `number?` | ❌ | `null` | Valor por defecto |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **cita**: Uno a [cita](./cita.md) `citaTohistorial_clinico`
- **usuario_historial_clinico_cliente_idTousuario**: Uno a [usuario](./usuario.md) `historial_clinico_cliente_idTousuario`
- **usuario_historial_clinico_optometrista_idTousuario**: Uno a [usuario](./usuario.md) `historial_clinico_optometrista_idTousuario`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo historial_clinico
const nuevohistorial_clinico = await prisma.historial_clinico.create({
  data: {
    cliente_id: null,
    optometrista_id: null,
    cita_id: null,
    fecha: null,
    descripcion: null,
    receta_id: null,
    version: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de historial_clinico
const registros = await prisma.historial_clinico.findMany({
    // Incluir relaciones
    include: {
      cita: true,
      usuario_historial_clinico_cliente_idTousuario: true,
      usuario_historial_clinico_optometrista_idTousuario: true
    }
});

// Obtener un historial_clinico por ID
const registro = await prisma.historial_clinico.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      cita: true,
      usuario_historial_clinico_cliente_idTousuario: true,
      usuario_historial_clinico_optometrista_idTousuario: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `historial_clinico`
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

- [Reglas de Negocio](./historial_clinico/reglas_negocio.md)
- [Seguridad y Permisos](./historial_clinico/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **cita**: Uno a [cita](./cita.md) `citaTohistorial_clinico`
- **usuario_historial_clinico_cliente_idTousuario**: Uno a [usuario](./usuario.md) `historial_clinico_cliente_idTousuario`
- **usuario_historial_clinico_optometrista_idTousuario**: Uno a [usuario](./usuario.md) `historial_clinico_optometrista_idTousuario`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:20.003Z
