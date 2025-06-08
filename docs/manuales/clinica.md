# Módulo de Clínica y Gestión de Citas

## Modelos de Datos

### 1. Cita (`cita`)
Modelo que gestiona las citas de los clientes con los optometristas en las sucursales.

#### Campos:
- **id**: Identificador único de la cita (UUID)
- **cliente_id**: Referencia al usuario que es el cliente (relación con `usuario`)
- **optometrista_id**: Referencia al usuario que es el optometrista (relación con `usuario`)
- **sucursal_id**: Referencia a la sucursal donde se atenderá la cita
- **fecha_hora**: Fecha y hora programada para la cita
- **estado**: Estado actual de la cita (por defecto: "pendiente")

#### Relaciones:
- `usuario_cita_cliente_idTousuario`: Relación con el cliente
- `usuario_cita_optometrista_idTousuario`: Relación con el optometrista
- `sucursal`: Sucursal donde se atenderá la cita
- `historial_clinico`: Historial clínico asociado a la cita
- `recetas`: Recetas generadas en la cita

### 2. Historial Clínico (`historial_clinico`)
Registra el historial médico de los clientes en sus visitas.

#### Campos:
- **id**: Identificador único del registro (UUID)
- **cliente_id**: Referencia al usuario que es el cliente
- **optometrista_id**: Referencia al usuario que atendió la cita
- **cita_id**: Referencia a la cita relacionada
- **fecha**: Fecha del registro clínico (por defecto: fecha actual)
- **descripcion**: Detalles de la consulta o procedimiento
- **receta_id**: Referencia a la receta asociada (opcional)
- **version**: Número de versión del historial (por defecto: 1)

#### Relaciones:
- `cita`: Cita relacionada
- `usuario_historial_clinico_cliente_idTousuario`: Relación con el cliente
- `usuario_historial_clinico_optometrista_idTousuario`: Relación con el optometrista

### 3. Receta (`receta`)
Almacena las recetas ópticas generadas en las citas.

#### Campos:
- **id**: Identificador único de la receta (UUID)
- **citaId**: Referencia a la cita donde se generó la receta
- **tipo**: Tipo de receta (ej: "lejos", "cerca", "bifocal", "lentes de contacto")
- **esfera_od**: Esfera para ojo derecho
- **esfera_oi**: Esfera para ojo izquierdo
- **cilindro_od**: Cilindro para ojo derecho (opcional)
- **cilindro_oi**: Cilindro para ojo izquierdo (opcional)

### 4. Descanso Empleado (`descanso_empleado`)
Gestiona los períodos de descanso y vacaciones del personal de la clínica.

#### Campos:
- **id**: Identificador único (UUID)
- **empleado_id**: Referencia al usuario que es el empleado
- **tipo**: Tipo de descanso (vacaciones, enfermedad, personal, capacitación)
- **fecha_inicio**: Fecha de inicio del descanso
- **fecha_fin**: Fecha de finalización del descanso
- **motivo**: Razón del descanso (opcional)
- **aprobado_por**: ID del usuario que aprobó el descanso
- **estado**: Estado de la solicitud (pendiente, aprobado, rechazado, cancelado)
- **comentarios**: Observaciones adicionales
- **documento_url**: URL del documento justificativo (si aplica)

#### Reglas de Negocio:
- Las vacaciones deben solicitarse con al menos 7 días de anticipación
- No pueden superponerse períodos de descanso para el mismo empleado
- Los descansos por enfermedad requieren documento justificativo
- Solo los administradores pueden aprobar/rechazar solicitudes
- Se notifica por correo al empleado cuando cambia el estado de su solicitud

#### Relaciones:
- Pertenece a un `usuario` (empleado)
- Tiene un `usuario` (aprobador)
- Está relacionado con `cita` (para ver disponibilidad)
- **eje_od**: Eje para ojo derecho (opcional)
- **eje_oi**: Eje para ojo izquierdo (opcional)
- **adicion**: Adición para lentes bifocales/progresivos (opcional)
- **agudeza_visual_od**: Agudeza visual ojo derecho (opcional)
- **agudeza_visual_oi**: Agudeza visual ojo izquierdo (opcional)
- **dp**: Distancia pupilar (opcional)
- **observaciones**: Notas adicionales
- **estado**: Estado de la receta (activo/inactivo)

#### Relaciones:
- `cita`: Cita relacionada

## Gestión Clínica Modular

### A. Registro y Consulta de Historial Clínico

