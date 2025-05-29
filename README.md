# Neóptica Intranet

Bienvenido al repositorio oficial de **Neóptica Intranet**, la plataforma de gestión administrativa, clínica y operativa para ópticas modernas.

# 1. INTRODUCCIÓN Y VISIÓN GENERAL – INTRANET NEÓPTICA

La Intranet Neóptica es una plataforma digital interna, centralizada y robusta, diseñada para gestionar todos los procesos administrativos, clínicos, comerciales, logísticos y contables de la óptica. Su enfoque es la automatización, trazabilidad total, cumplimiento normativo y escalabilidad, permitiendo a la empresa crecer, optimizar recursos y mantener el control absoluto de la información y los flujos de trabajo.

Esta solución es el núcleo operativo de Neóptica, destinada exclusivamente al uso de empleados, optometristas, vendedores, administradores, gerentes y soporte.
Su arquitectura integra:
Gestión centralizada de usuarios, roles y permisos, permitiendo administrar tanto personal interno como clientes desde una única fuente de verdad, con control de acceso granular y flexibilidad para usuarios multirol.

Control total de inventario, movimientos, transferencias entre sucursales y trazabilidad documental de cada acción.

Operación clínica avanzada, con agenda y turnos, historial clínico versionable y modular, gestión de adjuntos polimórficos y ciclo de vida médico-administrativo completo.

Procesos comerciales y financieros integrados: ventas, pedidos, facturación electrónica SRI, manejo multimoneda, contabilidad interna y exportación/conciliación con ERP.

Administración detallada de correo transaccional, registro y auditoría de todos los envíos (facturación, notificaciones, alertas, recuperación de contraseña, etc.) y trazabilidad de errores y reintentos.

Paneles de logs y auditoría a nivel operativo, contable, de seguridad y de integración externa (ERP/SRI), facilitando la supervisión, el soporte y la gestión de riesgos.

Preparación para procesos de anulación, reversa y ciclo de vida de cualquier entidad crítica, asegurando cumplimiento normativo, auditabilidad y control de modificaciones históricas.

Infraestructura, modelo de datos y APIs diseñadas para escalar a nuevas sucursales, integrar módulos móviles, añadir futuras tecnologías (ej. AR, analítica avanzada), e interoperar con sistemas externos sin refactors profundos.

La intranet busca ser la columna vertebral tecnológica de Neóptica, alineando la productividad operativa con la visión estratégica y la gobernanza corporativa.

# 2. OBJETIVOS Y ALCANCE – INTRANET NEÓPTICA

## Objetivo General:
Proveer una plataforma integral, segura y escalable para la gestión total de la operación de Neóptica, cubriendo los procesos clínicos, comerciales, administrativos, logísticos y contables de la organización, con enfoque en trazabilidad, cumplimiento normativo y automatización.

## Objetivos Específicos:
- Centralizar la administración de **usuarios** (clientes y empleados), asignando y gestionando roles múltiples y permisos granulares desde una única base de datos.
- Permitir la gestión integral de **inventario**, controlando stock por sucursal, validando stock mínimo, trazando movimientos (ingresos, salidas, transferencias, ajustes) y soportando justificación documental de cada operación.
- Optimizar la operación clínica mediante una **agenda modular**, control de turnos, gestión de descansos, y un **historial clínico versionable** con adjuntos polimórficos y ciclo de vida médico-administrativo auditable.
- Automatizar los procesos de **ventas, generación de pedidos, aplicación de cupones, registro multimoneda y emisión de facturación electrónica**, cumpliendo la normativa vigente del SRI y facilitando la entrega y registro digital de comprobantes.
- Integrar la **contabilidad interna**, permitiendo registrar movimientos contables asociados a operaciones clave (ventas, pagos, gastos, transferencias), manejar un plan de cuentas jerárquico y preparar la información para conciliación o exportación a ERP.
- Gestionar y auditar todos los **envíos de correo electrónico** (facturas, notificaciones, alertas, recuperación de contraseña, etc.), con trazabilidad completa, soporte a reintentos, logs de error y panel de configuración seguro.
- Registrar y permitir la consulta de **logs y auditorías** operativas, clínicas, contables y de seguridad, con paneles de consulta y exportación de registros para gestión y soporte.
- Preparar el sistema para el **ciclo completo de vida de las entidades**, incluyendo flujos de anulación, reversa, modificación y bloqueo histórico, con registro de motivo y responsable en cada caso.
- Prever la **escalabilidad e integración**: crecimiento multi-sucursal, interoperabilidad con sistemas externos (ERP, facturación, mobile, analítica avanzada, AR), y adaptación a futuros requerimientos regulatorios o tecnológicos.

