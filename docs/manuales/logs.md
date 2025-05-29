# AUDITORÍA, LOGS Y SEGURIDAD – INTRANET NEÓPTICA 

## **A. Modelo de Auditoría y Logs**

- El sistema implementa registro exhaustivo y centralizado de toda actividad crítica, cambios, accesos, errores y flujos de integración.
- Principales tablas y áreas:
    - `log_auditoria`: Cambios en datos críticos, anulaciones, reversas, ediciones, descargas, cargas y operaciones relevantes.
    - `log_acceso`: Inicios de sesión, cierres de sesión, intentos fallidos, cambios de sesión y validaciones de seguridad.
    - `log_contable`: Modificaciones y reversas contables, exportaciones a ERP, registros de conciliación.
    - `log_envio_correo`: Todos los envíos de correo, estados de entrega, rebotes, reintentos, errores y logs de integración SMTP/API.
    - Logs internos de integración: Respuesta de servicios externos, errores de sincronización ERP/SRI, fallos de APIs.

## **B. Flujos y Paneles de Auditoría**

- Paneles accesibles a gerentes autorizado.
- Permiten filtrar, buscar y exportar logs por:
    - Usuario/ID
    - Fecha/rango de fechas
    - Tipo de acción (anulación, edición, acceso, error, exportación)
    - Módulo o entidad asociada (pedido, factura, movimiento, etc.)
    - Estado/resultados (exitoso, fallido, observado, pendiente)
- Logs de acceso con detalle: IP, dispositivo, ubicación aproximada, éxito/fallo, motivo si aplica.
- Logs de correos: Estado de envío, tipo de correo, destinatario, entidad asociada, errores, intentos, origen del envío (manual, automático, API).

## **C. Seguridad Proactiva y Alertas**

- El sistema detecta y resalta automáticamente:
    - Accesos sospechosos (muchos intentos fallidos, nuevos dispositivos, ubicaciones inusuales)
    - Movimientos masivos o repetitivos en inventario, contabilidad o ventas
    - Errores recurrentes en integración (ERP, SRI, correo)
    - Reintentos y fallos no resueltos de envíos críticos (facturas, notificaciones)
- Notificaciones y alertas visibles en el dashboard y exportables para seguimiento.

## **D. Exportación y Reporting para Soporte y Auditoría**

- Todos los logs pueden exportarse en CSV/Excel por rango de fechas, módulo, usuario o tipo de acción.
- Permite preparar evidencias para auditorías legales, fiscales, reclamos o soporte externo.
- Respaldo automático y particionamiento en base de datos para logs históricos.

## **E. Integridad, Legalidad y Cumplimiento**

- Ningún registro crítico puede ser eliminado físicamente: solo anulación/reversa con historial y motivo.
- Todos los logs cumplen con normativas de trazabilidad sanitaria, fiscal y de protección de datos.
- Acceso a logs y auditoría solo para roles autorizados (admin, gerente, soporte, auditoría).

## **F. Ejemplo de Panel de Auditoría (Wireframe Textual)**
| PANEL DE AUDITORÍA Y LOGS 						|
| Filtros: [Usuario ▼] [Acción ▼] [Fecha ▼] [Módulo ▼] 		|
| Fecha | Usuario | Acción | Módulo | Estado | [Detalle] 		|
| 13/07/2024 | vdr1 | Anulación | Pedido | Ok | [Ver] 			|
| 13/07/2024 | admin | Acceso | General | Exitoso | [Ver] 		|
| 12/07/2024 | opt1 | Edición | Clínico | Ok | [Ver] 			|
| 12/07/2024 | sys | Envío Correo| Facturación| Fallo | [Ver] 		|
| [Exportar Logs][Ver Panel de Alertas][Ver Historial Completo] 		|

## **G. Acciones de Soporte y Auditoría**

- Reintentos de integración o reenvío de correos pueden ser ejecutados desde el panel, quedando todo logueado.
- El soporte puede adjuntar comentarios a logs críticos o resolver alertas desde el panel.

## **Notas:**
- Toda la arquitectura de logs y auditoría prioriza la seguridad, el cumplimiento normativo y la facilidad de soporte interno.
- Los paneles permiten seguimiento en tiempo real y soporte rápido ante cualquier incidente o reclamo.