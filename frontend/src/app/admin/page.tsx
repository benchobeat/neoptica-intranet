"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  FileText,
  Calendar,
  User,
  ShoppingBag,
  Store,
  ArrowUpRight,
  MoreVertical,
  PackageCheck,
  PaintBucket,
  Bookmark
} from "lucide-react";
import Link from "next/link";

// Componentes reutilizables para el dashboard memoizados para mejorar rendimiento
const Card = React.memo(({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg ${className}`} {...props}>
    {children}
  </div>
));
Card.displayName = "Card";

const StatCard = React.memo(({ title, value, icon: Icon, change, changeType }: { title: string; value: string; icon: React.ElementType; change: string, changeType: 'increase' | 'decrease' }) => (
  <Card className="p-5 hover:bg-gray-800 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <button className="text-gray-500 hover:text-white"><MoreVertical size={18}/></button>
    </div>
    <div className="flex justify-between items-end">
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          <ArrowUpRight size={14} className={`${changeType === 'increase' ? 'text-green-400' : 'text-red-400 rotate-90'}`}/>
          <span className={`text-xs font-semibold ${changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>{change}</span>
          <span className="text-xs text-gray-500">vs mes anterior</span>
        </div>
      </div>
      <Icon size={32} className="text-gray-600" />
    </div>
  </Card>
));
StatCard.displayName = "StatCard";

const ActivityItem = React.memo(({ icon: Icon, title, description, time }: { icon: React.ElementType, title: string, description: string, time: string }) => (
  <div className="flex items-start gap-4 py-3">
    <div className="bg-gray-800 border border-gray-700 p-2.5 rounded-full">
      <Icon size={18} className="text-gray-400"/>
    </div>
    <div className="flex-1">
      <p className="text-sm text-white font-medium">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
    <p className="text-sm text-gray-500">{time}</p>
  </div>
));
ActivityItem.displayName = "ActivityItem";

const ModuleCard = React.memo(({ icon: Icon, title, description, path, count }: { icon: React.ElementType, title: string, description: string, path: string, count?: number }) => (
  <Link href={path}>
    <Card className="p-5 hover:bg-gray-800 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
      <div className="flex items-center mb-3">
        <div className="bg-indigo-600/20 p-3 rounded-lg mr-3">
          <Icon size={20} className="text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      {count !== undefined && (
        <div className="mt-auto pt-2 border-t border-gray-700">
          <p className="text-sm">
            <span className="text-white font-semibold">{count}</span>
            <span className="text-gray-400"> elementos</span>
          </p>
        </div>
      )}
    </Card>
  </Link>
));
ModuleCard.displayName = "ModuleCard";

