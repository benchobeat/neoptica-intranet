"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// NOTA: Importamos los íconos de lucide-react. Asegúrate de instalar la librería: npm install lucide-react
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
  ChevronDown
} from "lucide-react";

// --- COMPONENTES REUTILIZABLES MEJORADOS ---

// Componente de Tarjeta base para mantener la consistencia visual
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

// Componente para el menú lateral rediseñado
const Sidebar = () => (
  <aside className="w-64 bg-gray-800 text-gray-300 h-screen fixed top-0 left-0 flex flex-col">
    <div className="p-6 text-2xl font-bold text-white border-b border-gray-700">
      Neóptica
    </div>
    <nav className="flex-1 p-4 space-y-2">
      {/* NOTA: Se añade un indicador de página activa (bg-blue-600) y un ícono para cada enlace. */}
      <a href="#" className="flex items-center gap-3 py-2 px-4 rounded bg-blue-600 text-white transition-colors">
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </a>
      <a href="#" className="flex items-center gap-3 py-2 px-4 rounded hover:bg-gray-700 transition-colors">
        <BarChart3 size={20} />
        <span>Analytics</span>
      </a>
      <a href="#" className="flex items-center gap-3 py-2 px-4 rounded hover:bg-gray-700 transition-colors">
        <Settings size={20} />
        <span>Configuración</span>
      </a>
    </nav>
    <div className="p-4 border-t border-gray-700">
      {/* Espacio para un perfil de usuario o botón de logout */}
    </div>
  </aside>
);

// Componente para el encabezado superior rediseñado
const Header = () => (
  <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
    {/* NOTA: Se añade un campo de búsqueda, un patrón común y útil en dashboards. */}
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar..."
        className="bg-gray-100 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="flex items-center space-x-6">
      <button className="text-gray-500 hover:text-gray-800">
        <Bell size={22} />
      </button>
      <div className="flex items-center space-x-3 cursor-pointer">
        <img
          src="https://i.pravatar.cc/40?u=admin" // Placeholder de avatar más realista
          alt="Usuario"
          className="w-10 h-10 rounded-full border-2 border-gray-200"
        />
        <div className="text-sm">
          <span className="font-semibold text-gray-800">Admin</span>
          <ChevronDown size={16} className="inline text-gray-500" />
        </div>
      </div>
    </div>
  </header>
);

// Componente para las tarjetas de estadísticas (KPI) rediseñado
const StatCard = ({ title, value, icon: Icon, change }: { title: string; value: string | number; icon: React.ElementType; change?: string }) => (
  <Card className="flex items-center justify-between">
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      {change && <p className="text-xs text-gray-400 mt-1">{change}</p>}
    </div>
    <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
      <Icon size={24} />
    </div>
  </Card>
);

// --- PÁGINA PRINCIPAL DEL DASHBOARD ---

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = "admin"; // Simulado para demostración, en producción usarías localStorage.getItem("role");
    setRole(storedRole);

    if (storedRole !== "admin") {
      router.replace("/");
    }
  }, [router]);

  if (role !== "admin") {
    // Muestra un loader o un esqueleto mientras se verifica el rol
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    // NOTA: El color de fondo principal ahora es un gris claro para un look más suave.
    <div className="flex bg-gray-50">
      <Sidebar />

      {/* Contenido principal con el margen izquierdo correcto */}
      <main className="ml-64 flex-1 min-h-screen">
        <Header />

        <div className="p-8 space-y-8">
          {/* Título de la página */}
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          
          {/* KPIs rediseñados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Ventas Hoy" value="$1,200" icon={Wallet} change="+12% vs ayer" />
            <StatCard title="Facturas Emitidas" value={15} icon={FileText} change="+5.2% vs mes anterior" />
            <StatCard title="Stock Bajo" value={6} icon={Archive} />
            <StatCard title="Citas Hoy" value={12} icon={Calendar} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna principal para el gráfico */}
            <div className="lg:col-span-2">
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Gráfico de Ventas Anuales</h3>
                <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">[Aquí iría un componente de gráfico]</p>
                </div>
              </Card>
            </div>
            
            {/* Columna secundaria para widgets */}
            <div className="space-y-8">
              <Card>
                  <div className="text-center">
                    <span className="text-5xl">🎉</span>
                    <h2 className="text-xl font-bold mt-2">¡Felicidades, Admin!</h2>
                    <p className="text-gray-600 mt-2">
                      Has vendido un <span className="font-bold text-green-500">65% más</span> que el año pasado. ¡Sigue así!
                    </p>
                    <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Ver Reporte Detallado
                    </button>
                  </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}