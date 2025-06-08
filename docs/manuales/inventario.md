# Gestión de Inventario - Intranet Neóptica

> **Estado de implementación (30/05/2025):** CRUD de inventario completamente implementado, incluyendo movimientos, validaciones de stock y registro de auditoría. La API de adjuntos de inventario ha sido implementada y testeada. Las transferencias entre sucursales están pendientes.

## Modelos de Datos

### 1. Inventario

El modelo `inventario` representa el stock de productos en cada sucursal.

#### Campos:

| Campo         | Tipo         | Descripción                                | Requerido |
|---------------|--------------|--------------------------------------------|-----------|
| id            | UUID         | Identificador único                        | Sí        |
| sucursal_id   | UUID         | Referencia a la sucursal                   | No        |
| producto_id   | UUID         | Referencia al producto                     | No        |
| color_id      | UUID         | Referencia al color del producto           | No        |
| marca_id      | UUID         | Referencia a la marca del producto         | No        |
| stock         | Integer      | Cantidad disponible en inventario          | No (0)    |
| stock_minimo  | Integer      | Nivel mínimo de stock para alertas         | No (3)    |

#### Relaciones:
- Pertenece a un `producto`
- Pertenece a una `sucursal`
- Pertenece a un `color`
- Pertenece a una `marca`
- Tiene muchos `movimiento_inventario`

### 2. Movimiento de Inventario

El modelo `movimiento_inventario` registra todos los cambios en el inventario.

#### Campos:

| Campo             | Tipo         | Descripción                                | Requerido |
|-------------------|--------------|--------------------------------------------|-----------|
| id                | UUID         | Identificador único                        | Sí        |
| inventario_id     | UUID         | Referencia al inventario                   | No        |
| usuario_id        | UUID         | Usuario que realizó el movimiento          | No        |
| tipo              | String(20)   | Tipo de movimiento (entrada/salida/ajuste) | No        |
| cantidad          | Integer      | Cantidad movida (positiva o negativa)      | Sí        |
| stock_resultante  | Integer      | Stock después del movimiento               | No        |
| motivo           | String       | Razón del movimiento                       | No        |
| fecha            | DateTime     | Fecha del movimiento                       | No (now)  |
| reversa_de       | UUID         | Referencia al movimiento revertido         | No        |
| anulado          | Boolean      | Indica si el movimiento fue anulado        | No (false)|


### 3. Transferencia de Stock

El modelo `transferencia_stock` gestiona el movimiento de productos entre sucursales.

#### Campos:

| Campo               | Tipo         | Descripción                                | Requerido |
|---------------------|--------------|--------------------------------------------|-----------|
| id                  | UUID         | Identificador único                        | Sí        |
| producto_id         | UUID         | Referencia al producto                     | No        |
| sucursal_origen     | UUID         | Sucursal de origen                         | No        |
| sucursal_destino    | UUID         | Sucursal de destino                        | No        |
| solicitado_por      | UUID         | Usuario que solicitó la transferencia      | No        |
| cantidad            | Integer      | Cantidad a transferir                      | Sí        |
| motivo             | String       | Razón de la transferencia                  | No        |
| estado             | String(20)   | Estado de la transferencia                 | No (pendiente)|
| revisado_por       | UUID         | Usuario que revisó la transferencia        | No        |
| comentario_admin   | String       | Comentarios del administrador              | No        |
| solicitado_en      | DateTime     | Fecha de solicitud                         | No (now)  |
| revisado_en        | DateTime     | Fecha de revisión                          | No        |


## **A. Gestión Integral de Inventario** ✅ IMPLEMENTADO

- Inventario gestionado por sucursal, producto, color, marca y estado (activo, bajo stock, agotado, anulado).
- Consulta rápida y búsqueda avanzada: por producto, código, categoría, color, marca, estado, sucursal.
- Visualización de stock mínimo, alerta automática al llegar al umbral definido por producto/sucursal/color/marca.

## **B. Movimientos de Inventario**

### **1. Ingresos, Salidas y Ajustes:** ✅ IMPLEMENTADO
    - Registro de ingresos de productos (compra, devolución, transferencia recibida, etc.).
    - Registro de salidas (venta, merma, transferencia enviada, ajuste).
    - Cada movimiento requiere motivo, usuario responsable.
    - Los movimientos quedan logueados con hora, usuario, entidad relacionada, motivo y stock_resultante tras el movimiento.
    - Operaciones protegidas por transacciones atómicas para prevenir conflictos de concurrencia.

