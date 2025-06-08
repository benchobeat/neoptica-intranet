# movimiento_inventario

## Descripción
Modelo que representa movimiento_inventario en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `inventario_id` | `string?` | ❌ | `null` | - |  |
| `usuario_id` | `string?` | ❌ | `null` | - |  |
| `tipo` | `string?` | ❌ | `null` | - |  |
| `cantidad` | `number` | ✅ | - | - |  |
| `stock_resultante` | `number?` | ❌ | `null` | - |  |
| `motivo` | `string?` | ❌ | `null` | - |  |
| `fecha` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `reversa_de` | `string?` | ❌ | `null` | - |  |
| `anulado` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **inventario**: Uno a [inventario](./inventario.md) `inventarioTomovimiento_inventario`
- **movimiento_inventario**: Uno a [movimiento_inventario](./movimiento_inventario.md) `movimiento_inventarioTomovimiento_inventario`
- **other_movimiento_inventario**: Muchos a [movimiento_inventario](./movimiento_inventario.md) `movimiento_inventarioTomovimiento_inventario`
- **usuario**: Uno a [usuario](./usuario.md) `movimiento_inventarioTousuario`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo movimiento_inventario
const nuevomovimiento_inventario = await prisma.movimiento_inventario.create({
  data: {
    inventario_id: null,
    usuario_id: null,
    tipo: null,
    cantidad: "valor",
    stock_resultante: null,
    motivo: null,
    fecha: null,
    reversa_de: null,
    anulado: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de movimiento_inventario
const registros = await prisma.movimiento_inventario.findMany({
    // Incluir relaciones
    include: {
      inventario: true,
      movimiento_inventario: true,
      other_movimiento_inventario: true,
      usuario: true
    }
});

// Obtener un movimiento_inventario por ID
const registro = await prisma.movimiento_inventario.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      inventario: true,
      movimiento_inventario: true,
      other_movimiento_inventario: true,
      usuario: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `movimiento_inventario`
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

- [Reglas de Negocio](./movimiento_inventario/reglas_negocio.md)
- [Seguridad y Permisos](./movimiento_inventario/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **inventario**: Uno a [inventario](./inventario.md) `inventarioTomovimiento_inventario`
- **movimiento_inventario**: Uno a [movimiento_inventario](./movimiento_inventario.md) `movimiento_inventarioTomovimiento_inventario`
- **other_movimiento_inventario**: Muchos a [movimiento_inventario](./movimiento_inventario.md) `movimiento_inventarioTomovimiento_inventario`
- **usuario**: Uno a [usuario](./usuario.md) `movimiento_inventarioTousuario`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:20.025Z
