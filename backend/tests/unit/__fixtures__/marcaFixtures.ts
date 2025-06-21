export const mockMarca = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  nombre: 'Ray-Ban',
  descripcion: 'Marca líder en gafas de sol',
  activo: true,
  creadoEn: new Date(),
  creadoPor: 'usuario-test-id',
  modificadoEn: null,
  modificadoPor: null,
  anuladoEn: null,
  anuladoPor: null,
};

export const mockMarcaInactiva = {
  id: '2',
  nombre: 'Marca Inactiva',
  descripcion: 'Descripción de marca inactiva',
  activo: false,
  anuladoEn: new Date(),
  anuladoPor: 'user-id',
  creadoPor: 'user-id',
  creadoEn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
  modificadoPor: 'user-id',
  modificadoEn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
};

export const createMarcaData = {
  nombre: 'Nueva Marca',
  descripcion: 'Descripción de prueba',
  activo: true,
};

export const updateMarcaData = {
  nombre: 'Marca Actualizada',
  descripcion: 'Descripción actualizada',
  activo: false,
};

export const mockMarcaList = [
  {
    ...mockMarca,
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Marca 1',
  },
  {
    ...mockMarca,
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre: 'Marca 2',
    activo: false,
  },
  {
    ...mockMarca,
    id: '550e8400-e29b-41d4-a716-446655440003',
    nombre: 'Otra Marca',
  },
];
