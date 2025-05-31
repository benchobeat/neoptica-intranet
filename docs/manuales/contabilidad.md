# PEDIDOS, FACTURACIÓN Y CONTABILIDAD – INTRANET NEÓPTICA (v2)

## **A. Flujos de Pedidos y Ventas**

- El vendedor o usuario autorizado registra una nueva venta:
    - Busca o registra el cliente (usuario único, datos fiscales y correo electrónico).
    - Selecciona productos/servicios y cantidades, validados contra inventario en tiempo real.
    - Aplica cupones, descuentos y selecciona método de pago (efectivo, tarjeta, transferencia, etc.).
    - El sistema calcula impuestos, subtotal y total en la moneda definida.

- Al confirmar la venta:
    - Se crea un pedido con ciclo de vida (pendiente, pagado, anulado, reversado), vinculado al cliente, vendedor y sucursal.
    - El pedido disminuye automáticamente el inventario.
    - Se genera la factura electrónica cumpliendo los requisitos del SRI (campos obligatorios, formato XML/PDF).
    - El estado de la factura (emitida, enviada, pendiente, anulada, rechazada) es visible y auditable.
    - El sistema registra el movimiento contable vinculado a la venta.

- Visualización y descarga de factura electrónica:
    - El usuario puede descargar, imprimir o enviar la factura por correo electrónico al cliente.
    - Toda la actividad de envío, error y reintento queda registrada en logs (`log_envio_correo`).

- Pedidos y facturas pueden ser anulados (según normativa), registrando motivo y log. Anulaciones bloquean toda edición posterior.

## **B. Facturación Electrónica y Cumplimiento SRI**

- Integración directa con SRI para validación, emisión y anulación de facturas.
- Almacenamiento seguro de XML y PDF, disponibles para consulta y descarga desde la ficha de pedido/factura.
- Estado de sincronización/exportación ERP/SRI siempre visible, con logs de reintentos y errores.
- El sistema alerta a usuarios/admins si hay fallas, rechazos o pendientes en el proceso fiscal.

## **C. Contabilidad Interna y Movimientos**

- Plan de cuentas contables jerárquico, alineado a normativas fiscales y listo para integración con ERP externo.
- Cada venta/pedido/factura genera automáticamente movimiento(s) contable(s), asociados al pedido, cliente y cuenta correspondiente.
- Registro de movimientos por tipo: ingreso, egreso, gasto, reversa, ajuste, transferencia.
- Visualización de estado: vigente, reversado, exportado, pendiente, anulado.
- Logs detallados por cada movimiento, reversa, exportación, anulación, con motivo y usuario responsable.

- Panel de conciliación contable:
    - Visualiza operaciones exportadas/pedientes/exportadas a ERP.
    - Permite acciones manuales en caso de error o desajuste (con log de responsable y motivo).
    - Exportación de reportes contables para administración y auditoría.

## **D. Reporting y Multimoneda**

- Visualización de ventas, facturación y movimientos por moneda, sucursal, usuario, periodo, estado.
- Paneles de KPIs: ventas mensuales, facturación por canal, total recaudado, facturas anuladas, movimientos contables por tipo, discrepancias.
- Exportación de reportes en formato Excel/CSV para gestión, conciliación y soporte fiscal.

## **E. Logs, Auditoría y Evidencia**

- Todo el ciclo de vida de cada pedido, factura y movimiento queda registrado en logs: creación, modificación, anulación, reversa, envío de correo, exportación, errores.
- Acceso y exportación de logs solo para roles autorizados.

## **F. Ejemplo de Wireframe Textual: Ficha de Pedido y Factura**
| PEDIDO #000412 – Cliente: Juan Pérez (C.I. 1234567890) 				|
| Fecha: 13/07/2024 Sucursal: Centro Vendedor: D. Torres 				|

Estado: Pagado Moneda: USD Total: $224
Productos:
Lente X (2) – $80 Lente Y (1) – $64
---------------------------------------------------------------------
Factura Electrónica: 002-000000124 Estado: Emitida (SRI)
[Descargar PDF]	[Descargar XML]	[Enviar por Correo]	[Imprimir]
Estado de envío: Entregada al cliente
---------------------------------------------------------------------
Logs y Ciclo de Vida:
13/07 12:04 Creado por vdr1
13/07 12:06 Factura emitida SRI
13/07 12:07 Factura enviada por correo
13/07 13:00 Pedido pagado, conciliado
---------------------------------------------------------------------
Movimientos Contables Asociados:
13/07 12:07 Ingreso por venta $224 Cuenta: Ventas Local
---------------------------------------------------------------------
[Anular]	[Reversar]	[Exportar]	[Ver Historial]	[Volver]

---

## **Notas clave:**
- El flujo está 100% alineado con inventario, facturación, contabilidad y cumplimiento SRI.
- Todo el ciclo es auditable, seguro y preparado para ERP e integración multicanal.
- Los flujos privilegian la rapidez, la trazabilidad y la seguridad en cada etapa.