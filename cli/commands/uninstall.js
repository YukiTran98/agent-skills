import { join } from 'path';
import { rmSync, existsSync } from 'fs';
import { loadRegistry, findSkill, VALID_AGENTS } from '../utils/yaml-parser.js';
import { askAgent, askScope, confirm } from '../utils/interactive.js';
import { getAdapter } from '../adapters/index.js';
import { getRepoRoot } from '../utils/git.js';

async function uninstallOne(name, agentName, scope, repoRoot) {
  const adapter = getAdapter(agentName);
  const installPath = scope === 'local'
    ? adapter.getLocalPath(name, repoRoot)
    : adapter.getGlobalPath(name);
  const installDir = join(installPath, '..');

  if (!existsSync(installPath)) {
    console.log(`  – "${name}" chưa cài ở ${scope} (${agentName}), bỏ qua.`);
    return;
  }

  rmSync(installDir, { recursive: true, force: true });
  console.log(`  ✔ Đã gỡ ${scope} (${agentName}): ${installDir}`);
}

export async function uninstallCommand(name, opts) {
  const skills = loadRegistry();
  const skill = findSkill(skills, name);

  if (!skill) {
    console.error(`✗ Skill "${name}" không tồn tại trong registry.`);
    process.exit(1);
  }

  let agent = opts.agent;
  let scope = opts.global ? 'global' : opts.local ? 'local' : null;

  if (!agent) agent = await askAgent({ allowAll: true });

  const repoRoot = getRepoRoot();
  if (!scope) scope = await askScope(repoRoot, { message: 'Gỡ ở đâu?' });

  const agentsToProcess = agent === 'all' ? VALID_AGENTS : [agent];

  const ok = await confirm(`Gỡ "${name}" khỏi ${scope} (${agent === 'all' ? 'tất cả agents' : agent})?`);
  if (!ok) { console.log('Đã hủy.'); return; }

  for (const a of agentsToProcess) {
    await uninstallOne(name, a, scope, repoRoot);
  }

  console.log();
}
