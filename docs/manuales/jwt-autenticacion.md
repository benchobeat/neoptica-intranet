# JWT y Sistema de Autenticación Multi-Rol

> **Versión:** 1.0 (Noviembre 2023)  
> **Autor:** Equipo de Desarrollo Neóptica  
> **Estado:** Implementado

## Visión General

Este documento detalla la implementación del sistema de autenticación basado en JWT (JSON Web Tokens) y su integración con el sistema multi-rol de la Intranet Neóptica. Esta arquitectura permite una experiencia de usuario fluida donde un mismo usuario puede tener múltiples roles y cambiar entre ellos sin necesidad de cerrar sesión.

## Estructura del Token JWT

El JWT generado durante la autenticación incluye la siguiente información en su payload:

```json
{
  "uid": 123,                                // ID del usuario
  "roles": ["vendedor", "optometrista"],     // Array de roles asignados
  "iat": 1669842000,                         // Issued At (fecha de emisión)
  "exp": 1669928400                          // Expiration (fecha de expiración)
}
```

### Características clave:

1. **Array de roles**: El token incluye todos los roles asignados al usuario, facilitando la autorización multi-rol.
2. **Tiempo de expiración configurable**: Por defecto 24 horas, definido en variables de entorno.
3. **Firma con secreto seguro**: Usa JWT_SECRET desde variables de entorno para proteger la integridad.

## Flujo de Autenticación

### 1. Login y Generación del Token

```typescript
// Ejemplo simplificado del proceso de login
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario con sus roles
    const usuario = await prisma.usuario.findUnique({
      where: { email, activo: true },
      include: { usuario_rol: { include: { rol: true } } }
    });
    
    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(400).json({
        ok: false,
        error: 'Credenciales incorrectas'
      });
    }
    
    // Extraer roles asignados
    const roles = usuario.usuario_rol.map(ur => ur.rol.nombre);
    
    // Generar JWT con array de roles
    const token = await generarJWT(usuario.id, roles);
    
    // Respuesta exitosa
    return res.json({
      ok: true,
      data: {
        usuario: {
          id: usuario.id,
          nombre_completo: usuario.nombre_completo,
          email: usuario.email,
          roles: roles
        },
        token
      },
      error: null
    });
  } catch (error) {
    // Manejo de errores
  }
};
```

### 2. Validación del Token (Middleware)

```typescript
// Middleware para validar JWT
export const validarJWT = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'No hay token en la petición'
    });
  }
  
  try {
    // Decodificar y verificar token
    const { uid, roles }: { uid: number; roles: string[] } = jwt.verify(
      token,
      process.env.JWT_SECRET || ''
    ) as any;
    
    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: uid, activo: true }
    });
    
    if (!usuario) {
      return res.status(401).json({
        ok: false,
        error: 'Token no válido - usuario inexistente o inactivo'
      });
    }
    
    // Inyectar datos en el request para uso posterior
    req.usuario = { uid };
    req.roles = roles;
    
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: 'Token no válido'
    });
  }
};
```

### 3. Validación de Roles (Middleware)

```typescript
// Middleware para validar roles específicos
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

## Implementación de Rutas Protegidas

```typescript
// Ejemplo de rutas protegidas con diferentes niveles de acceso
router.get(
  '/usuarios',
  [validarJWT, validarRoles(['admin'])],
  usuarioController.getUsuarios
);

router.get(
  '/ventas',
  [validarJWT, validarRoles(['admin', 'vendedor'])],
  ventasController.getVentas
);

router.get(
  '/citas',
  [validarJWT, validarRoles(['admin', 'optometrista', 'vendedor'])],
  citasController.getCitas
);
```

## Gestión del Rol Activo en Frontend

Aunque el JWT contiene todos los roles asignados, la interfaz de usuario permite al usuario seleccionar qué rol desea utilizar activamente en cada momento:

```typescript
// Ejemplo simplificado de cambio de rol activo en frontend
const cambiarRolActivo = (nuevoRol) => {
  // El token sigue siendo el mismo, solo cambiamos el contexto de la UI
  setRolActivo(nuevoRol);
  
  // Actualizar menú y permisos visibles según el rol activo
  actualizarMenuPorRol(nuevoRol);
  
  // Navegar al dashboard específico del rol
  navigate(`/dashboard/${nuevoRol}`);
};
```

## Consideraciones de Seguridad

1. **Protección del secreto JWT**: 
   - Almacenado solo en variables de entorno
   - Longitud mínima recomendada: 32 caracteres aleatorios
   - Rotación periódica en ambientes de producción

2. **Validaciones de seguridad**:
   - Validación de roles en cada endpoint protegido
   - Verificación de usuario activo en cada validación de token
   - Expiración adecuada de tokens (24h por defecto)

3. **Auditoría**:
   - Registro de inicios y cierres de sesión
   - Registro de cambios de rol activo
   - Trazabilidad de acciones con información del rol utilizado

## Integración con Autenticación de Terceros

El sistema está diseñado para funcionar tanto con autenticación tradicional (email/contraseña) como con proveedores OAuth (Google, Facebook, Instagram):

1. Tras autenticación exitosa con proveedor OAuth, se buscan y asignan los roles del usuario
2. Se genera el JWT con el mismo formato (incluyendo array de roles)
3. El middleware de validación funciona exactamente igual para ambos tipos de autenticación

## Referencia Técnica

- **Biblioteca JWT**: jsonwebtoken v9.0.0+
- **Secret JWT**: Variable de entorno JWT_SECRET
- **Tiempo de expiración**: Configurable vía variable de entorno JWT_EXPIRES_IN (default: "24h")
- **Algoritmo de firma**: HS256 (HMAC SHA-256)

## Buenas Prácticas Implementadas

1. **No almacenar información sensible** en el payload de JWT
2. **Validación completa** en cada solicitud protegida
3. **Comprobación de usuario activo** en cada validación de token
4. **Manejo de errores específicos** con códigos HTTP apropiados
5. **Auditoría completa** de operaciones de autenticación y autorización

---

Para más información sobre el sistema multi-rol completo, consultar `auth-roles.md` en esta misma carpeta.
