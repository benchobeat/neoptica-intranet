"use client";

import React, { Suspense, useMemo, useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { getMenuItemsByRole } from "@/config/menuItems";

// Esqueleto de carga para el contenido principal
const PageSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-800 rounded-lg w-1/4 mb-6"></div>
    <div className="h-64 bg-gray-800 rounded-xl"></div>
  </div>
);

// Esqueleto de carga para todo el dashboard
const LoadingSkeleton = (
  <div className="flex h-screen items-center justify-center bg-gray-900">
    <div className="animate-pulse flex flex-col items-center space-y-4">
      <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
      <div className="h-4 w-32 bg-gray-800 rounded"></div>
      <div className="h-3 w-24 bg-gray-800 rounded"></div>
    </div>
  </div>
);

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "vendedor" | "optometrista" | "cliente";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const { loading, isAuthorized } = useRoleGuard(role);
  
  // Cargar los ítems del menú según el rol
  useEffect(() => {
    const items = getMenuItemsByRole(role);
    setMenuItems(items);
  }, [role]);
  
  // Manejar el cambio de tamaño de la ventana y orientación
  useEffect(() => {
    // Función para detectar si estamos en modo móvil (ya sea portrait o landscape)
    const handleViewportChange = () => {
      const isMobileViewport = window.innerWidth < 768;
      
      // Siempre cerrar el menú cuando cambiamos a desktop
      if (!isMobileViewport && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    // Verificar inmediatamente cuando este efecto se ejecuta
    handleViewportChange();
    
    // Crear media query para detectar cambios de viewport más robustamente
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    // Función para manejar cambios específicos de orientación
    const handleOrientationChange = () => {
      // Cerrar el menú al cambiar la orientación del dispositivo
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    // Event listeners modernos con compatibilidad para navegadores antiguos
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleViewportChange);
    } else {
      // Fallback para navegadores que no soportan addEventListener en MediaQueryList
      mediaQuery.addListener(handleViewportChange);
    }
    
    // Eventos específicos para cambios de tamaño y orientación
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Limpiar todos los listeners al desmontar
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleViewportChange);
      } else {
        // Fallback para navegadores antiguos
        mediaQuery.removeListener(handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobileMenuOpen]);
  
  // Manejar el cierre del menú al hacer clic fuera de él o presionar Escape
  useEffect(() => {
    // Solo añadir listeners si el menú está abierto
    if (!isMobileMenuOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isMenuButton = target.closest('[aria-label*="menú"]');
      const isInsideMenu = target.closest('.mobile-sidebar');
      
      if (!isMenuButton && !isInsideMenu) {
        setIsMobileMenuOpen(false);
      }
    };
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    
    // Bloquear el scroll del body cuando el menú está abierto
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    
    // Aplicar estilos para prevenir scroll
    document.body.style.overflow = 'hidden';
    
    // Añadir event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    // Limpiar al desmontar o cuando el menú se cierre
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Restaurar el scroll
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);
  
  // Alternar menú móvil
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);
  
  // Cerrar menú móvil
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);
  
  // Contenido principal memoizado para evitar re-renders innecesarios
  const MainContent = useMemo(() => (
    <div className="flex bg-gray-900 text-white min-h-screen">
      {/* Sidebar para desktop */}
      <div className="hidden md:block">
        <Sidebar role={role} />
      </div>
      
      {/* Menú móvil */}
      <div className="mobile-menu-container">
        <MobileSidebar 
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          role={role}
          menuItems={menuItems}
        />
      </div>
      
      <main className="md:ml-64 flex-1 min-h-screen transition-all duration-300 ease-in-out">
        <Header 
          role={role} 
          onMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <div className="p-4 md:p-8">
          <Suspense fallback={<PageSkeleton />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  ), [children, role, isMobileMenuOpen, menuItems, toggleMobileMenu, closeMobileMenu]);

  // Retorno condicional
  if (loading) {
    return LoadingSkeleton;
  }

  if (!isAuthorized) {
    return null; // El hook ya se encarga de la redirección
  }

  return MainContent;
}
