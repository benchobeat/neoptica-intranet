# Neóptica Intranet

Bienvenido al repositorio oficial de **Neóptica Intranet**, la plataforma de gestión administrativa, clínica y operativa para ópticas modernas.

## 🚀 Últimas Mejoras

### Mejoras en la Experiencia de Usuario (Junio 2025)

- **Formularios con Pestañas**: Reorganización de formularios complejos en pestañas lógicas para mejor usabilidad
- **Indicadores de Carga Mejorados**: Feedback visual durante operaciones asíncronas
- **Validación en Tiempo Real**: Validación mejorada con mensajes claros y precisos
- **Diseño Adaptativo**: Mejoras en la experiencia móvil y de escritorio
- **Optimización de Rendimiento**: Carga más rápida y suave de formularios complejos

### Características Principales

- **Interfaz intuitiva** con navegación clara entre secciones
- **Diseño responsivo** que se adapta perfectamente a móviles y escritorio
- **Feedback visual** en acciones importantes
- **Carga optimizada** para mejor rendimiento
- **Accesibilidad** mejorada siguiendo estándares WCAG

## Documentación Detallada

### Documentación General
- **Cronograma:** Ver [docs/manuales/cronograma.md](docs/manuales/cronograma.md) para el plan detallado de desarrollo y estado actual del proyecto.
- **Setup del proyecto:** Ver [docs/setup.md](docs/setup.md) para instrucciones de configuración.
- **Guía de Estilo y Componentes:** Ver [frontend/README.md](frontend/README.md) para estándares de desarrollo frontend.
- **Directrices de Formularios:** Ver [frontend/docs/ADMIN_FORMS_GUIDELINES.md](frontend/docs/ADMIN_FORMS_GUIDELINES.md) para estándares de formularios administrativos.

### Documentación por Módulos
- **Backend:** Ver [backend/README.md](backend/README.md) para detalles sobre la API, endpoints, arquitectura, y pruebas.
  - Módulos CRUD implementados (Marcas, Colores, Sucursales)
  - Sistema de auditoría y logs
  - Autenticación y permisos
  - Test unitarios (238+ tests)
  
- **Frontend:** Ver [frontend/README.md](frontend/README.md) para detalles sobre la estructura, componentes, y flujos de usuario.
  - **Formularios Avanzados**
    - Formularios con pestañas para mejor organización
    - Validación en tiempo real
    - Indicadores de carga mejorados
    - Retroalimentación visual mejorada
  - **Componentes UI Reutilizables**
    - `CustomTable` para listados consistentes
    - `FormModal` para formularios modales
    - `LoadingButton` con estados integrados
  - **Experiencia de Usuario**
    - Carga perezosa de componentes
    - Esqueletos de carga
    - Manejo de errores mejorado
  - **Seguridad**
    - Autenticación JWT
    - Control de acceso basado en roles
    - Protección de rutas

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

# 3. ARQUITECTURA TECNOLÓGICA – INTRANET NEÓPTICA

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

# 6. DECISIONES DE DISEÑO Y VERSIONES FUTURAS

## Cambios de Diseño para Versión 1.0

### Enfoque en Sucursal Única

En la versión 1.0 de la Intranet Neóptica, hemos tomado la decisión estratégica de enfocarnos en una implementación para **sucursal única**. Esto implica que:

- **Transferencias entre sucursales:** Este módulo ha sido movido a la Versión 2.0, ya que inicialmente solo operaremos con una sucursal.
- **Simplificación del inventario:** El inventario se gestiona únicamente para la sucursal principal, eliminando la complejidad de transferencias y conciliación entre múltiples ubicaciones.
- **Optimización de flujos de trabajo:** Los procesos de abastecimiento y control de stock se han optimizado para un único punto de operación.

Esta decisión permite acelerar el desarrollo y despliegue de la versión inicial, enfocando los recursos en perfeccionar los módulos críticos para la operación inmediata del negocio.

### Funcionalidades Previstas para Versión 2.0

Las siguientes funcionalidades están planificadas para la Versión 2.0:

- **Módulo completo de transferencias entre sucursales**
  - Solicitudes de transferencia
  - Aprobación/rechazo de transferencias
  - Historial y seguimiento de transferencias
  - Validaciones de stock en origen/destino
  - Reportes de transferencias

- **Gestión multi-sucursal avanzada**
  - Dashboard consolidado multi-sucursal
  - Reportes comparativos entre sucursales
  - KPIs por sucursal

Este enfoque iterativo permite entregar valor de forma más rápida mientras se construye una base sólida para la escalabilidad futura.


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


# 7. GESTIÓN DE CORREO ELECTRÓNICO TRANSACCIONAL Y AUDITORÍA DE ENVÍOS
Para mayor información revisar docs/manuales/email.md

# 8. MANEJO DE ESTADOS, ANULACIÓN Y CICLO DE VIDA
Para mayor información revisar docs/manuales/estados.md


# 9. ESTADO ACTUAL Y RECOMENDACIONES PARA AUTENTICACIÓN SOCIAL (OAUTH)

## Estado actual de la configuración OAuth (Google, Facebook, Instagram)

