import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [SEED] Iniciando seed de roles...');

  // 1. Crear roles base
  const rolesData = [
    { nombre: 'admin', descripcion: 'Administrador global' },
    { nombre: 'optometrista', descripcion: 'Optometrista' },
    { nombre: 'vendedor', descripcion: 'Vendedor de óptica' },
  ];

  for (const rol of rolesData) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: rol,
    });
    console.log(`🌱 [SEED] Rol "${rol.nombre}" listo`);
  }

  // 2. Crear usuario admin
  const adminEmail = 'admin@neoptica.com';
  const adminPassword = 'Admin1234!'; // Cámbialo después en producción

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log('🌱 [SEED] Creando usuario admin...');

  // Asegúrate de que el modelo `usuario` tenga un campo `password` tipo String
  const adminUser = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nombre_completo: 'Administrador General',
      email: adminEmail,
      password: hashedPassword, // SOLO si tienes este campo en el modelo
      telefono: '0999999999',
      activo: true,
      // ...otros campos requeridos según tu modelo
    },
  });

  console.log(`🌱 [SEED] Usuario admin creado: ${adminUser.id}`);

  // 3. Asociar admin al rol admin
  const adminRol = await prisma.rol.findUnique({
    where: { nombre: 'admin' },
  });

  if (adminRol) {
    await prisma.usuario_rol.upsert({
      where: {
        usuario_id_rol_id: {
          usuario_id: adminUser.id,
          rol_id: adminRol.id,
        },
      },
      update: {},
      create: {
        usuario_id: adminUser.id,
        rol_id: adminRol.id,
      },
    });
    console.log('🌱 [SEED] Asociación admin-rol creada');
  } else {
    console.warn('⚠ [SEED] No se encontró el rol admin, no se asoció usuario.');
  }

  console.log('✔️ Seed inicial ejecutado correctamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
