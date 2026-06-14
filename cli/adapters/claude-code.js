import { join } from 'path';
import { homedir } from 'os';
import { BaseAdapter } from './base.js';

export class ClaudeCodeAdapter extends BaseAdapter {
  constructor() {
    super();
    this.agentName = 'claude-code';
  }

  getLocalPath(skillName, repoRoot) {
    return join(repoRoot, '.claude', 'skills', skillName, 'SKILL.md');
  }

  getGlobalPath(skillName) {
    return join(homedir(), '.claude', 'skills', skillName, 'SKILL.md');
  }
}
