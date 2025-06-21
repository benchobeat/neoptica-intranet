import { PrismaClient } from '@prisma/client';

// Inicializar Prisma Client
const prisma = new PrismaClient();

async function testColorCreation() {
  try {
    console.log('Iniciando prueba de creación de color...');

    const colorData = {
      nombre: 'Azul Test',
      codigoHex: '#0000FF',
      descripcion: 'Color azul para prueba',
      activo: true,
      creadoPor: null,
      creadoEn: new Date(),
    };

    console.log('Datos a insertar:', colorData);

    // Intentar crear el color
    const nuevoColor = await prisma.color.create({
      data: colorData,
    });

    console.log('Color creado exitosamente:');
    console.log(JSON.stringify(nuevoColor, null, 2));
    console.log('¿codigoHex guardado?', nuevoColor.codigoHex ? 'SÍ' : 'NO');

    // Verificar si existe en la base de datos
    const colorEnDB = await prisma.color.findUnique({
      where: {
        id: nuevoColor.id,
      },
    });

    console.log('Color recuperado de la base de datos:');
    console.log(JSON.stringify(colorEnDB, null, 2));
    console.log('¿codigoHex en la base de datos?', colorEnDB?.codigoHex ? 'SÍ' : 'NO');
  } catch (error) {
    console.error('Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
testColorCreation();
