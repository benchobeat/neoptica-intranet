import type { Categoria } from '@prisma/client';

// Fixture de categoría básica
export const mockCategoria: Categoria = {
  id: 'cat-test-id-1',
  nombre: 'Lentes de Sol',
  descripcion: 'Categoría de lentes de sol',
  tipoCategoria: 'LENTE',
  iconoUrl: 'https://ejemplo.com/iconos/lentes-sol.png',
  orden: 1,
  padreId: null,
  activo: true,
  erpId: 1001,
  erpTipo: 'CAT',
  creadoEn: new Date('2023-01-01T00:00:00Z'),
  creadoPor: 'usuario-test',
  modificadoEn: new Date('2023-01-01T00:00:00Z'),
  modificadoPor: 'usuario-test',
  anuladoEn: null,
  anuladoPor: null,
};

// Fixture de categoría con padre (subcategoría)
export const mockCategoriaWithParent: Categoria = {
  id: 'cat-test-id-2',
  nombre: 'Lentes de Sol Deportivos',
  descripcion: 'Subcategoría de lentes deportivos',
  tipoCategoria: 'LENTE',
  iconoUrl: 'https://ejemplo.com/iconos/lentes-deportivos.png',
  orden: 1,
  padreId: 'cat-test-id-1', // Apunta a la categoría padre
  activo: true,
  erpId: 1002,
  erpTipo: 'CAT',
  creadoEn: new Date('2023-01-02T00:00:00Z'),
  creadoPor: 'usuario-test',
  modificadoEn: new Date('2023-01-02T00:00:00Z'),
  modificadoPor: 'usuario-test',
  anuladoEn: null,
  anuladoPor: null,
};

// Versión extendida con datos de padre para tests que usan relaciones
export const mockCategoriaWithParentExtended = {
  ...mockCategoriaWithParent,
  padre: {
    id: 'cat-test-id-1',
    nombre: 'Lentes de Sol',
  },
};

// Fixture de categoría no activa
export const mockCategoriaInactiva: Categoria = {
  id: 'cat-test-id-3',
  nombre: 'Lentes Descontinuados',
  descripcion: 'Categoría de lentes descontinuados',
  tipoCategoria: 'LENTE',
  iconoUrl: 'https://ejemplo.com/iconos/descontinuados.png',
  orden: 3,
  padreId: null,
  activo: false,
  erpId: 1003,
  erpTipo: 'CAT',
  creadoEn: new Date('2023-01-03T00:00:00Z'),
  creadoPor: 'usuario-test',
  modificadoEn: new Date('2023-01-03T00:00:00Z'),
  modificadoPor: 'usuario-test',
  anuladoEn: new Date('2023-01-10T00:00:00Z'),
  anuladoPor: 'usuario-admin',
};

// Fixture de categoría de accesorios (tipo diferente)
export const mockCategoriaAccesorios: Categoria = {
  id: 'cat-test-id-4',
  nombre: 'Accesorios',
  descripcion: 'Categoría de accesorios para lentes',
  tipoCategoria: 'ACCESORIO',
  iconoUrl: 'https://ejemplo.com/iconos/accesorios.png',
  orden: 4,
  padreId: null,
  activo: true,
  erpId: 1004,
  erpTipo: 'CAT',
  creadoEn: new Date('2023-01-04T00:00:00Z'),
  creadoPor: 'usuario-test',
  modificadoEn: new Date('2023-01-04T00:00:00Z'),
  modificadoPor: 'usuario-test',
  anuladoEn: null,
  anuladoPor: null,
};

// Lista de categorías para pruebas que requieren múltiples registros
export const mockCategoriaList: Categoria[] = [
  mockCategoria,
  mockCategoriaWithParent,
  mockCategoriaInactiva,
  mockCategoriaAccesorios,
];

// Datos para crear una nueva categoría válida
export const validCategoriaData = {
  nombre: 'Nueva Categoría',
  descripcion: 'Descripción de la nueva categoría',
  tipoCategoria: 'LENTE',
  iconoUrl: 'https://ejemplo.com/iconos/nueva.png',
  orden: 5,
  padreId: null,
  activo: true,
};

// Datos inválidos para pruebas de validación
export const invalidCategoriaData = {
  nombre: '',
  descripcion: 'Descripción inválida',
  tipoCategoria: 'TIPO_INVALIDO',
  iconoUrl: 'invalid-url',
  orden: 'no-numerico',
};

// Datos de categoría con referencia a padre que existe
export const validCategoriaDataWithParent = {
  ...validCategoriaData,
  nombre: 'Nueva Subcategoría',
  padreId: mockCategoria.id,
};

// Datos para actualizar una categoría
export const updateCategoriaData = {
  nombre: 'Categoría Actualizada',
  descripcion: 'Descripción actualizada',
  orden: 10,
};

// Categoría con subcategorías para pruebas de relaciones
export const mockCategoriaWithSubcategorias = {
  ...mockCategoria,
  subcategorias: [mockCategoriaWithParent],
  _count: {
    productos: 2,
    subcategorias: 1,
  },
};

// Categoría con productos para pruebas
export const mockCategoriaWithProductos = {
  ...mockCategoria,
  _count: {
    productos: 5,
    subcategorias: 0,
  },
};

// Alias para compatibilidad con tests existentes
export const mockCategoriaWithProductCount = mockCategoriaWithProductos;
