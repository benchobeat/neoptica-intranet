# DbMigration

## Descripción
Modelo que representa DbMigration en el sistema.

## Estructura

### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
| `id` | `number` | ✅ | `uuid_generate_v4()` | Identificador único, Valor por defecto |  |
| `nombreMigracion` | `string` | ✅ | - | - |  |
| `ejecutadoEn` | `Date?` | ❌ | `null` | Valor por defecto |  |
| `autor` | `string?` | ❌ | `null` | - |  |

### Relaciones

Este modelo no tiene relaciones definidas.

## Ejemplos de Uso

### Creación

```typescript
// Crear un nuevo DbMigration
const nuevoDbMigration = await prisma.dbmigration.create({
  data: {
    nombreMigracion: "valor",
    ejecutadoEn: null,
    autor: null,
  }
});
```

### Consulta Básica

```typescript
// Obtener todos los registros de DbMigration
const registros = await prisma.dbmigration.findMany({
});

// Obtener un DbMigration por ID
const registro = await prisma.dbmigration.findUnique({
  where: { id: 'ID_DEL_REGISTRO' }
});
```

## Notas Técnicas

- **Tabla en BD**: `dbmigration`
- **Clave primaria**: `id`
- **Campos de auditoría**: ❌ No

## Auditoría

❌ Este modelo no incluye campos de auditoría estándar.

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./dbmigration/reglas_negocio.md)
- [Seguridad y Permisos](./dbmigration/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

Este modelo no tiene relaciones definidas.

## Estado Actual

✅ Documentación generada automáticamente el 2025-06-09T20:48:15.907Z
