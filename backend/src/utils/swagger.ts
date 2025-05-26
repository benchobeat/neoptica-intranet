import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Neóptica Intranet API",
    version: "1.0.0",
    description:
      "Documentación de la API REST del backend de Neóptica Intranet.",
    contact: {
      name: "Soporte Neóptica",
      email: "ruben_mosquerav@hotmail.com",
    },
  },
  servers: [
    {
    url: process.env.SWAGGER_BASE_URL,
      description: "API base URL",
    },
    {
    url: "http://localhost:4000",
      description: "API base URL",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      // Objeto de error estándar
      Error: {
        type: "object",
        properties: {
          ok: { type: "boolean", example: false },
          data: { type: "null", example: null },
          error: { type: "string", example: "Mensaje de error detallado" },
        },
      },
      // Usuario devuelto por la API
      Usuario: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "f531d0b5-8b5e-41e0-abc1-15d151120b41",
          },
          nombre_completo: { type: "string", example: "Juan Pérez" },
          email: { type: "string", example: "admin@neoptica.com" },
          telefono: { type: "string", example: "0999999999" },
          activo: { type: "boolean", example: true },
          rol: { type: "string", example: "admin" },
        },
      },
      // Datos requeridos para crear/actualizar usuario
      UsuarioInput: {
        type: "object",
        properties: {
          nombre_completo: { type: "string", example: "Juan Pérez" },
          email: { type: "string", example: "juan@email.com" },
          password: { type: "string", example: "1234" },
          telefono: { type: "string", example: "0999999999" },
        },
        required: ["nombre_completo", "email", "password"],
      },
      Rol: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "c3ab5fd2-cf8d-4c44-92ef-0123456789ab",
          },
          nombre: { type: "string", example: "optometrista" },
          descripcion: { type: "string", example: "Optometrista autorizado" },
        },
      },
      Sucursal: {
        type: "object",
        properties: {
          id: { type: "string", example: "uuid..." },
          nombre: { type: "string", example: "Sucursal Quito Centro" },
          direccion: { type: "string", example: "Av. Amazonas y Naciones Unidas", },
          latitud: { type: "number", example: -0.1807 }, 
          longitud: { type: "number", example: -78.4678 },
          telefono: { type: "string", example: "0999999999" },
          email: { type: "string", example: "quito@neoptica.com" },
          estado: { type: "boolean", example: true },
          creado_en: { type: "string", format: "date-time" },
          actualizado_en: { type: "string", format: "date-time" },
        },
      },
      SucursalInput: {
          type: "object",
          required: ["nombre"],
          properties: {
            nombre: { type: "string", example: "Sucursal Norte" },
            direccion: { type: "string", example: "Av. Amazonas y NN.UU." },
            latitud: { type: "number", example: -0.20347 },
            longitud: { type: "number", example: -78.49512 },
            telefono: { type: "string", example: "0999999999" },
            email: { type: "string", example: "sucursal@neoptica.com" },
          },
        },
    },
  },
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
