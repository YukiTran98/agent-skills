# Claude Code — hướng dẫn cài skill

## Install path

| Scope | Path |
|---|---|
| Local (repo) | `.claude/commands/<skill-name>.md` |
| Global | `~/.claude/commands/<skill-name>.md` |

## Cài skill

```bash
skh install --agent claude-code
# hoặc cụ thể hơn:
skh install --agent claude-code --group DE --local
```

## Sử dụng trong Claude Code

Sau khi cài, dùng slash command trong Claude Code:

```
/sql-optimization
/git-workflow
/eda-starter
```

Hoặc mention skill trong chat và Claude sẽ áp dụng skill đó.

## Xem skills đã cài

```bash
skh list --agent claude-code --installed
```
