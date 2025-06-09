# DescansoEmpleado

## Descripción
Modelo que representa DescansoEmpleado en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `empleadoId` | `string?` | ❌ | `null` | - |  |
| `sucursalId` | `string?` | ❌ | `null` | - |  |
| `fechaInicio` | `Date` | ✅ | - | - |  |
| `fechaFin` | `Date` | ✅ | - | - |  |
| `motivo` | `string?` | ❌ | `null` | - |  |
| `estado` | `string?` | ❌ | `null` | Valor por defecto |  |
| `adjuntoId` | `string?` | ❌ | `null` | - |  |
| `revisadoPor` | `string?` | ❌ | `null` | - |  |
| `comentarioAdmin` | `string?` | ❌ | `null` | - |  |
| `revisadoEn` | `Date?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **archivoAdjunto**: Uno a [ArchivoAdjunto](./archivoadjunto.md) `ArchivoAdjuntoToDescansoEmpleado`
- **empleado**: Uno a [Usuario](./usuario.md) `DescansoEmpleadoEmpleado`
- **revisor**: Uno a [Usuario](./usuario.md) `DescansoEmpleadoRevisor`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `DescansoEmpleadoToSucursal`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo DescansoEmpleado
const nuevoDescansoEmpleado = await prisma.descansoempleado.create({
  data: {
    empleadoId: null,
    sucursalId: null,
    fechaInicio: "valor",
    fechaFin: "valor",
    motivo: null,
    estado: null,
    adjuntoId: null,
    revisadoPor: null,
    comentarioAdmin: null,
    revisadoEn: null,
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
// Obtener todos los registros de DescansoEmpleado
const registros = await prisma.descansoempleado.findMany({
    // Incluir relaciones
    include: {
      archivoAdjunto: true,
      empleado: true,
      revisor: true,
      sucursal: true
    }
});

// Obtener un DescansoEmpleado por ID
const registro = await prisma.descansoempleado.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      archivoAdjunto: true,
      empleado: true,
      revisor: true,
      sucursal: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `descansoempleado`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./descansoempleado/reglas_negocio.md)
- [Seguridad y Permisos](./descansoempleado/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **archivoAdjunto**: Uno a [ArchivoAdjunto](./archivoadjunto.md) `ArchivoAdjuntoToDescansoEmpleado`
- **empleado**: Uno a [Usuario](./usuario.md) `DescansoEmpleadoEmpleado`
- **revisor**: Uno a [Usuario](./usuario.md) `DescansoEmpleadoRevisor`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `DescansoEmpleadoToSucursal`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.918Z
