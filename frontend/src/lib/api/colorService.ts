import { fetchApi } from './apiClient';
import { Color, ColorResponse, PaginatedResponse } from '@/types';

const BASE_ENDPOINT = '/api/colores';

/**
 * Obtiene todos los colores
 */
export async function getColores() {
  return fetchApi<ColorResponse>(BASE_ENDPOINT);
}

/**
 * Obtiene colores con paginación y búsqueda opcional
 */
export async function getColoresPaginados(page: number = 1, pageSize: number = 10, searchTerm: string = '') {
  const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
  return fetchApi<PaginatedResponse<Color>>(`${BASE_ENDPOINT}/paginated?page=${page}&pageSize=${pageSize}${searchParam}`);
}

/**
 * Obtiene un color por su ID
 */
export async function getColorById(id: string) {
  return fetchApi<ColorResponse>(`${BASE_ENDPOINT}/${id}`);
}

/**
 * Crea un nuevo color
 */
export async function createColor(data: { nombre: string; codigo_hex: string }) {
  return fetchApi<ColorResponse>(BASE_ENDPOINT, 'POST', data);
}

/**
 * Actualiza un color existente
 */
export async function updateColor(id: string, data: { nombre?: string; codigo_hex?: string }) {
  return fetchApi<ColorResponse>(`${BASE_ENDPOINT}/${id}`, 'PUT', data);
}

/**
 * Elimina un color (soft delete)
 */
export async function deleteColor(id: string) {
  return fetchApi<ColorResponse>(`${BASE_ENDPOINT}/${id}`, 'DELETE');
}
