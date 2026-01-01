const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando procesos y locks...');

try {
  // Matar procesos en puertos 3000 y 3001
  execSync('lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true', { stdio: 'pipe' });
} catch (e) {
  // Ignorar errores si no hay procesos
}

try {
  // Matar procesos de next dev
  execSync('pkill -f "next dev" 2>/dev/null || true', { stdio: 'pipe' });
} catch (e) {
  // Ignorar errores
}

try {
  // Eliminar locks
  const lockPath = path.join(process.cwd(), '.next/dev/lock');
  const devPath = path.join(process.cwd(), '.next/dev');
  
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log('  ✓ Lock eliminado');
  }
  
  if (fs.existsSync(devPath)) {
    // Solo eliminar el directorio dev si existe y está vacío o tiene solo el lock
    try {
      const files = fs.readdirSync(devPath);
      if (files.length === 0 || (files.length === 1 && files[0] === 'lock')) {
        fs.rmSync(devPath, { recursive: true, force: true });
        console.log('  ✓ Directorio .next/dev limpiado');
      }
    } catch (e) {
      // Ignorar errores al leer el directorio
    }
  }
} catch (e) {
  // Ignorar errores
}

console.log('✅ Limpieza completada. Iniciando servidor...\n');

