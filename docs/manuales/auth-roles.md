# Sistema de Autenticación y Gestión Multi-Rol - Intranet Neóptica

> **Versión:** 1.1 (Junio 2025)  
> **Autor:** Equipo de Desarrollo Neóptica  
> **Estado:** Implementado - Documentación actualizada

## 1. Visión General

La Intranet Neóptica implementa un sistema avanzado de gestión de usuarios con capacidades multi-rol, permitiendo que un mismo usuario pueda tener asignados múltiples roles simultáneamente (por ejemplo, ser tanto vendedor como optometrista). Este documento detalla la arquitectura, implementación y consideraciones de seguridad del sistema.

## 2. Usuarios del Sistema

### 2.1. Usuario System

El sistema cuenta con un usuario especial denominado "usuario system" (o usuario del sistema), el cual se utiliza específicamente para operaciones automáticas y registros de auditoría generados por el propio sistema cuando no hay un usuario humano asociado a la acción.

**Características del usuario system:**

- **Email reservado:** `system@internal.neoptica.com`
- **Inactivo por diseño:** Este usuario está siempre configurado como inactivo (`activo: false`)
- **Sin roles asignados:** Para evitar que aparezca en listados normales de usuarios
- **Protegido contra modificaciones:** El sistema impide que este usuario sea modificado o eliminado
- **Generación automática:** Creado en el script de seed con contraseña aleatoria segura
- **Uso en auditoría:** Utilizado automáticamente por el sistema de auditoría cuando no se proporciona un ID de usuario válido

**Seguridad:**

El usuario system está protegido contra:
- Eliminación accidental o maliciosa
- Modificación de sus propiedades
- Cambio de contraseña

No debe confundirse este usuario con la cuenta de administrador. El usuario system nunca debe utilizarse para iniciar sesión y solo sirve como actor para los registros de auditoría generados automáticamente.

## 3. Arquitectura de la Solución Multi-Rol

### 3.1. Modelo de datos

El sistema utiliza una relación many-to-many entre usuarios y roles implementada a través de la tabla asociativa `usuario_rol`:

```
Usuario (1) ------ (*) usuario_rol (*) ------ (1) Rol
```

**Estructura de la tabla `usuario_rol`:**
- `usuario_id`: Clave externa referenciando al usuario
- `rol_id`: Clave externa referenciando al rol
- `creado_en`: Timestamp de creación
- `creado_por`: ID del usuario que creó la asignación
- `modificado_en`: Timestamp de modificación (si aplica)
- `modificado_por`: ID del usuario que modificó la asignación (si aplica)
- `anulado_en`: Timestamp de anulación (si aplica)
- `anulado_por`: ID del usuario que anuló la asignación (si aplica)

Esta tabla asociativa incluye todos los campos de control temporal estándar para mantener la integridad de la auditoría.

### 3.2. JWT con Múltiples Roles

Los tokens JWT generados al autenticarse incluyen un array de todos los roles asignados al usuario:

```json
{
  "uid": "123",
  "roles": ["vendedor", "optometrista", "admin"],
  "iat": 1669842000,
  "exp": 1669928400
}
```

Este diseño permite:
- Verificar permisos basados en múltiples roles
- Facilitar el cambio dinámico de rol activo en la UI
- Mantener una única sesión para todas las capacidades del usuario

## 4. Implementación

### 4.1. Autenticación

```typescript
// Ejemplo simplificado de generación de JWT con múltiples roles
export const generarJWT = async (uid: number, roles: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = { uid, roles };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || '',
      {
        expiresIn: '24h',
      },
      (err, token) => {
        if (err) {
          console.error('Error al generar token:', err);
          reject('No se pudo generar el token');
        } else {
          resolve(token || '');
        }
      }
    );
  });
};
```

### 4.2. Middleware de Validación de Roles

