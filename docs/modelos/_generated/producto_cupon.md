# producto_cupon

## Descripción
Modelo que representa producto_cupon en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `producto_id` | `string` | ✅ | - | - |  |
| `cupon_id` | `string` | ✅ | - | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **producto**: Uno a [producto](./producto.md) `productoToproducto_cupon`
- **cupon**: Uno a [cupon](./cupon.md) `cuponToproducto_cupon`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo producto_cupon
const nuevoproducto_cupon = await prisma.producto_cupon.create({
  data: {
    producto_id: "valor",
    cupon_id: "valor",
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de producto_cupon
const registros = await prisma.producto_cupon.findMany({
    // Incluir relaciones
    include: {
      producto: true,
      cupon: true
    }
});

// Obtener un producto_cupon por ID
const registro = await prisma.producto_cupon.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      producto: true,
      cupon: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `producto_cupon`
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

- [Reglas de Negocio](./producto_cupon/reglas_negocio.md)
- [Seguridad y Permisos](./producto_cupon/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **producto**: Uno a [producto](./producto.md) `productoToproducto_cupon`
- **cupon**: Uno a [cupon](./cupon.md) `cuponToproducto_cupon`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:19.987Z
