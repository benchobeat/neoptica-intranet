import { fetchApi } from './apiClient';
import { Sucursal, SucursalResponse, PaginatedResponse } from '@/types';

const BASE_ENDPOINT = '/api/sucursales';

/**
 * Obtiene todas las sucursales
 */
export async function getSucursales() {
  return fetchApi<SucursalResponse>(BASE_ENDPOINT);
}

/**
 * Obtiene sucursales con paginación y búsqueda opcional
 */
export async function getSucursalesPaginadas(page: number = 1, pageSize: number = 10, searchTerm: string = '') {
  const searchParam = searchTerm ? `&searchText=${encodeURIComponent(searchTerm)}` : '';
  return fetchApi<PaginatedResponse<Sucursal>>(`${BASE_ENDPOINT}/paginated?page=${page}&pageSize=${pageSize}${searchParam}`);
}

/**
 * Obtiene una sucursal por su ID
 */
export async function getSucursalById(id: string) {
  return fetchApi<SucursalResponse>(`${BASE_ENDPOINT}/${id}`);
}

/**
 * Crea una nueva sucursal
 */
export async function createSucursal(data: { 
  nombre: string; 
  direccion: string;
  telefono: string;
  email: string;
  latitud: number;
  longitud: number;
}) {
  return fetchApi<SucursalResponse>(BASE_ENDPOINT, 'POST', data);
}

/**
 * Actualiza una sucursal existente
 */
export async function updateSucursal(id: string, data: { 
  nombre?: string; 
  direccion?: string;
  telefono?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
}) {
  return fetchApi<SucursalResponse>(`${BASE_ENDPOINT}/${id}`, 'PUT', data);
}

/**
 * Elimina una sucursal (soft delete)
 */
export async function deleteSucursal(id: string) {
  return fetchApi<SucursalResponse>(`${BASE_ENDPOINT}/${id}`, 'DELETE');
}
