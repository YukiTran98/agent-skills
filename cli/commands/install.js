import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadRegistry, filterSkills } from '../utils/yaml-parser.js';
import { getAdapter } from '../adapters/index.js';
import { getRepoRoot, isInsideGitRepo } from '../utils/git.js';
import { askAgent, askGroupFilter, askTagFilter, askScope, confirm } from '../utils/interactive.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_ROOT = resolve(__dirname, '../../');

function resolveSkillFile(relPath) {
  return resolve(REGISTRY_ROOT, relPath);
}

export async function installCommand(opts) {
  let agent = opts.agent;
  let groups = opts.group ? [opts.group] : null;
  let tags = opts.tag ? [opts.tag] : null;
  let scope = opts.global ? 'global' : opts.local ? 'local' : null;
  const skillNames = opts.skill ? opts.skill.split(',').map((s) => s.trim()) : null;

  // Interactive prompts for missing opts
  if (!agent) agent = await askAgent();
  if (!skillNames && !groups && !tags && !opts.all) {
    groups = await askGroupFilter();
    if (!groups) tags = await askTagFilter([...new Set(loadRegistry().flatMap((s) => s.tags))]);
  }
  if (!scope) {
    const repoRoot = getRepoRoot();
    scope = await askScope(repoRoot);
  }

  const adapter = getAdapter(agent);
  const repoRoot = getRepoRoot();

  const skills = loadRegistry();

  // Filter by agent support first
  let candidates = skills.filter((s) => s.agents.includes(agent));

  if (skillNames) {
    // --skill flag takes priority over group/tag
    const notFound = skillNames.filter((n) => !skills.find((s) => s.name === n));
    if (notFound.length) {
      console.error(`✗ Skill không tìm thấy: ${notFound.join(', ')}`);
      process.exit(1);
    }
    candidates = candidates.filter((s) => skillNames.includes(s.name));
  } else if (!opts.all) {
    if (groups) candidates = candidates.filter((s) => groups.includes(s.group));
    if (tags) candidates = candidates.filter((s) => tags.some((t) => s.tags.includes(t)));
  }

  if (candidates.length === 0) {
    console.log('Không có skill nào khớp với filter đã chọn.');
    return;
  }

  console.log(`\nSẽ cài ${candidates.length} skill(s):`);
  candidates.forEach((s) => console.log(`  - ${s.name}  [${s.group}]`));

  const ok = await confirm('\nTiếp tục?');
  if (!ok) { console.log('Đã hủy.'); return; }

  const installed = [];
  const failed = [];

  for (const skill of candidates) {
    try {
      const src = resolveSkillFile(skill.file);
      const dest = scope === 'local'
        ? adapter.getLocalPath(skill.name, repoRoot)
        : adapter.getGlobalPath(skill.name);
      adapter.copyFile(src, dest);
      installed.push({ name: skill.name, dest });
      process.stdout.write(`  ✔ ${skill.name} → ${dest}\n`);
    } catch (err) {
      failed.push({ name: skill.name, error: err.message });
      process.stdout.write(`  ✗ ${skill.name}: ${err.message}\n`);
    }
  }

  console.log(`\n✔ Đã cài ${installed.length} skill(s)` + (failed.length ? `, ${failed.length} lỗi` : '') + '\n');
}
