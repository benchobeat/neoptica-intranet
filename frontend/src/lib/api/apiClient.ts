// Cliente API para comunicarse con el backend

// Obtener la URL de la API desde las variables de entorno
// Asumimos que el backend está en el puerto 3001, que es el puerto por defecto para el backend de Node.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Tipos de métodos HTTP soportados
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Opciones para las solicitudes
interface FetchOptions {
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}

/**
 * Función para realizar solicitudes a la API
 * @param endpoint - Ruta de la API (sin la URL base)
 * @param method - Método HTTP (GET, POST, PUT, DELETE)
 * @param data - Datos a enviar en la solicitud (para POST, PUT)
 * @returns Promesa con la respuesta de la API
 */
export async function fetchApi<T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  data?: any
): Promise<T> {
  // Construir la URL completa
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Configurar las opciones de la solicitud
  const options: FetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Obtener el token de autenticación del localStorage (si existe)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Agregar el cuerpo de la solicitud para métodos que lo requieren
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    // Realizar la solicitud
    const response = await fetch(url, options);
    
    // Intentar parsear la respuesta como JSON
    let jsonResponse = {};
    try {
      jsonResponse = await response.json();
    } catch (error) {
      // Si no es un JSON válido, devolver un objeto con la respuesta de texto
      return {
        ok: response.ok,
        data: null,
        error: await response.text(),
      } as unknown as T;
    }
    
    // Si la respuesta no es exitosa, manejar el error
    if (!response.ok) {
      console.error(`Error en solicitud a ${endpoint}:`, jsonResponse);
      
      // Verificar si es un error 401 (no autorizado) para manejar la sesión
      if (response.status === 401 && typeof window !== 'undefined') {
        // Sesión expirada o token inválido
        localStorage.removeItem('token');
        localStorage.removeItem('activeRole');
        localStorage.removeItem('roles');
        
        // Redirigir al login si no estamos ya en la página de login
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return jsonResponse as T;
  } catch (error) {
    // Capturar errores de red u otros errores inesperados
    console.error(`Error en solicitud a ${endpoint}:`, error);
    return {
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : 'Error de conexión',
    } as unknown as T;
  }
}
