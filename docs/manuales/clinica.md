# GESTIÓN CLÍNICA MODULAR – INTRANET NEÓPTICA

## **A. Registro y Consulta de Historial Clínico**

- El historial clínico es modular y versionable:
    - Cada paciente/cliente tiene asociado un historial clínico compuesto por uno o varios episodios (citas).
    - Cada episodio puede contener múltiples versiones de diagnóstico y receta, conservando la historia completa.
    - Las versiones previas quedan accesibles para auditoría, pero sólo la última es editable (siempre que el registro esté vigente/no anulado).

- El diagnóstico, receta y notas clínicas se registran en formularios estructurados, con posibilidad de adjuntar documentos (imágenes, exámenes, PDFs, justificativos).
- Los optometristas solo pueden editar historiales de pacientes que atendieron, y solo si el estado lo permite.

## **B. Flujos Detallados**

1. **Registro de Diagnóstico/Receta en Cita:**
    - El optometrista ingresa diagnóstico y receta al finalizar la atención.
    - Puede adjuntar archivos (examen visual, justificativo, imagen clínica, receta digital).
    - Cada guardado crea una nueva versión: la anterior pasa a “histórico” y solo la última es editable.
    - Todas las acciones quedan registradas con usuario, fecha y logs.

2. **Consulta y Visualización:**
    - El historial muestra lista de citas, diagnósticos, recetas y archivos asociados.
    - El usuario puede seleccionar cualquier versión anterior para ver detalles, motivo y usuario que realizó el cambio.
    - Advertencias visibles si hay diagnósticos anulados, modificados, vinculados a facturas o bloqueados.

3. **Modificación, Anulación y Versionado:**
    - Modificar un diagnóstico crea una nueva versión; se solicita motivo y queda logueado.
    - Sólo usuarios autorizados (admin, gerente) pueden anular diagnósticos/recetas. El motivo es obligatorio y visible en el historial.
    - Los historiales anulados quedan bloqueados para edición, pero disponibles para auditoría.

4. **Descarga y Exportación:**
    - Desde el panel clínico, pueden descargarse diagnósticos, recetas y adjuntos para respaldo o entrega física al paciente.
    - Opciones para exportar historial completo para auditoría o derivación médica.

## **C. Gestión de Adjuntos Clínicos**

- Adjuntos polimórficos permiten asociar múltiples archivos a cada episodio, versión o cita.
- Control de permisos: sólo optometrista responsable, admin o gerente pueden ver/descargar archivos clínicos de un paciente.
- Logs de descarga, subida y eliminación de archivos clínicos para trazabilidad total.

## **D. Seguridad, Auditoría y Cumplimiento**

- Todas las acciones sobre historial clínico quedan registradas en logs (`log_auditoria`), con motivo, fecha, usuario y entidad asociada.
- Bloqueo automático de edición si el historial está vinculado a facturas o en estado anulado/histórico.
- Acceso segmentado: sólo optometrista de la cita, gerencia y usuarios autorizados pueden acceder.
- Cumplimiento de normativas de protección de datos personales y sanitarios.

## **E. Ejemplo de Wireframe Textual: Panel Clínico Modular**

| HISTORIAL CLÍNICO – PACIENTE: Juan Pérez 			|
Citas: [12/07/2024][10/05/2024][08/04/2024]
Diagnóstico actual: Miopía leve (Versión 2)
Optometrista: Dra. Ruiz
Fecha: 12/07/2024 Estado: Vigente
[Ver archivos adjuntos] [Descargar PDF]
Motivo de última modificación: Actualización de resultados
----------------------------------------------------------
[Ver versiones anteriores] [Anular][Modificar]
----------------------------------------------------------
Diagnóstico anterior (Versión 1): Miopía sospechada
Fecha: 10/05/2024 Estado: Histórico
[Ver detalles] [Ver adjuntos]
----------------------------------------------------------
[Registrar nueva cita][Exportar historial][Volver]

---

## **Notas clave:**
- Todo el historial es trazable, auditable y versionado.
- Los adjuntos y diagnósticos cumplen requisitos de seguridad y protección de datos.
- Los flujos priorizan la integridad clínica y la facilidad de revisión por parte de gerencia y auditores.