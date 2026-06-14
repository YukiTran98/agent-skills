import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { loadRegistry } from '../utils/yaml-parser.js';
import { gitPull } from '../utils/git.js';
import { getAdapter } from '../adapters/index.js';
import { existsSync } from 'fs';
import { confirm } from '../utils/interactive.js';
import yaml from 'js-yaml';

const CONFIG_PATH = join(homedir(), '.skh', 'config.json');

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error('Config không tìm thấy. Chạy: skh init');
  }
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
}

function getInstalledVersion(skill, agentName) {
  try {
    const adapter = getAdapter(agentName);
    const globalPath = adapter.getGlobalPath(skill.name);
    if (!existsSync(globalPath)) return null;

    const content = readFileSync(globalPath, 'utf8');
    const match = content.match(/^version:\s*"?([^"\n]+)"?/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

export async function updateCommand() {
  const config = loadConfig();
  const registryPath = config.registry;

  console.log(`Pulling from registry: ${registryPath}...`);
  const { stdout, stderr } = await gitPull(registryPath);
  console.log(stdout || 'Already up to date.');
  if (stderr) console.warn(stderr);

  // Load new registry after pull
  const skills = loadRegistry();
  const agents = ['claude-code', 'kiro'];
  const outdated = [];

  for (const skill of skills) {
    for (const agent of agents) {
      const installedVer = getInstalledVersion(skill, agent);
      if (installedVer && installedVer !== skill.version) {
        outdated.push({ skill, agent, installedVer });
      }
    }
  }

  if (outdated.length === 0) {
    console.log('\n✔ Tất cả skills đã up to date.\n');
    return;
  }

  console.log('\nSkills cần cập nhật:');
  for (const { skill, agent, installedVer } of outdated) {
    console.log(`  ${skill.name} (${agent}): ${installedVer} → ${skill.version}`);
  }

  const ok = await confirm('\nRe-install các skill outdated?');
  if (!ok) { console.log('Bỏ qua.'); return; }

  for (const { skill, agent } of outdated) {
    try {
      const adapter = getAdapter(agent);
      const src = join(registryPath, skill.file);
      const dest = adapter.getGlobalPath(skill.name);
      adapter.copyFile(src, dest);
      console.log(`  ✔ ${skill.name} (${agent}) updated`);
    } catch (err) {
      console.error(`  ✗ ${skill.name}: ${err.message}`);
    }
  }
  console.log();
}
