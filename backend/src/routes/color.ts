import { Router } from 'express';

import {
  crearColor,
  listarColores,
  obtenerColorPorId,
  actualizarColor,
  eliminarColor,
  listarColoresPaginados,
} from '@/controllers/colorController';
import { authenticateJWT } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/roles';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Colores
 *   description: Gestión de colores de productos
 * components:
 *   schemas:
 *     ColorInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Rojo"
 *         descripcion:
 *           type: string
 *           example: "Color rojo brillante para marcos de gafas"
 *         codigoHex:
 *           type: string
 *           example: "#FF0000"
 *         # activo se establece automáticamente como true y no puede ser modificado via API
 *     Color:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identificador único UUID
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         codigoHex:
 *           type: string
 *         activo:
 *           type: boolean
 *     Error:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         data:
 *           type: object
 *           nullable: true
 *           example: null
 *         error:
 *           type: string
 *           example: "Mensaje descriptivo del error"
 */

/**
 * @swagger
 * /api/colores:
 *   post:
 *     summary: Crear un nuevo color
 *     tags: [Colores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ColorInput'
 *     responses:
 *       201:
 *         description: Color creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Color'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Error en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Conflicto (p. ej. nombre duplicado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               ok: false
 *               data: null
 *               error: "Ya existe un color con el mismo nombre"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authenticateJWT, requireRole('admin'), crearColor);

/**
 * @swagger
 * /api/colores:
 *   get:
 *     summary: Listar todos los colores
 *     tags: [Colores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Filtrar por estado (activo/inactivo)
 *     responses:
 *       200:
 *         description: Lista de colores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Color'
 *                 error:
 *                   type: string
 *                   example: null
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticateJWT, requireRole('admin', 'optometristsa', 'vendedor'), listarColores);

/**
 * @swagger
 * /api/colores/paginado:
 *   get:
 *     summary: Listar colores con paginación y búsqueda
 *     tags: [Colores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: Página actual
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         required: false
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Término para buscar en el nombre del color
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Filtrar por estado (activo/inactivo)
 *     responses:
 *       200:
 *         description: Lista paginada de colores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Color'
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/paginado',
  authenticateJWT,
  requireRole('admin', 'optometristsa', 'vendedor'),
  listarColoresPaginados
);

/**
 * @swagger
 * /api/colores/{id}:
 *   get:
 *     summary: Obtener un color por su ID
 *     tags: [Colores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del color a consultar
 *     responses:
 *       200:
 *         description: Color encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Color'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Color no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticateJWT, requireRole('admin', 'vendedor'), obtenerColorPorId);

/**
 * @swagger
 * /api/colores/{id}:
 *   put:
 *     summary: Actualizar un color existente
 *     tags: [Colores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del color a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ColorInput'
 *     responses:
 *       200:
 *         description: Color actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Color'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Datos inválidos o ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Color no encontrado
 *       409:
 *         description: Conflicto (p. ej. nombre duplicado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               ok: false
 *               data: null
 *               error: "Ya existe un color con el mismo nombre"
 *       500:
 *         description: Error interno del servidor
 */
router.put(
  '/:id',
  authenticateJWT,
  requireRole('admin', 'optometristsa', 'vendedor'),
  actualizarColor
);

/**
 * @swagger
 * /api/colores/{id}:
 *   delete:
 *     summary: Eliminar un color
 *     description: Realiza un soft delete del color (marcado como anulado). No se puede eliminar si tiene productos asociados.
 *     tags: [Colores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del color a eliminar
 *     responses:
 *       200:
 *         description: Color eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: string
 *                   example: "Color eliminado correctamente."
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Color no encontrado
 *       409:
 *         description: No se puede eliminar (tiene productos asociados)
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authenticateJWT, requireRole('admin'), eliminarColor);

export default router;
