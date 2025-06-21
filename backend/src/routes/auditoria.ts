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
 *           type: object
 *           description: Descripción detallada de la acción (formato JSON)
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la acción
 *         ip:
 *           type: string
 *           description: Dirección IP desde donde se realizó la acción
 *         tipoCorreo:
 *           type: string
 *           description: Tipo de correo relacionado con la acción
 *         correoDestino:
 *           type: string
 *           description: Dirección de correo destino
 *         usuarioDestino:
 *           type: string
 *           description: Usuario destino de la acción
 *         entidadTipo:
 *           type: string
 *           description: Tipo de entidad afectada
 *         entidadId:
 *           type: string
 *           format: uuid
 *           description: ID de la entidad afectada
 *         estadoEnvio:
 *           type: string
 *           description: Estado del envío relacionado
 *         mensajeError:
 *           type: string
 *           description: Mensaje de error si la acción falló
 *         enviadoPor:
 *           type: string
 *           description: Usuario que envió la acción
 *         origenEnvio:
 *           type: string
 *           description: Origen del envío
 *         intentos:
 *           type: integer
 *           description: Número de intentos realizados
 *         modulo:
 *           type: string
 *           description: Módulo al que pertenece la acción
 *         movimientoId:
 *           type: string
 *           format: uuid
 *           description: ID del movimiento contable relacionado
 *         resultado:
 *           type: string
 *           enum: [exitoso, fallido, pendiente]
 *           description: Resultado de la acción
 *         usuario:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             nombreCompleto:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 */

/**
 * @swagger
 * /api/auditoria:
 *   get:
 *     summary: Consulta registros de auditoría con filtros avanzados y paginación
 *     description: >
 *       **IMPORTANTE**: Este endpoint requiere autenticación. Debe incluir un token JWT válido
 *       en el encabezado 'Authorization' en formato 'Bearer {token}'. Los usuarios deben tener
 *       rol de administrador para acceder a estos registros.
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (≥ 1)
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de registros por página (entre 1 y 100)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: fecha
 *         description: Campo por el cual ordenar los resultados
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de los resultados (ascendente o descendente)
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde esta fecha (formato YYYY-MM-DD)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta esta fecha (formato YYYY-MM-DD)
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID del usuario
 *       - in: query
 *         name: accion
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de acción
 *       - in: query
 *         name: ip
 *         schema:
 *           type: string
 *         description: Filtrar por dirección IP
 *       - in: query
 *         name: entidadTipo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de entidad
 *       - in: query
 *         name: entidadId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de entidad
 *       - in: query
 *         name: modulo
 *         schema:
 *           type: string
 *         description: Filtrar por módulo del sistema
 *       - in: query
 *         name: resultado
 *         schema:
 *           type: string
 *           enum: [exitoso, fallido, pendiente]
 *         description: Filtrar por resultado de la acción
 *     responses:
 *       200:
 *         description: Lista paginada de registros de auditoría
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
 *                         $ref: '#/components/schemas/LogAuditoria'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         perPage:
 *                           type: integer
 *                           example: 20
 *                         totalItems:
 *                           type: integer
 *                           example: 120
 *                         totalPages:
 *                           type: integer
 *                           example: 6
 *                 error:
 *                   type: null
 *       400:
 *         description: Parámetros de filtro o paginación inválidos
 *       401:
 *         description: No autorizado, token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   example: "Token inválido o no enviado"
 *       403:
 *         description: Prohibido, el usuario no tiene rol de administrador
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticateJWT, requireRole('admin'), auditoriaController.getAuditLogs);

export default router;
