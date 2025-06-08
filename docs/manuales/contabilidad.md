# MÓDULO DE CONTABILIDAD – INTRANET NEÓPTICA (v2)

## **A. Visión General**

El módulo de contabilidad se encarga de gestionar todos los aspectos financieros y fiscales del sistema, incluyendo facturación electrónica, asientos contables, reportes fiscales e integración con sistemas externos.

## **B. Integración con Módulo de Ventas**

El módulo de contabilidad se integra con el módulo de ventas para:
- Generar facturas electrónicas a partir de pedidos
- Registrar automáticamente asientos contables por cada transacción
- Mantener sincronizados los estados de pago

> **Nota:** Para información sobre el proceso de ventas, consulte el [Módulo de Ventas](../ventas.md)

## **C. Modelos de Datos**

### 1. Factura (`factura`)
Documento legal que registra una transacción de venta.

**Campos principales:**
- **id**: Identificador único (UUID)
- **numero_factura**: Número secuencial de factura
- **fecha_emision**: Fecha de generación
- **fecha_vencimiento**: Fecha de vencimiento del pago
- **subtotal**: Monto antes de impuestos
- **impuestos**: Total de impuestos
- **descuento**: Descuentos aplicados
- **total**: Monto total a pagar
- **estado**: Estado de la factura (pendiente, pagada, anulada, etc.)
- **metodo_pago**: Forma de pago (efectivo, tarjeta, transferencia)
- **clave_acceso**: Clave de acceso para facturación electrónica
- **estado_sri**: Estado en el SRI (recibida, autorizada, rechazada)
- **mensaje_sri**: Mensaje de respuesta del SRI
- **pedido_id**: Referencia al pedido que originó la factura
- **usuario_id**: Cliente al que se factura
- **sucursal_id**: Sucursal que emite la factura

### 2. Pago (`pago`)
Registro de pagos realizados.

**Campos principales:**
- **id**: Identificador único (UUID)
- **monto**: Monto del pago
- **fecha_pago**: Fecha y hora del pago
- **metodo_pago**: Forma de pago utilizada
- **referencia**: Número de referencia/transacción
- **estado**: Estado del pago (pendiente, completado, fallido, reversado)
- **factura_id**: Factura asociada
- **usuario_id**: Usuario que registró el pago
- **sucursal_id**: Sucursal donde se realizó el pago
- **comprobante_url**: URL del comprobante de pago (si aplica)

### 3. Integración con ERP (`integracion_erp`)
Modelo que registra la sincronización de entidades entre el sistema y el ERP contable.

**Campos:**
- **id**: Identificador único (UUID)
- **entidad_tipo**: Tipo de entidad sincronizada (FACTURA, PAGO, ASIENTO, etc.)
- **entidad_id**: ID de la entidad en el sistema local (UUID)
- **erp_id**: ID de la entidad en el sistema ERP
- **erp_tipo**: Tipo de entidad en el ERP
- **fecha_sync**: Fecha de la última sincronización
- **estado**: Estado de la integración (PENDIENTE, PROCESANDO, EXITOSO, FALLIDO, REVERSADO)
- **request_payload**: Datos enviados al ERP (JSON)
- **response_payload**: Respuesta del ERP (JSON)
- **error**: Mensaje de error en caso de fallo
- **intentos**: Número de intentos de sincronización
- **ultimo_intento**: Fecha del último intento
- **creado_en**: Fecha de creación del registro
- **creado_por**: ID del usuario que creó el registro
- **modificado_en**: Fecha de última modificación
- **modificado_por**: ID del usuario que modificó por última vez
- **anulado_en**: Fecha de anulación (soft delete)
- **anulado_por**: ID del usuario que anuló el registro

**Índices:**
- Índice para búsquedas: (estado, entidad_tipo, entidad_id)

### Flujo de Integración

1. **Sincronización de Datos**
   - Integración directa con SRI para validación, emisión y anulación de facturas.
   - Almacenamiento seguro de XML y PDF, disponibles para consulta y descarga desde la ficha de pedido/factura.
   - Estado de sincronización/exportación ERP/SRI siempre visible, con logs de reintentos y errores.
   - El sistema alerta a usuarios/admins si hay fallas, rechazos o pendientes en el proceso fiscal.

