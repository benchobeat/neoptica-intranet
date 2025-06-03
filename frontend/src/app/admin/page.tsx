"use client";

import React, { useState } from "react";
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
type CardProps = React.PropsWithChildren<{
  className?: string;
  [key: string]: any;
}>;

const Card = React.memo(({ children, className = "", ...props }: CardProps) => (
  <div className={`bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg ${className}`} {...props}>
    {children}
  </div>
));
Card.displayName = "Card";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change: string;
  changeType: "increase" | "decrease";
};

const StatCard = React.memo(({ title, value, icon: Icon, change, changeType }: StatCardProps) => (
  <Card className="p-5 hover:bg-gray-800 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <button className="text-gray-500 hover:text-white"><MoreVertical size={18}/></button>
    </div>
    <div className="flex justify-between items-end">
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          <ArrowUpRight size={14} className={`${changeType === "increase" ? "text-green-400" : "text-red-400 rotate-90"}`}/>
          <span className={`text-xs font-semibold ${changeType === "increase" ? "text-green-400" : "text-red-400"}`}>{change}</span>
          <span className="text-xs text-gray-500">vs mes anterior</span>
        </div>
      </div>
      <Icon size={32} className="text-gray-600" />
    </div>
  </Card>
));
StatCard.displayName = "StatCard";

type ActivityItemProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
};

const ActivityItem = React.memo(({ icon: Icon, title, description, time }: ActivityItemProps) => (
  <div className="flex items-start gap-4 py-3">
    <div className="bg-gray-800 p-2 rounded-lg">
      <Icon size={16} className="text-indigo-500" />
    </div>
    <div className="flex-1">
      <p className="text-white font-medium">{title}</p>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
    <p className="text-gray-500 text-xs">{time}</p>
  </div>
));
ActivityItem.displayName = "ActivityItem";

export default function AdminDashboardPage() {
  // Estado para los datos del dashboard (simulados)
  const [recentActivity] = useState([
    { 
      icon: User, 
      title: "Nuevo usuario registrado", 
      description: "Juan Pérez se ha registrado como cliente",
      time: "Hace 5 minutos"
    },
    { 
      icon: ShoppingBag, 
      title: "Nueva venta completada", 
      description: "Venta de $3,500 por María López (vendedor)",
      time: "Hace 30 minutos"
    },
    { 
      icon: Calendar, 
      title: "Cita agendada", 
      description: "Pedro García - Examen de la vista (Dr. Carlos)",
      time: "Hace 1 hora"
    },
    { 
      icon: PackageCheck, 
      title: "Nuevo producto agregado", 
      description: "Lentes de sol Ray-Ban Aviator",
      time: "Hace 3 horas"
    },
  ]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
        <p className="text-gray-400 mt-1">Estadísticas y actividad general</p>
      </div>
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ventas totales" 
          value="$45,200" 
          icon={Wallet} 
          change="12.5%" 
          changeType="increase" 
        />
        <StatCard 
          title="Nuevos clientes" 
          value="126" 
          icon={User} 
          change="8.2%" 
          changeType="increase" 
        />
        <StatCard 
          title="Citas agendadas" 
          value="48" 
          icon={Calendar} 
          change="4.1%" 
          changeType="decrease" 
        />
        <StatCard 
          title="Productos vendidos" 
          value="382" 
          icon={ShoppingBag} 
          change="15.3%" 
          changeType="increase" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de ventas (simulado) */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Ventas Mensuales</h2>
            <div className="flex gap-2">
              <button className="bg-gray-700 text-gray-300 px-3 py-1 rounded-lg text-sm">Mes</button>
              <button className="bg-gray-900 text-gray-400 hover:bg-gray-700 px-3 py-1 rounded-lg text-sm">Año</button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between px-4">
            {/* Simulación de gráfico de barras con Tailwind */}
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "40%" }}></div>
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "65%" }}></div>
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "45%" }}></div>
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "35%" }}></div>
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "55%" }}></div>
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "75%" }}></div>
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "50%" }}></div>
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "45%" }}></div>
            <div className="w-1/12 bg-indigo-600 rounded-t-md" style={{ height: "90%" }}></div>
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "65%" }}></div>
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "40%" }}></div>
            <div className="w-1/12 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-md" style={{ height: "35%" }}></div>
          </div>
          <div className="flex justify-between px-4 mt-2 text-xs text-gray-500">
            <span>Ene</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Abr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Ago</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dic</span>
          </div>
        </Card>
        
        {/* Actividad reciente */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h2>
          <div className="divide-y divide-gray-700/30">
            {recentActivity.map((item, index) => (
              <ActivityItem 
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
                time={item.time}
              />
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium">
            Ver todas las actividades
          </button>
        </Card>
      </div>
      
      {/* Acceso rápido a módulos */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Gestionar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link href="/admin/users" className="bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 transition-all p-4 rounded-xl flex items-center gap-3">
            <div className="p-3 rounded-lg bg-indigo-600/20">
              <User className="text-indigo-500" size={20} />
            </div>
            <span className="text-white font-medium">Usuarios</span>
          </Link>
          
          <Link href="/admin/branches" className="bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 transition-all p-4 rounded-xl flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-600/20">
              <Store className="text-green-500" size={20} />
            </div>
            <span className="text-white font-medium">Sucursales</span>
          </Link>
          
          <Link href="/admin/brands" className="bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 transition-all p-4 rounded-xl flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-600/20">
              <Bookmark className="text-blue-500" size={20} />
            </div>
            <span className="text-white font-medium">Marcas</span>
          </Link>
          
          <Link href="/admin/colors" className="bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 transition-all p-4 rounded-xl flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-600/20">
              <PaintBucket className="text-yellow-500" size={20} />
            </div>
            <span className="text-white font-medium">Colores</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