**Alcance:**

- Incluye todos los procesos internos de Neóptica: administración, agenda clínica, inventario, ventas, facturación, contabilidad, correo, logs y reporting.
- Exclusivo para personal autorizado (empleados, optometristas, vendedores, gerentes, soporte y auditores internos).
- Cubre todas las sucursales, bodegas y unidades de negocio actuales y futuras.
- Contempla integración y extensión modular hacia nuevas áreas funcionales.
- No incluye funcionalidades de atención al cliente final directo (estos flujos serán parte de la página web pública o app móvil).

# 3. ARQUITECTURA TECNOLÓGICA – INTRANET NEÓPTICA (v2)

## **Frontend:**
- **Framework principal:** React.js (con Next.js recomendado para SSR, rutas protegidas y fácil migración a mobile en futuro).
- **UI Kit para backoffice:** Ant Design , priorizando componentes administrativos, tablas avanzadas y dashboards.
- **Gestión de estado:** Context API, Redux o Zustand para manejo global de usuario, roles, notificaciones y sesiones.
- **Formularios y validaciones:** React Hook Form + Yup, para validación robusta y experiencia de usuario eficiente.
- **Consumo de APIs:** Axios o SWR para consultas y mutaciones, asegurando manejo de errores y feedback en tiempo real.
- **Gestión de archivos:** Subida y previsualización de adjuntos mediante integración directa a cloud (AWS S3, Google Cloud Storage o Cloudinary), soporte para adjuntos polimórficos.
- **Autenticación:** JWT para empleados internos y Firebase Auth para clientes, permitiendo login social y control de sesión seguro.
- **Internacionalización:** Preparado para multimoneda y potencial soporte multilenguaje.
- **Accesibilidad:** Contraste, ARIA, soporte teclado, etiquetas y pruebas Lighthouse.

## **Backend:**
- **Framework:** Node.js + Express.js (estructura modular, middlewares robustos, API REST/GraphQL).
- **ORM:** Prisma, para modelado y migración eficiente sobre PostgreSQL.
- **Base de datos:** PostgreSQL, modelo relacional avanzado (ver ezquema_neopticaV4.sql), soporte a particionamiento, vistas para reporting y queries optimizadas por índices.
- **Gestión de archivos:** Cloud storage, modelo polimórfico (`archivo_adjunto` + `archivo_entidad`) para cualquier entidad del sistema.
- **Control de migraciones:** Tabla `db_migrations`, scripts versionados y documentados.
- **Autenticación y autorización:** JWT por empleado, roles y permisos granulares (`usuario`, `rol`, `usuario_rol`), rutas protegidas y validación de acciones por middleware.
- **Notificaciones y correo:** Integración SMTP/Sendgrid/AWS SES para correo transaccional y fiscal. Configuración editable desde la administración, logs de envíos y reintentos registrados en tabla `log_auditoria`.
- **Integraciones externas:** Preparado para sincronización con ERP/facturación, API de pagos, servicios fiscales, y posible integración móvil.

## **Infraestructura y Seguridad:**
- **Despliegue:** Vercel, AWS, Render o DigitalOcean para hosting frontend/backend, base de datos administrada en cloud con backups automáticos.
- **HTTPS:** Certificados válidos, headers de seguridad y protección contra ataques comunes (CSRF, XSS, brute force).
- **Logs y auditoría:** Registro granular en tablas `log_auditoria`, `log_acceso`, `log_contable`, y `log_envio_correo`. Exportables, filtrables y con soporte a particionamiento para alta performance.
- **Monitoreo y alertas:** Sentry, LogRocket, Grafana, o similar para trazabilidad y respuesta ante errores o anomalías (opcional).
- **Escalabilidad:** Diseño modular, multi-sucursal, soporte para crecimiento en usuarios, transacciones, sucursales y reporting avanzado.

## **Documentación y Gobernanza:**
- **APIs documentadas:** Swagger/OpenAPI para REST, documentación centralizada de endpoints y modelos de datos.
- **Soporte de desarrollo:** Manuales técnicos, README, comentarios SQL/JS, guía de migraciones y flujos críticos documentados.
- **Gobernanza:** Trazabilidad de cambios, logs de configuración y soporte a exportaciones/auditorías periódicas.

