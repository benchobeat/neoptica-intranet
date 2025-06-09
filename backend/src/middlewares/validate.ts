import type { Request, Response, NextFunction } from 'express';
import type { ValidationChain } from 'express-validator';
import { validationResult } from 'express-validator';

import type { ApiResponse } from '../types/response';

// Tipo para errores de validación estandarizados
interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// Función auxiliar para mapear errores de express-validator
function mapExpressValidatorErrors(errors: Array<Record<string, any>>): ValidationError[] {
  return errors.map((err) => ({
    field: err.param || 'general',
    message: err.msg || 'Error de validación',
    value: 'value' in err ? err.value : undefined,
  }));
}

/**
 * Middleware para validar los resultados de las validaciones de express-validator
 */
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ejecutar todas las validaciones
      await Promise.all(validations.map((validation) => validation.run(req)));

      // Obtener los errores de validación
      const errors = validationResult(req);

      // Si no hay errores, continuar
      if (errors.isEmpty()) {
        return next();
      }

      // Si hay errores, mapearlos a un formato estándar
      const errorMessages = mapExpressValidatorErrors(errors.array());

      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Error de validación',
        meta: {
          errors: errorMessages,
        },
      } as ApiResponse<null>);
    } catch (error) {
      console.error('Error en el middleware de validación:', error);
      return res.status(500).json({
        ok: false,
        data: null,
        error: 'Error interno del servidor al validar la solicitud',
      } as ApiResponse<null>);
    }
  };
};

/**
 * Función para manejar errores de validación personalizados
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = mapExpressValidatorErrors(errors.array());

      return res.status(400).json({
        ok: false,
        data: null,
        error: 'Error de validación',
        meta: {
          errors: errorMessages,
        },
      } as ApiResponse<null>);
    }
    next();
  } catch (error) {
    console.error('Error al manejar errores de validación:', error);
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error interno del servidor al procesar la validación',
    } as ApiResponse<null>);
  }
};
