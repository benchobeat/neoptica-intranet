// src/utils/response.ts

/**
 * Estructura estándar de respuesta para la API Neóptica.
 * @template T - Tipo de dato a devolver en caso de éxito
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Devuelve una respuesta de éxito (HTTP 2xx).
 * @param data - Datos que se devolverán al frontend.
 * @returns Objeto ApiResponse con ok=true y data.
 */
export function success<T = any>(data: T): ApiResponse<T> {
  return {
    ok: true,
    data,
    error: null,
  };
}

/**
 * Devuelve una respuesta de error (HTTP 4xx o 5xx).
 * @param error - Mensaje de error detallado.
 * @param data - (Opcional) datos adicionales relevantes para debugging.
 * @returns Objeto ApiResponse con ok=false y mensaje de error.
 */
export function fail(error: string, data: any = null): ApiResponse {
  return {
    ok: false,
    data,
    error,
  };
}
