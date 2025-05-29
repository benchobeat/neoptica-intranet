import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearProducto = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, precio, categoria, imagen_url, modelo_3d_url, activo } = req.body;

    // Validación básica
    if (!nombre || !precio) {
      return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    // Crear el producto en la base de datos
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio), // Aseguramos que el precio sea un número
        categoria,
        imagen_url,
        modelo_3d_url,
        activo: activo ?? true, // Por defecto, el producto está activo
      },
    });

    res.status(201).json({ ok: true, data: nuevoProducto, error: null });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ ok: false, data: null, error: 'Ocurrió un error al crear el producto.' });
  }
};

export const listarProductos = async (req: Request, res: Response) => {
  try {
    const productos = await prisma.producto.findMany();
    res.status(200).json({ ok: true, data: productos, error: null });
  } catch (error) {
    console.error('Error al listar los productos:', error);
    res.status(500).json({ ok: false, data: null, error: 'Ocurrió un error al listar los productos.' });
  }
};