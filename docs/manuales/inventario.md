# INVENTARIO Y OPERACIÓN MULTISUCURSAL – INTRANET NEÓPTICA (v2)

## **A. Gestión Integral de Inventario**

- Inventario gestionado por sucursal, producto y estado (activo, bajo stock, agotado, anulado).
- Consulta rápida y búsqueda avanzada: por producto, código, categoría, estado, sucursal.
- Visualización de stock mínimo, alerta automática al llegar al umbral definido por producto/sucursal.

## **B. Movimientos de Inventario**

### **1. Ingresos, Salidas y Ajustes:**
    - Registro de ingresos de productos (compra, devolución, transferencia recibida, etc.).
    - Registro de salidas (venta, merma, transferencia enviada, ajuste).
    - Cada movimiento requiere motivo, usuario responsable y puede llevar archivo adjunto justificativo.
    - Los movimientos quedan logueados con hora, usuario, entidad relacionada y motivo.

### **2. Transferencias entre Sucursales:**
    - Flujo de solicitud de transferencia (producto, cantidad, sucursal origen y destino, motivo, adjunto opcional).
    - Estado de transferencia: pendiente, aprobada, rechazada, completada, anulada.
    - Solo usuarios autorizados pueden aprobar/rechazar; cada acción queda logueada con comentario obligatorio.
    - Visualización de historial y seguimiento por estado.

### **3. Reversas y Anulaciones:**
    - Movimientos pueden ser reversados por error/ajuste; se crea movimiento inverso vinculado.
    - Las anulaciones/reversas requieren motivo/comentario obligatorio y quedan bloqueadas para edición posterior.

### **4. Inventario No Negativo y Control de Stock:**
    - Validaciones automáticas: no permite salidas si el stock es insuficiente.
    - Alertas de stock bajo y reportes periódicos automáticos para admins/gerentes.

## **C. Reporting y Paneles Avanzados**

- Reportes de inventario por sucursal, categoría, estado, periodo.
- Exportación a Excel/CSV de movimientos, transferencias, historial completo por producto.
- Panel de inventario bajo/agotado y movimientos recientes.
- KPI y dashboards: rotación de inventario, valor en stock, movimientos anómalos.

## **D. Adjuntos y Evidencia Documental**

- Cualquier movimiento (ingreso, salida, ajuste, transferencia) puede tener asociado uno o varios archivos adjuntos (facturas, actas, fotos, soporte).
- Visualización de adjuntos desde ficha de producto, panel de movimiento, reporte de auditoría.
- Logs de descarga, subida, modificación y eliminación de adjuntos.

## **E. Seguridad, Logs y Auditoría**

- Todas las acciones críticas quedan registradas en logs: creación, edición, reversa, anulación, descarga de adjuntos.
- Solo usuarios con permisos adecuados pueden modificar, aprobar/rechazar transferencias, ejecutar reversas o anular movimientos.
- Paneles de logs e historial de inventario para auditoría interna/externa.

## **F. Ejemplo de Wireframe Textual: Panel de Inventario Multisucursal**

| INVENTARIO GENERAL – SUCURSAL: [Centro ▼] 				|
| Producto 	| Stock 	| Stock Mín. 	| Estado 	| [Ver Mov.] [Ajustar] 	|
| Lente X 	| 3 	| 5 		| ⚠ Bajo	| [ ] [ + ]		|
| Lente Y 	| 10 	| 3 		| Ok 		| [ ] [ + ] 		|
| Accesorio Z 	| 0	 | 2		 | 🔴 Agotado	| [ ] [ + ]		|
[Ingresar Producto]	[Solicitar Transferencia]		[Exportar Reporte]

Alertas: 2 productos con bajo stock

| Movimientos recientes: |
| Fecha | Producto 	| Tipo 		| Cantidad 	| Usuario 	| Estado 	|
| 13/07 | Lente X 	| Salida 	| -2 		| vdr1 		| Ok 		|
| 12/07 | Lente Y 	| Ajuste 	| +5 		| admin 	| Ok 		|
| ... |
| [Ver Adjuntos]	[Historial]	[Panel de Transferencias]	[Volver] 	|

---

## **Notas clave:**
- La operación multisucursal y la trazabilidad de movimientos son centrales para la integridad y el control.
- Los paneles UX permiten detectar anomalías, dar soporte y responder rápido ante faltantes o errores de inventario.
- Todo el flujo es auditable, seguro y preparado para crecer en número de sucursales, productos y usuarios.
