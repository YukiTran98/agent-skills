# CLAUDE.md — agent-skills (skill-hub)

## Ngôn ngữ
Trả lời bằng tiếng Việt.

## Tổng quan dự án

**skill-hub** — package manager cho AI agent skills. Lưu trữ, quản lý và cài đặt skill file (`.md`) vào bất kỳ repo hoặc globally, hỗ trợ nhiều agent (Claude Code, Kiro).

**CLI binary:** `skh`  
**Config user:** `~/.skh/config.json` → `{ "registry": "<absolute-path-to-skill-hub>" }`

## Stack

| Layer | Tech |
|---|---|
| CLI | Node.js + `commander` |
| Interactive | `inquirer` |
| YAML | `js-yaml` |
| Search | `fuse.js` |
| Validation | `ajv` |
| Output | `chalk` + `ora` |
| CI | GitHub Actions |

## Cấu trúc thư mục

```
skill-hub/
├── skills/
│   ├── general/  da/  de/  ds/    ← mỗi skill: SKILL.md + CHANGELOG.md
├── skills.yaml                    ← registry trung tâm
├── cli/
│   ├── index.js                   ← entrypoint (bin: skh)
│   ├── commands/                  ← 13 lệnh (xem bên dưới)
│   ├── adapters/
│   │   ├── base.js                ← abstract class
│   │   ├── claude-code.js
│   │   └── kiro.js
│   └── utils/
│       ├── yaml-parser.js         ← load/filter/append/update/remove
│       ├── interactive.js         ← inquirer prompts tái sử dụng
│       ├── template.js            ← sinh SKILL.md / CHANGELOG.md / docs
│       └── git.js
├── scripts/
│   └── validate-skill.js          ← dùng cả CLI lẫn CI
├── .github/workflows/
│   ├── validate-pr.yml
│   └── pr-labeler.yml
├── docs/
│   ├── CONTRIBUTING.md
│   ├── HOW_TO_ADD_SKILL.md
│   └── agents/claude-code.md  kiro.md
├── schemas/
│   └── skill.schema.json          ← ajv schema
└── package.json                   ← bin: { "skh": "./cli/index.js" }, type: "module"
```

## skills.yaml schema (mỗi entry)

```yaml
- name: sql-optimization          # slug, unique, kebab-case
  display_name: SQL Optimization
  group: DE                       # GENERAL | DA | DE | DS
  tags: [sql, performance]
  description: "..."
  version: "1.0.0"                # semver
  author: "github-username"
  agents: [claude-code, kiro]
  file: skills/de/sql-optimization/SKILL.md
  docs: docs/skills/sql-optimization.md
```

## Agent Adapters — install paths

| Agent | Local | Global |
|---|---|---|
| `claude-code` | `.claude/skills/<name>/SKILL.md` | `~/.claude/skills/<name>/SKILL.md` |
| `kiro` | `.kiro/skills/<name>/SKILL.md` | `~/.kiro/skills/<name>/SKILL.md` |

## CLI commands

| Lệnh | File | Mô tả |
|---|---|---|
| `skh init` | `commands/init.js` | npm install + npm link + lưu config |
| `skh list` | `commands/list.js` | Liệt kê skills (filter group/tag/agent) |
| `skh search "query"` | `commands/search.js` | Fuzzy search qua name/tags/description |
| `skh install` | `commands/install.js` | Cài skill vào local repo hoặc global |
| `skh add` | `commands/add.js` | Wizard tạo skill mới + update YAML |
| `skh edit <name>` | `commands/edit.js` | Wizard sửa metadata, pre-filled |
| `skh remove <name>` | `commands/remove.js` | Xóa entry YAML + hỏi xóa folder |
| `skh rename <old> <new>` | `commands/rename.js` | Đổi slug + rename folder |
| `skh update` | `commands/update.js` | git pull registry + re-install outdated |
| `skh validate [name]` | `commands/validate.js` | Wrap validate-skill.js cho CLI |
| `skh status` | `commands/status.js` | Hiện agent, registry, installed count |
| `skh doctor` | `commands/doctor.js` | Health check Node/config/paths |
| `skh help` | `commands/help.js` | Quick guide đẹp với chalk |

**Nguyên tắc:** không có flag → hỏi interactive. Có flag → chạy thẳng.

## validate-skill.js — 6 checks

1. `SKILL.md` tồn tại và không rỗng
2. Entry tương ứng trong `skills.yaml`
3. Tất cả required fields có giá trị
4. `agents` chỉ chứa giá trị trong `VALID_AGENTS`
5. `file` path trong YAML khớp file thực trên disk
6. `docs` path (nếu có) tồn tại

Exit code 0 = pass, 1 = fail.

## CI/CD

- `validate-pr.yml`: trigger khi PR đụng `skills/**` hoặc `skills.yaml` → chạy validate → block merge nếu fail + auto-comment lỗi
- `pr-labeler.yml`: auto-label theo group path (`skills/de/**` → label `DE`) và loại thay đổi

## Development workflow

```bash
# Cài dependencies
npm install

# Link CLI globally (chạy một lần)
npm link

# Chạy validate thủ công
node scripts/validate-skill.js --all
node scripts/validate-skill.js --skill sql-optimization

# Thêm skill mới (contributor flow)
git checkout -b feat/add-<skill-name>
skh add        # wizard tự sinh file + update YAML
# Viết nội dung vào SKILL.md
git add . && git commit -m "feat: add <skill-name> skill"
git push origin feat/add-<skill-name>
# Mở PR → CI tự validate
```

## Phases & trạng thái

| Phase | Mục tiêu | Tasks |
|---|---|---|
| 1 | Foundation: repo skeleton, schema, skill mẫu | T1–T4 |
| 2 | CLI core: init, list, search, install | T5–T13 |
| 3 | CRUD: add, edit, remove, rename, update | T14–T19 |
| 4 | CI/CD & validation | T20–T23 |
| 5 | Polish & docs | T24–T28 |

Chi tiết đầy đủ xem [PLAN.md](PLAN.md).
