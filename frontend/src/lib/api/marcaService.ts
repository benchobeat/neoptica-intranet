import { fetchApi } from './apiClient';
import { Marca, MarcaResponse, PaginatedResponse } from '@/types';

const BASE_ENDPOINT = '/api/marcas';

/**
 * Obtiene todas las marcas
 */
export async function getMarcas() {
  return fetchApi<MarcaResponse>(BASE_ENDPOINT);
}

/**
 * Obtiene marcas con paginación y búsqueda opcional
 */
export async function getMarcasPaginadas(page: number = 1, pageSize: number = 10, searchTerm: string = '') {
  const searchParam = searchTerm ? `&searchText=${encodeURIComponent(searchTerm)}` : '';
  return fetchApi<PaginatedResponse<Marca>>(`${BASE_ENDPOINT}/paginated?page=${page}&pageSize=${pageSize}${searchParam}`);
}

/**
 * Obtiene una marca por su ID
 */
export async function getMarcaById(id: string) {
  return fetchApi<MarcaResponse>(`${BASE_ENDPOINT}/${id}`);
}

/**
 * Crea una nueva marca
 */
export async function createMarca(data: { 
  nombre: string; 
  descripcion?: string;
  website?: string;
  logo_url?: string;
}) {
  return fetchApi<MarcaResponse>(BASE_ENDPOINT, 'POST', data);
}

/**
 * Actualiza una marca existente
 */
export async function updateMarca(id: string, data: { 
  nombre?: string; 
  descripcion?: string;
  website?: string;
  logo_url?: string;
}) {
  return fetchApi<MarcaResponse>(`${BASE_ENDPOINT}/${id}`, 'PUT', data);
}

/**
 * Elimina una marca (soft delete)
 */
export async function deleteMarca(id: string) {
  return fetchApi<MarcaResponse>(`${BASE_ENDPOINT}/${id}`, 'DELETE');
}