Actualmente, el sistema de autenticación social está configurado para funcionar **exclusivamente en entorno local de desarrollo**. Las URLs de callback de los proveedores (Google, Facebook, Instagram) están definidas para apuntar a `localhost` y al backend local (puerto 4000), por ejemplo:

- `http://localhost:4000/api/auth/google/callback`
- `http://localhost:4000/api/auth/facebook/callback`
- `http://localhost:4000/api/auth/instagram/callback`

Esto permite desarrollar y probar la autenticación social sin exponer credenciales reales ni depender de dominios públicos.

**Importante:** Si intentas usar el login social en un entorno publicado (producción) sin actualizar estas URLs, obtendrás errores del tipo `redirect_uri_mismatch` y el flujo OAuth fallará.

## ¿Cuándo migrar a la URL real del proyecto?

**Recomendación:**
- Mantén la configuración en `localhost` mientras desarrollas y pruebas localmente.
- **Solo cambia a la URL real del proyecto cuando tu aplicación esté publicada en un dominio definitivo** (ejemplo: `https://intranet.neoptica.com`).
- Realiza la migración de URLs de callback y orígenes autorizados en los paneles de desarrollador de Google, Facebook e Instagram **antes de anunciar o abrir el login social a usuarios reales**.

## Pasos para migrar a producción

1. **Publica tu aplicación en el dominio definitivo** (ejemplo: `https://intranet.neoptica.com`).
2. **Actualiza las variables de entorno del backend** (`.env`):
   ```
   GOOGLE_CALLBACK_URL=https://intranet.neoptica.com/api/auth/google/callback
   FACEBOOK_CALLBACK_URL=https://intranet.neoptica.com/api/auth/facebook/callback
   INSTAGRAM_CALLBACK_URL=https://intranet.neoptica.com/api/auth/instagram/callback
   FRONTEND_URL=https://intranet.neoptica.com
   ```
3. **En Google Cloud Console, Facebook Developers e Instagram Developers:**
   - Registra exactamente las mismas URLs de callback y orígenes autorizados.
   - Ejemplo para Google:
     - Origen autorizado: `https://intranet.neoptica.com`
     - URI de redirección autorizada: `https://intranet.neoptica.com/api/auth/google/callback`
4. **Reinicia el backend** para que tome los nuevos valores de entorno.
5. **Verifica el flujo en producción**: realiza login social desde el dominio publicado.
6. **Nunca publiques el sistema con URLs de callback apuntando a localhost**.

## Advertencias y mejores prácticas
- **Nunca compartas ni subas tus secretos OAuth a un repositorio público.** Usa variables de entorno.
- **No uses credenciales de desarrollo en producción.** Genera nuevos IDs/secrets para el entorno productivo.
- **Verifica siempre que las URLs de callback coincidan exactamente** (protocolo, dominio, path, sin espacios extra).
- **Si cambias el dominio, repite el proceso** en todos los proveedores OAuth.

---

> **Estado actual:** Solo se permite login social en entorno local (`localhost:4000`). Para habilitarlo en producción, sigue los pasos detallados arriba.

# 10. GESTIÓN DE ARCHIVOS Y ADJUNTOS
Para mayor información revisar docs/manuales/archivos.md

# 11. GESTIÓN DE LOGS Y AUDITORÍA
Para mayor información revisar docs/manuales/logs.md

# 12. GESTION CLINICA MODULAR
Para mayor información revisar docs/manuales/clinica.md

# 13. GESTIÓN DE INVENTARIO
Para mayor información revisar docs/manuales/inventario.md

# 14. PEDIDOS, FACTURACIÓN Y CONTABILIDAD
Para mayor información revisar docs/manuales/contabilidad.md

# 15. ESTRATEGIA UX/UI Y BUENAS PRÁCTICAS
Para mayor información revisar docs/manuales/UXUI.md

# 16. UX/UI Y WIREFRAMES
Para mayor información revisar docs/manuales/wireframes.md

# 17. BASE DE DATOS PRISMA
Para ver el esquema prisma de la base de datos puedes usar el archivo backend/prisma/schema.prisma

# 18. CRONOGRAMA
Para mayor información revisar docs/manuales/cronograma.md

# 19. SISTEMA MULTI-ROL DE USUARIOS

## Visión General del Sistema Multi-Rol

El sistema de Neóptica Intranet implementa una arquitectura multi-rol avanzada que permite a un mismo usuario tener asignados múltiples roles simultáneamente. Esto facilita escenarios como un empleado que puede actuar como vendedor y como optometrista en diferentes contextos.

### Características principales:

1. **Asignación de múltiples roles**: Un usuario puede tener varios roles asignados (vendedor, optometrista, administrador, etc.).

2. **JWT con array de roles**: Los tokens JWT incluyen todos los roles del usuario para autorización dinámica.

3. **Cambio dinámico de rol activo**: Desde la UI, los usuarios pueden cambiar su rol activo en cualquier momento sin cerrar sesión.

4. **Middleware de autorización multi-rol**: Valida permisos considerando todos los roles asignados al usuario.

5. **Auditoría completa**: Cada asignación, modificación y revocación de rol queda registrada con usuario y timestamp.

### Implementación técnica:

- Tabla asociativa `usuario_rol` con campos completos de auditoría
- Generación de tokens JWT que incluyen array de roles
- Middleware especializado para validación de permisos basado en múltiples roles

