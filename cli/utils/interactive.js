import { createRequire } from 'module';
import { isInsideGitRepo } from './git.js';
import { VALID_AGENTS } from './yaml-parser.js';

// inquirer is a CommonJS-compatible ESM package — use dynamic import
async function getInquirer() {
  const { default: inquirer } = await import('inquirer');
  return inquirer;
}

const VALID_GROUPS = ['GENERAL', 'DA', 'DE', 'DS'];

export async function askAgent({ allowAll = false } = {}) {
  const { prompt } = await getInquirer();
  const choices = allowAll ? ['all', ...VALID_AGENTS] : VALID_AGENTS;
  const { agent } = await prompt([
    {
      type: 'list',
      name: 'agent',
      message: 'Agent:',
      choices,
    },
  ]);
  return agent;
}

export async function askScope(repoRoot, { message = 'Scope:' } = {}) {
  const { prompt } = await getInquirer();
  const inRepo = isInsideGitRepo();
  const choices = [];

  if (inRepo && repoRoot) {
    choices.push({ name: `Repo hiện tại  (${repoRoot}/.claude/skills/<name>/SKILL.md)`, value: 'local' });
  }
  choices.push({ name: `Global          (~/.claude/skills/<name>/SKILL.md)`, value: 'global' });

  const { scope } = await prompt([
    {
      type: 'list',
      name: 'scope',
      message,
      choices,
    },
  ]);
  return scope;
}

export async function askGroupFilter() {
  const { prompt } = await getInquirer();
  const { groups } = await prompt([
    {
      type: 'checkbox',
      name: 'groups',
      message: 'Group (bỏ trống = tất cả):',
      choices: VALID_GROUPS,
    },
  ]);
  return groups.length ? groups : null;
}

export async function askTagFilter(availableTags) {
  const { prompt } = await getInquirer();
  const { tags } = await prompt([
    {
      type: 'checkbox',
      name: 'tags',
      message: 'Tags (bỏ trống = tất cả):',
      choices: availableTags,
    },
  ]);
  return tags.length ? tags : null;
}

export async function confirm(message) {
  const { prompt } = await getInquirer();
  const { ok } = await prompt([{ type: 'confirm', name: 'ok', message, default: true }]);
  return ok;
}

export async function askSkillMeta(prefill = {}) {
  const { prompt } = await getInquirer();
  return prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Skill name (slug, kebab-case):',
      default: prefill.name,
      validate: (v) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v) || 'Phải là kebab-case',
    },
    {
      type: 'input',
      name: 'display_name',
      message: 'Display name:',
      default: prefill.display_name,
      validate: (v) => v.trim().length > 0 || 'Không được để trống',
    },
    {
      type: 'list',
      name: 'group',
      message: 'Group:',
      choices: VALID_GROUPS,
      default: prefill.group || 'GENERAL',
    },
    {
      type: 'checkbox',
      name: 'tags',
      message: 'Tags:',
      choices: ['git', 'sql', 'python', 'pandas', 'eda', 'ml', 'mlops', 'review', 'workflow', 'performance', 'database', 'spark'],
      default: prefill.tags || [],
      validate: (v) => v.length > 0 || 'Chọn ít nhất 1 tag',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      default: prefill.description,
      validate: (v) => v.trim().length > 0 || 'Không được để trống',
    },
    {
      type: 'checkbox',
      name: 'agents',
      message: 'Agents:',
      choices: VALID_AGENTS,
      default: prefill.agents || VALID_AGENTS,
      validate: (v) => v.length > 0 || 'Chọn ít nhất 1 agent',
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author (github username):',
      default: prefill.author,
      validate: (v) => v.trim().length > 0 || 'Không được để trống',
    },
  ]);
}

export { VALID_GROUPS };
