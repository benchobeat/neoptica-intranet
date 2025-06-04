import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Limpia completamente la base de datos, eliminando todos los registros de todas las tablas.
 * Esta función debe usarse SOLO en entornos de prueba.
 * También recrea el usuario administrador y verifica que existan los roles correctos.
 * npx ts-node tests/utils/cleanDb.ts
 * @returns {Promise<void>}
 */
export async function cleanDatabase(): Promise<void> {
  const prisma = new PrismaClient();
  
  try {
    console.log('Iniciando limpieza de la base de datos...');
    
    // Intentar desactivar restricciones de clave foránea si es posible (funciona en Supabase)
    // Si falla (en Render), continuamos con el enfoque ordenado de eliminación
    try {
      await prisma.$executeRaw`SET session_replication_role = 'replica';`;
      console.log('Restricciones de clave foránea desactivadas temporalmente');
    } catch (e) {
      console.log('No se pudieron desactivar restricciones de clave foránea, continuando con enfoque estándar');
    }
    
    // Eliminar registros de todas las tablas en orden para manejar dependencias
    // 1. Primero las tablas más dependientes
    try {
      await prisma.reset_token.deleteMany({});
      console.log('Tabla reset_token limpiada');
    } catch (e) { console.error('Error limpiando reset_token', e); }
    try {
      await prisma.detalle_pedido.deleteMany({});
      console.log('Tabla detalle_pedido limpiada');
    } catch (e) { console.error('Error limpiando detalle_pedido', e); }
    try {
      await prisma.pedido.deleteMany({});
      console.log('Tabla pedido limpiada');
    } catch (e) { console.error('Error limpiando pedido', e); }
    try {
      await prisma.movimiento_inventario.deleteMany({});
      console.log('Tabla movimiento_inventario limpiada');
    } catch (e) { console.error('Error limpiando movimiento_inventario', e); }
    try {
      await prisma.inventario.deleteMany({});
      console.log('Tabla inventario limpiada');
    } catch (e) { console.error('Error limpiando inventario', e); }
    try {
      await prisma.log_auditoria.deleteMany({});
      console.log('Tabla log_auditoria limpiada');
    } catch (e) { console.error('Error limpiando log_auditoria', e); }
    try {
      await prisma.usuario_rol.deleteMany({});
      console.log('Tabla usuario_rol limpiada');
    } catch (e) { console.error('Error limpiando usuario_rol', e); }
    
    // 2. Luego tablas de entidades principales
    try {
      await prisma.producto.deleteMany({});
      console.log('Tabla producto limpiada');
    } catch (e) { console.error('Error limpiando producto', e); }
    try {
      await prisma.color.deleteMany({});
      console.log('Tabla color limpiada');
    } catch (e) { console.error('Error limpiando color', e); }
    try {
      await prisma.marca.deleteMany({});
      console.log('Tabla marca limpiada');
    } catch (e) { console.error('Error limpiando marca', e); }
    try {
      await prisma.sucursal.deleteMany({});
      console.log('Tabla sucursal limpiada');
    } catch (e) { console.error('Error limpiando sucursal', e); }
    
    // 3. Ahora limpiamos usuarios (excepto admin) y aseguramos roles correctos
    // Eliminar todos los usuarios excepto el admin
    // Primero limpiamos archivo_entidad que tiene FK a archivo_adjunto
    try {
      await prisma.archivo_entidad.deleteMany({});
      console.log('Tabla archivo_entidad limpiada');
    } catch (e) { console.error('Error limpiando archivo_entidad', e); }
    
    // Luego limpiamos archivo_adjunto que tiene FK a usuario
    try {
      await prisma.archivo_adjunto.deleteMany({});
      console.log('Tabla archivo_adjunto limpiada');
    } catch (e) { console.error('Error limpiando archivo_adjunto', e); }
    
    // Ahora podemos eliminar usuarios
    try {
      await prisma.usuario.deleteMany({
        where: {
          email: {
            not: 'admin@neoptica.com'
          }
        }
      });
      console.log('Tabla usuario limpiada (excepto admin)');
    } catch (e) { console.error('Error limpiando usuario', e); }
    
    // Eliminar cualquier rol que no sea de los cuatro permitidos
    try {
      await prisma.rol.deleteMany({
        where: {
          nombre: {
            notIn: ['admin', 'vendedor', 'optometrista', 'cliente']
          }
        }
      });
      console.log('Roles extra eliminados');
    } catch (e) { console.error('Error limpiando roles', e); }
    
    // Crear los roles permitidos si no existen
    const roles = ['admin', 'vendedor', 'optometrista', 'cliente'];
    for (const rolNombre of roles) {
      const rolExiste = await prisma.rol.findUnique({
        where: { nombre: rolNombre }
      });
      
      if (!rolExiste) {
        await prisma.rol.create({
          data: {
            nombre: rolNombre,
            descripcion: `Rol de ${rolNombre}`,
            // No asignamos creado_por ya que requiere un UUID válido
            creado_en: new Date()
          }
        });
        console.log(`Rol '${rolNombre}' creado.`);
      }
    }
    
    // Verificar y crear usuario admin si no existe
    let admin = await prisma.usuario.findUnique({
      where: { email: 'admin@neoptica.com' },
      include: {
        usuario_rol: {
          include: { rol: true }
        }
      }
    });
    
    // Obtener el ID del rol admin
    const rolAdmin = await prisma.rol.findUnique({
      where: { nombre: 'admin' }
    });
    
    if (!rolAdmin) {
      throw new Error('No se pudo encontrar el rol admin');
    }
    
    // Si no existe el admin, lo creamos
    if (!admin) {
      // Hashear password: Admin1234!
      const hashedPassword = await bcrypt.hash('Admin1234!', 10);
      
      // Crear usuario admin
      const newAdmin = await prisma.usuario.create({
        data: {
          nombre_completo: 'Administrador',
          email: 'admin@neoptica.com',
          password: hashedPassword,
          activo: true,
          // No asignamos creado_por ya que requiere un UUID válido
          creado_en: new Date()
        }
      });
      
      // Fetch admin with usuario_rol included after creation
      admin = await prisma.usuario.findUnique({
        where: { id: newAdmin.id },
        include: {
          usuario_rol: {
            include: { rol: true }
          }
        }
      });
      
      console.log('Usuario admin creado con éxito');
    } else {
      console.log('Usuario admin ya existe, se conserva');
    }
    
    // Eliminar todos los roles existentes del admin (para evitar duplicados)
    if (admin) {
      await prisma.usuario_rol.deleteMany({
        where: { usuario_id: admin.id }
      });
      
      // Asignar rol admin (siempre, exista o no el usuario previamente)
      await prisma.usuario_rol.create({
        data: {
          usuario_id: admin.id,
          rol_id: rolAdmin.id,
          // No asignamos creado_por ya que requiere un UUID válido y no un string
          creado_en: new Date()
        }
      });
      
      console.log('Rol admin asignado correctamente al usuario admin');
    } else {
      console.error('Error: No se pudo crear o encontrar el usuario admin');
    }
    
    // Intentar reactivar restricciones de clave foránea si se desactivaron previamente
    try {
      await prisma.$executeRaw`SET session_replication_role = 'origin';`;
      console.log('Restricciones de clave foránea reactivadas');
    } catch (e) {
      // Ignoramos el error si no se pueden reactivar
    }
    
    console.log('Base de datos limpiada exitosamente.');
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar limpieza si el archivo se corre directamente
if (require.main === module) {
  console.log('Iniciando script de limpieza...');
  cleanDatabase()
    .then(() => {
      console.log('Limpieza finalizada con éxito.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error en limpieza:', err);
      process.exit(1);
    });
}

/**
 * Limpia solo los datos de prueba específicos, preservando datos fundamentales.
 * Más seguro para uso en tests individuales.
 * 
 * @returns {Promise<void>}
 */
export async function cleanTestData(): Promise<void> {
  const prisma = new PrismaClient();
  
  try {
    console.log('Limpiando datos de prueba...');
    
    // Eliminar solo registros creados para pruebas
    await prisma.movimiento_inventario.deleteMany({
      where: {
        OR: [
          { motivo: { contains: 'Test' } },
          { motivo: { contains: 'Prueba' } }
        ]
      }
    });
    
    await prisma.inventario.deleteMany({
      where: {
        producto: {
          nombre: { contains: 'Test' }
        }
      }
    });
    
    await prisma.producto.deleteMany({
      where: {
        nombre: { contains: 'Test' }
      }
    });
    
    await prisma.color.deleteMany({
      where: {
        nombre: { contains: 'Test' }
      }
    });
    
    await prisma.marca.deleteMany({
      where: {
        nombre: { contains: 'Test' }
      }
    });
    
    await prisma.sucursal.deleteMany({
      where: {
        nombre: { contains: 'Test' }
      }
    });
    
    console.log('Datos de prueba limpiados exitosamente.');
  } catch (error) {
    console.error('Error al limpiar datos de prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