Para más detalles técnicos sobre la implementación, consultar `docs/manuales/auth-roles.md`.

# 20. AUTENTICACIÓN CON REDES SOCIALES (GOOGLE, FACEBOOK, INSTAGRAM)

Este proyecto soporta autenticación de usuarios a través de Google, Facebook e Instagram usando Passport.js en el backend y JWT para la gestión de sesiones.

## Flujo General
1. El usuario hace click en “Registrarse con Google/Facebook/Instagram” en el frontend.
2. El frontend redirige al backend (`/api/auth/google`, `/api/auth/facebook`, `/api/auth/instagram`).
3. El usuario autoriza la app en la red social.
4. La red social redirige al backend (`/api/auth/{proveedor}/callback`).
5. El backend valida el perfil y genera un JWT que incluye array con todos los roles asignados al usuario.
6. El backend redirige al frontend con el token JWT como parámetro en la URL (`/oauth-success?token=...`).
7. El frontend captura el token, lo almacena y autentica al usuario en la app, mostrando la interfaz adaptada a sus roles.

---

## Configuración Backend (Node/Express)

- **Passport.js:** Configurado con estrategias para Google, Facebook e Instagram.
- **JWT:** El backend emite un token JWT válido por 7 días tras el login social o tradicional, incluyendo un array con todos los roles asignados al usuario para autorización multi-rol.
- **Rutas OAuth:**
  - `/api/auth/google` y `/api/auth/google/callback`
  - `/api/auth/facebook` y `/api/auth/facebook/callback`
  - `/api/auth/instagram` y `/api/auth/instagram/callback`
