# Modelos de Datos

Esta sección contiene la documentación técnica de los modelos de datos utilizados en la aplicación.

> **Nota**: La documentación técnica generada automáticamente se encuentra en la carpeta [`_generated/`](./_generated/).
> Para cada modelo, la documentación personalizada se encuentra en su respectiva carpeta.

## Lista de Modelos

- [archivo_adjunto](./archivo_adjunto/) - [Ver documentación generada](./_generated/archivo_adjunto.md)
- [archivo_entidad](./archivo_entidad/) - [Ver documentación generada](./_generated/archivo_entidad.md)
- [cita](./cita/) - [Ver documentación generada](./_generated/cita.md)
- [cuenta_contable](./cuenta_contable/) - [Ver documentación generada](./_generated/cuenta_contable.md)
- [cupon](./cupon/) - [Ver documentación generada](./_generated/cupon.md)
- [db_migrations](./db_migrations/) - [Ver documentación generada](./_generated/db_migrations.md)
- [producto_cupon](./producto_cupon/) - [Ver documentación generada](./_generated/producto_cupon.md)
- [descanso_empleado](./descanso_empleado/) - [Ver documentación generada](./_generated/descanso_empleado.md)
- [detalle_pedido](./detalle_pedido/) - [Ver documentación generada](./_generated/detalle_pedido.md)
- [factura](./factura/) - [Ver documentación generada](./_generated/factura.md)
- [gasto](./gasto/) - [Ver documentación generada](./_generated/gasto.md)
- [historial_clinico](./historial_clinico/) - [Ver documentación generada](./_generated/historial_clinico.md)
- [integracion_erp](./integracion_erp/) - [Ver documentación generada](./_generated/integracion_erp.md)
- [inventario](./inventario/) - [Ver documentación generada](./_generated/inventario.md)
- [log_auditoria](./log_auditoria/) - [Ver documentación generada](./_generated/log_auditoria.md)
- [asiento_contable](./asiento_contable/) - [Ver documentación generada](./_generated/asiento_contable.md)
- [movimiento_contable](./movimiento_contable/) - [Ver documentación generada](./_generated/movimiento_contable.md)
- [movimiento_contable_entidad](./movimiento_contable_entidad/) - [Ver documentación generada](./_generated/movimiento_contable_entidad.md)
- [movimiento_inventario](./movimiento_inventario/) - [Ver documentación generada](./_generated/movimiento_inventario.md)
- [pago](./pago/) - [Ver documentación generada](./_generated/pago.md)
- [pedido](./pedido/) - [Ver documentación generada](./_generated/pedido.md)
- [producto](./producto/) - [Ver documentación generada](./_generated/producto.md)
- [marca](./marca/) - [Ver documentación generada](./_generated/marca.md)
- [color](./color/) - [Ver documentación generada](./_generated/color.md)
- [rol](./rol/) - [Ver documentación generada](./_generated/rol.md)
- [sucursal](./sucursal/) - [Ver documentación generada](./_generated/sucursal.md)
- [transferencia_stock](./transferencia_stock/) - [Ver documentación generada](./_generated/transferencia_stock.md)
- [usuario](./usuario/) - [Ver documentación generada](./_generated/usuario.md)
- [usuario_rol](./usuario_rol/) - [Ver documentación generada](./_generated/usuario_rol.md)
- [reset_token](./reset_token/) - [Ver documentación generada](./_generated/reset_token.md)
- [receta](./receta/) - [Ver documentación generada](./_generated/receta.md)

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
