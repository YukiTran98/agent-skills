import Fuse from 'fuse.js';
import { loadRegistry } from '../utils/yaml-parser.js';

export function searchCommand(query) {
  if (!query || !query.trim()) {
    console.error('Usage: skh search "<query>"');
    process.exit(1);
  }

  const skills = loadRegistry();

  const fuse = new Fuse(skills, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'display_name', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'description', weight: 1 },
    ],
    includeScore: true,
    threshold: 0.4,
  });

  const results = fuse.search(query);

  if (results.length === 0) {
    console.log(`Không tìm thấy skill nào khớp với "${query}"`);
    return;
  }

  console.log(`\nKết quả cho "${query}" (${results.length} found):\n`);

  for (const { item: s, score } of results) {
    const matchScore = Math.round((1 - score) * 100);
    const groupBadge = `[${s.group}]`;
    console.log(`  ${s.name.padEnd(30)} ${groupBadge.padEnd(10)} match: ${matchScore}%`);
    console.log(`    ${s.description}`);
    console.log(`    tags: ${s.tags.join(', ')}  |  agents: ${s.agents.join(', ')}`);
    console.log();
  }
}
