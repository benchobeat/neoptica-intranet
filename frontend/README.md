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
2. El backend valida las credenciales y devuelve un token JWT junto con la información del usuario, incluyendo su rol.
3. Basado en el rol del usuario, la aplicación redirecciona al dashboard correspondiente.
4. El token JWT se almacena en localStorage para mantener la sesión activa.

### Roles de Usuario

- **Admin**: Acceso completo a todas las funcionalidades del sistema.
- **Vendedor**: Gestión de ventas, clientes y productos.
- **Optometrista**: Gestión de recetas y consultas de pacientes.
- **Cliente**: Visualización de historial, compras y perfil personal.

## Componentes UI

### Componentes Base Reutilizables

- **Card**: Contenedor base con estilo consistente para todas las secciones.
- **Button**: Botón personalizable con variantes (primary, secondary, danger).
- **Input**: Campo de entrada estilizado.
- **Select**: Selector desplegable personalizado.
- **Label**: Etiqueta para formularios.

### Componentes de Layout

- **Sidebar**: Menú lateral con navegación principal, adapta su contenido según el rol.
- **Header**: Cabecera con búsqueda, notificaciones y perfil de usuario.
- **DashboardSkeleton**: Estructura base para todas las páginas de dashboard.

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

## Contacto y Soporte

Para preguntas o reportar problemas, contacta con el equipo de desarrollo a través de [soporte@neoptica.com](mailto:soporte@neoptica.com).
