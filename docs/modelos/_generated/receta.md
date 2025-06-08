# receta

## Descripción
Modelo que representa receta en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `citaId` | `string` | ✅ | - | - |  |
| `tipo` | `string` | ✅ | - | - |  |
| `esfera_od` | `number` | ✅ | - | - |  |
| `esfera_oi` | `number` | ✅ | - | - |  |
| `cilindro_od` | `number?` | ❌ | `null` | - |  |
| `cilindro_oi` | `number?` | ❌ | `null` | - |  |
| `eje_od` | `number?` | ❌ | `null` | - |  |
| `eje_oi` | `number?` | ❌ | `null` | - |  |
| `adicion` | `number?` | ❌ | `null` | - |  |
| `agudeza_visual_od` | `string?` | ❌ | `null` | - |  |
| `agudeza_visual_oi` | `string?` | ❌ | `null` | - |  |
| `dp` | `number?` | ❌ | `null` | - |  |
| `observaciones` | `string?` | ❌ | `null` | - |  |
| `estado` | `boolean` | ✅ | - | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **cita**: Uno a [cita](./cita.md) `citaToreceta`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo receta
const nuevoreceta = await prisma.receta.create({
  data: {
    citaId: "valor",
    tipo: "valor",
    esfera_od: "valor",
    esfera_oi: "valor",
    cilindro_od: null,
    cilindro_oi: null,
    eje_od: null,
    eje_oi: null,
    adicion: null,
    agudeza_visual_od: null,
    agudeza_visual_oi: null,
    dp: null,
    observaciones: null,
    estado: "valor",
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de receta
const registros = await prisma.receta.findMany({
    // Incluir relaciones
    include: {
      cita: true
    }
});

// Obtener un receta por ID
const registro = await prisma.receta.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      cita: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `receta`
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

- [Reglas de Negocio](./receta/reglas_negocio.md)
- [Seguridad y Permisos](./receta/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **cita**: Uno a [cita](./cita.md) `citaToreceta`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-08T15:35:08.581Z