## **Diferenciadores y alineación al modelo de datos actual:**
- Unificación de usuarios (clientes y empleados) con roles multirol.
- Inventario, ventas y finanzas multimoneda, con integración contable y fiscal (ERP-ready).
- Módulo robusto de archivos y adjuntos polimórficos.
- Logs completos de actividad, accesos, cambios y errores, incluyendo auditoría de correos enviados/fallidos.
- Capacidad de integración con servicios y módulos futuros (mobile, AR, BI).



# 4. MÓDULOS Y FUNCIONALIDADES PRINCIPALES

Al ser un sistema multirol debe tener la opción de seleccionar el rol con el que vamos a trabajar, esta opción deberá estár en el menú principal y disponible en todo momento para que un vendedor que es optometrista pueda realizar el cambio de rol inmediatamente en el sistema y se actualicen sus modulos automaticamente.

## A. Gestión de Usuarios, Roles y Permisos
- Módulo para alta, edición, anulación y reactivación de usuarios, con asignación múltiple de roles (cliente, vendedor, optometrista, admin).
- Paneles con filtros avanzados, buscador y tabla de usuarios, mostrando estado visual (🔴 Activo, 🔴 Inactivo ) y tooltips de motivo/ciclo de vida.
- Gestión granular de permisos por rol, soportando escenarios multirol (un usuario puede ser cliente y empleado simultáneamente).
- Visualización y edición de datos extendidos por rol (dirección para clientes, ficha profesional para empleados).	
- Confirmación doble en acciones críticas (anular/reactivar usuario), mostrando resumen de impacto y solicitando motivo obligatorio.
- Auditoría completa de todas las acciones: historial de cambios, logs por usuario, exportación de reportes, breadcrumbs de navegación y panel de ayuda contextual.

## B. Inventario, Stock y Operación Multisucursal
- Consulta y gestión de inventario por sucursal, producto, categoría y estado (normal, bajo, agotado, anulado), con estados resaltados (color e iconografía).
- Registro de ingresos, salidas, ajustes, transferencias y reversas de inventario, con validación automática de stock no negativo y bloqueo ante inconsistencias.
- Flujos de aprobación/rechazo de transferencias entre sucursales, con logs, motivo obligatorio, feedback visual y barra de progreso.
- Adjuntos soportados en cada movimiento (facturas, fotos, soportes), permitiendo drag & drop, vista previa, timeline de versiones y logs de descarga/modificación.
- Alertas automáticas en encabezado y toasts ante stock bajo, errores de transferencia o movimientos inusuales.
- Reporting y exportación de movimientos, KPI de inventario y rotación, dashboard visual de estados críticos.
- Confirmaciones dobles, “Undo” temporal para acciones no destructivas, skeleton loaders y tooltips explicativos en cada acción.

## C. Agenda, Citas y Gestión de Personal
- Agenda visual semanal y diaria por optometrista y sucursal, drag & drop para reagendar, bloques de color según estado (vigente, completada, anulada).
- Registro, modificación, anulación y reversa de citas, turnos y descansos, con campos obligatorios de motivo, adjuntos justificativos y panel de ayuda contextual.
- Historial clínico modular y versionable, permitiendo visualización de timeline de versiones, consulta de diagnósticos previos, bloqueo de edición en estados protegidos y descarga/exportación para auditoría.
- Gestión de adjuntos clínicos polimórficos (exámenes, recetas, imágenes) con vista previa, drag & drop, historial de versiones, permisos segmentados y logs de cada acción.
- Panel de advertencias (diagnósticos modificados, anulaciones, bloqueos), notificaciones flotantes, skeleton loaders y tour interactivo para onboarding en funciones clínicas.

## D. Ventas, Pedidos y Facturación Electrónica
- Módulo de punto de venta (POS) para vendedor, con buscador de cliente, selección rápida de productos (validando stock en tiempo real), aplicación de cupones/descuentos y cálculo automático de totales/impuestos.
- Flujo de confirmación doble en ventas y generación de facturas, mostrando resumen de impacto, “Undo” temporal en tareas no críticas y toasts de éxito/error.
- Integración completa de facturación electrónica (SRI): emisión, estado de factura (iconografía: 🟢 Emitida, 🟡 Pendiente, 🔴 Rechazada), descarga PDF/XML, envío por correo y logs de entrega/error.
- Panel de pedidos/facturas con filtro avanzado, exportación, historial de cambios, logs de anulación/reversa (con motivo) y breadcrumbs para orientación.
- Adjuntos de soporte (documentos fiscales, órdenes de compra, etc.) con vista previa, timeline, barra de carga y permisos de acceso.
- Reporting y KPI de ventas/facturación, skeleton loaders en grandes consultas, feedback visual constante y cumplimiento de accesibilidad.

