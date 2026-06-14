import { readFileSync, existsSync, accessSync, constants } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { homedir } from 'os';
import { getRepoRoot } from '../utils/git.js';
import { getAdapter } from '../adapters/index.js';

const CONFIG_PATH = join(homedir(), '.skh', 'config.json');

function check(label, fn) {
  try {
    const result = fn();
    console.log(`  ✓ ${label}${result ? ': ' + result : ''}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${label}: ${err.message}`);
    return false;
  }
}

function isWritable(path) {
  accessSync(path, constants.W_OK);
}

export function doctorCommand() {
  console.log('\n── skill-hub doctor ──\n');

  check('Node.js >= 18', () => {
    const version = process.version;
    const major = parseInt(version.slice(1));
    if (major < 18) throw new Error(`Node ${version} — upgrade to v18+`);
    return version;
  });

  const configOk = check('~/.skh/config.json exists', () => {
    if (!existsSync(CONFIG_PATH)) throw new Error('run: skh init');
    return CONFIG_PATH;
  });

  let registryPath = null;
  if (configOk) {
    check('registry path valid', () => {
      const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      registryPath = config.registry;
      if (!existsSync(registryPath)) throw new Error(`${registryPath} not found`);
      return registryPath;
    });

    if (registryPath) {
      check('registry is git repo', () => {
        execSync('git status', { cwd: registryPath, stdio: 'ignore' });
      });
    }
  }

  const repoRoot = getRepoRoot();
  const adapter = getAdapter('claude-code');

  if (repoRoot) {
    check('.claude/commands/ writable (local)', () => {
      const dir = join(repoRoot, '.claude', 'commands');
      if (!existsSync(dir)) return 'will be created on install';
      isWritable(dir);
    });
  }

  check('~/.claude/commands/ writable (global)', () => {
    const dir = join(homedir(), '.claude', 'commands');
    if (!existsSync(dir)) return 'will be created on install';
    isWritable(dir);
  });

  console.log();
}
