// Configuración de los elementos del menú para cada rol
import { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  FileText,
  Archive,
  User,
  ShoppingBag,
  PackageCheck,
  Store,
  Wallet,
  ClipboardList,
  Building,
  HelpCircle,
  ArrowUpRight,
  Edit3,
  PaintBucket,
  Bookmark,
  ShoppingCart,
  FileBarChart,
  Bell
} from 'lucide-react';

// Definición de tipos para los elementos del menú
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  roles: string[];
  children?: MenuItem[];
  badge?: {
    text: string;
    variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  };
}

// Menú para el rol de Administrador
export const adminMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    roles: ['admin'],
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: Archive,
    path: '/dashboard/inventario',
    roles: ['admin'],
    children: [
      {
        id: 'movimientos',
        label: 'Movimientos',
        icon: PackageCheck,
        path: '/dashboard/inventario/movimientos',
        roles: ['admin'],
      },
      {
        id: 'adjuntos',
        label: 'Adjuntos',
        icon: FileText,
        path: '/dashboard/inventario/adjuntos',
        roles: ['admin'],
      },
      {
        id: 'transferencias',
        label: 'Transferencias',
        icon: ArrowUpRight,
        path: '/dashboard/inventario/transferencias',
        roles: ['admin'],
      }
    ]
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: ShoppingBag,
    path: '/dashboard/productos',
    roles: ['admin'],
    children: [
      {
        id: 'catalogo',
        label: 'Catálogo',
        icon: ShoppingCart,
        path: '/dashboard/productos/catalogo',
        roles: ['admin'],
      },
      {
        id: 'colores',
        label: 'Colores',
        icon: PaintBucket,
        path: '/admin/colors',
        roles: ['admin'],
      },
      {
        id: 'marcas',
        label: 'Marcas',
        icon: Bookmark,
        path: '/admin/brands',
        roles: ['admin'],
      }
    ]
  },
  {
    id: 'sucursales',
    label: 'Sucursales',
    icon: Store,
    path: '/admin/branches',
    roles: ['admin'],
  },
  {
    id: 'usuarios',
    label: 'Usuarios y Roles',
    icon: User,
    path: '/admin/users',
    roles: ['admin'],
  },
  {
    id: 'pedidos',
    label: 'Pedidos y Ventas',
    icon: Wallet,
    path: '/dashboard/pedidos',
    roles: ['admin'],
  },
  {
    id: 'reportes',
    label: 'Reportes y Auditoría',
    icon: BarChart3,
    path: '/dashboard/reportes',
    roles: ['admin'],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    path: '/dashboard/configuracion',
    roles: ['admin'],
  },
  {
    id: 'soporte',
    label: 'Soporte y Ayuda',
    icon: HelpCircle,
    path: '/dashboard/soporte',
    roles: ['admin'],
  }
];

// Menú para el rol de Vendedor
export const vendedorMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/vendedor',
    roles: ['vendedor'],
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: ShoppingCart,
    path: '/vendedor/ventas',
    roles: ['vendedor'],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: User,
    path: '/vendedor/clientes',
    roles: ['vendedor'],
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: ShoppingBag,
    path: '/vendedor/productos',
    roles: ['vendedor'],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    path: '/vendedor/reportes',
    roles: ['vendedor'],
  }
];

// Menú para el rol de Optometrista
export const optometristaMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/optometrista',
    roles: ['optometrista'],
  },
  {
    id: 'pacientes',
    label: 'Pacientes',
    icon: User,
    path: '/optometrista/pacientes',
    roles: ['optometrista'],
  },
  {
    id: 'recetas',
    label: 'Recetas',
    icon: ClipboardList,
    path: '/optometrista/recetas',
    roles: ['optometrista'],
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: LayoutDashboard,
    path: '/optometrista/agenda',
    roles: ['optometrista'],
  }
];

// Menú para el rol de Cliente
export const clienteMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Mi Cuenta',
    icon: User,
    path: '/cliente',
    roles: ['cliente'],
  },
  {
    id: 'compras',
    label: 'Mis Compras',
    icon: ShoppingBag,
    path: '/cliente/compras',
    roles: ['cliente'],
  },
  {
    id: 'recetas',
    label: 'Mis Recetas',
    icon: ClipboardList,
    path: '/cliente/recetas',
    roles: ['cliente'],
  }
];

// Función para obtener los elementos de menú según el rol del usuario
export const getMenuItemsByRole = (role: string): MenuItem[] => {
  switch (role) {
    case 'admin':
      return adminMenuItems;
    case 'vendedor':
      return vendedorMenuItems;
    case 'optometrista':
      return optometristaMenuItems;
    case 'cliente':
      return clienteMenuItems;
    default:
      return [];
  }
};
