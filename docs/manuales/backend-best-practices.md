# Mejores Prácticas para el Desarrollo Backend

> **Versión:** 1.1 (Junio 2025)  
> **Autor:** Equipo de Desarrollo Neóptica  
> **Estado:** Documento vivo - Se actualizará con nuevas prácticas y lecciones aprendidas

Este documento detalla las mejores prácticas establecidas para el desarrollo del backend de la Intranet Neóptica, basadas en nuestra experiencia y lecciones aprendidas durante el desarrollo. Seguir estas prácticas ayudará a mantener un código robusto, testeable y mantenible.

## 1. Arquitectura y estructura de la aplicación

### 1.1. Separación de configuración y arranque del servidor

La separación entre la configuración de la aplicación Express y el arranque del servidor HTTP es fundamental para permitir pruebas adecuadas:

```typescript
// app.ts - Configuración de la aplicación
import express from 'express';
// ...configuración de middlewares, rutas, etc.
const app = express();
// ...
export default app;

// index.ts - Arranque del servidor
import app from './app';

// Solo inicia el servidor si este archivo es ejecutado directamente
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on ${process.env.SWAGGER_BASE_URL}`);
  });
}
```

**Razón:** Esta separación permite importar la aplicación Express en las pruebas sin iniciar automáticamente un servidor HTTP, evitando errores de "open handle" en Jest y facilitando las pruebas con Supertest.

### 1.2. Estructura modular de carpetas

Mantener una estructura clara y modular:

```
/src
  /controllers    # Lógica de negocio y controladores
  /middlewares    # Middlewares de Express
  /routes         # Definiciones de rutas
  /utils          # Utilidades y helpers
  /services       # Servicios y lógica de negocio compleja
  /types          # Definiciones de tipos TypeScript
  app.ts          # Configuración de Express
  index.ts        # Punto de entrada y arranque del servidor
```

## 2. Gestión de conexiones a bases de datos

### 2.1. Cliente Prisma singleton

Usar una instancia única de Prisma Client para toda la aplicación:

```typescript
// src/utils/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;
```

### 2.2. Desconexión explícita en pruebas

Siempre cerrar las conexiones de Prisma al finalizar las pruebas:

```typescript
// En archivos de test
afterAll(async () => {
  await prisma.$disconnect();
});
```

### 2.3. Uso de transacciones

Utilizar transacciones para operaciones que afectan múltiples tablas, especialmente para operaciones críticas como la gestión de usuarios y roles:

```typescript
// Ejemplo: Crear usuario con múltiples roles
const [nuevoUsuario, rolesAsignados] = await prisma.$transaction(async (tx) => {
  // 1. Crear usuario
  const usuario = await tx.usuario.create({
    data: {
      nombre_completo,
      email,
      password: passwordHash,
      telefono,
      activo: true,
      creado_en: new Date(),
      creado_por: usuarioId
    }
  });
  
  // 2. Asignar múltiples roles
  const asignaciones = await Promise.all(
    rolesAsignar.map(nombreRol => 
      tx.usuario_rol.create({
        data: {
          usuario_id: usuario.id,
          rol: { connect: { nombre: nombreRol } },
          creado_en: new Date(),
          creado_por: usuarioId
        }
      })
    )
  );
  
  return [usuario, asignaciones];
});
```

## 3. Pruebas y testing

### 3.1. Configuración adecuada para pruebas de integración

```typescript
// Ejemplo: tests/usuarios.test.ts
import app from '../src/app';
import request from 'supertest';
import prisma from '../src/utils/prisma';
import { generarJWT } from '../src/utils/jwt';

// Configuración para pruebas con usuarios multi-rol
let token;
let usuarioAdmin;

beforeAll(async () => {
  // Crear usuario de prueba con múltiples roles
  usuarioAdmin = await prisma.usuario.findFirst({
    where: { email: 'admin@neoptica.com' },
    include: { usuario_rol: { include: { rol: true } } }
  });
  
  // Generar token con array de roles
  const roles = usuarioAdmin.usuario_rol.map(ur => ur.rol.nombre);
  token = await generarJWT(usuarioAdmin.id, roles);
});

