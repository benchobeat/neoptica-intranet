# Módulo de Gestión de Archivos Adjuntos

## **1. Modelo de Datos**

### 1.1 Archivo Adjunto (`archivo_adjunto`)
Almacena los metadatos de los archivos subidos al sistema.

**Campos:**
- **id**: Identificador único (UUID)
- **nombre_archivo**: Nombre original del archivo
- **url**: Ruta o URL donde se almacena el archivo
- **tipo**: Tipo MIME del archivo (opcional)
- **tamanio**: Tamaño del archivo en bytes (opcional)
- **extension**: Extensión del archivo (ej: pdf, jpg, png)
- **subido_por**: ID del usuario que subió el archivo
- **creado_en**: Fecha de creación del registro
- **creado_por**: ID del usuario que creó el registro
- **modificado_en**: Fecha de última modificación
- **modificado_por**: ID del usuario que modificó por última vez
- **anulado_en**: Fecha de anulación (soft delete)
- **anulado_por**: ID del usuario que anuló el registro

**Relaciones:**
- `usuario`: Relación con el usuario que subió el archivo
- `archivo_entidad`: Relación con las entidades asociadas al archivo
- `descanso_empleado`: Relación con los descansos de empleado
- `factura`: Relación con facturas (PDF y XML)

### 1.2 Archivo Entidad (`archivo_entidad`)
Tabla de unión polimórfica que relaciona archivos con entidades del sistema.

**Campos:**
- **id**: Identificador único (UUID)
- **archivo_id**: ID del archivo adjunto
- **entidad_tipo**: Tipo de entidad relacionada (ej: 'USUARIO', 'FACTURA')
- **entidad_id**: ID de la entidad relacionada (UUID)
- **fecha_vinculo**: Fecha de vinculación del archivo a la entidad
- **creado_en**: Fecha de creación del registro
- **creado_por**: ID del usuario que creó el registro
- **modificado_en**: Fecha de última modificación
- **modificado_por**: ID del usuario que modificó por última vez
- **anulado_en**: Fecha de anulación (soft delete)
- **anulado_por**: ID del usuario que anuló el registro

**Índices:**
- Índice único compuesto: (archivo_id, entidad_tipo, entidad_id)
- Índice para búsquedas: (entidad_tipo, entidad_id)

**Relaciones:**
- `archivo_adjunto`: Relación con el archivo adjunto

## **2. Flujos de Trabajo**

### 2.1 Carga de Archivos
1. El usuario selecciona uno o más archivos para adjuntar
2. El sistema valida el tipo y tamaño del archivo según políticas configuradas
3. Se guarda el archivo en el almacenamiento designado (local, S3, etc.)
4. Se crea un registro en `archivo_adjunto` con los metadatos
5. Se crea un registro en `archivo_entidad` vinculando el archivo a la entidad destino
6. Se registra la acción en el log de auditoría

### 2.2 Visualización de Archivos
1. El sistema verifica los permisos del usuario para acceder a la entidad relacionada
2. Se consultan los archivos asociados a través de `archivo_entidad`
3. Se muestran los metadatos de los archivos disponibles
4. El usuario puede visualizar o descargar los archivos según sus permisos

## **3. Seguridad y Permisos**

- **Control de Acceso**: Solo usuarios autenticados pueden subir archivos
- **Validación de Tipo**: Se aplican restricciones según el tipo de archivo
- **Registro de Auditoría**: Todas las operaciones quedan registradas
- **Eliminación Segura**: Los archivos no se eliminan físicamente, se marcan como anulados

## **4. Integración con Otros Módulos**

### 4.1 Facturación
- Almacenamiento de facturas electrónicas (XML)
- Generación de PDF de facturas
- Documentos adjuntos a facturas

### 4.2 Recursos Humanos
- Documentación de empleados
- Justificantes de incidencias
- Documentos legales

### 4.3 Clínica
- Historiales clínicos
- Recetas médicas
- Estudios de laboratorio

## **5. API y Endpoints**

### 5.1 Subir Archivo
```
POST /api/archivos/subir
```

**Parámetros:**
- `archivo`: Archivo a subir (multipart/form-data)
- `entidad_tipo`: Tipo de entidad destino
- `entidad_id`: ID de la entidad destino
- `descripcion`: Descripción opcional

