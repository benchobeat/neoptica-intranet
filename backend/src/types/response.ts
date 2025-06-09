/**
 * Interfaz estándar para las respuestas de la API
 */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data: T | null;
  error: string | null;
  meta?: {
    [key: string]: unknown;
    errors?: Array<{
      field?: string;
      message: string;
      [key: string]: unknown;
    }>;
  };
}

/**
 * Interfaz para respuestas paginadas
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    [key: string]: unknown;
  };
}
