# ResetToken

## Descripción
Modelo que representa ResetToken en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `usuarioId` | `string` | ✅ | - | - |  |
| `token` | `string` | ✅ | - | - |  |
| `expiresAt` | `Date` | ✅ | - | - |  |
| `createdAt` | `Date` | ✅ | - | Valor por defecto |  |
| `used` | `boolean` | ✅ | - | Valor por defecto |  |
| `creadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `creadoPor` | `string?` | ❌ | `null` | - |  |
| `modificadoEn` | `Date?` | ❌ | `null` | - |  |
| `modificadoPor` | `string?` | ❌ | `null` | - |  |

### Relaciones

- **usuario**: Uno a [Usuario](./usuario.md) `ResetTokenToUsuario`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo ResetToken
const nuevoResetToken = await prisma.resettoken.create({
  data: {
    usuarioId: "valor",
    token: "valor",
    expiresAt: "valor",
    createdAt: "valor",
    used: "valor",
    creadoEn: null,
    creadoPor: null,
    modificadoEn: null,
    modificadoPor: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de ResetToken
const registros = await prisma.resettoken.findMany({
    // Incluir relaciones
    include: {
      usuario: true
    }
});

// Obtener un ResetToken por ID
const registro = await prisma.resettoken.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      usuario: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `resettoken`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./resettoken/reglas_negocio.md)
- [Seguridad y Permisos](./resettoken/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **usuario**: Uno a [Usuario](./usuario.md) `ResetTokenToUsuario`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.997Z
