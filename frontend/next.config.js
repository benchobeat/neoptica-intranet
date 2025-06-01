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
  
  // Optimizaciones para mejorar el rendimiento de compilación
  swcMinify: true,
  poweredByHeader: false,
  
  // Optimizaciones del compilador
  compiler: {
    // Eliminar console.logs en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],
    } : false,
  },
  
  // Optimizaciones de Webpack para mejorar el rendimiento
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones solo para el cliente en producción
    if (!dev && !isServer) {
      // Configurar code splitting avanzado
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          // Separar componentes de antd en su propio chunk
          antd: {
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            name: 'antd',
            priority: 10,
            chunks: 'all',
          },
          // Separar iconos de antd en su propio chunk
          antdIcons: {
            test: /[\\/]node_modules[\\/]@ant-design[\\/]icons/,
            name: 'antd-icons',
            priority: 9,
            chunks: 'all',
          },
          // Chunk para otras librerías comunes
          commons: {
            test: /[\\/]node_modules[\\/](!antd)(!@ant-design)/,
            name: 'commons',
            chunks: 'all',
            priority: 1,
            reuseExistingChunk: true,
          },
          // Chunk para estilos
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          },
        },
      };

      // Optimizar el tamaño del paquete al eliminar moment.js locales
      config.plugins.push(
        new config.webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /es|en/)
      );
    }

    return config;
  },
  
  // Optimizar build con environment variables
  env: {
    OPTIMIZE_BUILDS: 'true',
  },
  
  // Habilitar compresión de archivos
  compress: true,
};

module.exports = nextConfig;