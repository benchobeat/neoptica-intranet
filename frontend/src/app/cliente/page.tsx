"use client";

import React from "react";
import Image from "next/image";
import {
  Calendar,
  FileText,
  ShoppingBag,
  Clock,
  Eye,
  Download,
  PlusCircle,
  MapPin,
  Phone
} from "lucide-react";

// Componentes reutilizables
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.memo<CardProps>(({ children, className, ...props }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-indigo-500/20 ${className || ''}`} {...props}>
    {children}
  </div>
));
Card.displayName = "Card";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button = React.memo<ButtonProps>(({ children, variant = "primary", className, ...props }) => {
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
        // Exhaustiveness check for variant
        const _exhaustiveCheck: never = variant;
        return "bg-indigo-600 hover:bg-indigo-700 text-white";
    }
  };
  
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${getVariantClasses()} ${className || ''}`} 
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

// Componente para las citas
interface AppointmentCardProps {
  date: string;
  time: string;
  doctor: string;
  branch: string;
  status: "completed" | "upcoming" | "cancelled" | string;
}
const AppointmentCard = ({ date, time, doctor, branch, status }: AppointmentCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "completed": return "bg-green-500 text-green-100";
      case "upcoming": return "bg-blue-500 text-blue-100";
      case "cancelled": return "bg-red-500 text-red-100";
      default: return "bg-gray-500 text-gray-100";
    }
  };
  
  return (
    <Card className="p-4 hover:bg-gray-800/80 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="text-indigo-400" size={18} />
          <span className="font-medium text-white">{date}</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {status === "completed" ? "Completada" : status === "upcoming" ? "Próxima" : "Cancelada"}
        </div>
      </div>
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
        <Clock size={14} />
        <span>{time}</span>
      </div>
      <div className="text-white font-medium mb-1">Dr. {doctor}</div>
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
        <MapPin size={14} />
        <span>{branch}</span>
      </div>
      <div className="flex justify-between">
        <Button 
          variant={status === "completed" ? "secondary" : "primary"} 
          className="text-sm px-3 py-1.5"
        >
          {status === "completed" ? "Ver detalles" : "Confirmar"}
        </Button>
        {status === "upcoming" && (
          <Button variant="outline" className="text-sm px-3 py-1.5">
            Reprogramar
          </Button>
        )}
      </div>
    </Card>
  );
};

// Componente para las recetas
interface PrescriptionCardProps {
  date: string;
  doctor: string;
  type: string;
  expiration: string;
}
const PrescriptionCard = ({ date, doctor, type, expiration }: PrescriptionCardProps) => {
  return (
    <Card className="p-4 hover:bg-gray-800/80 transition-all">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <FileText className="text-indigo-400" size={18} />
          <span className="font-medium text-white">{type}</span>
        </div>
        <Button variant="outline" className="p-1.5">
          <Eye size={18} />
        </Button>
      </div>
      <div className="text-sm text-gray-400 mb-1">Dr. {doctor}</div>
      <div className="text-sm text-gray-400 mb-3">Expedida: {date}</div>
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Válida hasta: {expiration}
        </div>
        <Button variant="outline" className="text-sm px-3 py-1.5 flex items-center gap-1.5">
          <Download size={16} />
          PDF
        </Button>
      </div>
    </Card>
  );
};

// Componente para las compras
interface PurchaseCardProps {
  date: string;
  items: string[];
  total: string | number;
  status: "entregado" | "en preparación" | string;
  image: string;
}
const PurchaseCard = ({ date, items, total, status, image }: PurchaseCardProps) => {
  return (
    <Card className="p-4 hover:bg-gray-800/80 transition-all">
      <div className="flex gap-3">
        <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
          <Image 
            src={image} 
            alt="Producto"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <div className="text-white font-medium mb-1">Compra #{items.length} productos</div>
            <div className="text-white font-bold">${total}</div>
          </div>
          <div className="text-sm text-gray-400 mb-1">{date}</div>
          <div className="text-sm text-gray-400 mb-3">
            {items.map((item, i) => (
              <span key={i}>
                {item}{i < items.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${status === "entregado" ? "bg-green-500" : "bg-yellow-500"}`}></span>
              <span className="text-xs text-gray-400">
                {status === "entregado" ? "Entregado" : "En preparación"}
              </span>
            </div>
            <Button variant="outline" className="text-sm px-3 py-1.5">
              Detalles
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function ClienteDashboardPage() {
  // Datos de ejemplo
  const appointments = [
    {
      id: 1,
      date: "15 Mayo, 2025",
      time: "10:30 AM",
      doctor: "Carlos Ramírez",
      branch: "Sucursal Centro",
      status: "upcoming"
    },
    {
      id: 2,
      date: "3 Abril, 2025",
      time: "11:00 AM",
      doctor: "Laura Sánchez",
      branch: "Sucursal Norte",
      status: "completed"
    }
  ];
  
  const prescriptions = [
    {
      id: 1,
      date: "3 Abril, 2025",
      doctor: "Laura Sánchez",
      type: "Lentes graduados",
      expiration: "3 Abril, 2026"
    },
    {
      id: 2,
      date: "10 Enero, 2025",
      doctor: "Carlos Ramírez",
      type: "Lentes de contacto",
      expiration: "10 Enero, 2026"
    }
  ];
  
  const purchases = [
    {
      id: 1,
      date: "5 Mayo, 2025",
      items: ["Lentes Ray-Ban Aviator", "Estuche protector"],
      total: 2450,
      status: "preparación",
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1760&auto=format&fit=crop"
    },
    {
      id: 2,
      date: "15 Marzo, 2025",
      items: ["Lentes de contacto Acuvue", "Solución limpiadora"],
      total: 850,
      status: "entregado",
      image: "https://images.unsplash.com/photo-1587333284936-47df3ab415a2?q=80&w=1631&auto=format&fit=crop"
    }
  ];
  
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mi Cuenta</h1>
        <p className="text-gray-400 mt-1">Bienvenido a tu panel personal</p>
      </div>
      
      {/* Resumen del perfil */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 relative rounded-full overflow-hidden border-4 border-indigo-600">
            <Image 
              src="https://i.pravatar.cc/200?u=cliente" 
              alt="Foto de perfil"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">Juan Pérez</h2>
            <p className="text-gray-400">Cliente desde: Enero 2025</p>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="text-white">juanperez@example.com</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-white">+52 55 1234 5678</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              Nueva cita
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Phone size={16} />
              Contactar
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Secciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Citas */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Mis Citas</h2>
            <Button variant="outline" className="text-xs py-1 px-2">Ver todas</Button>
          </div>
          {appointments.map(appointment => (
            <AppointmentCard 
              key={appointment.id}
              date={appointment.date}
              time={appointment.time}
              doctor={appointment.doctor}
              branch={appointment.branch}
              status={appointment.status}
            />
          ))}
        </div>
        
        {/* Recetas */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Mis Recetas</h2>
            <Button variant="outline" className="text-xs py-1 px-2">Ver todas</Button>
          </div>
          {prescriptions.map(prescription => (
            <PrescriptionCard 
              key={prescription.id}
              date={prescription.date}
              doctor={prescription.doctor}
              type={prescription.type}
              expiration={prescription.expiration}
            />
          ))}
        </div>
        
        {/* Compras */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Mis Compras</h2>
            <Button variant="outline" className="text-xs py-1 px-2">Ver todas</Button>
          </div>
          {purchases.map(purchase => (
            <PurchaseCard 
              key={purchase.id}
              date={purchase.date}
              items={purchase.items}
              total={purchase.total}
              status={purchase.status}
              image={purchase.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
