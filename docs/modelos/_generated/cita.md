# cita

## Descripción
Modelo que representa cita en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `cliente_id` | `string?` | ❌ | `null` | - |  |
| `optometrista_id` | `string?` | ❌ | `null` | - |  |
| `sucursal_id` | `string?` | ❌ | `null` | - |  |
| `fecha_hora` | `Date` | ✅ | - | - |  |
| `estado` | `string?` | ❌ | `null` | Valor por defecto |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **usuario_cita_cliente_idTousuario**: Uno a [usuario](./usuario.md) `cita_cliente_idTousuario`
- **usuario_cita_optometrista_idTousuario**: Uno a [usuario](./usuario.md) `cita_optometrista_idTousuario`
- **sucursal**: Uno a [sucursal](./sucursal.md) `citaTosucursal`
- **historial_clinico**: Muchos a [historial_clinico](./historial_clinico.md) `citaTohistorial_clinico`
- **recetas**: Muchos a [receta](./receta.md) `citaToreceta`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo cita
const nuevocita = await prisma.cita.create({
  data: {
    cliente_id: null,
    optometrista_id: null,
    sucursal_id: null,
    fecha_hora: "valor",
    estado: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de cita
const registros = await prisma.cita.findMany({
    // Incluir relaciones
    include: {
      usuario_cita_cliente_idTousuario: true,
      usuario_cita_optometrista_idTousuario: true,
      sucursal: true,
      historial_clinico: true,
      recetas: true
    }
});

// Obtener un cita por ID
const registro = await prisma.cita.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      usuario_cita_cliente_idTousuario: true,
      usuario_cita_optometrista_idTousuario: true,
      sucursal: true,
      historial_clinico: true,
      recetas: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `cita`
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

- [Reglas de Negocio](./cita/reglas_negocio.md)
- [Seguridad y Permisos](./cita/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **usuario_cita_cliente_idTousuario**: Uno a [usuario](./usuario.md) `cita_cliente_idTousuario`
- **usuario_cita_optometrista_idTousuario**: Uno a [usuario](./usuario.md) `cita_optometrista_idTousuario`
- **sucursal**: Uno a [sucursal](./sucursal.md) `citaTosucursal`
- **historial_clinico**: Muchos a [historial_clinico](./historial_clinico.md) `citaTohistorial_clinico`
- **recetas**: Muchos a [receta](./receta.md) `citaToreceta`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-08T15:35:08.494Z
