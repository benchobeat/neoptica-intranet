# factura

## Descripción
Modelo que representa factura en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `pedido_id` | `string?` | ❌ | `null` | - |  |
| `cliente_id` | `string?` | ❌ | `null` | - |  |
| `fecha_emision` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `estado` | `string` | ✅ | - | - |  |
| `archivo_xml_id` | `string?` | ❌ | `null` | - |  |
| `archivo_pdf_id` | `string?` | ❌ | `null` | - |  |
| `moneda` | `string?` | ❌ | `null` | Valor por defecto |  |
| `erp_id` | `number?` | ❌ | `null` | - |  |
| `erp_tipo` | `string?` | ❌ | `null` | - |  |
| `erp_estado` | `string?` | ❌ | `null` | - |  |
| `erp_payload` | `object?` | ❌ | `null` | - |  |
| `asiento_contable_id` | `string?` | ❌ | `null` | - |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `anulado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `anulado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **archivo_adjunto_factura_archivo_pdf_idToarchivo_adjunto**: Uno a [archivo_adjunto](./archivo_adjunto.md) `factura_archivo_pdf_idToarchivo_adjunto`
- **archivo_adjunto_factura_archivo_xml_idToarchivo_adjunto**: Uno a [archivo_adjunto](./archivo_adjunto.md) `factura_archivo_xml_idToarchivo_adjunto`
- **usuario**: Uno a [usuario](./usuario.md) `facturaTousuario`
- **pedido**: Uno a [pedido](./pedido.md) `facturaTopedido`
- **asiento_contable**: Uno a [asiento_contable](./asiento_contable.md) `asiento_contableTofactura`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo factura
const nuevofactura = await prisma.factura.create({
  data: {
    pedido_id: null,
    cliente_id: null,
    fecha_emision: null,
    estado: "valor",
    archivo_xml_id: null,
    archivo_pdf_id: null,
    moneda: null,
    erp_id: null,
    erp_tipo: null,
    erp_estado: null,
    erp_payload: null,
    asiento_contable_id: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de factura
const registros = await prisma.factura.findMany({
    // Incluir relaciones
    include: {
      archivo_adjunto_factura_archivo_pdf_idToarchivo_adjunto: true,
      archivo_adjunto_factura_archivo_xml_idToarchivo_adjunto: true,
      usuario: true,
      pedido: true,
      asiento_contable: true
    }
});

// Obtener un factura por ID
const registro = await prisma.factura.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      archivo_adjunto_factura_archivo_pdf_idToarchivo_adjunto: true,
      archivo_adjunto_factura_archivo_xml_idToarchivo_adjunto: true,
      usuario: true,
      pedido: true,
      asiento_contable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `factura`
- **Clave primaria**: `id`
- **Campos de auditoría**: ✅ Sí

## Auditoría

### ✅ Auditoría Habilitada

Este modelo incluye soporte completo de auditoría con los siguientes campos de seguimiento:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `creado_en` | `DateTime` | Fecha y hora de creación del registro |
| `creado_por` | `string` | ID del usuario que creó el registro |
| `modificado_en` | `DateTime` | Última fecha de modificación del registro |
| `modificado_por` | `string` | ID del último usuario que modificó el registro |
| `anulado_en` | `DateTime?` | Fecha de eliminación lógica (soft delete) |
| `anulado_por` | `string?` | ID del usuario que realizó la eliminación lógica |

### Registro de Actividades

Todas las operaciones CRUD en este modelo generan registros de auditoría que incluyen:

- Usuario que realizó la acción
- Tipo de operación (CREAR, ACTUALIZAR, ELIMINAR, etc.)
- Fecha y hora exacta de la operación
- Dirección IP del solicitante
- Datos anteriores y nuevos (para actualizaciones)

### Consulta de Registros

Los registros de auditoría pueden consultarse a través de la API de auditoría con filtros por:

- Rango de fechas
- Usuario
- Tipo de acción
- Entidad afectada

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./factura/reglas_negocio.md)
- [Seguridad y Permisos](./factura/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **archivo_adjunto_factura_archivo_pdf_idToarchivo_adjunto**: Uno a [archivo_adjunto](./archivo_adjunto.md) `factura_archivo_pdf_idToarchivo_adjunto`
- **archivo_adjunto_factura_archivo_xml_idToarchivo_adjunto**: Uno a [archivo_adjunto](./archivo_adjunto.md) `factura_archivo_xml_idToarchivo_adjunto`
- **usuario**: Uno a [usuario](./usuario.md) `facturaTousuario`
- **pedido**: Uno a [pedido](./pedido.md) `facturaTopedido`
- **asiento_contable**: Uno a [asiento_contable](./asiento_contable.md) `asiento_contableTofactura`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-08T15:35:08.517Z