- **Protección de rutas:** Usa los middlewares `validarJWT` para autenticación y `validarRoles` para autorización multi-rol, protegiendo endpoints según los permisos requeridos.
- **Variables de entorno requeridas:**

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback
INSTAGRAM_CLIENT_ID=...
INSTAGRAM_CLIENT_SECRET=...
INSTAGRAM_CALLBACK_URL=http://localhost:3000/auth/instagram/callback
JWT_SECRET=clave_secreta_segura
FRONTEND_URL=http://localhost:3000
```

- **Modelo Prisma recomendado:**
```prisma
model usuario {
  id              String   @id @default(uuid())
  email           String   @unique
  nombre_completo String
  password        String?
  telefono        String?
  proveedor_oauth String?
  oauth_id        String?
  activo          Boolean  @default(true)
  creado_en       DateTime @default(now()) @db.Timestamptz(6)
  creado_por      String?
  modificado_en   DateTime? @db.Timestamptz(6)
  modificado_por  String?
  anulado_en      DateTime? @db.Timestamptz(6)
  anulado_por     String?
  usuario_rol     usuario_rol[] // Relación con roles (many-to-many)
  // ...otros campos...
  @@unique([proveedor_oauth, oauth_id])
}
```

---

## Configuración Frontend

- **Redirección:** Al pulsar un botón social, redirige al endpoint `/api/auth/{proveedor}` del backend.
- **Captura del token:** Crea una ruta `/oauth-success` que lea el token de la URL (`window.location.search`), lo almacene en `localStorage` y redirija al dashboard.
- **Uso del token:** En cada request protegido, envía el JWT en el header:
  - `Authorization: Bearer <token>`
- **Ejemplo de captura en React:**

```jsx
// /src/pages/OauthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OauthSuccess() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);
  return <div>Autenticando...</div>;
}
```

- **Botones de login social:** Cada botón debe redirigir a `/api/auth/google`, `/api/auth/facebook` o `/api/auth/instagram`.

---

## Resumen de Seguridad y Buenas Prácticas
- El backend nunca expone secretos OAuth al frontend.
- El JWT solo lo emite el backend tras validar el perfil social.
- Las rutas protegidas requieren el header `Authorization: Bearer <token>`.
- El frontend debe manejar el almacenamiento seguro del token y cerrar sesión eliminándolo.

---

Para dudas o problemas, revisar la sección de autenticación en este README o contactar al equipo de desarrollo.

# 20. AUTENTICACIÓN CON GOOGLE, FACEBOOK, INSTAGRAM
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

# 21. ESQUEMA RELACIONAL DE BASE DE DATOS

## Diagrama Entidad-Relación

El sistema Neóptica Intranet utiliza un esquema de base de datos relacional PostgreSQL gestionado a través de Prisma ORM. La estructura principal se organiza en los siguientes grupos funcionales:

### Gestión de Usuarios y Autenticación
- `usuario` ↔️ `rol` (a través de `usuario_rol` - relación many-to-many para el sistema multi-rol)
- `usuario` ↔️ `reset_token` (tokens para recuperación de contraseñas)
- `usuario_rol` con campos completos de auditoría (creado_en, modificado_en, anulado_en)

### Gestión Clínica
- `cita` ↔️ `usuario` (como cliente y como optometrista)
- `cita` ↔️ `sucursal`
- `cita` ↔️ `historial_clinico`
- `cita` ↔️ `receta`

### Gestión de Inventario
- `producto` ↔️ `marca`
- `producto` ↔️ `color`
- `producto` ↔️ `inventario` ↔️ `sucursal`
- `inventario` ↔️ `movimiento_inventario`
- `transferencia_stock` (gestiona movimientos entre sucursales)

### Ventas y Facturación
- `pedido` ↔️ `usuario` (como cliente)
- `pedido` ↔️ `detalle_pedido` ↔️ `producto`
- `pedido` ↔️ `factura`
- `pedido` ↔️ `pago`
- `factura` ↔️ `archivo_adjunto` (PDFs y XMLs)

### Contabilidad
- `cuenta_contable` (estructura jerárquica)
- `asiento_contable` ↔️ `movimiento_contable`
- `movimiento_contable` ↔️ `cuenta_contable`
- `asiento_contable` ↔️ `factura`, `gasto`, `pago`, `pedido`

### Sistema de Archivos
- `archivo_adjunto` ↔️ `archivo_entidad` (sistema polimórfico para adjuntos)

### Auditoría y Logs
- `log_auditoria` (registra acciones en todo el sistema)

## Anomalías y Áreas de Mejora

~~En el análisis detallado del esquema se identificaron las siguientes anomalías y oportunidades de mejora, que ahora han sido implementadas:~~

✅ **1. Tabla `cupon` sin relaciones**: ~~Actualmente es una tabla huérfana sin conexiones con otras entidades.~~ Ahora se han implementado las siguientes relaciones:
   - Relación con `pedido` para registrar uso de cupones y descuentos aplicados
   - Relación muchos a muchos con `producto` mediante la tabla `producto_cupon`
   - Relación con `usuario` para cupones personalizados por cliente

✅ **2. Redundancia en contabilidad**: ~~Algunas entidades como `pedido` tenían tanto `asiento_contable_id` como `movimiento_contable_id`.~~ Se ha eliminado el campo redundante `movimiento_contable_id` de la tabla `pedido`, manteniendo solo la relación con `asiento_contable_id` para simplificar el modelo y evitar inconsistencias.

✅ **3. Inconsistencia en campos temporales**: ~~La tabla `receta` usaba tipos diferentes para los campos temporales.~~ Se han estandarizado los campos de control temporal en la tabla `receta` para seguir el mismo patrón que el resto de tablas, usando `DateTime?` con `@db.Timestamptz(6)` y tipos UUID para los campos de usuario.

✅ **4. Nomenclatura inconsistente en relaciones**: Aunque se mantienen algunas relaciones con nomenclatura extensa por compatibilidad, las nuevas relaciones implementadas siguen un formato simple y descriptivo (ej. `productos_cupones`, `cupones`).

✅ **5. Entidad `integracion_erp` mejorada**: ~~Anteriormente utilizaba campos genéricos como `entidad_tipo` y `estado` con strings.~~ Ahora implementa enums tipados:
   - `EntidadTipoERP` para especificar el tipo de entidad (PRODUCTO, PEDIDO, FACTURA, etc.)
   - `EstadoIntegracionERP` para estados del proceso (PENDIENTE, PROCESANDO, COMPLETADO, ERROR, CANCELADO)

## ✅ Mejoras Implementadas en el Esquema

Las recomendaciones propuestas han sido implementadas exitosamente en el esquema de base de datos. A continuación se detalla lo que se ha logrado:

### 1. Vinculación de la tabla `cupon`

Se ha implementado una solución más robusta que la inicialmente propuesta, utilizando una tabla asociativa para la relación muchos a muchos con productos:

```prisma
model cupon {
  // Relaciones implementadas
  pedidos           pedido[] // Relación con pedidos donde se ha usado este cupón
  usuario_id        String?  @db.Uuid // Para cupones personalizados por usuario
  usuario           usuario? @relation(fields: [usuario_id], references: [id])
  productos_cupones producto_cupon[] // Relación muchos a muchos con productos
  tipo              String?  @db.VarChar(30) // Clasifica el tipo de cupón
}

model producto_cupon {
  // Relación muchos a muchos
  producto_id String @db.Uuid
  cupon_id    String @db.Uuid
  producto    producto @relation(fields: [producto_id], references: [id], onDelete: Cascade)
  cupon       cupon    @relation(fields: [cupon_id], references: [id], onDelete: Cascade)
  @@unique([producto_id, cupon_id])
}

model pedido {
  // Campos y relación con cupón
  cupon_id          String?  @db.Uuid
  descuento_aplicado Decimal? @db.Decimal(10, 2) // Monto exacto del descuento
  cupon             cupon?   @relation(fields: [cupon_id], references: [id])
}
```

### 2. Estandarización de campos temporales

Se ha actualizado el modelo `receta` para seguir el estándar de campos de control:

```prisma
model receta {
  // Campos de control estandarizados
  creado_en      DateTime? @default(now()) @db.Timestamptz(6)
  creado_por     String?   @db.Uuid
  modificado_en  DateTime? @db.Timestamptz(6)
  modificado_por String?   @db.Uuid
  anulado_en     DateTime? @db.Timestamptz(6)
  anulado_por    String?   @db.Uuid
}
```

### 3. Eliminación de redundancia en contabilidad

Se ha eliminado el campo redundante en el modelo `pedido`:

```prisma
model pedido {
  // Campo redundante eliminado
  // movimiento_contable_id String? @db.Uuid
  
  // Se mantiene solo la relación con asiento_contable
  asiento_contable_id String? @db.Uuid
  asiento_contable   asiento_contable? @relation(fields: [asiento_contable_id], references: [id])
}
```

### 4. Mejora en la integración ERP

Se han implementado enums para mejorar la tipificación y prevenir errores:

```prisma
// Enums para tipos de entidades y estados en ERP
enum EntidadTipoERP {
  PRODUCTO
  PEDIDO
  FACTURA
  CLIENTE
  USUARIO
  PAGO
  GASTO
  MOVIMIENTO
  ASIENTO
}

