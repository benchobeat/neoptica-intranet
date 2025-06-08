# Guía de Nomenclatura

## 1. Estructura de Directorios

```
src/
├── modules/
│   ├── [nombre_modulo]/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── tests/
├── shared/
│   ├── config/
│   ├── middlewares/
│   └── utils/
```

## 2. Convenciones de Nombrado

### 2.1 Archivos TypeScript/JavaScript

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Componentes React | `PascalCase.tsx` | `UserProfile.tsx` |
| Páginas | `PascalCase.page.tsx` | `Dashboard.page.tsx` |
| Hooks | `useCamelCase.ts` | `useAuth.ts` |
| Utilidades | `camelCase.ts` | `stringUtils.ts` |
| Constantes | `UPPER_SNAKE_CASE.ts` | `API_ENDPOINTS.ts` |
| Tipos/Interfaces | `PascalCase.types.ts` | `User.types.ts` |
| Contextos | `PascalCaseContext.tsx` | `AuthContext.tsx` |

### 2.2 Estilos

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Módulos CSS | `[nombre].module.css` | `Button.module.css` |
| Estilos globales | `global.css` | `global.css` |
| Temas | `theme.[nombre].ts` | `theme.dark.ts` |

### 2.3 Pruebas

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Archivos de prueba | `[nombre].test.ts(x)` | `Button.test.tsx` |
| Mocks | `__mocks__/` | `__mocks__/axios.ts` |
| Fixtures | `__fixtures__/` | `__fixtures__/user.ts` |

## 3. Convenciones de Código

### 3.1 Nombrado de Variables y Funciones

- **Variables**: `camelCase`
  ```typescript
  const userProfile = {};
  const isLoading = true;
  ```

- **Constantes**: `UPPER_SNAKE_CASE`
  ```typescript
  const MAX_RETRIES = 3;
  const API_BASE_URL = 'https://api.ejemplo.com';
  ```

- **Funciones**: `camelCase`
  ```typescript
  function calculateTotal() {}
  const fetchUserData = async () => {};
  ```

- **Clases**: `PascalCase`
  ```typescript
  class UserService {}
  ```

### 3.2 Nombrado de Tipos e Interfaces

- Interfaces: `IPascalCase` o `PascalCase`
  ```typescript
  interface IUser {}
  type User = {};
  ```

- Tipos Genéricos: `T` seguido de descripción en PascalCase
  ```typescript
  type ApiResponse<T> = {
    data: T;
    status: number;
  };
  ```

## 4. Convenciones de Base de Datos

### 4.1 Tablas
- Uso de `snake_case`
- Nombres en plural
- Ejemplo: `user_roles`, `order_items`

### 4.2 Columnas
- `snake_case`
- Claves foráneas: `nombre_tabla_singular_id`
- Ejemplo: `user_id`, `created_at`

### 4.3 Índices
- `idx_[tabla]_[columnas]`
- Ejemplo: `idx_users_email`

## 5. Convenciones de Commits

Formato: `tipo(ámbito): mensaje`

Ejemplos:
```
feat(auth): agregar autenticación con Google
fix(users): corregir actualización de perfil
docs: actualizar guía de contribución
refactor(api): mejorar manejo de errores
test: añadir pruebas para login
chore: actualizar dependencias
```

## 6. Convenciones de Documentación

### 6.1 Comentarios de Documentación

```typescript
/**
 * Calcula el total del carrito de compras
 * @param {CartItem[]} items - Lista de ítems en el carrito
 * @param {Discount} [discount] - Descuento opcional a aplicar
 * @returns {number} Total calculado con impuestos y descuentos
 * @throws {Error} Si el carrito está vacío
 */
function calculateTotal(items, discount) {}
```

### 6.2 Documentación de Componentes

```jsx
/**
 * Botón reutilizable para acciones principales
 * @param {Object} props - Propiedades del componente
 * @param {string} props.variant - Variante de estilo (primary, secondary, danger)
 * @param {boolean} [props.isLoading] - Estado de carga
 * @param {React.ReactNode} props.children - Contenido del botón
 */
const Button = ({ variant = 'primary', isLoading = false, children }) => {
  // implementación
};
```

## 7. Convenciones de Estilo

### 7.1 JavaScript/TypeScript
- Usar punto y coma al final de cada declaración
- Comillas simples para strings
- 2 espacios para indentación
- Llave de apertura en la misma línea

### 7.2 CSS/SCSS
- Orden de propiedades: Posicionamiento > Box Model > Tipografía > Visual
- Uso de clases en kebab-case
- Prefijos para navegadores solo cuando sea necesario

## 8. Nombrado de Branches

Formato: `tipo/descripcion-breve`

Ejemplos:
```
feat/user-authentication
fix/login-validation
docs/update-api-docs
refactor/payment-service
test/add-coverage
```
