import { Router } from 'express';
import * as auditoriaController from '../controllers/auditoriaController';
import { authenticateJWT } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auditoría
 *   description: Gestión y consulta de registros de auditoría
 */

/**
 * @swagger
 * /api/auditoria:
 *   get:
 *     summary: Lista registros de auditoría con filtros y paginación
 *     tags: [Auditoría]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: modulo
 *         schema:
 *           type: string
 *         description: Filtrar por módulo (ej. usuarios, marcas, colores)
 *       - in: query
 *         name: accion
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de acción (ej. crear, listar, actualizar)
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de usuario que realizó la acción
 *       - in: query
 *         name: entidadTipo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de entidad afectada
 *       - in: query
 *         name: entidadId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de entidad afectada
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar (formato YYYY-MM-DD)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar (formato YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de registros por página (máximo 100)
 *     responses:
 *       200:
 *         description: Lista de registros de auditoría con metadatos de paginación
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
 *                     registros:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LogAuditoria'
 *                     paginacion:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 120
 *                         pagina:
 *                           type: integer
 *                           example: 1
 *                         limite:
 *                           type: integer
 *                           example: 10
 *                         paginas:
 *                           type: integer
 *                           example: 12
 *                 error:
 *                   type: null
 *       400:
 *         description: Parámetros de paginación o filtro inválidos
 *       401:
 *         description: No autorizado, token inválido o expirado
 *       403:
 *         description: Prohibido, el usuario no tiene rol de administrador
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticateJWT, requireRole('admin'), auditoriaController.listarAuditoria);

/**
 * @swagger
 * /api/auditoria/{id}:
 *   get:
 *     summary: Obtiene un registro de auditoría por su ID
 *     tags: [Auditoría]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del registro de auditoría
 *     responses:
 *       200:
 *         description: Registro de auditoría encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogAuditoria'
 *                 error:
 *                   type: null
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado, token inválido o expirado
 *       403:
 *         description: Prohibido, el usuario no tiene rol de administrador
 *       404:
 *         description: Registro de auditoría no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticateJWT, requireRole('admin'), auditoriaController.obtenerAuditoriaPorId);

/**
 * @swagger
 * /api/auditoria/modulo/{modulo}:
 *   get:
 *     summary: Filtra registros de auditoría por módulo
 *     tags: [Auditoría]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modulo
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del módulo (ej. usuarios, marcas, colores)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de registros por página (máximo 100)
 *     responses:
 *       200:
 *         description: Lista de registros de auditoría filtrados por módulo
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
 *                     registros:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LogAuditoria'
 *                     modulo:
 *                       type: string
 *                       example: "usuarios"
 *                     paginacion:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         pagina:
 *                           type: integer
 *                           example: 1
 *                         limite:
 *                           type: integer
 *                           example: 10
 *                         paginas:
 *                           type: integer
 *                           example: 5
 *                 error:
 *                   type: null
 *       400:
 *         description: Módulo inválido o parámetros de paginación inválidos
 *       401:
 *         description: No autorizado, token inválido o expirado
 *       403:
 *         description: Prohibido, el usuario no tiene rol de administrador
 *       500:
 *         description: Error interno del servidor
 */
router.get('/modulo/:modulo', authenticateJWT, requireRole('admin'), auditoriaController.filtrarAuditoriaPorModulo);

/**
 * @swagger
 * /api/auditoria/usuario/{id}:
 *   get:
 *     summary: Filtra registros de auditoría por usuario
 *     tags: [Auditoría]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de registros por página (máximo 100)
 *     responses:
 *       200:
 *         description: Lista de registros de auditoría filtrados por usuario
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
 *                     registros:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LogAuditoria'
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         nombre_completo:
 *                           type: string
 *                     paginacion:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 30
 *                         pagina:
 *                           type: integer
 *                           example: 1
 *                         limite:
 *                           type: integer
 *                           example: 10
 *                         paginas:
 *                           type: integer
 *                           example: 3
 *                 error:
 *                   type: null
 *       400:
 *         description: ID de usuario inválido o parámetros de paginación inválidos
 *       401:
 *         description: No autorizado, token inválido o expirado
 *       403:
 *         description: Prohibido, el usuario no tiene rol de administrador
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/usuario/:id', authenticateJWT, requireRole('admin'), auditoriaController.filtrarAuditoriaPorUsuario);

/**
 * @swagger
 * components:
 *   schemas:
 *     LogAuditoria:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del registro de auditoría
 *         usuarioId:
 *           type: string
 *           format: uuid
 *           description: ID del usuario que realizó la acción
 *         accion:
 *           type: string
 *           description: Tipo de acción realizada (crear, listar, actualizar, eliminar, etc.)
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la acción
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la acción
 *         ip:
 *           type: string
 *           description: Dirección IP desde donde se realizó la acción
 *         entidadTipo:
 *           type: string
 *           description: Tipo de entidad afectada
 *         entidadId:
 *           type: string
 *           format: uuid
 *           description: ID de la entidad afectada
 *         modulo:
 *           type: string
 *           description: Módulo al que pertenece la acción
 *         usuario:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             nombre_completo:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 */

export default router;