## E. Contabilidad y Finanzas Integradas
- Gestión del plan de cuentas contables, jerarquía, alta/baja/edición y asociación con operaciones comerciales y clínicas.
- Registro y consulta de movimientos contables: ventas, egresos, transferencias, gastos y reversas; cada uno con motivo, adjunto, logs de acción y estado visual.
- Panel de conciliación y exportación (ERP-ready), visualización de integración con ERP/facturación, logs de errores y acciones manuales para soporte.
- Dashboard financiero: KPIs, reporte por moneda/sucursal, historial de movimientos, exportación de datos y filtros avanzados.
- Acciones críticas requieren confirmación doble, logs de auditoría y feedback visual inmediato (toast/skeletons).

## G. Auditoría, Logs y Seguridad
- Panel global de logs (acceso, actividad, contabilidad, correos, errores) con filtros por usuario, módulo, acción, fecha, IP y estado.
- Exportación de logs, skeleton loaders en grandes volúmenes y panel de alertas para accesos sospechosos, errores críticos y eventos no resueltos.
- Confirmaciones dobles y justificación obligatoria en acciones sobre logs críticos (eliminar, descargar masivo, marcar como revisado).
- Cumplimiento normativo: acceso a logs restringido por rol, respaldo automático y reporting para soporte/auditoría.

## H. Integración ERP
- Panel de estado de sincronización/exportación a ERP, SRI u otros sistemas, con logs detallados, estado visual y acciones manuales ante errores.
- Exportación avanzada de reportes por módulo (ventas, inventario, clínico, financiero, logs), con skeleton loaders, filtro por periodo, usuario, sucursal, estado y tipo de operación.
- KPI y dashboards customizables por usuario admin/gerente, accesos rápidos y breadcrumbs claros en todo el flujo.

## I. Administración de Ciclo de Vida y Anulación
- Paneles de anulación y reversa en módulos críticos: ventas, pedidos, diagnósticos, facturas, movimientos contables.
- Solicitud y registro obligatorio de motivo/comentario.
- Visualización clara de estados (vigente, anulado, reversado, histórico).
- Bloqueos automáticos de edición/eliminación sobre registros anulados/históricos.
- Logs y auditoría de cada acción de anulación/reversa.

## J. Gestión Polimórfica de Archivos Adjuntos (Global)
  - Componente único para carga y visualización de adjuntos, asociado a cualquier entidad del sistema (pedido, cita, historial, movimiento, factura, descanso, etc.).
  - Visualización de historial/versiones de archivos adjuntos.
  - Permisos granulares sobre visualización, edición y descarga.
  - Registro de logs por cada acción sobre archivos.

## K. Administración de Correo Transaccional y Logs de Envío
- Configuración segura y centralizada del correo emisor para facturación electrónica y notificaciones (usuario, password, host SMTP/API, puerto, cifrado, modo prueba/producción).
- Panel de prueba de conexión/correo para validar la configuración antes de habilitar envíos masivos.
- Registro automático y consulta de logs de envío de correo con estado visual (🔴 Enviado, 🔴 Fallido, 🔴 Pendiente):
    - Por tipo (factura electrónica, alerta), destinatario, entidad asociada, estado y fecha.
    - Visualización y filtro de logs por tipo, destinatario, entidad, estado y mensaje de error, con toast y feedback tras reintentos.
    - Exportación de logs para auditoría o soporte.
- Permite gestión de reintentos manuales en caso de fallo y registro de historial de todas las acciones de configuración y envío.

