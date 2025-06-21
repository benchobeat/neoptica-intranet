import fs from 'fs';
import path from 'path';

import type { Request } from 'express';
import multer from 'multer';

// Asegurar que existe el directorio de destino
const uploadDir = path.join(process.cwd(), 'uploads/adjuntos_inventario');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Generar un nombre único con timestamp para evitar colisiones
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// Filtro para archivos permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Solo permitir archivos PDF e imágenes
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Tipo de archivo no permitido. Solo se aceptan PDF e imágenes (jpeg, png, gif, webp).'
      )
    );
  }
};

// Exportar configuración de multer
export const uploadInventarioAdjunto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // Límite de 2MB
  },
});

// Interfaz para los errores de Multer
interface MulterError extends Error {
  code?: string;
  field?: string;
}

// Función para formatear errores de multer
export const handleMulterError = (err: MulterError) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return 'El archivo excede el tamaño máximo permitido de 2MB.';
  }
  return err.message;
};
