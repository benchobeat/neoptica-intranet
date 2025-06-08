# Plantilla para Ejemplos de Código

## Estructura Básica

Cada ejemplo de código debe seguir esta estructura:

````markdown
## [Título Descriptivo]

**Propósito**: Breve descripción de lo que demuestra el ejemplo.

**Contexto**: Cuándo y dónde usar este patrón.

**Código**:

```[lenguaje]
// Código de ejemplo aquí
function ejemplo(parametro) {
  return `Hola ${parametro}`;
}
```

**Explicación**:
- Punto 1: Explicación de la parte relevante
- Punto 2: Notas adicionales

**Parámetros**:
- `parametro` (tipo): Descripción del parámetro

**Retorno**:
- (tipo): Descripción del valor de retorno

**Ejemplo de Uso**:
```[lenguaje]
const resultado = ejemplo('Mundo');
console.log(resultado); // 'Hola Mundo'
```

**Consideraciones**:
- Limitaciones conocidas
- Rendimiento
- Consideraciones de seguridad
````

## Lenguajes Soportados

Utilice los identificadores de lenguaje para el resaltado de sintaxis:

- TypeScript: `typescript` o `ts`
- JavaScript: `javascript` o `js`
- SQL: `sql`
- JSON: `json`
- Bash/Shell: `bash` o `sh`
- HTML: `html`
- CSS: `css`
- Markdown: `markdown`

## Ejemplo Completo

## Creación de Usuario con Validación

**Propósito**: Demostrar cómo crear un usuario con validación de datos.

**Contexto**: Uso en controladores de API o servicios de autenticación.

**Código**:

```typescript
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'optometrista' | 'vendedor' | 'cliente';
}

/**
 * Crea un nuevo usuario con validación
 * @throws {Error} Si la validación falla
 */
async function crearUsuario(datos: Partial<Usuario>): Promise<Usuario> {
  // Validación básica
  if (!datos.email || !/\S+@\S+\.\S+/.test(datos.email)) {
    throw new Error('Email inválido');
  }
  
  if (!datos.nombre || datos.nombre.trim().length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres');
  }
  
  // Crear usuario en la base de datos
  const nuevoUsuario: Usuario = {
    id: crypto.randomUUID(),
    nombre: datos.nombre.trim(),
    email: datos.email.toLowerCase(),
    rol: datos.rol || 'usuario',
  };
  
  // Guardar en la base de datos (ejemplo con Prisma)
  return await prisma.usuario.create({
    data: nuevoUsuario,
  });
}
```

**Explicación**:
- La función valida el email y el nombre antes de crear el usuario
- Usa TypeScript para tipos seguros
- Incluye documentación JSDoc
- Maneja la normalización de datos (trim, lowercase)

**Parámetros**:
- `datos` (Partial<Usuario>): Datos del usuario a crear

**Retorno**:
- Promise<Usuario>: El usuario creado con todos sus campos

**Ejemplo de Uso**:
```typescript
try {
  const usuario = await crearUsuario({
    nombre: '  Juan Pérez  ',
    email: 'juan@ejemplo.COM',
    rol: 'admin'
  });
  console.log(usuario);
  // {
  //   id: '123e4567-e89b-12d3-a456-426614174000',
  //   nombre: 'Juan Pérez',
  //   email: 'juan@ejemplo.com',
  //   rol: 'admin'
  // }
} catch (error) {
  console.error('Error al crear usuario:', error.message);
}
```

**Consideraciones**:
- No incluye validación de unicidad de email
- El ID se genera en el cliente, podría generarse en la base de datos
- Falta manejo de contraseñas (debería usar bcrypt)

## Ejemplo de Componente React

**Propósito**: Mostrar un componente de tarjeta de producto reutilizable.

**Código**:

```tsx
import React from 'react';
import styles from './ProductoCard.module.css';

interface ProductoCardProps {
  nombre: string;
  precio: number;
  imagenUrl: string;
  descuento?: number;
  enStock: boolean;
  onAgregarCarrito: (cantidad: number) => void;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({
  nombre,
  precio,
  imagenUrl,
  descuento = 0,
  enStock,
  onAgregarCarrito,
}) => {
  const precioFinal = descuento > 0 
    ? precio * (1 - descuento / 100) 
    : precio;

  return (
    <div className={`${styles.card} ${!enStock ? styles.agotado : ''}`}>
      <div className={styles.imagenContainer}>
        <img 
          src={imagenUrl} 
          alt={nombre} 
          className={styles.imagen} 
          loading="lazy"
        />
        {descuento > 0 && (
          <span className={styles.descuentoBadge}>-{descuento}%</span>
        )}
      </div>
      
      <div className={styles.contenido}>
        <h3 className={styles.nombre}>{nombre}</h3>
        
        <div className={styles.precioContainer}>
          {descuento > 0 && (
            <span className={styles.precioOriginal}>${precio.toFixed(2)}</span>
          )}
          <span className={styles.precioFinal}>
            ${precioFinal.toFixed(2)}
          </span>
        </div>
        
        <button 
          className={styles.boton}
          onClick={() => onAgregarCarrito(1)}
          disabled={!enStock}
        >
          {enStock ? 'Agregar al carrito' : 'Sin stock'}
        </button>
      </div>
    </div>
  );
};
```

