import type { Prisma } from '@prisma/client';

import { toRelation } from './prisma';

/**
 * Valida si un email tiene un formato válido
 * @param email Email a validar
 * @returns boolean - true si el email es válido
 */
export function emailValido(email: string): boolean {
  // Regex simple para validar formato de email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida si una contraseña cumple con los requisitos de seguridad
 * Mínimo 8 caracteres, una mayúscula, una minúscula y un número
 * @param password Contraseña a validar
 * @returns boolean - true si la contraseña cumple con los requisitos
 */
export function passwordFuerte(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

/**
 * Valida si un número de teléfono tiene un formato válido
 * @param telefono Número de teléfono a validar (10 dígitos)
 * @returns boolean - true si el teléfono es válido
 */
export function telefonoValido(telefono: string): boolean {
  // Solo dígitos, exactamente 10 caracteres
  return /^\d{10}$/.test(telefono);
}

/**
 * Valida si una URL tiene un formato válido
 * @param url URL a validar
 * @returns boolean - true si la URL es válida
 */
export function urlValida(url: string): boolean {
  if (!url) return false;

  try {
    // Intenta crear un objeto URL para validar el formato
    const urlObj = new URL(url);
    // Verifica que el protocolo sea http o https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    console.error('Error al validar la URL:', e);
    return false;
  }
}

/**
 * Valida si una URL de ícono es válida
 * @param iconoUrl URL del ícono a validar
 * @returns string | null - Mensaje de error o null si es válida
 */
export function validarIconoUrl(iconoUrl: string | null | undefined): string | null {
  if (!iconoUrl) return null; // Es opcional, así que null es válido

  if (typeof iconoUrl !== 'string') {
    return 'La URL del ícono debe ser una cadena de texto';
  }

  if (iconoUrl.length > 255) {
    return 'La URL del ícono no puede exceder los 255 caracteres';
  }

  if (!urlValida(iconoUrl)) {
    return 'La URL del ícono no tiene un formato válido. Debe comenzar con http:// o https://';
  }

  // Validar extensiones de archivo comunes para íconos
  const extensionesPermitidas = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'];
  const urlLower = iconoUrl.toLowerCase();
  const tieneExtensionValida = extensionesPermitidas.some((ext) => urlLower.endsWith(ext));

  if (!tieneExtensionValida) {
    return `La URL del ícono debe terminar con una de las siguientes extensiones: ${extensionesPermitidas.join(', ')}`;
  }

  return null; // Válido
}

/**
 * Valida si una URL de imagen de producto es válida
 * @param url URL de la imagen a validar
 * @returns string | null - Mensaje de error o null si es válida
 */
export function validarImagenUrl(url: string | null | undefined): string | null {
  if (!url) return null; // Es opcional, así que null es válido

  if (typeof url !== 'string') {
    return 'La URL de la imagen debe ser una cadena de texto';
  }

  if (url.length > 500) {
    // Las URLs de productos pueden ser más largas
    return 'La URL de la imagen no puede exceder los 500 caracteres';
  }

  if (!urlValida(url)) {
    return 'La URL de la imagen no tiene un formato válido. Debe comenzar con http:// o https://';
  }

  // Validar extensiones de archivo comunes para imágenes
  const extensionesPermitidas = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
  const urlLower = url.toLowerCase();
  const tieneExtensionValida = extensionesPermitidas.some((ext) => urlLower.endsWith(ext));

  if (!tieneExtensionValida) {
    return `La URL de la imagen debe terminar con una de las siguientes extensiones: ${extensionesPermitidas.join(', ')}`;
  }

  return null; // Válido
}

/**
 * Valida si una URL de modelo 3D es válida
 * @param url URL del modelo 3D a validar
 * @returns string | null - Mensaje de error o null si es válida
 */
export function validarModelo3dUrl(url: string | null | undefined): string | null {
  if (!url) return null; // Es opcional, así que null es válido

  if (typeof url !== 'string') {
    return 'La URL del modelo 3D debe ser una cadena de texto';
  }

  if (url.length > 500) {
    // Las URLs de modelos 3D pueden ser más largas
    return 'La URL del modelo 3D no puede exceder los 500 caracteres';
  }

  if (!urlValida(url)) {
    return 'La URL del modelo 3D no tiene un formato válido. Debe comenzar con http:// o https://';
  }

  // Validar extensiones de archivo comunes para modelos 3D
  const extensionesPermitidas = [
    '.glb',
    '.gltf',
    '.obj',
    '.fbx',
    '.stl',
    '.3ds',
    '.blend',
    '.dae',
    '.wrl',
  ];
  const urlLower = url.toLowerCase();
  const tieneExtensionValida = extensionesPermitidas.some((ext) => urlLower.endsWith(ext));

  if (!tieneExtensionValida) {
    return `La URL del modelo 3D debe terminar con una de las siguientes extensiones: ${extensionesPermitidas.join(', ')}`;
  }

  return null; // Válido
}

/**
 * Función auxiliar para normalizar parámetros de consulta.
 *
 * @param {unknown} param - El parámetro a normalizar
 * @param {T} fallback - Valor por defecto si el parámetro no existe
 * @returns {T} - El valor normalizado
 */
export function normalizeParam<T = string>(param: unknown, fallback: T): T {
  if (Array.isArray(param)) {
    return (param[0] as T) ?? fallback;
  }
  return (param as T) ?? fallback;
}

/**
 * Función auxiliar para normalizar parámetros booleanos de consulta.
 *
 * @param {unknown} param - El parámetro a normalizar
 * @returns {boolean|undefined} - El valor booleano normalizado o undefined
 */
export function normalizeBooleanParam(param: unknown): boolean | undefined {
  const value = Array.isArray(param) ? param[0] : param;

  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

// Interfaz para los datos de entrada al crear o actualizar un producto
interface ProductoInput {
  nombre: string;
  descripcion?: string;
  precio: number;
  categoriaId?: string;
  marcaId?: string;
  colorId?: string;
  materialLente?: string | null;
  tratamientoLente?: string | null;
  graduacionEsfera?: number | null;
  graduacionCilindro?: number | null;
  eje?: number | null;
  adicion?: number | null;
  tipoArmazon?: string | null;
  materialArmazon?: string | null;
  tamanoPuente?: number | null;
  tamanoAros?: number | null;
  tamanoVarillas?: number | null;
  activo?: boolean | null;
  erpId?: number | null;
  erpTipo?: string | null;
  imagenUrl?: string | null;
  modelo3dUrl?: string | null;
}

// Tipo para el producto con datos de entrada
type ProductoCreateInput = Omit<ProductoInput, 'activo'> & {
  activo?: boolean;
};

/**
 * Valida y normaliza los datos de entrada para la creación/actualización de un producto.
 *
 * @param {unknown} data - Datos del producto a validar
 * @returns {ProductoCreateInput | { error: string }} - Datos validados o mensaje de error
 */
export function validateProductoInput(
  data: unknown
): Prisma.ProductoCreateInput | { error: string } {
  if (typeof data !== 'object' || data === null) {
    return { error: 'Los datos del producto son inválidos' };
  }

  const input = data as Record<string, unknown>;
  const result: Partial<Prisma.ProductoCreateInput> = {};

  // Validar nombre (campo requerido)
  if (!input.nombre || typeof input.nombre !== 'string' || input.nombre.trim().length < 2) {
    return { error: 'El nombre es obligatorio y debe tener al menos 2 caracteres' };
  }
  result.nombre = input.nombre.trim();

  // Validar precio (campo requerido)
  if (input.precio === undefined || input.precio === null || input.precio === '') {
    return { error: 'El precio es obligatorio' };
  }

  const precioNum =
    typeof input.precio === 'string' ? parseFloat(input.precio) : Number(input.precio);

  if (isNaN(precioNum) || precioNum <= 0) {
    return { error: 'El precio debe ser un número mayor a 0' };
  }
  result.precio = precioNum;

  // Campos opcionales con validación
  if (input.descripcion !== undefined) {
    result.descripcion = input.descripcion ? String(input.descripcion).trim() : null;
  }

  // Actualizado para usar categoriaId en lugar de categoria
  if (input.categoriaId !== undefined && typeof input.categoriaId === 'string') {
    result.categoria = toRelation(input.categoriaId);
  }

  // Validar URLs
  const validateUrl = (url: unknown): string | null => {
    if (!url) return null;
    const urlStr = String(url);
    return /^https?:\/\//.test(urlStr) ? urlStr : null;
  };

  result.imagenUrl = validateUrl(input.imagenUrl);
  result.modelo3dUrl = validateUrl(input.modelo3dUrl);

  // Validar campos numéricos opcionales
  const numericFields = [
    'graduacionEsfera',
    'graduacionCilindro',
    'eje',
    'adicion',
    'tamanoPuente',
    'tamanoAros',
    'tamanoVarillas',
  ] as const;

  for (const field of numericFields) {
    if (input[field] !== undefined && input[field] !== null && input[field] !== '') {
      const num = Number(input[field]);
      result[field] = isNaN(num) ? null : num;
    }
  }

  // Validar campos de texto opcionales
  const textFields = [
    'tipoProducto',
    'tipoLente',
    'materialLente',
    'tratamientoLente',
    'tipoArmazon',
    'materialArmazon',
    'erpTipo',
  ] as const;

  for (const field of textFields) {
    if (input[field] !== undefined) {
      result[field] = input[field] ? String(input[field]).trim() : null;
    }
  }

  // Validar campos de ID
  const idFields = ['marcaId', 'colorId'] as const;
  for (const field of idFields) {
    if (input[field] !== undefined) {
      result[field] = input[field] ? String(input[field]) : null;
    }
  }

  // Validar campos booleanos
  if (input.activo !== undefined) {
    result.activo = Boolean(input.activo);
  }

  return result as ProductoCreateInput;
}
