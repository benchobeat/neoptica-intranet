# CRONOGRAMA DETALLADO Y ENTREGABLES – INTRANET NEÓPTICA

> **Estado del Proyecto:** Mayo 2025 - Reestructuración Aprobada  
> **Prioridad Actual:** Desarrollo de módulos base primero, luego los dependientes

## FASE 0: Preparación y Setup
**Duración:** 2 días  
**Estado:** [X] Completado

- [X] Configuración de repositorios, git, CI/CD y entorno de trabajo
- [X] Definición y documentación de la arquitectura base (frontend, backend, base de datos)
- [X] Setup inicial de cloud/hosting, control de backups, correo SMTP de pruebas

**Entregables:**  
- [X] Repositorios inicializados y documentados (`/docs/repos.md`)
- [X] Base de datos y migraciones iniciales corriendo en entorno dev (`/backend/prisma/schema.prisma`)
- [X] Manual técnico de setup actualizado (`/docs/setup.md`)

---

## FASE 1: Modelo de Datos y Backend Base
**Duración:** 4 días  
**Estado:** [X] Completado

- [X] Implementación completa de modelo relacional (PostgreSQL) según schema.prisma
- [X] Configuración de Prisma ORM y migraciones automáticas
- [X] Implementación de endpoints API REST para autenticación y CRUD básicos
- [X] Pruebas unitarias y de integración iniciales

**Entregables:**  
- [X] Base de datos implementada con scripts/migraciones versionadas
- [X] Documentación Swagger/OpenAPI de endpoints implementados
- [X] 100% de pruebas de API básica pasando (usuarios, autenticación)

---

## FASE 2: Módulos Base - Entidades Fundamentales
**Duración:** 6 días  
**Estado:** [X] Completado

- [X] CRUD de Marcas 
  - [X] Controller con validaciones
  - [X] Rutas REST documentadas con Swagger
  - [X] Pruebas unitarias (20+ tests)
  - [X] Soft delete y logs de auditoría

- [X] CRUD de Colores
  - [X] Controller con validaciones
  - [X] Rutas REST documentadas con Swagger
  - [X] Pruebas unitarias (23 tests)
  - [X] Soft delete y logs de auditoría

- [X] CRUD de Sucursales
  - [X] Controller con validaciones para todos los campos
  - [X] Rutas REST documentadas con Swagger
  - [X] Pruebas unitarias (30 tests)
  - [X] Soft delete y logs de auditoría

**Entregables:**  
- [X] Módulos base de entidades fundamentales completados y verificados
- [X] Logs de auditoría implementados para todas las operaciones CRUD
- [X] Documentación de API actualizada
- [X] 73+ pruebas unitarias superadas (193 tests en total según README)

---

## FASE 3: Módulos Base - Productos e Inventario
**Duración:** 8 días  
**Estado:** [X] Parcialmente Completado

- [X] CRUD de Productos
  - [X] Controller con validaciones para todos los campos
  - [X] Integración con Marcas y Colores
  - [X] Campo categoría (texto) implementado
  - [X] Rutas REST documentadas con Swagger
  - [X] Pruebas unitarias completadas
  - [X] Soft delete y logs de auditoría

- [X] CRUD de Inventario
  - [X] Preparación del modelo y validaciones:
    - [X] Agregar campo `stock_resultante` al modelo `movimiento_inventario` para auditoría
    - [X] Definir modelo de inventario (producto_id, sucursal_id, color_id, marca_id, stock, stock_minimo)
    - [X] Definir DTOs para inventario y movimientos
    - [X] Validar existencia de producto, sucursal, color y marca
    - [X] Prevenir duplicados (único por producto/sucursal/color/marca)
    - [X] Validar stock y stock_minimo (no negativos)
  - [X] Endpoints REST:
    - [X] Listar inventario (filtros por sucursal, producto, estado, color, marca)
    - [X] Crear inventario
    - [X] Actualizar inventario
    - [X] Eliminar inventario (soft delete)
    - [X] Obtener inventario por ID
    - [X] Listar alertas de stock bajo/agotado (solo para usuarios autenticados)
  - [X] Movimientos de inventario:
    - [X] Registrar ingresos, salidas, ajustes (motivo, usuario, adjuntos)
    - [X] Implementar manejo de concurrencia con transacciones `Prisma.$transaction` y bloqueo de filas
    - [X] Validar stock no negativo en salidas
    - [X] Registrar histórico con stock_resultante para auditoría
    - [X] Permitir reversa/anulación con motivo obligatorio (solo para rol admin)
    - [X] Transacciones atómicas para actualizar stock y registrar movimiento
  - [X] Manejo de adjuntos (imágenes/PDF, máx. 2MB):
    - [X] Implementar carga de adjuntos en servidor local (preparar para futura integración con Google Drive)
    - [X] Validar tamaño y formato de archivos
    - [X] Registro de operaciones sobre adjuntos (carga, descarga, eliminación)
    - [X] Optimización de middlewares para resolver conflictos entre autenticación y Multer
    - [X] Pruebas exhaustivas de todas las operaciones y permisos
  - [ ] Transferencias entre sucursales:
    - [ ] Solicitud de transferencia (producto, cantidad, sucursal origen/destino, motivo)
    - [ ] Flujo de aprobación/rechazo (solo usuarios admin)
    - [ ] Validaciones de stock en origen/destino
    - [ ] Registro de historial, logs y estados de transferencia
  - [X] Auditoría y logs:
    - [X] Registrar todas las operaciones en log_auditoria (incluye fallidas)
    - [X] Registrar el stock_resultante en cada movimiento para auditoría
    - [X] Registrar descargas/cargas de adjuntos
    - [X] Optimizar logs en entornos de desarrollo y pruebas
  - [X] Documentación Swagger/OpenAPI completa
  - [X] Pruebas unitarias y de integración (mínimo 40 tests, casos positivos/negativos, validaciones, concurrencia)
  - [ ] Verificación de cobertura de pruebas y entregables

