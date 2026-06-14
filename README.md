# skill-hub

AI agent skill package manager — lưu trữ, quản lý và cài đặt skill (`.md`) vào bất kỳ repo hoặc globally. Hỗ trợ Claude Code, Kiro.

**5 skills** | Groups: GENERAL · DA · DE · DS

## Prerequisites

- Node.js >= 18 (`node --version` để kiểm tra)
- npm >= 9

## Quick start

```bash
git clone https://github.com/your-org/skill-hub
cd skill-hub
bash setup.sh       # tự động: npm install → npm link → skh init
```

`setup.sh` xử lý toàn bộ: kiểm tra Node version, cài deps, link CLI vào `~/.local/bin` (không cần sudo), lưu config, và hướng dẫn nếu PATH chưa có `~/.local/bin`.

Sau khi xong:

```bash
skh search "sql"
skh install --agent claude-code --group DE
# Claude Code: /sql-optimization
```

> **Manual setup (không dùng script):** xem [docs/manual-setup.md](docs/manual-setup.md)

## Chạy không cần install (dev mode)

```bash
# Sau khi npm install:
node cli/index.js list
node cli/index.js search "sql"
node cli/index.js validate

# Alias tạm trong session:
alias skh="node $(pwd)/cli/index.js"
```

## Commands

| Lệnh | Mô tả |
|---|---|
| `skh init` | Setup CLI globally |
| `skh list [--group] [--tag] [--agent]` | Xem skills |
| `skh search "<query>"` | Fuzzy search |
| `skh install` | Cài skill (interactive) |
| `skh add` | Thêm skill mới (wizard) |
| `skh edit <name>` | Sửa metadata |
| `skh remove <name>` | Xóa skill |
| `skh rename <old> <new>` | Đổi tên |
| `skh update` | Cập nhật từ remote |
| `skh validate [name]` | Validate skill |
| `skh status` | Trạng thái hiện tại |
| `skh doctor` | Health check |

## Skills hiện có

| Name | Group | Tags |
|---|---|---|
| `git-workflow` | GENERAL | git, workflow, branching |
| `code-review` | GENERAL | review, quality, best-practices |
| `eda-starter` | DA | eda, pandas, visualization |
| `sql-optimization` | DE | sql, performance, database |
| `ml-training-checklist` | DS | machine-learning, training, mlops |

## Contribute

Xem [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) và [docs/HOW_TO_ADD_SKILL.md](docs/HOW_TO_ADD_SKILL.md).
