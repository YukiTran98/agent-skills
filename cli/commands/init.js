import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_ROOT = resolve(__dirname, '../../');
const CONFIG_DIR = join(homedir(), '.skh');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

export function initCommand() {
  console.log('Initializing skill-hub...\n');

  // npm install
  const nodeModules = join(REGISTRY_ROOT, 'node_modules');
  if (!existsSync(nodeModules)) {
    console.log('Installing dependencies...');
    execSync('npm install', { cwd: REGISTRY_ROOT, stdio: 'inherit' });
  } else {
    console.log('✓ Dependencies already installed');
  }

  // npm link
  console.log('Linking CLI globally (may need sudo)...');
  try {
    execSync('npm link', { cwd: REGISTRY_ROOT, stdio: 'inherit' });
    console.log('✓ skh linked globally');
  } catch {
    console.warn('⚠ npm link failed — try: sudo npm link');
  }

  // Save config
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify({ registry: REGISTRY_ROOT }, null, 2), 'utf8');
  console.log(`✓ Config saved → ${CONFIG_PATH}`);

  console.log('\n✔ skill-hub ready!\n');
  console.log('Quick start:');
  console.log('  skh list                     — xem tất cả skills');
  console.log('  skh search "sql"             — tìm skill');
  console.log('  skh install                  — cài skill vào repo/global');
  console.log('  skh add                      — thêm skill mới');
  console.log('  skh help                     — xem tất cả lệnh\n');
}
