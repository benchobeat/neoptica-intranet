import swaggerJSDoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Neóptica Intranet API',
      version: '1.0.0',
      description: 'Documentación de la API Backend de Neóptica Intranet',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Documenta todos los endpoints en estas carpetas
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
