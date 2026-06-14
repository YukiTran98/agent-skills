import { join } from 'path';
import { homedir } from 'os';
import { BaseAdapter } from './base.js';

export class KiroAdapter extends BaseAdapter {
  constructor() {
    super();
    this.agentName = 'kiro';
  }

  getLocalPath(skillName, repoRoot) {
    return join(repoRoot, '.kiro', 'skills', skillName, 'SKILL.md');
  }

  getGlobalPath(skillName) {
    return join(homedir(), '.kiro', 'skills', skillName, 'SKILL.md');
  }
}
