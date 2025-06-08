# log_auditoria

## Descripción
Modelo que representa log_auditoria en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `usuarioId` | `string?` | ❌ | `null` | - |  |
| `accion` | `string` | ✅ | - | - |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `fecha` | `Date` | ✅ | - | Valor por defecto |  |
| `ip` | `string?` | ❌ | `null` | - |  |
| `tipo_correo` | `string?` | ❌ | `null` | - |  |
| `correo_destino` | `string?` | ❌ | `null` | - |  |
| `usuario_destino` | `string?` | ❌ | `null` | - |  |
| `entidad_tipo` | `string?` | ❌ | `null` | - |  |
| `entidad_id` | `string?` | ❌ | `null` | - |  |
| `estado_envio` | `string?` | ❌ | `null` | - |  |
| `mensaje_error` | `string?` | ❌ | `null` | - |  |
| `enviado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `origen_envio` | `string?` | ❌ | `null` | - |  |
| `intentos` | `number?` | ❌ | `null` | Valor por defecto |  |
| `modulo` | `string?` | ❌ | `null` | - |  |
| `entidadId` | `string?` | ❌ | `null` | - |  |
| `entidadTipo` | `string?` | ❌ | `null` | - |  |
| `movimiento_id` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **usuario**: Uno a [usuario](./usuario.md) `log_auditoriaTousuario`
- **movimiento_contable**: Uno a [movimiento_contable](./movimiento_contable.md) `log_auditoriaTomovimiento_contable`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo log_auditoria
const nuevolog_auditoria = await prisma.log_auditoria.create({
  data: {
    usuarioId: null,
    accion: "valor",
    descripcion: null,
    fecha: "valor",
    ip: null,
    tipo_correo: null,
    correo_destino: null,
    usuario_destino: null,
    entidad_tipo: null,
    entidad_id: null,
    estado_envio: null,
    mensaje_error: null,
    origen_envio: null,
    intentos: null,
    modulo: null,
    entidadId: null,
    entidadTipo: null,
    movimiento_id: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de log_auditoria
const registros = await prisma.log_auditoria.findMany({
    // Incluir relaciones
    include: {
      usuario: true,
      movimiento_contable: true
    }
});

// Obtener un log_auditoria por ID
const registro = await prisma.log_auditoria.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      usuario: true,
      movimiento_contable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `log_auditoria`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./log_auditoria/reglas_negocio.md)
- [Seguridad y Permisos](./log_auditoria/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **usuario**: Uno a [usuario](./usuario.md) `log_auditoriaTousuario`
- **movimiento_contable**: Uno a [movimiento_contable](./movimiento_contable.md) `log_auditoriaTomovimiento_contable`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:20.012Z
