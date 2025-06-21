import { Router } from 'express';

// Controladores
import {
  crearProducto,
  listarProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
} from '../controllers/productoController';
// Middlewares
import { authenticateJWT } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';

const router = Router();

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtiene una lista paginada de productos
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Lista de productos
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticateJWT, listarProductos);

// Tipos para documentación Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         nombre:
 *           type: string
 *           example: "Lentes de Sol Premium"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Lentes polarizados con protección UV 400"
 *         precio:
 *           type: number
 *           format: double
 *           example: 149.99
 *         categoriaId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         categoria:
 *           $ref: '#/components/schemas/Categoria'
 *         imagenUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           example: "https://example.com/images/lentes-sol-premium.jpg"
 *         modelo3dUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           example: "https://example.com/models/lentes-sol-premium.glb"
 *         materialLente:
 *           type: string
 *           nullable: true
 *           example: "Policarbonato"
 *         tratamientoLente:
 *           type: string
 *           nullable: true
 *           example: "Antirreflejante"
 *         graduacionEsfera:
 *           type: number
 *           format: double
 *           nullable: true
 *           example: -2.5
 *         graduacionCilindro:
 *           type: number
 *           format: double
 *           nullable: true
 *           example: -0.75
 *         eje:
 *           type: integer
 *           nullable: true
 *           example: 90
 *         adicion:
 *           type: number
 *           format: double
 *           nullable: true
 *           example: 2.0
 *         tipoArmazon:
 *           type: string
 *           nullable: true
 *           example: "Completo"
 *         materialArmazon:
 *           type: string
 *           nullable: true
 *           example: "Acetato"
 *         tamanoPuente:
 *           type: integer
 *           nullable: true
 *           example: 18
 *         tamanoAros:
 *           type: integer
 *           nullable: true
 *           example: 54
 *         tamanoVarillas:
 *           type: integer
 *           nullable: true
 *           example: 140
 *         activo:
 *           type: boolean
 *           default: true
 *         marcaId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         colorId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         creadoEn:
 *           type: string
 *           format: date-time
 *           example: "2023-05-15T10:30:00Z"
 *         creadoPor:
 *           type: string
 *           nullable: true
 *           example: "usuario@ejemplo.com"
 *         modificadoEn:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2023-05-16T15:45:00Z"
 *         modificadoPor:
 *           type: string
 *           nullable: true
 *           example: "admin@ejemplo.com"
 *         anuladoEn:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         anuladoPor:
 *           type: string
 *           nullable: true
 *           example: null
 *         marca:
 *           $ref: '#/components/schemas/MarcaRelacion'
 *         color:
 *           $ref: '#/components/schemas/ColorRelacion'
 *         _count:
 *           type: object
 *           properties:
 *             inventario:
 *               type: integer
 *               example: 42
 *         stock:
 *           type: integer
 *           example: 42
 *
 *     Categoria:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         nombre:
 *           type: string
 *           example: "Accesorios"
 *
 *     MarcaRelacion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         nombre:
 *           type: string
 *           example: "Ray-Ban"
 *
 *     ColorRelacion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "660e8400-e29b-41d4-a716-446655440001"
 *         nombre:
 *           type: string
 *           example: "Negro"
 *         codigoHex:
 *           type: string
 *           example: "#000000"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Mensaje de error descriptivo"
 *
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Producto'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 1
 *             pagina:
 *               type: integer
 *               example: 1
 *             limite:
 *               type: integer
 *               example: 10
 *             totalPaginas:
 *               type: integer
 *               example: 1
 *
 *     ProductoInput:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           example: "Lentes de Sol Premium"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Lentes polarizados con protección UV 400"
 *         precio:
 *           type: number
 *           format: double
 *           minimum: 0
 *           example: 149.99
 *         categoriaId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         imagenUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           example: "https://example.com/images/lentes-sol-premium.jpg"
 *         modelo3dUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           example: "https://example.com/models/lentes-sol-premium.glb"
 *         materialLente:
 *           type: string
 *           nullable: true
 *           example: "Policarbonato"
 *         tratamientoLente:
 *           type: string
 *           nullable: true
 *           example: "Antirreflejante"
 *         graduacionEsfera:
 *           type: number
 *           format: double
 *           nullable: true
 *           example: -2.5
 *         graduacionCilindro:
 *           type: number
 *           format: double
 *           nullable: true
 *           example: -1.25
 *         eje:
 *           type: number
 *           nullable: true
 *           example: 90
 *         adicion:
 *           type: number
 *           format: double
 *           nullable: true
 *           example: 1.5
 *         tipoArmazon:
 *           type: string
 *           nullable: true
 *           example: "Completo"
 *         materialArmazon:
 *           type: string
 *           nullable: true
 *           example: "Acetato"
 *         tamanoPuente:
 *           type: number
 *           nullable: true
 *           example: 18
 *         tamanoAros:
 *           type: number
 *           nullable: true
 *           example: 52
 *         tamanoVarillas:
 *           type: number
 *           nullable: true
 *           example: 140
 *         activo:
 *           type: boolean
 *           nullable: true
 *           example: true
 *         erpId:
 *           type: number
 *           nullable: true
 *           example: 1001
 *         erpTipo:
 *           type: string
 *           nullable: true
 *           example: "SAP"
 *         marcaId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         colorId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "660e8400-e29b-41d4-a716-446655440001"
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtiene una lista paginada de productos
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar productos
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: soloActivos
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar solo productos activos
 *       - in: query
 *         name: ordenarPor
 *         schema:
 *           type: string
 *           enum: [nombre, precio, categoria, creado_en, actualizado_en]
 *           default: nombre
 *         description: Campo por el cual ordenar los resultados
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Orden de los resultados (ascendente o descendente)
 *     responses:
 *       200:
 *         description: Lista paginada de productos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       403:
 *         description: No tiene permisos para realizar esta acción
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Rutas públicas
router.get('/', listarProductos);

// Rutas protegidas que requieren autenticación
router.use(authenticateJWT);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       403:
 *         description: No tiene permisos para realizar esta acción
 *       409:
 *         description: Conflicto - Ya existe un producto con ese nombre
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/', authenticateJWT, requireRole('admin', 'inventario'), crearProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Detalles del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Producto'
 *       400:
 *         description: ID de producto inválido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticateJWT, obtenerProductoPorId);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualiza un producto existente
 *     description: Actualiza los datos de un producto existente. Solo los campos proporcionados serán actualizados.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto a actualizar
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       description: Datos del producto a actualizar
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       403:
 *         description: No tiene permisos para realizar esta acción
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflicto - Ya existe un producto con ese nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:id',
  authenticateJWT,
  requireRole('admin', 'vendedor', 'optometrista'),
  actualizarProducto
);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Elimina un producto (soft delete)
 *     description: Realiza una eliminación lógica del producto, marcándolo como inactivo en lugar de eliminarlo físicamente.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto a eliminar
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente (marcado como inactivo)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Producto'
 *       400:
 *         description: ID de producto inválido o producto ya eliminado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No tiene permisos para realizar esta acción
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticateJWT, requireRole('admin'), eliminarProducto);

export default router;
