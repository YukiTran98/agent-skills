# skill-hub — Project Plan

Tổng: **5 phases**, **22 tasks**, **68 subtasks**.
Thực hiện theo thứ tự phase. Trong mỗi phase, tasks có thể làm song song.

Legend: `[ ]` todo · `[x]` done

---

## Phase 1 — Foundation & setup

> Mục tiêu: Repo skeleton hoạt động được, schema YAML đã định nghĩa, skill mẫu đã có.

### T1 · Khởi tạo repo & cấu trúc thư mục
- [ ] Tạo repo GitHub, setup `.gitignore`, `LICENSE`, `README.md` sơ bộ
- [ ] Tạo toàn bộ cây thư mục theo ARCHITECTURE.md: `skills/`, `cli/commands/`, `cli/adapters/`, `cli/utils/`, `docs/agents/`, `scripts/`, `.github/workflows/`
- [ ] Setup `package.json` với `bin: { "skh": "./cli/index.js" }`, `type: "module"`

### T2 · Thiết kế skills.yaml schema
- [ ] Định nghĩa required fields: `name`, `group`, `tags`, `version`, `author`, `agents`, `file`, `docs`, `description`
- [ ] Viết JSON Schema (`schemas/skill.schema.json`) để validate với `ajv`
- [ ] Tạo `skills.yaml` với 2–3 skill dummy làm ví dụ

### T3 · Tạo skill mẫu cho từng group
- [ ] GENERAL: `git-workflow` và `code-review` (mỗi cái có `SKILL.md` + `CHANGELOG.md`)
- [ ] DA: `eda-starter`
- [ ] DE: `sql-optimization`
- [ ] DS: `ml-training-checklist`

### T4 · Setup dependencies & tooling
- [ ] `npm install commander inquirer js-yaml fuse.js chalk ora ajv`
- [ ] Setup `eslint` + `prettier`, thêm `lint` script vào `package.json`

---

## Phase 2 — CLI core

> Mục tiêu: Các lệnh cốt lõi hoạt động — user có thể init, list, search và install skill.

### T5 · cli/index.js — entrypoint
- [ ] Setup `commander` program, đăng ký tất cả subcommands
- [ ] Handle `--version`, `--help` global flags
- [ ] Thêm `#!/usr/bin/env node` shebang, chmod +x

### T6 · cli/utils/yaml-parser.js
- [ ] `loadRegistry()`: đọc `skills.yaml`, parse, validate schema với `ajv`
- [ ] `filterSkills(opts)`: filter theo `group`, `tag`, `agent` (hỗ trợ kết hợp)
- [ ] `appendSkill(entry)`: append entry mới vào `skills.yaml` (dùng cho `add`)
- [ ] `updateSkill(name, entry)`: update entry theo `name` (dùng cho `edit`)
- [ ] `removeSkill(name)`: xóa entry theo `name` (dùng cho `remove`)

### T7 · cli/utils/git.js
- [ ] `isInsideGitRepo()`: kiểm tra CWD có phải git repo không
- [ ] `getRepoRoot()`: tìm root của git repo hiện tại
- [ ] `gitPull(path)`: chạy `git pull` trong directory chỉ định, capture output

### T8 · cli/utils/interactive.js
- [ ] `askAgent()`: inquirer select từ danh sách agents hợp lệ
- [ ] `askScope(repoRoot)`: hỏi local vs global, hide local nếu không có git repo
- [ ] `askGroupFilter()`: checkbox chọn group
- [ ] `askTagFilter(availableTags)`: checkbox chọn tags từ danh sách có trong YAML
- [ ] `confirm(message)`: wrapper confirm Y/n

### T9 · cli/adapters/base.js + adapters
- [ ] `base.js`: abstract class với `getLocalPath()`, `getGlobalPath()`, `supports()`, `copyFile(src, dest)`
- [ ] `claude-code.js`: local → `.claude/commands/<name>.md`, global → `~/.claude/commands/<name>.md`
- [ ] `kiro.js`: local → `.kiro/steering/<name>.md`, global → `~/.kiro/steering/<name>.md`
- [ ] `index.js` (adapter registry): export `getAdapter(agentName)`, validate agent name

### T10 · commands/init.js
- [ ] `npm install` trong skill-hub directory nếu `node_modules` chưa có
- [ ] `npm link` để link CLI globally
- [ ] Lưu `{ registry: <absolute-path> }` vào `~/.skh/config.json`
- [ ] Print hướng dẫn nhanh: các lệnh hay dùng sau khi init

