import { loadRegistry, updateSkill, findSkill } from '../utils/yaml-parser.js';
import { askSkillMeta, confirm } from '../utils/interactive.js';

export async function editCommand(name) {
  const skills = loadRegistry();
  const existing = findSkill(skills, name);

  if (!existing) {
    console.error(`✗ Skill "${name}" không tồn tại.`);
    process.exit(1);
  }

  console.log(`\nSửa skill: ${name}\n`);
  const meta = await askSkillMeta(existing);

  // Detect changes
  const changedFields = [];
  for (const key of ['display_name', 'group', 'tags', 'description', 'agents', 'author']) {
    const oldVal = JSON.stringify(existing[key]);
    const newVal = JSON.stringify(meta[key]);
    if (oldVal !== newVal) changedFields.push(key);
  }

  if (changedFields.length === 0) {
    console.log('Không có thay đổi nào.');
    return;
  }

  console.log(`\nSắp cập nhật: ${changedFields.join(', ')}`);
  const ok = await confirm('Tiếp tục?');
  if (!ok) { console.log('Đã hủy.'); return; }

  updateSkill(name, meta);
  console.log(`\n✔ Skill "${name}" đã cập nhật.\n`);
}
