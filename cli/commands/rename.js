import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { renameSync, existsSync } from 'fs';
import { loadRegistry, findSkill, updateSkill } from '../utils/yaml-parser.js';
import { confirm } from '../utils/interactive.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_ROOT = resolve(__dirname, '../../');

export async function renameCommand(oldName, newName) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(newName)) {
    console.error('✗ new-name phải là kebab-case (e.g. my-skill-name)');
    process.exit(1);
  }

  const skills = loadRegistry();
  const skill = findSkill(skills, oldName);
  if (!skill) { console.error(`✗ "${oldName}" không tồn tại.`); process.exit(1); }
  if (findSkill(skills, newName)) { console.error(`✗ "${newName}" đã tồn tại.`); process.exit(1); }

  const oldSkillDir = resolve(REGISTRY_ROOT, join(skill.file, '..'));
  const newSkillDir = oldSkillDir.replace(/[^/\\]+$/, newName);
  const newFile = skill.file.replace(oldName, newName);
  const newDocs = skill.docs ? skill.docs.replace(oldName, newName) : undefined;

  console.log(`\nSẽ đổi tên: ${oldName} → ${newName}`);
  console.log(`  Folder: ${oldSkillDir} → ${newSkillDir}`);
  console.log(`  skills.yaml: name, file, docs path\n`);

  const ok = await confirm('Tiếp tục?');
  if (!ok) { console.log('Đã hủy.'); return; }

  // Rename folder on disk
  if (existsSync(oldSkillDir)) {
    renameSync(oldSkillDir, newSkillDir);
    console.log(`✔ Renamed folder`);
  }

  // Update YAML
  const updates = { name: newName, file: newFile };
  if (newDocs) updates.docs = newDocs;
  updateSkill(oldName, updates);
  console.log(`✔ Updated skills.yaml\n`);
}