- [ ] Transferencias entre Sucursales
  - [ ] Flujo completo: solicitud, aprobación/rechazo, ejecución
  - [ ] Validaciones de stock origen/destino
  - [ ] Histórico y trazabilidad
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 25 tests)
  - [ ] Logs de auditoría para cada etapa

**Entregables:**  
- [X] Módulo de Productos 100% funcional con CRUD y pruebas
- [ ] Módulo de Inventario 100% funcional con gestión de stock
- [ ] Módulo de Transferencias entre sucursales implementado
- [ ] Documentación técnica actualizada con diagramas de flujo
- [ ] Mínimo 95 pruebas unitarias superadas para inventario y transferencias
- [ ] Logs de auditoría validados para todas las operaciones

---

## FASE 4: Módulos Base - Clientes y Usuarios
**Duración:** 5 días  
**Estado:** [ ] Pendiente

- [ ] CRUD de Clientes
  - [ ] Controller con validaciones completas
  - [ ] Historial de compras y preferencias
  - [ ] Gestión de documentos fiscales/identidad
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 25 tests)
  - [ ] Soft delete y logs de auditoría

- [ ] CRUD de Usuarios y Roles
  - [ ] Controller con validaciones de seguridad
  - [ ] Asignación de permisos granulares
  - [ ] Historial de acciones con IP y timestamps
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 25 tests) 
  - [ ] Logs de auditoría detallados

**Entregables:**  
- [ ] Módulo de Clientes 100% funcional con CRUD y pruebas
- [ ] Módulo de Usuarios y Roles 100% funcional
- [ ] Matriz de permisos documentada
- [ ] Documentación de API actualizada
- [ ] Mínimo 50 pruebas unitarias superadas
- [ ] Logs de auditoría validados para todas las operaciones

---

## FASE 5: Módulos Dependientes - Pedidos
**Duración:** 7 días  
**Estado:** [ ] Pendiente - Requiere Fase 3 y 4 completadas

- [ ] CRUD de Pedidos
  - [ ] Controller con validaciones completas
  - [ ] Integración con Productos, Inventario y Clientes
  - [ ] Validación de stock en tiempo real
  - [ ] Estados de pedido y flujo de aprobación
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 35 tests)
  - [ ] Soft delete y logs de auditoría

- [ ] Gestión de Pagos
  - [ ] Controller con validaciones fiscales
  - [ ] Soporte para múltiples métodos de pago
  - [ ] Historial de transacciones y reconciliación
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 20 tests)
  - [ ] Logs de auditoría detallados

**Entregables:**  
- [ ] Módulo de Pedidos 100% funcional con CRUD y pruebas
- [ ] Módulo de Pagos 100% funcional
- [ ] Documentación de API actualizada
- [ ] Diagramas de flujo de estados de pedido
- [ ] Mínimo 55 pruebas unitarias superadas
- [ ] Logs de auditoría validados para todas las operaciones

---

## FASE 6: Módulos Dependientes - Facturación Electrónica
**Duración:** 6 días  
**Estado:** [ ] Pendiente - Requiere Fase 5 completada

- [ ] Generación de Facturas
  - [ ] Controller con validaciones fiscales
  - [ ] Integración con sistema SRI
  - [ ] Generación de XML y PDF conformes
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 30 tests)
  - [ ] Logs de auditoría detallados

- [ ] Gestión de Notas de Crédito/Débito
  - [ ] Controller con validaciones fiscales
  - [ ] Procesos de anulación y reversa
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 20 tests)
  - [ ] Logs de auditoría detallados

**Entregables:**  
- [ ] Módulo de Facturación 100% funcional con pruebas
- [ ] Documentación de API actualizada
- [ ] Guía de integración con SRI
- [ ] Mínimo 50 pruebas unitarias superadas
- [ ] Logs de auditoría validados para todas las operaciones

---

## FASE 7: Agenda, Citas y Gestión Clínica
**Duración:** 6 días  
**Estado:** [ ] Pendiente - Requiere Fase 4 completada

- [ ] CRUD de Citas y Agenda
  - [ ] Controller con validaciones temporales
  - [ ] Gestión de disponibilidad por profesional
  - [ ] Notificaciones y recordatorios
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 25 tests)
  - [ ] Logs de auditoría detallados

