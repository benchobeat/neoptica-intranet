"use client";

import React, { useRef, useEffect } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Typography, message, InputRef } from "antd";
import Image from "next/image";

// Configura la posición y duración del mensaje de error
message.config({
  top: 80, // Posición desde la parte superior
  duration: 5, // Duración en segundos
  maxCount: 1, // Máximo de mensajes mostrados a la vez
});

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const userInputRef = useRef<InputRef>(null);

  useEffect(() => {
    // Enfocar automáticamente el campo de usuario al cargar la página
    userInputRef.current?.focus();
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.username,
          password: values.password,
        }),
      });

      let data: any = {};
      try {
        data = await res.json(); // Intenta parsear la respuesta como JSON
      } catch {
        // Si la respuesta no es JSON (ej. error de servidor sin cuerpo JSON), deja data vacío
      }

      if (!res.ok) {
        // Maneja errores de la respuesta HTTP (ej. 401, 400)
        const errorMsg =
          data?.message || data?.error || "Usuario o contraseña incorrectos";
        message.error(errorMsg);
        return;
      }

      const role = data?.data?.usuario?.rol;
      if (role) {
        localStorage.setItem("role", role); // Almacena el rol en localStorage
        // Redirige según el rol del usuario
        switch (role) {
          case "admin":
            message.success("¡Inicio de sesión exitoso! Rol Administrador.");
            window.location.href = "/dashboard";
            break;
          case "vendedor":
            message.success("¡Inicio de sesión exitoso! Rol Vendedor.");
            window.location.href = "/vendedor";
            break;
          case "opromentista": // Corregido: "optometrista" si ese es el rol correcto
            message.success("¡Inicio de sesión exitoso! Rol Optometrista.");
            window.location.href = "/optometrista"; // Corregido: "/optometrista"
            break;
          case "cliente":
            message.success("¡Inicio de sesión exitoso! Rol Cliente.");
            window.location.href = "/cliente";
            break;
          default:
            message.warning("Rol no reconocido. Redirigiendo a la página principal.");
            window.location.href = "/"; // Redirección por defecto si el rol no coincide
        }
      } else {
        // Si no se encuentra el rol en la respuesta
        message.error("No se pudo determinar el rol del usuario.");
      }
    } catch (err: any) {
      // Maneja errores de red u otros errores inesperados
      message.error(err.message || "Error de autenticación. Inténtalo de nuevo.");
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  return (
    // Contenedor principal con Tailwind CSS para el fondo y centrado
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <Card
        style={{
          maxWidth: 400, // Ancho máximo para la tarjeta
          width: "100%", // Ocupa todo el ancho disponible hasta el maxWidth
          backgroundColor: "rgba(30, 41, 59, 0.3)", // Fondo semitransparente oscuro para efecto glass
          backdropFilter: "blur(12px)", // Efecto de desenfoque para el fondo
          borderRadius: 16, // Bordes más redondeados
          border: "1px solid rgba(255, 255, 255, 0.1)", // Borde sutil
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)", // Sombra más pronunciada
        }}
        styles={{
          body: { padding: "32px 32px 40px" }, // Ajuste de padding interno
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo-optica.svg" // Asegúrate que esta ruta sea correcta
            alt="Neóptica Logo"
            width={64} // Tamaño del logo ligeramente aumentado
            height={64}
            className="mb-3"
            priority // Carga prioritaria para el logo
          />
          <Typography.Title
            level={2} // Nivel de título ajustado para jerarquía
            className="!mb-1 !text-2xl !font-bold !text-white" // Clases de Tailwind para el título
          >
            Neóptica Intranet
          </Typography.Title>
          <Typography.Text className="!text-sm !text-gray-300">
            Inicia sesión para acceder al sistema
          </Typography.Text>
        </div>

        <Form
          name="login_form"
          layout="vertical" // Layout vertical para etiquetas encima de los campos
          onFinish={onFinish}
          requiredMark={false} // Oculta las marcas de campo requerido
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label={<span className="text-gray-300 font-medium">Usuario o Email</span>}
            rules={[
              { required: true, message: "Por favor, ingresa tu usuario o email." },
            ]}
          >
            <Input
              ref={userInputRef}
              prefix={<UserOutlined className="site-form-item-icon !text-gray-400" />}
              placeholder="tu.usuario / tu@email.com"
              size="large"
              className="modern-input" // Clase para estilos personalizados
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="text-gray-300 font-medium">Contraseña</span>}
            rules={[
              { required: true, message: "Por favor, ingresa tu contraseña." },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon !text-gray-400" />}
              placeholder="Tu contraseña"
              size="large"
              className="modern-input" // Clase para estilos personalizados
            />
          </Form.Item>

          <Form.Item className="!mt-8">
            <Button
              type="primary"
              htmlType="submit"
              block // El botón ocupa todo el ancho
              size="large"
              loading={loading} // Muestra el spinner de carga si loading es true
              className="login-button-modern" // Clase para estilos personalizados del botón
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Estilos CSS personalizados para inputs y botón */}
      <style jsx global>{`
        .modern-input .ant-input {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: #e5e7eb !important; /* text-gray-200 */
          border-radius: 8px !important;
        }
        .modern-input .ant-input::placeholder {
          color: #9ca3af !important; /* text-gray-400 */
        }
        .modern-input .ant-input-prefix .anticon {
          color: #9ca3af !important; /* text-gray-400 */
        }
        .modern-input .ant-input-password-icon .anticon {
           color: #9ca3af !important; /* text-gray-400 */
        }
        .modern-input .ant-input:focus,
        .modern-input .ant-input-focused {
          border-color: #6366f1 !important; /* indigo-500 */
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
        }
        
        .login-button-modern {
          background: linear-gradient(to right, #4f46e5, #7c3aed) !important; /* indigo-600 to purple-600 */
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
        }
        .login-button-modern:hover,
        .login-button-modern:focus {
          background: linear-gradient(to right, #5a50e6, #8b49f0) !important; /* Slightly lighter gradient */
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-1px) !important;
        }
        .login-button-modern:active {
           background: linear-gradient(to right, #4338ca, #6d28d9) !important; /* Slightly darker gradient */
           transform: translateY(0px) !important;
           box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
        }

        /* Ajustes para los mensajes de Ant Design */
        .ant-message-notice-content {
          background-color: #1f2937 !important; /* bg-gray-800 */
          color: #f3f4f6 !important; /* text-gray-100 */
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        .ant-message-success .anticon {
          color: #34d399 !important; /* green-400 */
        }
        .ant-message-error .anticon {
          color: #f87171 !important; /* red-400 */
        }
        .ant-message-warning .anticon {
          color: #fbbf24 !important; /* amber-400 */
        }
      `}</style>
    </div>
  );
}