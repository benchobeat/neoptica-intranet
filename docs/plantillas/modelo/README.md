# Modelo [NOMBRE_DEL_MODELO]

## Visión General

[Descripción general del modelo y su propósito en el sistema.]

## Documentación Técnica

- [Estructura del Modelo](./_generated/[nombre_modelo].md)
- [Reglas de Negocio](./reglas_negocio.md)
- [Seguridad y Permisos](./seguridad.md)
- [Auditoría](./auditoria.md)

## Estructura de la Base de Datos

### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| creado_en | DateTime | Sí | Fecha de creación |
| creado_por | UUID | No | Usuario que creó el registro |
| modificado_en | DateTime | No | Última modificación |
| modificado_por | UUID | No | Último usuario que modificó |
| anulado_en | DateTime | No | Fecha de anulación (soft delete) |
| anulado_por | UUID | No | Usuario que anuló el registro |

### Relaciones

- **relacion**: Descripción de la relación

## Uso del Modelo

### Creación

```typescript
// Ejemplo de creación
const modelo = await prisma.nombreModelo.create({
  data: {
    // campos requeridos
  }
});
```

### Consulta

```typescript
// Ejemplo de consulta
const modelos = await prisma.nombreModelo.findMany({
  where: {
    // condiciones
  },
  include: {
    // relaciones
  }
});
```

## Documentación Relacionada

- [API Endpoints](./endpoints/)
- [Flujos de Trabajo](./flujos/)
- [Integraciones](./integraciones/)
