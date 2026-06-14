#!/usr/bin/env node
import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import Ajv from 'ajv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REGISTRY_PATH = resolve(ROOT, 'skills.yaml');
const SCHEMA_PATH = resolve(ROOT, 'schemas/skill.schema.json');

const VALID_AGENTS = ['claude-code', 'kiro'];

function loadRegistry() {
  return yaml.load(readFileSync(REGISTRY_PATH, 'utf8'));
}

function loadSchema() {
  return JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
}

function validateSkill(entry) {
  const errors = [];
  const prefix = `[${entry.name || 'unknown'}]`;

  // Check 1: required fields
  const required = ['name', 'display_name', 'group', 'tags', 'description', 'version', 'author', 'agents', 'file'];
  for (const field of required) {
    if (!entry[field] || (Array.isArray(entry[field]) && entry[field].length === 0)) {
      errors.push(`${prefix} field '${field}' is required and must not be empty`);
    }
  }

  if (errors.length > 0) return errors; // no point checking further

  // Check 2: JSON Schema validation
  const ajv = new Ajv();
  const schema = loadSchema();
  const validate = ajv.compile(schema);
  if (!validate(entry)) {
    for (const err of validate.errors || []) {
      errors.push(`${prefix} schema: ${err.instancePath} ${err.message}`);
    }
  }

  // Check 3: agents must be in valid list
  for (const agent of entry.agents) {
    if (!VALID_AGENTS.includes(agent)) {
      errors.push(`${prefix} agent "${agent}" not in valid list: ${VALID_AGENTS.join(', ')}`);
    }
  }

  // Check 4: SKILL.md must exist and not be empty
  const skillFilePath = resolve(ROOT, entry.file);
  if (!existsSync(skillFilePath)) {
    errors.push(`${prefix} file "${entry.file}" does not exist`);
  } else if (statSync(skillFilePath).size === 0) {
    errors.push(`${prefix} file "${entry.file}" is empty`);
  }

  // Check 5: docs path (if declared) must exist
  if (entry.docs) {
    const docsPath = resolve(ROOT, entry.docs);
    if (!existsSync(docsPath)) {
      errors.push(`${prefix} docs "${entry.docs}" does not exist`);
    }
  }

  return errors;
}

function run() {
  const args = process.argv.slice(2);
  const isAll = args.includes('--all');
  const skillFlag = args.indexOf('--skill');
  const specificSkill = skillFlag !== -1 ? args[skillFlag + 1] : null;

  const registry = loadRegistry();
  let toValidate = registry;

  if (specificSkill) {
    toValidate = registry.filter((s) => s.name === specificSkill);
    if (toValidate.length === 0) {
      console.error(`✗ Skill "${specificSkill}" not found in registry`);
      process.exit(1);
    }
  }

  let totalErrors = 0;
  let passed = 0;

  for (const entry of toValidate) {
    const errors = validateSkill(entry);
    if (errors.length === 0) {
      console.log(`✓ ${entry.name}`);
      passed++;
    } else {
      for (const err of errors) {
        console.error(`✗ ${err}`);
      }
      totalErrors += errors.length;
    }
  }

  console.log(`\n${passed}/${toValidate.length} passed`);

  if (totalErrors > 0) {
    process.exit(1);
  }
}

run();
