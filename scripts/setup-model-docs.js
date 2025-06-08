#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorio base para la documentación
const DOCS_BASE_DIR = path.join(__dirname, '../docs/modelos');

// Plantillas para los archivos de documentación
const TEMPLATES = {
  reglas_negocio: `# Reglas de Negocio - {{modelName}}

## Validaciones de Datos

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| campo1 | tipo | Sí/No     | - Validación 1<br>- Validación 2 |

## Reglas de Negocio Específicas

1. **Regla 1**: Descripción detallada de la regla de negocio
   - **Condición**: Cuándo se aplica
   - **Acción**: Qué acción se realiza
   - **Ejemplo**: Ejemplo de aplicación

2. **Regla 2**: Otra regla de negocio importante
   - **Condición**: Cuándo se aplica
   - **Acción**: Qué acción se realiza
   - **Ejemplo**: Ejemplo de aplicación

## Flujos de Trabajo

### Creación
1. Paso 1
2. Paso 2
3. Paso 3

### Actualización
1. Paso 1
2. Paso 2

### Eliminación
1. Paso 1
2. Confirmación
`,

  seguridad: `# Seguridad y Permisos - {{modelName}}

## Roles y Permisos

| Rol | Crear | Leer | Actualizar | Eliminar | Notas |
|-----|-------|------|------------|----------|-------|
| Administrador | ✅ | ✅ | ✅ | ✅ | Acceso completo |
| Usuario Estándar | ❌ | ✅ | ❌ | ❌ | Solo lectura |

## Políticas de Seguridad

### Control de Acceso
- **Nivel de Acceso**: Público/Autenticado/Privado
- **Restricciones de Visibilidad**: Qué usuarios pueden ver estos datos
- **Restricciones de Modificación**: Quién puede modificar estos datos

### Validaciones de Seguridad
- Validación 1
- Validación 2

## Auditoría
- **Registro de Accesos**: Se registran todos los accesos
- **Historial de Cambios**: Se mantiene un historial completo
- **Retención**: Período de retención de registros
`
};

// Obtener la lista de modelos desde el esquema Prisma
function getPrismaModels() {
  try {
    // Leer el esquema Prisma
    const schemaPath = path.join(__dirname, '../backend/prisma/schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    
    // Extraer nombres de modelos (líneas que empiezan con 'model')
    const modelRegex = /^model\s+(\w+)/gm;
    const models = [];
    let match;
    
    while ((match = modelRegex.exec(schemaContent)) !== null) {
      models.push(match[1]);
    }
    
    return models;
  } catch (error) {
    console.error('Error al leer el esquema de Prisma:', error);
    console.error('Asegúrate de que el archivo schema.prisma existe en la ruta correcta.');
    process.exit(1);
  }
}

// Crear directorios y archivos de documentación para un modelo
function setupModelDocs(modelName) {
  const modelDir = path.join(DOCS_BASE_DIR, modelName.toLowerCase());
  
  // Crear directorio del modelo si no existe
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
    console.log(`✅ Directorio creado: ${modelDir}`);
  }
  
  // Crear archivos de documentación
  Object.entries(TEMPLATES).forEach(([templateName, templateContent]) => {
    const filePath = path.join(modelDir, `${templateName}.md`);
    
    // Solo crear el archivo si no existe
    if (!fs.existsSync(filePath)) {
      const content = templateContent.replace(/\{\{modelName\}\}/g, modelName);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Archivo creado: ${filePath}`);
    } else {
      console.log(`ℹ️  El archivo ya existe: ${filePath}`);
    }
  });
  
  // Crear README.md si no existe
  const readmePath = path.join(modelDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# ${modelName}

## Descripción

Breve descripción del modelo ${modelName}.

## Documentación Técnica

- [Documentación Generada](../_generated/${modelName.toLowerCase()}.md) - Estructura de la base de datos, campos y relaciones
- [Reglas de Negocio](./reglas_negocio.md) - Reglas de negocio y validaciones
- [Seguridad y Permisos](./seguridad.md) - Roles, permisos y políticas de seguridad

## Flujos Principales

- [Flujo 1](./flujos/flujo1.md)
- [Flujo 2](./flujos/flujo2.md)

## Integraciones

- [Integración 1](./integraciones/integracion1.md)
- [Integración 2](./integraciones/integracion2.md)
`;
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ README.md creado: ${readmePath}`);
  }
  
  // Crear directorios adicionales
  const subdirs = ['flujos', 'integraciones', 'diagramas'];
  subdirs.forEach(subdir => {
    const dirPath = path.join(modelDir, subdir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Directorio creado: ${dirPath}`);
      
      // Agregar archivo .gitkeep para mantener la estructura de directorios
      fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
    }
  });
}

// Función principal
async function main() {
  try {
    console.log('🔍 Obteniendo modelos de Prisma...');
    const models = await getPrismaModels();
    
    console.log(`📝 Configurando documentación para ${models.length} modelos...`);
    
    // Configurar documentación para cada modelo
    for (const model of models) {
      console.log(`\n📋 Procesando modelo: ${model}`);
      setupModelDocs(model);
    }
    
    console.log('\n🎉 Configuración de documentación completada con éxito!');
  } catch (error) {
    console.error('❌ Error durante la configuración de la documentación:', error);
    process.exit(1);
  }
}

// Ejecutar el script
main();
