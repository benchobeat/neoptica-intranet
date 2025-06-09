/**
 * Utilidades para manejar respuestas de la API de manera consistente
 */

/**
 * Interfaz para respuestas de la API
 * @template T Tipo de los datos de la respuesta
 */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Función para crear una respuesta exitosa
 * @param data Datos a incluir en la respuesta
 * @returns Objeto de respuesta exitosa
 */
export function success<T = unknown>(data: T | null = null): ApiResponse<T> {
  return {
    ok: true,
    data,
    error: null,
  };
}

/**
 * Función para crear una respuesta de error
 * @param error Mensaje de error
 * @param data Datos adicionales opcionales
 * @returns Objeto de respuesta de error
 */
export function fail<T = unknown>(error: string, data: T | null = null): ApiResponse<T> {
  return {
    ok: false,
    data,
    error,
  };
}
