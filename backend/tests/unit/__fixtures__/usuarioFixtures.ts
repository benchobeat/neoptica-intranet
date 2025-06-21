import { jest } from '@jest/globals';
import type { Usuario, UsuarioRol, Rol } from '@prisma/client';
import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

type UsuarioWithRoles = Usuario & {
  usuarioRol: (UsuarioRol & { rol: Rol })[];
};

export const mockUsuarioAdmin: UsuarioWithRoles = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  nombreCompleto: 'Admin User',
  email: 'admin@example.com',
  password: '$2b$10$examplehashedpassword', // bcrypt hash for 'password123'
  telefono: '1234567890',
  dni: '12345678',
  direccion: '123 Admin St',
  activo: true,
  emailVerificado: true,
  fotoPerfil: null,
  latitud: null,
  longitud: null,
  googleUid: null,
  facebookUid: null,
  erpId: null,
  erpTipo: null,
  proveedorOauth: null,
  oauthId: null,
  creadoEn: new Date(),
  creadoPor: null,
  modificadoEn: null,
  modificadoPor: null,
  anuladoEn: null,
  anuladoPor: null,
  usuarioRol: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      usuarioId: '550e8400-e29b-41d4-a716-446655440000',
      rolId: '550e8400-e29b-41d4-a716-446655440010',
      creadoEn: new Date(),
      creadoPor: 'system',
      modificadoEn: new Date(),
      modificadoPor: 'system',
      anuladoEn: null,
      anuladoPor: null,
      rol: {
        id: '550e8400-e29b-41d4-a716-446655440010',
        nombre: 'admin',
        descripcion: 'Administrador del sistema',
        creadoEn: new Date(),
        creadoPor: 'system',
        modificadoEn: new Date(),
        modificadoPor: 'system',
        anuladoEn: null,
        anuladoPor: null,
      },
    },
  ],
};

export const mockUsuarioVendedor: UsuarioWithRoles = {
  ...mockUsuarioAdmin,
  id: '550e8400-e29b-41d4-a716-446655440002',
  nombreCompleto: 'Vendedor User',
  email: 'vendedor@example.com',
  usuarioRol: [
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      usuarioId: '550e8400-e29b-41d4-a716-446655440002',
      rolId: '550e8400-e29b-41d4-a716-446655440011',
      creadoEn: new Date(),
      creadoPor: 'system',
      modificadoEn: new Date(),
      modificadoPor: 'system',
      anuladoEn: null,
      anuladoPor: null,
      rol: {
        id: '550e8400-e29b-41d4-a716-446655440011',
        nombre: 'vendedor',
        descripcion: 'Rol de vendedor',
        creadoEn: new Date(),
        creadoPor: 'system',
        modificadoEn: new Date(),
        modificadoPor: 'system',
        anuladoEn: null,
        anuladoPor: null,
      },
    },
  ],
};

export const mockUsuarioMultiRol: UsuarioWithRoles = {
  ...mockUsuarioAdmin,
  id: '550e8400-e29b-41d4-a716-446655440004',
  nombreCompleto: 'Multi Role User',
  email: 'multirol@example.com',
  usuarioRol: [
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      usuarioId: '550e8400-e29b-41d4-a716-446655440004',
      rolId: '550e8400-e29b-41d4-a716-446655440011', // vendedor
      creadoEn: new Date(),
      creadoPor: 'system',
      modificadoEn: new Date(),
      modificadoPor: 'system',
      anuladoEn: null,
      anuladoPor: null,
      rol: {
        id: '550e8400-e29b-41d4-a716-446655440011',
        nombre: 'vendedor',
        descripcion: 'Rol de vendedor',
        creadoEn: new Date(),
        creadoPor: 'system',
        modificadoEn: new Date(),
        modificadoPor: 'system',
        anuladoEn: null,
        anuladoPor: null,
      },
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      usuarioId: '550e8400-e29b-41d4-a716-446655440004',
      rolId: '550e8400-e29b-41d4-a716-446655440012', // optometrista
      creadoEn: new Date(),
      creadoPor: 'system',
      modificadoEn: new Date(),
      modificadoPor: 'system',
      anuladoEn: null,
      anuladoPor: null,
      rol: {
        id: '550e8400-e29b-41d4-a716-446655440012',
        nombre: 'optometrista',
        descripcion: 'Rol de optometrista',
        creadoEn: new Date(),
        creadoPor: 'system',
        modificadoEn: new Date(),
        modificadoPor: 'system',
        anuladoEn: null,
        anuladoPor: null,
      },
    },
  ],
};

// Mock request objects
// Definición del tipo de usuario para los tests
type TestUser = {
  id: string;
  email: string;
  nombreCompleto: string;
  roles?: string[];
  [key: string]: unknown;
} | null;

export const mockRequest = (
  body: Record<string, unknown> = {},
  params: ParamsDictionary = {},
  user: TestUser = null
): Partial<Request> => ({
  body,
  params,
  user,
  ip: '127.0.0.1',
  headers: {},
});

// Interface para una respuesta mock con tipos correctos
interface MockResponse {
  status: jest.Mock;
  json: jest.Mock;
  [key: string]: unknown;
}

export const mockResponse = (): MockResponse => {
  const res = {} as MockResponse;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
