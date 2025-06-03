"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay un token y un rol activo en localStorage
    const token = localStorage.getItem('token');
    const activeRole = localStorage.getItem('activeRole');

    if (token && activeRole) {
      // Si el usuario está autenticado, redirigir según su rol activo
      switch (activeRole) {
        case 'admin':
          router.replace('/admin');
          break;
        case 'vendedor':
          router.replace('/vendedor');
          break;
        case 'optometrista':
          router.replace('/optometrista');
          break;
        case 'cliente':
          router.replace('/cliente');
          break;
        default:
          // Si el rol no es reconocido, redirigir al login
          router.replace('/auth/login');
      }
    } else {
      // Si no hay token o rol, redirigir al login
      router.replace('/auth/login');
    }
  }, [router]);

  // Mientras se realiza la redirección, mostrar una pantalla de carga
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-700 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-700 rounded mb-3"></div>
        <div className="h-3 w-24 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
