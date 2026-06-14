import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { getRepoRoot } from '../utils/git.js';
import { loadRegistry, findSkill, VALID_AGENTS } from '../utils/yaml-parser.js';
import { getAdapter } from '../adapters/index.js';

const CONFIG_PATH = join(homedir(), '.skh', 'config.json');

function checkInstallLocations(skillName, repoRoot) {
  const results = [];
  for (const agentName of VALID_AGENTS) {
    try {
      const adapter = getAdapter(agentName);
      if (repoRoot) {
        const localPath = adapter.getLocalPath(skillName, repoRoot);
        results.push({ agent: agentName, scope: 'local', path: localPath, installed: existsSync(localPath) });
      }
      const globalPath = adapter.getGlobalPath(skillName);
      results.push({ agent: agentName, scope: 'global', path: globalPath, installed: existsSync(globalPath) });
    } catch {
      // skip invalid adapter
    }
  }
  return results;
}

export function statusCommand(skillName) {
  const config = existsSync(CONFIG_PATH)
    ? JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
    : null;

  const repoRoot = getRepoRoot();

  // skh status <name> — xem 1 skill cụ thể
  if (skillName) {
    const skills = loadRegistry();
    const skill = findSkill(skills, skillName);

    if (!skill) {
      console.error(`✗ Skill "${skillName}" không tồn tại trong registry.`);
      process.exit(1);
    }

    console.log(`\n── ${skill.name} (${skill.display_name}) ──\n`);
    console.log(`  Group:    ${skill.group}`);
    console.log(`  Tags:     ${skill.tags.join(', ')}`);
    console.log(`  Agents:   ${skill.agents.join(', ')}`);
    console.log(`  Version:  ${skill.version}`);
    console.log(`\n  Install locations:\n`);

    const locations = checkInstallLocations(skillName, repoRoot);
    for (const loc of locations) {
      const icon = loc.installed ? '✔' : '✗';
      const status = loc.installed ? 'installed' : 'not installed';
      console.log(`    ${icon}  [${loc.agent}] ${loc.scope.padEnd(6)}  ${loc.path}  (${status})`);
    }

    console.log();
    return;
  }

  // skh status — tổng quan
  console.log('\n── skill-hub status ──\n');
  console.log(`  Registry:  ${config ? config.registry : 'NOT CONFIGURED (run: skh init)'}`);
  console.log(`  Repo:      ${repoRoot || '(không phải git repo)'}`);

  if (config) {
    const skills = loadRegistry();

    for (const agentName of VALID_AGENTS) {
      let localCount = 0;
      let globalCount = 0;
      try {
        const adapter = getAdapter(agentName);
        for (const skill of skills) {
          if (repoRoot && existsSync(adapter.getLocalPath(skill.name, repoRoot))) localCount++;
          if (existsSync(adapter.getGlobalPath(skill.name))) globalCount++;
        }
      } catch { /* skip */ }
      console.log(`  [${agentName}]  ${localCount} local, ${globalCount} global installed`);
    }
  }

  console.log();
}