**Estilos (CSS Modules)**:

```css
/* ProductoCard.module.css */
.card {
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.agotado {
  opacity: 0.7;
  background-color: #f9f9f9;
}

/* Estilos adicionales... */
```

## Ejemplo de Consulta SQL

**Propósito**: Consulta para obtener estadísticas de ventas por categoría.

**Código**:

```sql
-- Obtener ventas por categoría con comparativo mensual
WITH ventas_mensuales AS (
  SELECT 
    c.nombre AS categoria,
    DATE_TRUNC('month', p.fecha_creacion) AS mes,
    COUNT(DISTINCT p.id) AS total_pedidos,
    SUM(dp.cantidad * dp.precio_unitario) AS monto_total,
    COUNT(DISTINCT p.usuario_id) AS clientes_unicos
  FROM 
    pedidos p
    JOIN detalles_pedido dp ON p.id = dp.pedido_id
    JOIN productos pr ON dp.producto_id = pr.id
    JOIN categorias c ON pr.categoria_id = c.id
  WHERE 
    p.estado = 'completado'
    AND p.fecha_creacion >= DATE_TRUNC('year', CURRENT_DATE)
  GROUP BY 
    c.nombre, 
    DATE_TRUNC('month', p.fecha_creacion)
)
SELECT 
  categoria,
  TO_CHAR(mes, 'YYYY-MM') AS mes,
  total_pedidos,
  monto_total,
  clientes_unicos,
  ROUND(monto_total / NULLIF(total_pedidos, 0), 2) AS ticket_promedio,
  LAG(monto_total) OVER (PARTITION BY categoria ORDER BY mes) AS monto_mes_anterior,
  ROUND(
    (monto_total - LAG(monto_total) OVER (PARTITION BY categoria ORDER BY mes)) /
    NULLIF(LAG(monto_total) OVER (PARTITION BY categoria ORDER BY mes), 0) * 100,
    2
  ) AS crecimiento_porcentual
FROM 
  ventas_mensuales
ORDER BY 
  categoria, 
  mes;
```

**Explicación**:
- Usa una CTE para calcular métricas mensuales por categoría
- Incluye comparativos con el mes anterior
- Calcula el ticket promedio y crecimiento porcentual
- Maneja divisiones por cero con NULLIF

## Plantilla para Documentación de API

````markdown
## `GET /api/usuarios`

Obtiene una lista paginada de usuarios.

### Parámetros de Consulta

| Parámetro | Tipo    | Requerido | Valor por Defecto | Descripción                     |
|-----------|---------|-----------|-------------------|---------------------------------|
| `pagina`  | integer | No        | 1                 | Número de página               |
| `limite`  | integer | No        | 10                | Cantidad de resultados por página |
| `nombre`  | string  | No        | -                 | Filtrar por nombre (búsqueda parcial) |
| `rol`     | string  | No        | -                 | Filtrar por rol                |


### Respuesta Exitosa (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "rol": "admin",
      "fechaCreacion": "2025-01-01T12:00:00Z"
    }
  ],
  "paginacion": {
    "total": 1,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 1
  }
}
```

### Ejemplo de Uso

```bash
curl -X GET \
  'http://api.ejemplo.com/usuarios?pagina=1&limite=5&rol=admin' \
  -H 'Authorization: Bearer tu_token'
```

### Posibles Errores

- `401 Unauthorized`: Token no proporcionado o inválido
- `403 Forbidden`: Sin permisos para ver usuarios
- `500 Internal Server Error`: Error del servidor
````

## Convenciones para Ejemplos de Código

1. **Consistencia**: Usar la misma convención de estilo en todo el código.
2. **Comentarios**: Incluir comentarios explicativos para partes complejas.
3. **Manejo de Errores**: Mostrar cómo manejar errores adecuadamente.
4. **Seguridad**: Incluir consideraciones de seguridad relevantes.
5. **Accesibilidad**: En el caso de componentes UI, incluir atributos de accesibilidad.
6. **Pruebas**: Cuando sea relevante, incluir ejemplos de cómo probar el código.

## Plantilla para Ejemplos de Pruebas

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { crearUsuario } from './usuarioService';
import prisma from '../lib/prisma';

// Mock de Prisma
vi.mock('../lib/prisma', () => ({
  usuario: {
    create: vi.fn(),
  },
}));

describe('crearUsuario', () => {
  const usuarioMock = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nombre: 'Test User',
    email: 'test@example.com',
    rol: 'usuario',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe crear un usuario con datos válidos', async () => {
    // Configurar el mock
    prisma.usuario.create.mockResolvedValue(usuarioMock);

    // Ejecutar
    const resultado = await crearUsuario({
      nombre: 'Test User',
      email: 'test@example.com',
    });

    // Verificar
    expect(prisma.usuario.create).toHaveBeenCalledWith({
      data: {
        id: expect.any(String),
        nombre: 'Test User',
        email: 'test@example.com',
        rol: 'usuario',
      },
    });
    expect(resultado).toEqual(usuarioMock);
  });

  it('debe lanzar error con email inválido', async () => {
    await expect(
      crearUsuario({ nombre: 'Test', email: 'invalido' })
    ).rejects.toThrow('Email inválido');
  });
});
```
