# Rol

## Descripción
Modelo que representa Rol en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombre` | `string` | ✅ | - | Valor único |  |
| `descripcion` | `string?` | ❌ | `null` | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **usuariosRol**: Muchos a [UsuarioRol](./usuariorol.md) `RolToUsuarioRol`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo Rol
const nuevoRol = await prisma.rol.create({
  data: {
    nombre: "valor",
    descripcion: null,
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
// Obtener todos los registros de Rol
const registros = await prisma.rol.findMany({
    // Incluir relaciones
    include: {
      usuariosRol: true
    }
});

// Obtener un Rol por ID
const registro = await prisma.rol.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      usuariosRol: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `rol`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./rol/reglas_negocio.md)
- [Seguridad y Permisos](./rol/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **usuariosRol**: Muchos a [UsuarioRol](./usuariorol.md) `RolToUsuarioRol`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.975Z
