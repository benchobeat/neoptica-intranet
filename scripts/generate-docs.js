#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
// Usar el cliente de Prisma desde el directorio backend
const { PrismaClient } = require('../backend/node_modules/@prisma/client');

// Configuración
const DOCS_DIR = path.join(__dirname, '../docs');
const TEMPLATES_DIR = path.join(DOCS_DIR, 'plantillas');
const OUTPUT_DIR = path.join(DOCS_DIR, 'modelos/_generated');
const MODEL_DOCS_DIR = path.join(DOCS_DIR, 'modelos');
const PRISMA_SCHEMA_PATH = path.join(__dirname, '../backend/prisma/schema.prisma');

// Asegurar que los directorios existan
[OUTPUT_DIR, MODEL_DOCS_DIR, path.join(DOCS_DIR, 'assets/diagrams')].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Cargar plantillas
const loadTemplate = (templateName) => {
  try {
    return fs.readFileSync(path.join(TEMPLATES_DIR, `${templateName}.md`), 'utf8');
  } catch (error) {
    console.error(`Error al cargar la plantilla ${templateName}:`, error);
    process.exit(1);
  }
};

// Plantillas
const MODEL_TEMPLATE = loadTemplate('modelo');

// Mapeo de tipos de Prisma a tipos de documentación
const TYPE_MAPPING = {
  'String': 'string',
  'Boolean': 'boolean',
  'Int': 'number',
  'BigInt': 'number',
  'Float': 'number',
  'Decimal': 'number',
  'DateTime': 'Date',
  'Json': 'object',
  'Bytes': 'Buffer',
};

// Obtener información de los modelos usando el cliente de Prisma
async function getPrismaModels() {
  try {
    const prisma = new PrismaClient();
    
    // Obtener el DMMF (Data Model Meta Format) de Prisma
    const dmmf = require('../backend/node_modules/@prisma/client').Prisma.dmmf;
    const models = [];
    
    // Procesar cada modelo del esquema
    for (const model of dmmf.datamodel.models) {
      const fields = [];
      const relations = [];
      
      // Procesar campos del modelo
      for (const field of model.fields) {
        const fieldInfo = {
          name: field.name,
          type: field.type,
          isOptional: !field.isRequired,
          isArray: field.isList,
          isId: field.isId,
          isUnique: field.isUnique,
          hasDefaultValue: field.hasDefaultValue,
          description: field.documentation || ''
        };
        
        // Manejar relaciones
        if (field.relationName) {
          relations.push({
            name: field.name,
            type: field.type,
            isArray: field.isList,
            relationName: field.relationName,
            relationFromFields: field.relationFromFields || [],
            relationToFields: field.relationToFields || [],
            description: field.documentation || ''
          });
        } else if (field.kind === 'scalar') {
          // Mapear tipos escalares
          fieldInfo.type = TYPE_MAPPING[field.type] || field.type;
          fields.push(fieldInfo);
        } else if (field.kind === 'enum') {
          // Manejar tipos enum
          fieldInfo.type = field.type;
          fields.push(fieldInfo);
        }
      }
      
      models.push({
        name: model.name,
        fields,
        relations,
        rawContent: JSON.stringify(model, null, 2)
      });
    }
    
    await prisma.$disconnect();
    return models;
    
  } catch (error) {
    console.error('Error al obtener modelos de Prisma:', error);
    process.exit(1);
  }
}

