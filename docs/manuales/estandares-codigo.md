# Estándares de Código Neóptica Intranet

## Tabla de Contenidos
- [1. Convenciones de Nombrado](#1-convenciones-de-nombrado)
  - [1.1 Variables y Funciones](#11-variables-y-funciones)
  - [1.2 Clases e Interfaces](#12-clases-e-interfaces)
  - [1.3 Constantes y Enums](#13-constantes-y-enums)
  - [1.4 Archivos y Carpetas](#14-archivos-y-carpetas)
- [2. Estructura del Proyecto](#2-estructura-del-proyecto)
  - [2.1 Estructura de Directorios](#21-estructura-de-directorios)
  - [2.2 Organización de Código](#22-organización-de-código)
- [3. Estilo de Código](#3-estilo-de-código)
  - [3.1 Formato](#31-formato)
  - [3.2 Comentarios](#32-comentarios)
  - [3.3 TypeScript](#33-typescript)
- [4. Manejo de Errores](#4-manejo-de-errores)
  - [4.1 Códigos de Estado HTTP](#41-códigos-de-estado-http)
  - [4.2 Formato de Respuesta](#42-formato-de-respuesta)
  - [4.3 Tipos de Errores](#43-tipos-de-errores)
- [5. Pruebas](#5-pruebas)
  - [5.1 Convenciones](#51-convenciones)
  - [5.2 Estructura](#52-estructura)
  - [5.3 Cobertura](#53-cobertura)
- [6. Seguridad](#6-seguridad)
  - [6.1 Validación de Entrada](#61-validación-de-entrada)
  - [6.2 Autenticación y Autorización](#62-autenticación-y-autorización)
  - [6.3 Protección de Datos](#63-protección-de-datos)
- [7. Documentación](#7-documentación)
  - [7.1 Documentación de Código](#71-documentación-de-código)
  - [7.2 Documentación de API](#72-documentación-de-api)
  - [7.3 Guías](#73-guias)

## 1. Convenciones de Nombrado

### 1.1 Variables y Funciones
- Usar `camelCase` para nombres de variables y funciones
- Usar verbos para funciones: `getUser`, `createOrder`, `validateInput`
- Usar sustantivos para variables: `userData`, `orderList`
- Usar prefijos como `is`, `has`, `should` para booleanos: `isActive`, `hasPermission`
- Evitar abreviaturas no estándar

### 1.2 Clases e Interfaces
- Usar `PascalCase` para clases e interfaces
- Usar sufijos descriptivos:
  - `Service` para servicios: `UserService`
  - `Controller` para controladores: `UserController`
  - `Interface` para interfaces: `UserInterface`
  - `Type` para tipos: `UserResponseType`
  - `Enum` para enumeraciones: `UserRoleEnum`

### 1.3 Constantes y Enums
- Usar `UPPER_SNAKE_CASE` para constantes
- Agrupar constantes relacionadas en objetos o namespaces
- Usar `enum` para conjuntos de valores relacionados

### 1.4 Archivos y Carpetas
- Usar `kebab-case` para nombres de archivos y carpetas: `user-controller.ts`
- Agrupar archivos por funcionalidad, no por tipo
- Usar `index.ts` para exportaciones públicas de módulos

## 2. Estructura del Proyecto

### 2.1 Estructura de Directorios
```
src/
├── config/           # Configuraciones de la aplicación
├── controllers/      # Controladores de la API
├── middlewares/      # Middlewares de Express
├── models/           # Modelos de base de datos
├── routes/           # Definiciones de rutas
├── services/         # Lógica de negocio
├── types/            # Tipos TypeScript
├── utils/            # Utilidades y helpers
└── validators/       # Validaciones de entrada
```

### 2.2 Organización de Código
- Mantener los archivos pequeños y enfocados (máx. 300-400 líneas)
- Separar la lógica de negocio de la lógica de la API
- Usar inyección de dependencias para mejorar la testabilidad

## 3. Estilo de Código

### 3.1 Formato
- Usar comillas simples (`'`) para strings
- Usar punto y coma al final de cada declaración
- Usar 2 espacios para la indentación
- Máximo 100 caracteres por línea
- Usar llaves `{}` para bloques de una sola línea

### 3.2 Comentarios
- Usar comentarios para explicar el "por qué", no el "qué"
- Documentar funciones complejas con JSDoc
- Marcar código temporal con `// TODO:` o `// FIXME:`

### 3.3 TypeScript
- Usar tipos explícitos en lugar de `any`
  - Preferir `unknown` sobre `any` cuando el tipo es verdaderamente desconocido
  - Usar type assertions solo cuando sea absolutamente necesario y con validación previa
- Usar interfaces para definir la forma de los objetos que representan contratos públicos
- Usar `type` para uniones, intersecciones o tipos mapeados
- Usar tipos unión para manejar diferentes formas de datos
- Usar tipos genéricos cuando sea apropiado para código reutilizable
- Evitar el uso de `@ts-ignore` o `@ts-expect-error` sin una justificación clara
- Usar tipos de utilidad de TypeScript (Pick, Omit, Partial, etc.) cuando corresponda

## 4. Manejo de Errores

### 4.1 Códigos de Estado HTTP
- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Operación exitosa sin contenido de retorno
- `400 Bad Request`: Solicitud mal formada o inválida
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Autenticado pero sin permisos
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto con el estado actual
- `422 Unprocessable Entity`: Validación fallida
- `429 Too Many Requests`: Límite de tasa excedido
- `500 Internal Server Error`: Error del servidor

### 4.2 Formato de Respuesta

#### Éxito:
```typescript
{
  ok: true,
  data: T,  // Datos de la respuesta
  error: null
}
```

#### Error:
```typescript
{
  ok: false,
  data: null,
  error: string,  // Mensaje de error
  details?: any   // Detalles adicionales opcionales
}
```

### 4.3 Tipos de Errores
- Usar clases de error personalizadas que extiendan de `Error`
- Incluir códigos de error estandarizados y tipos de error
- Proporcionar mensajes claros para el usuario final
- Incluir metadatos útiles para depuración
- Registrar detalles técnicos en los logs con el nivel de severidad apropiado
- Usar try/catch de manera estratégica, no para controlar el flujo del programa
- Manejar adecuadamente las promesas rechazadas con `.catch()` o `try/catch` con `async/await`
- Usar tipos discriminados para manejar diferentes tipos de errores

## 5. Pruebas

### 5.1 Convenciones
- Usar `describe` para agrupar pruebas relacionadas
- Usar `it` para casos de prueba individuales
- Usar nombres descriptivos que expliquen el comportamiento esperado

### 5.2 Estructura
- Organizar pruebas siguiendo la estructura del código fuente
- Usar archivos `.spec.ts` o `.test.ts` junto al código fuente
- Separar pruebas unitarias, de integración y E2E

### 5.3 Cobertura
- Mantener al menos un 80% de cobertura de código
- Cubrir casos de éxito y error
- Incluir pruebas de borde

## 6. Seguridad

### 6.1 Validación de Entrada
- Validar y sanear toda la entrada del usuario
- Usar bibliotecas de validación como Joi o class-validator
- Implementar límites de tamaño y tipo para todos los campos

### 6.2 Autenticación y Autorización
- Usar JWT para autenticación sin estado
- Implementar refresh tokens
- Validar permisos en cada endpoint
- Usar roles y permisos granulares

### 6.3 Protección de Datos
- No registrar información sensible en los logs
- Enmascarar datos sensibles en las respuestas
- Implementar rate limiting
- Usar HTTPS en todos los entornos

## 7. Documentación

### 7.1 Documentación de Código
- Documentar todas las funciones públicas con JSDoc
- Incluir descripción, parámetros, valor de retorno y posibles errores
- Documentar tipos complejos y enums

### 7.2 Documentación de API
- Usar OpenAPI/Swagger para documentar endpoints
- Incluir ejemplos de solicitud/respuesta
- Documentar códigos de estado y errores

### 7.3 Guías
- Mantener actualizada la documentación
- Incluir guías de configuración y despliegue
- Documentar decisiones de arquitectura importantes

---

Última actualización: Junio 2024
