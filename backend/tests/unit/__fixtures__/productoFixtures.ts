/**
 * @fileoverview Fixtures para las pruebas del controlador de productos.
 *
 * @description
 * Este archivo contiene datos de prueba reutilizables para los tests
 * del controlador `productoController`. La centralización de estos datos
 * facilita el mantenimiento y la consistencia de las pruebas.
 *
 * @module __fixtures__/productoFixtures
 * @requires @prisma/client
 */

import { v4 as uuidv4 } from 'uuid';

// ID de usuario simulado para campos de auditoría
export const mockUserId = uuidv4();

/**
 * @namespace productoFixtures
 * @description Contiene los fixtures para las pruebas de productos.
 */
export const productoFixtures = {
  /**
   * Un producto válido para ser utilizado en las pruebas de creación.
   * @type {object}
   */
  productoValido: {
    nombre: 'Lentes de Sol Test',
    descripcion: 'Unos lentes de sol para pruebas',
    precio: 199.99,
    categoria: 'Accesorios',
    activo: true,
  },

  /**
   * Datos de actualización para un producto.
   * @type {object}
   */
  datosActualizacion: {
    nombre: 'Lentes de Sol Test Actualizado',
    precio: 249.99,
    activo: false,
  },

  /**
   * Un producto existente simulado que se devuelve desde la base de datos.
   * Incluye campos de auditoría y un ID.
   * @type {object}
   */
  productoExistente: {
    id: uuidv4(),
    nombre: 'Lentes de Sol Test',
    descripcion: 'Unos lentes de sol para pruebas',
    precio: 199.99,
    categoria: 'Accesorios',
    activo: true,
    creadoEn: new Date(),
    creadoPor: mockUserId,
    modificadoEn: null,
    modificadoPor: null,
    anuladoEn: null,
    anuladoPor: null,
    // Simular relaciones
    marcaId: uuidv4(),
    colorId: uuidv4(),
    // Campos adicionales para cobertura de pruebas
    imagenUrl: null,
    modelo3dUrl: null,
    tipoProducto: null,
    tipoLente: null,
    materialLente: null,
    tratamientoLente: null,
    graduacionEsfera: null,
    graduacionCilindro: null,
    eje: null,
    adicion: null,
    tipoArmazon: null,
    materialArmazon: null,
    tamanoPuente: null,
    tamanoAros: null,
    tamanoVarillas: null,
    erpId: null,
    erpTipo: null,
  },

  /**
   * Una lista de productos para simular la respuesta del listado.
   * @type {Array<object>}
   */
  listaDeProductos: [
    {
      id: uuidv4(),
      nombre: 'Producto de Prueba 1',
      precio: 100.0,
      categoria: 'Lentes',
      activo: true,
      creadoEn: new Date(),
      // Campos adicionales requeridos
      descripcion: 'Descripción del producto 1',
      imagenUrl: null,
      modelo3dUrl: null,
      tipoProducto: null,
      tipoLente: null,
      materialLente: null,
      tratamientoLente: null,
      graduacionEsfera: null,
      graduacionCilindro: null,
      eje: null,
      adicion: null,
      tipoArmazon: null,
      materialArmazon: null,
      tamanoPuente: null,
      tamanoAros: null,
      tamanoVarillas: null,
      erpId: null,
      erpTipo: null,
      creadoPor: mockUserId,
      modificadoEn: null,
      modificadoPor: null,
      anuladoEn: null,
      anuladoPor: null,
      marcaId: uuidv4(),
      colorId: uuidv4(),
    },
    {
      id: uuidv4(),
      nombre: 'Producto de Prueba 2',
      precio: 150.0,
      categoria: 'Accesorios',
      activo: true,
      creadoEn: new Date(),
      // Campos adicionales requeridos
      descripcion: 'Descripción del producto 2',
      imagenUrl: null,
      modelo3dUrl: null,
      tipoProducto: null,
      tipoLente: null,
      materialLente: null,
      tratamientoLente: null,
      graduacionEsfera: null,
      graduacionCilindro: null,
      eje: null,
      adicion: null,
      tipoArmazon: null,
      materialArmazon: null,
      tamanoPuente: null,
      tamanoAros: null,
      tamanoVarillas: null,
      erpId: null,
      erpTipo: null,
      creadoPor: mockUserId,
      modificadoEn: null,
      modificadoPor: null,
      anuladoEn: null,
      anuladoPor: null,
      marcaId: uuidv4(),
      colorId: uuidv4(),
    },
    {
      id: uuidv4(),
      nombre: 'Producto Inactivo de Prueba',
      precio: 50.0,
      categoria: 'Lentes',
      activo: false,
      creadoEn: new Date(),
      // Campos adicionales requeridos
      descripcion: 'Descripción del producto inactivo',
      imagenUrl: null,
      modelo3dUrl: null,
      tipoProducto: null,
      tipoLente: null,
      materialLente: null,
      tratamientoLente: null,
      graduacionEsfera: null,
      graduacionCilindro: null,
      eje: null,
      adicion: null,
      tipoArmazon: null,
      materialArmazon: null,
      tamanoPuente: null,
      tamanoAros: null,
      tamanoVarillas: null,
      erpId: null,
      erpTipo: null,
      creadoPor: mockUserId,
      modificadoEn: null,
      modificadoPor: null,
      anuladoEn: new Date(), // Producto inactivo
      anuladoPor: mockUserId,
      marcaId: uuidv4(),
      colorId: uuidv4(),
    },
  ],
};