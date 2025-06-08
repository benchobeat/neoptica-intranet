# Gestión de Migraciones

## Modelo de Datos

### 1. Migración (`db_migrations`)
Registra las migraciones de base de datos aplicadas al sistema.

#### Campos:
- **id**: Identificador único (UUID)
- **nombre**: Nombre del archivo de migración
- **aplicada_en**: Fecha y hora en que se aplicó la migración
- **exitoso**: Indica si la migración se aplicó correctamente
- **checksum**: Hash para verificar la integridad del archivo de migración
- **duracion_ms**: Tiempo que tomó aplicar la migración en milisegundos
- **version**: Versión del esquema después de aplicar la migración

## Flujo de Trabajo

### 1. Creación de Migraciones
1. Las migraciones se generan automáticamente usando Prisma
2. Cada migración debe ser descriptiva y atómica
3. Incluir tanto las operaciones UP como DOWN

### 2. Aplicación de Migraciones
1. Las migraciones se aplican en orden secuencial
2. Se registra cada migración aplicada en la tabla `db_migrations`
3. Se verifica el checksum de cada migración

### 3. Reversión de Migraciones
1. Las migraciones pueden revertirse usando el comando correspondiente
2. Se registra la reversión en la tabla de migraciones

## Buenas Prácticas

### 1. Convenciones de Nombrado
- Usar formato: `YYYYMMDDHHMMSS_nombre_descriptivo`
- Usar snake_case para los nombres de migración

### 2. Manejo de Datos
- Incluir seed data esencial cuando sea necesario
- Usar transacciones para operaciones que modifican datos

### 3. Seguridad
- No incluir datos sensibles en las migraciones
- Revisar las migraciones antes de aplicar a producción

## Comandos Útiles

```bash
# Crear una nueva migración
npx prisma migrate dev --name nombre_de_la_migracion

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Revertir la última migración
npx prisma migrate resolve --rolled-back nombre_de_la_migracion
```

## Monitoreo

### 1. Estado Actual
```sql
SELECT * FROM db_migrations 
WHERE exitoso = true
ORDER BY aplicada_en DESC;
```

### 2. Migraciones Fallidas
```sql
SELECT * FROM db_migrations 
WHERE exitoso = false
ORDER BY aplicada_en DESC;
```
