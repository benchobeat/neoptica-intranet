"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  FilePlus2,
  Eye,
  Save,
  X,
} from "lucide-react";

// --- COMPONENTES DE UI REUTILIZABLES (Estilo Admin) ---

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

const Input = ({ className = "", ...props }) => (
    <input
        className={`bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm w-full text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${className}`}
        {...props}
    />
);

const Select = ({
    className = "",
    children,
    ...props
}: {
    className?: string;
    children: React.ReactNode;
    [key: string]: any;
}) => (
    <select
        className={`bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm w-full text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${className}`}
        {...props}
    >
        {children}
    </select>
);

const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1.5">{children}</label>
);


// --- COMPONENTES DE LAYOUT (Estilo Admin) ---

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
        <Calendar size={20} />
        <span>Agenda de Citas</span>
      </a>
      <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors">
        <ClipboardList size={20} />
        <span>Historial de Pacientes</span>
      </a>
       <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors">
        <Settings size={20} />
        <span>Configuración</span>
      </a>
    </nav>
    <div className="p-4 border-t border-gray-800">
      <div className="flex items-center gap-4">
        <img src="https://i.pravatar.cc/40?u=optometrista" alt="Optometrista" className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Dr. Kathia Mena</p>
          <p className="text-xs text-gray-500">optometrista@neoptica.com</p>
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
        placeholder="Buscar paciente, historial..."
        className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm w-80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      />
    </div>
    <div className="flex items-center space-x-6">
      <button className="relative text-gray-400 hover:text-white transition-colors">
        <Bell size={22} />
      </button>
      <div className="flex items-center space-x-3 cursor-pointer">
        <img src="https://i.pravatar.cc/40?u=optometrista" alt="Usuario" className="w-10 h-10 rounded-full border-2 border-gray-700" />
        <div className="text-sm text-right">
          <span className="font-semibold text-white">Dr. Kathia Mena</span>
          <p className="text-xs text-gray-500">Optometrista</p>
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </div>
    </div>
  </header>
);

const DashboardSkeleton = () => (
    <div className="flex bg-gray-900 text-white">
        <aside className="w-64 bg-gray-900 h-screen fixed top-0 left-0 border-r border-gray-800 p-6 space-y-4 animate-pulse">
            <div className="h-10 bg-gray-800 rounded-lg"></div>
            <div className="h-40 bg-gray-800 rounded-lg mt-8"></div>
        </aside>
        <main className="ml-64 flex-1 min-h-screen p-8 space-y-8">
            <div className="h-10 bg-gray-800 rounded-lg w-1/4 mb-10"></div>
            <div className="h-64 bg-gray-800 rounded-xl"></div>
            <div className="h-96 bg-gray-800 rounded-xl mt-8"></div>
        </main>
    </div>
);


// --- FORMULARIO DE RECETA (NUEVO COMPONENTE) ---

