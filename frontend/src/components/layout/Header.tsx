"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, ChevronDown, LogOut, Settings, User } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Notificaciones de ejemplo
  const notifications = [
    { id: 1, title: 'Inventario bajo', message: 'El stock de marcos Ray-Ban está por debajo del mínimo', time: '10m', read: false },
    { id: 2, title: 'Nueva venta', message: 'Se ha registrado una nueva venta en Sucursal Central', time: '30m', read: false },
    { id: 3, title: 'Actualización del sistema', message: 'Se ha completado la actualización de la plataforma', time: '2h', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`bg-gray-900/60 backdrop-blur-md sticky top-0 z-10 p-4 flex justify-between items-center border-b border-gray-800 ${className}`}>
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar transacciones, productos..."
          className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm w-80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Notificaciones */}
        <div className="relative">
          <button 
            className="relative text-gray-400 hover:text-white transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-xs text-white font-bold items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-30">
              <div className="flex justify-between items-center p-3 border-b border-gray-700">
                <h3 className="font-semibold text-white">Notificaciones</h3>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">Marcar todo como leído</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer ${
                      notification.read ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex justify-between">
                      <p className="text-sm font-semibold text-white">{notification.title}</p>
                      <span className="text-xs text-gray-400">{notification.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center border-t border-gray-700">
                <Link href="/admin/notifications" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Ver todas las notificaciones
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Perfil de usuario */}
        <div className="relative">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img 
              src="https://i.pravatar.cc/40?u=admin" 
              alt="Usuario" 
              className="w-10 h-10 rounded-full border-2 border-gray-700" 
            />
            <div className="text-sm text-right">
              <span className="font-semibold text-white">Admin</span>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
            />
          </div>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-30">
              <div className="p-3 border-b border-gray-700">
                <p className="text-sm font-semibold text-white">Administrador</p>
                <p className="text-xs text-gray-400">admin@neoptica.com</p>
              </div>
              <div>
                <Link 
                  href="/admin/profile" 
                  className="flex items-center gap-2 p-3 hover:bg-gray-700 transition-colors text-sm text-gray-300"
                >
                  <User size={16} />
                  <span>Mi Perfil</span>
                </Link>
                <Link 
                  href="/admin/settings" 
                  className="flex items-center gap-2 p-3 hover:bg-gray-700 transition-colors text-sm text-gray-300"
                >
                  <Settings size={16} />
                  <span>Configuración</span>
                </Link>
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    window.location.href = '/auth/login';
                  }}
                  className="flex items-center gap-2 p-3 hover:bg-gray-700 transition-colors text-sm text-gray-300 w-full text-left border-t border-gray-700"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
