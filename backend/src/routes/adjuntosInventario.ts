import { Router } from 'express';
import { 
  subirAdjuntos, 
  listarAdjuntos, 
  descargarAdjunto, 
  eliminarAdjunto 
} from '../controllers/adjuntoInventarioController';
import { authenticateJWT } from '../middlewares/auth';
import { uploadInventarioAdjunto, handleMulterError } from '../middlewares/fileUpload';
import { requireRole } from '../middlewares/roles';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AdjuntoInput:
 *       type: object
 *       properties:
 *         files:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Archivos adjuntos a subir (max 2MB c/u, máx. 5 archivos por solicitud)
 *       required:
 *         - files
 *       example:
 *         files: ["archivo1.pdf", "comprobante.jpg"]
 *     Adjunto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *           description: Identificador único del adjunto
 *         nombre:
 *           type: string
 *           example: "factura-compra.pdf"
 *           description: Nombre original del archivo
 *         tipo:
 *           type: string
 *           example: "application/pdf"
 *           description: MIME type del archivo
 *         tamanio:
 *           type: integer
 *           example: 1048576
 *           description: Tamaño en bytes
 *         extension:
 *           type: string
 *           example: "pdf"
 *           description: Extensión del archivo
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de subida
 *         subidoPor:
 *           type: string
 *           example: "Juan Pérez"
 *           description: Nombre del usuario que subió el archivo
 *         inventarioId:
 *           type: string
 *           format: uuid
 *           description: ID del inventario asociado
 *           example: "a23e4567-e89b-12d3-a456-426614174001"
 *         anulado:
 *           type: boolean
 *           description: Indica si el adjunto ha sido eliminado (soft delete)
 *           example: false
 *         rutaArchivo:
 *           type: string
 *           description: Ruta relativa del archivo en el sistema (no expuesta al cliente)
 *           example: "uploads/inventario/123e4567/factura-compra.pdf"
 */

/**
 * @swagger
 * /api/inventario/{movimientoId}/adjuntos:
 *   post:
 *     summary: Subir uno o varios archivos adjuntos a un movimiento de inventario
 *     description: |
 *       Permite subir hasta 5 archivos adjuntos a un movimiento de inventario específico.
 *       Importante: Este endpoint utiliza un orden específico de middleware donde la autenticación JWT
 *       se verifica antes del procesamiento de archivos de Multer para evitar errores de conexión ECONNRESET.
 *     tags: [Inventario - Adjuntos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movimientoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del movimiento de inventario
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/AdjuntoInput'
 *     responses:
 *       201:
 *         description: Archivos adjuntos subidos correctamente
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
 *                     $ref: '#/components/schemas/Adjunto'
 *                 error:
 *                   type: null
 *       400:
 *         description: Error en la solicitud (tipo de archivo no permitido o tamaño excedido)
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Movimiento de inventario no encontrado
 *       500:
 *         description: Error interno del servidor
 *   get:
 *     summary: Listar todos los adjuntos de un movimiento de inventario
 *     description: |
 *       Recupera todos los archivos adjuntos asociados a un movimiento de inventario específico.
 *       Solo muestra archivos no eliminados (soft delete). Los resultados incluyen
 *       metadatos como nombre, tipo, tamaño y usuario que subió el archivo.
 *       Requiere autenticación JWT.
 *     tags: [Inventario - Adjuntos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movimientoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del movimiento de inventario
 *     responses:
 *       200:
 *         description: Lista de adjuntos del movimiento
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
 *                     $ref: '#/components/schemas/Adjunto'
 *                 error:
 *                   type: null
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Movimiento de inventario no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 * /api/inventario/adjuntos/{adjuntoId}:
 *   get:
 *     summary: Descargar un archivo adjunto por su ID
 *     description: |
 *       Permite descargar un archivo adjunto específico mediante su ID.
 *       La descarga se registra en el sistema de auditoría para mantener
 *       un historial completo de acceso a los archivos. El archivo se envía
 *       con los encabezados Content-Disposition adecuados para forzar la descarga.
 *       Requiere autenticación JWT.
 *     tags: [Inventario - Adjuntos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adjuntoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del archivo adjunto
 *     responses:
 *       200:
 *         description: Archivo descargado correctamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Archivo adjunto no encontrado
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar (soft delete) un archivo adjunto por su ID
 *     description: |
 *       Realiza un borrado lógico (soft delete) de un archivo adjunto.
 *       El archivo no se elimina físicamente del sistema de archivos, sino que
 *       se marca como eliminado en la base de datos. Esta operación solo puede
 *       ser realizada por usuarios con rol de administrador.
 *       Todas las eliminaciones se registran en el sistema de auditoría.
 *     tags: [Inventario - Adjuntos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adjuntoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del archivo adjunto
 *     responses:
 *       200:
 *         description: Archivo adjunto eliminado correctamente
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     nombre:
 *                       type: string
 *                     mensaje:
 *                       type: string
 *                 error:
 *                   type: null
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permiso denegado (solo administradores)
 *       404:
 *         description: Archivo adjunto no encontrado
 *       500:
 *         description: Error interno del servidor
 */

// Middleware para capturar errores de multer
const multerErrorHandler = (req, res, next) => {
  const upload = uploadInventarioAdjunto.array('files', 5); // Máximo 5 archivos por solicitud
  
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        data: null,
        error: handleMulterError(err)
      });
    }
    next();
  });
};

// Ya no protegemos todas las rutas globalmente para poder manejar mejor el error 401
// router.use(authenticateJWT);

// Subir adjuntos a un movimiento de inventario - con JWT antes de multer
router.post('/:movimientoId/adjuntos', authenticateJWT, multerErrorHandler, subirAdjuntos);

// Listar adjuntos de un movimiento de inventario
router.get('/:movimientoId/adjuntos', authenticateJWT, listarAdjuntos);

// Descargar un adjunto
router.get('/adjuntos/:adjuntoId', authenticateJWT, descargarAdjunto);

// Eliminar un adjunto (solo admin)
router.delete('/adjuntos/:adjuntoId', authenticateJWT, requireRole('admin'), eliminarAdjunto);

export default router;