## L. Criterios UX/UI Transversales en Todos los Módulos
- **Accesibilidad:** Contraste alto, soporte teclado, etiquetas ARIA, diseño responsivo testado en mobile/tablet.
- **Feedback visual:** Toasts/notificaciones en acciones, skeleton loaders en cargas, loaders en uploads/downloads.
- **Confirmación doble y resúmenes de impacto** en todas las acciones irreversibles (anular, revertir, eliminar, restaurar).
- **Previsualización de cambios** y “diff” antes de guardar ediciones sensibles.
- **Ayuda contextual, tooltips y tours interactivos** en paneles críticos y flujos avanzados.
- **Timeline e historial visible** en diagnósticos, adjuntos, movimientos, logs y estados.
- **Estados resaltados** (vigente, anulado, pendiente, error) en color, iconografía y mensajes de estado.
- **Consistencia:** Uso de patrones y componentes repetibles en toda la plataforma.
- **Reporting y exportación** en todos los paneles críticos, con criterios de filtrado granular.


# 5. FLUJOS Y EXPERIENCIA DE USUARIO (POR ROL)
Al ser un sistema multirol debe tener la opción de seleccionar el rol con el que vamos a trabajar, esta opción deberá estár en el menú principal y disponible en todo momento para que un vendedor que es optometrista pueda realizar el cambio de rol inmediatamente en el sistema y se actualicen sus modulos automaticamente.

## A. ADMINISTRADOR/GERENTE

### **Flujos principales:**
- Inicia sesión segura (2FA recomendado para este rol).
- Accede a un dashboard global con KPIs operativos, alertas, logs y notificaciones críticas.
- Gestiona usuarios: búsqueda, alta/baja, edición, asignación de roles, visualización de historial de cambios, anulación, logs por usuario.
- Consulta y gestiona inventario global y por sucursal; puede aprobar, rechazar o reversar transferencias y movimientos críticos, todo con logs y soporte documental.
- Accede a paneles de agenda, citas y descansos de personal; puede ver el flujo global de turnos, modificar o anular registros según permisos, y revisar logs clínicos.
- Consulta y administra ventas, pedidos, facturación electrónica y movimientos contables. Supervisa la integración con ERP/SRI, visualiza errores y ejecuta acciones de exportación manual si es necesario.
- Accede y administra el plan de cuentas contables; puede editar cuentas, asociar operaciones y revisar logs contables.
- Ingresa al módulo de administración de correo: configura SMTP/API, prueba envíos, consulta logs de envío, gestiona reintentos y revisa auditoría de cambios de configuración.
- Supervisa y exporta logs completos de acceso, actividad, contabilidad, auditoría y seguridad, con filtros avanzados por módulo, usuario, entidad, fecha y estado.
- Puede bloquear usuarios, ejecutar reversas, anular registros y visualizar todos los cambios, con motivo y registro de responsable.

### **UX/Visual:**  
Dashboards, paneles de control y filtros avanzados. Botones de acción condicionados por permisos, leyendas y advertencias en acciones críticas, acceso total a reporting y exportación.
---

## B. OPTOMETRISTA

### **Flujos principales:**
- Inicia sesión y accede a su dashboard personal (agenda de citas semanal y diaria, listado de pacientes asignados).
- Visualiza y gestiona citas: puede marcar como completada, cancelar o solicitar cambio/descanso, todo con logs y soporte documental.
- Gestiona historiales clínicos: registra diagnósticos y recetas, sube archivos adjuntos clínicos (exámenes, justificativos, imágenes), accede a versiones anteriores de cada registro.
- Solo puede editar diagnósticos/recetas si el registro está vigente (no anulado ni vinculado a facturación).
- Recibe alertas de citas, turnos, solicitudes de descanso aprobadas/rechazadas.
- Visualiza logs clínicos propios y panel de advertencias (diagnósticos modificados, anulaciones, bloqueos).
- Solicita descansos/turnos con motivo y adjunto justificativo, consulta estado y motivo de respuesta del admin.

### **UX/Visual:**  
Panel tipo agenda/calendario, ficha de paciente y cita, formulario clínico modular, gestión de adjuntos rápida y accesible, advertencias visuales en historiales bloqueados o modificados.
---

## C. VENDEDOR

