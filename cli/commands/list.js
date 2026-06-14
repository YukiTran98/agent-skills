import { loadRegistry, filterSkills } from '../utils/yaml-parser.js';
import { existsSync } from 'fs';
import { getAdapter } from '../adapters/index.js';
import { getRepoRoot } from '../utils/git.js';
import { homedir } from 'os';

function isInstalled(skill, agent) {
  try {
    const adapter = getAdapter(agent);
    const repoRoot = getRepoRoot();
    if (repoRoot) {
      const localPath = adapter.getLocalPath(skill.name, repoRoot);
      if (existsSync(localPath)) return 'local';
    }
    const globalPath = adapter.getGlobalPath(skill.name);
    if (existsSync(globalPath)) return 'global';
  } catch {
    // adapter not found
  }
  return null;
}

export function listCommand(opts) {
  const skills = loadRegistry();
  const filtered = filterSkills(skills, {
    group: opts.group,
    tag: opts.tag,
    agent: opts.agent,
  });

  if (filtered.length === 0) {
    console.log('Không tìm thấy skill nào với filter đã chọn.');
    return;
  }

  // Column widths
  const nameW = 30;
  const groupW = 8;
  const tagsW = 30;
  const agentsW = 20;
  const versionW = 8;

  const header = [
    'NAME'.padEnd(nameW),
    'GROUP'.padEnd(groupW),
    'TAGS'.padEnd(tagsW),
    'AGENTS'.padEnd(agentsW),
    'VER'.padEnd(versionW),
  ].join(' ');

  console.log('\n' + header);
  console.log('─'.repeat(header.length));

  for (const skill of filtered) {
    if (opts.installed) {
      const agent = opts.agent || 'claude-code';
      const installStatus = isInstalled(skill, agent);
      if (!installStatus) continue;
    }

    const tags = skill.tags.slice(0, 3).join(', ');
    const agents = skill.agents.join(', ');

    console.log(
      [
        skill.name.padEnd(nameW),
        skill.group.padEnd(groupW),
        tags.padEnd(tagsW),
        agents.padEnd(agentsW),
        skill.version.padEnd(versionW),
      ].join(' ')
    );
  }

  console.log(`\nTotal: ${filtered.length} skill(s)\n`);
}
