# CRONOGRAMA DETALLADO Y ENTREGABLES – INTRANET NEÓPTICA

## FASE 0. Preparación y Setup (2 días)
- Configuración de repositorios, git, CI/CD y entorno de trabajo.
- Definición y documentación de la arquitectura base (frontend, backend, base de datos).
- Setup inicial de cloud/hosting, control de backups, correo SMTP de pruebas.

**Entregables:**  
- Repositorios inicializados y documentados.  
- Base de datos y migraciones vacías corriendo en entorno dev.  
- Manual técnico de setup actualizado.  

---

## FASE 1. Modelo de Datos y Backend Base (4 días)
- Implementación completa de modelo relacional (PostgreSQL) según backend/prisma/schema.prisma
- Configuración de Prisma ORM y migraciones automáticas.
- Implementación de endpoints API REST para autenticación, CRUD de usuarios, roles, sucursales y entidades principales (productos, clientes, movimientos).
- Pruebas unitarias y de integración iniciales.

**Entregables:**  
- Base de datos implementada, scripts/migraciones versionadas.  
- Documentación Swagger/OpenAPI de endpoints implementados.  
- Suite básica de pruebas de API (usuarios, productos, autenticación).  

---

## FASE 2. Frontend y Autenticación (4 días)
- Estructura base del frontend (Next.js, Ant Design/Material UI), diseño global y layout responsivo.
- Implementación de login, registro, recuperación y gestión de sesión JWT.
- Gestión de usuarios, asignación de roles y cambio de estado.
- Primeras pantallas de dashboard, menú lateral y navegación.

**Entregables:**  
- Prototipo navegable de login, dashboard y administración de usuarios.  
- Manual de uso inicial para admin.  
- Pruebas de login/logout y control de roles.

---

## FASE 3. Inventario y Gestión Multisucursal (6 días)
- CRUD de productos, stock, ingresos/salidas, ajustes y movimientos con logs.
- Implementación de transferencias entre sucursales, flujos de aprobación/rechazo y reversa.
- Paneles de inventario por sucursal, alertas de stock bajo, reporting y exportación.
- Carga/descarga de adjuntos en movimientos.

**Entregables:**  
- Módulo completo de inventario funcionando con pruebas.  
- Reporte de inventario y movimientos exportable.  
- Manual visual de uso del inventario.  
- Bitácora de logs generados y revisados.

---

## FASE 4. Agenda, Citas y Gestión Clínica (6 días)
- Módulo de agenda (optometrista y administración): citas, turnos, descansos, aprobaciones y bloqueos.
- Panel de historial clínico modular: registro, versión, modificación y anulación de diagnósticos/recetas.
- Carga y gestión de adjuntos clínicos (PDF, imágenes, justificativos).
- Logs de edición, descarga y consulta.

**Entregables:**  
- Módulo de agenda, turnos y clínica con historial versionado.  
- Reporte de citas, descansos y diagnósticos exportable.  
- Bitácora de logs clínicos revisada.  
- Manual visual de uso clínico.

---

## FASE 5. Ventas, Pedidos y Facturación Electrónica (8 días)
- Módulo de ventas y punto de venta (POS): registro de venta, cliente, selección de productos y descuentos.
- Validación y actualización automática de inventario.
- Integración completa de facturación electrónica SRI (generación, estado, descarga, envío).
- Panel de pedidos y facturas: exportación, anulación, reversa y logs asociados.
- Envío de factura por correo, registro y visualización de logs de envío.
- Reporting y KPI de ventas/facturación.

**Entregables:**  
- Módulo de ventas y facturación 100% operativo, probado en escenarios reales.  
- Reporte de facturación y ventas por periodo exportable.  
- Logs de ventas, errores SRI y correos validados.  
- Manual visual de uso de ventas/facturación.

---

## FASE 6. Contabilidad y Finanzas Integradas (6 días)
- Implementación de plan de cuentas, registro de movimientos contables y vinculación polimórfica.
- Flujos de reversa/anulación, exportación y conciliación contable.
- Integración (mock) de exportación ERP.
- Paneles de reporte y exportación contable.

**Entregables:**  
- Módulo de contabilidad funcionando con casos de prueba.  
- Reporte contable/financiero exportable.  
- Logs contables y de conciliación revisados.  
- Manual visual de uso contable.

---

## FASE 7. Correo Transaccional, Logs y Auditoría (4 días)
- Configuración y panel de administración de correo SMTP/API.
- Registro de todos los envíos, errores, reintentos y logs asociados.
- Panel global de logs, filtros avanzados, exportación y visualización de alertas/errores.
- Seguridad, protección de datos y revisión de logs de acceso/ciclo de vida.

**Entregables:**  
- Panel de administración de correo operativo y validado.  
- Reporte de envíos, errores y reintentos exportable.  
- Logs de acceso, auditoría y actividad revisados.  
- Manual visual de administración de correo y logs.

---

## FASE 8. Seguridad, Backups y Pruebas Finales (3 días)
- Validación de roles y permisos en todos los módulos.
- Pruebas de logs, bloqueos de ciclo de vida, backups automáticos y restauración.
- Auditoría de seguridad (intentos de acceso, errores forzados, simulación de fallos).
- Documentación de procedimientos de recuperación.

**Entregables:**  
- Validación de backups y restauración.  
- Informe de pruebas de seguridad y logs.  
- Manual de seguridad y recuperación.

---

## FASE 9. UX/UI, Capacitación y Cierre (3 días)
- Revisión de interfaz en todos los dispositivos, accesibilidad, textos y flujos.
- Ajustes finales por feedback.
- Generación de manuales visuales para cada módulo y capacitaciones (grabadas o en vivo).
- Preparación de checklist de despliegue y corte.

**Entregables:**  
- Manuales de usuario y video-capacitación (si aplica).  
- Checklist de despliegue y go-live.  
- Informe de cierre y lecciones aprendidas.

---

**Duración estimada total:**  
**~42 días hábiles** (flexible según disponibilidad y pruebas).  
**Todas las fases entregan módulos funcionales, probados y documentados antes de iniciar la siguiente.**