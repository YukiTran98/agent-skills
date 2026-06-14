import { copyFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export class BaseAdapter {
  getLocalPath(_skillName) {
    throw new Error('getLocalPath() not implemented');
  }

  getGlobalPath(_skillName) {
    throw new Error('getGlobalPath() not implemented');
  }

  supports(agentName) {
    return agentName === this.agentName;
  }

  copyFile(src, dest) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
  }
}
