# Hướng dẫn thêm skill mới

## Step 1 — Tạo branch

```bash
git checkout -b feat/add-sql-optimization
```

## Step 2 — Chạy wizard

```bash
skh add
```

Output ví dụ:
```
? Skill name (slug, kebab-case): sql-optimization
? Display name: SQL Query Optimization
? Group: DE
? Tags: [x] sql  [x] performance  [x] database
? Description: Optimize SQL queries for large datasets
? Agents: [x] claude-code  [x] kiro
? Author: your-github-username

Sẽ tạo:
  skills/de/sql-optimization/SKILL.md
  skills/de/sql-optimization/CHANGELOG.md
  docs/skills/sql-optimization.md
  skills.yaml (append entry)

Tiếp tục? (Y/n) Y

✔ Skill "sql-optimization" đã tạo.
   → Mở skills/de/sql-optimization/SKILL.md để viết nội dung.
```

## Step 3 — Viết nội dung SKILL.md

File được generate với template sẵn:

```markdown
---
name: SQL Query Optimization
group: DE
tags: [sql, performance, database]
version: "1.0.0"
author: your-github-username
agents: [claude-code, kiro]
---

## Mục đích
## Hướng dẫn sử dụng
## Ví dụ
```

Điền nội dung vào các section.

## Step 4 — Validate

```bash
skh validate sql-optimization
```

## Step 5 — Commit & PR

```bash
git add .
git commit -m "feat: add sql-optimization skill"
git push origin feat/add-sql-optimization
```

Mở Pull Request → CI tự động validate và label PR.
