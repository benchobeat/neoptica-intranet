import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Elimina las categorías en orden jerárquico, desde las hojas hasta la raíz
 * @param prisma Instancia de PrismaClient
 */
/**
 * Elimina las cuentas contables en orden jerárquico, desde las hojas hasta la raíz
 * @param prisma Instancia de PrismaClient
 */
async function deleteCuentasContablesInOrder(prisma: PrismaClient): Promise<void> {
  console.log('Iniciando limpieza jerárquica de cuentas contables...');

  try {
    // Primero, obtenemos todas las cuentas con su jerarquía
    const allCuentas = await prisma.cuentaContable.findMany({
      include: {
        cuentasHijas: true,
      },
    });

    // Creamos un mapa de cuentas por ID para un acceso más fácil
    const cuentaMap = new Map<string, { id: string; cuentasHijas: string[] }>();

    // Llenamos el mapa y establecemos las relaciones padre-hijo
    allCuentas.forEach((cuenta) => {
      cuentaMap.set(cuenta.id, {
        id: cuenta.id,
        cuentasHijas: cuenta.cuentasHijas.map((hija) => hija.id),
      });
    });

    // Función para encontrar cuentas sin hijas (hojas del árbol)
    const findLeafCuentas = (): string[] => {
      const leafCuentaIds: string[] = [];

      for (const [id, cuenta] of cuentaMap.entries()) {
        // Si la cuenta no tiene hijas o todas sus hijas ya fueron eliminadas
        if (cuenta.cuentasHijas.length === 0) {
          leafCuentaIds.push(id);
        } else {
          const allChildrenRemoved = cuenta.cuentasHijas.every((hijaId) => !cuentaMap.has(hijaId));
          if (allChildrenRemoved) {
            leafCuentaIds.push(id);
          }
        }
      }

      return leafCuentaIds;
    };

    // Proceso de eliminación por niveles
    let deletedCount = 0;
    while (cuentaMap.size > 0) {
      const leafCuentaIds = findLeafCuentas();

      if (leafCuentaIds.length === 0) {
        console.error(
          'No se pueden encontrar más cuentas hoja, pero aún hay cuentas por eliminar. Esto puede indicar un ciclo en la jerarquía.'
        );
        break;
      }

      // Eliminamos las cuentas hoja actuales
      await prisma.cuentaContable.deleteMany({
        where: { id: { in: leafCuentaIds } },
      });

      // Eliminamos las cuentas del mapa
      leafCuentaIds.forEach((id) => cuentaMap.delete(id));
      deletedCount += leafCuentaIds.length;

      console.log(
        `Eliminadas ${leafCuentaIds.length} cuentas contables en este nivel. Restantes: ${cuentaMap.size}`
      );
    }

    console.log(`Se eliminaron un total de ${deletedCount} cuentas contables en orden jerárquico.`);
  } catch (error) {
    console.error('Error al limpiar cuentas contables jerárquicamente:', error);
    throw error;
  }
}

/**
 * Elimina las categorías en orden jerárquico, desde las hojas hasta la raíz
 * @param prisma Instancia de PrismaClient
 */
