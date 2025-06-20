import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [SEED] Iniciando seed de roles...');

  // 1. Crear roles base
  const rolesData = [
    { nombre: 'admin', descripcion: 'Administrador global' },
    { nombre: 'optometrista', descripcion: 'Optometrista' },
    { nombre: 'vendedor', descripcion: 'Vendedor de óptica' },
    { nombre: 'cliente', descripcion: 'Cliente registrado' },
  ];

  for (const rol of rolesData) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {
        descripcion: rol.descripcion,
      },
      create: {
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        creadoEn: new Date(),
      },
    });
    console.log(`🌱 [SEED] Rol "${rol.nombre}" listo`);
  }

  // 2. Crear usuario admin
  const adminEmail = 'admin@neoptica.com';
  const adminPassword = 'Admin1234!'; // Cámbialo después en producción
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const fechaActual = new Date();

  console.log('🌱 [SEED] Creando usuario admin...');

  const adminUser = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {
      activo: true,
    },
    create: {
      nombreCompleto: 'Administrador General',
      email: adminEmail,
      password: hashedPassword,
      telefono: '0999999999',
      activo: true,
      creadoEn: fechaActual,
    },
  });

  console.log(`🌱 [SEED] Usuario admin creado: ${adminUser.id}`);

  // 3. Asociar admin a múltiples roles (admin + vendedor + gerente)
  const rolesAdmin = await prisma.rol.findMany({
    where: { nombre: { in: ['admin', 'vendedor'] } }
  });

  // Primero eliminar cualquier asociación existente para evitar duplicados
  await prisma.usuarioRol.deleteMany({
    where: { usuarioId: adminUser.id }
  });

  // Crear las asociaciones de roles con campos de auditoría completos
  for (const rol of rolesAdmin) {
    await prisma.usuarioRol.create({
      data: {
        usuarioId: adminUser.id,
        rolId: rol.id,
        creadoEn: fechaActual,
        creadoPor: adminUser.id,
      },
    });
    console.log(`🌱 [SEED] Asociación admin-rol "${rol.nombre}" creada`);
  }

  console.log('✔️ Seed inicial multirol ejecutado correctamente');
  console.log('✔️ Usuarios creados:');
  console.log('   - Admin: admin@neoptica.com / Admin1234!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
