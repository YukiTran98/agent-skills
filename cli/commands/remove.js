import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { rmSync, existsSync } from 'fs';
import { loadRegistry, findSkill, removeSkill } from '../utils/yaml-parser.js';
import { confirm } from '../utils/interactive.js';
import { VALID_AGENTS } from '../utils/yaml-parser.js';
import { getAdapter } from '../adapters/index.js';
import { getRepoRoot } from '../utils/git.js';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_ROOT = resolve(__dirname, '../../');

export async function removeCommand(name) {
  const skills = loadRegistry();
  const skill = findSkill(skills, name);

  if (!skill) {
    console.error(`✗ Skill "${name}" không tồn tại.`);
    process.exit(1);
  }

  const ok = await confirm(`Xóa hoàn toàn skill "${name}"? (registry + source + tất cả installed copies)`);
  if (!ok) { console.log('Đã hủy.'); return; }

  // 1. Xóa khỏi registry
  removeSkill(name);
  console.log(`✔ Đã xóa "${name}" khỏi skills.yaml`);

  // 2. Xóa source folder
  const skillFilePath = resolve(REGISTRY_ROOT, skill.file);
  const skillDir = join(skillFilePath, '..');
  if (existsSync(skillDir)) {
    rmSync(skillDir, { recursive: true, force: true });
    console.log(`✔ Đã xóa source folder ${skillDir}`);
  }

  // 3. Xóa tất cả installed copies (local + global, tất cả agents)
  const repoRoot = getRepoRoot();
  const agentsToCheck = skill.agents?.length ? skill.agents : VALID_AGENTS;

  for (const agentName of agentsToCheck) {
    try {
      const adapter = getAdapter(agentName);
      const paths = [];
      if (repoRoot) paths.push({ label: `local (${agentName})`, path: adapter.getLocalPath(name, repoRoot) });
      paths.push({ label: `global (${agentName})`, path: adapter.getGlobalPath(name) });

      for (const { label, path } of paths) {
        const skillInstallDir = join(path, '..');
        if (existsSync(skillInstallDir) && existsSync(path)) {
          rmSync(skillInstallDir, { recursive: true, force: true });
          console.log(`✔ Đã uninstall ${label}: ${skillInstallDir}`);
        }
      }
    } catch {
      // adapter không hợp lệ — bỏ qua
    }
  }

  console.log(`\n✔ Đã xóa hoàn toàn skill "${name}"\n`);
}
