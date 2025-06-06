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

## Formularios con Pestañas

### Estructura de Formularios Complejos

Para formularios con múltiples secciones, utilizar el componente `Tabs` de Ant Design:

```tsx
<Modal
  title={
    <div className="flex items-center gap-2">
      {formLoading ? <LoadingOutlined /> : <UserOutlined />}
      <span>{editingItem ? 'Editar Item' : 'Nuevo Item'}</span>
    </div>
  }
  open={modalVisible}
  onCancel={handleCancel}
  footer={[
    <Button key="back" onClick={handleCancel} disabled={formLoading}>
      Cancelar
    </Button>,
    <Button 
      key="submit" 
      type="primary" 
      onClick={handleSubmit} 
      loading={loading}
      disabled={formLoading}
    >
      {editingItem ? "Actualizar" : "Crear"}
    </Button>,
  ]}
  width={800}
  maskClosable={!formLoading}
  keyboard={!formLoading}
  className="form-modal"
>
  <Spin spinning={formLoading} tip="Cargando datos...">
    <Form form={form} layout="vertical">
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: '1',
            label: (
              <span>
                <UserOutlined />
                <span>Información Básica</span>
              </span>
            ),
            children: <BasicInfoTab />
          },
          {
            key: '2',
            label: (
              <span>
                <SafetyCertificateOutlined />
                <span>Seguridad</span>
              </span>
            ),
            children: <SecurityTab />
          },
        ]}
      />
    </Form>
  </Spin>
</Modal>
```

### Mejores Prácticas para Formularios con Pestañas

1. **Carga por Pestaña**:
   - Cargar datos específicos de cada pestaña solo cuando se accede a ella
   - Usar `destroyInactiveTabPane` para optimizar el rendimiento

2. **Validación entre Pestañas**:
   - Validar los datos de la pestaña actual antes de permitir el cambio
   - Mostrar indicadores visuales en las pestañas con errores

3. **Guardado Parcial**:
   - Implementar autoguardado en pestañas individuales
   - Mostrar estado de guardado para cada sección

### Validación Mejorada de Formularios

#### Validación en Tiempo Real

```tsx
<Form.Item
  name="email"
  label="Correo Electrónico"
  rules={[
    { 
      required: true, 
      message: 'Por favor ingrese su correo electrónico' 
    },
    { 
      type: 'email', 
      message: 'Ingrese un correo electrónico válido',
      validateTrigger: 'onBlur' 
    },
    // Validación asíncrona para verificar disponibilidad
    {
      validator: async (_, value) => {
        if (value) {
          const isAvailable = await checkEmailAvailability(value);
          if (!isAvailable) {
            throw new Error('Este correo ya está en uso');
          }
        }
      },
      validateTrigger: 'onBlur'
    }
  ]}
  hasFeedback
  validateFirst
>
  <Input 
    prefix={<MailOutlined />}
    placeholder="ejemplo@dominio.com"
    disabled={formLoading}
  />
</Form.Item>
```

#### Validación Cruzada entre Campos

```tsx
// En el nivel del formulario
<Form
  form={form}
  onFinish={onFinish}
  onValuesChange={(changedValues, allValues) => {
    // Validar cuando cambian campos relacionados
    if ('password' in changedValues || 'confirmPassword' in changedValues) {
      if (allValues.password && allValues.confirmPassword) {
        form.validateFields(['confirmPassword']);
      }
    }
  }}
>
  <Form.Item
    name="password"
    label="Contraseña"
    rules={[
      { required: true, message: 'Por favor ingrese una contraseña' },
      { min: 8, message: 'Mínimo 8 caracteres' },
    ]}
  >
    <Input.Password />
  </Form.Item>

  <Form.Item
    name="confirmPassword"
    label="Confirmar Contraseña"
    dependencies={['password']}
    rules={[
      { required: true, message: 'Por favor confirme su contraseña' },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Las contraseñas no coinciden'));
        },
      }),
    ]}
  >
    <Input.Password />
  </Form.Item>
</Form>
```

## Mejores Prácticas Mejoradas

### 1. Mejoras en la Experiencia de Usuario

#### Indicadores de Carga Mejorados

```tsx
// Botón con estado de carga
<Button
  type="primary"
  loading={isSubmitting}
  icon={isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
  onClick={handleSubmit}
  disabled={isSubmitting}
>
  {isSubmitting ? 'Guardando...' : 'Guardar'}
</Button>

// Esqueleto de carga para formularios
const FormSkeleton = () => (
  <div className="space-y-4">
    <Skeleton.Input active className="w-full" />
    <Skeleton.Input active className="w-3/4" />
    <Skeleton.Input active className="w-1/2" />
  </div>
);

// Uso en el componente
<Modal>
  {isLoading ? (
    <FormSkeleton />
  ) : (
    <Form>
      {/* Campos del formulario */}
    </Form>
  )}
</Modal>
```

