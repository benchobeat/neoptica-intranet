"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook personalizado para validar permisos de usuario según su rol activo
 * @param requiredRole - El rol requerido para acceder a la página
 * @returns Un objeto con estados para manejar la validación de permisos
 */
export function useRoleGuard(requiredRole: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Verificación de autenticación y rol
  const verifyAuth = useCallback(() => {
    // Ejecutar solo en el cliente donde está disponible localStorage
    if (typeof window === 'undefined') return false;

    // Verificar autenticación y rol activo
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("activeRole");

    if (!token) {
      router.replace("/auth/login");
      return false;
    }

    if (userRole !== requiredRole) {
      // Redireccionar según el rol activo
      switch (userRole) {
        case "admin":
          router.replace("/admin");
          break;
        case "vendedor":
          router.replace("/vendedor");
          break;
        case "optometrista":
          router.replace("/optometrista");
          break;
        case "cliente":
          router.replace("/cliente");
          break;
        default:
          router.replace("/auth/login");
      }
      return false;
    }
    return true;
  }, [router, requiredRole]);

  useEffect(() => {
    const isValid = verifyAuth();
    setIsAuthorized(isValid);
    setLoading(false);
  }, [verifyAuth]);

  return { loading, isAuthorized };
}
