# MANEJO DE ESTADOS, ANULACIÓN Y CICLO DE VIDA
## **A. Estados de Registros Críticos**

- Cada entidad clave (usuarios, pedidos, movimientos de inventario, historial clínico, diagnósticos, facturas, movimientos contables, archivos adjuntos, citas, descansos) cuenta con los siguientes posibles estados:
    - **Vigente/Activo**: Registro en operación normal.
    - **Anulado**: Registro deshabilitado, bloqueado para edición o eliminación, solo visible para consulta histórica.
    - **Modificado**: Registro actualizado, conservando versión previa para trazabilidad/auditoría.
    - **Histórico**: Versiones anteriores tras modificación; solo para consulta.
    - **Reversado**: Registro revertido (ej. movimiento contable o de inventario), con relación a nuevo registro que corrige el anterior.
    - **Pendiente**: Operación aún no aprobada o completada (ej. transferencia de inventario, solicitud de descanso, factura no enviada a SRI).
    - **Sincronizado/Exportado**: Para operaciones exportadas a ERP/SRI, con fecha y log.
    - **Error/Observado**: Estado de error o bloqueo por validación o integración.

## **B. Flujos de Anulación y Reversa**

- **Anulación**:
    - Solo usuarios autorizados (admin/gerente/soporte) pueden anular registros críticos.
    - Toda anulación requiere motivo/comentario obligatorio y queda registrada en logs (`anulado_en`, `anulado_por`, comentario).
    - Registros anulados bloquean la edición, generación de nuevos vínculos (ej. no se puede facturar un pedido anulado), y quedan visibles solo como históricos.
    - Los usuarios visualizan el estado “Anulado” con leyenda/motivo en el detalle del registro.

- **Reversa**:
    - Movimientos de inventario y contables permiten reversa segura: se crea un nuevo registro que contrarresta el anterior, ambos quedan vinculados y el anterior con estado “Reversado”.
    - La reversa requiere motivo/comentario y log de usuario/fecha.
    - La operación original no se borra ni edita: solo se crea el nuevo registro “inverso”.
    - Visualización clara en paneles: “Este movimiento fue reversado el XX/XX por Usuario X”.

- **Modificación y Versionado**:
    - Al modificar diagnósticos clínicos, datos de usuario o registros sensibles, se conserva automáticamente la versión previa en estado “Histórico”.
    - Los usuarios pueden consultar todas las versiones, con fechas, motivos y usuario responsable de la edición.
    - No se permite edición de registros vinculados a operaciones fiscales (ej. diagnóstico vinculado a factura, pedido facturado, etc.).

## **C. Bloqueos y Validaciones Automáticas**
- Todo intento de edición, anulación o reversa sobre registros en estado no permitido genera mensaje claro y registro en logs de intento.
- Los flujos CRUD validan siempre el estado del registro antes de permitir cualquier acción.
- En listados/tablas, se puede filtrar/buscar por estado, y los registros no vigentes aparecen resaltados o en sección aparte (“Historial”).

## **D. Logs y Auditoría de Ciclo de Vida**

- Toda acción de anulación, reversa o modificación crítica queda registrada en logs de auditoría con:
    - Usuario, fecha/hora, acción, entidad, id, motivo/comentario, relación con registros afectados.
- Los paneles de administración y auditoría pueden exportar estos logs para revisión o soporte legal/fiscal.
- Se incluye advertencia en la UI/UX al visualizar cualquier registro no vigente, con opción de consultar historial/motivo.

## **E. Ejemplo de visualización (wireframe textual):**

| DETALLE DE PEDIDO #000245 Estado: ANULADO 	|
| Cliente: Juan Pérez Sucursal: Centro 			|
| Fecha: 13/07/2024 Total: $220 USD 			|

Factura: Emitida (SRI)
[⚠️] Este pedido fue ANULADO el 13/07/2024
Motivo de anulación: Error en datos de facturación
Anulado por: D. Torres
---------------------------------------------------------
Productos: ...
Historial de Cambios:
12/07/2024 11:40 Modificado por L. Salazar
13/07/2024 10:15 Anulado por D. Torres
---------------------------------------------------------
[Ver Historial Completo] [Exportar Registro]

---

## **Notas generales:**
- La trazabilidad y el ciclo de vida están presentes en cada módulo crítico, asegurando cumplimiento normativo, seguridad, soporte a reclamos y operación transparente.
- Los usuarios sólo pueden operar sobre registros vigentes según su rol y permisos.
- El sistema bloquea automáticamente acciones sobre registros no vigentes y registra todo intento en logs de auditoría.