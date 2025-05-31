# INVENTARIO Y OPERACIÓN MULTISUCURSAL – INTRANET NEÓPTICA (v2)

> **Estado de implementación (30/05/2025):** CRUD de inventario completamente implementado, incluyendo movimientos, validaciones de stock y registro de auditoría. La API de adjuntos de inventario ha sido implementada y testeada. Las transferencias entre sucursales están pendientes.

## **A. Gestión Integral de Inventario** ✅ IMPLEMENTADO

- Inventario gestionado por sucursal, producto, color, marca y estado (activo, bajo stock, agotado, anulado).
- Consulta rápida y búsqueda avanzada: por producto, código, categoría, color, marca, estado, sucursal.
- Visualización de stock mínimo, alerta automática al llegar al umbral definido por producto/sucursal/color/marca.

## **B. Movimientos de Inventario**

### **1. Ingresos, Salidas y Ajustes:** ✅ IMPLEMENTADO
    - Registro de ingresos de productos (compra, devolución, transferencia recibida, etc.).
    - Registro de salidas (venta, merma, transferencia enviada, ajuste).
    - Cada movimiento requiere motivo, usuario responsable.
    - Los movimientos quedan logueados con hora, usuario, entidad relacionada, motivo y stock_resultante tras el movimiento.
    - Operaciones protegidas por transacciones atómicas para prevenir conflictos de concurrencia.

### **2. Transferencias entre Sucursales:** ❌ PENDIENTE
    - Flujo de solicitud de transferencia (producto, color, marca, cantidad, sucursal origen y destino, motivo, adjunto opcional).
    - Estado de transferencia: pendiente, aprobada, rechazada, completada, anulada.
    - Solo usuarios con rol admin pueden aprobar/rechazar; cada acción queda logueada con comentario obligatorio.
    - Visualización de historial y seguimiento por estado.
    - Verificación de stock disponible en origen durante todo el proceso.

### **3. Reversas y Anulaciones:** ✅ IMPLEMENTADO
    - Movimientos pueden ser reversados por error/ajuste; se crea movimiento inverso vinculado.
    - Las anulaciones/reversas requieren motivo/comentario obligatorio y quedan bloqueadas para edición posterior.
    - Solo usuarios con rol admin pueden realizar anulaciones/reversas.
    - Cada movimiento de reversa registra el stock_resultante final para auditoría completa.

### **4. Inventario No Negativo y Control de Stock:** ✅ IMPLEMENTADO
    - Validaciones automáticas: no permite salidas si el stock es insuficiente.
    - Alertas de stock bajo y reportes periódicos automáticos para admins/gerentes.

## **C. Reporting y Paneles Avanzados** ✅ PARCIALMENTE IMPLEMENTADO

- Reportes de inventario por sucursal, categoría, estado, periodo. ✅
- Exportación a Excel/CSV de movimientos, transferencias, historial completo por producto. ❌
- Panel de inventario bajo/agotado y movimientos recientes. ✅
- KPI y dashboards: rotación de inventario, valor en stock, movimientos anómalos. ❌

## **D. Adjuntos y Evidencia Documental** ✅ PARCIALMENTE IMPLEMENTADO

- API backend para adjuntos de inventario completamente implementada: ✅
  - Subida de archivos adjuntos para inventario ✅
  - Listado de adjuntos por inventario ✅
  - Descarga de adjuntos ✅
  - Eliminación de adjuntos ✅
  - Middleware de autenticación optimizado para evitar conflictos con Multer ✅
  - Pruebas exhaustivas que verifican permisos y operaciones ✅
- Integración con frontend pendiente: ❌
  - Cualquier movimiento (ingreso, salida, ajuste, transferencia) puede tener asociado uno o varios archivos adjuntos (facturas, actas, fotos, soporte).
  - Solo se permiten imágenes y PDF con tamaño máximo de 2MB por archivo.
  - Almacenamiento local con preparación para futura integración con Google Drive.
  - Visualización de adjuntos desde ficha de producto, panel de movimiento, reporte de auditoría.
- Logs y auditoría de operaciones de adjuntos implementados ✅

## **E. Seguridad, Logs y Auditoría** ✅ IMPLEMENTADO

- Todas las acciones críticas quedan registradas en logs: creación, edición, reversa, anulación. ✅
- El sistema registra automáticamente el stock_resultante tras cada movimiento para facilitar auditoría. ✅
- Solo usuarios con rol admin pueden ejecutar reversas o anular movimientos. ✅
- Manejo de concurrencia mediante transacciones atómicas para prevenir inconsistencias en stock. ✅
- Paneles de logs e historial de inventario para auditoría interna/externa. ✅
- La descarga de adjuntos está pendiente de implementación junto con el módulo de adjuntos. ❌

## **F. Ejemplo de Wireframe Textual: Panel de Inventario Multisucursal**

| INVENTARIO GENERAL – SUCURSAL: [Centro ▼] 				|
| Producto 	| Color | Marca | Stock 	| Stock Mín. 	| Estado 	| [Ver Mov.] [Ajustar] 	|
| Lente X 	| Azul | Ray-Ban | 3 	| 5 		| ⚠ Bajo	| [ ] [ + ]		|
| Lente Y 	| Verde | Oakley | 10 	| 3 		| Ok 		| [ ] [ + ] 		|
| Accesorio Z 	| Negro | Genérico | 0	 | 2		 | 🔴 Agotado	| [ ] [ + ]		|
[Ingresar Producto]	[Solicitar Transferencia]		[Exportar Reporte]

Alertas: 2 productos con bajo stock

| Movimientos recientes: |
| Fecha | Producto 	| Color | Marca | Tipo 		| Cantidad 	| Stock Resultante | Usuario 	| Estado 	|
| 13/07 | Lente X 	| Azul | Ray-Ban | Salida 	| -2 		| 3 | vdr1 		| Ok 		|
| 12/07 | Lente Y 	| Verde | Oakley | Ajuste 	| +5 		| 10 | admin 	| Ok 		|
| ... |
| [Ver Adjuntos]	[Historial]	[Panel de Transferencias]	[Volver] 	|

---

## **Notas clave:**
- La operación multisucursal y la trazabilidad de movimientos son centrales para la integridad y el control.
- El inventario se gestiona a nivel de producto-sucursal-color-marca para mayor precisión y control.
- El campo stock_resultante facilita la auditoría completa de cada movimiento.
- Transacciones atómicas garantizan la integridad del stock incluso con operaciones concurrentes.
- Los paneles UX permiten detectar anomalías, dar soporte y responder rápido ante faltantes o errores de inventario.
- Todo el flujo es auditable, seguro y preparado para crecer en número de sucursales, productos y usuarios.
