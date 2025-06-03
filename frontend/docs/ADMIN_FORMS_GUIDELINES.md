# Guía de Implementación y Mejores Prácticas para Formularios Admin

## Introducción
Este documento describe los lineamientos estandarizados para la implementación de formularios administrativos en Neoptica-Intranet, asegurando consistencia visual, óptimo rendimiento y robustez en la interacción con el backend.

## Estructura Básica de un Módulo Admin

La estructura recomendada para cada módulo administrativo incluye:

```
admin/
└── [nombre-modulo]/
    ├── page.tsx            # Componente principal (tabla + formulario modal)
    └── components/         # Componentes específicos del módulo (opcional)
```

## Tabla con Modo Oscuro

### Implementación del CSS Oscuro

1. **Importación del CSS compartido**:
   ```tsx
   import "../shared/dark-table.css";
   ```

2. **Aplicación de la clase personalizada**:
   ```tsx
   <Table 
     className="custom-table"
     // otras props...
   />
   ```

### Estilo Unificado

El archivo `dark-table.css` proporciona estilos consistentes para todas las tablas en modo oscuro. No deben hacerse modificaciones directas a los estilos de tabla en los componentes individuales para mantener la coherencia visual.

```css
/* Ejemplo de estilos en dark-table.css */
.custom-table .ant-table {
  background-color: transparent;
  color: white;
}
.custom-table .ant-table-thead > tr > th {
  background-color: rgba(31, 41, 55, 0.7);
  color: white;
  border-bottom: 1px solid rgba(75, 85, 99, 0.5);
}
```

## Búsqueda y Paginación

### Implementación de Búsqueda

1. **Estado para el texto de búsqueda**:
   ```tsx
   const [searchText, setSearchText] = useState("");
   ```

2. **Manejo del cambio en el input de búsqueda**:
   ```tsx
   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setSearchText(e.target.value);
     setPage(1); // Importante: resetear la página al cambiar la búsqueda
   };
   ```

3. **Componente de búsqueda**:
   ```tsx
   <Input 
     placeholder="Buscar..." 
     prefix={<SearchOutlined />} 
     onChange={handleSearchChange} 
     className="mb-4"
   />
   ```

### Paginación Correcta

1. **Estados para la paginación**:
   ```tsx
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);
   const [total, setTotal] = useState(0);
   ```

2. **Efecto para cargar datos con paginación y búsqueda**:
   ```tsx
   useEffect(() => {
     fetchData();
   }, [page, pageSize, searchText]);
   ```

3. **Configuración del componente Table**:
   ```tsx
   <Table
     pagination={{
       current: page,
       pageSize: pageSize,
       total: total,
       onChange: (p, s) => {
         setPage(p);
         setPageSize(s);
       }
     }}
     // otras props...
   />
   ```

## Integración con Backend

### Servicios API

1. **Estructura de servicios**:
   ```typescript
   // Ejemplo de servicio paginado
   export async function getItemsPaginados(page: number = 1, pageSize: number = 10, searchTerm: string = '') {
     const searchParam = searchTerm ? `&searchText=${encodeURIComponent(searchTerm)}` : '';
     return fetchApi<PaginatedResponse<ItemType>>(`${BASE_ENDPOINT}/paginated?page=${page}&pageSize=${pageSize}${searchParam}`);
   }
   ```

2. **Parámetros estandarizados**:
   - El parámetro de búsqueda SIEMPRE debe ser `searchText` (no `search`, `query`, etc.)
   - La ruta para endpoints paginados SIEMPRE debe terminar en `/paginated`

## Formularios Modal

### Estructura Básica del Modal

```tsx
<Modal
  title={editingItem ? "Editar Item" : "Nuevo Item"}
  open={modalVisible}
  onCancel={handleCancel}
  footer={[
    <Button key="cancel" onClick={handleCancel}>
      Cancelar
    </Button>,
    <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
      {editingItem ? "Actualizar" : "Crear"}
    </Button>,
  ]}
>
  <Form form={form} layout="vertical">
    {/* Campos del formulario */}
  </Form>
</Modal>
```

### Validación de Formularios

Siempre incluir validaciones en el cliente que sean consistentes con las validaciones del backend:

