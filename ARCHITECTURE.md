# skill-hub — Architecture

## Tổng quan

`skill-hub` là một **skill package manager** cho AI agents. Cho phép lưu trữ, quản lý và cài đặt các AI skill (file `.md`) vào bất kỳ repo nào hoặc globally, hỗ trợ nhiều agent khác nhau (Claude Code, Kiro, ...).

---

## Stack

| Layer | Tech |
|---|---|
| CLI | Node.js + `commander` |
| Interactive prompts | `inquirer` |
| YAML parsing | `js-yaml` |
| Fuzzy search | `fuse.js` |
| Schema validation | `ajv` |
| Output styling | `chalk` + `ora` |
| CI/CD | GitHub Actions |

---

## 5 Layer kiến trúc

```
┌─────────────────────────────────────────────┐
│              Skills Store                   │
│  skills/general/  skills/da/  skills/de/    │
│  skills/ds/  ... (mỗi skill có SKILL.md     │
│  và CHANGELOG.md riêng)                     │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│         skills.yaml — Metadata Registry     │
│  name, group, tags, version, author,        │
│  agents, file, docs, description            │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│            CLI (skh)  — Node.js             │
│  CRUD: add / edit / remove / rename         │
│  Use:  install / list / search              │
│  Sync: update (git pull)                    │
│  Ops:  init / status / doctor / validate    │
│        help                                 │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│           Agent Adapters                    │
│  claude-code → .claude/commands/            │
│  kiro        → .kiro/steering/              │
│  global      → ~/.skills/                  │
│  custom      → adapter plugin               │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│         CI/CD — GitHub Actions              │
│  PR validator / Metadata check              │
│  Docs completeness / Auto-labeler           │
└─────────────────────────────────────────────┘
```

Git là backbone xuyên suốt: clone để setup, pull để update, PR để contribute.

---

## Cấu trúc thư mục

```
skill-hub/
│
├── skills/
│   ├── general/
│   │   ├── git-workflow/
│   │   │   ├── SKILL.md
│   │   │   └── CHANGELOG.md
│   │   └── code-review/
│   ├── da/
│   ├── de/
│   └── ds/
│
├── skills.yaml                   ← registry trung tâm
│
├── cli/
│   ├── index.js                  ← entrypoint (bin: skh)
│   ├── commands/
│   │   ├── init.js
│   │   ├── add.js
│   │   ├── edit.js
│   │   ├── remove.js
│   │   ├── rename.js
│   │   ├── install.js
│   │   ├── list.js
│   │   ├── search.js
│   │   ├── update.js
│   │   ├── status.js
│   │   ├── doctor.js
│   │   ├── validate.js
│   │   └── help.js
│   ├── adapters/
│   │   ├── base.js               ← interface chung
│   │   ├── claude-code.js
│   │   └── kiro.js
│   └── utils/
│       ├── yaml-parser.js
│       ├── interactive.js        ← inquirer prompts tái sử dụng
│       ├── template.js           ← SKILL.md generator
│       └── git.js
│
├── scripts/
│   └── validate-skill.js         ← dùng cả CI lẫn skh validate
│
├── .github/
│   └── workflows/
│       ├── validate-pr.yml
│       └── pr-labeler.yml
│
├── docs/
│   ├── CONTRIBUTING.md
│   ├── HOW_TO_ADD_SKILL.md
│   └── agents/
│       ├── claude-code.md
│       └── kiro.md
│
└── package.json
```

---

## skills.yaml schema

Mỗi entry trong `skills.yaml`:

```yaml
- name: sql-optimization          # slug, unique, kebab-case
  display_name: SQL Optimization  # tên hiển thị
  group: DE                       # GENERAL | DA | DE | DS | ...
  tags:
    - sql
    - performance
    - database
  description: "Optimize SQL queries for large datasets"
  version: "1.0.0"                # semver, bump khi sửa nội dung
  author: "contributor-name"
  agents:
    - claude-code
    - kiro
  file: skills/de/sql-optimization/SKILL.md
  docs: docs/skills/sql-optimization.md
```

---

## Agent Adapters

Mỗi agent có cấu trúc install path riêng. Adapter đảm nhiệm map từ skill file → đúng path của agent.

| Agent | Local path | Global path |
|---|---|---|
| `claude-code` | `.claude/commands/<name>.md` | `~/.claude/commands/<name>.md` |
| `kiro` | `.kiro/steering/<name>.md` | `~/.kiro/steering/<name>.md` |

`base.js` định nghĩa interface chung:
```js
class BaseAdapter {
  getLocalPath(skillName) {}   // path trong repo hiện tại
  getGlobalPath(skillName) {}  // path global trên máy
  supports(agentName) {}       // check agent này có support không
  copyFile(src, dest) {}       // thực hiện copy
}
```

Để thêm agent mới: tạo file trong `cli/adapters/`, kế thừa `BaseAdapter`, đăng ký vào danh sách agents hợp lệ trong schema.

---

## CLI — Design principles

**Không có flag → hỏi interactive. Có flag → chạy thẳng.**

```
skh install                          → hỏi agent, group/tag, scope
skh install --agent claude-code      → chỉ hỏi group/tag và scope
skh install --agent claude-code --group DE --global  → chạy thẳng
```

**Scope selection khi install:**
```
? Install vào đâu?
  ❯ Repo hiện tại  (./my-project/.claude/commands/)
    Global          (~/.claude/commands/)
```
Nếu không đứng trong git repo → chỉ hiện option Global.

**CRUD không cần sửa YAML tay:**
- `skh add` → wizard → tự sinh file + update `skills.yaml`
- `skh edit <name>` → wizard pre-filled → update `skills.yaml`
- `skh remove <name>` → xóa entry + hỏi xóa file
- `skh rename <old> <new>` → đổi slug + rename folder + update YAML

---

## CI/CD — Validation rules

`scripts/validate-skill.js` kiểm tra khi có PR thêm/sửa skill:

1. File `SKILL.md` tồn tại và không rỗng
2. Có entry tương ứng trong `skills.yaml`
3. Tất cả required fields có giá trị (`name`, `group`, `tags`, `version`, `author`, `agents`, `file`)
4. `agents` chỉ chứa các giá trị trong danh sách hợp lệ
5. `file` path được khai báo phải tồn tại trên disk
6. `docs` path (nếu khai báo) phải tồn tại

Nếu fail → block merge + auto-comment lỗi chi tiết lên PR.

---

## Git là backend duy nhất

Không có remote registry, không có server. Mọi thứ chạy local:

- **Setup:** `git clone` + `skh init`
- **Cập nhật skills mới:** `skh update` = `git pull`
- **Contribute skill:** tạo branch + `skh add` + push PR
- **CI check:** GitHub Actions chạy `validate-skill.js` trên PR
