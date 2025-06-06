# Frontend de Neóptica-Intranet

## Descripción General

Este proyecto constituye el frontend de la intranet de Neóptica, desarrollado con Next.js 14 y App Router. Está diseñado para proporcionar interfaces específicas para diferentes roles de usuario (administrador, vendedor, optometrista y cliente), con un enfoque en la usabilidad, seguridad y experiencia de usuario moderna.

## Tecnologías Principales

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: Ant Design + Componentes personalizados
- **Iconos**: Lucide React
- **Autenticación**: JWT + OAuth (Google, Facebook)

## Estructura del Proyecto

### Organización de Carpetas

El proyecto sigue la arquitectura de App Router de Next.js con carpetas organizadas por rutas y roles:

```
src/
├── app/                # Rutas principales (App Router)
│   ├── cliente/        # Dashboard y páginas para clientes
│   ├── dashboard/      # Dashboard para administradores
│   ├── optometrista/   # Dashboard para optometristas
│   ├── vendedor/       # Dashboard para vendedores
│   ├── layout.tsx      # Layout principal de la aplicación
│   └── page.tsx        # Página de inicio (Login)
├── components/         # Componentes reutilizables
│   └── dashboard/      # Componentes específicos para dashboards
├── lib/                # Utilidades, hooks y lógica de negocio
└── types/              # Definiciones de tipos TypeScript
```

### Rutas y Navegación

La aplicación implementa un sistema de navegación basado en roles:

- **/**: Página de inicio de sesión (pública)
- **/dashboard**: Dashboard para administradores
- **/vendedor**: Dashboard para vendedores
- **/optometrista**: Dashboard para optometristas
- **/cliente**: Dashboard para clientes
- **/admin/brands**: Administración de marcas
- **/admin/colors**: Administración de colores
- **/admin/branches**: Administración de sucursales

## Autenticación y Control de Acceso

### Flujo de Autenticación

1. El usuario inicia sesión en la página principal mediante credenciales (email/contraseña) o proveedores OAuth.
2. El backend valida las credenciales y devuelve un token JWT junto con la información del usuario, incluyendo sus roles (array).
3. La aplicación guarda el array de roles en localStorage como `roles` y selecciona el primer rol como `activeRole`.
4. Basado en el rol activo del usuario, la aplicación redirecciona al dashboard correspondiente.
5. El token JWT y la información de roles se almacenan en localStorage para mantener la sesión activa.

### Sistema Multi-Rol

La aplicación implementa un sistema avanzado de gestión multi-rol que permite:

1. **Asignación de múltiples roles**: Un usuario puede tener asignados varios roles simultáneamente (ej. vendedor y optometrista).
2. **Selector de rol activo**: En el menú lateral, los usuarios con múltiples roles pueden cambiar entre ellos sin necesidad de cerrar sesión.
3. **Persistencia del rol activo**: El sistema recuerda el último rol utilizado por el usuario mediante `localStorage`.
4. **Redireccionamiento inteligente**: Al cambiar de rol, el sistema redirecciona automáticamente al dashboard correspondiente.

### Roles de Usuario

- **Admin**: Acceso completo a todas las funcionalidades del sistema.
- **Vendedor**: Gestión de ventas, clientes y productos.
- **Optometrista**: Gestión de recetas y consultas de pacientes.
- **Cliente**: Visualización de historial, compras y perfil personal.

## Componentes UI

### Componentes Base Reutilizables

- **FormModal**: Componente de formulario modal con pestañas integradas
- **LoadingButton**: Botón con estados de carga integrados
- **FormTabs**: Sistema de pestañas para formularios complejos
- **AsyncSelect**: Selector con carga asíncrona y búsqueda
- **Card**: Contenedor base con estilo consistente para todas las secciones
- **Button**: Botón personalizable con variantes (primary, secondary, danger)
- **Input**: Campo de entrada estilizado con validación
- **Select**: Selector desplegable personalizado
- **Label**: Etiqueta para formularios

### Mejoras en Formularios

