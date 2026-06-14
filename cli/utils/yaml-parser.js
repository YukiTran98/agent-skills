import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import Ajv from 'ajv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = resolve(__dirname, '../../skills.yaml');
const SCHEMA_PATH = resolve(__dirname, '../../schemas/skill.schema.json');

const VALID_AGENTS = ['claude-code', 'kiro'];

function loadSchema() {
  return JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
}

function validateEntry(entry) {
  const ajv = new Ajv();
  const schema = loadSchema();
  const validate = ajv.compile(schema);
  if (!validate(entry)) {
    throw new Error(`Schema validation failed: ${ajv.errorsText(validate.errors)}`);
  }
}

export function loadRegistry() {
  const raw = readFileSync(REGISTRY_PATH, 'utf8');
  const skills = yaml.load(raw);
  if (!Array.isArray(skills)) throw new Error('skills.yaml must be a YAML array');
  return skills;
}

export function saveRegistry(skills) {
  writeFileSync(REGISTRY_PATH, yaml.dump(skills, { lineWidth: 120 }), 'utf8');
}

export function filterSkills(skills, { group, tag, agent } = {}) {
  return skills.filter((s) => {
    if (group && s.group.toUpperCase() !== group.toUpperCase()) return false;
    if (tag && !s.tags.includes(tag)) return false;
    if (agent && !s.agents.includes(agent)) return false;
    return true;
  });
}

export function findSkill(skills, name) {
  return skills.find((s) => s.name === name);
}

export function appendSkill(entry) {
  validateEntry(entry);
  const skills = loadRegistry();
  if (findSkill(skills, entry.name)) {
    throw new Error(`Skill "${entry.name}" already exists`);
  }
  skills.push(entry);
  saveRegistry(skills);
}

export function updateSkill(name, updates) {
  const skills = loadRegistry();
  const idx = skills.findIndex((s) => s.name === name);
  if (idx === -1) throw new Error(`Skill "${name}" not found`);
  const updated = { ...skills[idx], ...updates };
  validateEntry(updated);
  skills[idx] = updated;
  saveRegistry(skills);
}

export function removeSkill(name) {
  const skills = loadRegistry();
  const idx = skills.findIndex((s) => s.name === name);
  if (idx === -1) throw new Error(`Skill "${name}" not found`);
  skills.splice(idx, 1);
  saveRegistry(skills);
}

export { VALID_AGENTS };
