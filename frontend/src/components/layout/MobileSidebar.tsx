'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { MenuItem } from '@/config/menuItems';
import { cn } from '@/lib/utils';

// Extendemos el tipo MenuItem para incluir cualquier propiedad adicional que pueda faltar
type ExtendedMenuItem = Omit<MenuItem, 'children' | 'icon'> & {
  icon?: React.ComponentType<{ className?: string }>;
  children?: ExtendedMenuItem[];
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
  menuItems: ExtendedMenuItem[];
}

export function MobileSidebar({ isOpen, onClose, role, menuItems }: MobileSidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);
  
  // Manejar cambios de orientación/rotación y tamaño de pantalla
  useEffect(() => {
    // Solo hacer algo si el menú está abierto
    if (!isOpen) return;
    
    // Función para manejar cambios de orientación/tamaño
    const handleOrientationChange = () => {
      // Cerrar el menú inmediatamente al cambiar orientación
      onClose();
    };
    
    // Función para detectar cambios de viewport
    // Usamos un enfoque universal que funciona en todos los tamaños de pantalla
    const handleViewportChange = () => {
      // Detecta si un dispositivo móvil cambia de orientación verificando
      // el cambio en la relación de aspecto más que en un tamaño específico
      const isLandscape = window.innerWidth > window.innerHeight;
      const wasPortrait = window.matchMedia('(orientation: portrait)').matches;
      
      // Si ya estamos en una vista desktop, cerrar el menú
      if (window.innerWidth >= 768 && isOpen) {
        onClose();
        return;
      }
      
      // Tamaños específicos de móviles mencionados (915x412, 896x414, 884x390, etc.)
      // Todos ellos están en landscape y son menores a 768px de ancho
      if (isLandscape && window.innerWidth < 768 && isOpen) {
        // Solo cerrar al cambiar de orientación, no al redimensionar ligeramente
        if (wasPortrait !== isLandscape) {
          onClose();
        }
      }
    };
    
    // Crear media queries para detectar cambios más robustamente
    const desktopMediaQuery = window.matchMedia('(min-width: 768px)');
    const orientationMediaQuery = window.matchMedia('(orientation: landscape)');
    
    // Event listeners modernos con compatibilidad para navegadores antiguos
    if (desktopMediaQuery.addEventListener) {
      desktopMediaQuery.addEventListener('change', handleViewportChange);
      orientationMediaQuery.addEventListener('change', handleOrientationChange);
    } else {
      // Fallback para navegadores que no soportan addEventListener en MediaQueryList
      desktopMediaQuery.addListener(handleViewportChange);
      orientationMediaQuery.addListener(handleOrientationChange);
    };
    
    // Agregar listeners para cambios de orientación y redimensionamiento
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleViewportChange);
    
    // Verificar estado inicial
    handleViewportChange();
    
    return () => {
      if (desktopMediaQuery.removeEventListener) {
        desktopMediaQuery.removeEventListener('change', handleViewportChange);
        orientationMediaQuery.removeEventListener('change', handleOrientationChange);
      } else {
        // Fallback para navegadores antiguos
        desktopMediaQuery.removeListener(handleViewportChange);
        orientationMediaQuery.removeListener(handleOrientationChange);
      }
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [isOpen, onClose]);

  // Manejar clic fuera del menú - optimizado para reducir re-renders
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]);
  
  // Manejar tecla Escape para cerrar el menú
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Agregar/remover event listener para clics fuera y tecla Escape
  // Este efecto complementa el que está en DashboardLayout pero más enfocado en el sidebar
  useEffect(() => {
    if (!isOpen) return;
    
    // Guardar el estado original del body para restaurarlo después
    const originalStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      top: document.body.style.top,
      paddingRight: document.body.style.paddingRight
    };
    
    // Fijar el body para prevenir scroll mientras el menú está abierto
    // y compensar el ancho de la barra de scroll para evitar saltos
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    // Limpiar al cerrar el menú o desmontar
    return () => {
      // Restaurar los estilos originales
      document.body.style.overflow = originalStyle.overflow;
      document.body.style.position = originalStyle.position;
      document.body.style.width = originalStyle.width;
      document.body.style.paddingRight = originalStyle.paddingRight;
      
      // Restaurar la posición de scroll
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Verificar si un ítem está activo
  const isItemActive = (item: ExtendedMenuItem): boolean => {
    const isPathActive = pathname === item.path || (pathname && item.path && pathname.startsWith(`${item.path}/`));
    const hasActiveChild = item.children ? item.children.some(child => isItemActive(child)) : false;
    return isPathActive || hasActiveChild;
  };

  // Alternar ítem expandido
  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev: Record<string, boolean>) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Renderizar un ítem del menú
  const renderMenuItem = (item: ExtendedMenuItem, level = 0) => {
    const active = isItemActive(item);
    const children = item.children || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedItems[item.id];
    const Icon = item.icon;
    const itemId = `menu-item-${item.id}`;
    const submenuId = `submenu-${item.id}`;

    // Manejar teclado para el botón de menú desplegable
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleExpand(item.id);
      } else if (e.key === 'Escape' && isExpanded) {
        toggleExpand(item.id);
      }
    };

    return (
      <div key={item.id} className="mb-1">
        {hasChildren ? (
          <div role="none">
            <button
              id={itemId}
              onClick={() => toggleExpand(item.id)}
              onKeyDown={handleKeyDown}
              className={cn(
                'w-full flex items-center justify-between py-3 px-4 rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                active ? 'bg-indigo-600/20 text-white' : 'hover:bg-gray-800 text-gray-400 hover:text-white',
                `pl-${level * 4 + 4}`
              )}
              aria-expanded={isExpanded}
              aria-haspopup="true"
              aria-controls={submenuId}
            >
              <div className="flex items-center gap-3">
                {Icon && <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />}
                <span>{item.label}</span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-transform transform',
                  isExpanded ? 'rotate-180' : ''
                )}
                aria-hidden="true"
              />
            </button>
            
            {hasChildren && (
              <div 
                id={submenuId}
                role="region"
                aria-labelledby={itemId}
                className={cn(
                  'overflow-hidden transition-all duration-200 ease-in-out',
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className={cn('pl-4 mt-1 space-y-1 border-l-2 border-gray-800', `ml-${level * 4 + 6}`)}>
                  {children.map((child, index) => (
                    <div key={`${child.id}-${index}`}>
                      {renderMenuItem(child, level + 1)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href={item.path || '#'}
            className={cn(
              'flex items-center py-3 px-4 rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900',
              active ? 'bg-indigo-600/20 text-white' : 'hover:bg-gray-800 text-gray-400 hover:text-white',
              `pl-${level * 4 + 4}`
            )}
            onClick={onClose}
            tabIndex={isOpen ? 0 : -1}
          >
            {Icon && <Icon className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />}
            <span>{item.label}</span>
          </Link>
        )}
      </div>
    );
  };

  // Efecto para manejar el foco cuando se abre/cierra el menú
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      // Enfocar el primer elemento interactivo cuando se abre el menú
      const firstFocusable = sidebarRef.current.querySelector<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        setTimeout(() => {
          firstFocusable.focus();
        }, 100); // Pequeño retraso para asegurar que el elemento sea enfocable
      }
    }
  }, [isOpen]);

  // Los eventos de teclado ya están manejados por los efectos anteriores
  // y por el DashboardLayout, así que eliminamos este efecto redundante

  return (
    <>
      {/* Fondo oscuro con transición */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        role="presentation"
        aria-hidden={!isOpen}
      />
      
      {/* Menú lateral */}
      <div
        ref={sidebarRef}
        className={cn(
          'mobile-sidebar fixed top-0 left-0 h-full w-72 bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out focus:outline-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!isOpen}
        tabIndex={-1}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Menú</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Cerrar menú"
            aria-expanded={isOpen}
            aria-controls="mobile-menu-content"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Contenido del menú */}
        <nav 
          id="mobile-menu-content"
          className="p-2 overflow-y-auto h-[calc(100vh-65px)]"
          aria-label="Navegación principal"
        >
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={`${item.id}-${index}`}>
                {renderMenuItem(item)}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
