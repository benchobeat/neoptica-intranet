"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Check,
  Glasses,
  Package,
  User,
  Calendar,
  ClipboardList,
  PlusCircle
} from "lucide-react";
import Image from "next/image";

// Componentes reutilizables
const Card = React.memo(({ children, className = "", ...props }) => (
  <div className={`bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg ${className}`} {...props}>
    {children}
  </div>
));
Card.displayName = "Card";

const Button = React.memo(({ children, variant = "primary", className = "", ...props }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-indigo-600 hover:bg-indigo-700 text-white";
      case "secondary":
        return "bg-gray-700 hover:bg-gray-600 text-gray-100";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "outline":
        return "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800";
      default:
        return "bg-indigo-600 hover:bg-indigo-700 text-white";
    }
  };
  
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${getVariantClasses()} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

// Componente para los elementos de productos
const ProductItem = ({ product }) => {
  return (
    <div className="flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-lg transition-colors">
      <div className="flex-shrink-0 w-12 h-12 relative rounded-lg overflow-hidden">
        <Image 
          src={product.image}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{product.name}</p>
        <p className="text-xs text-gray-400">{product.category} • SKU: {product.sku}</p>
      </div>
      <div className="text-right">
        <p className="text-md font-bold text-white">${product.price}</p>
        <p className="text-xs text-gray-400">Stock: {product.stock}</p>
      </div>
    </div>
  );
};

// Componente para los elementos de ventas recientes
const SaleItem = ({ sale }) => {
  return (
    <div className="flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-lg transition-colors">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
        <User size={18} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{sale.customer}</p>
        <p className="text-xs text-gray-400">{sale.items} productos • {sale.date}</p>
      </div>
      <div className="text-right">
        <p className="text-md font-bold text-white">${sale.total}</p>
        <div className="flex items-center justify-end text-xs">
          <span className={`w-2 h-2 rounded-full ${sale.status === "Completada" ? "bg-green-500" : "bg-yellow-500"} mr-1`}></span>
          <span className={sale.status === "Completada" ? "text-green-400" : "text-yellow-400"}>{sale.status}</span>
        </div>
      </div>
    </div>
  );
};

export default function VendedorDashboardPage() {
  // Datos de ejemplo
  const [productos] = useState([
    { 
      id: 1, 
      name: "Ray-Ban Aviator Classic", 
      category: "Gafas de sol", 
      price: 1999, 
      stock: 15, 
      sku: "RB3025",
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1760&auto=format&fit=crop"
    },
    { 
      id: 2, 
      name: "Oakley Holbrook", 
      category: "Gafas de sol", 
      price: 2499, 
      stock: 8, 
      sku: "OO9102",
      image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=1470&auto=format&fit=crop"
    },
    { 
      id: 3, 
      name: "Lentes de contacto Acuvue", 
      category: "Lentes de contacto", 
      price: 450, 
      stock: 32, 
      sku: "AC2DAY",
      image: "https://images.unsplash.com/photo-1587333284936-47df3ab415a2?q=80&w=1631&auto=format&fit=crop"
    },
    { 
      id: 4, 
      name: "Armazón Gucci GG0396S", 
      category: "Armazones", 
      price: 3999, 
      stock: 5, 
      sku: "GC0396",
      image: "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1470&auto=format&fit=crop"
    },
  ]);
  
  const [recentSales] = useState([
    { 
      id: 1, 
      customer: "Juan Pérez", 
      items: 2, 
      total: 2449, 
      date: "Hace 30 min", 
      status: "Completada" 
    },
    { 
      id: 2, 
      customer: "María Rodríguez", 
      items: 1, 
      total: 3999, 
      date: "Hace 1h", 
      status: "Completada" 
    },
    { 
      id: 3, 
      customer: "Carlos Gómez", 
      items: 3, 
      total: 1350, 
      date: "Hace 2h", 
      status: "En proceso" 
    },
    { 
      id: 4, 
      customer: "Ana López", 
      items: 1, 
      total: 2499, 
      date: "Hace 3h", 
      status: "Completada" 
    },
  ]);
  
  const [stats] = useState({
    dailySales: 12450,
    dailySalesChange: "+15%",
    customers: 8,
    customersChange: "+5%",
    averageTicket: 1556,
    averageTicketChange: "+8%"
  });
  
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Panel de Ventas</h1>
        <p className="text-gray-400 mt-1">Gestión de ventas y productos</p>
      </div>
      
      {/* Estadísticas del día */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Ventas del día</p>
              <p className="text-3xl font-bold text-white mt-1">${stats.dailySales}</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-600/20">
              <DollarSign className="text-indigo-500" size={20} />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-green-400 text-xs font-semibold">{stats.dailySalesChange}</span>
            <span className="text-xs text-gray-500 ml-1">vs ayer</span>
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Clientes atendidos</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.customers}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-600/20">
              <Users className="text-green-500" size={20} />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-green-400 text-xs font-semibold">{stats.customersChange}</span>
            <span className="text-xs text-gray-500 ml-1">vs ayer</span>
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Ticket promedio</p>
              <p className="text-3xl font-bold text-white mt-1">${stats.averageTicket}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-600/20">
              <TrendingUp className="text-blue-500" size={20} />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-green-400 text-xs font-semibold">{stats.averageTicketChange}</span>
            <span className="text-xs text-gray-500 ml-1">vs ayer</span>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos populares */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Productos populares</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-1.5 text-sm w-40 md:w-60 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <Button variant="outline" className="p-2">
                <Filter size={16} />
              </Button>
            </div>
          </div>
          
          <div className="space-y-1">
            {productos.map(producto => (
              <ProductItem key={producto.id} product={producto} />
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4 flex items-center justify-center">
            Ver todos los productos
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </Card>
        
        {/* Ventas recientes */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Ventas recientes</h2>
          
          <div className="space-y-1">
            {recentSales.map(sale => (
              <SaleItem key={sale.id} sale={sale} />
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4 flex items-center justify-center">
            Ver todas las ventas
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </Card>
      </div>
      
      {/* Acciones rápidas */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="flex items-center justify-center gap-2">
            <ShoppingBag size={16} />
            Nueva venta
          </Button>
          <Button variant="secondary" className="flex items-center justify-center gap-2">
            <User size={16} />
            Nuevo cliente
          </Button>
          <Button variant="secondary" className="flex items-center justify-center gap-2">
            <Calendar size={16} />
            Agendar cita
          </Button>
          <Button variant="secondary" className="flex items-center justify-center gap-2">
            <ClipboardList size={16} />
            Reportes
          </Button>
        </div>
      </div>
    </div>
  );
}
