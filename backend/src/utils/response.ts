// backend/src/utils/response.ts

export interface ApiResponse<T = any> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

export function success<T = any>(data: T): ApiResponse<T> {
  return {
    ok: true,
    data,
    error: null,
  };
}

export function fail(error: string, data: any = null): ApiResponse {
  return {
    ok: false,
    data,
    error,
  };
}
