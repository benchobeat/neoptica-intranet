# Usuario

## Descripción
Modelo que representa Usuario en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombreCompleto` | `string` | ✅ | - | - |  |
| `email` | `string` | ✅ | - | Valor único |  |
| `password` | `string?` | ❌ | `null` | - |  |
| `telefono` | `string?` | ❌ | `null` | - |  |
| `dni` | `string?` | ❌ | `null` | Valor único |  |
| `fotoPerfil` | `string?` | ❌ | `null` | - |  |
| `direccion` | `string?` | ❌ | `null` | - |  |
| `latitud` | `number?` | ❌ | `null` | - |  |
| `longitud` | `number?` | ❌ | `null` | - |  |
| `googleUid` | `string?` | ❌ | `null` | - |  |
| `facebookUid` | `string?` | ❌ | `null` | - |  |
| `activo` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `emailVerificado` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `erpId` | `number?` | ❌ | `null` | - |  |
| `erpTipo` | `string?` | ❌ | `null` | - |  |
| `proveedorOauth` | `string?` | ❌ | `null` | - |  |
| `oauthId` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **archivosAdjuntos**: Muchos a [ArchivoAdjunto](./archivoadjunto.md) `ArchivoAdjuntoToUsuario`
- **citasCliente**: Muchos a [Cita](./cita.md) `cita_cliente_idTousuario`
- **citasOptometrista**: Muchos a [Cita](./cita.md) `cita_optometrista_idTousuario`
- **descansos**: Muchos a [DescansoEmpleado](./descansoempleado.md) `DescansoEmpleadoEmpleado`
- **descansosRevisados**: Muchos a [DescansoEmpleado](./descansoempleado.md) `DescansoEmpleadoRevisor`
- **facturas**: Muchos a [Factura](./factura.md) `FacturaToUsuario`
- **gastos**: Muchos a [Gasto](./gasto.md) `GastoToUsuario`
- **historialesCliente**: Muchos a [HistorialClinico](./historialclinico.md) `HistorialClinicoCliente`
- **historialesOptometrista**: Muchos a [HistorialClinico](./historialclinico.md) `HistorialClinicoOptometrista`
- **logsAuditoria**: Muchos a [LogAuditoria](./logauditoria.md) `LogAuditoriaToUsuario`
- **movimientosContable**: Muchos a [MovimientoContable](./movimientocontable.md) `MovimientoContableToUsuario`
- **movimientosInventario**: Muchos a [MovimientoInventario](./movimientoinventario.md) `MovimientoInventarioToUsuario`
- **pagos**: Muchos a [Pago](./pago.md) `PagoToUsuario`
- **pedidos**: Muchos a [Pedido](./pedido.md) `PedidoToUsuario`
- **resetTokens**: Muchos a [ResetToken](./resettoken.md) `ResetTokenToUsuario`
- **transferenciasRevisadas**: Muchos a [TransferenciaStock](./transferenciastock.md) `transferencia_stock_revisado_porTousuario`
- **transferenciasSolicitadas**: Muchos a [TransferenciaStock](./transferenciastock.md) `transferencia_stock_solicitado_porTousuario`
- **roles**: Muchos a [UsuarioRol](./usuariorol.md) `UsuarioRoles`
- **recetasComoPaciente**: Muchos a [Receta](./receta.md) `PacienteRecetas`
- **recetasComoOptometrista**: Muchos a [Receta](./receta.md) `OptometristaRecetas`
- **asientosContable**: Muchos a [AsientoContable](./asientocontable.md) `asiento_contable_usuario`
- **cupones**: Muchos a [Cupon](./cupon.md) `CuponToUsuario`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Usuario
const nuevoUsuario = await prisma.usuario.create({
  data: {
    nombreCompleto: "valor",
    email: "valor",
    password: null,
    telefono: null,
    dni: null,
    fotoPerfil: null,
    direccion: null,
    latitud: null,
    longitud: null,
    googleUid: null,
    facebookUid: null,
    activo: null,
    emailVerificado: null,
    erpId: null,
    erpTipo: null,
    proveedorOauth: null,
    oauthId: null,
    creadoEn: null,
    creadoPor: null,
    modificadoEn: null,
    modificadoPor: null,
    anuladoEn: null,
    anuladoPor: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de Usuario
const registros = await prisma.usuario.findMany({
    // Incluir relaciones
    include: {
      archivosAdjuntos: true,
      citasCliente: true,
      citasOptometrista: true,
      descansos: true,
      descansosRevisados: true,
      facturas: true,
      gastos: true,
      historialesCliente: true,
      historialesOptometrista: true,
      logsAuditoria: true,
      movimientosContable: true,
      movimientosInventario: true,
      pagos: true,
      pedidos: true,
      resetTokens: true,
      transferenciasRevisadas: true,
      transferenciasSolicitadas: true,
      roles: true,
      recetasComoPaciente: true,
      recetasComoOptometrista: true,
      asientosContable: true,
      cupones: true
    }
});

// Obtener un Usuario por ID
const registro = await prisma.usuario.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      archivosAdjuntos: true,
      citasCliente: true,
      citasOptometrista: true,
      descansos: true,
      descansosRevisados: true,
      facturas: true,
      gastos: true,
      historialesCliente: true,
      historialesOptometrista: true,
      logsAuditoria: true,
      movimientosContable: true,
      movimientosInventario: true,
      pagos: true,
      pedidos: true,
      resetTokens: true,
      transferenciasRevisadas: true,
      transferenciasSolicitadas: true,
      roles: true,
      recetasComoPaciente: true,
      recetasComoOptometrista: true,
      asientosContable: true,
      cupones: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `usuario`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./usuario/reglas_negocio.md)
- [Seguridad y Permisos](./usuario/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **archivosAdjuntos**: Muchos a [ArchivoAdjunto](./archivoadjunto.md) `ArchivoAdjuntoToUsuario`
- **citasCliente**: Muchos a [Cita](./cita.md) `cita_cliente_idTousuario`
- **citasOptometrista**: Muchos a [Cita](./cita.md) `cita_optometrista_idTousuario`
- **descansos**: Muchos a [DescansoEmpleado](./descansoempleado.md) `DescansoEmpleadoEmpleado`
- **descansosRevisados**: Muchos a [DescansoEmpleado](./descansoempleado.md) `DescansoEmpleadoRevisor`
- **facturas**: Muchos a [Factura](./factura.md) `FacturaToUsuario`
- **gastos**: Muchos a [Gasto](./gasto.md) `GastoToUsuario`
- **historialesCliente**: Muchos a [HistorialClinico](./historialclinico.md) `HistorialClinicoCliente`
- **historialesOptometrista**: Muchos a [HistorialClinico](./historialclinico.md) `HistorialClinicoOptometrista`
- **logsAuditoria**: Muchos a [LogAuditoria](./logauditoria.md) `LogAuditoriaToUsuario`
- **movimientosContable**: Muchos a [MovimientoContable](./movimientocontable.md) `MovimientoContableToUsuario`
- **movimientosInventario**: Muchos a [MovimientoInventario](./movimientoinventario.md) `MovimientoInventarioToUsuario`
- **pagos**: Muchos a [Pago](./pago.md) `PagoToUsuario`
- **pedidos**: Muchos a [Pedido](./pedido.md) `PedidoToUsuario`
- **resetTokens**: Muchos a [ResetToken](./resettoken.md) `ResetTokenToUsuario`
- **transferenciasRevisadas**: Muchos a [TransferenciaStock](./transferenciastock.md) `transferencia_stock_revisado_porTousuario`
- **transferenciasSolicitadas**: Muchos a [TransferenciaStock](./transferenciastock.md) `transferencia_stock_solicitado_porTousuario`
- **roles**: Muchos a [UsuarioRol](./usuariorol.md) `UsuarioRoles`
- **recetasComoPaciente**: Muchos a [Receta](./receta.md) `PacienteRecetas`
- **recetasComoOptometrista**: Muchos a [Receta](./receta.md) `OptometristaRecetas`
- **asientosContable**: Muchos a [AsientoContable](./asientocontable.md) `asiento_contable_usuario`
- **cupones**: Muchos a [Cupon](./cupon.md) `CuponToUsuario`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.985Z
