# Modelos de Datos

Esta sección contiene la documentación técnica de los modelos de datos utilizados en la aplicación.

> **Nota**: La documentación técnica generada automáticamente se encuentra en la carpeta [`_generated/`](./_generated/).
> Para cada modelo, la documentación personalizada se encuentra en su respectiva carpeta.

## Lista de Modelos

- [ArchivoAdjunto](./archivoadjunto/) - [Ver documentación generada](./_generated/archivoadjunto.md)
- [ArchivoEntidad](./archivoentidad/) - [Ver documentación generada](./_generated/archivoentidad.md)
- [Cita](./cita/) - [Ver documentación generada](./_generated/cita.md)
- [CuentaContable](./cuentacontable/) - [Ver documentación generada](./_generated/cuentacontable.md)
- [Cupon](./cupon/) - [Ver documentación generada](./_generated/cupon.md)
- [DbMigration](./dbmigration/) - [Ver documentación generada](./_generated/dbmigration.md)
- [ProductoCupon](./productocupon/) - [Ver documentación generada](./_generated/productocupon.md)
- [DescansoEmpleado](./descansoempleado/) - [Ver documentación generada](./_generated/descansoempleado.md)
- [DetallePedido](./detallepedido/) - [Ver documentación generada](./_generated/detallepedido.md)
- [Factura](./factura/) - [Ver documentación generada](./_generated/factura.md)
- [Gasto](./gasto/) - [Ver documentación generada](./_generated/gasto.md)
- [HistorialClinico](./historialclinico/) - [Ver documentación generada](./_generated/historialclinico.md)
- [IntegracionErp](./integracionerp/) - [Ver documentación generada](./_generated/integracionerp.md)
- [Inventario](./inventario/) - [Ver documentación generada](./_generated/inventario.md)
- [LogAuditoria](./logauditoria/) - [Ver documentación generada](./_generated/logauditoria.md)
- [AsientoContable](./asientocontable/) - [Ver documentación generada](./_generated/asientocontable.md)
- [MovimientoContable](./movimientocontable/) - [Ver documentación generada](./_generated/movimientocontable.md)
- [MovimientoContableEntidad](./movimientocontableentidad/) - [Ver documentación generada](./_generated/movimientocontableentidad.md)
- [MovimientoInventario](./movimientoinventario/) - [Ver documentación generada](./_generated/movimientoinventario.md)
- [Pago](./pago/) - [Ver documentación generada](./_generated/pago.md)
- [Pedido](./pedido/) - [Ver documentación generada](./_generated/pedido.md)
- [Producto](./producto/) - [Ver documentación generada](./_generated/producto.md)
- [Marca](./marca/) - [Ver documentación generada](./_generated/marca.md)
- [Color](./color/) - [Ver documentación generada](./_generated/color.md)
- [Rol](./rol/) - [Ver documentación generada](./_generated/rol.md)
- [Sucursal](./sucursal/) - [Ver documentación generada](./_generated/sucursal.md)
- [Usuario](./usuario/) - [Ver documentación generada](./_generated/usuario.md)
- [UsuarioRol](./usuariorol/) - [Ver documentación generada](./_generated/usuariorol.md)
- [ResetToken](./resettoken/) - [Ver documentación generada](./_generated/resettoken.md)
- [TransferenciaStock](./transferenciastock/) - [Ver documentación generada](./_generated/transferenciastock.md)
- [Receta](./receta/) - [Ver documentación generada](./_generated/receta.md)

## Estructura de Carpetas

```
docs/modelos/
├── _generated/          # Documentación generada automáticamente
├── usuario/             # Documentación personalizada por modelo
│   ├── README.md        # Página principal del modelo
│   ├── reglas_negocio.md # Reglas de negocio
│   ├── seguridad.md     # Políticas de seguridad
│   ├── flujos/          # Diagramas de flujo
│   └── integraciones/   # Documentación de integraciones
└── ...
```

## Cómo Usar

1. Navega a la carpeta del modelo que te interese
2. Consulta la documentación personalizada en el archivo `README.md`
3. Para detalles técnicos, consulta la documentación generada en `_generated/`

## Regenerar Documentación

Para actualizar la documentación después de cambios en el esquema de la base de datos:

```bash
npm run docs:generate
```

> **Nota**: La documentación generada automáticamente sobrescribirá los archivos en `_generated/`, pero no afectará la documentación personalizada en las carpetas de cada modelo.
