import type { Rol } from '@prisma/client';

export const mockRol: Rol = {
  id: '1',
  nombre: 'ADMIN',
  descripcion: 'Administrador del sistema',
  creadoEn: new Date(),
  creadoPor: 'system',
  modificadoEn: null,
  modificadoPor: null,
  anuladoEn: null,
  anuladoPor: null,
};

export const mockRolesList: Rol[] = [
  {
    ...mockRol,
    id: '1',
    nombre: 'ADMIN',
    descripcion: 'Administrador del sistema',
  },
  {
    ...mockRol,
    id: '2',
    nombre: 'VENDEDOR',
    descripcion: 'Vendedor de la tienda',
  },
  {
    ...mockRol,
    id: '3',
    nombre: 'OPTOMETRA',
    descripcion: 'Optómetra profesional',
  },
  {
    ...mockRol,
    id: '4',
    nombre: 'CLIENTE',
    descripcion: 'Cliente de la óptica',
  },
];