enum EstadoIntegracionERP {
  PENDIENTE
  PROCESANDO
  COMPLETADO
  ERROR
  CANCELADO
}

model integracion_erp {
  entidad_tipo     EntidadTipoERP?
  estado           EstadoIntegracionERP? @default(PENDIENTE)
  // resto del modelo
}
```

## Cómo utilizar las nuevas funcionalidades

### 1. Sistema de Cupones

#### Crear un cupón para productos específicos

```typescript
// Ejemplo de creación de cupón para productos específicos
async function crearCuponParaProductos(datosCupon, productosIds) {
  return await prisma.cupon.create({
    data: {
      codigo: datosCupon.codigo,
      descripcion: datosCupon.descripcion,
      monto_descuento: datosCupon.monto_descuento,
      vigencia_inicio: datosCupon.vigencia_inicio,
      vigencia_fin: datosCupon.vigencia_fin,
      tipo: 'producto',
      productos_cupones: {
        create: productosIds.map(productoId => ({
          producto_id: productoId,
          creado_por: datosCupon.usuario_id
        }))
      },
      creado_por: datosCupon.usuario_id
    }
  });
}
```

#### Aplicar un cupón a un pedido

```typescript
// Ejemplo de aplicación de cupón a un pedido
async function aplicarCuponAPedido(pedidoId, cuponCodigo, usuarioId) {
  // Obtener cupón por código
  const cupon = await prisma.cupon.findUnique({
    where: { codigo: cuponCodigo },
    include: {
      productos_cupones: { include: { producto: true } }
    }
  });
  
  if (!cupon || !cupon.activo) throw new Error('Cupón inválido');
  
  // Calcular descuento según tipo de cupón
  // [...] Lógica de cálculo según tipo
  
  // Aplicar cupón en transacción
  return await prisma.$transaction(async (tx) => {
    // Actualizar pedido
    const pedidoActualizado = await tx.pedido.update({
      where: { id: pedidoId },
      data: {
        cupon_id: cupon.id,
        descuento_aplicado: descuento,
        total: { decrement: descuento },
        modificado_por: usuarioId,
        modificado_en: new Date()
      }
    });
    
    // Incrementar uso del cupón
    await tx.cupon.update({
      where: { id: cupon.id },
      data: {
        usos_realizados: { increment: 1 },
        modificado_por: usuarioId
      }
    });
    
    // Registrar en audit log
    await tx.log_auditoria.create({
      data: {
        usuarioId: usuarioId,
        accion: 'APLICAR_CUPON',
        descripcion: `Cupón ${cupon.codigo} aplicado al pedido ${pedidoId}`,
        entidad_tipo: 'pedido',
        entidad_id: pedidoId,
        modulo: 'pedidos'
      }
    });
    
    return pedidoActualizado;
  });
}
```

### 2. Uso de Enums para Integración ERP

```typescript
// Ejemplo de uso de los enums para integración ERP
import { PrismaClient, EntidadTipoERP, EstadoIntegracionERP } from '@prisma/client';

async function registrarIntegracionERP(entidad, datos, usuarioId) {
  const prisma = new PrismaClient();
  
  // Usar enums tipados
  return await prisma.integracion_erp.create({
    data: {
      entidad_tipo: EntidadTipoERP.PRODUCTO, // Valor enum tipado
      entidad_id: entidad.id,
      estado: EstadoIntegracionERP.PENDIENTE, // Valor enum tipado
      request_payload: datos,
      creado_por: usuarioId
    }
  });
}

async function actualizarEstadoIntegracion(id, estado, respuesta, usuarioId) {
  const prisma = new PrismaClient();
  
  return await prisma.integracion_erp.update({
    where: { id },
    data: {
      estado, // EstadoIntegracionERP.COMPLETADO o EstadoIntegracionERP.ERROR
      response_payload: respuesta,
      modificado_por: usuarioId,
      modificado_en: new Date()
    }
  });
}
```

## Próximos pasos recomendados

### 1. Optimización de índices

Aunque las relaciones principales han sido implementadas, se recomienda añadir índices adicionales para optimizar consultas frecuentes:

```prisma
// Ejemplos de índices adicionales a considerar
model log_auditoria {
  // ...
  @@index([entidad_tipo, entidad_id], map: "idx_log_entidad")
  @@index([fecha, accion], map: "idx_log_fecha_accion")
}

