# detalle_pedido

## Descripción
Modelo que representa detalle_pedido en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `pedido_id` | `string?` | ❌ | `null` | - |  |
| `producto_id` | `string?` | ❌ | `null` | - |  |
| `cantidad` | `number` | ✅ | - | - |  |
| `precio_unitario` | `number` | ✅ | - | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **pedido**: Uno a [pedido](./pedido.md) `detalle_pedidoTopedido`
- **producto**: Uno a [producto](./producto.md) `detalle_pedidoToproducto`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo detalle_pedido
const nuevodetalle_pedido = await prisma.detalle_pedido.create({
  data: {
    pedido_id: null,
    producto_id: null,
    cantidad: "valor",
    precio_unitario: "valor",
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de detalle_pedido
const registros = await prisma.detalle_pedido.findMany({
    // Incluir relaciones
    include: {
      pedido: true,
      producto: true
    }
});

// Obtener un detalle_pedido por ID
const registro = await prisma.detalle_pedido.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      pedido: true,
      producto: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `detalle_pedido`
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

- [Reglas de Negocio](./detalle_pedido/reglas_negocio.md)
- [Seguridad y Permisos](./detalle_pedido/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **pedido**: Uno a [pedido](./pedido.md) `detalle_pedidoTopedido`
- **producto**: Uno a [producto](./producto.md) `detalle_pedidoToproducto`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:19.993Z