### **Flujos principales:**
- Inicio de sesión (rol vendedor).
- Registro de ventas en punto de venta:  
    - Búsqueda/registro de cliente (identidad, RUC/cédula, datos de contacto).
    - Búsqueda/Selección de productos/servicios, cantidades y sucursal.
    - Visualización de stock en tiempo real; advertencia y bloqueo si el stock no es suficiente.
    - Aplicación de descuentos/cupones si procede.
    - Cálculo automático del total, impuestos, y moneda.
    - Confirmación de venta:
        - El sistema descuenta automáticamente el stock de los productos vendidos en la sucursal correspondiente.
        - Se crea el pedido asociado al cliente y a la sucursal.
        - Se genera la factura electrónica, cumpliendo formato SRI; la plataforma envía la información y recibe respuesta de validación (emitida, pendiente, rechazada).
        - La factura queda disponible para descarga, impresión y/o envío digital al cliente.
        - El pedido, factura y movimiento de stock quedan vinculados en la base de datos.
        - Se registra el movimiento contable y el log correspondiente para auditoría y conciliación.
    - Estado de factura visible (emitida, anulada, rechazada SRI, etc.).
    - Opción de reimpresión/envío adicional de factura.
- Historial de ventas y facturas:  
    - Consulta de ventas propias, búsqueda avanzada, filtro por estado, fecha, cliente, producto.
    - Exportación de reportes para conciliación y análisis.
- Movimientos de inventario: 
    - Registro de ingresos, salidas, ajustes y transferencias, con motivo y justificación documental si aplica.
    - Visualización del historial completo de movimientos, con soporte para reversas y anulaciones.
    - Alertas por bajo stock y visualización de inventario en tiempo real.

### **UX/Visual:**  
Flujo de caja/punto de venta (POS), formularios rápidos y validación inmediata, panel de facturación con descargas, etiquetas de estado y advertencias, panel de inventario y movimientos enlazado a pedidos/ventas.

## D. EMPLEADO/USUARIO MULTIROL (combinación de los anteriores)

### **Flujos principales:**
- Accede a todos los módulos permitidos por sus roles activos (ejemplo: optometrista y vendedor) mediante la selección del rol en el menú lateral.
- Visualiza solo las acciones habilitadas para cada módulo según permisos.
- Cambia de rol activo o de panel mediante menú rápido.
- La experiencia se adapta mostrando solo datos y acciones relevantes al contexto de cada rol en la sesión.

### **UX/Visual:**  
Menú lateral con acceso rápido a módulos por rol, interfaz contextual, leyendas y acciones condicionadas.
---
## **Experiencia UX:**
Todos los flujos privilegian la rapidez de operación, la claridad visual de estados (activo, anulado, histórico), la seguridad en cada acción, y la trazabilidad absoluta para auditoría y soporte.


# 6. GESTIÓN DE CORREO ELECTRÓNICO TRANSACCIONAL Y AUDITORÍA DE ENVÍOS
Para mayor información revisar docs/manuales/email.md

# 7. MANEJO DE ESTADOS, ANULACIÓN Y CICLO DE VIDA
Para mayor información revisar docs/manuales/estados.md

# 8. GESTIÓN DE ARCHIVOS Y ADJUNTOS
Para mayor información revisar docs/manuales/archivos.md

# 9. GESTIÓN DE LOGS Y AUDITORÍA
Para mayor información revisar docs/manuales/logs.md

# 10. GESTION CLINICA MODULAR
Para mayor información revisar docs/manuales/clinica.md

# 11. GESTIÓN DE INVENTARIO
Para mayor información revisar docs/manuales/inventario.md

# 12. PEDIDOS, FACTURACIÓN Y CONTABILIDAD
Para mayor información revisar docs/manuales/contabilidad.md

# 13. ESTRATEGIA UX/UI Y BUENAS PRÁCTICAS
Para mayor información revisar docs/manuales/UXUI.md

# 14. UX/UI Y WIREFRAMES
Para mayor información revisar docs/manuales/wireframes.md

# 15. BASE DE DATOS PRISMA
Para ver el esquema prisma de la base de datos puedes usar el archivo backend/prisma/schema.prisma

# 16. CRONOGRAMA
Para mayor información revisar docs/manuales/cronograma.md

# 17. AUTENTICACIÓN CON GOOGLE, FACEBOOK, INSTAGRAM
Para esta autenticación se debe usar passport.js   
## Backend (Node/Express):
Usa Passport.js. Es robusto, ampliamente documentado y soporta todos los proveedores populares.
## Frontend:
Usa los SDK oficiales de Google/Facebook/Instagram o bibliotecas como react-oauth/google.
## Flujo típico:
El usuario hace click en “Registrarse con Google”.
El frontend obtiene el token de Google.
El frontend envía el token al backend.
El backend valida el token con Google y extrae el perfil.
El backend crea el usuario (si no existe) y lo autentica.