### T11 · commands/list.js
- [ ] Load `skills.yaml`, filter theo `--group`, `--tag`, `--agent`
- [ ] Format output: bảng với columns (name, group, tags, agents, version)
- [ ] Support `--installed` flag: chỉ hiện skills đã cài trong CWD hoặc global

### T12 · commands/search.js
- [ ] Integrate `fuse.js` với keys `['name', 'display_name', 'tags', 'description']`
- [ ] Nhận query string: `skh search "sql query"`
- [ ] Format output: hiển thị match score, group badge, tags, agent support

### T13 · commands/install.js
- [ ] Parse args: `--agent`, `--group`, `--tag`, `--all`, `--local`, `--global`
- [ ] Nếu thiếu args → trigger `interactive.js` để hỏi từng bước
- [ ] Hỏi scope (local/global) nếu không có `--local`/`--global` flag
- [ ] Detect git repo để show/hide option local
- [ ] Với mỗi skill được chọn: dùng adapter `copyFile()`, show spinner per skill
- [ ] Print summary: số skill đã cài, path, danh sách tên

---

## Phase 3 — CRUD & contributor flow

> Mục tiêu: Contributor không cần sửa YAML tay. Toàn bộ lifecycle skill qua CLI.

### T14 · cli/utils/template.js
- [ ] `generateSkillMd(meta)`: tạo nội dung SKILL.md từ metadata với frontmatter + section template
- [ ] `generateChangelogMd(meta)`: tạo `CHANGELOG.md` với version `1.0.0` initial
- [ ] `generateDocsMd(meta)`: tạo docs placeholder tại `docs/skills/<name>.md`

### T15 · commands/add.js
- [ ] Inquirer wizard: `name` (slug), `display_name`, `group`, `tags`, `description`, `agents`, `author`
- [ ] Validate realtime: slug chưa tồn tại trong YAML, format kebab-case hợp lệ
- [ ] Gọi `template.js` để generate 3 files: `SKILL.md`, `CHANGELOG.md`, `docs/<name>.md`
- [ ] Gọi `yaml-parser.appendSkill()` để thêm entry vào `skills.yaml`
- [ ] Print path các file đã tạo và hướng dẫn bước tiếp theo

### T16 · commands/edit.js
- [ ] Load entry hiện tại từ `skills.yaml` theo `name` arg
- [ ] Pre-fill toàn bộ fields vào inquirer wizard (user chỉ sửa field cần)
- [ ] Confirm hiển thị diff thay đổi trước khi ghi: "Sắp cập nhật: tags, description"
- [ ] Gọi `yaml-parser.updateSkill()` để update entry

### T17 · commands/remove.js
- [ ] Load entry từ YAML, xác nhận skill tồn tại
- [ ] Confirm: `? Xóa skill "sql-optimization" khỏi registry? (Y/n)`
- [ ] Gọi `yaml-parser.removeSkill()`
- [ ] Confirm thứ hai: `? Xóa folder skills/de/sql-optimization/ luôn? (Y/n)`
- [ ] Xóa folder nếu user đồng ý

### T18 · commands/rename.js
- [ ] Nhận args: `skh rename <old-name> <new-name>`
- [ ] Validate: `old-name` tồn tại, `new-name` chưa tồn tại, `new-name` là kebab-case
- [ ] Update `name` trong YAML entry + update `file` path
- [ ] Rename folder trên disk: `skills/<group>/<old>` → `skills/<group>/<new>`
- [ ] Confirm trước khi thực hiện

### T19 · commands/update.js
- [ ] Đọc `registry` path từ `~/.skh/config.json`
- [ ] Chạy `git pull` trong registry path, hiển thị output
- [ ] Load YAML mới, so sánh version với danh sách skills đã cài (đọc từ agent paths)
- [ ] List các skill outdated, hỏi `? Re-install outdated skills? (Y/n)`
- [ ] Re-install nếu đồng ý

---

## Phase 4 — CI/CD & validation

> Mục tiêu: Contributor không thể merge PR có skill thiếu/sai thông tin.

