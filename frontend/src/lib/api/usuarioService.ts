import { fetchApi } from "./apiClient";

// Tipos para consistencia y autocompletado
export interface Usuario {
  id: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
  foto_perfil?: string;
  activo: boolean;
  roles?: { id: string; nombre: string }[];
}

export interface PaginatedUsuarios {
  data: Usuario[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// Listar usuarios paginados y filtrados (solo clientes)
export async function getClientesPaginados(page = 1, pageSize = 10, searchText = "") {
  return fetchApi<PaginatedUsuarios>(
    `/api/usuarios/paginated?page=${page}&pageSize=${pageSize}&searchText=${encodeURIComponent(searchText)}&rol=cliente`
  );
}

// Crear usuario (cliente)
export async function createCliente(data: Partial<Usuario> & { password: string }) {
  return fetchApi<Usuario>(
    "/api/usuarios",
    "POST",
    data
  );
}

// Actualizar usuario (cliente)
export async function updateCliente(id: string, data: Partial<Usuario>) {
  return fetchApi<Usuario>(
    `/api/usuarios/${id}`,
    "PUT",
    data
  );
}

// Eliminar usuario (borrado lógico)
export async function deleteCliente(id: string) {
  return fetchApi<{ ok: boolean; data: string; error: string | null }>(
    `/api/usuarios/${id}`,
    "DELETE"
  );
}

// Obtener usuario por ID
export async function getClienteById(id: string) {
  return fetchApi<Usuario>(`/api/usuarios/${id}`);
}

// Listar roles de usuario (para selectores en formularios)
export async function getRoles() {
  return fetchApi<{ ok: boolean; data: { id: string; nombre: string }[]; error: string | null }>(
    "/api/roles"
  );
}
