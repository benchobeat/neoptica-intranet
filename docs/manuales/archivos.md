# ADJUNTOS Y GESTIÓN POLIMÓRFICA – INTRANET NEÓPTICA

## **A. Concepto y Modelo**
- El sistema implementa un modelo de **adjuntos polimórficos**, donde cualquier archivo (imagen, PDF, documento clínico, justificativo, XML de factura, etc.) puede asociarse a cualquier entidad relevante del sistema: pedidos, movimientos, citas, historiales clínicos, facturas, descansos, cuentas contables, etc.
- Se utiliza la combinación de tablas `archivo_adjunto` (metadatos y URL de archivo) y `archivo_entidad` (asociación polimórfica a entidad, tipo y fecha).

## **B. Flujos de Usuario**

- **Carga de Adjuntos:**
    - Al crear o editar un registro (ej: cita, descanso, pedido, movimiento, historial clínico), el usuario puede adjuntar uno o varios archivos.
    - El sistema valida tipo y tamaño de archivo (según reglas de negocio, por ejemplo: PDF, JPG, PNG, XML; límite configurable).
    - Cada adjunto queda relacionado con la entidad, con registro de usuario, fecha y tipo de archivo.
    - Se puede asociar más de un archivo a una misma entidad, y cada adjunto puede tener historial/versiones.

- **Visualización y Descarga:**
    - En la ficha de cualquier entidad, se listan los adjuntos con nombre, tipo, tamaño, usuario y fecha de subida.
    - El usuario autorizado puede descargar, visualizar (previsualización en navegador si el tipo lo permite) o consultar la versión anterior si existiera.
    - El sistema muestra advertencia si el archivo fue reemplazado/anulado, con opción de ver historial.

- **Reemplazo y Versionado:**
    - Al reemplazar un archivo (ej: nueva versión de diagnóstico o justificativo), el anterior queda en estado “histórico”, sólo visible para consulta y auditoría.
    - Cada versión nueva incrementa el número de versión y registra usuario, fecha y motivo si aplica.

- **Seguridad y Permisos:**
    - Sólo usuarios autorizados según rol y permisos pueden cargar, visualizar o descargar adjuntos.
    - El sistema valida siempre la asociación polimórfica antes de permitir acceso (ej: un optometrista sólo puede ver archivos de pacientes atendidos).
    - Todo acceso, descarga, reemplazo o eliminación queda registrado en logs de auditoría (`log_auditoria`).

- **Acceso desde múltiples módulos:**
    - El componente de adjuntos se reutiliza en pedidos, facturas, movimientos, citas, descansos, historial clínico, plan de cuentas y cualquier módulo donde se requiera evidencia documental o soporte legal.

## **C. Ejemplo de Wireframe Textual**
| ADJUNTOS DEL PEDIDO #000245 					|
| Nombre | Tipo | Tamaño | Fecha | Versión | [Descargar] [Ver] 	|
| Factura245.pdf | PDF | 430KB | 13/07/2024 | 1 | [↓] [👁️] 		|
| Diagnóstico.jpg| JPG | 240KB | 12/07/2024 | 2 | [↓] [👁️] 		|
| Factura245.xml | XML | 12KB | 13/07/2024 | 1 | [↓] [👁️] 		|
| [Subir Nuevo Adjunto] [Reemplazar][Ver Historial] 			|
| [⚠️] Este archivo fue reemplazado el 14/07/2024 			|
| Motivo: Corrección de datos fiscales 					|


## **D. Logs y Auditoría de Adjuntos**

- Cada acción sobre un archivo (subida, descarga, reemplazo, eliminación, visualización) queda registrada en logs de auditoría con usuario, fecha/hora, tipo de acción y entidad asociada.
- El panel de logs permite consultar todas las acciones sobre adjuntos, filtrando por usuario, entidad, fecha, tipo y estado.

## **E. Reporting y Exportación**

- Paneles administrativos permiten consultar y exportar el historial de adjuntos por módulo, usuario, tipo, fecha o entidad asociada.
- Soporte para auditoría legal/fiscal: evidencia documental disponible para descarga y consulta rápida.

## **F. Integridad y Respaldo**

- Todos los archivos se almacenan en servicios cloud seguros, con respaldos automáticos y redundancia.
- Los metadatos y vínculos polimórficos están protegidos por restricciones y validaciones en la base de datos.

