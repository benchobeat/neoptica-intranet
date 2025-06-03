"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  UserPlus,
  Trash2,
  PackageSearch,
  User,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";

// --- COMPONENTES DE UI REUTILIZABLES (Tomados del Dashboard de Admin para consistencia) ---

// Componente de Tarjeta base para un look & feel unificado
const Card = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg ${className}`} {...props}>
    {children}
  </div>
);

// Botón con estilos consistentes a través de la aplicación
const Button = ({ children, className = "", variant = 'primary', icon: Icon, ...props }: { children: React.ReactNode; className?: string; variant?: 'primary' | 'secondary' | 'danger'; icon?: React.ElementType; [key: string]: any }) => {
    const baseClasses = "py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500",
        secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500",
        danger: "bg-red-600/20 hover:bg-red-600/40 text-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {Icon && <Icon size={16} />}
            {children}
        </button>
    );
};


// --- COMPONENTES DE LAYOUT (Tomados del Dashboard de Admin) ---

const Sidebar = () => (
    <aside className="w-64 bg-gray-900 text-gray-400 h-screen fixed top-0 left-0 flex flex-col border-r border-gray-800">
        <div className="p-6 text-2xl font-bold text-white border-b border-gray-800 flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <LayoutDashboard />
            </div>
            <span>Neóptica</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            {/* Se adaptan los links para el rol de Vendedor */}
            <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-indigo-600/20 text-white transition-colors">
                <ShoppingBag size={20} />
                <span>Nueva Venta</span>
            </a>
            <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                <BarChart3 size={20} />
                <span>Historial</span>
            </a>
            <a href="#" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                <User size={20} />
                <span>Clientes</span>
            </a>
        </nav>
        <div className="p-4 border-t border-gray-800">
            {/* Se actualiza el perfil para el Vendedor */}
            <div className="flex items-center gap-4">
                <Image src="https://i.pravatar.cc/40?u=vendedor" alt="Vendedor" width={40} height={40} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Ana López</p>
                    <p className="text-xs text-gray-500">vendedor@neoptica.com</p>
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
            {/* El buscador ahora busca productos, es más relevante para el vendedor */}
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
                type="text"
                placeholder="Buscar productos o clientes..."
                className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm w-80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
        </div>
        <div className="flex items-center space-x-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
                <Bell size={22} />
            </button>
            <div className="flex items-center space-x-3 cursor-pointer">
                <Image src="https://i.pravatar.cc/40?u=vendedor" alt="Usuario" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-gray-700" />
                <div className="text-sm text-right">
                    <span className="font-semibold text-white">Ana López</span>
                    <p className="text-xs text-gray-500">Vendedor</p>
                </div>
                <ChevronDown size={16} className="text-gray-500" />
            </div>
        </div>
    </header>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA DE VENDEDOR ---

export default function VendedorDashboardPage() {
    const [selectedProducts, setSelectedProducts] = useState([
        { id: 1, name: "Armazón Ray-Ban Aviator", price: 155.00, stock: 5, quantity: 1 },
        { id: 2, name: "Micas Blue-Light 1.67", price: 95.00, stock: 12, quantity: 1 },
    ]);

    const handleRemoveProduct = (id: number) => {
        setSelectedProducts(selectedProducts.filter((product) => product.id !== id));
    };
    
    // Función de ejemplo para añadir producto
    const handleAddProduct = () => {
        const newProduct = { id: Date.now(), name: "Lentes de Contacto Acuvue", price: 45.00, stock: 20, quantity: 1 };
        setSelectedProducts([...selectedProducts, newProduct]);
    };

    const subtotal = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const iva = subtotal * 0.12;
    const total = subtotal + iva;

    return (
        <div className="flex bg-gray-900 text-white">
            <Sidebar />
            <main className="ml-64 flex-1 min-h-screen">
                <Header />
                <div className="p-8 space-y-8">
                    {/* Sección de Título y Acciones Principales */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Nueva Venta</h1>
                            <p className="text-gray-400 mt-1">Busca un cliente y añade productos para generar una factura.</p>
                        </div>
                        <div className="flex gap-3">
                           <Button variant="secondary">Guardar Borrador</Button>
                           <Button variant="primary" className="bg-green-600 hover:bg-green-500 focus:ring-green-500">
                                Finalizar y Facturar
                           </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna Izquierda: Detalles de la Venta */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Card para buscar Cliente */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Cliente</h3>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                      <input
                                        type="text"
                                        placeholder="Buscar por nombre o cédula..."
                                        className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm w-full text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <Button variant="primary" icon={UserPlus}>
                                        Nuevo Cliente
                                    </Button>
                                </div>
                            </Card>

                            {/* Card para la Tabla de Productos */}
                            <Card>
                                <div className="p-6 flex justify-between items-center border-b border-gray-700/50">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Productos en la Venta</h3>
                                        <p className="text-sm text-gray-400">{selectedProducts.length} items</p>
                                    </div>
                                    <Button variant="secondary" icon={PackageSearch} onClick={handleAddProduct}>
                                        Añadir Producto
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="bg-gray-800/80">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">Producto</th>
                                                <th className="px-6 py-3 font-medium text-center">Cantidad</th>
                                                <th className="px-6 py-3 font-medium text-right">P. Unitario</th>
                                                <th className="px-6 py-3 font-medium text-right">Subtotal</th>
                                                <th className="px-6 py-3 font-medium text-center">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedProducts.map((product) => (
                                                <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                                                    <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <input
                                                            type="number"
                                                            value={product.quantity}
                                                            min={1}
                                                            max={product.stock}
                                                            onChange={(e) =>
                                                                setSelectedProducts((prev) =>
                                                                    prev.map((p) =>
                                                                        p.id === product.id ? { ...p, quantity: +e.target.value } : p
                                                                    )
                                                                )
                                                            }
                                                            className="w-20 bg-gray-900 border border-gray-700 rounded-md py-1 px-2 text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">${product.price.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-medium text-white">${(product.price * product.quantity).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => handleRemoveProduct(product.id)} className="text-gray-500 hover:text-red-400 p-2 rounded-full transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>

                        {/* Columna Derecha: Resumen de la Venta */}
                        <div className="lg:col-span-1">
                            <Card className="p-6 sticky top-28"> {/* Sticky para que el resumen siempre sea visible */}
                                <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-4 mb-4">Resumen de la Venta</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center text-gray-400">
                                        <p>Subtotal</p>
                                        <p className="font-mono text-gray-200">${subtotal.toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-400">
                                        <p>IVA (12%)</p>
                                        <p className="font-mono text-gray-200">${iva.toFixed(2)}</p>
                                    </div>
                                    <div className="border-t border-dashed border-gray-700 my-4"></div>
                                    <div className="flex justify-between items-center text-white font-bold text-lg">
                                        <p>Total</p>
                                        <p className="font-mono">${total.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="mt-6 border-t border-gray-700/50 pt-6">
                                    <Button variant="primary" className="w-full bg-green-600 hover:bg-green-500 focus:ring-green-500">
                                        Finalizar y Facturar
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}