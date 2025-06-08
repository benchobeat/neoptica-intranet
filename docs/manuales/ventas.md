# Módulo de Ventas

## Modelos de Datos

### 1. Pedido (`pedido`)
Solicitud de compra que puede generar una o más facturas.

#### Campos principales:
- **id**: Identificador único (UUID)
- **fecha_creacion**: Fecha de creación
- **fecha_entrega**: Fecha prevista de entrega
- **estado**: Estado del pedido (en_proceso, completado, cancelado)
- **tipo_entrega**: Retiro en tienda o envío a domicilio
- **direccion_entrega**: Dirección de envío (si aplica)
- **usuario_id**: Cliente que realiza el pedido
- **sucursal_id**: Sucursal donde se realiza la venta
- **factura_id**: Referencia a la factura generada (opcional)

> **Nota:** Para detalles sobre facturación y procesos contables, consulte el [Módulo de Contabilidad](../contabilidad.md)

### 2. Detalle de Pedido (`detalle_pedido`)
Líneas de productos en un pedido.

#### Campos principales:
- **id**: Identificador único (UUID)
- **pedido_id**: Referencia al pedido
- **producto_id**: Producto incluido
- **cantidad**: Cantidad solicitada
- **precio_unitario**: Precio al momento de la venta
- **descuento**: Descuento aplicado al ítem
- **subtotal**: Precio total del ítem
- **observaciones**: Notas específicas del ítem

### 3. Detalle de Pedido (`detalle_pedido`)
Líneas de productos en un pedido.

#### Campos principales:
- **id**: Identificador único (UUID)
- **pedido_id**: Referencia al pedido
- **producto_id**: Producto incluido
- **cantidad**: Cantidad solicitada
- **precio_unitario**: Precio al momento de la venta
- **descuento**: Descuento aplicado al ítem
- **subtotal**: Precio total del ítem
- **observaciones**: Notas específicas del ítem

### 3. Cupón (`cupón`)
Descuentos promocionales aplicables a productos o pedidos.

#### Campos principales:
- **id**: Identificador único (UUID)
- **codigo**: Código del cupón
- **tipo_descuento**: Porcentaje o monto fijo
- **valor**: Valor del descuento
- **fecha_inicio**: Fecha de inicio de validez
- **fecha_fin**: Fecha de vencimiento
- **usos_maximos**: Número máximo de usos
- **usos_actuales**: Veces que se ha utilizado
- **activo**: Si el cupón está activo

### 5. Cupón (`cupon`)
Descuentos promocionales aplicables a productos o pedidos.

#### Campos principales:
- **id**: Identificador único (UUID)
- **codigo**: Código del cupón
- **tipo_descuento**: Porcentaje o monto fijo
- **valor**: Valor del descuento
- **fecha_inicio**: Fecha de inicio de validez
- **fecha_fin**: Fecha de vencimiento
- **usos_maximos**: Número máximo de usos
- **usos_actuales**: Veces que se ha utilizado
- **activo**: Si el cupón está activo

### 6. Producto_Cupon
Tabla de relación muchos a muchos entre productos y cupones que define qué cupones son aplicables a qué productos.

#### Campos:
- **producto_id** (UUID): Referencia al producto
- **cupon_id** (UUID): Referencia al cupón
- **fecha_creacion**: Fecha de creación del registro
- **activo**: Indica si la relación está activa

#### Reglas de Negocio:
- Un cupón puede estar asociado a múltiples productos
- Un producto puede tener múltiples cupones aplicables
- La relación debe ser única (no puede haber duplicados de producto_id + cupon_id)
- Al eliminar un producto o cupón, se deben eliminar sus relaciones en esta tabla

## Endpoints API

### Gestión de Pedidos

