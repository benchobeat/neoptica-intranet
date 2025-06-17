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
    { nombre: 'gerente', descripcion: 'Gerente de sucursal' }, // Rol adicional
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
    where: { nombre: { in: ['admin', 'vendedor', 'gerente'] } }
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

  // 4. Crear usuario de prueba multirol (optometrista + vendedor)
  const testUserEmail = 'testuser@neoptica.com';
  const testUser = await prisma.usuario.upsert({
    where: { email: testUserEmail },
    update: {
      activo: true,
    },
    create: {
      nombreCompleto: 'Usuario de Prueba',
      email: testUserEmail,
      password: await bcrypt.hash('Test1234!', 10),
      telefono: '0988888888',
      activo: true,
      creadoEn: fechaActual,
      creadoPor: adminUser.id,
    },
  });

  // Eliminar asociaciones existentes para el usuario de prueba
  await prisma.usuarioRol.deleteMany({
    where: { usuarioId: testUser.id }
  });

  const rolesTest = await prisma.rol.findMany({
    where: { nombre: { in: ['vendedor', 'optometrista'] } }
  });

  for (const rol of rolesTest) {
    await prisma.usuarioRol.create({
      data: {
        usuarioId: testUser.id,
        rolId: rol.id,
        creadoEn: fechaActual,
        creadoPor: adminUser.id,
      },
    });
    console.log(`🌱 [SEED] Asociación testuser-rol "${rol.nombre}" creada`);
  }

  // 5. Crear un usuario cliente para pruebas
  const clienteEmail = 'cliente@example.com';
  const clienteUser = await prisma.usuario.upsert({
    where: { email: clienteEmail },
    update: {
      activo: true,
    },
    create: {
      nombreCompleto: 'Cliente de Prueba',
      email: clienteEmail,
      password: await bcrypt.hash('Cliente1234!', 10),
      telefono: '0977777777',
      dni: '1234567890',
      direccion: 'Av. Principal 123',
      activo: true,
      creadoEn: fechaActual,
      creadoPor: adminUser.id,
    },
  });

  // Asignar rol de cliente
  const rolCliente = await prisma.rol.findFirst({
    where: { nombre: 'cliente' }
  });

  if (rolCliente) {
    // Eliminar asociaciones existentes
    await prisma.usuarioRol.deleteMany({
      where: { usuarioId: clienteUser.id }
    });

    await prisma.usuarioRol.create({
      data: {
        usuarioId: clienteUser.id,
        rolId: rolCliente.id,
        creadoEn: fechaActual,
        creadoPor: adminUser.id,
      },
    });
    console.log(`🌱 [SEED] Asociación cliente-rol "${rolCliente.nombre}" creada`);
  }

  // 6. Crear usuario system para auditoría y operaciones del sistema
  console.log('🌱 [SEED] Creando usuario system...');
  
  const systemUserEmail = 'system@internal.neoptica.com';
  const systemUser = await prisma.usuario.upsert({
    where: { email: systemUserEmail },
    update: {
      activo: false, // Asegurar que siempre esté desactivado
    },
    create: {
      nombreCompleto: 'Sistema Neoptica',
      email: systemUserEmail,
      password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), // Contraseña aleatoria que nunca se usará
      telefono: '0000000000',
      activo: false, // Desactivado para que no aparezca en listas
      creadoEn: fechaActual,
      creadoPor: adminUser.id,
    },
  });

  console.log(`🌱 [SEED] Usuario system creado: ${systemUser.id}`);
  console.log('✔️ Seed inicial multirol ejecutado correctamente');
  console.log('✔️ Usuarios creados:');
  console.log('   - Admin: admin@neoptica.com / Admin1234!');
  console.log('   - Test: testuser@neoptica.com / Test1234!');
  console.log('   - Cliente: cliente@example.com / Cliente1234!');
  console.log('   - System: system@internal.neoptica.com (cuenta de sistema, no para login)');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
