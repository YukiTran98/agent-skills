---
name: git-workflow
description: Git branching strategies, commit conventions, merge vs rebase, conflict resolution
group: GENERAL
tags: [git, workflow, branching]
version: "1.0.0"
author: loitv
agents: [claude-code, kiro]
---

## Mục đích

Hướng dẫn Git workflow chuẩn cho team — branching strategy, commit convention, merge vs rebase, và conflict resolution.

## Branching Strategy

```
main          ← production, always stable
develop       ← integration branch
feat/<name>   ← feature branch (từ develop)
fix/<name>    ← hotfix branch (từ main hoặc develop)
chore/<name>  ← tooling, deps, config
```

**Quy tắc:**
- Không commit thẳng vào `main` hoặc `develop`
- Branch name: lowercase, kebab-case
- Xóa branch sau khi merge

## Commit Convention (Conventional Commits)

```
<type>(<scope>): <description>

[body — optional]
[footer — optional, e.g. BREAKING CHANGE:]
```

**Types:** `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `perf`

**Ví dụ:**
```
feat(auth): add JWT refresh token rotation
fix(api): handle null response from payment gateway
chore(deps): upgrade pandas to 2.2.0
```

## Merge vs Rebase

| Tình huống | Dùng |
|---|---|
| Merge feature → develop | `git merge --no-ff` (giữ history rõ) |
| Sync develop → feat branch | `git rebase develop` (history thẳng) |
| Hotfix → main | `git merge --no-ff` + tag version |

**Không rebase branch đã push public** — sẽ rewrite history cho người khác.

## Conflict Resolution

```bash
# 1. Fetch latest
git fetch origin

# 2. Rebase lên develop
git rebase origin/develop

# 3. Fix conflict trong từng file, sau đó:
git add <file>
git rebase --continue

# 4. Nếu muốn abort:
git rebase --abort
```

## PR Checklist

- [ ] Branch name đúng convention
- [ ] Commits squash/clean nếu cần
- [ ] Mô tả PR rõ: what + why
- [ ] Đã self-review diff trước khi request review
- [ ] CI pass

## Hướng dẫn sử dụng với Claude Code

```
/git-workflow — Claude sẽ hỏi scenario cụ thể và hướng dẫn step-by-step
```
