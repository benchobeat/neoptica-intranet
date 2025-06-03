"use client";

import React, { Suspense, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useRoleGuard } from "@/hooks/useRoleGuard";

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
  // Utilizamos el hook personalizado para validar permisos según el rol
  const { loading, isAuthorized } = useRoleGuard(role);
  
  // Contenido principal memoizado para evitar re-renders innecesarios
  const MainContent = useMemo(() => (
    <div className="flex bg-gray-900 text-white min-h-screen">
      <Sidebar role={role} />
      <main className="ml-64 flex-1 min-h-screen">
        <Header role={role} />
        <div className="p-8">
          <Suspense fallback={<PageSkeleton />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  ), [children, role]);

  // Retorno condicional
  if (loading) {
    return LoadingSkeleton;
  }

  if (!isAuthorized) {
    return null; // El hook ya se encarga de la redirección
  }

  return MainContent;
}