async function deleteCategoriesInOrder(prisma: PrismaClient): Promise<void> {
  console.log('Iniciando limpieza jerárquica de categorías...');

  try {
    // Primero, obtenemos todas las categorías con su jerarquía
    const allCategories = await prisma.categoria.findMany({
      include: {
        subcategorias: true,
      },
    });

    // Creamos un mapa de categorías por ID para un acceso más fácil
    const categoryMap = new Map<string, { id: string; subcategorias: string[] }>();

    // Llenamos el mapa y establecemos las relaciones padre-hijo
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        subcategorias: cat.subcategorias.map((sub) => sub.id),
      });
    });

    // Función para encontrar categorías sin hijos (hojas del árbol)
    const findLeafCategories = (): string[] => {
      const leafCategoryIds: string[] = [];

      for (const [id, category] of categoryMap.entries()) {
        // Si la categoría no tiene subcategorías o todas sus subcategorías ya fueron eliminadas
        if (category.subcategorias.length === 0) {
          leafCategoryIds.push(id);
        } else {
          const allChildrenRemoved = category.subcategorias.every(
            (subId) => !categoryMap.has(subId)
          );
          if (allChildrenRemoved) {
            leafCategoryIds.push(id);
          }
        }
      }

      return leafCategoryIds;
    };

    // Proceso de eliminación por niveles
    let deletedCount = 0;
    while (categoryMap.size > 0) {
      const leafCategoryIds = findLeafCategories();

      if (leafCategoryIds.length === 0) {
        console.error(
          'No se pueden encontrar más categorías hoja, pero aún hay categorías por eliminar. Esto puede indicar un ciclo en la jerarquía.'
        );
        break;
      }

      // Eliminamos las categorías hoja actuales
      await prisma.categoria.deleteMany({
        where: { id: { in: leafCategoryIds } },
      });

      // Eliminamos las categorías del mapa
      leafCategoryIds.forEach((id) => categoryMap.delete(id));
      deletedCount += leafCategoryIds.length;

      console.log(
        `Eliminadas ${leafCategoryIds.length} categorías en este nivel. Restantes: ${categoryMap.size}`
      );
    }

    console.log(`Se eliminaron un total de ${deletedCount} categorías en orden jerárquico.`);
  } catch (error) {
    console.error('Error al limpiar categorías jerárquicamente:', error);
    throw error;
  }
}

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
    } catch {
      console.log(
        'No se pudieron desactivar restricciones de clave foránea, continuando con enfoque estándar'
      );
    }

    // Eliminar registros de todas las tablas en orden para manejar dependencias
    // 1. Primero las tablas más dependientes
    try {
      await prisma.resetToken.deleteMany({});
      console.log('Tabla reset_token limpiada');
    } catch (e) {
      console.error('Error limpiando reset_token', e);
    }
    try {
      await prisma.detallePedido.deleteMany({});
      console.log('Tabla detalle_pedido limpiada');
    } catch (e) {
      console.error('Error limpiando detalle_pedido', e);
    }
    try {
      await prisma.pedido.deleteMany({});
      console.log('Tabla pedido limpiada');
    } catch (e) {
      console.error('Error limpiando pedido', e);
    }
    try {
      await prisma.movimientoInventario.deleteMany({});
      console.log('Tabla movimiento_inventario limpiada');
    } catch (e) {
      console.error('Error limpiando movimiento_inventario', e);
    }
    try {
      await prisma.inventario.deleteMany({});
      console.log('Tabla inventario limpiada');
    } catch (e) {
      console.error('Error limpiando inventario', e);
    }
    try {
      await prisma.logAuditoria.deleteMany({});
      console.log('Tabla log_auditoria limpiada');
    } catch (e) {
      console.error('Error limpiando log_auditoria', e);
    }
    try {
      await prisma.usuarioRol.deleteMany({});
      console.log('Tabla usuario_rol limpiada');
    } catch (e) {
      console.error('Error limpiando usuario_rol', e);
    }

    // 2. Primero manejamos las categorías en orden jerárquico
    try {
      await deleteCategoriesInOrder(prisma);
      console.log('Categorías eliminadas en orden jerárquico');
    } catch (e) {
      console.error(
        'Error al limpiar categorías jerárquicamente, intentando eliminación directa',
        e
      );
      // Si falla la eliminación jerárquica, intentamos eliminación directa
      try {
        await prisma.categoria.deleteMany({});
        console.log('Categorías eliminadas (enfoque directo)');
      } catch (innerError) {
        console.error('Error en eliminación directa de categorías:', innerError);
      }
    }

    // 3. Luego manejamos las cuentas contables en orden jerárquico
    try {
      await deleteCuentasContablesInOrder(prisma);
      console.log('Cuentas contables eliminadas en orden jerárquico');
    } catch (e) {
      console.error(
        'Error al limpiar cuentas contables jerárquicamente, intentando eliminación directa',
        e
      );
      // Si falla la eliminación jerárquica, intentamos eliminación directa
      try {
        await prisma.cuentaContable.deleteMany({});
        console.log('Cuentas contables eliminadas (enfoque directo)');
      } catch (innerError) {
        console.error('Error en eliminación directa de cuentas contables:', innerError);
      }
    }

    // 3. Luego tablas de entidades principales
    try {
      await prisma.archivoEntidad.deleteMany({});
      console.log('Tabla archivo_entidad limpiada');
    } catch (e) {
      console.error('Error limpiando archivo_entidad', e);
    }
    try {
      await prisma.archivoAdjunto.deleteMany({});
      console.log('Tabla archivo_adjunto limpiada');
    } catch (e) {
      console.error('Error limpiando archivo_adjunto', e);
    }
    try {
      await prisma.historialClinico.deleteMany({});
      console.log('Tabla historial_clinico limpiada');
    } catch (e) {
      console.error('Error limpiando historial_clinico', e);
    }
    try {
      await prisma.receta.deleteMany({});
      console.log('Tabla receta limpiada');
    } catch (e) {
      console.error('Error limpiando receta', e);
    }
    try {
      await prisma.cita.deleteMany({});
      console.log('Tabla cita limpiada');
    } catch (e) {
      console.error('Error limpiando cita', e);
    }
    try {
      await prisma.descansoEmpleado.deleteMany({});
      console.log('Tabla descanso_empleado limpiada');
    } catch (e) {
      console.error('Error limpiando descanso_empleado', e);
    }
    try {
      await prisma.gasto.deleteMany({});
      console.log('Tabla gasto limpiada');
    } catch (e) {
      console.error('Error limpiando gasto', e);
    }
    try {
      await prisma.movimientoContable.deleteMany({});
      console.log('Tabla movimiento_contable limpiada');
    } catch (e) {
      console.error('Error limpiando movimiento_contable', e);
    }
    try {
      await prisma.cuentaContable.deleteMany({});
      console.log('Tabla cuenta_contable limpiada');
    } catch (e) {
      console.error('Error limpiando cuenta_contable', e);
    }
    try {
      await prisma.producto.deleteMany({});
      console.log('Tabla producto limpiada');
    } catch (e) {
      console.error('Error limpiando producto', e);
    }
    try {
      await prisma.color.deleteMany({});
      console.log('Tabla color limpiada');
    } catch (e) {
      console.error('Error limpiando color', e);
    }
    try {
      await prisma.marca.deleteMany({});
      console.log('Tabla marca limpiada');
    } catch (e) {
      console.error('Error limpiando marca', e);
    }
    try {
      await prisma.sucursal.deleteMany({});
      console.log('Tabla sucursal limpiada');
    } catch (e) {
      console.error('Error limpiando sucursal', e);
    }

    // 3. Ahora limpiamos usuarios (excepto admin) y aseguramos roles correctos
    // Eliminar todos los usuarios excepto el admin
    // Primero limpiamos archivo_entidad que tiene FK a archivo_adjunto
    try {
      await prisma.archivoEntidad.deleteMany({});
      console.log('Tabla archivo_entidad limpiada');
    } catch (e) {
      console.error('Error limpiando archivo_entidad', e);
    }

    // Luego limpiamos archivo_adjunto que tiene FK a usuario
    try {
      await prisma.archivoAdjunto.deleteMany({});
      console.log('Tabla archivo_adjunto limpiada');
    } catch (e) {
      console.error('Error limpiando archivo_adjunto', e);
    }

    // Ahora podemos eliminar usuarios
    try {
      await prisma.usuario.deleteMany({
        where: {
          email: {
            not: 'admin@neoptica.com',
          },
        },
      });
      console.log('Tabla usuario limpiada (excepto admin)');
    } catch (e) {
      console.error('Error limpiando usuario', e);
    }

    // Eliminar cualquier rol que no sea de los cuatro permitidos
    try {
      await prisma.rol.deleteMany({
        where: {
          nombre: {
            notIn: ['admin', 'vendedor', 'optometrista', 'cliente'],
          },
        },
      });
      console.log('Roles extra eliminados');
    } catch (e) {
      console.error('Error limpiando roles', e);
    }

    // Crear los roles permitidos si no existen
    const roles = ['admin', 'vendedor', 'optometrista', 'cliente'];
    for (const rolNombre of roles) {
      const rolExiste = await prisma.rol.findUnique({
        where: { nombre: rolNombre },
      });

      if (!rolExiste) {
        await prisma.rol.create({
          data: {
            nombre: rolNombre,
            descripcion: `Rol de ${rolNombre}`,
            // No asignamos creado_por ya que requiere un UUID válido
            creadoEn: new Date(),
          },
        });
        console.log(`Rol '${rolNombre}' creado.`);
      }
    }

    // Verificar y crear usuario admin si no existe
    let admin = await prisma.usuario.findUnique({
      where: { email: 'admin@neoptica.com' },
      include: {
        roles: {
          include: { rol: true },
        },
      },
    });

    // Obtener el ID del rol admin
    const rolAdmin = await prisma.rol.findUnique({
      where: { nombre: 'admin' },
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
          nombreCompleto: 'Administrador',
          email: 'admin@neoptica.com',
          password: hashedPassword,
          activo: true,
          // No asignamos creado_por ya que requiere un UUID válido
          creadoEn: new Date(),
        },
      });

      // Fetch admin with usuario_rol included after creation
      admin = await prisma.usuario.findUnique({
        where: { id: newAdmin.id },
        include: {
          roles: {
            include: { rol: true },
          },
        },
      });

      console.log('Usuario admin creado con éxito');
    } else {
      console.log('Usuario admin ya existe, se conserva');
    }

    // Eliminar todos los roles existentes del admin (para evitar duplicados)
    if (admin) {
      await prisma.usuarioRol.deleteMany({
        where: { usuarioId: admin.id },
      });

      // Asignar rol admin (siempre, exista o no el usuario previamente)
      await prisma.usuarioRol.create({
        data: {
          usuarioId: admin.id,
          rolId: rolAdmin.id,
          // No asignamos creado_por ya que requiere un UUID válido y no un string
          creadoEn: new Date(),
        },
      });

      console.log('Rol admin asignado correctamente al usuario admin');
    } else {
      console.error('Error: No se pudo crear o encontrar el usuario admin');
    }

    // Intentar reactivar restricciones de clave foránea si se desactivaron previamente
    try {
      await prisma.$executeRaw`SET session_replication_role = 'origin';`;
      console.log('Restricciones de clave foránea reactivadas');
    } catch {
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
    await prisma.movimientoInventario.deleteMany({
      where: {
        OR: [{ motivo: { contains: 'Test' } }, { motivo: { contains: 'Prueba' } }],
      },
    });

    await prisma.inventario.deleteMany({
      where: {
        producto: {
          nombre: { contains: 'Test' },
        },
      },
    });

    await prisma.producto.deleteMany({
      where: {
        nombre: { contains: 'Test' },
      },
    });

    await prisma.color.deleteMany({
      where: {
        nombre: { contains: 'Test' },
      },
    });

    await prisma.marca.deleteMany({
      where: {
        nombre: { contains: 'Test' },
      },
    });

    await prisma.sucursal.deleteMany({
      where: {
        nombre: { contains: 'Test' },
      },
    });

    console.log('Datos de prueba limpiados exitosamente.');
  } catch (error) {
    console.error('Error al limpiar datos de prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
