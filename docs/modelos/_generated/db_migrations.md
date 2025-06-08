# db_migrations

## Descripción
Modelo que representa db_migrations en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `number` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombre_migracion` | `string` | ✅ | - | - |  |
| `ejecutado_en` | `Date?` | ❌ | `null` | Valor por defecto, Marca de tiempo automática |  |
| `autor` | `string?` | ❌ | `null` | - |  |

### Relaciones

Este modelo no tiene relaciones definidas.

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo db_migrations
const nuevodb_migrations = await prisma.db_migrations.create({
  data: {
    nombre_migracion: "valor",
    autor: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de db_migrations
const registros = await prisma.db_migrations.findMany({
});

// Obtener un db_migrations por ID
const registro = await prisma.db_migrations.findUnique({
  where: { id: 'ID_DEL_REGISTRO' }
});
```

## Notas Técnicas

- **Tabla en BD**: `db_migrations`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./db_migrations/reglas_negocio.md)
- [Seguridad y Permisos](./db_migrations/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

Este modelo no tiene relaciones definidas.

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-08T15:35:08.502Z
