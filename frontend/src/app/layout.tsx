import 'antd/dist/reset.css';
import './globals.css';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neoptica Intranet",
  description: "Creado por Rubén Mosquera",
};

const theme = {
  token: {
    colorPrimary: '#1e214d', // Color azul oscuro principal #1e214d
    fontFamily: 'Inter, sans-serif',
    borderRadius: 6, // Bordes ligeramente redondeados para un look moderno
    // Ensure text colors have good contrast on dark backgrounds
    colorTextBase: '#e5e7eb', // Tailwind gray-200 for base text
  },
  components: {
    Button: {
      colorPrimary: '#1e214d',
      algorithm: true,
      controlHeight: 36, // Altura estándar para botones
      colorPrimaryHover: '#2f3466', // Hover un poco más claro
      colorPrimaryActive: '#141735', // Active un poco más oscuro
      // Podrías agregar aquí estilos para variantes como 'default', 'primary', 'dashed', etc.
    },
    Table: {
      colorBgContainer: 'transparent', // Base background for the table body
      headerBg: '#1f2937',       // Tailwind gray-800, slightly darker than general page bg for subtle depth
      headerColor: '#e5e7eb',    // Tailwind gray-200, for header text
      headerBorderRadius: 6,
      colorText: '#d1d5db',      // Tailwind gray-300, for cell text
      borderColor: '#374151',    // Tailwind gray-700, for subtle internal borders (like bottom border for rows)
      rowHoverBg: '#374151',   // Tailwind gray-700, for row hover
      headerSortActiveBg: '#111827', // Tailwind gray-900 (or a slightly lighter shade of headerBg)
      headerSortHoverBg: '#111827', // Matching active for consistency
      cellPaddingBlock: 14,      // Increased padding for a more spacious feel
      cellPaddingInline: 16,     // Increased padding
      footerBg: 'transparent',
      emptyText: 'No hay datos disponibles',
      // Specific styling for pagination text within the table's influence
      pagination: {
        colorText: '#cbd5e1', // Tailwind slate-300, for better visibility of "1-10 of 100"
        colorTextDisabled: '#6b7280', // Tailwind gray-500
        itemActiveBg: '#1e214d', // #1e214d para elemento activo de paginación
        itemActiveBorder: '#1e214d', // #1e214d para borde del elemento activo
        colorBgContainer: 'transparent', // Ensure pagination items blend with the table footer area
        colorPrimary: '#1e214d', // #1e214d para texto y números activos
        colorPrimaryHover: '#2f3466', // Hover un poco más claro
        colorPrimaryActive: '#141735', // Active un poco más oscuro
      },
    },
    Pagination: { // Global pagination styles if needed, or can be specific to table
      colorText: '#cbd5e1', // Tailwind slate-300
      colorTextDisabled: '#6b7280', // Tailwind gray-500
      itemActiveBg: '#1e214d', // #1e214d para elemento activo de paginación
      itemActiveBorder: '#1e214d', // #1e214d para borde del elemento activo
      colorPrimary: '#1e214d', // #1e214d para texto y números activos
      colorBgContainer: 'transparent',
      itemInputBg: '#1f2937', // Background for the page number input in "jumper"
      itemHoverBg: '#2f3466', // Hover un poco más claro
      colorPrimaryHover: '#2f3466', // Hover un poco más claro
      colorPrimaryActive: '#141735', // Active un poco más oscuro
      // Ensure the "total text" (e.g., "1-10 of 100") is clearly visible
      // This is often controlled by a specific class Ant Design uses, we might need global CSS for it
    },
    Input: {
      controlHeight: 36,
      colorBgContainer: '#1f2937', // Tailwind gray-800
      colorBorder: '#4b5563', // Tailwind gray-600
      colorText: '#e5e7eb', // Tailwind gray-200
      colorTextPlaceholder: '#9ca3af', // Tailwind gray-400
      hoverBorderColor: '#00b96b',
    },
    Select: {
      controlHeight: 36,
      colorBgContainer: '#1f2937',
      colorBorder: '#4b5563',
      colorText: '#e5e7eb',
      colorTextPlaceholder: '#9ca3af',
      optionSelectedBg: '#1e214d',
      optionActiveBg: '#2f3466', // Hover un poco más claro
      colorPrimary: '#1e214d',
      colorPrimaryHover: '#2f3466',
      colorPrimaryActive: '#141735', // Active un poco más oscuro
    },
    Card: {
      actionsBg: '#1f2937', // Darker background for card actions
      colorBgContainer: '#111827', // Tailwind gray-900 or slightly lighter for card body
      colorBorderSecondary: '#374151', // Border for card
      colorTextHeading: '#f3f4f6', // Tailwind gray-100 for card titles
    }
    // Puedes agregar más personalizaciones para otros componentes aquí
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased bg-gray-900 text-gray-100">
        <ConfigProvider theme={theme} locale={esES}>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