### 5.2 Listar Archivos de una Entidad
```
GET /api/archivos/entidad/{tipo}/{id}
```

**Parámetros de ruta:**
- `tipo`: Tipo de entidad
- `id`: ID de la entidad

### 5.3 Descargar Archivo
```
GET /api/archivos/descargar/{id}
```

**Parámetros de ruta:**
- `id`: ID del archivo a descargar

## **6. Mejoras Futuras**

- Compresión automática de imágenes
- Procesamiento por lotes de archivos
- Integración con servicios de reconocimiento de texto (OCR)
- Búsqueda semántica en documentos
- Versiones de documentos
- Firma electrónica avanzada

## **B. Flujos de Usuario**

- **Carga de Adjuntos:**
    - Al crear o editar un registro (ej: cita, descanso, pedido, movimiento, historial clínico), el usuario puede adjuntar uno o varios archivos.
    - El sistema valida tipo y tamaño de archivo (según reglas de negocio, por ejemplo: PDF, JPG, PNG, XML; límite configurable).
    - Cada adjunto queda relacionado con la entidad, con registro de usuario, fecha y tipo de archivo.
    - Se puede asociar más de un archivo a una misma entidad, y cada adjunto puede tener historial/versiones.

- **Visualización y Descarga:**
    - En la ficha de cualquier entidad, se listan los adjuntos con nombre, tipo, tamaño, usuario y fecha de subida.
    - El usuario autorizado puede descargar, visualizar (previsualización en navegador si el tipo lo permite) o consultar la versión anterior si existiera.
    - El sistema muestra advertencia si el archivo fue reemplazado/anulado, con opción de ver historial.

- **Reemplazo y Versionado:**
    - Al reemplazar un archivo (ej: nueva versión de diagnóstico o justificativo), el anterior queda en estado “histórico”, sólo visible para consulta y auditoría.
    - Cada versión nueva incrementa el número de versión y registra usuario, fecha y motivo si aplica.

- **Seguridad y Permisos:**
    - Sólo usuarios autorizados según rol y permisos pueden cargar, visualizar o descargar adjuntos.
    - El sistema valida siempre la asociación polimórfica antes de permitir acceso (ej: un optometrista sólo puede ver archivos de pacientes atendidos).
    - Todo acceso, descarga, reemplazo o eliminación queda registrado en logs de auditoría (`log_auditoria`).

- **Acceso desde múltiples módulos:**
    - El componente de adjuntos se reutiliza en pedidos, facturas, movimientos, citas, descansos, historial clínico, plan de cuentas y cualquier módulo donde se requiera evidencia documental o soporte legal.

## **C. Ejemplo de Wireframe Textual**
| ADJUNTOS DEL PEDIDO #000245 					|
| Nombre | Tipo | Tamaño | Fecha | Versión | [Descargar] [Ver] 	|
| Factura245.pdf | PDF | 430KB | 13/07/2024 | 1 | [↓] [👁️] 		|
| Diagnóstico.jpg| JPG | 240KB | 12/07/2024 | 2 | [↓] [👁️] 		|
| Factura245.xml | XML | 12KB | 13/07/2024 | 1 | [↓] [👁️] 		|
| [Subir Nuevo Adjunto] [Reemplazar][Ver Historial] 			|
| [⚠️] Este archivo fue reemplazado el 14/07/2024 			|
| Motivo: Corrección de datos fiscales 					|


## **D. Logs y Auditoría de Adjuntos**

- Cada acción sobre un archivo (subida, descarga, reemplazo, eliminación, visualización) queda registrada en logs de auditoría con usuario, fecha/hora, tipo de acción y entidad asociada.
- El panel de logs permite consultar todas las acciones sobre adjuntos, filtrando por usuario, entidad, fecha, tipo y estado.

## **E. Reporting y Exportación**

- Paneles administrativos permiten consultar y exportar el historial de adjuntos por módulo, usuario, tipo, fecha o entidad asociada.
- Soporte para auditoría legal/fiscal: evidencia documental disponible para descarga y consulta rápida.

## **F. Integridad y Respaldo**

- Todos los archivos se almacenan en servicios cloud seguros, con respaldos automáticos y redundancia.
- Los metadatos y vínculos polimórficos están protegidos por restricciones y validaciones en la base de datos.

