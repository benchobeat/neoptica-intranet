"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Wallet,
  FileText,
  Archive,
  Calendar,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  MoreVertical,
  ArrowUpRight,
  User,
  ShoppingBag,
  PackageCheck
} from "lucide-react";

// --- COMPONENTES DE UI REUTILIZABLES ---

// Componente de Tarjeta base para consistencia
const Card = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg ${className}`} {...props}>
    {children}
  </div>
);

// --- COMPONENTES DEL DASHBOARD MEJORADOS ---

const Sidebar = () => (
  <aside className="w-64 bg-gray-900 text-gray-400 h-screen fixed top-0 left-0 flex flex-col border-r border-gray-800">
    <div className="p-6 text-2xl font-bold text-white border-b border-gray-800 flex items-center gap-2">
      <div className="bg-indigo-600 p-2 rounded-lg">
        <LayoutDashboard />
      </div>
      <span>Neóptica</span>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-indigo-600/20 text-white transition-colors">
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </a>
      <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors">
        <BarChart3 size={20} />
        <span>Analytics</span>
      </a>
      <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors">
        <Settings size={20} />
        <span>Configuración</span>
      </a>
    </nav>
    <div className="p-4 border-t border-gray-800">
      <div className="flex items-center gap-4">
        <img src="https://i.pravatar.cc/40?u=admin" alt="Admin" className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Admin</p>
          <p className="text-xs text-gray-500">admin@neoptica.com</p>
        </div>
        <button className="text-gray-500 hover:text-white">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  </aside>
);

const Header = () => (
  <header className="bg-gray-900/60 backdrop-blur-md sticky top-0 z-10 p-4 flex justify-between items-center border-b border-gray-800">
    <div className="relative">
      <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        placeholder="Buscar transacciones, productos..."
        className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm w-80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      />
    </div>
    <div className="flex items-center space-x-6">
      <button className="relative text-gray-400 hover:text-white transition-colors">
        <Bell size={22} />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </button>
      <div className="flex items-center space-x-3 cursor-pointer">
        <img src="https://i.pravatar.cc/40?u=admin" alt="Usuario" className="w-10 h-10 rounded-full border-2 border-gray-700" />
        <div className="text-sm text-right">
          <span className="font-semibold text-white">Admin</span>
          <p className="text-xs text-gray-500">Administrador</p>
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </div>
    </div>
  </header>
);

const StatCard = ({ title, value, icon: Icon, change, changeType }: { title: string; value: string; icon: React.ElementType; change: string, changeType: 'increase' | 'decrease' }) => (
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
);

const ActivityItem = ({ icon: Icon, title, description, time }: { icon: React.ElementType, title: string, description: string, time: string }) => (
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
);


const DashboardSkeleton = () => (
  <div className="flex bg-gray-900 text-white">
    <aside className="w-64 bg-gray-900 h-screen fixed top-0 left-0 border-r border-gray-800 p-6 space-y-4 animate-pulse">
        <div className="h-10 bg-gray-800 rounded-lg"></div>
        <div className="h-80 bg-gray-800 rounded-lg mt-8"></div>
    </aside>
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

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula la verificación de rol y la carga de datos
    const storedRole = "admin"; // Simulado para demostración
    if (storedRole !== "admin") {
      router.replace("/");
    }

    // Simula un tiempo de carga de datos de la API
    const timer = setTimeout(() => {
        setLoading(false);
    }, 1500); // 1.5 segundos de carga

    return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
  }, [router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex bg-gray-900 text-white">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen">
        <Header />
        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Bienvenido de nuevo, aquí está el resumen de tu óptica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Ingresos Totales" value="$12,380" icon={Wallet} change="+12.5%" changeType="increase" />
            <StatCard title="Facturas Emitidas" value="215" icon={FileText} change="+5.2%" changeType="increase" />
            <StatCard title="Nuevos Clientes" value="32" icon={User} change="-2.1%" changeType="decrease" />
            <StatCard title="Citas Programadas" value="48" icon={Calendar} change="+8.0%" changeType="increase" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <section className="lg:col-span-3">
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Resumen de Ventas</h3>
                            <p className="text-sm text-gray-400">Últimos 6 meses</p>
                        </div>
                        <select className="bg-gray-800 border border-gray-700 rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option>Este Año</option>
                            <option>Últimos 30 días</option>
                        </select>
                    </div>
                    <div className="h-80 bg-gradient-to-t from-indigo-900/10 to-transparent rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">[Componente de Gráfico - ej. Recharts]</p>
                    </div>
                </Card>
            </section>
            
            <section className="lg:col-span-2">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
                    <div className="space-y-2">
                       <ActivityItem icon={ShoppingBag} title="Nueva Venta #1254" description="Armazón Ray-Ban + Micas Blue-Light" time="2 min ago"/>
                       <ActivityItem icon={PackageCheck} title="Producto Recibido" description="50 unidades de Acuvue Oasys" time="1 hr ago"/>
                       <ActivityItem icon={User} title="Nuevo Cliente Registrado" description="Juan Pérez" time="3 hrs ago"/>
                       <ActivityItem icon={ShoppingBag} title="Nueva Venta #1253" description="Lentes de contacto Biofinity" time="5 hrs ago"/>
                    </div>
                </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}