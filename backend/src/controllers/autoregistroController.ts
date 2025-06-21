import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { z } from 'zod';

import { logSuccess, logError } from '@/utils/audit';
import { success, fail } from '@/utils/response';

const prisma = new PrismaClient();

// Esquema de validación para el registro tradicional
const registroTradicionalSchema = z.object({
  nombreCompleto: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('El correo electrónico no es válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  telefono: z.string().optional(),
  dni: z.string().optional(),
});

// Esquema de validación para registro con redes sociales
const registroSocialSchema = z.object({
  email: z.string().email('El correo electrónico no es válido'),
  proveedorOauth: z.string().min(2, 'Proveedor OAuth es requerido'),
  oauthId: z.string().min(1, 'ID de OAuth es requerido'),
  nombreCompleto: z.string().optional(),
  telefono: z.string().optional(),
  dni: z.string().optional(),
});

/**
 * Permite el autoregistro de usuarios con el rol 'cliente'.
 * Solo se permite crear usuarios con el rol 'cliente' mediante este endpoint.
 * Puede ser usado por formulario tradicional o por redes sociales.
 */
export async function autoregistroCliente(req: Request, res: Response): Promise<void> {
  const { nombreCompleto, email, password, telefono, proveedorOauth, oauthId, dni } = req.body;

  try {
    // Validación según el tipo de registro
    if (proveedorOauth) {
      // Validación para registro social
      const result = registroSocialSchema.safeParse({
        email,
        proveedorOauth,
        oauthId,
        nombreCompleto,
        telefono,
        dni,
      });

      if (!result.success) {
        const errorMessage = result.error.issues.map((issue) => issue.message).join(', ');
        await logError({
          userId: null,
          ip: req.ip,
          entityType: 'usuario',
          module: 'autoregistroCliente',
          action: 'error_autoregistro_cliente',
          message: 'Error al procesar el registro. Por favor, intente nuevamente.',
          error: new Error('Error de validación. 400' + errorMessage.toString()),
          context: {
            email,
            proveedorOauth,
            oauthId,
            nombreCompleto,
            telefono,
            dni,
          },
        });
        res.status(400).json(fail(`Error de validación: ${errorMessage}`));
        return;
      }
    } else {
      // Validación para registro tradicional
      const result = registroTradicionalSchema.safeParse({
        nombreCompleto,
        email,
        password: password || '', // Asegurar que password no sea undefined
        telefono,
        dni,
      });

      if (!result.success) {
        await logError({
          userId: null,
          ip: req.ip,
          entityType: 'usuario',
          module: 'autoregistroCliente',
          action: 'error_autoregistro_cliente',
          message: 'Error al procesar el registro. Por favor, intente nuevamente.',
          error: new Error(
            'Error de validación. 400' +
              result.error.issues.map((issue) => issue.message).join(', ')
          ),
          context: {
            email,
            proveedorOauth,
            oauthId,
            nombreCompleto,
            telefono,
            dni,
          },
        });
        const errorMessage = result.error.issues.map((issue) => issue.message).join(', ');
        res.status(400).json(fail(`Error de validación: ${errorMessage}`));
        return;
      }
    }

    // Verificar unicidad de email, DNI y combinación proveedorOauth + oauthId
    const [usuarioExistente, dniExistente, usuarioOAuthExistente] = await Promise.all([
      prisma.usuario.findUnique({ where: { email } }),
      dni
        ? prisma.usuario.findFirst({
            where: {
              dni: {
                not: null,
                equals: dni.trim(),
                mode: 'insensitive',
              },
              // No incluir usuarios anulados en la validación
              anuladoEn: null,
            },
          })
        : null,
      proveedorOauth && oauthId
        ? prisma.usuario.findFirst({
            where: {
              proveedorOauth,
              oauthId,
              anuladoEn: null, // No incluir usuarios anulados
            },
          })
        : null,
    ]);

    if (usuarioExistente) {
      await logError({
        userId: null,
        ip: req.ip,
        entityType: 'usuario',
        module: 'autoregistroCliente',
        action: 'error_autoregistro_cliente',
        message: 'Error al procesar el registro. Por favor, intente nuevamente.',
        error: new Error('Ya existe un usuario con este correo electrónico. 409'),
        context: {
          email,
          proveedorOauth,
          oauthId,
          nombreCompleto,
          telefono,
          dni,
        },
      });
      res.status(409).json(fail('Ya existe un usuario con este correo electrónico'));
      return;
    }

    if (dni && dniExistente) {
      await logError({
        userId: null,
        ip: req.ip,
        entityType: 'usuario',
        module: 'autoregistroCliente',
        action: 'error_autoregistro_cliente',
        message: 'Error al procesar el registro. Por favor, intente nuevamente.',
        error: new Error('Ya existe un usuario con este número de cédula. 409'),
        context: {
          email,
          proveedorOauth,
          oauthId,
          nombreCompleto,
          telefono,
          dni,
        },
      });
      res.status(409).json(fail('Ya existe un usuario con este número de cédula'));
      return;
    }

    if (proveedorOauth && oauthId && usuarioOAuthExistente) {
      res.status(409).json(fail('Esta cuenta de red social ya está registrada'));
      return;
    }

    let hashPassword = null;
    if (password) {
      // Solo hashear la contraseña si se proporciona (registro tradicional)
      hashPassword = await bcrypt.hash(password, 10);
    }

    // Iniciar transacción para asegurar consistencia
    const usuario = await prisma.$transaction(async (tx) => {
      // Crear el usuario
      const nuevoUsuario = await tx.usuario.create({
        data: {
          nombreCompleto: nombreCompleto || email.split('@')[0], // Usar parte del email si no hay nombre
          email,
          password: hashPassword,
          telefono: telefono || null,
          dni: dni || null,
          activo: true,
          emailVerificado: !!proveedorOauth, // Verificado si viene de red social
          proveedorOauth: proveedorOauth || null,
          oauthId: oauthId || null,
        },
      });

      // Asignar rol de cliente
      await tx.usuarioRol.create({
        data: {
          usuarioId: nuevoUsuario.id,
          rolId: (await tx.rol.findUnique({ where: { nombre: 'cliente' } }))?.id || '',
        },
      });

      return nuevoUsuario;
    });

    // Registrar auditoría
    await logSuccess({
      userId: usuario.id,
      ip: req.ip,
      entityType: 'usuario',
      entityId: usuario.id,
      module: 'usuarios',
      action: 'autoregistro_cliente_exitoso',
      message: `Nuevo cliente registrado: ${usuario.email} (${proveedorOauth || 'formulario'})`,
      details: {
        usuarioId: usuario.id,
        email: usuario.email,
      },
    });
    // Obtener el usuario con sus roles para la respuesta
    const usuarioConRoles = await prisma.usuario.findUnique({
      where: { id: usuario.id },
      include: { roles: { include: { rol: true } } },
    });

    // Preparar respuesta
    const respuesta = {
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      emailVerificado: usuario.emailVerificado,
      roles: usuarioConRoles?.roles.map((r) => r.rol.nombre) || [],
      proveedorOauth: usuario.proveedorOauth,
    };

    res.status(201).json(success(respuesta));
  } catch (error) {
    await logError({
      userId: null,
      ip: req.ip,
      entityType: 'usuario',
      module: 'autoregistroCliente',
      action: 'error_autoregistro_cliente',
      message: 'Error al procesar el registro. Por favor, intente nuevamente.',
      error: error instanceof Error ? error : new Error(error as string),
      context: {
        email,
        proveedorOauth,
        oauthId,
        nombreCompleto,
        telefono,
        dni,
      },
    });
    console.error('Error en autoregistro:', error);
    const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
    res
      .status(500)
      .json(fail('Error al procesar el registro. Por favor, intente nuevamente.' + mensajeError));
  }
}