- **Validación en tiempo real** con mensajes claros
- **Guardado automático** en campos no sensibles
- **Deshabilitación inteligente** de controles durante operaciones
- **Retroalimentación visual** durante acciones asíncronas
- **Organización por pestañas** para formularios complejos

### Componentes de Layout

- **Sidebar**: Menú lateral con navegación principal, adapta su contenido según el rol.
- **Header**: Cabecera con búsqueda, notificaciones y perfil de usuario.
- **DashboardSkeleton**: Estructura base para todas las páginas de dashboard.

## Centralización del Diseño y Consistencia UI

Mantener una interfaz de usuario (UI) coherente y unificada es crucial para la usabilidad y la experiencia del usuario en Neóptica Intranet. Esta sección describe el enfoque para centralizar el diseño y las recomendaciones a seguir.

### Componente `CustomTable`

Para estandarizar la apariencia y funcionalidad de las tablas de datos, que son un elemento central en las páginas administrativas, se ha creado el componente reutilizable `CustomTable`.

-   **Ubicación**: `src/components/ui/CustomTable.tsx`
-   **Propósito**:
    -   Encapsula la `Table` de Ant Design, proporcionando una capa de abstracción.
    -   Ofrece una cabecera configurable estándar que incluye: título de la tabla, campo de búsqueda integrado y botón para "Añadir Nuevo" registro.
    -   Centraliza los estilos y comportamientos comunes de las tablas, incluyendo la paginación y la gestión del estado de carga.
-   **Beneficios**:
    -   Reduce significativamente la duplicación de código en las páginas CRUD (Create, Read, Update, Delete).
    -   Asegura una apariencia y experiencia consistentes en todas las tablas del sistema.
    -   Facilita futuras actualizaciones y mantenimiento del diseño de las tablas.
-   **Uso**: Al implementar nuevas páginas con listados de datos o al refactorizar existentes, se **debe** utilizar `CustomTable` en lugar de la `Table` de Ant Design directamente. Consultar la definición del componente para conocer las `props` disponibles (ej. `columns`, `dataSource`, `loading`, `totalRecords`, `paginationConfig`, `headerTitle`, `showAddButton`, `onAddButtonClick`, `showSearch`, `onSearch`).

### Recomendaciones Generales de Diseño

Para asegurar la consistencia visual y funcional en toda la aplicación, se deben seguir las siguientes recomendaciones:

1.  **Tema Global (Dark Mode)**:
    -   Adherirse estrictamente al tema oscuro implementado. Utilizar los colores de fondo, texto y acentos definidos en Tailwind CSS y en los componentes de Ant Design configurados para el tema oscuro.
    -   Evitar la introducción de nuevos esquemas de colores sin una justificación clara y aprobación.

2.  **Layout de Página Estándar**:
    -   Las páginas principales de contenido deben seguir una estructura de layout consistente. Por ejemplo, el contenedor principal de las páginas de administración utiliza clases como `p-4 md:p-6 bg-gray-900 min-h-screen`.
    -   Utilizar los componentes de layout `Sidebar` y `Header` para la estructura general de las páginas de dashboard.

3.  **Formularios y Modales**:
    -   Para la creación y edición de datos, utilizar los modales de Ant Design (`Modal`) con el componente `Form` de Ant Design.
    -   Configurar los formularios con `layout="vertical"` para una presentación clara.
    -   Implementar validaciones robustas y mensajes de error descriptivos.
    -   El pie de página de los modales (botones de "Guardar", "Cancelar") debe ser consistente.

4.  **Botones e Inputs**:
    -   Utilizar las variantes estándar de los botones de Ant Design (`primary`, `default`, `danger`, `ghost`) y los estilos personalizados definidos para inputs, asegurando una apariencia uniforme.
    -   Aplicar `Tooltip` para botones de acción icónicos para mejorar la usabilidad.

5.  **Iconografía**:
    -   Utilizar preferentemente iconos de `Lucide React` y los iconos incorporados de `Ant Design` para mantener la consistencia visual.
    -   Asegurar que los iconos sean semánticamente correctos y se usen de manera consistente para acciones similares (ej. `EditOutlined` para editar, `DeleteOutlined` para eliminar).