// Limpiar y desconectar después de todas las pruebas
afterAll(async () => {
  // Primero eliminar registros relacionados (respetando integridad referencial)
  await prisma.usuario_rol.deleteMany({
    where: { 
      usuario: { email: { not: 'admin@neoptica.com' } }
    }
  });
  
  // Luego eliminar usuarios excepto admin
  await prisma.usuario.deleteMany({
    where: { email: { not: 'admin@neoptica.com' } }
  });
  
  // Finalmente desconectar Prisma
  await prisma.$disconnect();
});

describe('CRUD Usuarios', () => {
  it('debería crear un usuario correctamente', async () => {
    const response = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        // datos de prueba
      });
    
    expect(response.status).toBe(201);
    expect(response.body.ok).toBe(true);
    // más assertions
  });
  
  // más tests...
});
```

### 3.2. Aislamiento de pruebas

- Usar una base de datos de prueba separada
- Limpiar datos creados al finalizar las pruebas
- Evitar dependencias entre pruebas (cada test debe ser independiente)

## 4. Manejo de errores y validaciones

### 4.1. Formato de respuesta uniforme

Siempre usar el formato estandarizado de respuesta para consistencia:

```typescript
// Éxito
return res.status(200).json({
  ok: true,
  data: resultado,
  error: null
});

// Error
return res.status(400).json({
  ok: false,
  data: null,
  error: 'Mensaje de error descriptivo'
});
```

### 4.2. Validaciones exhaustivas

Validar todos los campos de entrada en los controladores:

- Tipos de datos correctos
- Valores dentro de rangos esperados
- Formatos válidos (email, teléfono, etc.)
- Existencia de entidades relacionadas

### 4.3. Logs y auditoría

Registrar operaciones importantes y errores:

```typescript
try {
  // operación principal
  registrarAuditoria({
    usuario_id: req.usuario.id,
    accion: 'CREAR',
    descripcion: 'Creación exitosa de entidad',
    modulo: 'entidades',
    entidad_id: nuevaEntidad.id
  });
} catch (error) {
  console.error('Error detallado:', error);
  registrarAuditoria({
    usuario_id: req.usuario.id,
    accion: 'ERROR',
    descripcion: `Error al crear entidad: ${error.message}`,
    modulo: 'entidades'
  });
  // manejo de error y respuesta
}
```

## 5. Seguridad

### 5.1. Autenticación y autorización

- Usar JWT para autenticación con tiempos de expiración adecuados
- Incluir array de roles en JWT para sistema multi-rol
- Implementar middleware de roles para autorización granular que valide múltiples roles
- Verificar permisos en cada endpoint protegido considerando que un usuario puede tener múltiples roles
- Validar permisos basados en el rol activo seleccionado por el usuario
- Implementar verificaciones para prevenir modificaciones no autorizadas de roles

### 5.2. Protección de datos sensibles

- Nunca devolver passwords ni datos sensibles en respuestas API
- Hashear passwords con bcrypt antes de almacenar
- Usar variables de entorno para configuraciones sensibles
- Implementar rate limiting para prevenir ataques de fuerza bruta

## 6. Rendimiento y optimización

### 6.1. Consultas eficientes

- Usar selectores específicos en Prisma para obtener solo los campos necesarios
- Implementar paginación para listas grandes
- Usar índices adecuados en la base de datos

### 6.2. Caché

- Considerar caché para datos estáticos o de cambio poco frecuente
- Implementar etags para respuestas API cuando sea apropiado

## 7. Mantenimiento y documentación

### 7.1. Documentación API

- Mantener actualizada la documentación Swagger/OpenAPI
- Incluir ejemplos de request/response para cada endpoint
- Documentar todos los posibles códigos de error
- Documentar claramente cómo se manejan los roles múltiples en cada endpoint
- Incluir ejemplos de tokens JWT con múltiples roles

### 7.2. Comentarios en código

- Documentar funciones complejas con JSDoc
- Explicar decisiones no obvias con comentarios
- Mantener el README actualizado
- Documentar la lógica de autorización multi-rol en middlewares y controladores

### 7.3. Gestión de sistema multi-rol

- Documentar claramente la relación usuario_rol en el esquema de base de datos
- Explicar el proceso de asignación, actualización y revocación de roles
- Mantener diagramas actualizados del flujo de autorización multi-rol
- Documentar los casos de uso principales para escenarios multi-rol

---

Este documento se actualizará periódicamente con nuevas lecciones aprendidas y mejores prácticas identificadas durante el desarrollo continuo de la Intranet Neóptica.
