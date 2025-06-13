// Importación de tipos de Prisma (usando alias con _ para evitar advertencia de no usado)
import type { usuario as _PrismaUsuario } from '@prisma/client';

declare global {
  namespace Express {
    /**
     * Interfaz que extiende el tipo User de Express
     * Basado en el modelo de usuario del sistema
     */
    interface User {
      // Campos principales (siempre presentes)
      id: string;
      email: string;
      nombreCompleto: string;
      roles: string[]; // Array de roles del usuario (puede estar vacío)

      // Campos opcionales de autenticación
      telefono?: string | null;
      dni?: string | null;
      password?: string | null;
      google_uid?: string | null;
      facebook_uid?: string | null;
      proveedor_oauth?: string | null;
      oauth_id?: string | null;

      // Datos de perfil
      foto_perfil?: string | null;
      direccion?: string | null;
      latitud?: number | null;
      longitud?: number | null;

      // Estado
      activo?: boolean | null;
      email_verificado?: boolean | null;

      // Integración con ERP
      erp_id?: number | null;
      erp_tipo?: string | null;

      // Campos de auditoría
      creado_en?: Date | string | null;
      creado_por?: string | null;
      modificado_en?: Date | string | null;
      modificado_por?: string | null;
      anulado_en?: Date | string | null;
      anulado_por?: string | null;
    }

    /**
     * Extensión del tipo Request para incluir el usuario autenticado
     */
    interface Request {
      user?: User;
    }
  }
}

// No es necesaria la exportación ya que estamos extendiendo tipos globales