2. **Proceso de Sincronización**
   - Se crea un registro en `integracion_erp` con estado PENDIENTE
   - El sistema intenta enviar los datos al ERP
   - En caso de éxito, se actualiza el estado a EXITOSO y se guarda la respuesta
   - En caso de error, se actualiza el estado a FALLIDO y se registra el error
   - Se pueden configurar reintentos automáticos para operaciones fallidas

3. **Monitoreo y Control**
   - Panel de control con estado de las sincronizaciones
   - Alertas para operaciones fallidas
   - Historial completo de intentos y respuestas
   - Posibilidad de reintentar operaciones fallidas manualmente

## **C. Contabilidad Interna y Movimientos**

- Plan de cuentas contables jerárquico, alineado a normativas fiscales y listo para integración con ERP externo.
- Cada venta/pedido/factura genera automáticamente movimiento(s) contable(s), asociados al pedido, cliente y cuenta correspondiente.
- Registro de movimientos por tipo: ingreso, egreso, gasto, reversa, ajuste, transferencia.
- Visualización de estado: vigente, reversado, exportado, pendiente, anulado.
- Logs detallados por cada movimiento, reversa, exportación, anulación, con motivo y usuario responsable.

- Panel de conciliación contable:
    - Visualiza operaciones exportadas/pedientes/exportadas a ERP.
    - Permite acciones manuales en caso de error o desajuste (con log de responsable y motivo).
    - Exportación de reportes contables para administración y auditoría.

## **D. Reporting y Multimoneda**

- Visualización de ventas, facturación y movimientos por moneda, sucursal, usuario, periodo, estado.
- Paneles de KPIs: ventas mensuales, facturación por canal, total recaudado, facturas anuladas, movimientos contables por tipo, discrepancias.
- Exportación de reportes en formato Excel/CSV para gestión, conciliación y soporte fiscal.

## **D. Procesos Contables**

### 1. Generación de Facturas Electrónicas
1. El sistema recibe una solicitud de facturación desde el módulo de ventas
2. Valida los datos del pedido y la información fiscal del cliente
3. Genera la factura electrónica según normativa del SRI
4. Envía la factura al SRI para su autorización
5. Actualiza el estado de la factura según la respuesta del SRI
6. Registra el asiento contable correspondiente
7. Notifica al cliente vía correo electrónico (opcional)

### 2. Conciliación Bancaria
1. Importación automática de extractos bancarios
2. Conciliación automática de pagos
3. Generación de reportes de conciliación
4. Registro de diferencias y ajustes

### 3. Cierre Contable
1. Cálculo de impuestos
2. Ajustes por inflación (si aplica)
3. Generación de asientos de cierre
4. Bloqueo de períodos contables
5. Generación de balances y estados financieros

## **E. Reportes**

### 1. Reportes Fiscales
- Libro de ventas
- Libro de compras
- Retenciones en la fuente
- Impuesto al valor agregado (IVA)
- Impuesto a la renta

### 2. Reportes Gerenciales
- Estado de resultados
- Balance general
- Flujo de efectivo
- Análisis de cuentas por cobrar/pagar
- Envejecimiento de cartera

### 3. Reportes de Auditoría
- Movimientos por cuenta contable
- Transacciones por usuario
- Historial de cambios en asientos
- Bitácora de eventos del sistema

## **F. Seguridad y Auditoría**

- Registro detallado de todas las operaciones contables
- Control de acceso basado en roles
- Firmas electrónicas para aprobaciones
- Bloqueo de períodos contables
- Pistas de auditoría completas

## **G. Integraciones**

### 1. Módulo de Ventas
- Generación de facturas desde pedidos
- Sincronización de estados de pago
- Reportes de ingresos

### 2. Sistema Bancario
- Conciliación automática
- Registro de transacciones
- Reportes de flujo de efectivo

### 3. Proveedores Externos
- Facturación electrónica
- Retenciones
- Comprobantes de retención

## **H. Mantenimiento**