const RecetaForm = () => {
    // Aquí iría la lógica de estado para manejar los valores del formulario
    // Ejemplo: const [formData, setFormData] = useState({...});

    return (
        <Card>
            <div className="p-6 border-b border-gray-700/50">
                 <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                    <FilePlus2 size={22} className="text-indigo-400"/>
                    Crear Nueva Receta
                </h3>
                <p className="text-sm text-gray-400 mt-1">Completa los campos para generar la receta del paciente.</p>
            </div>
            <form className="p-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                       <Label htmlFor="citaId">ID de Cita</Label>
                       <Input id="citaId" name="citaId" type="text" placeholder="UUID de la cita" defaultValue="c3e3a3e3-..." disabled />
                    </div>
                     <div>
                        <Label htmlFor="tipo">Tipo de Lente</Label>
                        <Select id="tipo" name="tipo">
                            <option>Lejos</option>
                            <option>Cerca</option>
                            <option>Bifocal</option>
                            <option>Lentes de Contacto</option>
                        </Select>
                    </div>
                </div>

                {/* --- Tabla de Graduación --- */}
                <div className="overflow-x-auto mb-6">
                     <table className="w-full text-sm text-center text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800/80">
                            <tr>
                                <th className="px-4 py-3">Ojo</th>
                                <th className="px-4 py-3">Esfera (ESF)</th>
                                <th className="px-4 py-3">Cilindro (CIL)</th>
                                <th className="px-4 py-3">Eje</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-800">
                                <td className="px-4 py-3 font-medium text-white">Derecho (OD)</td>
                                <td><Input type="number" step="0.25" placeholder="-1.25" className="text-center" /></td>
                                <td><Input type="number" step="0.25" placeholder="-0.75" className="text-center" /></td>
                                <td><Input type="number" placeholder="180" className="text-center" /></td>
                            </tr>
                             <tr className="border-b border-gray-800">
                                <td className="px-4 py-3 font-medium text-white">Izquierdo (OI)</td>
                                <td><Input type="number" step="0.25" placeholder="-1.50" className="text-center" /></td>
                                <td><Input type="number" step="0.25" placeholder="-0.50" className="text-center" /></td>
                                <td><Input type="number" placeholder="175" className="text-center" /></td>
                            </tr>
                        </tbody>
                     </table>
                </div>

                {/* --- Campos Adicionales --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                     <div>
                        <Label htmlFor="adicion">Adición (ADD)</Label>
                        <Input id="adicion" name="adicion" type="number" step="0.25" placeholder="+1.75" />
                    </div>
                     <div>
                        <Label htmlFor="dp">Distancia Pupilar (DP)</Label>
                        <Input id="dp" name="dp" type="number" placeholder="63" />
                    </div>
                     <div>
                        <Label htmlFor="agudezaVisualOd">Agudeza Visual OD</Label>
                        <Input id="agudezaVisualOd" name="agudezaVisualOd" type="text" placeholder="20/20" />
                    </div>
                    <div>
                        <Label htmlFor="agudezaVisualOi">Agudeza Visual OI</Label>
                        <Input id="agudezaVisualOi" name="agudezaVisualOi" type="text" placeholder="20/25" />
                    </div>
                </div>

                {/* --- Observaciones --- */}
                <div className="mb-8">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <textarea
                        id="observaciones"
                        name="observaciones"
                        rows={4}
                        className="bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm w-full text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Tratamiento antirreflejante recomendado. Paciente refiere cansancio visual al final del día..."
                    ></textarea>
                </div>

                {/* --- Acciones del Formulario --- */}
                <div className="flex justify-end gap-4">
                    <Button variant="secondary" icon={X}>Cancelar</Button>
                    <Button variant="primary" icon={Save} type="submit">Guardar Receta</Button>
                </div>
            </form>
        </Card>
    );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function OptometristaDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [citas] = useState([
        { id: 1, paciente: "Carlos Ramírez", fecha: "2025-05-28 10:00 AM", motivo: "Examen de rutina" },
        { id: 2, paciente: "Elena Mendoza", fecha: "2025-05-28 11:30 AM", motivo: "Renovación de lentes" },
        { id: 3, paciente: "Luis Fernández", fecha: "2025-05-28 02:00 PM", motivo: "Molestia en ojo izquierdo" },
    ]);

    useEffect(() => {
        // Simula la verificación de rol y la carga de datos
        const storedRole = "optometrista"; // Simulado
        if (storedRole !== "optometrista") {
            router.replace("/");
        }
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
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
                        <h1 className="text-3xl font-bold text-white">Agenda del Día</h1>
                        <p className="text-gray-400 mt-1">Aquí están las citas programadas para hoy.</p>
                    </div>

                    {/* Tabla de Citas Mejorada */}
                    <Card>
                         <div className="p-6 flex justify-between items-center border-b border-gray-700/50">
                            <h3 className="text-lg font-semibold text-white">Citas Pendientes</h3>
                            <span className="text-sm bg-indigo-600/20 text-indigo-300 font-semibold px-3 py-1 rounded-full">{citas.length} pendientes</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="bg-gray-800/80 text-xs uppercase">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Paciente</th>
                                        <th scope="col" className="px-6 py-3">Hora</th>
                                        <th scope="col" className="px-6 py-3">Motivo</th>
                                        <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {citas.map((cita) => (
                                        <tr key={cita.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                                <img src={`https://i.pravatar.cc/32?u=${cita.paciente}`} className="w-8 h-8 rounded-full"/>
                                                {cita.paciente}
                                            </td>
                                            <td className="px-6 py-4">{cita.fecha}</td>
                                            <td className="px-6 py-4">{cita.motivo}</td>
                                            <td className="px-6 py-4 text-center">
                                                <Button variant="secondary" icon={FilePlus2}>
                                                    Crear Receta
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Formulario de Receta */}
                    <RecetaForm />

                </div>
            </main>
        </div>
    );
}