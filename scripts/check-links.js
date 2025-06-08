const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const markdownLinkCheck = require('markdown-link-check');

const DOCS_DIR = path.join(__dirname, '../docs');
const CONFIG = {
  ignorePatterns: [
    // Ignorar enlaces que empiecen con #
    { pattern: '^#' },
    // Ignorar enlaces a correos electrónicos
    { pattern: '^mailto:' },
    // Ignorar enlaces a rutas específicas
    { pattern: '^http://localhost' },
    { pattern: '^https://staging' },
  ],
  // Configuración para ignorar ciertos códigos de estado HTTP
  ignoreStatusCode: (statusCode) => {
    // Ignorar errores 403 (Forbidden) y 429 (Too Many Requests)
    return [403, 429].includes(statusCode);
  },
};

// Colores para la salida en consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Estadísticas
const stats = {
  total: 0,
  working: 0,
  broken: 0,
  ignored: 0,
  errors: 0,
  files: 0,
};

// Archivos a ignorar
const IGNORED_FILES = [
  'node_modules',
  '.git',
  '.github',
  '.vscode',
  'dist',
  'build',
  'coverage',
  '*.log',
  '*.tmp',
  '*.swp',
];

// Verificar si un archivo debe ser ignorado
function shouldIgnoreFile(filePath) {
  return IGNORED_FILES.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*'));
      return regex.test(path.basename(filePath));
    }
    return filePath.includes(pattern);
  });
}

// Extraer enlaces de un archivo Markdown
async function extractLinksFromFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const [, text, url] = match;
    // Ignorar enlaces que son anclas internas
    if (!url.startsWith('#')) {
      links.push({
        text: text.trim(),
        url: url.split('#')[0], // Eliminar anclas para la verificación
        file: path.relative(process.cwd(), filePath),
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  return links;
}

// Verificar un enlace individual
async function checkLink(link) {
  return new Promise((resolve) => {
    markdownLinkCheck(link.url, CONFIG, (err, result) => {
      if (err) {
        console.error(`${colors.red}✖ Error verificando enlace:${colors.reset}`, err);
        stats.errors++;
        return resolve({ ...link, status: 'error', error: err });
      }

      const isIgnored = CONFIG.ignorePatterns.some(pattern => 
        typeof pattern === 'object' 
          ? new RegExp(pattern.pattern).test(link.url)
          : new RegExp(pattern).test(link.url)
      );

      if (isIgnored) {
        stats.ignored++;
        return resolve({ ...link, status: 'ignored' });
      }

      if (result.status === 'alive') {
        stats.working++;
        return resolve({ ...link, status: 'ok' });
      } else {
        stats.broken++;
        return resolve({ ...link, status: 'broken', statusCode: result.statusCode });
      }
    });
  });
}

// Procesar un archivo Markdown
async function processMarkdownFile(filePath) {
  if (shouldIgnoreFile(filePath)) return [];

  try {
    const links = await extractLinksFromFile(filePath);
    if (links.length === 0) return [];

    stats.files++;
    stats.total += links.length;
    
    console.log(`\n${colors.blue}🔍 Analizando ${path.relative(process.cwd(), filePath)}${colors.reset} (${links.length} enlaces)`);
    
    const results = [];
    for (const link of links) {
      const result = await checkLink(link);
      results.push(result);
      
      if (result.status === 'ok') {
        console.log(`  ${colors.green}✓${colors.reset} [${result.text}](${result.url})`);
      } else if (result.status === 'ignored') {
        console.log(`  ${colors.yellow}⚠${colors.reset} [${result.text}](${result.url}) ${colors.yellow}(ignorado)${colors.reset}`);
      } else if (result.status === 'broken') {
        console.log(`  ${colors.red}✖${colors.reset} [${result.text}](${result.url}) ${colors.red}(error ${result.statusCode || 'desconocido'})${colors.reset}`);
        console.log(`      En ${result.file}:${result.line}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error procesando ${filePath}:`, error);
    return [];
  }
}

// Buscar archivos Markdown recursivamente
async function findMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let files = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!shouldIgnoreFile(entry.name)) {
        files = files.concat(await findMarkdownFiles(fullPath));
      }
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.markdown')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Función principal
async function main() {
  console.log(`${colors.blue}🔍 Buscando archivos Markdown...${colors.reset}`);
  const files = await findMarkdownFiles(DOCS_DIR);
  
  if (files.length === 0) {
    console.log('No se encontraron archivos Markdown para verificar.');
    return;
  }
  
  console.log(`Se encontraron ${files.length} archivos Markdown para verificar.`);
  
  const allResults = [];
  for (const file of files) {
    const results = await processMarkdownFile(file);
    allResults.push(...results);
  }
  
  // Mostrar resumen
  console.log('\n' + '='.repeat(50));
  console.log('RESUMEN DE VERIFICACIÓN DE ENLACES');
  console.log('='.repeat(50));
  console.log(`📄 Archivos procesados: ${stats.files}`);
  console.log(`🔗 Enlaces totales: ${stats.total}`);
  console.log(`${colors.green}✓ Enlaces funcionando: ${stats.working}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Enlaces ignorados: ${stats.ignored}${colors.reset}`);
  console.log(`${colors.red}✖ Enlaces rotos: ${stats.broken}${colors.reset}`);
  
  if (stats.errors > 0) {
    console.log(`${colors.red}❌ Errores durante la verificación: ${stats.errors}${colors.reset}`);
  }
  
  if (stats.broken > 0 || stats.errors > 0) {
    process.exit(1);
  }
}

// Ejecutar el script
main().catch(console.error);
