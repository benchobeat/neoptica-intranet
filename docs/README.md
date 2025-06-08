# Documentación de Neóptica Intranet

Este directorio contiene toda la documentación técnica del sistema de gestión de Neóptica.

## Estructura del Directorio

```
docs/
├── assets/                 # Recursos estáticos (imágenes, diagramas, etc.)
│   └── diagrams/           # Diagramas generados a partir de archivos .mmd
├── manuales/               # Documentación técnica detallada
├── modelos/                # Documentación generada de los modelos de datos
├── plantillas/             # Plantillas para documentación
│   ├── ejemplo-codigo.md   # Plantilla para ejemplos de código
│   ├── guia-diagramas.md   # Guía de estilo para diagramas
│   ├── modelo.md           # Plantilla para documentación de modelos
│   └── nomenclatura.md     # Estándares de nomenclatura
└── modelos.md              # Índice de modelos generado automáticamente
```

## Generación de Documentación

### Requisitos Previos

- Node.js 16+
- npm 7+
- Docker (opcional, para ejecutar Prisma Studio)

### Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno (ver `.env.example`)

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run docs:build` | Genera toda la documentación |
| `npm run docs:generate` | Genera documentación a partir de modelos |
| `npm run docs:generate-mermaid` | Genera diagramas a partir de archivos .mmd |
| `npm run docs:watch-mermaid` | Observa cambios en diagramas .mmd |
| `npm run docs:validate-links` | Valida enlaces en archivos Markdown |
| `npm run docs:lint` | Ejecuta el linter de Markdown |
| `npm run docs:check` | Ejecuta todas las validaciones |

## Guía de Estilo para Documentación

### Documentación de Modelos

Cada modelo debe documentarse siguiendo la plantilla en `plantillas/modelo.md`.

### Diagramas

- Usar Mermaid.js para diagramas
- Guardar archivos fuente en `docs/diagrams/` con extensión `.mmd`
- Los diagramas se generarán automáticamente en `docs/assets/diagrams/`

### Código de Ejemplo

Usar la plantilla en `plantillas/ejemplo-codigo.md` para documentar ejemplos de código.

## Integración con Git

Se han configurado hooks de Git para mantener la calidad de la documentación:

- **pre-commit**: Ejecuta formateo y linting
- **pre-push**: Valida que la documentación esté actualizada

## Despliegue

La documentación se despliega automáticamente en cada push a la rama `main`.

## Solución de Problemas

### Error al generar diagramas

Asegúrate de tener instalado Puppeteer globalmente:

```bash
npm install -g puppeteer
```

### Error de enlaces rotos

Ejecuta el validador manualmente:

```bash
npm run docs:validate-links
```

## Contribución

1. Crear una rama para la característica (`feature/nombre-caracteristica`)
2. Hacer commits atómicos con mensajes descriptivos
3. Abrir un Pull Request contra la rama `main`

## Licencia

Este proyecto es propiedad de Neóptica. Todos los derechos reservados.
