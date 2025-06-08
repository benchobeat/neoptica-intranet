# Códigos de Error HTTP

Este documento centraliza todos los códigos de error HTTP utilizados en la API de Neoptica Intranet. Cada código incluye su descripción, posibles causas y un ejemplo de respuesta JSON cuando corresponda.

## Códigos 4xx - Errores del Cliente

### 400 Bad Request
- **Descripción**: La solicitud no pudo ser procesada debido a errores en los datos proporcionados.
- **Causas comunes**:
  - Datos de entrada inválidos o faltantes
  - Validaciones fallidas (formato de email, longitud de contraseña, etc.)
  - Tipos de datos incorrectos
- **Ejemplo**:
  ```json
  {
    "error": "Datos de entrada inválidos",
    "detalles": [
      "El email no tiene un formato válido",
      "La contraseña debe tener al menos 8 caracteres"
    ]
  }
  ```

### 401 Unauthorized
- **Descripción**: Se requiere autenticación para acceder al recurso.
- **Causas comunes**:
  - Token JWT no proporcionado
  - Token expirado
  - Token inválido
- **Ejemplo**:
  ```json
  {
    "error": "No autorizado",
    "mensaje": "Se requiere autenticación para acceder a este recurso"
  }
  ```

### 403 Forbidden
- **Descripción**: El usuario autenticado no tiene permisos para realizar la acción.
- **Causas comunes**:
  - Permisos insuficientes
  - Intento de acceder a recursos de otro usuario sin privilegios
- **Ejemplo**:
  ```json
  {
    "error": "Acceso denegado",
    "mensaje": "No tiene permisos para realizar esta acción"
  }
  ```

### 404 Not Found
- **Descripción**: El recurso solicitado no existe.
- **Causas comunes**:
  - ID de recurso inválido
  - Ruta incorrecta
- **Ejemplo**:
  ```json
  {
    "error": "No encontrado",
    "mensaje": "El usuario con ID 123 no existe"
  }
  ```

### 409 Conflict
- **Descripción**: Conflicto con el estado actual del recurso.
- **Causas comunes**:
  - Intento de crear un recurso que ya existe
  - Violación de restricciones únicas
- **Ejemplo**:
  ```json
  {
    "error": "Conflicto",
    "mensaje": "Ya existe un usuario con este correo electrónico"
  }
  ```

### 422 Unprocessable Entity
- **Descripción**: La solicitud está bien formada pero no se pudo procesar debido a errores semánticos.
- **Causas comunes**:
  - Validaciones de negocio fallidas
  - Dependencias no cumplidas
- **Ejemplo**:
  ```json
  {
    "error": "No se puede procesar",
    "mensaje": "No se puede eliminar el producto porque tiene pedidos asociados"
  }
  ```

### 429 Too Many Requests
- **Descripción**: El usuario ha enviado demasiadas solicitudes en un período de tiempo.
- **Causas comunes**:
  - Límite de tasa de solicitudes excedido
  - Demasiados intentos de inicio de sesión fallidos
- **Ejemplo**:
  ```json
  {
    "error": "Demasiadas solicitudes",
    "mensaje": "Has excedido el límite de intentos. Por favor, inténtalo de nuevo en 15 minutos"
  }
  ```

## Códigos 5xx - Errores del Servidor

### 500 Internal Server Error
- **Descripción**: Error interno del servidor.
- **Causas comunes**:
  - Excepciones no controladas
  - Errores de base de datos
- **Ejemplo**:
  ```json
  {
    "error": "Error interno del servidor",
    "mensaje": "Se ha producido un error inesperado"
  }
  ```

### 503 Service Unavailable
- **Descripción**: El servicio no está disponible temporalmente.
- **Causas comunes**:
  - Mantenimiento programado
  - Sobrecarga del servidor
- **Ejemplo**:
  ```json
  {
    "error": "Servicio no disponible",
    "mensaje": "El servicio está en mantenimiento. Por favor, inténtelo más tarde"
  }
  ```

## Uso en la Documentación

Al documentar los endpoints, se debe hacer referencia a este documento utilizando el siguiente formato:

```markdown
**Códigos de error**:
- 400: Ver [documentación de errores HTTP](../api/errores-http.md#400-bad-request)
- 401: Ver [documentación de errores HTTP](../api/errores-http.md#401-unauthorized)
- 403: Ver [documentación de errores HTTP](../api/errores-http.md#403-forbidden)
- 404: Ver [documentación de errores HTTP](../api/errores-http.md#404-not-found)
- 500: Ver [documentación de errores HTTP](../api/errores-http.md#500-internal-server-error)
```

## Actualizaciones

Este documento debe mantenerse actualizado a medida que se añadan nuevos códigos de error o se modifiquen los existentes en la API.
