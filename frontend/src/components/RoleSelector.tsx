"use client";

import React, { useState, useEffect } from 'react';
import { Select, Tooltip, message } from 'antd';
import { UserCog, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoleSelectorProps {
  className?: string;
}

export default function RoleSelector({ className = "" }: RoleSelectorProps) {
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Cargar roles del usuario al montar el componente
  useEffect(() => {
    const storedRoles = localStorage.getItem('roles');
    const storedActiveRole = localStorage.getItem('activeRole');
    
    if (storedRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles);
        setRoles(Array.isArray(parsedRoles) ? parsedRoles : []);
      } catch (error) {
        console.error('Error parsing roles:', error);
        setRoles([]);
      }
    }
    
    if (storedActiveRole) {
      setActiveRole(storedActiveRole);
    }
  }, []);

  // No mostrar nada si el usuario no tiene roles o solo tiene uno
  if (!roles.length || roles.length <= 1) {
    return null;
  }

  const handleRoleChange = (newRole: string) => {
    if (newRole === activeRole) return;
    
    setLoading(true);
    
    // Guardar el nuevo rol activo en localStorage
    localStorage.setItem('activeRole', newRole);
    setActiveRole(newRole);
    
    // Mostrar mensaje de éxito
    message.success(`Cambiando al rol: ${getRoleLabel(newRole)}`);
    
    // Redirigir a la página correspondiente según el nuevo rol
    setTimeout(() => {
      switch (newRole) {
        case 'admin':
          router.push('/admin');
          break;
        case 'vendedor':
          router.push('/vendedor');
          break;
        case 'optometrista':
          router.push('/optometrista');
          break;
        case 'cliente':
          router.push('/cliente');
          break;
        default:
          router.push('/');
      }
    }, 1000); // Pequeño retraso para que se muestre el mensaje
  };

  // Función para obtener la etiqueta descriptiva del rol
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
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <div className={`flex items-center p-3 ${className}`}>
      <Tooltip title="Cambiar rol activo">
        <ShieldCheck className="mr-2 text-indigo-400" size={18} />
      </Tooltip>
      <Select
        value={activeRole}
        onChange={handleRoleChange}
        loading={loading}
        disabled={loading}
        style={{ width: '100%' }}
        options={roles.map(role => ({
          value: role,
          label: (
            <div className="flex items-center">
              <UserCog size={14} className="mr-2 text-gray-400" />
              {getRoleLabel(role)}
              {role === activeRole && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-green-700/30 text-green-400">
                  Activo
                </span>
              )}
            </div>
          ),
        }))}
        dropdownStyle={{ 
          background: '#1e293b', 
          borderColor: '#334155',
          color: '#f1f5f9'
        }}
        className="role-selector"
      />
      
      {/* Estilos CSS personalizados para el selector */}
      <style jsx global>{`
        .role-selector .ant-select-selector {
          background-color: rgba(30, 41, 59, 0.8) !important;
          border-color: rgba(51, 65, 85, 0.8) !important;
          color: #f1f5f9 !important;
        }
        .role-selector .ant-select-selection-item {
          color: #f1f5f9 !important;
        }
        .role-selector .ant-select-arrow {
          color: #94a3b8 !important;
        }
      `}</style>
    </div>
  );
}
