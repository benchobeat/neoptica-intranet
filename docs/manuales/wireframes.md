# UX/UI Y WIREFRAMES – INTRANET NEÓPTICA 

## A. DASHBOARD ADMINISTRATIVO GLOBAL
 
=======================================================================
| DASHBOARD ADMIN – NEÓPTICA      [Menú lateral dinámico por rol]       |
=======================================================================
| [Breadcrumbs: Inicio > Dashboard]   [⚙️ Customizar KPIs]                  |
--------------------------------------------------------------------------------------------------------------------
| KPIs (personalizables):                                                    |
| ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐       |
| | Ventas Hoy  |  | Facturas Emi.|  | Stock Bajo   |  | Citas Hoy   |       |
| |   $1.200    |  |     15       |  |    6         |  |    12       |       |
| └─────────────┘  └──────────────┘  └──────────────┘  └─────────────┘       |
--------------------------------------------------------------------------------------------------------------------
| [⚠️] Alerta: Factura pendiente de SRI          	[Ver detalle]	[Toast] |
| [🔴] Stock crítico en 2 productos 		[Ir a inventario]	[Tooltip]   |
--------------------------------------------------------------------------------------------------------------------
| Acceso rápido: [Aprobar Transferencia] [Ver Log Auditoría] [Ayuda ❓]      |
--------------------------------------------------------------------------------------------------------------------
| [Skeleton Loader durante carga de datos]                                   |
--------------------------------------------------------------------------------------------------------------------
Criterios UX/UI:
Menú y paneles solo para módulos del rol activo.
KPIs personalizables, con colores y iconografía para estados críticos.
Breadcrumbs y tooltips en todas las acciones clave.
Notificaciones tipo toast para alertas críticas.
Loader esqueleto mientras se obtienen datos.

## B. GESTIÓN DE USUARIOS
 
=======================================================================
| USUARIOS – ADMINISTRACIÓN           [Menú lateral dinámico por rol]         	    |
=======================================================================
| [Breadcrumbs: Inicio > Usuarios]         [Nuevo Usuario] [Filtrar: Rol ▼]   	    |
--------------------------------------------------------------------------------------------------------------------
| Toast: “Usuario creado exitosamente” (verde, arriba derecha, autodescarta)  	    |
--------------------------------------------------------------------------------------------------------------------
| Nombre        | Email		        | Rol		    | Estado		| [Editar][Historial]   	|
| J. Pérez      | jp@correo.com   	| Vendedor    	| 🔴 Activo	    | [✏️][🕓]                  |
| D. Torres     | dt@correo.com   	| Admin       	| 🔴 Activo	    | [✏️][🕓]                  |
| M. Ruiz       | mruiz@cor.com	    | Optometrista	| 🔴 Anulado	| [✏️][🕓][ℹ️]               |
--------------------------------------------------------------------------------------------------------------------
| Leyenda:                                                                						|
| 🔴 = Activo, 🔴 = Anulado, 🔴 = Pendiente.                               				       |
| Tooltip en estado anulado: “Motivo: Baja voluntaria, 10/07/24”             				      |
--------------------------------------------------------------------------------------------------------------------
| [Anular/Reactivar] (doble confirmación, motivo obligatorio, resumen de impacto)			|
--------------------------------------------------------------------------------------------------------------------
| [Skeleton loader mientras carga la tabla]                               				      |
--------------------------------------------------------------------------------------------------------------------
Criterios UX/UI:
Estado resaltado con color/icono y tooltip de motivo.
Confirmación doble con diff/resumen de impacto antes de anular/reactivar.
Loader esqueleto al cargar datos masivos.

## C. INVENTARIO
 

=======================================================================
| INVENTARIO – SUCURSAL: [Centro ▼]           [Ayuda rápida ❓]               		|
=======================================================================
| [Breadcrumbs: Inventario > Centro]    [Ingreso][Salida][Transferencia][Ajuste]		|
--------------------------------------------------------------------------------------------------------------------
| Producto	| Stock	| Stock Mín. 	| Estado   	| [Movimientos][Adjuntos]	|
| Lente X     	| 3     	| 5          	| 🔴 Bajo  	| [🕓][📎][Ver]                		|
| Acc. Z      	| 0     	| 2          	| 🔴 Agotado	| [🕓][📎][Ver]               		|
--------------------------------------------------------------------------------------------------------------------
| Tooltip: “Stock bajo, último ajuste el 12/07/2024”                         			|
| Toast: “Transferencia enviada correctamente”                               			|
--------------------------------------------------------------------------------------------------------------------
| [Skeleton Loader al buscar/filtrar]                                        				|
| [⚠️] Alerta visual fija en encabezado si existe inventario en estado crítico		|
--------------------------------------------------------------------------------------------------------------------
| Confirmación doble al realizar ajustes o transferencias, mostrando impacto.		|
--------------------------------------------------------------------------------------------------------------------

