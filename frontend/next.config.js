/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de imágenes remotas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1'
      }
    ],
  },
  
  // Optimizaciones básicas
  swcMinify: true,
  poweredByHeader: false,
  
  // Optimizaciones del compilador
  compiler: {
    // Eliminar console.logs en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],
    } : false,
  },
  
  // Habilitar compresión de archivos
  compress: true,
};

module.exports = nextConfig;