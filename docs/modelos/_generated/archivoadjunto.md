# ArchivoAdjunto

## Descripción
Modelo que representa ArchivoAdjunto en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombreArchivo` | `string` | ✅ | - | - |  |
| `url` | `string` | ✅ | - | - |  |
| `tipo` | `string?` | ❌ | `null` | - |  |
| `tamanio` | `number?` | ❌ | `null` | - |  |
| `extension` | `string?` | ❌ | `null` | - |  |
| `subidoPor` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **usuario**: Uno a [Usuario](./usuario.md) `ArchivoAdjuntoToUsuario`
- **archivoEntidad**: Muchos a [ArchivoEntidad](./archivoentidad.md) `ArchivoAdjuntoToArchivoEntidad`
- **descansoEmpleado**: Muchos a [DescansoEmpleado](./descansoempleado.md) `ArchivoAdjuntoToDescansoEmpleado`
- **facturasPdf**: Muchos a [Factura](./factura.md) `FacturaArchivoPdf`
- **facturasXml**: Muchos a [Factura](./factura.md) `FacturaArchivoXml`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo ArchivoAdjunto
const nuevoArchivoAdjunto = await prisma.archivoadjunto.create({
  data: {
    nombreArchivo: "valor",
    url: "valor",
    tipo: null,
    tamanio: null,
    extension: null,
    subidoPor: null,
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
// Obtener todos los registros de ArchivoAdjunto
const registros = await prisma.archivoadjunto.findMany({
    // Incluir relaciones
    include: {
      usuario: true,
      archivoEntidad: true,
      descansoEmpleado: true,
      facturasPdf: true,
      facturasXml: true
    }
});

// Obtener un ArchivoAdjunto por ID
const registro = await prisma.archivoadjunto.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      usuario: true,
      archivoEntidad: true,
      descansoEmpleado: true,
      facturasPdf: true,
      facturasXml: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `archivoadjunto`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./archivoadjunto/reglas_negocio.md)
- [Seguridad y Permisos](./archivoadjunto/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **usuario**: Uno a [Usuario](./usuario.md) `ArchivoAdjuntoToUsuario`
- **archivoEntidad**: Muchos a [ArchivoEntidad](./archivoentidad.md) `ArchivoAdjuntoToArchivoEntidad`
- **descansoEmpleado**: Muchos a [DescansoEmpleado](./descansoempleado.md) `ArchivoAdjuntoToDescansoEmpleado`
- **facturasPdf**: Muchos a [Factura](./factura.md) `FacturaArchivoPdf`
- **facturasXml**: Muchos a [Factura](./factura.md) `FacturaArchivoXml`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.888Z
