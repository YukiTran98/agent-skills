# Contributing — skill-hub

## Quy trình đóng góp skill mới

```bash
git checkout -b feat/add-<skill-name>
skh add                              # wizard tự sinh file + update YAML
# Viết nội dung vào SKILL.md
skh validate <skill-name>            # kiểm tra trước khi commit
git add . && git commit -m "feat: add <skill-name> skill"
git push origin feat/add-<skill-name>
# Mở Pull Request → CI tự validate và label
```

## Sửa skill đã có

```bash
skh edit <name>      # wizard pre-filled, chỉ sửa field cần
# hoặc sửa trực tiếp SKILL.md, sau đó bump version trong YAML
skh validate <name>
```

## Rules

1. Slug phải là kebab-case: `sql-optimization`, không phải `SQLOptimization`
2. Version bump (semver) khi sửa nội dung SKILL.md
3. `agents` chỉ chứa: `claude-code`, `kiro`
4. `docs` path phải tồn tại nếu khai báo
5. SKILL.md không được rỗng

Xem thêm: [HOW_TO_ADD_SKILL.md](HOW_TO_ADD_SKILL.md)
