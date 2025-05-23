# Neóptica Intranet

Bienvenido al repositorio oficial de **Neóptica Intranet**, la plataforma de gestión administrativa, clínica y operativa para ópticas modernas.

---

## Breve resumen del proyecto

Neóptica Intranet es una aplicación web diseñada para optimizar la gestión de ópticas y centros visuales. Permite administrar usuarios, reservas, inventario, facturación, agenda clínica y tareas administrativas desde un entorno seguro, escalable y moderno, compatible con futuras integraciones (ERP, facturación electrónica, móviles, etc.).

---

## ¿Cómo iniciar el setup del proyecto?

1. **Lee el manual completo de instalación en:**  
   [`docs/manuales/Setup.md`](docs/manuales/Setup.md)

2. **Requisitos previos mínimos:**  
   - Ubuntu 22.04+ con GUI  
   - Node.js 22.x, PostgreSQL, Git y VS Code  
   - Acceso a terminal con permisos sudo

3. **Pasos rápidos:**
   ```bash
   git clone https://github.com/benchobeat/neoptica-intranet.git
   cd neoptica-intranet
   ```
   # Sigue los pasos del Setup.md para instalación completa

4. **Importante:**
-   No subas archivos .env ni backups a este repositorio.
-   Lee la sección FAQ del Setup.md si tienes errores.

¿Cómo reportar errores, dudas o solicitar soporte?
Reportar un bug o error:

Verifica primero en el archivo FAQ si el problema ya tiene solución.

Si no, abre un Issue en GitHub con el mayor detalle posible (pasos para replicar, logs, capturas de pantalla).

Soporte interno o sugerencias:

Envía un correo a [ruben_mosquerav@hotmail.com]

O contacta al responsable técnico en el canal interno del equipo (ejemplo: Slack/Teams).

Mejoras, sugerencias y pull requests:
¡Son bienvenidas! Haz un fork del repo y envía tu propuesta siguiendo las convenciones de ramas y commits.

### Seed inicial de base de datos

```bash
cd backend
npx prisma db seed
```

###Formato de Respuesta de la API y Helper Global
¿Por qué usamos un formato uniforme?
Toda la API de Neóptica responde siempre con el mismo contrato, lo que facilita la integración, pruebas, debugging y consistencia en todo el stack (backend, frontend, mobile, etc.).

Estructura estándar de respuesta
Cada endpoint retorna un objeto con la siguiente forma:
```json
{
  "ok": true,          // Indica éxito (true) o error (false)
  "data": { ... },     // Objeto o arreglo con los datos de la respuesta (null si hubo error)
  "error": null        // Mensaje de error en caso de fallo, null si es éxito
}
```

Ejemplo de éxito:
```json
{
  "ok": true,
  "data": {
    "id": "0cd2bebd-d1eb-42b0-b040-b555cd726322",
    "nombre_completo": "Administrador General",
    "email": "admin@neoptica.com"
    // ...otros campos
  },
  "error": null
}
```

Ejemplo de error:
```json
{
  "ok": false,
  "data": null,
  "error": "Usuario no encontrado"
}
```

Helper global de respuestas
Para centralizar y garantizar este formato en todo el backend, se utiliza un helper en src/utils/response.ts:

```typescript
// src/utils/response.ts

export interface ApiResponse<T = any> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

export function success<T = any>(data: T): ApiResponse<T> {
  return {
    ok: true,
    data,
    error: null,
  };
}

export function fail(error: string, data: any = null): ApiResponse {
  return {
    ok: false,
    data,
    error,
  };
}
```

Uso recomendado en controladores (Express/Prisma):

```typescript
import { success, fail } from '../utils/response';

export async function getUsuario(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.params.id } });
    if (!usuario) {
      return res.status(404).json(fail('Usuario no encontrado'));
    }
    return res.json(success(usuario));
  } catch (error) {
    return res.status(500).json(fail('Error interno del servidor', error));
  }
}
```

Ventajas de este enfoque
Consistencia: Todos los endpoints responden igual, facilitando el consumo y manejo en frontend/mobile.

Facilidad de testing: Las pruebas siempre esperan la misma estructura, simplificando asserts y mocks.

Documentación clara: La estructura puede ser definida fácilmente en Swagger/OpenAPI, ayudando a terceros a entender la API.

Escalabilidad: Si en el futuro necesitas agregar más información a las respuestas, lo puedes hacer desde un solo archivo.

Recomendación
Usa SIEMPRE los helpers success() y fail() en cada controlador y servicio del backend.
Esto mejora la mantenibilidad, la seguridad y la claridad de toda la solución.

Tabla de errores comunes y formato de respuesta
Código  HTTP	    Contexto o Motivo	        Formato de respuesta
400	    Petición  inválida (Bad Request)	          { "ok": false, "data": null, "error": "Datos inválidos o campos requeridos faltantes" }
401	    No autenticado (Unauthorized)	              { "ok": false, "data": null, "error": "Token inválido o no enviado" }
403	    Sin permisos (Forbidden)	                  { "ok": false, "data": null, "error": "No tienes permisos para realizar esta acción" }
404	    No encontrado (Not Found)	                  { "ok": false, "data": null, "error": "Recurso no encontrado" }
409	    Conflicto (por ejemplo, email duplicado)	  { "ok": false, "data": null, "error": "El correo ya está registrado" }
422	    Entidad no procesable (Validaciones)	      { "ok": false, "data": null, "error": "El campo 'email' debe ser un correo válido" }
500	    Error interno del servidor	                { "ok": false, "data": null, "error": "Error interno del servidor" }