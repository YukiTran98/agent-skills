export function generateSkillMd(meta) {
  const today = new Date().toISOString().split('T')[0];
  return `---
name: ${meta.name}
description: ${meta.description}
group: ${meta.group}
tags: [${meta.tags.join(', ')}]
version: "1.0.0"
author: ${meta.author}
agents: [${meta.agents.join(', ')}]
---

## Mục đích

${meta.description}

## Hướng dẫn sử dụng

<!-- Step by step -->

## Ví dụ

<!-- Ví dụ cụ thể -->

## Hướng dẫn sử dụng với agent

\`\`\`
/${meta.name} — mô tả cách trigger skill này
\`\`\`
`;
}

export function generateChangelogMd(meta) {
  const today = new Date().toISOString().split('T')[0];
  return `# Changelog — ${meta.name}

## [1.0.0] - ${today}

- Initial release
`;
}

export function generateDocsMd(meta) {
  return `# ${meta.display_name}

> Xem nội dung đầy đủ tại \`${meta.file}\`

${meta.description}

**Group:** ${meta.group}
**Tags:** ${meta.tags.join(', ')}
**Agents:** ${meta.agents.join(', ')}
**Author:** ${meta.author}
**Version:** 1.0.0
`;
}
