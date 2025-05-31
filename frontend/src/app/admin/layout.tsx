"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación y rol
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
      router.replace("/auth/login");
      return;
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
      return;
    }

    // Simulamos carga de datos inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [router]);

  // Skeleton loading durante la verificación
  if (loading) {
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
  }

  return (
    <div className="flex bg-gray-900 text-white min-h-screen">
      <Sidebar role="admin" />
      <main className="ml-64 flex-1 min-h-screen">
        <Header />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
