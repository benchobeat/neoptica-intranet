/**
 * @fileoverview Fixtures para las pruebas del controlador de sucursales.
 *
 * @description
 * Este archivo contiene datos de prueba reutilizables para los tests
 * del controlador `sucursalController`. La centralización de estos datos
 * facilita el mantenimiento y la consistencia de las pruebas.
 *
 * @module __fixtures__/sucursalFixtures
 */

import { v4 as uuidv4 } from 'uuid';

// ID de usuario simulado para campos de auditoría
export const mockUserId = '550e8400-e29b-41d4-a716-446655440000';

/**
 * Datos básicos para crear una nueva sucursal
 */
export const createSucursalData = {
  nombre: 'Sucursal Centro',
  direccion: 'Av. Principal #123',
  telefono: '1234567890',
  email: 'centro@example.com',
  latitud: -0.180653,
  longitud: -78.467834,
  activo: true,
};

/**
 * Datos para actualizar una sucursal existente
 */
export const updateSucursalData = {
  nombre: 'Sucursal Centro Actualizada',
  direccion: 'Av. Principal #1234',
  telefono: '0987654321',
  email: 'nuevo@example.com',
  latitud: -0.1807,
  longitud: -78.4679,
  activo: false,
};

/**
 * Mock de una sucursal existente con todos los campos
 */
export const mockSucursal = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  ...createSucursalData,
  creadoEn: new Date('2023-01-01T00:00:00.000Z'),
  creadoPor: mockUserId,
  modificadoEn: null,
  modificadoPor: null,
  anuladoEn: null,
  anuladoPor: null,
};

/**
 * Mock de una sucursal actualizada
 */
export const mockUpdatedSucursal = {
  ...mockSucursal,
  ...updateSucursalData,
  modificadoEn: new Date('2023-01-02T00:00:00.000Z'),
  modificadoPor: mockUserId,
};

/**
 * Mock de una sucursal eliminada (soft delete)
 */
export const mockDeletedSucursal = {
  ...mockSucursal,
  estado: false,
  anuladoEn: new Date('2023-01-03T00:00:00.000Z'),
  anuladoPor: mockUserId,
};

/**
 * Lista de sucursales para pruebas de listado
 */
export const mockSucursalList = [
  {
    ...mockSucursal,
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Sucursal Norte',
    direccion: 'Av. Norte #456',
    telefono: '022222222',
    email: 'norte@example.com',
    latitud: -0.18,
    longitud: -78.46,
  },
  {
    ...mockSucursal,
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre: 'Sucursal Sur',
    direccion: 'Av. Sur #789',
    telefono: '023333333',
    email: 'sur@example.com',
    latitud: -0.19,
    longitud: -78.47,
    activo: false,
  },
  {
    ...mockSucursal,
    id: '550e8400-e29b-41d4-a716-446655440003',
    nombre: 'Sucursal Este',
    direccion: 'Av. Este #012',
    telefono: '024444444',
    email: 'este@example.com',
    latitud: -0.17,
    longitud: -78.45,
  },
];

/**
 * Datos inválidos para probar validaciones
 */
export const invalidSucursalData = {
  // Nombre muy corto
  nombreCorto: {
    ...createSucursalData,
    nombre: 'AB',
    error: 'El nombre debe tener al menos 3 caracteres.',
  },

  // Teléfono inválido
  telefonoInvalido: {
    ...createSucursalData,
    telefono: '12345',
    error: 'El teléfono debe tener 10 dígitos.',
  },

  // Email inválido
  emailInvalido: {
    ...createSucursalData,
    email: 'correo-invalido',
    error: 'El correo electrónico no es válido.',
  },

  // Faltan campos requeridos
  camposFaltantes: {
    nombre: '',
    error: 'El nombre es obligatorio y debe ser una cadena de texto.',
  },
};
