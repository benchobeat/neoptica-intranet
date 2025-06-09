# Factura

## Descripción
Modelo que representa Factura en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `pedidoId` | `string?` | ❌ | `null` | - |  |
| `clienteId` | `string?` | ❌ | `null` | - |  |
| `fechaEmision` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `estado` | `string` | ✅ | - | - |  |
| `archivoXmlId` | `string?` | ❌ | `null` | - |  |
| `archivoPdfId` | `string?` | ❌ | `null` | - |  |
| `moneda` | `string?` | ❌ | `null` | Valor por defecto |  |
| `erpId` | `number?` | ❌ | `null` | - |  |
| `erpTipo` | `string?` | ❌ | `null` | - |  |
| `erpEstado` | `string?` | ❌ | `null` | - |  |
| `erpPayload` | `object?` | ❌ | `null` | - |  |
| `asientoContableId` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **archivoPdf**: Uno a [ArchivoAdjunto](./archivoadjunto.md) `FacturaArchivoPdf`
- **archivoXml**: Uno a [ArchivoAdjunto](./archivoadjunto.md) `FacturaArchivoXml`
- **cliente**: Uno a [Usuario](./usuario.md) `FacturaToUsuario`
- **pedido**: Uno a [Pedido](./pedido.md) `FacturaToPedido`
- **asientoContable**: Uno a [AsientoContable](./asientocontable.md) `AsientoContableToFactura`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Factura
const nuevoFactura = await prisma.factura.create({
  data: {
    pedidoId: null,
    clienteId: null,
    fechaEmision: null,
    estado: "valor",
    archivoXmlId: null,
    archivoPdfId: null,
    moneda: null,
    erpId: null,
    erpTipo: null,
    erpEstado: null,
    erpPayload: null,
    asientoContableId: null,
    creadoEn: null,
    creadoPor: null,
    modificadoEn: null,
    modificadoPor: null,
    anuladoEn: null,
    anuladoPor: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de Factura
const registros = await prisma.factura.findMany({
    // Incluir relaciones
    include: {
      archivoPdf: true,
      archivoXml: true,
      cliente: true,
      pedido: true,
      asientoContable: true
    }
});

// Obtener un Factura por ID
const registro = await prisma.factura.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      archivoPdf: true,
      archivoXml: true,
      cliente: true,
      pedido: true,
      asientoContable: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `factura`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./factura/reglas_negocio.md)
- [Seguridad y Permisos](./factura/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **archivoPdf**: Uno a [ArchivoAdjunto](./archivoadjunto.md) `FacturaArchivoPdf`
- **archivoXml**: Uno a [ArchivoAdjunto](./archivoadjunto.md) `FacturaArchivoXml`
- **cliente**: Uno a [Usuario](./usuario.md) `FacturaToUsuario`
- **pedido**: Uno a [Pedido](./pedido.md) `FacturaToPedido`
- **asientoContable**: Uno a [AsientoContable](./asientocontable.md) `AsientoContableToFactura`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.923Z