model cupon {
  // ...
  @@index([vigencia_inicio, vigencia_fin, activo], map: "idx_cupon_vigencia")
}
```

### 2. Implementación de controladores y endpoints

Aprovechar las nuevas relaciones implementando los controladores y rutas correspondientes para cupones y gestión ERP, siguiendo el patrón CRUD establecido en otros módulos del sistema como sucursales, marcas y colores.

### 3. Mejora en integridad referencial

Revisar las reglas de eliminación (`onDelete`) en todas las relaciones para asegurar consistencia con la lógica de negocio, especialmente para las nuevas relaciones implementadas.

Las mejoras implementadas han fortalecido significativamente la estructura de la base de datos, eliminando tablas huérfanas, estandarizando campos y mejorando la integridad referencial, lo que facilitará el mantenimiento y escalabilidad del sistema.

# 22. RESUMEN DE MODELOS Y RELACIONES DEL ESQUEMA DE BASE DE DATOS

Esta sección proporciona una visión general de todos los modelos de la base de datos, sus propósitos principales y relaciones, facilitando la comprensión del esquema sin necesidad de revisar directamente el archivo schema.prisma.

## Modelos Principales y sus Relaciones

### Sistema de Usuarios y Autenticación

#### `usuario`
**Descripción**: Almacena todos los usuarios del sistema, tanto clientes como empleados con diferentes roles.
**Campos principales**: `id`, `nombre_completo`, `email`, `password`, `telefono`, `dni`, `foto_perfil`, `direccion`, `activo`
**Relaciones**:
- `usuario_rol[]` → Roles asignados al usuario
- `pedido[]` → Pedidos realizados por el usuario
- `cita[]` (como cliente y como optometrista) → Citas médicas programadas
- `factura[]` → Facturas asociadas al usuario
- `reset_token[]` → Tokens para recuperación de contraseña
- `cupones[]` → Cupones personalizados para el usuario

#### `rol`
**Descripción**: Define los roles disponibles en el sistema (admin, vendedor, optometrista, cliente, etc.)
**Campos principales**: `id`, `nombre`, `descripcion`
**Relaciones**:
- `usuario_rol[]` → Asignaciones de este rol a usuarios

#### `usuario_rol`
**Descripción**: Tabla asociativa para la relación muchos a muchos entre usuarios y roles, implementa el sistema multi-rol que permite a un usuario tener múltiples roles simultáneamente.
**Campos principales**: `id`, `usuario_id`, `rol_id`, `creado_en`, `creado_por`, `modificado_en`, `modificado_por`, `anulado_en`, `anulado_por`
**Funcionalidad**: Permite que un mismo usuario pueda tener múltiples roles (ej: ser vendedor y optometrista simultáneamente), con auditoría completa de asignación, modificación y revocación de roles.
**Relaciones**:
- `usuario` → Usuario al que se asigna el rol
- `rol` → Rol asignado

#### `reset_token`
**Descripción**: Almacena tokens temporales para recuperación de contraseñas.
**Campos principales**: `id`, `usuario_id`, `token`, `expires_at`, `used`
**Relaciones**:
- `usuario` → Usuario que solicitó la recuperación

### Gestión Clínica

#### `cita`
**Descripción**: Registra citas médicas programadas entre optometristas y clientes.
**Campos principales**: `id`, `cliente_id`, `optometrista_id`, `sucursal_id`, `fecha_hora`, `estado`
**Relaciones**:
- `usuario` (cliente_id) → Cliente que asiste a la cita
- `usuario` (optometrista_id) → Optometrista que atiende la cita
- `sucursal` → Sucursal donde se realiza la cita
- `historial_clinico[]` → Registros clínicos asociados a la cita
- `receta[]` → Recetas generadas en la cita

#### `historial_clinico`
**Descripción**: Almacena el historial médico de los clientes.
**Campos principales**: `id`, `cliente_id`, `optometrista_id`, `cita_id`, `fecha`, `descripcion`, `version`
**Relaciones**:
- `cita` → Cita asociada al registro
- `usuario` (cliente_id) → Cliente al que pertenece el historial
- `usuario` (optometrista_id) → Optometrista que realizó el registro

#### `receta`
**Descripción**: Almacena recetas oftalmológicas con datos de corrección visual.
**Campos principales**: `id`, `citaId`, `tipo`, `esfera_od`, `esfera_oi`, `cilindro_od`, `cilindro_oi`, `eje_od`, `eje_oi`, `adicion`, `dp`
**Relaciones**:
- `cita` → Cita donde se generó la receta

### Inventario y Productos

#### `producto`
**Descripción**: Registra productos disponibles para venta.
**Campos principales**: `id`, `nombre`, `descripcion`, `precio`, `categoria`, `imagen_url`, `modelo_3d_url`, `activo`, `marca_id`, `color_id`
**Relaciones**:
- `marca` → Marca del producto
- `color` → Color del producto
- `detalle_pedido[]` → Líneas de pedido que incluyen este producto
- `inventario[]` → Existencias del producto por sucursal
- `transferencia_stock[]` → Transferencias que involucran este producto
- `productos_cupones[]` → Cupones aplicables a este producto

#### `marca`
**Descripción**: Almacena las marcas de productos.
**Campos principales**: `id`, `nombre`, `descripcion`, `activo`
**Relaciones**:
- `productos[]` → Productos de esta marca

#### `color`
**Descripción**: Almacena los colores disponibles para productos.
**Campos principales**: `id`, `nombre`, `descripcion`, `activo`
**Relaciones**:
- `productos[]` → Productos de este color

#### `inventario`
**Descripción**: Registra el stock de productos por sucursal.
**Campos principales**: `id`, `sucursal_id`, `producto_id`, `stock`, `stock_minimo`
**Relaciones**:
- `producto` → Producto inventariado
- `sucursal` → Sucursal donde se almacena
- `movimiento_inventario[]` → Movimientos de inventario asociados

#### `movimiento_inventario`
**Descripción**: Registra entradas, salidas y ajustes de inventario.
**Campos principales**: `id`, `inventario_id`, `usuario_id`, `tipo`, `cantidad`, `motivo`, `fecha`, `reversa_de`, `anulado`
**Relaciones**:
- `inventario` → Inventario afectado
- `usuario` → Usuario que realizó el movimiento
- `movimiento_inventario` (reversa_de) → Movimiento original que se reversa

#### `transferencia_stock`
**Descripción**: Gestiona transferencias de productos entre sucursales.
**Campos principales**: `id`, `producto_id`, `sucursal_origen`, `sucursal_destino`, `solicitado_por`, `revisado_por`, `cantidad`, `motivo`, `estado`
**Relaciones**:
- `producto` → Producto transferido
- `sucursal` (origen) → Sucursal de origen
- `sucursal` (destino) → Sucursal de destino
- `usuario` (solicitado_por) → Usuario que solicitó la transferencia
- `usuario` (revisado_por) → Usuario que aprobó/rechazó la transferencia

### Ventas y Facturación

#### `pedido`
**Descripción**: Registra pedidos de compra de productos.
**Campos principales**: `id`, `cliente_id`, `sucursal_id`, `estado`, `total`, `metodo_pago`, `estado_pago`, `moneda`, `cupon_id`, `descuento_aplicado`
**Relaciones**:
- `usuario` → Cliente que realiza el pedido
- `sucursal` → Sucursal donde se procesa
- `detalle_pedido[]` → Líneas de detalle del pedido
- `factura[]` → Facturas generadas por este pedido
- `pago[]` → Pagos asociados al pedido
- `asiento_contable` → Asiento contable relacionado
- `cupon` → Cupón aplicado al pedido

#### `detalle_pedido`
**Descripción**: Almacena las líneas de detalle de los pedidos.
**Campos principales**: `id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`
**Relaciones**:
- `pedido` → Pedido al que pertenece el detalle
- `producto` → Producto solicitado

#### `factura`
**Descripción**: Registra facturas emitidas por ventas.
**Campos principales**: `id`, `pedido_id`, `cliente_id`, `fecha_emision`, `estado`, `archivo_xml_id`, `archivo_pdf_id`, `moneda`, `erp_id`, `asiento_contable_id`
**Relaciones**:
- `pedido` → Pedido facturado
- `usuario` → Cliente facturado
- `archivo_adjunto` (XML) → Archivo XML de la factura electrónica
- `archivo_adjunto` (PDF) → Archivo PDF de la factura
- `asiento_contable` → Asiento contable relacionado

#### `pago`
**Descripción**: Registra pagos recibidos por pedidos.
**Campos principales**: `id`, `pedido_id`, `monto`, `fecha_pago`, `metodo`, `referencia_externa`, `usuario_id`, `moneda`, `asiento_contable_id`
**Relaciones**:
- `pedido` → Pedido pagado
- `usuario` → Usuario que registra el pago
- `asiento_contable` → Asiento contable relacionado

#### `cupon`
**Descripción**: Gestiona cupones de descuento para pedidos.
**Campos principales**: `id`, `codigo`, `descripcion`, `monto_descuento`, `vigencia_inicio`, `vigencia_fin`, `limite_uso`, `usos_realizados`, `activo`, `tipo`, `usuario_id`
**Relaciones**:
- `pedidos[]` → Pedidos donde se ha usado este cupón
- `usuario` → Usuario para el que se creó el cupón (opcional)
- `productos_cupones[]` → Productos a los que aplica este cupón

#### `producto_cupon`
**Descripción**: Tabla asociativa para la relación muchos a muchos entre productos y cupones.
**Campos principales**: `id`, `producto_id`, `cupon_id`
**Relaciones**:
- `producto` → Producto al que aplica el cupón
- `cupon` → Cupón aplicable al producto

### Contabilidad y Finanzas

#### `cuenta_contable`
**Descripción**: Define el plan de cuentas contables con estructura jerárquica.
**Campos principales**: `id`, `codigo`, `nombre`, `tipo`, `descripcion`, `cuenta_padre_id`, `activo`
**Relaciones**:
- `cuenta_contable` (cuenta_padre_id) → Cuenta padre (estructura jerárquica)
- `movimiento_contable[]` → Movimientos en esta cuenta

#### `asiento_contable`
**Descripción**: Registra asientos contables para operaciones financieras.
**Campos principales**: `id`, `fecha`, `descripcion`, `referencia_externa`, `tipo`, `entidad_tipo`, `entidad_id`, `sucursal_id`, `usuario_id`, `estado`, `exportado`
**Relaciones**:
- `movimientos[]` → Movimientos contables del asiento
- `sucursal` → Sucursal relacionada
- `usuario` → Usuario que creó el asiento
- `facturas[]` → Facturas relacionadas
- `gastos[]` → Gastos relacionados
- `pagos[]` → Pagos relacionados
- `pedidos[]` → Pedidos relacionados

#### `movimiento_contable`
**Descripción**: Registra movimientos debe/haber en cuentas contables.
**Campos principales**: `id`, `asiento_id`, `tipo`, `monto`, `cuenta_id`, `sucursal_id`, `usuario_id`, `entidad_tipo`, `entidad_id`, `exportado`, `reversa_de`
**Relaciones**:
- `asiento_contable` → Asiento al que pertenece
- `cuenta_contable` → Cuenta afectada
- `sucursal` → Sucursal relacionada
- `usuario` → Usuario que registró el movimiento
- `movimiento_contable_entidad[]` → Entidades relacionadas
- `movimiento_contable` (reversa_de) → Movimiento original que se reversa

#### `gasto`
**Descripción**: Registra gastos operativos.
**Campos principales**: `id`, `descripcion`, `monto`, `fecha_gasto`, `categoria`, `usuario_id`, `sucursal_id`, `moneda`, `asiento_contable_id`
**Relaciones**:
- `sucursal` → Sucursal donde se registra
- `usuario` → Usuario que registra el gasto
- `asiento_contable` → Asiento contable relacionado

### Sucursales

#### `sucursal`
**Descripción**: Almacena las sucursales de la óptica.
**Campos principales**: `id`, `nombre`, `direccion`, `latitud`, `longitud`, `telefono`, `email`, `estado`
**Relaciones**:
- `cita[]` → Citas programadas en esta sucursal
- `descanso_empleado[]` → Descansos de empleados en esta sucursal
- `inventario[]` → Inventario de productos en esta sucursal
- `pedido[]` → Pedidos procesados en esta sucursal
- `transferencia_stock[]` → Transferencias hacia/desde esta sucursal
- `asiento_contable[]` → Asientos contables relacionados

### Gestión de Archivos

#### `archivo_adjunto`
**Descripción**: Almacena archivos adjuntos para cualquier entidad del sistema.
**Campos principales**: `id`, `nombre_archivo`, `url`, `tipo`, `tamanio`, `extension`, `subido_por`
**Relaciones**:
- `usuario` → Usuario que subió el archivo
- `archivo_entidad[]` → Entidades a las que está vinculado
- `descanso_empleado[]` → Descansos con este adjunto
- `factura[]` → Facturas con este archivo (PDF/XML)

#### `archivo_entidad`
**Descripción**: Vincula archivos adjuntos con entidades del sistema (polimórfico).
**Campos principales**: `id`, `archivo_id`, `entidad_tipo`, `entidad_id`, `fecha_vinculo`
**Relaciones**:
- `archivo_adjunto` → Archivo adjunto vinculado

### Logs y Auditoría

#### `log_auditoria`
**Descripción**: Registra todas las acciones importantes en el sistema para auditoría.
**Campos principales**: `id`, `usuarioId`, `accion`, `descripcion`, `fecha`, `ip`, `entidad_tipo`, `entidad_id`, `modulo`
**Relaciones**:
- `usuario` → Usuario que realizó la acción
- `movimiento_contable` → Movimiento contable relacionado (opcional)

### Gestión de Personal

#### `descanso_empleado`
**Descripción**: Registra períodos de descanso o ausencia de empleados.
**Campos principales**: `id`, `empleado_id`, `sucursal_id`, `fecha_inicio`, `fecha_fin`, `motivo`, `estado`, `adjunto_id`, `revisado_por`
**Relaciones**:
- `archivo_adjunto` → Archivo que justifica el descanso
- `usuario` (empleado_id) → Empleado que solicita el descanso
- `usuario` (revisado_por) → Administrador que revisa la solicitud
- `sucursal` → Sucursal del empleado

### Integración con Sistemas Externos

#### `integracion_erp`
**Descripción**: Registra intentos de sincronización con sistemas ERP externos.
**Campos principales**: `id`, `entidad_tipo`, `entidad_id`, `erp_id`, `fecha_sync`, `estado`, `request_payload`, `response_payload`, `error`
**Enums**:
- `EntidadTipoERP`: PRODUCTO, PEDIDO, FACTURA, CLIENTE, USUARIO, PAGO, GASTO, MOVIMIENTO, ASIENTO
- `EstadoIntegracionERP`: PENDIENTE, PROCESANDO, COMPLETADO, ERROR, CANCELADO

## Campos de Control Comunes

La mayoría de los modelos incluyen los siguientes campos de control estandarizados:

- `creado_en`: Fecha y hora de creación (DateTime con timestamptz)
- `creado_por`: ID del usuario que creó el registro (UUID)
- `modificado_en`: Fecha y hora de última modificación (DateTime con timestamptz)
- `modificado_por`: ID del usuario que modificó el registro (UUID)
- `anulado_en`: Fecha y hora de anulación, si aplica (DateTime con timestamptz)
- `anulado_por`: ID del usuario que anuló el registro (UUID)

Estos campos permiten mantener una auditoría completa de cambios en cada entidad del sistema.