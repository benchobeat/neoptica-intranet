"use client";

import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "antd";
import { dynamicComponent } from "@/utils/dynamicImport";

// Importación de manera regular para simplificar ya que hay errores de tipo con la importación dinámica
import Sidebar from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// Esqueleto de carga para el contenido principal memoizado
const PageSkeleton = React.memo(() => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-800 rounded-lg w-1/4 mb-6"></div>
    <div className="h-64 bg-gray-800 rounded-xl"></div>
  </div>
));
PageSkeleton.displayName = "PageSkeleton";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Memoizamos la función de verificación de autenticación para evitar recrearla en cada render
  const verifyAuth = useCallback(() => {
    // Verificar autenticación y rol
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
      router.replace("/auth/login");
      return false;
    }

    if (userRole !== "admin") {
      // Redireccionar según el rol
      switch (userRole) {
        case "vendor":
          router.replace("/vendor");
          break;
        case "optometrist":
          router.replace("/optometrist");
          break;
        case "client":
          router.replace("/client");
          break;
        default:
          router.replace("/auth/login");
      }
      return false;
    }
    return true;
  }, [router]);
  
  useEffect(() => {
    // Utilizamos la función memoizada
    const isAuthenticated = verifyAuth();
    
    if (isAuthenticated) {
      // Simulamos carga de datos inicial
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
  
      return () => clearTimeout(timer);
    }
  }, [verifyAuth]);

  // Memoizamos ambos contenidos antes de cualquier retorno condicional
  // Skeleton loading durante la verificación
  const LoadingSkeleton = useMemo(() => {
    if (!loading) return null;
    
    return (
      <div className="flex bg-gray-900 text-white min-h-screen">
        <div className="w-64 bg-gray-900 h-screen fixed top-0 left-0 border-r border-gray-800 p-6 space-y-4 animate-pulse">
          <div className="h-10 bg-gray-800 rounded-lg"></div>
          <div className="h-80 bg-gray-800 rounded-lg mt-8"></div>
        </div>
        <main className="ml-64 flex-1 min-h-screen p-8 space-y-8">
          <div className="h-10 bg-gray-800 rounded-lg w-1/4 mb-10"></div>
          <div className="grid grid-cols-4 gap-6">
            <div className="h-32 bg-gray-800 rounded-xl"></div>
            <div className="h-32 bg-gray-800 rounded-xl"></div>
            <div className="h-32 bg-gray-800 rounded-xl"></div>
            <div className="h-32 bg-gray-800 rounded-xl"></div>
          </div>
          <div className="h-96 bg-gray-800 rounded-xl mt-8"></div>
        </main>
      </div>
    );
  }, [loading]);
  
  // Contenido principal memoizado para evitar re-renders innecesarios
  const MainContent = useMemo(() => (
    <div className="flex bg-gray-900 text-white min-h-screen">
      <Sidebar role="admin" />
      <main className="ml-64 flex-1 min-h-screen">
        <Header />
        <div className="p-8">
          <Suspense fallback={<PageSkeleton />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  ), [children]);

  // Retorno condicional después de declarar todos los hooks
  if (loading) {
    return LoadingSkeleton;
  }

  return MainContent;
}
