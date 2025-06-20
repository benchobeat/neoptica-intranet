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
