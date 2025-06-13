// Datos de prueba para el módulo de colores

export const validColorData = {
  nombre: 'Rojo',
  codigoHex: '#FF0000',
  descripcion: 'Color rojo estándar',
  activo: true,
};

export const invalidColorData = {
  // Falta el campo nombre que es requerido
  codigoHex: 'FF0000', // Formato inválido (sin #)
  descripcion: 'Color inválido',
  activo: true,
};

export const updatedColorData = {
  nombre: 'Rojo Intenso',
  codigoHex: '#CC0000',
  descripcion: 'Color rojo más intenso',
  activo: true,
};

export const mockColor = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  nombre: 'Rojo',
  codigoHex: '#FF0000',
  descripcion: 'Color rojo estándar',
  activo: true,
  creadoEn: new Date(),
  creadoPor: 'test@example.com',
  modificadoEn: null,
  modificadoPor: null,
  anuladoEn: null,
  anuladoPor: null,
};

export const mockColorList = [
  {
    ...mockColor,
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Azul',
    codigoHex: '#0000FF',
  },
  {
    ...mockColor,
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre: 'Verde',
    codigoHex: '#00FF00',
  },
];
