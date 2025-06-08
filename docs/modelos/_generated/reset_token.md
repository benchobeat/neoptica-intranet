# reset_token

## Descripción
Modelo que representa reset_token en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `string` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `usuario_id` | `string` | ✅ | - | - |  |
| `token` | `string` | ✅ | - | - |  |
| `expires_at` | `Date` | ✅ | - | - |  |
| `created_at` | `Date` | ✅ | - | Valor por defecto |  |
| `used` | `boolean` | ✅ | - | Valor por defecto |  |
| `creado_en` | `Date?` | ❌ | `now()` | Valor por defecto, Marca de tiempo automática |  |
| `creado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |
| `modificado_en` | `Date?` | ❌ | `null` | Marca de tiempo automática |  |
| `modificado_por` | `string?` | ❌ | ID del usuario autenticado | Referencia a usuario |  |

### Relaciones

- **usuario**: Uno a [usuario](./usuario.md) `reset_tokenTousuario`

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo reset_token
const nuevoreset_token = await prisma.reset_token.create({
  data: {
    usuario_id: "valor",
    token: "valor",
    expires_at: "valor",
    created_at: "valor",
    used: "valor",
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de reset_token
const registros = await prisma.reset_token.findMany({
    // Incluir relaciones
    include: {
      usuario: true
    }
});

// Obtener un reset_token por ID
const registro = await prisma.reset_token.findUnique({
  where: { id: 'ID_DEL_REGISTRO' },
    // Incluir relaciones
    include: {
      usuario: true
    }
});
```

## Notas Técnicas

- **Tabla en BD**: `reset_token`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./reset_token/reglas_negocio.md)
- [Seguridad y Permisos](./reset_token/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

- **usuario**: Uno a [usuario](./usuario.md) `reset_tokenTousuario`

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-07T21:18:20.055Z