```typescript
// Middleware que verifica si el usuario tiene alguno de los roles requeridos
export const validarRoles = (rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Token ya validado por validarJWT
    if (!req.usuario || !req.roles) {
      return res.status(401).json({
        ok: false,
        error: 'Token no válido - usuario no autenticado'
      });
    }

    // Verificar si el usuario tiene alguno de los roles permitidos
    const tieneRol = req.roles.some(rol => rolesPermitidos.includes(rol));
    
    if (!tieneRol) {
      return res.status(403).json({
        ok: false,
        error: `El usuario no tiene los permisos necesarios. Requiere uno de estos roles: ${rolesPermitidos.join(', ')}`
      });
    }

    next();
  };
};
```

### 3.3. Creación de Usuarios con Múltiples Roles

```typescript
// Ejemplo simplificado de creación de usuario con múltiples roles
const crearUsuario = async (req: Request, res: Response) => {
  const { nombre_completo, email, password, telefono, roles } = req.body;
  const usuarioId = req.usuario.uid;

  try {
    // Validar roles existentes
    const rolesValidos = await prisma.rol.findMany({
      where: { nombre: { in: roles }, activo: true }
    });

    if (rolesValidos.length !== roles.length) {
      return res.status(400).json({
        ok: false,
        error: 'Uno o más roles no existen o no están activos'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Crear usuario y asignar roles en una transacción
    const [usuario, rolesAsignados] = await prisma.$transaction(async (tx) => {
      // 1. Crear usuario
      const nuevoUsuario = await tx.usuario.create({
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
        roles.map(nombreRol => 
          tx.usuario_rol.create({
            data: {
              usuario_id: nuevoUsuario.id,
              rol: { connect: { nombre: nombreRol } },
              creado_en: new Date(),
              creado_por: usuarioId
            }
          })
        )
      );
      
      return [nuevoUsuario, asignaciones];
    });

    // Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'CREAR',
      descripcion: `Usuario creado: ${nombre_completo} (${email}) con roles: ${roles.join(', ')}`,
      modulo: 'usuarios',
      entidad_id: usuario.id
    });

    return res.status(201).json({
      ok: true,
      data: {
        usuario: {
          id: usuario.id,
          nombre_completo: usuario.nombre_completo,
          email: usuario.email,
          telefono: usuario.telefono,
          roles: roles
        }
      },
      error: null
    });
    
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    
    // Auditoría de error
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'ERROR',
      descripcion: `Error al crear usuario: ${error.message}`,
      modulo: 'usuarios'
    });
    
    return res.status(500).json({
      ok: false,
      data: null,
      error: 'Error al crear usuario'
    });
  }
};
```

## 4. Experiencia de Usuario Multi-Rol

El sistema permite a los usuarios con múltiples roles:

1. **Autenticación unificada**: Login único que carga todos los roles asignados
2. **Cambio dinámico de rol**: Seleccionar el rol activo en cualquier momento de la sesión
3. **Interfaz adaptativa**: La UI se adapta según el rol activo, mostrando solo las opciones pertinentes
4. **Permisos dinámicos**: Las operaciones permitidas cambian según el rol activo seleccionado

## 5. Seguridad y Consideraciones

### 5.1. Validaciones y Protecciones

- Verificación en cada endpoint para prevenir modificaciones no autorizadas de roles
- Validación de roles existentes antes de asignación
- Registro detallado de auditoría para todas las operaciones de gestión de roles
- Endpoints protegidos por middleware que valida permisos basados en roles

### 5.2. Pruebas y Validación

El sistema incluye pruebas automatizadas para:

- Creación de usuarios con múltiples roles
- Actualización de roles de usuarios
- Verificación de JWT con múltiples roles
- Validación de acceso según rol activo
- Manejo de escenarios de error

### 5.3. Limitaciones y Consideraciones

- Los usuarios pueden tener múltiples roles, pero operan en un rol "activo" a la vez en la interfaz
- Las operaciones se auditan indicando el rol activo utilizado para realizarlas
- La revocación de roles respeta las restricciones de integridad referencial con auditoría

## 6. Escalabilidad y Evolución

El sistema está diseñado para soportar:

- Creación de nuevos roles sin cambios estructurales
- Expansión de permisos dentro de cada rol
- Reportes por rol y por usuario
- Estadísticas de uso por rol

---

Este documento será actualizado según evolucionen los requerimientos del sistema multi-rol y se implementen mejoras en la gestión de roles y permisos.
