import { Router } from 'express';

import { autoregistroCliente } from '@/controllers/autoregistroController';
import * as usuarioController from '@/controllers/usuarioController';
import {
  actualizarPerfilUsuario,
  cambiarPassword,
  resetPasswordAdmin,
  eliminarUsuario,
  listarUsuariosPaginados,
} from '@/controllers/usuarioController';
import { authenticateJWT } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/roles';

/**
 * @swagger
 * components:
 *   schemas:
 *     UsuarioInput:
 *       type: object
 *       required:
 *         - nombre_completo
 *         - email
 *         - password
 *         - direccion
 *         - telefono
 *         - dni
 *       properties:
 *         nombre_completo:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           format: email
 *           example: "juan@mail.com"
 *         password:
 *           type: string
 *           example: "contraseñaSegura123"
 *         direccion:
 *           type: string
 *           example: "Av. Siempre Viva 123"
 *         telefono:
 *           type: string
 *           example: "0999999999"
 *         dni:
 *           type: string
 *           example: "12345678"
 *         roles:
 *           type: array
 *           description: "Lista de roles a asignar al usuario"
 *           items:
 *             type: string
 *             enum: [admin, vendedor, optometrista, cliente]
 *           example: ["vendedor", "optometrista"]
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         nombre:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           format: email
 *           example: "juan@mail.com"
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           example: ["vendedor"]
 *     Error:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         data:
 *           type: null
 *         error:
 *           type: string
 *           example: "Mensaje de error"
 */

/**
 * @swagger
 * /api/usuarios/autoregistro:
 *   post:
 *     summary: Autoregistro de cliente (formulario o redes sociales)
 *     tags: [Usuarios]
 *     description: Permite a cualquier usuario registrarse como cliente usando formulario tradicional o mediante Google, Facebook o Instagram.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_completo:
 *                 type: string
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 example: "juan@email.com"
 *               password:
 *                 type: string
 *                 example: "Password123!"
 *               telefono:
 *                 type: string
 *                 example: "0999999999"
 *               proveedor_oauth:
 *                 type: string
 *                 enum: [google, facebook, instagram]
 *                 example: "google"
 *               oauth_id:
 *                 type: string
 *                 example: "1234567890"
 *             required:
 *               - email
 *             description: |
 *               Para registro tradicional se requiere nombre_completo, email y password.
 *               Para registro social se requiere email, proveedor_oauth y oauth_id.
 *     responses:
 *       201:
 *         description: Cliente registrado correctamente
 *       400:
 *         description: Faltan datos obligatorios
 *       409:
 *         description: Ya existe un usuario con ese email
 */

const router = Router();
router.post('/autoregistro', autoregistroCliente);

/**
 * @swagger
 * /api/usuarios/perfil:
 *   put:
 *     summary: Permite a un usuario modificar su propio perfil (nombre, teléfono, dirección, dni solo si está null)
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_completo:
 *                 type: string
 *                 example: "Juan Perez"
 *               telefono:
 *                 type: string
 *                 example: "0991234567"
 *               direccion:
 *                 type: string
 *                 example: "Calle Falsa 123"
 *               dni:
 *                 type: string
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nombre_completo:
 *                       type: string
 *                     telefono:
 *                       type: string
 *                     direccion:
 *                       type: string
 *                     dni:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     email:
 *                       type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Error de validación o intento de modificar DNI existente
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/perfil', authenticateJWT, actualizarPerfilUsuario);

/**
 * @swagger
 * /api/usuarios/paginated:
 *   get:
 *     summary: Lista usuarios con paginación y búsqueda.
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página (por defecto 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Cantidad de usuarios por página (por defecto 10)
 *       - in: query
 *         name: searchText
 *         schema:
 *           type: string
 *         description: Texto de búsqueda por nombre
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar usuarios activos/inactivos
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Usuario'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                 error:
 *                   type: string
 *       401:
 *         description: No autorizado
 */
router.get('/paginated', authenticateJWT, listarUsuariosPaginados);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *                 error: { type: string, example: null }
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  authenticateJWT,
  requireRole('admin', 'vendedor', 'optometrista', 'cliente'),
  usuarioController.obtenerUsuario
);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *                 error: { type: string, example: null }
 */
router.get(
  '/',
  authenticateJWT,
  requireRole('admin', 'vendedor', 'optometrista'),
  usuarioController.listarUsuarios
);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crea un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *                 error: { type: string, example: null }
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateJWT, requireRole('admin'), usuarioController.crearUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *                 error: { type: string, example: null }
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id',
  authenticateJWT,
  requireRole('admin', 'vendedor', 'optometrista', 'cliente'),
  usuarioController.actualizarUsuario
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data: { type: string, example: 'Usuario eliminado' }
 *                 error: { type: string, example: null }
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticateJWT, requireRole('admin'), eliminarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}/password:
 *   put:
 *     summary: Cambia la contraseña del usuario autenticado (self-service)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: ID del usuario (debe coincidir con el usuario autenticado)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password_actual, password_nuevo]
 *             properties:
 *               password_actual:
 *                 type: string
 *                 example: "Admin1234!"
 *               password_nuevo:
 *                 type: string
 *                 example: "NuevoPass2024!"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Error en la petición (faltan datos, password débil, etc)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Password actual incorrecto o token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: No tienes permiso para cambiar esa contraseña
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/password', authenticateJWT, cambiarPassword);

/**
 * @swagger
 * /api/usuarios/cambiar-password:
 *   post:
 *     summary: Endpoint alternativo para cambiar contraseña (compatibilidad con tests)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [actual, nueva]
 *             properties:
 *               actual:
 *                 type: string
 *                 example: "Admin1234!"
 *               nueva:
 *                 type: string
 *                 example: "NuevoPass2024!"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Error en la petición (password débil, etc)
 */
// Middleware para inyectar el ID del usuario autenticado en los params
function injectUserIdAsParam(req: any, _res: any, next: any) {
  // Extrae el ID del usuario desde el token JWT y lo inyecta como param
  if (req.user && req.user.id) {
    req.params.id = req.user.id;
  }
  next();
}
// Ruta alternativa para compatibilidad con tests y clientes antiguos
router.post('/cambiar-password', authenticateJWT, injectUserIdAsParam, cambiarPassword);

/**
 * @swagger
 * /api/usuarios/{id}/reset-password:
 *   put:
 *     summary: Restablece la contraseña de un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: ID del usuario a restablecer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password_nuevo]
 *             properties:
 *               password_nuevo:
 *                 type: string
 *                 example: "NuevoAdmin123!"
 *     responses:
 *       200:
 *         description: Contraseña restablecida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id/reset-password', authenticateJWT, requireRole('admin'), resetPasswordAdmin);

export default router;