### 1. Configuración
- Parámetros contables
- Cuentas contables predeterminadas
- Impuestos y tasas
- Secuenciales de documentos

### 2. Respaldo y Restauración
- Copias de seguridad programadas
- Exportación de datos
- Migración entre ambientes
- Acceso y exportación de logs solo para roles autorizados.

## **F. Ejemplo de Wireframe Textual: Ficha de Pedido y Factura**
| PEDIDO #000412 – Cliente: Juan Pérez (C.I. 1234567890) 				|
| Fecha: 13/07/2024 Sucursal: Centro Vendedor: D. Torres 				|

Estado: Pagado Moneda: USD Total: $224
Productos:
Lente X (2) – $80 Lente Y (1) – $64
---------------------------------------------------------------------
Factura Electrónica: 002-000000124 Estado: Emitida (SRI)
[Descargar PDF]	[Descargar XML]	[Enviar por Correo]	[Imprimir]
Estado de envío: Entregada al cliente
---------------------------------------------------------------------
Logs y Ciclo de Vida:
13/07 12:04 Creado por vdr1
13/07 12:06 Factura emitida SRI
13/07 12:07 Factura enviada por correo
13/07 13:00 Pedido pagado, conciliado
---------------------------------------------------------------------
Movimientos Contables Asociados:
13/07 12:07 Ingreso por venta $224 Cuenta: Ventas Local
---------------------------------------------------------------------
[Anular]	[Reversar]	[Exportar]	[Ver Historial]	[Volver]

---

## **Notas clave:**
- El flujo está 100% alineado con inventario, facturación, contabilidad y cumplimiento SRI.
- Todo el ciclo es auditable, seguro y preparado para ERP e integración multicanal.
- Los flujos privilegian la rapidez, la trazabilidad y la seguridad en cada etapa.

## **Módulo de Contabilidad - Intranet Neóptica**