Criterios UX/UI:
Iconos y colores por estado.
Tooltip en movimientos/stock bajo.
Toasts en acciones exitosas/errores.
Confirmación doble en acciones críticas.
D. PANEL DE VENTAS Y FACTURACIÓN (Vendedor)
 
=======================================================================
| NUEVA VENTA – PUNTO DE VENTA         [Ayuda contextual ❓]                  		    |
=======================================================================
| [Breadcrumbs: Ventas > Nueva Venta]                                       				|
--------------------------------------------------------------------------------------------------------------------
| [⚠️] Estado: Factura pendiente de envío (icono amarillo, tooltip SRI)      		|
--------------------------------------------------------------------------------------------------------------------
| Buscar cliente: [__________] [Nuevo cliente] [ℹ️ Tooltip]                  			|
| Producto      	| Cantidad 	    | Precio    | Stock     | [Agregar][Vista previa adjunto] 	   |
| [Dropdown]	    |   [1]    		| $120      |   5       | [+][👁️]                            |
--------------------------------------------------------------------------------------------------------------------
| Subtotal: $200     IVA: $24   Total: $224 [USD ▼] [Skeleton Loader]        		|
--------------------------------------------------------------------------------------------------------------------
| [Finalizar Venta y Generar Factura] (doble confirmación, resumen de impacto)				|
--------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------
| [Notificación toast]: “Factura emitida y enviada exitosamente” (verde)     		|
--------------------------------------------------------------------------------------------------------------------
| Estado de Factura: [🔴 Emitida SRI] [Descargar PDF][Enviar][Tooltip]        		|
--------------------------------------------------------------------------------------------------------------------
| [Deshacer venta reciente] (Undo temporal disponible por 30 seg.)           		|
--------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------

Criterios UX/UI:
Estado de factura siempre visible con icono y color.
Tooltips y ayuda contextual en campos críticos.
Toasts y loaders en operaciones.
Opción “Undo” después de ventas no críticas.

## E. PANEL CLÍNICO (Optometrista)
 

=======================================================================
| HISTORIAL CLÍNICO – PACIENTE: Juan Pérez       [Accesibilidad WCAG ✓]      		|
=======================================================================
| [Breadcrumbs: Clínico > Historial > Juan Pérez]                            			|
--------------------------------------------------------------------------------------------------------------------
| Diagnóstico actual: Miopía leve (Versión 2)    [🔴 Vigente]                			|
| Motivo última modificación: “Actualización de resultados” [Tooltip]        		|
--------------------------------------------------------------------------------------------------------------------
| [👁️] Ver adjuntos [📎][Timeline de versiones] [Descargar PDF]              			|
--------------------------------------------------------------------------------------------------------------------
| [Anular][Modificar] (doble confirmación, diff entre versiones, motivo)     		|
| [Tooltip]: Solo última versión editable; anteriores = solo consulta.       			|
--------------------------------------------------------------------------------------------------------------------
| Diagnóstico anterior (Versión 1): Miopía sospechada   [🔴 Histórico]       		|
| Fecha: 10/05/2024                                                          					|
--------------------------------------------------------------------------------------------------------------------
| [Skeleton loader al cargar historial o adjuntos]                           				|
| [Tour interactivo de uso al primer acceso]                                 				|
--------------------------------------------------------------------------------------------------------------------
Criterios UX/UI:
Estados y versiones con color e iconografía.
Previsualización y timeline de adjuntos.
Confirmaciones y diffs claros al editar.
Tour y tooltips activos.

## F. PANEL DE TRANSFERENCIAS Y MOVIMIENTOS (Inventario)
 
