/**
 * Valida si un valor es un número válido dentro de un rango
 * @param value Valor a validar
 * @param min Valor mínimo permitido (opcional)
 * @param max Valor máximo permitido (opcional)
 * @param decimales Número de decimales permitidos (opcional, 0 para enteros)
 * @returns string | null - Mensaje de error o null si es válido
 */
export function validarNumero(
  value: unknown,
  campo: string,
  min?: number,
  max?: number,
  decimales?: number
): string | null {
  // Si el valor es null o undefined, es válido (son opcionales)
  if (value === null || value === undefined) return null;

  // Si no es un número, intentamos convertirlo
  const numValue = typeof value === 'number' ? value : Number(value);

  // Verificar si es un número válido después de la conversión
  if (isNaN(numValue)) {
    return `El campo ${campo} debe ser un número válido`;
  }

  // A partir de aquí trabajamos con el valor numérico convertido directamente

  // Verificar si es un entero cuando se especifica decimales: 0
  if (decimales === 0 && !Number.isInteger(numValue)) {
    return `El campo ${campo} debe ser un número entero`;
  }

  // Verificar decimales máximos
  if (decimales !== undefined && decimales > 0) {
    const partes = numValue.toString().split('.');
    if (partes.length === 2 && partes[1].length > decimales) {
      return `El campo ${campo} no puede tener más de ${decimales} decimales`;
    }
  }

  // Verificar valor mínimo
  if (min !== undefined && numValue < min) {
    return `El campo ${campo} debe ser mayor o igual a ${min}`;
  }

  // Verificar valor máximo
  if (max !== undefined && numValue > max) {
    return `El campo ${campo} debe ser menor o igual a ${max}`;
  }

  return null; // Válido
}

/**
 * Valida los campos numéricos de un producto
 * @param data Objeto con los datos del producto
 * @returns string | null - Mensaje de error o null si todos los campos son válidos
 */
export function validarCamposNumericosProducto(data: Record<string, unknown>): string | null {
  // Función auxiliar para convertir a número
  const toNumber = (valor: unknown): number => {
    return typeof valor === 'number' ? valor : Number(valor);
  };

  // Validar precio (debe ser positivo, con 2 decimales)
  if (data.precio !== undefined) {
    const errorPrecio = validarNumero(toNumber(data.precio), 'precio', 0, undefined, 2);
    if (errorPrecio) return errorPrecio;
  }

  // Validar graduación esfera (rango típico: -20.00 a +20.00, con 2 decimales)
  if (data.graduacionEsfera !== undefined) {
    const errorEsfera = validarNumero(
      toNumber(data.graduacionEsfera),
      'graduación esfera',
      -20,
      20,
      2
    );
    if (errorEsfera) return errorEsfera;
  }

  // Validar graduación cilindro (rango típico: -10.00 a +10.00, con 2 decimales)
  if (data.graduacionCilindro !== undefined) {
    const errorCilindro = validarNumero(
      toNumber(data.graduacionCilindro),
      'graduación cilindro',
      -10,
      10,
      2
    );
    if (errorCilindro) return errorCilindro;
  }

  // Validar eje (0-180, entero)
  if (data.eje !== undefined) {
    const errorEje = validarNumero(toNumber(data.eje), 'eje', 0, 180, 0);
    if (errorEje) return errorEje;
  }

  // Validar adición (0.75 a 4.00, con incrementos de 0.25)
  if (data.adicion !== undefined) {
    const adicion = toNumber(data.adicion);
    const errorAdicion = validarNumero(adicion, 'adición', 0.75, 4.0, 2);
    if (errorAdicion) return errorAdicion;

    // Verificar que sea múltiplo de 0.25
    if ((adicion * 100) % 25 !== 0) {
      return 'El campo adición debe ser un múltiplo de 0.25 (ej: 1.00, 1.25, 1.50, etc.)';
    }
  }

  // Validar tamaños (deben ser positivos, con 1 decimal)
  if (data.tamanoPuente !== undefined) {
    const errorPuente = validarNumero(toNumber(data.tamanoPuente), 'tamaño puente', 0, 100, 1);
    if (errorPuente) return errorPuente;
  }

  if (data.tamanoAros !== undefined) {
    const errorAros = validarNumero(toNumber(data.tamanoAros), 'tamaño aros', 0, 100, 1);
    if (errorAros) return errorAros;
  }

  if (data.tamanoVarillas !== undefined) {
    const errorVarillas = validarNumero(
      toNumber(data.tamanoVarillas),
      'tamaño varillas',
      0,
      200,
      1
    );
    if (errorVarillas) return errorVarillas;
  }

  return null; // Todos los campos numéricos son válidos
}