export default function AdminDashboardPage() {
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      icon: PackageCheck,
      title: "Entrada de inventario",
      description: "Se registraron 120 unidades de marcos Ray-Ban",
      time: "10 min"
    },
    {
      id: 2,
      icon: User,
      title: "Nuevo usuario",
      description: "Se creó la cuenta para el optometrista Carlos Ramírez",
      time: "2 horas"
    },
    {
      id: 3,
      icon: Store,
      title: "Nueva sucursal",
      description: "Se agregó la sucursal Plaza Norte",
      time: "5 horas"
    },
    {
      id: 4,
      icon: PaintBucket,
      title: "Nuevo color",
      description: "Se agregó el color Azul Océano al catálogo",
      time: "1 día"
    },
    {
      id: 5,
      icon: Bookmark,
      title: "Nueva marca",
      description: "Se registró la marca Oakley en el sistema",
      time: "1 día"
    }
  ]);

  const [moduleStats, setModuleStats] = useState({
    sucursales: 8,
    marcas: 24,
    colores: 42
  });

  // En un caso real, aquí cargaríamos datos desde la API
  useEffect(() => {
    // Simular carga de datos
    // En implementación real:
    // const fetchData = async () => {
    //   try {
    //     const activityResponse = await fetch('/api/activity/recent');
    //     const statsResponse = await fetch('/api/dashboard/stats');
    //     const moduleResponse = await fetch('/api/dashboard/modules');
    //     
    //     const activityData = await activityResponse.json();
    //     const statsData = await statsResponse.json();
    //     const moduleData = await moduleResponse.json();
    //
    //     setRecentActivity(activityData);
    //     setModuleStats(moduleData);
    //   } catch (error) {
    //     console.error('Error fetching dashboard data:', error);
    //   }
    // };
    //
    // fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Bienvenido de nuevo, aquí está el resumen de tu óptica.</p>
      </div>

      {/* Estadísticas clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ingresos Totales" 
          value="$12,380" 
          icon={Wallet} 
          change="+12.5%" 
          changeType="increase" 
        />
        <StatCard 
          title="Facturas Emitidas" 
          value="215" 
          icon={FileText} 
          change="+5.2%" 
          changeType="increase" 
        />
        <StatCard 
          title="Nuevos Clientes" 
          value="32" 
          icon={User} 
          change="-2.1%" 
          changeType="decrease" 
        />
        <StatCard 
          title="Citas Programadas" 
          value="48" 
          icon={Calendar} 
          change="+8.0%" 
          changeType="increase" 
        />
      </div>

      {/* Módulos y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Módulos principales */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4">Módulos Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usamos useMemo para las cards del módulo para evitar re-renders innecesarios */}
            {useMemo(() => (
              <>
                <ModuleCard 
                  icon={Store}
                  title="Sucursales"
                  description="Gestiona todas las sucursales de la óptica"
                  path="/admin/branches"
                  count={moduleStats.sucursales}
                />
                <ModuleCard 
                  icon={Bookmark}
                  title="Marcas"
                  description="Administra las marcas de productos disponibles"
                  path="/admin/brands"
                  count={moduleStats.marcas}
                />
                <ModuleCard 
                  icon={PaintBucket}
                  title="Colores"
                  description="Gestiona los colores de los productos"
                  path="/admin/colors"
                  count={moduleStats.colores}
                />
                <ModuleCard 
                  icon={ShoppingBag}
                  title="Inventario"
                  description="Control de stock y movimientos de productos"
                  path="/admin/inventory"
                />
              </>
            ), [moduleStats])
          }</div>
        </div>

        {/* Actividad Reciente */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Actividad Reciente</h2>
              <Link href="/admin/activity" className="text-indigo-400 text-sm hover:text-indigo-300">
                Ver todo
              </Link>
            </div>
            <div className="space-y-1 divide-y divide-gray-800">
              {/* Memoizamos el listado de actividades para prevenir re-renders innecesarios */}
              {useMemo(() => (
                recentActivity.map(activity => (
                  <ActivityItem 
                    key={activity.id}
                    icon={activity.icon}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                  />
                ))
              ), [recentActivity])}            
            </div>
          </Card>
        </div>
      </div>

      {/* Registros de Auditoría */}
      <div>
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Registros de Auditoría</h2>
            <Link href="/admin/audit" className="text-indigo-400 text-sm hover:text-indigo-300">
              Ver completo
            </Link>
          </div>
          <p className="text-gray-400 mb-4">Últimos registros de actividad del sistema para seguimiento y control.</p>
          <div className="bg-gray-900/60 p-4 rounded-lg text-sm text-gray-400">
            <p className="mb-2">2023-05-31 00:01:23 - [admin] - Actualización de marca - ID: 14</p>
            <p className="mb-2">2023-05-30 23:45:11 - [vendedor] - Creación de cliente - ID: 156</p>
            <p className="mb-2">2023-05-30 22:30:45 - [admin] - Creación de color - ID: 42</p>
            <p className="mb-2">2023-05-30 21:15:32 - [admin] - Actualización de sucursal - ID: 8</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