#### Retroalimentación Visual Mejorada

```tsx
// Mostrar notificaciones contextuales
const showSuccess = (message: string) => {
  notification.success({
    message: 'Éxito',
    description: message,
    placement: 'topRight',
    duration: 3,
  });
};

// Mostrar errores de validación de forma destacada
<Form.Item
  name="username"
  label="Nombre de usuario"
  validateStatus={errors.username ? 'error' : ''}
  help={errors.username?.message}
  hasFeedback
>
  <Input />
</Form.Item>
```

### 2. Prevención de Errores

1. **Validación de Formularios**:
   - Validar en el cliente antes de enviar al servidor
   - Mostrar mensajes de error claros y específicos
   - Resaltar visualmente los campos con errores

2. **Manejo de Errores Mejorado**:
   ```tsx
   try {
     setSubmitting(true);
     const response = await api.saveData(formData);
     showSuccess('Datos guardados correctamente');
     onSuccess?.(response);
   } catch (error) {
     if (error.response?.status === 400) {
       // Mostrar errores de validación del servidor
       const { errors } = error.response.data;
       Object.entries(errors).forEach(([field, message]) => {
         form.setFields([{ name: field, errors: [message] }]);
       });
     } else {
       // Mostrar error genérico
       message.error(
         error.response?.data?.message || 
         'Ocurrió un error al procesar su solicitud'
       );
     }
   } finally {
     setSubmitting(false);
   }
   ```

3. **Consistencia en la API**:
   - Usar `searchText` para búsquedas
   - Usar `page` y `pageSize` para paginación
   - Mantener nombres de parámetros consistentes en toda la aplicación

4. **Optimización de Rendimiento**:
   - Usar `useCallback` para manejadores de eventos
   - Usar `useMemo` para valores calculados costosos
   - Implementar carga perezosa de componentes con `React.lazy`
   - Usar `React.memo` para componentes que no necesitan re-renderizarse frecuentemente

5. **Accesibilidad**:
   - Usar etiquetas `label` para todos los campos de formulario
   - Asegurar que los controles sean accesibles por teclado
   - Proporcionar texto alternativo para imágenes
   - Usar contraste adecuado para texto y fondos

6. **Pruebas**:
   - Escribir pruebas unitarias para componentes críticos
   - Probar diferentes casos de uso y flujos de usuario
   - Verificar el manejo de errores y casos extremos

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
- [ ] Asegurar responsividad para dispositivos móviles (landscape y portrait)
- [ ] Usar componentes responsive (`ResponsiveTable` en lugar de `Table` o `CustomTable`)

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

## Responsividad y Diseño Móvil

La aplicación debe funcionar correctamente en todos los dispositivos y orientaciones. Seguir estas pautas:

### Menú Móvil

1. **Uso del MobileSidebar**:
   - El menú debe cerrarse automáticamente cuando:
     - El usuario cambia de ruta
     - Cambia la orientación del dispositivo (landscape/portrait)
     - La pantalla se redimensiona a tamaño desktop (>= 768px)
     - El usuario presiona la tecla Escape
     - Se hace clic fuera del menú

2. **Manejo de scroll**:
   ```tsx
   useEffect(() => {
     if (isOpen) {
       // Bloquear scroll cuando el menú está abierto
       document.body.style.overflow = 'hidden';
       document.body.style.position = 'fixed';
       document.body.style.width = '100%';
     } else {
       // Restaurar cuando se cierra
       document.body.style.overflow = '';
       document.body.style.position = '';
       document.body.style.width = '';
     }
   }, [isOpen]);
   ```

3. **Detección de cambios de orientación**:
   ```tsx
   // Para todos los tamaños de pantalla, incluyendo tamaños específicos como
   // 915x412, 896x414, 884x390, 932x430, 882x344
   const orientationMediaQuery = window.matchMedia('(orientation: landscape)');
   orientationMediaQuery.addEventListener('change', handleOrientationChange);
   ```

### Tablas Responsivas

1. **Usar componente `ResponsiveTable`**:
   - Siempre utilizar este componente en lugar de `Table` o `CustomTable`
   - Proporciona vista de tarjetas en móviles (<991px) y tabla tradicional en desktop

2. **Pruebas en múltiples dispositivos**:
   - Verificar funcionamiento en orientaciones vertical y horizontal
   - Probar en las dimensiones comunes: 740x360, 667x375, 915x412, 896x414, 884x390, 932x430, 882x344

3. **Estilos adaptativos**:
   ```tsx
   const mobileStyles = {
     card: {
       backgroundColor: 'rgba(31, 41, 55, 0.5)',
       borderRadius: '0.5rem',
       marginBottom: '0.75rem',
       padding: '0.75rem',
       boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
       border: '1px solid rgba(75, 85, 99, 0.2)'
     }
   };
   ```
