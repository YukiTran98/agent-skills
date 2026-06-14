import { ClaudeCodeAdapter } from './claude-code.js';
import { KiroAdapter } from './kiro.js';

const adapters = {
  'claude-code': new ClaudeCodeAdapter(),
  kiro: new KiroAdapter(),
};

export function getAdapter(agentName) {
  const adapter = adapters[agentName];
  if (!adapter) throw new Error(`Unknown agent: "${agentName}". Valid: ${Object.keys(adapters).join(', ')}`);
  return adapter;
}

export const VALID_AGENTS = Object.keys(adapters);
