import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Neoptica',
    version: '1.0.0',
    description:
      'Documentación de la API REST del backend de Neóptica Intranet.',
    contact: {
      name: 'Soporte Neóptica',
      email: 'ruben_mosquerav@hotmail.com',
    },
  },
  servers: [
    {
      url: process.env.SWAGGER_BASE_URL,
      description: 'API base URL',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Success: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
          data: { type: 'string', example: 'Contraseña restablecida correctamente' },
          error: { type: 'string', example: null },
        },
      },
      Error: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: false },
          data: { type: 'string', example: null },
          error: { type: 'string', example: 'Mensaje de error' },
        },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'f531d0b5-8b5e-41e0-abc1-15d151120b41',
          },
          nombre_completo: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', example: 'admin@neoptica.com' },
          telefono: { type: 'string', example: '0999999999' },
          activo: { type: 'boolean', example: true },
          roles: {
            type: 'array',
            items: { type: 'string' },
            example: ['admin', 'optometrista'],
          },
        },
      },
      Producto: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          nombre: {
            type: 'string',
            example: 'Lentes de Sol',
          },
          descripcion: {
            type: 'string',
            example: 'Lentes de sol polarizados',
          },
          precio: {
            type: 'number',
            example: 49.99,
          },
          categoria: {
            type: 'string',
            example: 'Accesorios',
          },
          imagen_url: {
            type: 'string',
            example: 'https://example.com/lentes.jpg',
          },
          modelo_3d_url: {
            type: 'string',
            example: 'https://example.com/lentes-3d.glb',
          },
          activo: {
            type: 'boolean',
            example: true,
          },
          creado_en: {
            type: 'string',
            format: 'date-time',
            example: '2025-05-27T12:34:56Z',
          },
        },
      },
      Rol: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: 'c3ab5fd2-cf8d-4c44-92ef-0123456789ab',
          },
          nombre: { type: 'string', example: 'optometrista' },
          descripcion: { type: 'string', example: 'Optometrista autorizado' },
        },
      },
      Sucursal: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid...' },
          nombre: { type: 'string', example: 'Sucursal Quito Centro' },
          direccion: { type: 'string', example: 'Av. Amazonas y Naciones Unidas' },
          latitud: { type: 'number', example: -0.1807 },
          longitud: { type: 'number', example: -78.4678 },
          telefono: { type: 'string', example: '0999999999' },
          email: { type: 'string', example: 'quito@neoptica.com' },
          estado: { type: 'boolean', example: true },
          creado_en: { type: 'string', format: 'date-time' },
          actualizado_en: { type: 'string', format: 'date-time' },
        },
      },
      SucursalInput: {
        type: 'object',
        required: ['nombre'],
        properties: {
          nombre: { type: 'string', example: 'Sucursal Norte' },
          direccion: { type: 'string', example: 'Av. Amazonas y NN.UU.' },
          latitud: { type: 'number', example: -0.20347 },
          longitud: { type: 'number', example: -78.49512 },
          telefono: { type: 'string', example: '0999999999' },
          email: { type: 'string', example: 'sucursal@neoptica.com' },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Error en la petición',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Forbidden: {
        description: 'No tienes permisos para esta acción',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