### T20 · scripts/validate-skill.js
- [ ] Accept args: `--skill <name>` hoặc `--all` hoặc danh sách files thay đổi từ stdin
- [ ] Check 1: File `SKILL.md` tồn tại và `wc -c > 0`
- [ ] Check 2: Có entry trong `skills.yaml` với đúng `name`
- [ ] Check 3: Tất cả required fields có giá trị (không undefined, không empty string)
- [ ] Check 4: `agents` array chỉ chứa giá trị trong `VALID_AGENTS` constant
- [ ] Check 5: `file` path trong YAML khớp với file thực tế trên disk
- [ ] Check 6: `docs` path (nếu có) tồn tại trên disk
- [ ] Output: exit code 0 nếu pass, exit code 1 nếu fail với error messages rõ ràng
- [ ] Format lỗi: `✗ [skill-name] field 'version' is required`

### T21 · .github/workflows/validate-pr.yml
- [ ] Trigger: `on: pull_request` với `paths: ['skills/**', 'skills.yaml']`
- [ ] Step: detect changed skill files (`git diff --name-only`)
- [ ] Step: chạy `node scripts/validate-skill.js` với danh sách files thay đổi
- [ ] Step: nếu fail → `actions/github-script` post comment lỗi lên PR
- [ ] Block merge bằng required status check

### T22 · .github/workflows/pr-labeler.yml
- [ ] Trigger: `on: pull_request`
- [ ] Detect group từ path thay đổi: `skills/de/**` → label `DE`
- [ ] Detect loại thay đổi: file mới → `new-skill`, sửa `SKILL.md` → `update`, chỉ sửa YAML → `meta`
- [ ] Apply labels tự động

### T23 · commands/validate.js
- [ ] Wrap `scripts/validate-skill.js` cho CLI
- [ ] `skh validate` → validate toàn bộ
- [ ] `skh validate <name>` → validate skill cụ thể
- [ ] Output màu sắc với `chalk`: green pass, red fail, yellow warning

---

## Phase 5 — Polish & docs

> Mục tiêu: Repo production-ready, contributor mới tự onboard được.

### T24 · commands/status.js
- [ ] Đọc config, detect agent đang active
- [ ] Đếm skills đã cài trong local repo (`.claude/commands/`) và global (`~/.claude/commands/`)
- [ ] Hiển thị: agent, registry path, installed count, install paths

### T25 · commands/doctor.js
- [ ] Check Node.js version >= 18
- [ ] Check `~/.skh/config.json` tồn tại và `registry` path valid
- [ ] Check registry path là git repo (`git status` không lỗi)
- [ ] Check agent install path writable (local và global)
- [ ] Output: ✓/✗ mỗi check, gợi ý fix nếu fail

### T26 · commands/help.js
- [ ] Quick guide format đẹp với `chalk`
- [ ] Group lệnh theo category: Setup / Use / CRUD / Maintain
- [ ] Kèm ví dụ 1 dòng cho mỗi lệnh phổ biến
- [ ] Link tới `docs/CONTRIBUTING.md`

### T27 · Docs
- [ ] `README.md`: quick start (3 bước), full command reference, badge tổng số skill
- [ ] `CONTRIBUTING.md`: quy trình đóng góp, link sang `skh add`
- [ ] `HOW_TO_ADD_SKILL.md`: step-by-step với output ví dụ
- [ ] `docs/agents/claude-code.md`: hướng dẫn cài cho Claude Code, path structure
- [ ] `docs/agents/kiro.md`: hướng dẫn cài cho Kiro

### T28 · Testing & polish
- [ ] Test happy path đầy đủ: `init` → `list` → `search` → `install` → `add` → `edit` → `remove` → `update`
- [ ] Test edge cases: không có git repo, agent không hỗ trợ, slug trùng, YAML corrupt
- [ ] Polish output: spinner nhất quán với `ora`, màu sắc nhất quán với `chalk`
- [ ] Đảm bảo tất cả error messages rõ ràng và có action hint

---

## Bảng tóm tắt lệnh

| Lệnh | File | Phase |
|---|---|---|
| `skh init` | `commands/init.js` | 2 |
| `skh list` | `commands/list.js` | 2 |
| `skh search` | `commands/search.js` | 2 |
| `skh install` | `commands/install.js` | 2 |
| `skh add` | `commands/add.js` | 3 |
| `skh edit` | `commands/edit.js` | 3 |
| `skh remove` | `commands/remove.js` | 3 |
| `skh rename` | `commands/rename.js` | 3 |
| `skh update` | `commands/update.js` | 3 |
| `skh validate` | `commands/validate.js` | 4 |
| `skh status` | `commands/status.js` | 5 |
| `skh doctor` | `commands/doctor.js` | 5 |
| `skh help` | `commands/help.js` | 5 |