6.  **Componentes Reutilizables**:
    -   Priorizar la creación y uso de componentes UI reutilizables (ubicados en `src/components/ui/` o `src/components/common/`) en lugar de estilos en línea o soluciones específicas para una sola página.
    -   Antes de crear un nuevo componente, verificar si ya existe uno similar que pueda ser adaptado o extendido.

7.  **Responsividad y Accesibilidad**:
    -   Asegurar que todos los nuevos diseños y componentes sean responsivos y se visualicen correctamente en diferentes tamaños de pantalla.
    -   Considerar la accesibilidad (normas WCAG) al diseñar interfaces, incluyendo el contraste de color, la navegación por teclado y el uso de atributos ARIA cuando sea necesario.

8.  **Documentación de Componentes**:
    -   Documentar brevemente el propósito y las `props` de los nuevos componentes reutilizables.

Al seguir estas directrices, contribuimos a una aplicación más mantenible, escalable y con una experiencia de usuario profesional y coherente.

**Nota sobre `ADMIN_FORMS_GUIDELINES.md`**: La guía existente en `docs/ADMIN_FORMS_GUIDELINES.md` debe ser revisada y actualizada para reflejar el uso de `CustomTable` y las directrices de diseño centralizadas aquí descritas, especialmente en lo referente a estilos de tablas y componentes.

## Menú Principal de Administrador

El dashboard de administrador está organizado en las siguientes secciones principales:

1. **Dashboard**: Vista general con KPIs y resumen de actividad.
2. **Inventario**:
   - Movimientos (ingresos, salidas, ajustes)
   - Adjuntos de inventario
   - Transferencias entre sucursales
3. **Productos**:
   - Catálogo de productos
   - Colores
   - Marcas
   - Categorías
4. **Sucursales**: Gestión de sucursales y reportes por sucursal.
5. **Usuarios y Roles**: Administración de usuarios, roles y permisos.
6. **Clientes**: Gestión de clientes e historial de compras.
7. **Pedidos y Ventas**: Gestión de pedidos, estados y facturación.
8. **Reportes y Auditoría**: Logs del sistema y auditoría de operaciones.
9. **Configuración**: Ajustes del sistema, variables de entorno e integraciones.
10. **Soporte y Ayuda**: Documentación y soporte técnico.

## Integración con Backend

### Endpoints Principales

La aplicación frontend se comunica con el backend a través de los siguientes endpoints principales:

- **Autenticación**: `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- **Usuarios**: `/api/usuarios`
- **Productos**: `/api/productos`, `/api/colores`, `/api/marcas`
- **Inventario**: `/api/inventario`, `/api/inventario/:id/adjuntos`
- **Sucursales**: `/api/sucursales`

### Manejo de Errores

Los errores de API se manejan de forma consistente:

1. Errores de autenticación (401): Redirección al login
2. Errores de permisos (403): Mensaje con explicación
3. Errores de validación (400): Feedback en formularios
4. Errores de servidor (500): Notificación genérica y log

## Módulos Implementados

### Módulo Admin

Se han implementado los siguientes formularios administrativos:

1. **Administración de Marcas**
   - Tabla con paginación y búsqueda
   - Modal para creación/edición con validaciones
   - Soporte para eliminación (soft delete)
   - Integración con backend `/api/marcas/paginated`

2. **Administración de Colores**
   - Tabla con paginación y búsqueda
   - Visualización de muestras de color con código hexadecimal
   - Modal para creación/edición con validaciones
   - Tooltips para mejorar la experiencia de usuario
   - Integración con backend `/api/colores/paginated`

3. **Administración de Sucursales**
   - Tabla con paginación y búsqueda
   - Modal para creación/edición con validaciones
   - Validaciones para formatos de teléfono y email
   - Integración con backend `/api/sucursales/paginated`

### Servicios API

Se han implementado servicios API estandarizados para interactuar con el backend:

- **marcaService**: Servicios para consumir la API de marcas
- **colorService**: Servicios para consumir la API de colores
- **sucursalService**: Servicios para consumir la API de sucursales

Todos los servicios implementan operaciones CRUD y soporte para paginación y búsqueda.

### Documentación Especializada

- **[ADMIN_FORMS_GUIDELINES.md](docs/ADMIN_FORMS_GUIDELINES.md)**: Guía detallada de lineamientos y mejores prácticas para la implementación de formularios administrativos, incluyendo:
  - Estilos CSS para tablas en modo oscuro
  - Implementación de búsqueda y paginación
  - Estructura de servicios API
  - Diseño y validación de formularios modales
  - Manejo de estados y rendimiento
  - Recomendaciones para extensibilidad y auditoría

## Convenciones y Buenas Prácticas

### Patrones de Diseño

- **Componentes funcionales**: Todos los componentes son funcionales con hooks.
- **Props tipadas**: Uso exhaustivo de TypeScript para todas las props.
- **Componentes modulares**: Componentes pequeños y reutilizables.
- **Separación de responsabilidades**: UI separada de lógica de negocio.

### Convenciones de Nomenclatura

- **Archivos de componentes**: PascalCase.tsx
- **Archivos de utilidades**: camelCase.ts
- **Clases CSS personalizadas**: kebab-case
- **Funciones y variables**: camelCase
- **Tipos e interfaces**: PascalCase

## Lineamientos para prevenir errores comunes

Esta guía está diseñada para evitar los problemas más frecuentes encontrados durante el desarrollo, especialmente relacionados con React Hooks, TypeScript y configuración del proyecto.

### Reglas para uso correcto de React Hooks

1. **Posicionamiento de Hooks**
   - ❌ **NUNCA declarar hooks dentro de JSX/renderizado**
     ```jsx
     // ❌ MAL: Hook dentro del JSX
     return (
       <div>
         {useMemo(() => <Footer />, [])}
       </div>
     );
     
     // ✅ CORRECTO: Hook declarado fuera del JSX
     const memoizedFooter = useMemo(() => <Footer />, []);
     return (
       <div>
         {memoizedFooter}
       </div>
     );
     ```
   - ❌ **NUNCA usar hooks dentro de condicionales o loops**
     ```jsx
     // ❌ MAL: Hook dentro de condicional
     if (condition) {
       useEffect(() => { /* ... */ }, []);
     }
     
     // ✅ CORRECTO: Condicional dentro del hook
     useEffect(() => {
       if (condition) {
         // Lógica condicional aquí
       }
     }, [condition]);
     ```

2. **Arrays de dependencias**
   - ✅ **SIEMPRE incluir todas las dependencias usadas dentro del hook**
     ```jsx
     // ❌ MAL: Dependencia faltante (showModal)
     const handleDelete = useCallback(() => {
       showModal();
       deleteItem(id);
     }, [id]); // showModal falta en el array
     
     // ✅ CORRECTO: Todas las dependencias incluidas
     const handleDelete = useCallback(() => {
       showModal();
       deleteItem(id);
     }, [id, showModal, deleteItem]);
     ```
   - ✅ **Evitar re-crear funciones innecesariamente**
     ```jsx
     // ❌ MAL: Función recreada en cada render
     <Button onClick={() => handleDelete(id)} />
     
     // ✅ CORRECTO: Función memoizada
     const memoizedHandleDelete = useCallback(() => handleDelete(id), [id, handleDelete]);
     <Button onClick={memoizedHandleDelete} />
     ```

3. **Uso de `useMemo` y `useCallback`**
   - ✅ **Usar `useMemo` para valores computados costosos**
     ```typescript
     // Valor calculado costoso (array de objetos complejos)
     const calculatedColumns = useMemo(() => [
       { title: 'Nombre', key: 'name', render: (text) => <b>{text}</b> },
       // más columnas...
     ], [dependencias]);
     ```
   - ✅ **Establecer `displayName` para componentes memoizados**
     ```typescript
     const MemoizedComponent = memo(({ prop }) => <div>{prop}</div>);
     // Añadir displayName para depuración y mejor soporte ESLint
     MemoizedComponent.displayName = "MemoizedComponent";
     ```

### Manejo correcto de TypeScript

1. **Tipado de respuestas API**
   - ✅ **Implementar manejo robusto para diferentes estructuras de respuesta**
     ```typescript
     // Manejar distintas estructuras posibles
     if (Array.isArray(response.data)) {
       // Manejar array de datos
     } else if (typeof response.data === 'object' && response.data !== null) {
       // Usar aserción de tipo cuando sea necesario
       const responseObj = response.data as any;
       
       if (Array.isArray(responseObj.items)) {
         // Manejar estructura con .items
       }
     }
     ```

2. **Aserciones de tipo**
   - ✅ **Usar aserciones de tipo cuando la inferencia no es suficiente**
     ```typescript
     // Cuando TypeScript no puede inferir correctamente
     const responseData = response as any; // Usar con moderación
     if (responseData && responseData.ok) {
       // Procesar respuesta
     }
     ```
   - ✅ **Tipado de iconos de librerías externas**
     ```typescript
     // Usar React.ComponentType para compatibilidad con cualquier componente React
     interface MenuItem {
       icon: React.ComponentType<any>; // Más genérico que LucideIcon
     }
     ```

3. **Versiones de TypeScript**
   - ✅ **Mantener consistencia entre TypeScript y sus dependencias**
     - Usar versiones de TypeScript compatibles con las dependencias (ej: `@typescript-eslint`)
     - Actualmente usar versión 5.4.5 de TypeScript (última compatible con las herramientas)
     - Verificar compatibilidad en `package.json` y actualizaciones frecuentes

### Configuración de Next.js y Webpack

1. **Optimización de webpack**
   - ✅ **Mantener configuraciones simples y compatibles**
     ```javascript
     // Configuración básica que evita problemas de compatibilidad
     const nextConfig = {
       swcMinify: true,
       poweredByHeader: false,
       compiler: {
         removeConsole: process.env.NODE_ENV === 'production' ? {
           exclude: ['error'],
         } : false,
       },
       compress: true,
     };
     ```
   - ❌ **Evitar plugins de webpack complejos o personalizados**
     ```javascript
     // ❌ EVITAR: Configuraciones complejas pueden causar incompatibilidades
     webpack: (config, { webpack }) => {
       config.plugins.push(
         new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /es|en/)
       );
       return config;
     },
     ```

2. **Importaciones optimizadas**
   - ✅ **Utilizar importaciones selectivas para reducir tamaño de bundle**
     ```typescript
     // ❌ MAL: Importación completa
     import { Button, Table, Form, Input } from 'antd';
     
     // ✅ CORRECTO: Importaciones específicas
     import Button from 'antd/lib/button';
     import Table from 'antd/lib/table';
     import Form from 'antd/lib/form';
     import Input from 'antd/lib/input';
     ```
     
     ```typescript
     // ❌ MAL: Importación de todos los iconos
     import * as Icons from '@ant-design/icons';
     
     // ✅ CORRECTO: Importaciones específicas
     import UserOutlined from '@ant-design/icons/UserOutlined';
     import EditOutlined from '@ant-design/icons/EditOutlined';
     ```

### Buenas Prácticas de Optimización

Las siguientes técnicas de optimización se han implementado para mejorar el rendimiento de la aplicación:

### Menú Móvil y Responsividad

La aplicación implementa un sistema robusto de navegación móvil que se adapta automáticamente a diferentes tamaños y orientaciones de pantalla:

#### Componentes Clave

- **DashboardLayout**: Administra el estado global del menú móvil y detecta cambios de viewport.
- **MobileSidebar**: Implementa el menú lateral responsivo con soporte para todos los tamaños y orientaciones.
- **Header**: Contiene el botón hamburguesa que controla la visibilidad del menú móvil.

#### Características Principales

1. **Cierre Automático**: El menú se cierra automáticamente cuando:
   - El usuario navega a una nueva ruta
   - El dispositivo cambia de orientación (vertical a horizontal o viceversa)
   - La ventana se redimensiona a tamaño de escritorio (>= 768px)
   - Se hace clic fuera del menú
   - Se presiona la tecla Escape

2. **Optimización para Múltiples Dispositivos**:
   - Soporte para dimensiones comunes: 740x360, 667x375, 915x412, 896x414, 884x390, 932x430, 882x344
   - Detección de cambios de orientación mediante MediaQueries
   - Manejo eficiente del scroll y prevención de desplazamiento de fondo

3. **Accesibilidad**:
   - Manejo apropiado del foco cuando el menú se abre/cierra
   - Atributos ARIA para lectores de pantalla
   - Navegación completa por teclado

4. **Prevención de Memory Leaks**:
   - Limpieza adecuada de event listeners en efectos de React
   - Uso de `useCallback` para optimizar funciones entre renders

5. **Consistencia de Experiencia**:
   - Mismo comportamiento en todas las orientaciones
   - Transiciones suaves entre estados
   - Bloqueo de scroll del body cuando el menú está abierto

#### Requisitos para Nuevos Componentes

Al desarrollar nuevas páginas o componentes, asegurar que:

- Sean responsivos para todos los tamaños de pantalla (móvil, tablet, desktop)
- Se comporten correctamente en ambas orientaciones (portrait y landscape)
- Utilicen los hooks y componentes existentes para mantener consistencia
- Implementen `ResponsiveTable` en lugar de `Table` para tablas adaptativas
- Manejen correctamente el scroll y los event listeners

Para más detalles sobre la implementación de interfaces responsivas, ver la [documentación de directrices para formularios admin](./docs/ADMIN_FORMS_GUIDELINES.md).

### Optimización de Rendimiento en Páginas de Administración

Se han aplicado sistemáticamente las siguientes optimizaciones en todas las páginas de administración (colores, marcas, sucursales) y en el dashboard principal:

1. **Importaciones Selectivas**
   - Reemplazo de importaciones globales por importaciones selectivas de componentes Ant Design.
   - Importación individualizada de iconos para reducir el tamaño del bundle.

2. **Memoización de Componentes y Funciones**
   - Uso de `React.memo` para evitar re-renders innecesarios en componentes de tabla.
   - Aplicación de `useCallback` en funciones de manejo de eventos (onClick, onChange).
   - Implementación de `useMemo` para objetos complejos como configuraciones de paginación y columnas de tabla.

3. **Carga Dinámica y Lazy Loading**
   - Importación dinámica de componentes pesados como modales usando `dynamic` de Next.js.
   - Implementación de suspense y fallbacks visuales durante la carga.

4. **Optimización de Inputs**
   - Aplicación de debounce en inputs de búsqueda para limitar llamadas a la API.
   - Memoización de handlers de formularios para prevenir re-renders.

5. **Estructura de Componentes**
   - Creación de subcomponentes memoizados para celdas de tabla con renderización compleja.
   - Renderizado condicional para evitar procesar componentes no visibles.

6. **Estados Optimizados**
   - Manejo eficiente de estados para controlar loading, paginación y búsqueda.
   - Uso de efectos con dependencias correctamente definidas.

7. **Mejoras UX Integradas**
   - Implementación de skeletons para estados de carga.
   - Retroalimentación visual inmediata para acciones del usuario.

Estas optimizaciones han resultado en una mejora significativa del rendimiento y experiencia de usuario en las páginas administrativas.

### Optimización de Importaciones

- **Importaciones selectivas**: Importar componentes individuales en lugar de librerías completas.
  ```typescript
  // ❌ Evitar importar toda la librería
  import { Button, Table, Form } from 'antd';
  
  // ✅ Importar componentes individuales
  import Button from 'antd/lib/button';
  import Table from 'antd/lib/table';
  import Form from 'antd/lib/form';
  ```

- **Importación dinámica de iconos**: Importar solo los iconos necesarios.
  ```typescript
  // ❌ Evitar
  import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
  
  // ✅ Preferir
  import UserOutlined from '@ant-design/icons/UserOutlined';
  ```

### Memoización de Componentes y Funciones

- **React.memo**: Aplicar a componentes que no necesitan re-renderizarse con frecuencia.
  ```typescript
  const UserTableCell = React.memo(({ user }) => (
    <div className="flex items-center">
      <Avatar src={user.avatar} />
      <span className="ml-2">{user.name}</span>
    </div>
  ));
  ```

- **useMemo**: Usar para cálculos costosos o para evitar recrear objetos complejos.
  ```typescript
  // Memoización de configuración de columnas
  const columns = useMemo(() => [
    {
      title: 'Nombre',
      dataIndex: 'name',
      // ...
    },
    // más columnas...
  ], [sortConfig, filterConfig]);
  ```

- **useCallback**: Para funciones que se pasan como props a componentes hijos.
  ```typescript
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    fetchFilteredData(value);
  }, [fetchFilteredData]);
  ```

### Optimización de Rendimiento en Componentes

- **Debounce en búsquedas**: Limitar frecuencia de llamadas API en inputs de búsqueda.
  ```typescript
  // Implementar debounce en búsquedas
  const debouncedSearch = useCallback(
    debounce((value) => fetchData(value), 300),
    [fetchData]
  );
  ```

- **Suspense y carga progresiva**: Mostrar skeletons durante carga inicial.
  ```tsx
  <Suspense fallback={<TableSkeleton />}>
    <UserTable data={users} />
  </Suspense>
  ```

- **Code Splitting**: Cargar componentes solo cuando se necesitan.
  ```typescript
  // Utilidad para importaciones dinámicas
  const UserModal = dynamicComponent(() => import('./UserModal'));
  ```

### Optimización de Next.js y Webpack

- **Configuración mejorada de Next.js**: Técnicas aplicadas en `next.config.js`.
  - Code splitting avanzado con `splitChunks`
  - Optimización de chunks para Ant Design
  - Compresión de archivos
  - Minificación con SWC
  - Eliminación de console.logs en producción

- **Lazy Loading de módulos pesados**: Cargar solo cuando son necesarios.
  ```typescript
  // Importación dinámica para modales y componentes grandes
  const ReportGenerator = dynamic(() => import('@/components/ReportGenerator'), {
    loading: () => <Skeleton active />,
    ssr: false
  });
  ```

- **Optimización de imágenes**: Uso de `remotePatterns` en lugar de `domains`.

### Mejores Prácticas para Tablas y Formularios

- **Paginación del lado del servidor**: Evitar cargar grandes conjuntos de datos.
- **Virtualización de listas largas**: Renderizar solo elementos visibles.
- **Validación asíncrona**: Evitar bloquear la interfaz durante validaciones.
- **Estrategias de carga de datos**: Utilizar técnicas como SWR o React Query.

### Medición y Monitoreo

- **Métricas Web Vitals**: Monitorear LCP, FID y CLS.
- **Análisis de Bundle**: Uso de herramientas como `@next/bundle-analyzer`.
- **Auditoría de performance**: Revisar periódicamente el rendimiento con Lighthouse.

## Iniciando el Proyecto

### Instalación

```bash
npm install
```

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Desarrollo Local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## Construcción para Producción

```bash
npm run build
npm start
```

## 🧹 Lineamientos de Linting y Buenas Prácticas

Esta sección contiene lineamientos cruciales para mantener la calidad del código y prevenir problemas comunes en el desarrollo del frontend.

### 1. Uso correcto de Hooks y dependencias en React

- **Memoización de funciones asíncronas:**  
  Siempre que declares funciones asíncronas que se utilicen dentro de un `useEffect`, memoízalas con `useCallback` y declara todas las dependencias relevantes en el array del hook.
  ```tsx
  // ✅ Correcto
  const fetchData = useCallback(async () => {
    // lógica para obtener datos...
  }, [dep1, dep2]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // ❌ Incorrecto - function recreada en cada render
  useEffect(() => {
    const fetchData = async () => {
      // lógica...
    };
    fetchData();
  }, [dep1, dep2]);
  ```

- **No ignores advertencias de hooks:**  
  Si ESLint reporta dependencias faltantes en un hook, corrige el array de dependencias. Esto previene bugs sutiles y asegura que el efecto se ejecute correctamente cuando cambien las dependencias.

### 2. Imágenes y optimización con Next.js

- **Prohibido usar `<img>` directamente:**  
  Utiliza siempre el componente `<Image />` de `next/image` para aprovechar la optimización automática de imágenes, lazy loading y mejores prácticas de accesibilidad.

  ```tsx
  // ✅ Correcto
  import Image from "next/image";
  <Image 
    src="https://i.pravatar.cc/40?u=usuario" 
    alt="Descripción" 
    width={40} 
    height={40} 
    className="..." 
  />
  
  // ❌ Incorrecto - no usa el componente optimizado
  <img src="..." alt="..." className="..." />
  ```

- **Dominios externos en imágenes:**  
  Si necesitas cargar imágenes desde dominios externos, agrégalos en `next.config.js`:
  ```js
  // next.config.js
  module.exports = {
    images: {
      domains: ['i.pravatar.cc', 'localhost', '127.0.0.1'],
    },
  };
  ```

- **Accesibilidad:**  
  Todas las imágenes deben tener el atributo `alt` con texto descriptivo o vacío (`alt=""`) si son decorativas.

### 3. JSX y caracteres especiales

- **Escapado de caracteres:**  
  Escapa caracteres especiales en JSX (por ejemplo, comillas dobles `"`) usando entidades HTML (`&quot;`).
  ```tsx
  // ✅ Correcto
  <p>Selecciona &quot;¿Qué hay aquí?&quot; en el menú contextual.</p>
  
  // ❌ Incorrecto - comillas sin escapar
  <p>Selecciona "¿Qué hay aquí?" en el menú contextual.</p>
  ```

### 4. Consistencia en parámetros y formularios

- **Nombres de parámetros:**  
  Usa nombres consistentes en filtros y paginación:
  ```tsx
  // Variables estándar para paginación y búsqueda
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  ```

- **Resetear paginación:**  
  Cuando cambie el texto de búsqueda, resetea siempre la paginación a la primera página:
  ```tsx
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1); // ¡Importante! Resetear a página 1
  };
  ```

- **Validación y estructura:**  
  Sigue las guías de formularios y validaciones documentadas en [`docs/ADMIN_FORMS_GUIDELINES.md`](docs/ADMIN_FORMS_GUIDELINES.md).

### 5. Proceso de despliegue y control de calidad

- **Linting obligatorio:**  
  Ejecuta `npm run lint` antes de cada commit y despliegue para asegurar código limpio:
  ```bash
  # Verifica errores y advertencias de lint
  npm run lint
  
  # Si no hay errores, procede con el commit/despliegue
  ```

- **Compatibilidad de TypeScript:**  
  Verifica que la versión de TypeScript sea compatible con Next.js y ESLint (consulta los mensajes de advertencia en consola).

- **Revisión de accesibilidad:**  
  Revisa que todos los componentes cumplan con las normas básicas de accesibilidad (atributos `alt`, roles, etiquetas semánticas).

### 6. Ejemplo de checklist pre-despliegue

- [ ] Ejecutar `npm run lint` y corregir todos los errores y advertencias
- [ ] Verificar que no hay etiquetas `<img>` sin reemplazar por `<Image />`
- [ ] Comprobar que los hooks tienen todas sus dependencias declaradas correctamente
- [ ] Asegurar que caracteres especiales en JSX están escapados
- [ ] Verificar que la configuración de dominios de imágenes en `next.config.js` está completa
- [ ] Probar la aplicación en diferentes tamaños de pantalla y orientaciones (portrait/landscape)

## Recursos adicionales

- **Guía de formularios administrativos:**  
  Consulta y sigue las recomendaciones de [`docs/ADMIN_FORMS_GUIDELINES.md`](docs/ADMIN_FORMS_GUIDELINES.md) para mantener la coherencia y calidad en los formularios.
- **Documentación de Next.js:**
  [Imágenes en Next.js](https://nextjs.org/docs/basic-features/image-optimization)
- **Documentación de React Hooks:**
  [Reglas de Hooks](https://reactjs.org/docs/hooks-rules.html)

## Contacto y Soporte

Para preguntas o reportar problemas, contacta con el equipo de desarrollo a través de [soporte@neoptica.com](mailto:soporte@neoptica.com).
