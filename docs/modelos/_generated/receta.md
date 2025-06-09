# Receta

## Descripción
Modelo que representa Receta en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `citaId` | `string` | ✅ | - | - |  |
| `pacienteId` | `string` | ✅ | - | - |  |
| `optometristaId` | `string` | ✅ | - | - |  |
| `tipoReceta` | `string` | ✅ | - | Valor por defecto |  |
| `fechaPrescripcion` | `Date` | ✅ | - | Valor por defecto |  |
| `validezMeses` | `number` | ✅ | - | Valor por defecto |  |
| `avLejosOd` | `string?` | ❌ | `null` | - |  |
| `avLejosOi` | `string?` | ❌ | `null` | - |  |
| `avCercaOd` | `string?` | ❌ | `null` | - |  |
| `avCercaOi` | `string?` | ❌ | `null` | - |  |
| `avConCorreccion` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `esferaOd` | `number` | ✅ | - | - |  |
| `esferaOi` | `number` | ✅ | - | - |  |
| `cilindroOd` | `number?` | ❌ | `null` | - |  |
| `cilindroOi` | `number?` | ❌ | `null` | - |  |
| `ejeOd` | `number?` | ❌ | `null` | - |  |
| `ejeOi` | `number?` | ❌ | `null` | - |  |
| `adicion` | `number?` | ❌ | `null` | - |  |
| `alturaSegmento` | `number?` | ❌ | `null` | - |  |
| `tipoLente` | `string?` | ❌ | `null` | - |  |
| `dpLejos` | `number?` | ❌ | `null` | - |  |
| `dpCerca` | `number?` | ❌ | `null` | - |  |
| `tipoDP` | `string?` | ❌ | `null` | - |  |
| `diametroLc` | `number?` | ❌ | `null` | - |  |
| `curvaBase` | `number?` | ❌ | `null` | - |  |
| `marcaLente` | `string?` | ❌ | `null` | - |  |
| `material` | `string?` | ❌ | `null` | - |  |
| `reemplazo` | `string?` | ❌ | `null` | - |  |
| `tratamientos` | `string?` | ❌ | `null` | - |  |
| `color` | `string?` | ❌ | `null` | - |  |
| `diagnostico` | `string?` | ❌ | `null` | - |  |
| `observaciones` | `string?` | ❌ | `null` | - |  |
| `recomendaciones` | `string?` | ❌ | `null` | - |  |
| `estado` | `RecetaEstado` | ✅ | - | Valor por defecto |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **cita**: Uno a [Cita](./cita.md) `CitaToReceta`
- **paciente**: Uno a [Usuario](./usuario.md) `PacienteRecetas`
- **optometrista**: Uno a [Usuario](./usuario.md) `OptometristaRecetas`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Receta
const nuevoReceta = await prisma.receta.create({
  data: {
    citaId: "valor",
    pacienteId: "valor",
    optometristaId: "valor",
    tipoReceta: "valor",
    fechaPrescripcion: "valor",
    validezMeses: "valor",
    avLejosOd: null,
    avLejosOi: null,
    avCercaOd: null,
    avCercaOi: null,
    avConCorreccion: null,
    esferaOd: "valor",
    esferaOi: "valor",
    cilindroOd: null,
    cilindroOi: null,
    ejeOd: null,
    ejeOi: null,
    adicion: null,
    alturaSegmento: null,
    tipoLente: null,
    dpLejos: null,
    dpCerca: null,
    tipoDP: null,
    diametroLc: null,
    curvaBase: null,
    marcaLente: null,
    material: null,
    reemplazo: null,
    tratamientos: null,
    color: null,
    diagnostico: null,
    observaciones: null,
    recomendaciones: null,
    estado: "valor",
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
// Obtener todos los registros de Receta
const registros = await prisma.receta.findMany({
    // Incluir relaciones
    include: {
      cita: true,
      paciente: true,
      optometrista: true
    }
});

// Obtener un Receta por ID
const registro = await prisma.receta.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      cita: true,
      paciente: true,
      optometrista: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `receta`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./receta/reglas_negocio.md)
- [Seguridad y Permisos](./receta/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **cita**: Uno a [Cita](./cita.md) `CitaToReceta`
- **paciente**: Uno a [Usuario](./usuario.md) `PacienteRecetas`
- **optometrista**: Uno a [Usuario](./usuario.md) `OptometristaRecetas`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:16.006Z