### Tabla de Contenidos
1. [Introducción](#introducción)
2. [Endpoints del Módulo Contable](#endpoints-del-módulo-contable)
   - [2.1 Plan de Cuentas](#21-plan-de-cuentas)
   - [2.2 Asientos Contables](#22-asientos-contables)
   - [2.3 Conciliación Bancaria](#23-conciliación-bancaria)
   - [2.4 Reportes Contables](#24-reportes-contables)
   - [2.5 Integración con Otros Módulos](#25-integración-con-otros-módulos)
   - [2.6 Auditoría y Seguridad](#26-auditoría-y-seguridad)
   - [2.7 Configuración](#27-configuración)
3. [Funciones Internas del Módulo Contable](#funciones-internas-del-módulo-contable)
   - [3.1 Gestión de Cuentas Contables](#31-gestión-de-cuentas-contables)
   - [3.2 Procesamiento de Asientos Contables](#32-procesamiento-de-asientos-contables)
   - [3.3 Mecanismos de Validación](#33-mecanismos-de-validación)
   - [3.4 Procesos Automatizados](#34-procesos-automatizados)
   - [3.5 Generación de Reportes](#35-generación-de-reportes)
   - [3.6 Integración con Otros Módulos](#36-integración-con-otros-módulos)
4. [Flujos de Trabajo Principales](#flujos-de-trabajo-principales)
5. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
6. [Manejo de Errores](#manejo-de-errores)

### Introducción

Este documento detalla la implementación del módulo contable para la Intranet Neóptica, diseñado para manejar todas las operaciones financieras de la óptica, incluyendo facturación, pagos, gastos y reportes contables.

### Endpoints del Módulo Contable

#### 2.1 Plan de Cuentas

#### GET /api/contabilidad/cuentas
- **Descripción**: Obtener el catálogo de cuentas contables
- **Autenticación**: Requerida (Rol: Contador, Administrador)
- **Parámetros**:
  ```json
  {
    "nivel": "number",  // Nivel jerárquico (1-5)
    "tipo": "string",   // activo, pasivo, patrimonio, ingreso, gasto
    "activo": "boolean" // true/false
  }
  ```
- **Respuesta**: Lista jerárquica de cuentas contables

#### POST /api/contabilidad/cuentas
- **Descripción**: Crear nueva cuenta contable
- **Cuerpo**:
  ```json
  {
    "codigo": "110101",
    "nombre": "Caja General",
    "tipo": "activo",
    "descripcion": "Cuenta de caja principal",
    "cuenta_padre_id": "uuid-de-cuenta-padre",
    "activo": true
  }
  ```

#### PUT /api/contabilidad/cuentas/:id
- **Descripción**: Actualizar cuenta existente

#### DELETE /api/contabilidad/cuentas/:id
- **Descripción**: Desactivar cuenta (soft delete)

#### 2.2 Asientos Contables

#### POST /api/contabilidad/asientos
- **Descripción**: Registrar nuevo asiento contable
- **Cuerpo**:
  ```json
  {
    "fecha": "2024-06-06T10:00:00Z",
    "descripcion": "Venta al contado - Factura #001-001-000123",
    "tipo": "factura_venta",
    "sucursal_id": "uuid-sucursal",
    "movimientos": [
      {
        "tipo": "debe",
        "monto": 120.00,
        "cuenta_id": "uuid-cuenta-ventas",
        "descripcion": "Venta de lentes"
      },
      {
        "tipo": "haber",
        "monto": 120.00,
        "cuenta_id": "uuid-cuenta-caja",
        "descripcion": "Pago en efectivo"
      }
    ]
  }
  ```

#### GET /api/contabilidad/asientos/:id
- **Descripción**: Obtener detalle de asiento

#### PUT /api/contabilidad/asientos/:id/validar
- **Descripción**: Validar asiento contable

#### POST /api/contabilidad/asientos/:id/reversar
- **Descripción**: Reversar asiento contable
- **Cuerpo**:
  ```json
  {
    "motivo": "Error en el monto",
    "fecha_reverso": "2024-06-06T14:00:00Z"
  }
  ```

#### 2.3 Conciliación de Movimientos

**Nota importante**: Actualmente el sistema no tiene un módulo de conciliación bancaria completo. La funcionalidad básica descrita a continuación permite registrar conciliaciones manuales, pero está planificada una versión más completa que incluirá importación de extractos y conciliación automática.

#### POST /api/contabilidad/conciliacion
- **Descripción**: Registrar conciliación manual de movimientos contables
- **Autenticación**: Requerida (Rol: Administrador)
- **Cuerpo**:
  ```json
  {
    "fecha_proceso": "2024-06-30T23:59:59-05:00",
    "sucursal_id": "uuid-sucursal",
    "descripcion": "Conciliación junio 2024",
    "movimientos": [
      {
        "fecha": "2024-06-15",
        "descripcion": "Depósito en efectivo",
        "monto": 1000.00,
        "tipo": "ingreso",
        "referencia": "TRF-123456",
        "asiento_contable_id": "uuid-asiento",
        "conciliado": true,
        "observaciones": "Conciliado con extracto bancario"
      }
    ]
  }
  ```
- **Respuesta**:
  ```json
  {
    "id": "uuid-conciliacion",
    "fecha_proceso": "2024-06-30T23:59:59-05:00",
    "sucursal_id": "uuid-sucursal",
    "usuario_id": "uuid-usuario",
    "total_movimientos": 1,
    "total_conciliado": 1000.00,
    "estado": "procesado",
    "creado_en": "2024-06-30T15:30:45-05:00"
  }
  ```

### Planes Futuros: Módulo de Conciliación Bancaria (v2.0)

Estamos trabajando en un módulo completo de conciliación bancaria que incluirá:

#### Características Principales
- **Importación de Extractos**
  - Soporte para formatos comunes (OFX, QIF, CSV)
  - Mapeo personalizable de campos
  - Validación automática de formato

#### Conciliación Avanzada
  - Asignación automática de transacciones
  - Sugerencias inteligentes basadas en historial
  - Reglas personalizables para coincidencias

#### Reportes y Seguimiento
  - Estado de conciliación en tiempo real
  - Diferencias y desajustes
  - Historial de conciliaciones

#### Integración con Contabilidad
  - Generación automática de asientos de ajuste
  - Conciliación por cuenta contable
  - Validación de saldos

#### Seguridad y Auditoría
  - Control de acceso por roles
  - Bitácora de cambios
  - Firmado electrónico de conciliaciones

Este módulo estará disponible en una próxima actualización mayor del sistema.

#### 2.4 Reportes Contables

#### GET /api/contabilidad/reportes/libro-mayor
- **Autenticación**: Requerida (Rol: Administrador)
- **Parámetros**:
  - `fecha_desde`: Fecha inicio (requerido, formato YYYY-MM-DD)
  - `fecha_hasta`: Fecha fin (requerido, formato YYYY-MM-DD)
  - `sucursal_id`: Filtrar por sucursal (opcional)
  - `cuenta_id`: ID de cuenta específica (opcional)
  - `nivel`: Nivel de detalle (1-5, opcional)
  - `estado`: Estado del asiento (borrador/validado/anulado, opcional)
- **Respuesta**:
  ```json
  {
    "sucursal_id": "uuid-sucursal",
    "fecha_desde": "2024-06-01",
    "fecha_hasta": "2024-06-30",
    "total_debe": 15000.00,
    "total_haber": 15000.00,
    "movimientos": [
      {
        "fecha": "2024-06-15",
        "cuenta_codigo": "1101",
        "cuenta_nombre": "Caja General",
        "debe": 1000.00,
        "haber": 0.00,
        "saldo": 1000.00,
        "referencia": "AS-001-000123"
      }
    ]
  }
  ```

#### GET /api/contabilidad/reportes/balance-comprobacion
- **Autenticación**: Requerida (Rol: Administrador)
- **Parámetros**:
  - `fecha_corte`: Fecha de corte (requerido, formato YYYY-MM-DD)
  - `sucursal_id`: Filtrar por sucursal (opcional)
  - `nivel`: Nivel de detalle (1-5, opcional)
- **Respuesta**:
  ```json
  {
    "fecha_corte": "2024-06-30",
    "sucursal_id": "uuid-sucursal",
    "cuentas": [
      {
        "codigo": "1",
        "nombre": "ACTIVO",
        "saldo_deudor": 50000.00,
        "saldo_acreedor": 0.00
      }
    ],
    "total_debe": 50000.00,
    "total_haber": 50000.00
  }
  ```

#### GET /api/contabilidad/reportes/estado-resultados
- **Autenticación**: Requerida (Rol: Administrador)
- **Parámetros**:
  - `fecha_desde`: Fecha inicio (requerido)
  - `fecha_hasta`: Fecha fin (requerido)
  - `sucursal_id`: Filtrar por sucursal (opcional)
- **Respuesta**:
  ```json
  {
    "periodo": {
      "desde": "2024-01-01",
      "hasta": "2024-06-30"
    },
    "ingresos": 150000.00,
    "costos": 70000.00,
    "gastos_operativos": 30000.00,
    "utilidad_operativa": 50000.00,
    "otros_ingresos": 2000.00,
    "otros_gastos": 1000.00,
    "utilidad_neta": 51000.00
  }
  ```

### 2.5 Estados de Asientos Contables

Los asientos contables pueden tener los siguientes estados:

| Estado     | Descripción                                      | Acciones permitidas                     |
|------------|--------------------------------------------------|----------------------------------------|
| `borrador` | En edición, aún no contabilizado                | editar, validar, eliminar              |
| `validado` | Contabilizado y aprobado                         | ver, exportar, reversar                |
| `anulado`  | Anulado con justificación (no se puede modificar)| ver                                     |


Para cambiar el estado de un asiento:

#### PUT /api/contabilidad/asientos/:id/validar
- **Descripción**: Cambiar estado a validado
- **Roles**: Administrador
- **Cuerpo**:
  ```json
  {
    "comentario": "Asiento verificado y aprobado"
  }
  ```

#### POST /api/contabilidad/asientos/:id/anular
- **Descripción**: Anular asiento contable
- **Roles**: Administrador
- **Cuerpo**:
  ```json
  {
    "motivo": "Error en el monto registrado",
    "fecha_anulacion": "2024-06-07T10:00:00Z"
  }
  ```

#### POST /api/contabilidad/asientos/:id/reversar
- **Descripción**: Reversar asiento contable (crea asiento de contrapartida)
- **Roles**: Administrador
- **Cuerpo**:
  ```json
  {
    "fecha_reverso": "2024-06-07T10:00:00Z",
    "comentario": "Reversión de asiento con error",
    "crear_contrapartida": true
  }
  ```

### 2.6 Integración con Otros Módulos

#### Facturación

#### POST /api/facturacion/emitir
- **Descripción**: Emitir factura y registrar asiento contable automáticamente
- **Roles**: Vendedor, Administrador
- **Cuerpo**:
  ```json
  {
    "pedido_id": "uuid-pedido",
    "fecha_emision": "2024-06-06T10:00:00-05:00",
    "metodo_pago": "efectivo",
    "detalles": [
      {
        "producto_id": "uuid-producto",
        "cantidad": 1,
        "precio_unitario": 100.00,
        "impuesto_porcentaje": 12.00
      }
    ],
    "generar_asiento": true,
    "fecha_contable": "2024-06-06"
  }
  ```
- **Respuesta**:
  ```json
  {
    "factura": {
      "id": "uuid-factura",
      "numero": "001-001-000123",
      "estado": "pagada",
      "total": 112.00
    },
    "asiento_contable": {
      "id": "uuid-asiento",
      "numero": "AS-2024-000123",
      "fecha": "2024-06-06T10:00:00-05:00",
      "descripcion": "Factura de venta 001-001-000123"
    }
  }
  ```

#### Gastos

#### POST /api/gastos/registrar
- **Descripción**: Registrar gasto y su asiento contable
- **Roles**: Administrador, Contador
- **Cuerpo**:
  ```json
  {
    "fecha": "2024-06-06",
    "proveedor": "Proveedor Ejemplo",
    "descripcion": "Material de oficina",
    "monto": 250.00,
    "impuesto": 30.00,
    "total": 280.00,
    "metodo_pago": "transferencia",
    "cuenta_contable_id": "uuid-cuenta-gastos",
    "sucursal_id": "uuid-sucursal",
    "adjuntos": ["uuid-archivo1", "uuid-archivo2"]
  }
  ```

### 2.7 Auditoría y Seguridad

#### GET /api/auditoria/contabilidad
- **Descripción**: Consultar registros de auditoría contable
- **Roles**: Administrador
- **Parámetros**:
  - `fecha_desde`: Fecha inicio (formato YYYY-MM-DD)
  - `fecha_hasta`: Fecha fin (formato YYYY-MM-DD)
  - `usuario_id`: Filtrar por usuario
  - `tipo_entidad`: Tipo de entidad (asiento, factura, pago, gasto)
  - `entidad_id`: ID de entidad específica
  - `accion`: Tipo de acción (crear, actualizar, eliminar, validar, anular)
  - `sucursal_id`: Filtrar por sucursal
- **Respuesta**:
  ```json
  {
    "total": 1,
    "registros": [
      {
        "fecha": "2024-06-06T14:30:00-05:00",
        "usuario": "usuario@ejemplo.com",
        "accion": "crear",
        "entidad": "asiento_contable",
        "entidad_id": "uuid-asiento",
        "detalles": {
          "numero": "AS-2024-000123",
          "descripcion": "Factura de venta 001-001-000123",
          "monto_total": 112.00
        },
        "ip": "192.168.1.100",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    ]
  }
  ```

### 2.8 Configuración del Módulo Contable

#### GET /api/contabilidad/configuracion
- **Descripción**: Obtener configuración del módulo contable
- **Roles**: Administrador
- **Respuesta**:
  ```json
  {
    "moneda_principal": "USD",
    "decimales": 2,
    "formato_fecha": "YYYY-MM-DD",
    "formato_numero_factura": "###-###-######",
    "formato_numero_asiento": "AS-YYYY-######",
    "cuentas_por_defecto": {
      "ventas": "uuid-cuenta-ventas",
      "compras": "uuid-cuenta-compras",
      "caja": "uuid-cuenta-caja",
      "banco": "uuid-cuenta-banco",
      "iva_por_pagar": "uuid-cuenta-iva-por-pagar",
      "iva_por_cobrar": "uuid-cuenta-iva-por-cobrar"
    },
    "impuestos": [
      {
        "codigo": "IVA",
        "nombre": "IVA 12%",
        "porcentaje": 12.00,
        "cuenta_contable_id": "uuid-cuenta-iva"
      }
    ]
  }
  ```

#### PUT /api/contabilidad/configuracion
- **Descripción**: Actualizar configuración del módulo contable
- **Roles**: Administrador
- **Cuerpo**:
  ```json
  {
    "moneda_principal": "USD",
    "decimales": 2,
    "formato_fecha": "YYYY-MM-DD",
    "formato_numero_factura": "###-###-######",
    "formato_numero_asiento": "AS-YYYY-######",
    "cuentas_por_defecto": {
      "ventas": "uuid-cuenta-ventas",
      "compras": "uuid-cuenta-compras",
      "caja": "uuid-cuenta-caja",
      "banco": "uuid-cuenta-banco"
    },
    "impuestos": [
      {
        "codigo": "IVA",
        "nombre": "IVA 12%",
        "porcentaje": 12.00,
        "cuenta_contable_id": "uuid-cuenta-iva"
      }
    ]
  }
  ```

### Funciones Internas del Módulo Contable

#### 3.1 Gestión de Cuentas Contables

#### `validarEstructuraJerarquica(cuenta, cuentaPadre)`
- Valida que la estructura jerárquica de cuentas sea correcta
- Evita referencias circulares
- Asegura la consistencia de los códigos de cuenta

#### `generarCodigoCuenta(nivel, cuentaPadreId)`
- Genera automáticamente códigos de cuenta según la jerarquía
- Mantiene la consistencia numérica

#### 3.2 Procesamiento de Asientos Contables

#### `validarAsientoContable(asiento)`
- Verifica que el asiento esté balanceado (suma de débitos = suma de créditos)
- Valida que las cuentas existan y estén activas
- Comprueba restricciones de negocio

#### `procesarAsientoContable(asiento)`
- Ejecuta la transacción en la base de datos
- Actualiza saldos de cuentas
- Genera movimientos contables
- Registra en el libro diario

#### 3.3 Mecanismos de Validación

#### `validarPeriodoContable(fecha)`
- Verifica que la fecha esté dentro de un período contable abierto
- Impide modificaciones en períodos cerrados

#### `validarCuentaParaTipoMovimiento(cuentaId, tipoMovimiento)`
- Asegura que la cuenta sea compatible con el tipo de movimiento
- Ej: No permite débitos en cuentas de pasivo

#### 3.4 Procesos Automatizados

#### `cierreMensual()`
- Cierra el período contable mensual
- Genera asientos de ajuste
- Calcula y registra depreciaciones
- Cierra cuentas de resultados

#### `conciliacionAutomatica()`
- Compara movimientos bancarios con registros contables
- Sugiere conciliaciones
- Genera reportes de diferencias

#### 3.5 Generación de Reportes

#### `generarLibroDiario(fechaInicio, fechaFin)`
- Genera el libro diario en formato PDF/Excel
- Incluye filtros por cuenta, sucursal, usuario

#### `generarBalanceComprobacion(fechaCorte)`
- Genera el balance de comprobación
- Incluye columnas de movimiento débito/crédito
- Muestra saldos iniciales y finales

#### 3.6 Integración con Otros Módulos

#### `registrarTransaccionVenta(venta)`
- Se dispara automáticamente al confirmar una venta
- Genera el asiento contable correspondiente
- Actualiza inventario y cuentas por cobrar

#### `procesarPago(pago)`
- Registra el pago
- Afecta las cuentas de caja/bancos
- Actualiza el estado de la factura

### Flujos de Trabajo Principales

1. **Proceso de Cierre Contable**
   - Validación de saldos
   - Conciliación de cuentas
   - Generación de asientos de ajuste
   - Cierre de período

2. **Flujo de Facturación**
   - Creación de factura
   - Generación de asiento contable
   - Actualización de inventario
   - Registro de impuestos

3. **Proceso de Conciliación**
   - Importación de extractos bancarios
   - Conciliación automática
   - Validación de diferencias
   - Generación de ajustes

### Consideraciones de Seguridad

1. **Control de Acceso**
   - Autenticación requerida para todos los endpoints
   - Autorización basada en roles
   - Registro detallado de accesos

2. **Protección de Datos**
   - Encriptación de datos sensibles
   - Mascarado de información confidencial
   - Copias de seguridad automáticas

### Modelos de Base de Datos de Contabilidad

### 1. `cuenta_contable`
- **Propósito**: Almacena el plan de cuentas contables jerárquico
- **Campos clave**:
  - `codigo`: Código único de la cuenta (ej: "1101", "2101")
  - `nombre`: Nombre descriptivo de la cuenta
  - `tipo`: Tipo de cuenta (activo, pasivo, patrimonio, etc.)
  - `cuenta_padre_id`: Referencia a cuenta padre para jerarquía
  - `activo`: Estado de la cuenta
  - `erp_id`, `erp_tipo`, `erp_codigo`: Para integración con sistemas externos

### 2. `asiento_contable`
- **Propósito**: Registra los asientos contables
- **Campos clave**:
  - `fecha`: Fecha del asiento
  - `descripcion`: Descripción detallada
  - `referencia_externa`: Referencia externa (ej: número de factura)
  - `tipo`: Tipo de asiento (factura, pago, gasto, ajuste, etc.)
  - `entidad_tipo`/`entidad_id`: Relación con la entidad que generó el asiento
  - `estado`: Estado del asiento (borrador, validado, anulado)
  - `sucursal_id`: Sucursal asociada
  - `usuario_id`: Usuario que creó el asiento

### 3. `movimiento_contable`
- **Propósito**: Registra los movimientos individuales que componen un asiento
- **Campos clave**:
  - `asiento_contable_id`: Asiento al que pertenece
  - `cuenta_contable_id`: Cuenta afectada
  - `debe`/`haber`: Montos en débito y crédito
  - `descripcion`: Descripción del movimiento
  - `referencia`: Referencia opcional

### 4. `movimiento_contable_entidad`
- **Propósito**: Relaciona movimientos contables con entidades específicas
- **Campos clave**:
  - `movimiento_contable_id`: Movimiento relacionado
  - `entidad_tipo`/`entidad_id`: Entidad relacionada (factura, pago, etc.)
  - `tipo_relacion`: Tipo de relación

### Modelos Relacionados

#### `factura`
- Registra facturas de venta
- Se relaciona con `asiento_contable` a través de `asiento_contable_id`
- Incluye campos para documentos electrónicos (XML/PDF)

#### `gasto`
- Registra gastos de la empresa
- Incluye `asiento_contable_id` para integración contable
- Campos para categorización y seguimiento

#### `pago`
- Registra pagos recibidos
- Incluye `asiento_contable_id` para integración contable
- Relacionado con facturas y clientes

### Consideraciones de Implementación

1. **Integridad Referencial**:
   - Las relaciones están configuradas con acciones `onDelete: NoAction` para prevenir eliminaciones accidentales
   - Se utiliza `soft delete` (anulación lógica) en lugar de eliminación física

2. **Auditoría**:
   - Todos los modelos incluyen campos de control (`creado_por`, `modificado_por`, `anulado_por`)
   - Se registran fechas de creación, modificación y anulación

3. **Rendimiento**:
   - Los índices están configurados para consultas frecuentes
   - Se utilizan claves foráneas para mantener la integridad de datos

## Manejo de Errores

1. **Validación de Datos**
   - Validación de formato
   - Validación de negocio
   - Mensajes de error descriptivos

2. **Transacciones**
   - Atomicidad en operaciones
   - Reversión en caso de error
   - Registro de intentos fallidos

3. **Notificaciones**
   - Alertas por correo electrónico
   - Registro en sistema de monitoreo
   - Notificaciones en tiempo real