```tsx
<Form.Item
  name="nombre"
  label="Nombre"
  rules={[
    { required: true, message: "Campo obligatorio" },
    { min: 3, message: "Mínimo 3 caracteres" },
    // Otras reglas según requiera el backend
  ]}
>
  <Input placeholder="Ingrese nombre..." />
</Form.Item>
```

## Mejores Prácticas

### Prevención de Errores

1. **No crear endpoints duplicados**: Verificar siempre que no existan rutas duplicadas en el backend.

2. **Consistencia en parámetros URL**: Usar siempre los mismos nombres de parámetros para funciones similares:
   - ✅ `searchText` (correcto)
   - ❌ `search`, `query`, `term` (incorrecto)

3. **Resetear paginación**: Siempre resetear a página 1 cuando se cambia el texto de búsqueda:
   ```tsx
   setSearchText(value);
   setPage(1); // Importante
   ```

4. **Manejo de errores**: Implementar siempre mensajes de error descriptivos:
   ```tsx
   try {
     // operación
   } catch (error) {
     message.error(error instanceof Error ? error.message : "Error desconocido");
     console.error("Error detallado:", error);
   }
   ```

5. **Evitar referencias a características no implementadas**: No incluir en la interfaz opciones o campos que no estén completamente implementados (como el caso de los logos).

### Rendimiento

1. **Debounce en búsquedas**: Para campos de búsqueda implementar debounce para evitar múltiples llamadas:
   ```tsx
   const debouncedSearch = useDebounce(searchText, 300);
   
   useEffect(() => {
     fetchData();
   }, [page, pageSize, debouncedSearch]);
   ```

2. **Limitar tamaño de respuestas**: Usar siempre paginación para evitar cargar grandes cantidades de datos.

## Extensibilidad

Al agregar nuevas características a formularios existentes:

1. Revisar su implementación en el backend primero
2. Confirmar que el modelo de datos soporte la nueva característica
3. Implementar servicios API estandarizados
4. Seguir el patrón de diseño UI establecido

## Lista de Verificación para Nuevos Formularios

- [ ] Importar CSS oscuro para tablas
- [ ] Implementar búsqueda con reseteo de página
- [ ] Configurar paginación correctamente
- [ ] Usar servicios API con parámetros estandarizados
- [ ] Implementar validaciones consistentes con el backend
- [ ] Manejar adecuadamente estados de carga y errores
- [ ] Evitar referencias a características no implementadas

## Implementación del Sistema Multi-Rol

La aplicación ahora soporta que un usuario tenga múltiples roles simultáneos. Al desarrollar formularios administrativos o cualquier funcionalidad, considere las siguientes directrices:

### Acceso al Rol Activo

1. **Obtención del rol activo**:
   ```tsx
   // CORRECTO: Usar activeRole en lugar de role
   const activeRole = localStorage.getItem('activeRole');
   
   // INCORRECTO: Ya no usar
   // const role = localStorage.getItem('role'); 
   ```

2. **Obtención de todos los roles disponibles**:
   ```tsx
   const roles = JSON.parse(localStorage.getItem('roles') || '[]');
   ```

3. **Verificación de permisos**:
   ```tsx
   // Verificar si el usuario tiene un rol activo específico
   if (localStorage.getItem('activeRole') === 'admin') {
     // Mostrar opciones de administrador
   }
   
   // Verificar si el usuario tiene un rol específico asignado (aunque no sea el activo)
   const roles = JSON.parse(localStorage.getItem('roles') || '[]');
   if (roles.includes('optometrista')) {
     // El usuario tiene el rol de optometrista asignado
   }
   ```

4. **Implementación de interfaces adaptativas**:
   - Adaptar la interfaz según el rol activo, no según todos los roles disponibles
   - Para interfaces que muestran permisos disponibles, considerar mostrar opciones para cambiar de rol

### Consideraciones de Auditoría

Al implementar auditoría con múltiples roles, asegúrarse de:

- Registrar el rol activo que realiza cada acción, no solo el usuario
- Mantener consistencia en la auditoría cuando un mismo usuario cambia entre roles

## Implementación de Auditoría

Recordar que todos los controladores deben implementar auditoría según se estableció en el sistema:

- Registro de usuario que realiza cada acción
- Tracking de IP y timestamp
- Captura de operación realizada (crear, actualizar, eliminar)
- Entidad afectada y su ID
- Registro de operaciones fallidas también