### **2. Transferencias entre Sucursales:** ❌ PENDIENTE
    - Flujo de solicitud de transferencia (producto, color, marca, cantidad, sucursal origen y destino, motivo, adjunto opcional).
    - Estado de transferencia: pendiente, aprobada, rechazada, completada, anulada.
    - Solo usuarios con rol admin pueden aprobar/rechazar; cada acción queda logueada con comentario obligatorio.
    - Visualización de historial y seguimiento por estado.
    - Verificación de stock disponible en origen durante todo el proceso.

### **3. Reversas y Anulaciones:** ✅ IMPLEMENTADO
    - Movimientos pueden ser reversados por error/ajuste; se crea movimiento inverso vinculado.
    - Las anulaciones/reversas requieren motivo/comentario obligatorio y quedan bloqueadas para edición posterior.
    - Solo usuarios con rol admin pueden realizar anulaciones/reversas.
    - Cada movimiento de reversa registra el stock_resultante final para auditoría completa.

### **4. Inventario No Negativo y Control de Stock:** ✅ IMPLEMENTADO
    - Validaciones automáticas: no permite salidas si el stock es insuficiente.
    - Alertas de stock bajo y reportes periódicos automáticos para admins/gerentes.

## **C. Reporting y Paneles Avanzados** ✅ PARCIALMENTE IMPLEMENTADO

- Reportes de inventario por sucursal, categoría, estado, periodo. ✅
- Exportación a Excel/CSV de movimientos, transferencias, historial completo por producto. ❌
- Panel de inventario bajo/agotado y movimientos recientes. ✅
- KPI y dashboards: rotación de inventario, valor en stock, movimientos anómalos. ❌

## **D. Adjuntos y Evidencia Documental** ✅ PARCIALMENTE IMPLEMENTADO

- API backend para adjuntos de inventario completamente implementada: ✅
  - Subida de archivos adjuntos para inventario ✅
  - Listado de adjuntos por inventario ✅
  - Descarga de adjuntos ✅
  - Eliminación de adjuntos ✅
  - Middleware de autenticación optimizado para evitar conflictos con Multer ✅
  - Pruebas exhaustivas que verifican permisos y operaciones ✅
- Integración con frontend pendiente: ❌
  - Cualquier movimiento (ingreso, salida, ajuste, transferencia) puede tener asociado uno o varios archivos adjuntos (facturas, actas, fotos, soporte).
  - Solo se permiten imágenes y PDF con tamaño máximo de 2MB por archivo.
  - Almacenamiento local con preparación para futura integración con Google Drive.
  - Visualización de adjuntos desde ficha de producto, panel de movimiento, reporte de auditoría.
- Logs y auditoría de operaciones de adjuntos implementados ✅

## **E. Seguridad, Logs y Auditoría** ✅ IMPLEMENTADO

- Todas las acciones críticas quedan registradas en logs: creación, edición, reversa, anulación. ✅
- El sistema registra automáticamente el stock_resultante tras cada movimiento para facilitar auditoría. ✅
- Solo usuarios con rol admin pueden ejecutar reversas o anular movimientos. ✅
- Manejo de concurrencia mediante transacciones atómicas para prevenir inconsistencias en stock. ✅
- Paneles de logs e historial de inventario para auditoría interna/externa. ✅
- La descarga de adjuntos está pendiente de implementación junto con el módulo de adjuntos. ❌

## **F. Ejemplo de Wireframe Textual: Panel de Inventario Multisucursal**

| INVENTARIO GENERAL – SUCURSAL: [Centro ▼] 				|
| Producto 	| Color | Marca | Stock 	| Stock Mín. 	| Estado 	| [Ver Mov.] [Ajustar] 	|
| Lente X 	| Azul | Ray-Ban | 3 	| 5 		| ⚠ Bajo	| [ ] [ + ]		|
| Lente Y 	| Verde | Oakley | 10 	| 3 		| Ok 		| [ ] [ + ] 		|
| Accesorio Z 	| Negro | Genérico | 0	 | 2		 | 🔴 Agotado	| [ ] [ + ]		|
## Endpoints

### Inventario

#### GET /api/inventario
Obtiene el listado de inventario con filtros.

