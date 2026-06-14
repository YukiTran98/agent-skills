export function helpCommand() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║              skill-hub (skh) — Quick Guide           ║
╚══════════════════════════════════════════════════════╝

── Setup ──────────────────────────────────────────────
  skh init                     Setup CLI, lưu config

── Sử dụng ────────────────────────────────────────────
  skh list                     Xem tất cả skills
  skh list --group DE          Filter theo group
  skh list --tag sql           Filter theo tag
  skh list --agent kiro        Filter theo agent
  skh list --installed         Chỉ hiện đã cài

  skh search "sql query"       Fuzzy search skill
  skh install                  Cài skill (interactive)
  skh install --agent claude-code --group DE --global

── Contribute ──────────────────────────────────────────
  skh add                      Tạo skill mới (wizard)
  skh edit <name>              Sửa metadata skill
  skh remove <name>            Xóa skill khỏi registry
  skh rename <old> <new>       Đổi tên skill

── Maintenance ─────────────────────────────────────────
  skh update                   git pull + re-install outdated
  skh validate                 Validate tất cả skills
  skh validate <name>          Validate 1 skill
  skh status                   Xem trạng thái hiện tại
  skh doctor                   Health check môi trường

── Groups ──────────────────────────────────────────────
  GENERAL  git, review, workflow
  DA       data analysis, visualization
  DE       data engineering, sql, spark
  DS       machine learning, mlops

Docs: docs/CONTRIBUTING.md
`);
}
