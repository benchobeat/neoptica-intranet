import { cleanDatabase } from './cleanDb';

/**
 * Script para ejecutar manualmente la limpieza de la base de datos.
 * Uso desde línea de comandos:
 * npx ts-node tests/utils/cleanDbRunner.ts
 */
async function main() {
  try {
    console.log('Iniciando limpieza manual de la base de datos...');

    // Por defecto ejecutamos la limpieza completa
    await cleanDatabase();

    console.log('Limpieza manual completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la limpieza manual:', error);
    process.exit(1);
  }
}

// Ejecutar el script
main();
