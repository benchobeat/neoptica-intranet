# UsuarioRol

## Descripción
Modelo que representa UsuarioRol en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `usuarioId` | `string` | ✅ | - | - |  |
| `rolId` | `string` | ✅ | - | - |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |
| `anuladoEn` | `Date?` | ❌ | `null` | - |  |
| `anuladoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **rol**: Uno a [Rol](./rol.md) `RolToUsuarioRol`
- **usuario**: Uno a [Usuario](./usuario.md) `UsuarioRoles`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo UsuarioRol
const nuevoUsuarioRol = await prisma.usuariorol.create({
  data: {
    usuarioId: "valor",
    rolId: "valor",
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
// Obtener todos los registros de UsuarioRol
const registros = await prisma.usuariorol.findMany({
    // Incluir relaciones
    include: {
      rol: true,
      usuario: true
    }
});

// Obtener un UsuarioRol por ID
const registro = await prisma.usuariorol.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      rol: true,
      usuario: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `usuariorol`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./usuariorol/reglas_negocio.md)
- [Seguridad y Permisos](./usuariorol/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **rol**: Uno a [Rol](./rol.md) `RolToUsuarioRol`
- **usuario**: Uno a [Usuario](./usuario.md) `UsuarioRoles`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.992Z
