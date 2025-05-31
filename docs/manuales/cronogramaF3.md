# Checklist de Cierre — Fase 3: Productos e Inventario

### A. Funcionalidad y Validaciones
- [ ] El CRUD de productos funciona correctamente (crear, leer, actualizar, eliminar).
- [ ] El CRUD de inventario funciona correctamente para la sucursal única.
- [ ] Todos los movimientos de inventario (ingresos, salidas, ajustes) están implementados y validados.
- [ ] No es posible registrar stock negativo ni duplicados de inventario por producto/color/marca.
- [ ] El manejo de adjuntos (imágenes/PDF) en inventario funciona (carga, descarga, eliminación, validación de tamaño y formato).
- [ ] El sistema previene operaciones inválidas y muestra mensajes de error claros al usuario.

### B. Auditoría y Logs
- [ ] Todas las operaciones relevantes (CRUD, movimientos, adjuntos) quedan registradas en el log de auditoría.
- [ ] Los registros de auditoría incluyen usuario, acción, entidad, fecha/hora y resultado.
- [ ] Los logs funcionan correctamente en entornos de desarrollo y pruebas.

### C. Pruebas Unitarias y de Integración
- [ ] Existen al menos **70 pruebas unitarias** cubriendo los casos principales y bordes de inventario y productos.
- [ ] Las pruebas incluyen casos positivos y negativos (validaciones, errores, concurrencia).
- [ ] Todas las pruebas pasan sin errores ni warnings.
- [ ] La cobertura de código de inventario y productos es ≥ 90% (si aplica reporte de cobertura).

### D. Documentación Técnica
- [ ] La documentación de endpoints REST (Swagger/OpenAPI) está actualizada y refleja el modelo de sucursal única.
- [ ] Los diagramas de flujo y modelos de datos NO incluyen transferencias entre sucursales.
- [ ] Se han eliminado o marcado como futuras las referencias a transferencias en la documentación.
- [ ] El README y manuales técnicos reflejan el alcance actualizado.

### E. Calidad y Entregables
- [ ] El código pasa el linting y sigue las convenciones del proyecto.
- [ ] No hay código muerto, duplicado ni referencias a transferencias.
- [ ] Los entregables de la fase (productos, inventario, adjuntos, logs, pruebas, documentación) están completos y validados.
- [ ] El equipo ha revisado y validado el checklist antes de cerrar la fase.
