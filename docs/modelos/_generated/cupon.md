# cupon

## Descripción
Modelo que representa cupon en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `codigo` | `string` | ✅ | - | Valor único |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `monto_descuento` | `number?` | ❌ | `null` | - |  |
| `vigencia_inicio` | `Date?` | ❌ | `null` | - |  |
| `vigencia_fin` | `Date?` | ❌ | `null` | - |  |
| `limite_uso` | `number?` | ❌ | `null` | - |  |
| `usos_realizados` | `number?` | ❌ | `null` | Valor por defecto |  |
| `activo` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `tipo` | `string?` | ❌ | `null` | - |  |
| `usuario_id` | `string?` | ❌ | `null` | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **pedidos**: Muchos a [pedido](./pedido.md) `cuponTopedido`
- **usuario**: Uno a [usuario](./usuario.md) `cuponTousuario`
- **productos_cupones**: Muchos a [producto_cupon](./producto_cupon.md) `cuponToproducto_cupon`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo cupon
const nuevocupon = await prisma.cupon.create({
  data: {
    codigo: "valor",
    descripcion: null,
    monto_descuento: null,
    vigencia_inicio: null,
    vigencia_fin: null,
    limite_uso: null,
    usos_realizados: null,
    activo: null,
    tipo: null,
    usuario_id: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de cupon
const registros = await prisma.cupon.findMany({
    // Incluir relaciones
    include: {
      pedidos: true,
      usuario: true,
      productos_cupones: true
    }
});

// Obtener un cupon por ID
const registro = await prisma.cupon.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      pedidos: true,
      usuario: true,
      productos_cupones: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `cupon`
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

- [Reglas de Negocio](./cupon/reglas_negocio.md)
- [Seguridad y Permisos](./cupon/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **pedidos**: Muchos a [pedido](./pedido.md) `cuponTopedido`
- **usuario**: Uno a [usuario](./usuario.md) `cuponTousuario`
- **productos_cupones**: Muchos a [producto_cupon](./producto_cupon.md) `cuponToproducto_cupon`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-08T15:35:08.499Z