- El historial clínico es modular y versionable:
  - Cada paciente/cliente tiene asociado un historial clínico compuesto por uno o varios episodios (citas).
  - Cada episodio puede contener múltiples versiones de diagnóstico y receta, conservando la historia completa.
  - Las versiones previas quedan accesibles para auditoría, pero sólo la última es editable (siempre que el registro esté vigente/no anulado).

- El diagnóstico, receta y notas clínicas se registran en formularios estructurados, con posibilidad de adjuntar documentos (imágenes, exámenes, PDFs, justificativos).
- Los optometristas solo pueden editar historiales de pacientes que atendieron, y solo si el estado lo permite.

### B. Flujos de Trabajo

#### 1. Programación de una nueva cita
1. El cliente o el personal administrativo inicia el proceso de programación
2. Se verifica la disponibilidad del optometrista en la sucursal seleccionada
3. Se crea el registro de cita con estado "pendiente"
4. Se envía notificación al cliente y al optometrista
5. La cita aparece en el calendario del sistema

#### 2. Proceso de atención en consulta
1. El cliente llega a la sucursal y se registra su asistencia
2. El optometrista inicia la consulta y actualiza el estado de la cita a "en_progreso"
3. Se realiza el examen de la vista y se registran los hallazgos en el historial clínico
4. Si es necesario, se genera una receta con las especificaciones ópticas
5. Al finalizar, se actualiza el estado de la cita a "completada"
6. Se genera un resumen de la consulta para el cliente

#### 3. Registro de Diagnóstico/Receta en Cita:
- El optometrista ingresa diagnóstico y receta al finalizar la atención.
- Puede adjuntar archivos (examen visual, justificativo, imagen clínica, receta digital).
- Cada guardado crea una nueva versión: la anterior pasa a "histórico" y solo la última es editable.
- Todas las acciones quedan registradas con usuario, fecha y logs.

#### 4. Consulta y Visualización:
- El historial muestra lista de citas, diagnósticos, recetas y archivos asociados.
- El usuario puede seleccionar cualquier versión anterior para ver detalles, motivo y usuario que realizó el cambio.
- Advertencias visibles si hay diagnósticos anulados, modificados, vinculados a facturas o bloqueados.

#### 5. Modificación, Anulación y Versionado:
- Modificar un diagnóstico crea una nueva versión; se solicita motivo y queda logueado.
- Sólo usuarios autorizados (admin, gerente) pueden anular diagnósticos/recetas. El motivo es obligatorio y visible en el historial.
- Los historiales anulados quedan bloqueados para edición, pero disponibles para auditoría.

### C. Gestión de Adjuntos Clínicos

- Adjuntos polimórficos permiten asociar múltiples archivos a cada episodio, versión o cita.
- Control de permisos: sólo optometrista responsable, admin o gerente pueden ver/descargar archivos clínicos de un paciente.
- Logs de descarga, subida y eliminación de archivos clínicos para trazabilidad total.

### D. Seguridad, Auditoría y Cumplimiento

- Todas las acciones sobre historial clínico quedan registradas en logs (`log_auditoria`), con motivo, fecha, usuario y entidad asociada.
- Bloqueo automático de edición si el historial está vinculado a facturas o en estado anulado/histórico.
- Acceso segmentado: sólo optometrista de la cita, gerencia y usuarios autorizados pueden acceder.
- Cumplimiento de normativas de protección de datos personales y sanitarios.

### E. Reportes

1. **Reporte de citas por período**
   Muestra un resumen de citas agrupadas por estado y profesional.

   **Parámetros:**
   - Fecha de inicio
   - Fecha de fin
   - Sucursal (opcional)
   - Optometrista (opcional)

2. **Historial clínico consolidado**
   Genera un reporte completo del historial médico de un paciente, incluyendo todas las consultas, diagnósticos y recetas.

   **Parámetros:**
   - ID del cliente
   - Rango de fechas (opcional)

3. **Eficiencia de consultas**
   Métricas de tiempo promedio de consulta, tiempos de espera y productividad de optometristas.

   **Parámetros:**
   - Fecha de inicio
   - Fecha de fin
   - Sucursal (opcional)
   - Optometrista (opcional)

## Integraciones

- **Calendario**: Sincronización con Google Calendar y Outlook
- **Recordatorios**: Envío automático de recordatorios por correo electrónico y SMS
- **Portal del paciente**: Acceso seguro para que los pacientes vean sus citas y recetas
- **Sistema de facturación**: Integración con el módulo de facturación para cobro de servicios