// Generar documentación para un modelo
function generateModelDoc(model) {
  // Función para formatear el tipo de campo
  const formatType = (field) => {
    let type = field.type;
    if (field.isArray) type += '[]';
    if (field.isOptional) type += '?';
    return type;
  };

  // Función para obtener el valor por defecto
  const getDefaultValue = (field) => {
    if (field.name === 'id') return '`uuid_generate_v4()`';
    if (field.name === 'creado_en' || field.name === 'actualizado_en') return '`now()`';
    if (field.name.endsWith('_por')) return 'ID del usuario autenticado';
    if (field.isOptional) return '`null`';
    return '-';
  };

  // Función para obtener validaciones
  const getValidations = (field) => {
    const validations = [];
    if (field.isId) validations.push('Identificador único');
    if (field.isUnique) validations.push('Valor único');
    if (field.hasDefaultValue) validations.push('Valor por defecto');
    if (field.name.endsWith('_por')) validations.push('Referencia a usuario');
    if (field.name.endsWith('_en')) validations.push('Marca de tiempo automática');
    return validations.length > 0 ? validations.join(', ') : '-';
  };

  // Función para obtener el valor de ejemplo
  const getExampleValue = (field) => {
    const defaultValue = getDefaultValue(field).replace(/`/g, '');
    
    // Manejar valores por defecto especiales
    if (defaultValue === 'ID del usuario autenticado') {
      return '"USUARIO_ACTUAL_ID"';
    } else if (defaultValue === 'now()') {
      return 'new Date()';
    } else if (defaultValue === 'uuid_generate_v4()') {
      return '"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"';
    } else if (defaultValue === 'null') {
      return 'null';
    } else if (defaultValue === '-') {
      return '"valor"';
    }
    return defaultValue;
  };

  // Obtener la primera línea de la documentación como descripción
  const modelDescription = (model.fields[0]?.description || '').split('\n')[0] || 
    `Modelo que representa ${model.name} en el sistema.`;

  // Generar sección de campos
  const fieldsTable = model.fields.length > 0 ? `
### Campos

| Nombre | Tipo | Requerido | Valor por Defecto | Validaciones | Descripción |
|--------|------|-----------|-------------------|--------------|-------------|
${model.fields
  .map(field => {
    let description = field.description || '';
    // Limpiar descripciones largas
    if (description.includes('\n')) {
      description = description.split('\n')[0] + '...';
    }
    return `| \`${field.name}\` | \`${formatType(field)}\` | ${!field.isOptional ? '✅' : '❌'} | ${getDefaultValue(field)} | ${getValidations(field)} | ${description.replace(/\|/g, '\\|')} |`;
  })
  .join('\n')}` : '';

  // Generar sección de relaciones
  const relationsSection = model.relations.length > 0 ? `
### Relaciones

${model.relations
  .map(rel => `- **${rel.name}**: ${rel.isArray ? 'Muchos' : 'Uno'} a [${rel.type}](./${rel.type.toLowerCase()}.md) \`${rel.relationName || ''}\``)
  .join('\n')}` : '\n### Relaciones\n\nEste modelo no tiene relaciones definidas.';

  // Generar ejemplos de uso
  const exampleFields = model.fields
    .filter(f => !f.isId && !f.name.endsWith('_en') && !f.name.endsWith('_por'))
    .map(f => {
      const exampleValue = getExampleValue(f);
      let comment = f.description ? ` // ${f.description.split('\n')[0]}` : '';
      if (f.description && f.description.includes('\n')) comment += '...';
      return `    ${f.name}: ${exampleValue},${comment}`;
    })
    .join('\n');

  const exampleRelations = model.relations.length > 0 
    ? `\n    // Incluir relaciones\n    include: {\n      ${model.relations.map(r => `${r.name}: true`).join(',\n      ')}\n    }` 
    : '';

  // Generar documentación
  return `# ${model.name}

## Descripción
${modelDescription}

## Estructura
${fieldsTable}
${relationsSection}

## Ejemplos de Uso

### Creación

\`\`\`typescript
// Crear un nuevo ${model.name}
const nuevo${model.name} = await prisma.${model.name.toLowerCase()}.create({\n  data: {\n${exampleFields}\n  }\n});
\`\`\`

### Consulta Básica

\`\`\`typescript
// Obtener todos los registros de ${model.name}
const registros = await prisma.${model.name.toLowerCase()}.findMany({${exampleRelations}\n});

// Obtener un ${model.name} por ID
const registro = await prisma.${model.name.toLowerCase()}.findUnique({\n  where: { id: 'ID_DEL_REGISTRO' }${exampleRelations ? ',' : ''}${exampleRelations}\n});
\`\`\`

## Notas Técnicas

- **Tabla en BD**: \`${model.name.toLowerCase()}\`
- **Clave primaria**: \`${model.fields.find(f => f.isId)?.name || 'id'}\`
- **Campos de auditoría**: ${hasAuditEnabled(model) ? '✅ Sí' : '❌ No'}

## Auditoría

${hasAuditEnabled(model) ? `### ✅ Auditoría Habilitada

Este modelo incluye soporte completo de auditoría con los siguientes campos de seguimiento:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| \`creado_en\` | \`DateTime\` | Fecha y hora de creación del registro |
| \`creado_por\` | \`string\` | ID del usuario que creó el registro |
| \`modificado_en\` | \`DateTime\` | Última fecha de modificación del registro |
| \`modificado_por\` | \`string\` | ID del último usuario que modificó el registro |
| \`anulado_en\` | \`DateTime?\` | Fecha de eliminación lógica (soft delete) |
| \`anulado_por\` | \`string?\` | ID del usuario que realizó la eliminación lógica |

### Registro de Actividades

Todas las operaciones CRUD en este modelo generan registros de auditoría que incluyen:

- Usuario que realizó la acción
- Tipo de operación (CREAR, ACTUALIZAR, ELIMINAR, etc.)
- Fecha y hora exacta de la operación
- Dirección IP del solicitante
- Datos anteriores y nuevos (para actualizaciones)

### Consulta de Registros

Los registros de auditoría pueden consultarse a través de la API de auditoría con filtros por:

- Rango de fechas
- Usuario
- Tipo de acción
- Entidad afectada` : '❌ Este modelo no incluye campos de auditoría estándar.'}

## Seguridad

Para información detallada sobre permisos, roles y validaciones de negocio, consulte la documentación específica del modelo:

