import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, writeFileSync } from 'fs';
import { loadRegistry, appendSkill } from '../utils/yaml-parser.js';
import { askSkillMeta, confirm } from '../utils/interactive.js';
import { generateSkillMd, generateChangelogMd, generateDocsMd } from '../utils/template.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_ROOT = resolve(__dirname, '../../');

export async function addCommand() {
  const skills = loadRegistry();
  const existingSlugs = new Set(skills.map((s) => s.name));

  const meta = await askSkillMeta();

  if (existingSlugs.has(meta.name)) {
    console.error(`✗ Skill "${meta.name}" đã tồn tại. Dùng "skh edit ${meta.name}" để sửa.`);
    process.exit(1);
  }

  const group = meta.group.toLowerCase();
  const skillDir = join(REGISTRY_ROOT, 'skills', group, meta.name);
  const skillFile = join('skills', group, meta.name, 'SKILL.md');
  const docsFile = join('docs', 'skills', `${meta.name}.md`);

  const entry = {
    name: meta.name,
    display_name: meta.display_name,
    group: meta.group,
    tags: meta.tags,
    description: meta.description,
    version: '1.0.0',
    author: meta.author,
    agents: meta.agents,
    file: skillFile.replace(/\\/g, '/'),
    docs: docsFile.replace(/\\/g, '/'),
  };

  console.log('\nSẽ tạo:');
  console.log(`  ${join(skillDir, 'SKILL.md')}`);
  console.log(`  ${join(skillDir, 'CHANGELOG.md')}`);
  console.log(`  ${join(REGISTRY_ROOT, docsFile)}`);
  console.log('  skills.yaml (append entry)\n');

  const ok = await confirm('Tiếp tục?');
  if (!ok) { console.log('Đã hủy.'); return; }

  mkdirSync(skillDir, { recursive: true });
  mkdirSync(join(REGISTRY_ROOT, 'docs', 'skills'), { recursive: true });

  writeFileSync(join(skillDir, 'SKILL.md'), generateSkillMd({ ...meta, file: entry.file }), 'utf8');
  writeFileSync(join(skillDir, 'CHANGELOG.md'), generateChangelogMd(meta), 'utf8');
  writeFileSync(join(REGISTRY_ROOT, docsFile), generateDocsMd({ ...meta, file: entry.file }), 'utf8');

  appendSkill(entry);

  console.log(`\n✔ Skill "${meta.name}" đã tạo.`);
  console.log(`   → Mở ${join(skillDir, 'SKILL.md')} để viết nội dung.`);
  console.log(`   → Sau khi xong: git add . && git commit -m "feat: add ${meta.name} skill"\n`);
}
