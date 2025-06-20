import { Router } from 'express';

import {
  crearCategoria,
  listarCategorias,
  obtenerCategoriaPorId,
  actualizarCategoria,
  eliminarCategoria,
} from '@/controllers/categoriaController';
import { authenticateJWT } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/roles';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categorías
 *   description: Gestión de categorías de productos
 * components:
 *   schemas:
 *     CategoriaInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Lentes de Sol"
 *         descripcion:
 *           type: string
 *           example: "Categoría para lentes de sol de todas las marcas"
 *         tipoCategoria:
 *           type: string
 *           enum: [LENTE, ARMAZON, ACCESORIO, SOLUCION]
 *           example: "LENTE"
 *         iconoUrl:
 *           type: string
 *           example: "https://example.com/icono.png"
 *         orden:
 *           type: integer
 *           example: 1
 *         padreId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     Categoria:
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
 *         tipoCategoria:
 *           type: string
 *           enum: [LENTE, ARMAZON, ACCESORIO, SOLUCION]
 *         iconoUrl:
 *           type: string
 *         orden:
 *           type: integer
 *         erpId:
 *           type: integer
 *         erpTipo:
 *           type: string
 *         padreId:
 *           type: string
 *           format: uuid
 *         padre:
 *           $ref: '#/components/schemas/Categoria'
 *         subcategorias:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Categoria'
 *         creadoEn:
 *           type: string
 *           format: date-time
 *         modificadoEn:
 *           type: string
 *           format: date-time
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
 * /api/categorias:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaInput'
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Categoria'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Error de validación o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado - Se requiere autenticación
 *       403:
 *         description: Prohibido - No tiene permisos suficientes
 *       409:
 *         description: Conflicto - La categoría ya existe
 *       500:
 *         description: Error del servidor
 */
router.post('/', authenticateJWT, requireRole('admin'), crearCategoria);

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Listar categorías con estructura jerárquica
 *     description: |
 *       Obtiene la lista de categorías con estructura jerárquica. Por defecto, solo devuelve
 *       las categorías de primer nivel (sin padre) con sus subcategorías anidadas.
 *
 *       Parámetros de consulta:
 *       - `activo`: Filtra por estado activo/inactivo
 *       - `tipo`: Filtra por tipo de categoría
 *       - `padreId`: Filtra por categoría padre específica (devuelve solo sus subcategorías directas)
 *       - `incluirSubcategorias`: Si es `false`, solo devuelve categorías de primer nivel
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtra categorías por estado activo (true) o inactivo (false)
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [LENTE, ARMAZON, ACCESORIO, SOLUCION]
 *           example: LENTE
 *         description: Filtra categorías por tipo específico
 *       - in: query
 *         name: padreId
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         description: |
 *           Filtra subcategorías de una categoría padre específica.
 *           Si no se especifica, devuelve categorías raíz (sin padre).
 *       - in: query
 *         name: incluirSubcategorias
 *         schema:
 *           type: boolean
 *           default: true
 *         description: |
 *           Si es `false`, solo devuelve categorías de primer nivel sin anidar subcategorías.
 *           Solo aplica cuando no se especifica `padreId`.
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Categoria'
 *                   description: |
 *                     Lista de categorías. La estructura varía según los parámetros:
 *                     - Sin parámetros: Categorías raíz con subcategorías anidadas
 *                     - Con padreId: Subcategorías directas de la categoría padre
 *                     - Con incluirSubcategorias=false: Solo categorías de primer nivel
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *             examples:
 *               categoriasRaiz:
 *                 summary: Categorías raíz con subcategorías anidadas (comportamiento por defecto)
 *                 value:
 *                   ok: true
 *                   data:
 *                     - id: "123e4567-e89b-12d3-a456-426614174000"
 *                       nombre: "Lentes"
 *                       subcategorias:
 *                         - id: "223e4567-e89b-12d3-a456-426614174001"
 *                           nombre: "Lentes de Sol"
 *                           subcategorias: []
 *                     - id: "323e4567-e89b-12d3-a456-426614174002"
 *                       nombre: "Armazones"
 *                       subcategorias: []
 *                   error: null
 *               subcategorias:
 *                 summary: Subcategorías directas de una categoría padre
 *                 value:
 *                   ok: true
 *                   data:
 *                     - id: "223e4567-e89b-12d3-a456-426614174001"
 *                       nombre: "Lentes de Sol"
 *                       padreId: "123e4567-e89b-12d3-a456-426614174000"
 *                     - id: "223e4567-e89b-12d3-a456-426614174003"
 *                       nombre: "Lentes de Lectura"
 *                       padreId: "123e4567-e89b-12d3-a456-426614174000"
 *                   error: null
 *       400:
 *         description: Parámetros de consulta inválidos
 *       401:
 *         description: No autorizado - Se requiere autenticación
 *       403:
 *         description: Prohibido - No tiene permisos suficientes
 *       500:
 *         description: Error del servidor al obtener las categorías
 */
router.get('/', authenticateJWT, requireRole('admin', 'vendedor'), listarCategorias);

/**
 * @swagger
 * /api/categorias/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la categoría a obtener
 *     responses:
 *       200:
 *         description: Categoría obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Categoria'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', authenticateJWT, requireRole('admin', 'vendedor'), obtenerCategoriaPorId);

/**
 * @swagger
 * /api/categorias/{id}:
 *   put:
 *     summary: Actualizar una categoría existente
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la categoría a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaInput'
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Categoria'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Error de validación o datos inválidos
 *       401:
 *         description: No autorizado - Se requiere autenticación
 *       403:
 *         description: Prohibido - No tiene permisos suficientes
 *       404:
 *         description: Categoría no encontrada
 *       409:
 *         description: Conflicto - Ya existe una categoría con ese nombre
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', authenticateJWT, requireRole('admin'), actualizarCategoria);

/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Eliminar una categoría (soft delete)
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la categoría a eliminar
 *     responses:
 *       200:
 *         description: Categoría desactivada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Categoria'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: No se puede eliminar una categoría con productos o subcategorías activas
 *       401:
 *         description: No autorizado - Se requiere autenticación
 *       403:
 *         description: Prohibido - No tiene permisos suficientes
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', authenticateJWT, requireRole('admin'), eliminarCategoria);

export default router;
