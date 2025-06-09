# Color

## Descripción
Modelo que representa Color en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombre` | `string` | ✅ | - | - |  |
| `codigoHex` | `string?` | ❌ | `null` | - |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `activo` | `boolean?` | ❌ | `null` | Valor por defecto |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **productos**: Muchos a [Producto](./producto.md) `ColorToProducto`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Color
const nuevoColor = await prisma.color.create({
  data: {
    nombre: "valor",
    codigoHex: null,
    descripcion: null,
    activo: null,
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
// Obtener todos los registros de Color
const registros = await prisma.color.findMany({
    // Incluir relaciones
    include: {
      productos: true
    }
});

// Obtener un Color por ID
const registro = await prisma.color.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      productos: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `color`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./color/reglas_negocio.md)
- [Seguridad y Permisos](./color/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **productos**: Muchos a [Producto](./producto.md) `ColorToProducto`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.970Z
