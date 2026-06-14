import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VALIDATE_SCRIPT = resolve(__dirname, '../../scripts/validate-skill.js');

export function validateCommand(skillName) {
  const args = skillName ? `--skill ${skillName}` : '--all';
  try {
    execSync(`node ${VALIDATE_SCRIPT} ${args}`, { stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
}