=======================================================================
| TRANSFERENCIAS ENTRE SUCURSALES                 [Tooltip proceso ❓]        		|
=======================================================================
| [Breadcrumbs: Inventario > Transferencias]                                   			|
--------------------------------------------------------------------------------------------------------------------
| Solicitud de transferencia:                                                 					|
| Producto: [Gafa A ▼]  Cantidad: [5]                                         				|
| Origen: [Centro ▼]  Destino: [Norte ▼]                                      				|
| Motivo: [___________________] [Tooltip ayuda]                               			|
| Adjuntar soporte: [Archivo][Drag & Drop][Barra progreso]                    			|
--------------------------------------------------------------------------------------------------------------------
| [Solicitar][Cancelar][Undo (10 seg)]                                        				|
--------------------------------------------------------------------------------------------------------------------
| Estado: [🔴 Pendiente][ 🔴 Aprobada][🔴 Rechazada][ 🔴 Anulada]            		|
--------------------------------------------------------------------------------------------------------------------
| [Toast]: “Transferencia enviada a revisión de admin”                        			|
--------------------------------------------------------------------------------------------------------------------
| Transferencias recientes:                                                   					|
| Fecha | Producto | Origen | Destino | Estado | [Detalle][Tooltip]           		|
--------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------
Criterios UX/UI:
Estados con iconos y color.
Feedback visual en carga de adjuntos (barra/drag&drop).
Confirmaciones y Undo para solicitudes recientes.
Tooltips explicativos.

## G. PANEL DE CORREO Y LOGS DE ENVÍO
 
=======================================================================
| ADMINISTRACIÓN DE CORREO Y LOGS                [Acceso restringido]         		|
=======================================================================
| [Breadcrumbs: Configuración > Correo]                                       				|
--------------------------------------------------------------------------------------------------------------------
| Configuración SMTP/API [Editar][Probar][Guardar][Tooltip ayuda]             		|
| Usuario: ventas@neoptica.com  Host: smtp.sendgrid.net                       			|
| Última prueba: [🔴 Exitosa] (13/07/2024 12:32)                              			|
--------------------------------------------------------------------------------------------------------------------	
| LOGS DE ENVÍO DE CORREO:                                                    				|
| Fecha | Tipo    	| Destino            	| Estado   	    | [Detalle][Tooltip]        	|
| 13/07 | Factura 	| jp@cliente.com     	| 🔴 Enviado	| [Ver]                      	|
| 13/07 | Alerta  	| dt@neoptica.com    	| 🔴 Fallido	| [Ver][Reintentar]          	|
--------------------------------------------------------------------------------------------------------------------
| Toast: “Correo reenviado con éxito”                                         				|
| [Exportar][Filtrar][Skeleton loader en logs extensos]                       			|
--------------------------------------------------------------------------------------------------------------------

Criterios UX/UI:
Feedback visual y toast tras acciones.
Iconografía y color en estados.
Botón reintento rápido en errores.
Tooltips de explicación en configuración/logs.

## H. PANEL DE AUDITORÍA Y LOGS
 
=======================================================================
| AUDITORÍA Y LOGS – PANEL GLOBAL                [Solo admin/auditor]         		|
=======================================================================
| [Breadcrumbs: Auditoría > Logs]                                            				|
--------------------------------------------------------------------------------------------------------------------
| Filtros: [Usuario][Módulo][Acción][Fecha][Tooltip ayuda]                   			|
| [Exportar][Ver Panel de Alertas][Skeleton loader]                          			|
--------------------------------------------------------------------------------------------------------------------
| Fecha    | Usuario 	| Acción      	| Módulo    	| Estado 	| [Ver][Tooltip]	    |
| 13/07    | vdr1    	| Anulación   	| Pedido    	| 🔴 Ok 	| [ ]                 	|
| 12/07    | admin   	| Acceso      	| General   	| 🔴 Ok 	| [ ]                 	|
| 12/07    | opt1    	| Edición     	| Clínico   	| 🔴 Ok  	| [ ]                 	|
--------------------------------------------------------------------------------------------------------------------
| Toast tras exportar: “Logs descargados correctamente”                      			|
--------------------------------------------------------------------------------------------------------------------

Criterios UX/UI:
Estados y acciones resaltados.
Feedback tras acciones de exportación o error.
Loader en consultas complejas.
Tooltips de ayuda en filtros complejos.

