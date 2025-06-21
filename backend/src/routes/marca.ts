import { Router } from 'express';

import {
  crearMarca,
  listarMarcas,
  listarMarcasPaginadas,
  obtenerMarcaPorId,
  actualizarMarca,
  eliminarMarca,
} from '@/controllers/marcaController';
import { authenticateJWT } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/roles';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Marcas
 *   description: Gestión de marcas de productos
 * components:
 *   schemas:
 *     MarcaInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Ray-Ban"
 *         descripcion:
 *           type: string
 *           example: "Marca líder en gafas de sol y lentes oftálmicos"
 *         # Campo activo se gestiona automáticamente en el sistema
 *         # y no se permite modificarlo manualmente
 *     Marca:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *         nombre:
 *           type: string
 *           example: "Ray-Ban"
 *         descripcion:
 *           type: string
 *           example: "Marca líder en gafas de sol y lentes oftálmicos"
 *         activo:
 *           type: boolean
 *           example: true
 *         creado_en:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 *         creado_por:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *         modificado_en:
 *           type: string
 *           format: date-time
 *           example: "2023-01-02T00:00:00Z"
 *         modificado_por:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *         anulado_en:
 *           type: string
 *           format: date-time
 *           example: null
 *         anulado_por:
 *           type: string
 *           format: uuid
 *           example: null
 */

/**
 * @swagger
 * /api/marcas:
 *   get:
 *     summary: Lista todas las marcas
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por nombre de marca
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Filtrar por estado (activo/inactivo)
 *     responses:
 *       200:
 *         description: Lista de marcas
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
 *                     $ref: '#/components/schemas/Marca'
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
/**
 * @swagger
 * /api/marcas/paginated:
 *   get:
 *     summary: Lista marcas con paginación y búsqueda
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: searchText
 *         schema:
 *           type: string
 *         description: Texto para filtrar por nombre
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (activo/inactivo)
 *     responses:
 *       200:
 *         description: Lista paginada de marcas
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
 *                         $ref: '#/components/schemas/Marca'
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
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
router.get('/paginated', authenticateJWT, listarMarcasPaginadas);

router.get('/', authenticateJWT, listarMarcas);

/**
 * @swagger
 * /api/marcas/{id}:
 *   get:
 *     summary: Obtiene una marca por ID
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la marca
 *     responses:
 *       200:
 *         description: Marca encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Marca'
 *                 error:
 *                   type: string
 *                   example: null
 *       404:
 *         description: Marca no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticateJWT, obtenerMarcaPorId);

/**
 * @swagger
 * /api/marcas:
 *   post:
 *     summary: Crea una nueva marca o reactiva una existente inactiva
 *     description: |
 *       Crea una nueva marca. Si ya existe una marca inactiva con el mismo nombre, 
 *       la reactivará y actualizará sus datos en lugar de crear una nueva.
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarcaInput'
 *     responses:
 *       200:
 *         description: Marca reactivada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Marca'
 *                 error:
 *                   type: string
 *                   example: null
 *       201:
 *         description: Nueva marca creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Marca'
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation_error:
 *                 value:
 *                   ok: false
 *                   data: null
 *                   error: 'El nombre es obligatorio y debe ser una cadena de texto.'
 *               activo_not_allowed:
 *                 value:
 *                   ok: false
 *                   data: null
 *                   error: 'No está permitido modificar el campo activo.'
 *       409:
 *         description: Conflicto - Ya existe una marca activa con el mismo nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               ok: false
 *               data: null
 *               error: 'Ya existe una marca con ese nombre.'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateJWT, requireRole('admin'), crearMarca);

/**
 * @swagger
 * /api/marcas/{id}:
 *   put:
 *     summary: Actualiza una marca existente
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la marca
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarcaInput'
 *     responses:
 *       200:
 *         description: Marca actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Marca'
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation_error:
 *                 value:
 *                   ok: false
 *                   data: null
 *                   error: 'El nombre debe ser una cadena de texto válida.'
 *               activo_not_allowed:
 *                 value:
 *                   ok: false
 *                   data: null
 *                   error: 'No está permitido modificar el campo activo.'
 *       404:
 *         description: Marca no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflicto - Nombre ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticateJWT, requireRole('admin'), actualizarMarca);

/**
 * @swagger
 * /api/marcas/{id}:
 *   delete:
 *     summary: Elimina (borrado lógico) una marca
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la marca
 *     responses:
 *       200:
 *         description: Marca eliminada correctamente
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
 *                   example: 'Marca eliminada correctamente'
 *                 error:
 *                   type: string
 *                   example: null
 *       409:
 *         description: No se puede eliminar - tiene productos asociados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               ok: false
 *               data: null
 *               error: 'No se puede eliminar la marca porque tiene 5 producto(s) asociado(s).'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Marca no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticateJWT, requireRole('admin'), eliminarMarca);

export default router;