- [ ] Historial Clínico
  - [ ] Controller con versionado de datos sensibles
  - [ ] Gestión de diagnósticos y recetas
  - [ ] Carga/descarga de adjuntos clínicos
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 25 tests)
  - [ ] Logs de auditoría con énfasis en privacidad

**Entregables:**  
- [ ] Módulo de Agenda 100% funcional con CRUD y pruebas
- [ ] Módulo de Historial Clínico 100% funcional
- [ ] Documentación de API actualizada
- [ ] Mínimo 50 pruebas unitarias superadas
- [ ] Logs de auditoría validados para todas las operaciones

---

## FASE 8: Contabilidad y Finanzas Integradas
**Duración:** 6 días  
**Estado:** [ ] Pendiente - Requiere Fase 5 y 6 completadas

- [ ] Plan de Cuentas y Asientos Contables
  - [ ] Controller con validaciones contables
  - [ ] Vinculación automática con ventas/compras
  - [ ] Reportes y balances
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 25 tests)
  - [ ] Logs de auditoría detallados

- [ ] Gestión Financiera
  - [ ] Controller para flujo de caja
  - [ ] Conciliación bancaria
  - [ ] Exportación de datos contables
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 20 tests)
  - [ ] Logs de auditoría detallados

**Entregables:**  
- [ ] Módulo Contable 100% funcional con CRUD y pruebas
- [ ] Reportes financieros operativos
- [ ] Documentación de API actualizada
- [ ] Mínimo 45 pruebas unitarias superadas
- [ ] Logs de auditoría validados para todas las operaciones

---

## FASE 9: Logs, Auditoría y Correo Transaccional
**Duración:** 4 días  
**Estado:** [X] Parcialmente Completado

- [X] Sistema de Auditoría
  - [X] Registro detallado de cada operación con usuario, acción, descripción, IP
  - [X] Uso correcto de campos de control temporal en todas las entidades
  - [X] Registro de operaciones fallidas
  - [X] Implementado en todos los controladores CRUD existentes

- [ ] Panel de Administración de Logs
  - [ ] Filtros avanzados y búsqueda
  - [ ] Exportación y visualización de alertas
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 15 tests)

- [ ] Correo Transaccional
  - [ ] Configuración de plantillas
  - [ ] Registro de envíos y errores
  - [ ] Sistema de reintentos
  - [ ] Rutas REST documentadas con Swagger
  - [ ] Pruebas unitarias (mínimo 15 tests)

**Entregables:**  
- [X] Sistema de Auditoría implementado y verificado
- [ ] Panel de Administración de Logs operativo
- [ ] Sistema de Correo Transaccional funcional
- [ ] Documentación de API actualizada
- [ ] Mínimo 30 pruebas unitarias superadas

---

## FASE 10: Seguridad, Backups y Pruebas Finales
**Duración:** 3 días  
**Estado:** [ ] Pendiente - Requiere todas las fases previas

- [ ] Validación de Seguridad
  - [ ] Revisión de roles y permisos en todos los módulos
  - [ ] Pruebas de penetración básicas
  - [ ] Validación de sanitización de inputs
  - [ ] Revisión de logs de seguridad

- [ ] Sistema de Backups
  - [ ] Configuración de backups automáticos
  - [ ] Pruebas de restauración
  - [ ] Documentación de procedimientos

- [ ] Pruebas de Integración Finales
  - [ ] Validación end-to-end de todos los flujos
  - [ ] Pruebas de carga básicas
  - [ ] Validación de todos los reportes

**Entregables:**  
- [ ] Informe de seguridad con vulnerabilidades mitigadas
- [ ] Sistema de backups verificado con restauración exitosa
- [ ] Documentación de procedimientos de recuperación
- [ ] Reporte final de pruebas de integración

---

## FASE 11: UX/UI, Capacitación y Cierre
**Duración:** 3 días  
**Estado:** [ ] Pendiente - Requiere todas las fases previas

- [ ] Revisión Final de Interfaz
  - [ ] Validación en todos los dispositivos
  - [ ] Accesibilidad y experiencia de usuario
  - [ ] Ajustes finales por feedback

- [ ] Documentación y Capacitación
  - [ ] Manuales de usuario por módulo
  - [ ] Videos tutorial de procesos críticos
  - [ ] Sesiones de capacitación

- [ ] Preparación para Producción
  - [ ] Checklist de despliegue
  - [ ] Plan de migración de datos
  - [ ] Estrategia de corte y puesta en marcha

**Entregables:**  
- [ ] Manuales de usuario completos y actualizados
- [ ] Videos de capacitación (si aplica)
- [ ] Checklist de despliegue verificado
- [ ] Informe de cierre de proyecto y lecciones aprendidas

---

**Duración estimada total:**  
**~54 días hábiles** (considerando la reestructuración y nuevas prioridades)

**Notas importantes:**
1. Cada fase debe completarse antes de iniciar la siguiente fase dependiente
2. Los módulos base (Fases 2-4) son prioritarios y deben estar 100% funcionales
3. Las pruebas unitarias son un entregable crítico para cada módulo
4. El sistema de auditoría debe aplicarse consistentemente en todas las operaciones