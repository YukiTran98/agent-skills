# skill-hub — Flows

Ba flow chính của repo: setup lần đầu, user sử dụng hằng ngày, và contributor thêm skill.

---

## Flow 1 — Setup lần đầu

Chạy **một lần duy nhất** trên máy mới.

```
git clone https://github.com/org/skill-hub
    │
    ▼
cd skill-hub && skh init
    │
    ├── npm install (tự động)
    ├── npm link (link CLI globally)
    └── Lưu registry path → ~/.skh/config.json
           { "registry": "/Users/name/skill-hub" }
    │
    ▼
skh available từ mọi nơi trên máy
```

Sau bước này, user có thể `cd` vào bất kỳ repo nào và dùng `skh` ngay.

---

## Flow 2 — User sử dụng hằng ngày

### 2a. Install skill vào repo hoặc global

```
cd ~/projects/my-data-project
    │
    ▼
skh install [--agent <agent>] [--group <group>] [--tag <tag>] [--all]
    │
    ├── Không có flag? → inquirer hỏi từng bước:
    │       ? Agent: (claude-code / kiro)
    │       ? Group: [x] DE  [ ] DA  [ ] GENERAL
    │       ? Tags:  [x] sql  [ ] spark
    │
    ▼
? Install vào đâu?
  ❯ Repo hiện tại  (~/projects/my-data-project/.claude/commands/)
    Global          (~/.claude/commands/)

    NOTE: Nếu không đứng trong git repo → chỉ hiện Global
    │
    ▼
Agent adapter xác định output path
    │
    ▼
Copy SKILL.md → target directory
    │
    ▼
✔ Đã cài 3 skills  [sql-optimization, pipeline-design, spark-basics]
```

### 2b. Tìm kiếm skill

```
skh search "sql query"
    │
    ▼
fuse.js fuzzy match trên (name + tags + description) từ skills.yaml
    │
    ▼
Hiển thị kết quả với group badge + tags + agent support
```

### 2c. List skills

```
skh list [--group DE] [--tag sql] [--agent claude-code] [--installed]
    │
    ▼
Load skills.yaml → filter → format output dạng bảng
```

### 2d. Cập nhật skills mới nhất

```
skh update
    │
    ▼
git pull (trong skill-hub registry path từ config.json)
    │
    ▼
So sánh version skill đã cài vs version mới trong YAML
    │
    ├── Có skill outdated?
    │   └── ? Re-install [sql-optimization v1.0 → v1.2]? (Y/n)
    │
    └── Không có gì thay đổi → "Already up to date."
```

---

## Flow 3 — Contributor thêm/sửa skill

### 3a. Thêm skill mới

```
git checkout -b feat/add-sql-optimization
    │
    ▼
skh add
    │
    ▼
Interactive wizard:
    ? Skill name (slug):    sql-optimization
    ? Display name:         SQL Query Optimization
    ? Group:               ❯ DE
    ? Tags (multi-select): [x] sql  [x] performance  [ ] spark
    ? Description:          Optimize SQL queries for large datasets
    ? Agents:              [x] claude-code  [x] kiro
    ? Author:               your-github-username
    │
    ▼
Validate realtime:
    - Slug chưa tồn tại trong skills.yaml? ✓
    - Slug format hợp lệ (kebab-case)? ✓
    │
    ▼
Generate files:
    → skills/de/sql-optimization/SKILL.md    (từ template)
    → skills/de/sql-optimization/CHANGELOG.md
    → docs/skills/sql-optimization.md
    │
    ▼
Tự động append entry vào skills.yaml
    │
    ▼
✔ Done! Mở skills/de/sql-optimization/SKILL.md để viết nội dung.
```

**SKILL.md template được generate:**
```markdown
---
name: SQL Query Optimization
group: DE
tags: [sql, performance]
version: "1.0.0"
author: your-github-username
agents: [claude-code, kiro]
---

## Mục đích

<!-- Mô tả ngắn skill này làm gì -->

## Hướng dẫn sử dụng

<!-- Step by step -->

## Ví dụ

<!-- Ví dụ cụ thể -->
```

### 3b. Sửa metadata skill đã có

```
skh edit sql-optimization
    │
    ▼
Load entry từ skills.yaml → pre-fill vào wizard
    │
    ▼
Interactive wizard (giống skh add, nhưng có sẵn giá trị cũ):
    ? Display name: [SQL Query Optimization] _
    ? Tags: [x] sql  [x] performance  ← thêm [x] database
    ...
    │
    ▼
Confirm: "Cập nhật 1 thay đổi. Tiếp tục? (Y/n)"
    │
    ▼
Update entry trong skills.yaml
```

### 3c. Xóa hoặc đổi tên skill

```
skh remove sql-optimization
    │
    ├── Xóa entry khỏi skills.yaml
    └── ? Xóa file skills/de/sql-optimization/ luôn không? (Y/n)

skh rename sql-optimization sql-query-optimization
    │
    ├── Đổi slug trong skills.yaml
    └── Rename folder skills/de/sql-optimization/ → sql-query-optimization/
```

### 3d. Push PR và CI check

```
git add . && git commit -m "feat: add sql-optimization skill"
git push origin feat/add-sql-optimization
    │
    ▼
Mở Pull Request trên GitHub
    │
    ▼
GitHub Actions: validate-pr.yml chạy tự động
    │
    ├── FAIL:
    │   ├── Block merge
    │   └── Auto-comment lỗi lên PR:
    │         "✗ skills.yaml: thiếu field 'version'"
    │         "✗ docs/skills/sql-optimization.md không tồn tại"
    │
    └── PASS:
        ├── Auto-label PR: [DE] [new-skill]
        └── Ready to review & merge
```

---

## Flow tổng hợp — vòng đời đầy đủ

```
Lần đầu:   git clone + skh init
              │
Dùng:      skh install / search / list
              │
Cập nhật:  skh update  (git pull + re-install nếu cần)
              │
Đóng góp:  skh add → viết SKILL.md → git push → PR → CI → merge
              │
Sửa meta:  skh edit <name> → tự update YAML
              │
Dọn dẹp:  skh remove / skh rename
```

---

## Lệnh diagnostic

```
skh status
  → Agent: claude-code
  → Registry: /Users/name/skill-hub
  → Installed: 12 skills (8 local, 4 global)
  → Install paths: ./.claude/commands/ | ~/.claude/commands/

skh doctor
  → Node.js v20.x ✓
  → skh config exists ✓
  → Registry path exists ✓
  → .claude/commands/ writable ✓

skh validate [<skill-name>]
  → Chạy validate-skill.js thủ công, output màu sắc pass/fail
```
