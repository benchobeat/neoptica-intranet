# usuario

## Descripción
Modelo que representa usuario en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombre_completo` | `string` | ✅ | - | - |  |
| `email` | `string` | ✅ | - | Valor único |  |
| `password` | `string?` | ❌ | `null` | - |  |
| `telefono` | `string?` | ❌ | `null` | - | password: Contraseña hasheada para login tradicional con email/contraseña.\nSe recomienda bcrypt (nunca almacenar en texto plano).\nOpcional para compatibilidad con usuarios autenticados vía Google/Facebook. |
| `dni` | `string?` | ❌ | `null` | Valor único |  |
| `foto_perfil` | `string?` | ❌ | `null` | - |  |
| `direccion` | `string?` | ❌ | `null` | - |  |
| `latitud` | `number?` | ❌ | `null` | - |  |
| `longitud` | `number?` | ❌ | `null` | - |  |
| `google_uid` | `string?` | ❌ | `null` | - |  |
| `facebook_uid` | `string?` | ❌ | `null` | - |  |
| `activo` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `erp_id` | `number?` | ❌ | `null` | - |  |
| `erp_tipo` | `string?` | ❌ | `null` | - |  |
| `proveedor_oauth` | `string?` | ❌ | `null` | - |  |
| `oauth_id` | `string?` | ❌ | `null` | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **archivo_adjunto**: Muchos a [archivo_adjunto](./archivo_adjunto.md) `archivo_adjuntoTousuario`
- **cita_cita_cliente_idTousuario**: Muchos a [cita](./cita.md) `cita_cliente_idTousuario`
- **cita_cita_optometrista_idTousuario**: Muchos a [cita](./cita.md) `cita_optometrista_idTousuario`
- **descanso_empleado_descanso_empleado_empleado_idTousuario**: Muchos a [descanso_empleado](./descanso_empleado.md) `descanso_empleado_empleado_idTousuario`
- **descanso_empleado_descanso_empleado_revisado_porTousuario**: Muchos a [descanso_empleado](./descanso_empleado.md) `descanso_empleado_revisado_porTousuario`
- **factura**: Muchos a [factura](./factura.md) `facturaTousuario`
- **gasto**: Muchos a [gasto](./gasto.md) `gastoTousuario`
- **historial_clinico_historial_clinico_cliente_idTousuario**: Muchos a [historial_clinico](./historial_clinico.md) `historial_clinico_cliente_idTousuario`
- **historial_clinico_historial_clinico_optometrista_idTousuario**: Muchos a [historial_clinico](./historial_clinico.md) `historial_clinico_optometrista_idTousuario`
- **log_auditoria**: Muchos a [log_auditoria](./log_auditoria.md) `log_auditoriaTousuario`
- **movimiento_contable**: Muchos a [movimiento_contable](./movimiento_contable.md) `movimiento_contableTousuario`
- **movimiento_inventario**: Muchos a [movimiento_inventario](./movimiento_inventario.md) `movimiento_inventarioTousuario`
- **pago**: Muchos a [pago](./pago.md) `pagoTousuario`
- **pedido**: Muchos a [pedido](./pedido.md) `pedidoTousuario`
- **reset_token**: Muchos a [reset_token](./reset_token.md) `reset_tokenTousuario`
- **transferencia_stock_transferencia_stock_revisado_porTousuario**: Muchos a [transferencia_stock](./transferencia_stock.md) `transferencia_stock_revisado_porTousuario`
- **transferencia_stock_transferencia_stock_solicitado_porTousuario**: Muchos a [transferencia_stock](./transferencia_stock.md) `transferencia_stock_solicitado_porTousuario`
- **usuario_rol**: Muchos a [usuario_rol](./usuario_rol.md) `UsuarioRoles`
- **asiento_contable**: Muchos a [asiento_contable](./asiento_contable.md) `asiento_contable_usuario`
- **cupones**: Muchos a [cupon](./cupon.md) `cuponTousuario`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo usuario
const nuevousuario = await prisma.usuario.create({
  data: {
    nombre_completo: "valor",
    email: "valor",
    password: null,
    telefono: null, // password: Contraseña hasheada para login tradicional con email/contraseña.\nSe recomienda bcrypt (nunca almacenar en texto plano).\nOpcional para compatibilidad con usuarios autenticados vía Google/Facebook.
    dni: null,
    foto_perfil: null,
    direccion: null,
    latitud: null,
    longitud: null,
    google_uid: null,
    facebook_uid: null,
    activo: null,
    erp_id: null,
    erp_tipo: null,
    proveedor_oauth: null,
    oauth_id: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de usuario
const registros = await prisma.usuario.findMany({
    // Incluir relaciones
    include: {
      archivo_adjunto: true,
      cita_cita_cliente_idTousuario: true,
      cita_cita_optometrista_idTousuario: true,
      descanso_empleado_descanso_empleado_empleado_idTousuario: true,
      descanso_empleado_descanso_empleado_revisado_porTousuario: true,
      factura: true,
      gasto: true,
      historial_clinico_historial_clinico_cliente_idTousuario: true,
      historial_clinico_historial_clinico_optometrista_idTousuario: true,
      log_auditoria: true,
      movimiento_contable: true,
      movimiento_inventario: true,
      pago: true,
      pedido: true,
      reset_token: true,
      transferencia_stock_transferencia_stock_revisado_porTousuario: true,
      transferencia_stock_transferencia_stock_solicitado_porTousuario: true,
      usuario_rol: true,
      asiento_contable: true,
      cupones: true
    }
});

// Obtener un usuario por ID
const registro = await prisma.usuario.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      archivo_adjunto: true,
      cita_cita_cliente_idTousuario: true,
      cita_cita_optometrista_idTousuario: true,
      descanso_empleado_descanso_empleado_empleado_idTousuario: true,
      descanso_empleado_descanso_empleado_revisado_porTousuario: true,
      factura: true,
      gasto: true,
      historial_clinico_historial_clinico_cliente_idTousuario: true,
      historial_clinico_historial_clinico_optometrista_idTousuario: true,
      log_auditoria: true,
      movimiento_contable: true,
      movimiento_inventario: true,
      pago: true,
      pedido: true,
      reset_token: true,
      transferencia_stock_transferencia_stock_revisado_porTousuario: true,
      transferencia_stock_transferencia_stock_solicitado_porTousuario: true,
      usuario_rol: true,
      asiento_contable: true,
      cupones: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `usuario`
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

- [Reglas de Negocio](./usuario/reglas_negocio.md)
- [Seguridad y Permisos](./usuario/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **archivo_adjunto**: Muchos a [archivo_adjunto](./archivo_adjunto.md) `archivo_adjuntoTousuario`
- **cita_cita_cliente_idTousuario**: Muchos a [cita](./cita.md) `cita_cliente_idTousuario`
- **cita_cita_optometrista_idTousuario**: Muchos a [cita](./cita.md) `cita_optometrista_idTousuario`
- **descanso_empleado_descanso_empleado_empleado_idTousuario**: Muchos a [descanso_empleado](./descanso_empleado.md) `descanso_empleado_empleado_idTousuario`
- **descanso_empleado_descanso_empleado_revisado_porTousuario**: Muchos a [descanso_empleado](./descanso_empleado.md) `descanso_empleado_revisado_porTousuario`
- **factura**: Muchos a [factura](./factura.md) `facturaTousuario`
- **gasto**: Muchos a [gasto](./gasto.md) `gastoTousuario`
- **historial_clinico_historial_clinico_cliente_idTousuario**: Muchos a [historial_clinico](./historial_clinico.md) `historial_clinico_cliente_idTousuario`
- **historial_clinico_historial_clinico_optometrista_idTousuario**: Muchos a [historial_clinico](./historial_clinico.md) `historial_clinico_optometrista_idTousuario`
- **log_auditoria**: Muchos a [log_auditoria](./log_auditoria.md) `log_auditoriaTousuario`
- **movimiento_contable**: Muchos a [movimiento_contable](./movimiento_contable.md) `movimiento_contableTousuario`
- **movimiento_inventario**: Muchos a [movimiento_inventario](./movimiento_inventario.md) `movimiento_inventarioTousuario`
- **pago**: Muchos a [pago](./pago.md) `pagoTousuario`
- **pedido**: Muchos a [pedido](./pedido.md) `pedidoTousuario`
- **reset_token**: Muchos a [reset_token](./reset_token.md) `reset_tokenTousuario`
- **transferencia_stock_transferencia_stock_revisado_porTousuario**: Muchos a [transferencia_stock](./transferencia_stock.md) `transferencia_stock_revisado_porTousuario`
- **transferencia_stock_transferencia_stock_solicitado_porTousuario**: Muchos a [transferencia_stock](./transferencia_stock.md) `transferencia_stock_solicitado_porTousuario`
- **usuario_rol**: Muchos a [usuario_rol](./usuario_rol.md) `UsuarioRoles`
- **asiento_contable**: Muchos a [asiento_contable](./asiento_contable.md) `asiento_contable_usuario`
- **cupones**: Muchos a [cupon](./cupon.md) `cuponTousuario`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:20.051Z
