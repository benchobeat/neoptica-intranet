# Cita

## Descripción
Modelo que representa Cita en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `clienteId` | `string?` | ❌ | `null` | - |  |
| `optometristaId` | `string?` | ❌ | `null` | - |  |
| `sucursalId` | `string?` | ❌ | `null` | - |  |
| `fechaHora` | `Date` | ✅ | - | - |  |
| `estado` | `string?` | ❌ | `null` | Valor por defecto |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **cliente**: Uno a [Usuario](./usuario.md) `cita_cliente_idTousuario`
- **optometrista**: Uno a [Usuario](./usuario.md) `cita_optometrista_idTousuario`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `CitaToSucursal`
- **historialClinico**: Muchos a [HistorialClinico](./historialclinico.md) `CitaToHistorialClinico`
- **recetas**: Muchos a [Receta](./receta.md) `CitaToReceta`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Cita
const nuevoCita = await prisma.cita.create({
  data: {
    clienteId: null,
    optometristaId: null,
    sucursalId: null,
    fechaHora: "valor",
    estado: null,
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
// Obtener todos los registros de Cita
const registros = await prisma.cita.findMany({
    // Incluir relaciones
    include: {
      cliente: true,
      optometrista: true,
      sucursal: true,
      historialClinico: true,
      recetas: true
    }
});

// Obtener un Cita por ID
const registro = await prisma.cita.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      cliente: true,
      optometrista: true,
      sucursal: true,
      historialClinico: true,
      recetas: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `cita`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./cita/reglas_negocio.md)
- [Seguridad y Permisos](./cita/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **cliente**: Uno a [Usuario](./usuario.md) `cita_cliente_idTousuario`
- **optometrista**: Uno a [Usuario](./usuario.md) `cita_optometrista_idTousuario`
- **sucursal**: Uno a [Sucursal](./sucursal.md) `CitaToSucursal`
- **historialClinico**: Muchos a [HistorialClinico](./historialclinico.md) `CitaToHistorialClinico`
- **recetas**: Muchos a [Receta](./receta.md) `CitaToReceta`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.897Z
