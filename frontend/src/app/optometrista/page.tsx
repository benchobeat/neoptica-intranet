"use client";

import React, { useState } from "react";
import {
  Calendar,
  ClipboardEdit,
  User,
  Clock,
  Search,
  Eye,
  Plus,
  Save,
  CheckCheck
} from "lucide-react";

// Componentes reutilizables
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

type ButtonProps = React.PropsWithChildren<{
  variant?: "primary" | "secondary" | "success" | "danger";
  className?: string;
  [key: string]: any;
}>;

const Button = React.memo(({ children, variant = "primary", className = "", ...props }: ButtonProps) => {
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

// Componente para el formulario de receta
const RecipeForm = () => {
  const [formData, setFormData] = useState({
    sphereRight: "",
    cylinderRight: "",
    axisRight: "",
    sphereLeft: "",
    cylinderLeft: "",
    axisLeft: "",
    interpupillaryDistance: "",
    notes: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí se enviaría la receta al backend
    console.log("Receta enviada:", formData);
    alert("Receta guardada correctamente");
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Datos de la receta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-indigo-400 font-medium">Ojo Derecho (OD)</h4>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Esfera</label>
              <input
                type="text"
                name="sphereRight"
                value={formData.sphereRight}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+2.00 / -2.00"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cilindro</label>
              <input
                type="text"
                name="cylinderRight"
                value={formData.cylinderRight}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="-0.50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Eje</label>
              <input
                type="text"
                name="axisRight"
                value={formData.axisRight}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="180°"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-indigo-400 font-medium">Ojo Izquierdo (OI)</h4>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Esfera</label>
              <input
                type="text"
                name="sphereLeft"
                value={formData.sphereLeft}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+2.00 / -2.00"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cilindro</label>
              <input
                type="text"
                name="cylinderLeft"
                value={formData.cylinderLeft}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="-0.50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Eje</label>
              <input
                type="text"
                name="axisLeft"
                value={formData.axisLeft}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="180°"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-1">Distancia Interpupilar (DIP)</label>
        <input
          type="text"
          name="interpupillaryDistance"
          value={formData.interpupillaryDistance}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="63mm"
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-1">Observaciones</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Notas adicionales sobre la prescripción..."
        ></textarea>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" type="button">Cancelar</Button>
        <Button variant="primary" type="submit">
          <Save size={16} className="mr-1" />
          Guardar Receta
        </Button>
      </div>
    </form>
  );
};

// Componente para citas del día
type AppointmentItemProps = {
  patient: string;
  time: string;
  type: string;
  status: "completed" | "pending" | "upcoming" | string;
};

const AppointmentItem = ({ patient, time, type, status }: AppointmentItemProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "upcoming": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };
  
  return (
    <div className="flex items-center p-3 hover:bg-gray-800/50 rounded-lg transition-colors">
      <div className="mr-4">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          <User size={18} className="text-gray-400" />
        </div>
      </div>
      <div className="flex-1">
        <p className="font-medium text-white">{patient}</p>
        <div className="flex items-center text-sm text-gray-400">
          <Clock size={14} className="mr-1" />
          <span>{time}</span>
          <span className="mx-2">•</span>
          <span>{type}</span>
        </div>
      </div>
      <div className="flex items-center">
        <span className={`w-2 h-2 rounded-full ${getStatusColor()} mr-2`}></span>
        <Button 
          variant={status === "completed" ? "secondary" : "primary"} 
          className="text-sm py-1 px-3"
        >
          {status === "completed" ? <CheckCheck size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
          {status === "completed" ? "Completada" : "Atender"}
        </Button>
      </div>
    </div>
  );
};

export default function OptometristaDashboardPage() {
  // Datos de ejemplo para citas
  const todayAppointments = [
    { id: 1, patient: "Juan Pérez", time: "09:00 AM", type: "Examen de la vista", status: "completed" },
    { id: 2, patient: "María Rodríguez", time: "10:30 AM", type: "Control anual", status: "completed" },
    { id: 3, patient: "Carlos González", time: "12:00 PM", type: "Adaptación lentes de contacto", status: "pending" },
    { id: 4, patient: "Ana Martínez", time: "02:30 PM", type: "Examen de la vista", status: "upcoming" },
    { id: 5, patient: "Roberto Sánchez", time: "04:00 PM", type: "Revisión post-operatoria", status: "upcoming" },
  ];
  
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Panel de Optometrista</h1>
        <p className="text-gray-400 mt-1">Gestión de citas y recetas</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Citas del día */}
        <Card className="lg:col-span-1 p-6 overflow-hidden flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Citas de Hoy</h2>
            <Button variant="secondary" className="text-xs py-1 px-2">
              <Calendar size={14} className="mr-1" />
              Ver agenda
            </Button>
          </div>
          
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {todayAppointments.map(appointment => (
              <AppointmentItem
                key={appointment.id}
                patient={appointment.patient}
                time={appointment.time}
                type={appointment.type}
                status={appointment.status}
              />
            ))}
          </div>
        </Card>
        
        {/* Formulario de receta */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Nueva Receta</h2>
            <Button variant="secondary" className="text-xs py-1 px-2">
              <ClipboardEdit size={14} className="mr-1" />
              Historial de recetas
            </Button>
          </div>
          
          <RecipeForm />
        </Card>
      </div>
      
      {/* Acciones rápidas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="flex items-center justify-center gap-2">
            <Plus size={16} />
            Nueva Cita
          </Button>
          <Button variant="secondary" className="flex items-center justify-center gap-2">
            <ClipboardEdit size={16} />
            Historial Clínico
          </Button>
          <Button variant="secondary" className="flex items-center justify-center gap-2">
            <Eye size={16} />
            Inventario
          </Button>
          <Button variant="secondary" className="flex items-center justify-center gap-2">
            <Calendar size={16} />
            Mi Agenda
          </Button>
        </div>
      </Card>
    </div>
  );
}