**Parámetros de consulta:**
- `sucursal_id`: Filtrar por sucursal
- `producto_id`: Filtrar por producto
- `marca_id`: Filtrar por marca
- `color_id`: Filtrar por color
- `stock_min`: Stock mínimo
- `stock_max`: Stock máximo
- `bajo_stock`: Solo productos con stock por debajo del mínimo (true/false)

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid-inventario",
      "stock": 10,
      "stock_minimo": 5,
      "producto": {
        "id": "uuid-producto",
        "nombre": "Gafas de sol Ray-Ban",
        "precio": 199.99
      },
      "sucursal": {
        "id": "uuid-sucursal",
        "nombre": "Sucursal Principal"
      },
      "color": {
        "id": "uuid-color",
        "nombre": "Negro"
      },
      "marca": {
        "id": "uuid-marca",
        "nombre": "Ray-Ban"
      }
    }
  ],
  "meta": {
    "total": 1,
    "pagina_actual": 1,
    "por_pagina": 20
  }
}
```

#### POST /api/inventario/ajustar
Realiza un ajuste de inventario.

**Cuerpo de la solicitud:**
```json
{
  "inventario_id": "uuid-inventario",
  "tipo": "ajuste",
  "cantidad": 5,
  "motivo": "Ajuste de inventario físico"
}
```

### Transferencias de Stock

#### POST /api/transferencias/solicitar
Solicita una transferencia de stock entre sucursales.

**Cuerpo de la solicitud:**
```json
{
  "producto_id": "uuid-producto",
  "sucursal_origen": "uuid-sucursal-origen",
  "sucursal_destino": "uuid-sucursal-destino",
  "cantidad": 5,
  "motivo": "Transferencia entre sucursales"
}
```

#### PUT /api/transferencias/{id}/aprobar
Aprueba una transferencia de stock.

**Cuerpo de la solicitud:**
```json
{
  "comentario": "Transferencia aprobada"
}
```

#### PUT /api/transferencias/{id}/rechazar
Rechaza una transferencia de stock.

**Cuerpo de la solicitud:**
```json
{
  "comentario": "Sin stock suficiente"
}
```

## Flujos de Trabajo

### 1. Ajuste de Inventario
1. Verificar permisos del usuario
2. Validar que el inventario existe
3. Crear registro de movimiento
4. Actualizar stock
5. Registrar en log de auditoría

### 2. Transferencia entre Sucursales
1. Solicitud de transferencia
   - Verificar stock en sucursal origen
   - Crear registro de transferencia en estado "pendiente"
   - Notificar a administradores

2. Aprobación/Rechazo
   - Verificar permisos de aprobación
   - Si se aprueba:
     - Crear movimientos de inventario (salida en origen, entrada en destino)
     - Actualizar stock en ambas sucursales
     - Actualizar estado de transferencia a "completada"
   - Si se rechaza:
     - Actualizar estado a "rechazada"
     - Registrar motivo

### 3. Alertas de Stock Bajo
1. Programar tarea periódica
2. Consultar productos con stock ≤ stock_mínimo
3. Generar notificaciones para los encargados
4. Enviar correos de alerta si corresponde

## Reportes

### 1. Movimientos de Inventario
- Filtros por fechas, sucursal, producto, tipo de movimiento
- Exportación a Excel/PDF

### 2. Niveles de Stock
- Vista consolidada por producto/sucursal
- Productos con stock bajo
- Productos sin movimiento en X tiempo

### 3. Historial de Transferencias
- Estado de transferencias
- Tiempo promedio de aprobación
- Transferencias pendientes
| Fecha | Producto 	| Color | Marca | Tipo 		| Cantidad 	| Stock Resultante | Usuario 	| Estado 	|
| 13/07 | Lente X 	| Azul | Ray-Ban | Salida 	| -2 		| 3 | vdr1 		| Ok 		|
| 12/07 | Lente Y 	| Verde | Oakley | Ajuste 	| +5 		| 10 | admin 	| Ok 		|
| ... |
| [Ver Adjuntos]	[Historial]	[Panel de Transferencias]	[Volver] 	|

---

## **Notas clave:**
- La operación multisucursal y la trazabilidad de movimientos son centrales para la integridad y el control.
- El inventario se gestiona a nivel de producto-sucursal-color-marca para mayor precisión y control.
- El campo stock_resultante facilita la auditoría completa de cada movimiento.
- Transacciones atómicas garantizan la integridad del stock incluso con operaciones concurrentes.
- Los paneles UX permiten detectar anomalías, dar soporte y responder rápido ante faltantes o errores de inventario.
- Todo el flujo es auditable, seguro y preparado para crecer en número de sucursales, productos y usuarios.
