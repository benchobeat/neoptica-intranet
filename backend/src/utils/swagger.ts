import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Neóptica Intranet API',
    version: '1.0.0',
    description: 'Documentación de la API REST del backend de Neóptica Intranet.',
    contact: {
      name: "Soporte Neóptica",
      email: "ruben_mosquerav@hotmail.com"
    }
  },
  servers: [
    {
      url: 'http://172.25.106.78:4000',
      description: 'Servidor red local'
    },
    { 
      url: 'http://localhost:4000', 
      description: 'Dev local' 
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
      }
    },
    schemas: {
      // Objeto de error estándar
      Error: {
        type: "object",
        properties: {
          ok: { type: "boolean", example: false },
          data: { type: "null", example: null },
          error: { type: "string", example: "Mensaje de error detallado" }
        }
      },
      // Usuario devuelto por la API
      Usuario: {
        type: "object",
        properties: {
          id: { type: "string", example: "f531d0b5-8b5e-41e0-abc1-15d151120b41" },
          nombre_completo: { type: "string", example: "Juan Pérez" },
          email: { type: "string", example: "admin@neoptica.com" },
          telefono: { type: "string", example: "0999999999" },
          activo: { type: "boolean", example: true },
          rol: { type: "string", example: "admin" }
        }
      },
      // Datos requeridos para crear/actualizar usuario
      UsuarioInput: {
        type: "object",
        properties: {
          nombre_completo: { type: "string", example: "Juan Pérez" },
          email: { type: "string", example: "juan@email.com" },
          password: { type: "string", example: "1234" },
          telefono: { type: "string", example: "0999999999" }
        },
        required: ["nombre_completo", "email", "password"]
      }
    }
  }
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