#### POST /api/pedidos
- **Descripción**: Crea un nuevo pedido
- **Autenticación**: Requerida
- **Roles**: vendedor, admin
- **Cuerpo**:
  ```json
  {
    "cliente_id": "uuid-del-cliente",
    "sucursal_id": "uuid-sucursal",
    "tipo_entrega": "tienda|domicilio",
    "direccion_entrega": "...",
    "items": [
      {
        "producto_id": "uuid-producto",
        "cantidad": 1,
        "precio_unitario": 100.00,
        "descuento": 0.00
      }
    ],
    "cupon_codigo": "DESCUENTO10"
  }
  ```

#### GET /api/pedidos/:id
- **Descripción**: Obtiene los detalles de un pedido
- **Autenticación**: Requerida
- **Roles**: vendedor, admin, cliente (solo sus pedidos)
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "id": "uuid-pedido",
    "fecha_creacion": "2024-06-07T12:00:00Z",
    "estado": "completado",
    "cliente": { /* datos del cliente */ },
    "items": [ /* productos */ ],
    "total": 100.00
  }
  ```

### Gestión de Facturas

> **Nota:** La generación de facturas se realiza a través del [Módulo de Contabilidad](../contabilidad.md).

#### GET /api/pedidos/:id/factura
- **Descripción**: Obtiene la factura asociada a un pedido
- **Autenticación**: Requerida
- **Roles**: cajero, admin, cliente (solo sus facturas)
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "id": "uuid-factura",
    "numero_factura": "001-001-000000001",
    "fecha_emision": "2024-06-07T12:00:00Z",
    "estado": "pagada",
    "total": 100.00,
    "enlace_descarga": "/api/facturas/uuid-factura/pdf"
  }
  ```

### Gestión de Cupones

#### GET /api/cupones/validar/:codigo
- **Descripción**: Valida un cupón y devuelve su información
- **Autenticación**: Requerida
- **Roles**: cliente, vendedor, admin
- **Respuesta exitosa (200 OK)**:
  ```json
  {
    "valido": true,
    "mensaje": "Cupón aplicado correctamente",
    "tipo_descuento": "porcentaje",
    "valor": 10.00,
    "codigo": "DESCUENTO10"
  }
  ```

## Flujos de Venta

### 1. Venta en Tienda
1. El vendedor inicia un nuevo pedido
2. Se agregan los productos al carrito
3. Se aplican descuentos o cupones
4. Se genera la factura
5. Se registra el pago
6. Se actualiza el inventario
7. Se entrega la orden al cliente

### 2. Venta en Línea
1. El cliente agrega productos al carrito
2. Selecciona método de envío y pago
3. Confirma el pedido
4. Se genera la orden en estado "pendiente de pago"
5. Se procesa el pago en línea
6. Se confirma el pedido y se prepara para envío

## Reportes de Ventas

### 1. Ventas por Período
- Total de ventas por día/semana/mes
- Comparativo con períodos anteriores
- Tendencias de venta

### 2. Productos más Vendidos
- Ranking de productos por cantidad
- Ingresos por producto
- Productos con mejor margen

### 3. Métodos de Pago
- Distribución de ventas por método de pago
- Tasa de conversión por método
- Promedio de ticket

> **Nota:** Para reportes contables avanzados, consulte el [Módulo de Contabilidad](../contabilidad.md)

## Integraciones

### 1. Sistema de Inventario
- Actualización automática de existencias
- Alertas de stock bajo
- Sincronización en tiempo real

### 2. Módulo de Contabilidad
> **Ver documentación completa en:** [Módulo de Contabilidad](../contabilidad.md)
- Generación automática de facturas
- Sincronización de transacciones
- Reportes fiscales básicos

## Seguridad

### 1. Control de Acceso
- Roles específicos para cada función
- Módulos independientes
- Registro detallado de acciones

### 2. Protección de Datos
- Encriptación de información sensible
- Cumplimiento de normativas
- Copias de seguridad periódicas

## Mantenimiento

### 1. Actualizaciones
- Actualizaciones periódicas del sistema
- Parches de seguridad
- Mejoras de rendimiento

### 2. Soporte
- Canales de atención al cliente
- Documentación actualizada
- Capacitación continua