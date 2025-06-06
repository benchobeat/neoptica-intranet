// Tipos comunes para toda la aplicación

// Tipos para el módulo de autenticación
export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'vendedor' | 'optometrista' | 'cliente';
  activo: boolean;
  creado_en: string;
  creado_por: string | null;
  modificado_en: string | null;
  modificado_por: string | null;
}

export interface AuthResponse {
  ok: boolean;
  data: {
    token: string;
    usuario: User;
  };
  error: string | null;
}

// Tipos para el módulo de sucursales
export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  latitud: number;
  longitud: number;
  activo: boolean;
  creado_en: string;
  creado_por: string | null;
  modificado_en: string | null;
  modificado_por: string | null;
}

export interface SucursalResponse {
  ok: boolean;
  data: Sucursal | Sucursal[];
  error: string | null;
}

// Tipos para el módulo de colores
export interface Color {
  id: string;
  nombre: string;
  codigo_hex: string;
  descripcion?: string | null;
  activo: boolean;
  creado_en: string;
  creado_por: string | null;
  modificado_en: string | null;
  modificado_por: string | null;
}

export interface ColorResponse {
  ok: boolean;
  data: Color | Color[];
  error: string | null;
}

// Tipos para el módulo de marcas
export interface Marca {
  id: string;
  nombre: string;
  descripcion: string | null;
  website: string | null;
  logo_url: string | null;
  activo: boolean;
  creado_en: string;
  creado_por: string | null;
  modificado_en: string | null;
  modificado_por: string | null;
}

export interface MarcaResponse {
  ok: boolean;
  data: Marca | Marca[];
  error: string | null;
}

// Tipos para la auditoría
export interface LogAuditoria {
  id: string;
  usuario_id: string;
  accion: string;
  descripcion: string;
  ip: string;
  entidad: string;
  entidad_id: string;
  modulo: string;
  creado_en: string;
}

export interface AuditoriaResponse {
  ok: boolean;
  data: LogAuditoria | LogAuditoria[];
  error: string | null;
}

// Tipos para paginación
export interface PaginatedResponse<T> {
  ok: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error: string | null;
}
