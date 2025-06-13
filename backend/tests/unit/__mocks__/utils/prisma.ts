// Importar el mock de Prisma Client
const prismaClientMock = require('../prismaClient');

// Este archivo mockea el módulo real 'utils/prisma'
module.exports = {
  __esModule: true,
  default: prismaClientMock.default,
};
