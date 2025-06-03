"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Eye,
  Calendar,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  Receipt
} from "lucide-react";
import Image from "next/image";

// --- COMPONENTES DE UI (Consistentes con el resto de dashboards) ---

const Card = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ children, className = "", variant = "primary", icon: Icon, ...props }: { children: React.ReactNode; className?: string; variant?: "primary" | "secondary" | "danger"; icon?: React.ElementType; [key: string]: any }) => {
    const baseClasses = "py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none";
    const variantClasses = {
      primary: "bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500",
      secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500",
      danger: "bg-red-600/20 hover:bg-red-600/40 text-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500",
    };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

// --- COMPONENTES DE LAYOUT (Consistentes con el resto de dashboards) ---

const Sidebar = () => (
  <aside className="w-64 bg-gray-900 text-gray-400 h-screen fixed top-0 left-0 flex flex-col border-r border-gray-800">
    <div className="p-6 text-2xl font-bold text-white border-b border-gray-800 flex items-center gap-2">
      <div className="bg-indigo-600 p-2 rounded-lg">
        <Eye />
      </div>
      <span>Neóptica</span>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-indigo-600/20 text-white transition-colors">
        <User size={20} />
        <span>Mi Perfil</span>
      </a>
      <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors">
        <Calendar size={20} />
        <span>Mis Citas</span>
      </a>
      <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors">
        <Receipt size={20} />
        <span>Mis Recetas</span>
      </a>
      <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors">
        <ShoppingBag size={20} />
        <span>Mis Compras</span>
      </a>
    </nav>
    <div className="p-4 border-t border-gray-800">
      <div className="flex items-center gap-4">
        <Image src="https://i.pravatar.cc/40?u=cliente" alt="Cliente" width={40} height={40} className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Juan Pérez</p>
          <p className="text-xs text-gray-500">cliente@ejemplo.com</p>
        </div>
        <button 
          className="text-gray-500 hover:text-white"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('activeRole');
            localStorage.removeItem('roles');
            window.location.href = '/auth/login';
          }}
        >
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
        placeholder="Buscar en mi cuenta..."
        className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm w-80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      />
    </div>
    <div className="flex items-center space-x-6">
      <button className="relative text-gray-400 hover:text-white transition-colors">
        <Bell size={22} />
      </button>
      <div className="flex items-center space-x-3 cursor-pointer">
        <Image src="https://i.pravatar.cc/40?u=cliente" alt="Usuario" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-gray-700" />
        <div className="text-sm text-right">
          <span className="font-semibold text-white">Juan Pérez</span>
          <p className="text-xs text-gray-500">Cliente</p>
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </div>
    </div>
  </header>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA DE CLIENTE ---

export default function ClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Datos de ejemplo para el dashboard
  const [citas] = useState([
    { id: 1, fecha: "2025-06-10 15:30", tipo: "Examen de la vista", doctor: "Dra. Kathia Mena" },
    { id: 2, fecha: "2025-07-15 10:00", tipo: "Seguimiento", doctor: "Dr. Carlos Suárez" },
  ]);

  const [recetas] = useState([
    { id: 1, fecha: "2025-05-20", tipo: "Lentes de descanso", vigencia: "6 meses" },
  ]);

  useEffect(() => {
    // Simulamos verificación de rol y carga de datos
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex bg-gray-900 text-white h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-900 text-white">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen">
        <Header />
        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Mi Cuenta</h1>
            <p className="text-gray-400 mt-1">Bienvenido a tu área personal, Juan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Próximas Citas */}
            <Card>
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-lg font-semibold text-white">Próximas Citas</h3>
              </div>
              <div className="p-6">
                {citas.length > 0 ? (
                  <ul className="space-y-4">
                    {citas.map((cita) => (
                      <li key={cita.id} className="border border-gray-700/30 rounded-lg p-4">
                        <div className="flex justify-between">
                          <p className="font-medium text-white">{cita.tipo}</p>
                          <span className="text-xs bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded">
                            {new Date(cita.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Doctor: {cita.doctor}</p>
                        <p className="text-sm text-gray-400">
                          Hora: {new Date(cita.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tienes citas programadas</p>
                    <Button variant="primary" className="mt-4">
                      Solicitar una cita
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Recetas Activas */}
            <Card>
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-lg font-semibold text-white">Recetas Activas</h3>
              </div>
              <div className="p-6">
                {recetas.length > 0 ? (
                  <ul className="space-y-4">
                    {recetas.map((receta) => (
                      <li key={receta.id} className="border border-gray-700/30 rounded-lg p-4">
                        <div className="flex justify-between">
                          <p className="font-medium text-white">{receta.tipo}</p>
                          <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded">
                            Vigente
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                          Fecha: {receta.fecha}
                        </p>
                        <p className="text-sm text-gray-400">
                          Vigencia: {receta.vigencia}
                        </p>
                        <button className="text-indigo-400 text-sm mt-3 flex items-center gap-1 hover:text-indigo-300">
                          <Eye size={14} /> Ver receta
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tienes recetas activas</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}