- [Reglas de Negocio](./${model.name.toLowerCase()}/reglas_negocio.md)
- [Seguridad y Permisos](./${model.name.toLowerCase()}/seguridad.md)

Si los enlaces no funcionan, es posible que la documentación específica del modelo aún no se haya completado. Consulte la documentación general del sistema para más información.

## Relaciones con Otros Modelos

${model.relations.length > 0 ? model.relations
  .map(rel => `- **${rel.name}**: ${rel.isArray ? 'Muchos' : 'Uno'} a [${rel.type}](./${rel.type.toLowerCase()}.md) \`${rel.relationName || ''}\``)
  .join('\n') : 'Este modelo no tiene relaciones definidas.'}

## Estado Actual

✅ Documentación generada automáticamente el ${new Date().toISOString()}
`;
}

// Verificar si el modelo tiene campos de auditoría estándar
function hasAuditEnabled(model) {
  const auditFields = [
    'creado_por', 'creado_en',
    'modificado_por', 'modificado_en',
    'anulado_por', 'anulado_en'
  ];
  
  // Verificar que el modelo tenga todos los campos de auditoría estándar
  return auditFields.every(field => 
    model.fields.some(f => f.name === field)
  );
}

// Función principal
async function main() {
  try {
    console.log('🔍 Analizando modelos de Prisma...');
    const models = await getPrismaModels();
    
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    console.log(`📝 Generando documentación para ${models.length} modelos...`);
    
    // Generar documentación para cada modelo
    for (const model of models) {
      const modelName = model.name.toLowerCase();
      const docContent = generateModelDoc(model);
      
      // Crear directorio del modelo si no existe
      const modelDir = path.join(MODEL_DOCS_DIR, modelName);
      if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
      }
      
      // Guardar en _generated
      const outputPath = path.join(OUTPUT_DIR, `${modelName}.md`);
      fs.writeFileSync(outputPath, docContent);
      console.log(`✅ Generado: ${outputPath}`);
      
      // Crear README.md si no existe
      const readmePath = path.join(modelDir, 'README.md');
      if (!fs.existsSync(readmePath)) {
        const readmeContent = `# ${model.name}

## Visión General

Documentación del modelo ${model.name}.

## Documentación Técnica

- [Estructura del Modelo](./_generated/${modelName}.md)

## Reglas de Negocio

*Agregar aquí las reglas de negocio específicas para este modelo.*

## Diagramas

*Agregar aquí diagramas relevantes (ERD, flujos, etc.)*
`;
        fs.writeFileSync(readmePath, readmeContent);
        console.log(`✅ Creado: ${readmePath}`);
      }
    }
    
    // Actualizar el índice de modelos
    updateModelIndex(models);
    
    console.log('\n🎉 Documentación generada exitosamente!');
    console.log(`📂 Directorio de salida: ${path.relative(process.cwd(), OUTPUT_DIR)}`);
  } catch (error) {
    console.error('Error en la generación de documentación:', error);
    process.exit(1);
  }
}

// Actualizar el índice de modelos
function updateModelIndex(models) {
  const indexContent = `# Modelos de Datos

Esta sección contiene la documentación técnica de los modelos de datos utilizados en la aplicación.

> **Nota**: La documentación técnica generada automáticamente se encuentra en la carpeta [\`_generated/\`](./_generated/).
> Para cada modelo, la documentación personalizada se encuentra en su respectiva carpeta.

## Lista de Modelos

${models.map(model => {
    const modelName = model.name.toLowerCase();
    return `- [${model.name}](./${modelName}/) - [Ver documentación generada](./_generated/${modelName}.md)`;
  }).join('\n')}

## Estructura de Carpetas

\`\`\`
docs/modelos/
├── _generated/          # Documentación generada automáticamente
├── usuario/             # Documentación personalizada por modelo
│   ├── README.md        # Página principal del modelo
│   ├── reglas_negocio.md # Reglas de negocio
│   ├── seguridad.md     # Políticas de seguridad
│   ├── flujos/          # Diagramas de flujo
│   └── integraciones/   # Documentación de integraciones
└── ...
\`\`\`

## Cómo Usar

1. Navega a la carpeta del modelo que te interese
2. Consulta la documentación personalizada en el archivo \`README.md\`
3. Para detalles técnicos, consulta la documentación generada en \`_generated/\`

## Regenerar Documentación

Para actualizar la documentación después de cambios en el esquema de la base de datos:

\`\`\`bash
npm run docs:generate
\`\`\`

> **Nota**: La documentación generada automáticamente sobrescribirá los archivos en \`_generated/\`, pero no afectará la documentación personalizada en las carpetas de cada modelo.
`;

  fs.writeFileSync(path.join(MODEL_DOCS_DIR, 'README.md'), indexContent);
  console.log('✅ Índice de modelos actualizado');
}

// Ejecutar el script
main().catch(console.error);
