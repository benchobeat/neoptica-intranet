const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Imprime un mensaje con tiempo y color
function log(message, color = colors.cyan) {
  const time = new Date().toLocaleTimeString();
  console.log(`${color}[${time}] ${message}${colors.reset}`);
}

// Elimina los archivos js compilados antes de iniciar
function cleanBuild() {
  log('Limpiando directorio build...', colors.yellow);
  
  try {
    if (fs.existsSync(path.join(__dirname, '../build'))) {
      // No eliminamos el directorio completo, solo archivos .js y .js.map
      // para evitar problemas con otros recursos
      log('Build existe, limpiando archivos .js...', colors.yellow);
    }
  } catch (err) {
    log(`Error al limpiar build: ${err.message}`, colors.red);
  }
}

// Mata un proceso si existe
function killProcess(process) {
  return new Promise((resolve) => {
    if (!process || process.killed) {
      return resolve();
    }
    
    process.on('exit', () => resolve());
    process.kill('SIGTERM');
    
    // Forzar cierre después de 3 segundos
    setTimeout(() => {
      try {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      } catch (e) {
        // Ignorar errores
      }
      resolve();
    }, 3000);
  });
}

// Función principal
async function main() {
  let nodemonProcess = null;

  log('🚀 Iniciando entorno de desarrollo...', colors.green);
  cleanBuild();

  // Compilador de TypeScript en modo watch
  log('📦 Iniciando compilador TypeScript en modo watch...', colors.magenta);
  const tscProcess = spawn(
    'npx', 
    ['tsc', '--watch', '--preserveWatchOutput'], 
    { stdio: 'pipe', shell: true }
  );

  let serverStarted = false;

  // Variables para el seguimiento del estado de compilación
  let compilationInProgress = false;
  
  // Manejar salida del compilador
  tscProcess.stdout.on('data', async (data) => {
    const output = data.toString().trim();
    
    if (!output) return;
    
    // Inicialización - Compilación inicial
    if (output.includes('Watching for file changes')) {
      log('✅ Compilación inicial completa', colors.green);
      
      // Esperar un poco antes de iniciar nodemon para asegurar que los archivos estén escritos
      setTimeout(() => {
        if (!serverStarted) {
          startNodemon();
          serverStarted = true;
        } else {
          // Si ya está iniciado, reiniciar para asegurar los últimos cambios
          log('🔄 Reiniciando servidor después de compilación inicial...', colors.yellow);
          restartNodemon();
        }
      }, 1500);
    }
    // Detección de inicio de compilación incremental
    else if (output.includes('File change detected') || output.includes('Starting incremental compilation')) {
      compilationInProgress = true;
      log('🔄 Detectado cambio en archivos - Compilando...', colors.yellow);
    }
    // Detección de fin de compilación incremental
    else if (compilationInProgress && 
             (output.includes('Compilation complete') || 
              output.includes('Found 0 errors') || 
              output.includes('Watching for file changes') ||
              output.includes('Compiled successfully'))) {
      
      compilationInProgress = false;
      log('✅ Compilación incremental completa', colors.green);
      
      // Esperar un tiempo más largo para asegurar que los archivos JS se escriban completamente
      setTimeout(() => {
        if (serverStarted) {
          log('🔄 Reiniciando servidor...', colors.yellow);
          restartNodemon();
        } else {
          startNodemon();
          serverStarted = true;
        }
      }, 2000);
    }
    // Detección de errores
    else if (output.includes('error')) {
      log('❌ Error en la compilación:', colors.red);
      console.log(output);
      // No reiniciamos si hay errores
      compilationInProgress = false;
    } 
    else {
      console.log(`${colors.magenta}[TSC] ${output}${colors.reset}`);
    }
  });

  tscProcess.stderr.on('data', (data) => {
    console.error(`${colors.red}[TSC ERROR] ${data.toString().trim()}${colors.reset}`);
  });

  // Función para iniciar nodemon
  function startNodemon() {
    log('🚀 Iniciando servidor con nodemon...', colors.green);
    nodemonProcess = spawn(
      'npx',
      ['nodemon', '--quiet', '--watch', 'build', 'build/src/index.js'],
      { stdio: 'inherit', shell: true }
    );

    nodemonProcess.on('close', (code) => {
      if (code !== null) {
        log(`Nodemon terminó con código: ${code}`, colors.yellow);
      }
    });
  }

  // Función para liberar el puerto
  async function freePort(port) {
    try {
      const { execSync } = require('child_process');
      // Encontrar el PID del proceso que usa el puerto
      const result = execSync(`netstat -ano | findstr :${port}`).toString().trim();
      
      if (result) {
        const lines = result.split('\n');
        const pids = new Set();
        
        // Extraer todos los PIDs únicos
        lines.forEach(line => {
          const match = line.trim().split(/\s+/);
          if (match.length > 4) {
            pids.add(match[4]);
          }
        });
        
        // Matar cada proceso
        pids.forEach(pid => {
          try {
            log(`🔫 Matando proceso ${pid} que usa el puerto ${port}...`, colors.yellow);
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          } catch (e) {
            // Ignorar errores
          }
        });
        
        // Pequeña pausa para asegurar que el puerto se libere
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (e) {
      // No hay procesos usando el puerto o no se pudo ejecutar el comando
    }
  }

  // Función para reiniciar nodemon
  async function restartNodemon() {
    try {
      log('⏲️ Deteniendo servidor anterior...', colors.yellow);
      await killProcess(nodemonProcess);
      
      // Liberar el puerto
      await freePort(4000);
      
      // Esperar un poco más para asegurar que todo se libere
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Iniciar el nuevo servidor
      log('🚀 Iniciando servidor con los cambios...', colors.green);
      startNodemon();
    } catch (error) {
      log(`❌ Error al reiniciar el servidor: ${error.message}`, colors.red);
    }
  }

  // Manejar salida del proceso
  process.on('SIGINT', async () => {
    log('👋 Deteniendo procesos...', colors.yellow);
    await killProcess(nodemonProcess);
    await killProcess(tscProcess);
    process.exit(0);
  });
}

// Ejecutar script principal
main().catch(err => {
  console.error(`${colors.red}Error fatal: ${err.message}${colors.reset}`);
  process.exit(1);
});
