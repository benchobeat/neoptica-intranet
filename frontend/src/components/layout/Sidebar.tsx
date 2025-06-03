"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import { MenuItem, getMenuItemsByRole } from '../../config/menuItems';
import Image from 'next/image';
import RoleSelector from '../RoleSelector';

interface SidebarProps {
  className?: string;
  role?: string;
}

export default function Sidebar({ className = "", role }: SidebarProps) {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState<string>('');

  // Obtener el rol activo del usuario desde localStorage (solo en el cliente)
  useEffect(() => {
    // Usar el role proporcionado como prop o tomarlo del localStorage
    const userRoleValue = role || localStorage.getItem('activeRole') || 'guest';
    setUserRole(userRoleValue);
    setMenuItems(getMenuItemsByRole(userRoleValue));
    
    // Expandir automáticamente el elemento de menú que corresponde a la ruta actual
    const currentPath = pathname || '';
    const newExpandedItems: Record<string, boolean> = {};
    
    getMenuItemsByRole(userRoleValue).forEach(item => {
      if (item.children?.some(child => currentPath.startsWith(child.path))) {
        newExpandedItems[item.id] = true;
      }
    });
    
    setExpandedItems(newExpandedItems);
  }, [pathname, role]);

  // Función para alternar la expansión de un elemento de menú
  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Verifica si un elemento o alguno de sus hijos está activo
  const isItemActive = (item: MenuItem): boolean => {
    const isPathActive = pathname === item.path || (pathname && pathname.startsWith(`${item.path}/`));
    
    if (isPathActive) return true;
    
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    
    return false;
  };

  // Renderiza un elemento de menú individual
  const renderMenuItem = (item: MenuItem) => {
    const active = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];
    
    return (
      <div key={item.id} className="mb-1">
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.id)}
              className={`w-full flex items-center justify-between py-2.5 px-4 rounded-lg transition-colors ${
                active
                  ? "bg-indigo-600/20 text-white"
                  : "hover:bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon && <item.icon size={20} />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    getBadgeStyles(item.badge.variant)
                  }`}>
                    {item.badge.text}
                  </span>
                )}
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>
            
            {isExpanded && (
              <div className="pl-4 mt-1 space-y-1 border-l border-gray-800 ml-6">
                {item.children?.map((child) => (
                  <Link
                    key={child.id}
                    href={child.path}
                    className={`flex items-center gap-3 py-2 px-4 rounded-lg transition-colors ${
                      isItemActive(child)
                        ? "bg-indigo-600/10 text-white"
                        : "hover:bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {child.icon && <child.icon size={18} />}
                    <span>{child.label}</span>
                    {child.badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        getBadgeStyles(child.badge.variant)
                      }`}>
                        {child.badge.text}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <Link
            href={item.path}
            className={`flex items-center gap-3 py-2.5 px-4 rounded-lg transition-colors ${
              active
                ? "bg-indigo-600/20 text-white"
                : "hover:bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {item.icon && <item.icon size={20} />}
            <span>{item.label}</span>
            {item.badge && (
              <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${
                getBadgeStyles(item.badge.variant)
              }`}>
                {item.badge.text}
              </span>
            )}
          </Link>
        )}
      </div>
    );
  };

  // Estilos para las insignias
  const getBadgeStyles = (variant: string): string => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-500/20 text-indigo-300';
      case 'secondary':
        return 'bg-gray-500/20 text-gray-300';
      case 'danger':
        return 'bg-red-500/20 text-red-300';
      case 'success':
        return 'bg-green-500/20 text-green-300';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-indigo-500/20 text-indigo-300';
    }
  };

  // Obtener la etiqueta del rol para mostrar en el sidebar
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      case 'optometrista':
        return 'Optometrista';
      case 'cliente':
        return 'Cliente';
      default:
        return 'Invitado';
    }
  };

  return (
    <aside className={`w-64 bg-gray-900 text-gray-400 h-screen fixed top-0 left-0 flex flex-col border-r border-gray-800 ${className}`}>
      <div className="p-4 space-y-3 border-b border-gray-800">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xl font-bold text-white">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Image 
              src="/logo-optica.svg" 
              alt="Neóptica Logo" 
              width={22} 
              height={22}
            />
          </div>
          <span>Neóptica</span>
        </Link>
        
        {/* Selector de roles */}
        <RoleSelector className="mt-3" />
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(renderMenuItem)}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <Image 
            src={`https://i.pravatar.cc/40?u=${userRole}`} 
            alt={getRoleLabel(userRole)} 
            width={40}
            height={40}
            className="w-10 h-10 rounded-full" 
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{getRoleLabel(userRole)}</p>
            <p className="text-xs text-gray-400">Sesión activa</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('activeRole');
              localStorage.removeItem('roles');
              window.location.href = '/';
            }}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