## I. PANEL DE AJUSTES Y CONFIGURACIÓN
 
========================================================================
| AJUSTES Y CONFIGURACIÓN – INTRANET NEÓPTICA  [Solo admin/soporte autorizado] |
========================================================================
| [Breadcrumbs: Configuración > Panel General]                                			|
--------------------------------------------------------------------------------------------------------------------
| [Menú lateral contextual]                                                   				|
| ├─ Usuarios            		├─ Roles & Permisos                                 			|
| ├─ Sucursales          		├─ Correo SMTP/API                       			|
| ├─ Backup & Restaurar  	├─ Integración ERP                                  			|
| ├─ Facturación Electr. 	├─ Seguridad & Logs                                  		|
--------------------------------------------------------------------------------------------------------------------
| Panel principal:                                                            					|
--------------------------------------------------------------------------------------------------------------------
| 1. Usuarios y Roles                                                         					|
| ─────────────────────────────────────────────────────────────               	|
| [Gestión de usuarios][Asignar roles][Exportar usuarios][Ayuda ❓]           		|
| Tabla con estados visuales: 🔴 Activo / 🔴 Anulado / 🔴 Pendiente			|
--------------------------------------------------------------------------------------------------------------------
| 2. Sucursales                                                               |
| ─────────────────────────────────────────────────────────────               	|
| [Agregar sucursal][Editar][Eliminar][Ver detalles][Mapa 📍][Ayuda ❓]        		|
| Toast: “Sucursal agregada correctamente”                                    			|
--------------------------------------------------------------------------------------------------------------------
| 3. Configuración de Correo SMTP/API                                         				|
| ─────────────────────────────────────────────────────────────               	|
| Usuario: ventas@neoptica.com   Host: smtp.sendgrid.net   Puerto: 587        		|
| Última prueba: [🔴 Exitosa]  (12/07/2024 11:20)                             			|
| [Editar][Probar][Guardar][Ayuda ❓][Tooltip de seguridad]                    			|
| [Skeleton loader] en pruebas de conexión                                    				|
| [Notificación]: “Error de autenticación, revise credenciales” (toast roja)  		|
--------------------------------------------------------------------------------------------------------------------
| 4. Backup y Restauración                                                    				|
| ─────────────────────────────────────────────────────────────               	|
| Última copia: 13/07/2024 02:03 a.m.     Estado: 🔴 Correcta                 			|
| [Realizar Backup Ahora][Restaurar][Historial][Exportar Configuración]       		|
| [Toast] tras backup: “Copia de seguridad creada exitosamente”               		|
--------------------------------------------------------------------------------------------------------------------
| 5. Integración ERP y Facturación Electrónica                                				|
| ─────────────────────────────────────────────────────────────               	|
| ERP conectado: Contífico    Estado: 🔴	 Sincronizado                         			|
| Última exportación: 12/07/2024 08:15 p.m.                                  			|
| [Probar conexión][Forzar exportación][Historial de errores][Ayuda ❓]        		|
| Estado facturación electrónica: 🔴 Correcta / 🔴 Error SRI / 🔴 Pendiente    		|
--------------------------------------------------------------------------------------------------------------------
| 6. Seguridad y Logs                                                         					|
| ─────────────────────────────────────────────────────────────               	|
| Gestión de contraseñas, autenticación 2FA y alertas críticas.               			|
| [Panel de Logs][Descargar logs][Notificaciones de seguridad][Ayuda ❓]       		|
--------------------------------------------------------------------------------------------------------------------
| [Skeleton loaders] en cargas largas, tooltips explicativos en cada acción.  		|
| Botones críticos (restaurar, eliminar) requieren doble confirmación y resumen de impacto.|
| Sección “Undo” temporal tras acciones no críticas (como eliminar una sucursal).   	|
--------------------------------------------------------------------------------------------------------------------.
| [Volver al dashboard]                                                       					|
=======================================================================

Notas generales para todos los módulos:
Todos los estados (vigente, anulado, pendiente, error) son altamente visibles y consistentes.
Accesibilidad asegurada con contraste, soporte teclado, tooltips y cumplimiento WCAG.
Feedback inmediato en cada acción relevante (toast, loader, tooltip, undo).
Agrupación clara de información y acciones.
Tour, ayuda contextual y previsualización en todos los puntos críticos.
