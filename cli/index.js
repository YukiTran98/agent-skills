#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));

const program = new Command();

program
  .name('skh')
  .description('skill-hub — AI agent skill package manager')
  .version(pkg.version);

// ── Setup ──
program
  .command('init')
  .description('Setup CLI globally, lưu registry config')
  .action(async () => {
    const { initCommand } = await import('./commands/init.js');
    initCommand();
  });

// ── Use ──
program
  .command('list')
  .description('Liệt kê skills')
  .option('-g, --group <group>', 'Filter theo group (GENERAL/DA/DE/DS)')
  .option('-t, --tag <tag>', 'Filter theo tag')
  .option('-a, --agent <agent>', 'Filter theo agent (claude-code/kiro)')
  .option('-i, --installed', 'Chỉ hiện skills đã cài')
  .action(async (opts) => {
    const { listCommand } = await import('./commands/list.js');
    listCommand(opts);
  });

program
  .command('search <query>')
  .description('Fuzzy search skill theo name, tags, description')
  .action(async (query) => {
    const { searchCommand } = await import('./commands/search.js');
    searchCommand(query);
  });

program
  .command('install')
  .description('Cài skill vào repo hoặc global')
  .option('-a, --agent <agent>', 'Agent (claude-code/kiro)')
  .option('-g, --group <group>', 'Group filter')
  .option('-t, --tag <tag>', 'Tag filter')
  .option('-s, --skill <names>', 'Cài skill cụ thể theo tên (nhiều skill: dùng dấu phẩy)')
  .option('--all', 'Cài tất cả skills của agent')
  .option('--local', 'Cài vào repo hiện tại')
  .option('--global', 'Cài global')
  .action(async (opts) => {
    const { installCommand } = await import('./commands/install.js');
    await installCommand(opts);
  });

// ── CRUD ──
program
  .command('add')
  .description('Thêm skill mới (interactive wizard)')
  .action(async () => {
    const { addCommand } = await import('./commands/add.js');
    await addCommand();
  });

program
  .command('edit <name>')
  .description('Sửa metadata skill')
  .action(async (name) => {
    const { editCommand } = await import('./commands/edit.js');
    await editCommand(name);
  });

program
  .command('remove <name>')
  .description('Xóa hoàn toàn skill (registry + source + tất cả installed copies)')
  .action(async (name) => {
    const { removeCommand } = await import('./commands/remove.js');
    await removeCommand(name);
  });

program
  .command('uninstall <name>')
  .description('Gỡ installed copy ở local/global, registry giữ nguyên')
  .option('-a, --agent <agent>', 'Agent (claude-code/kiro)')
  .option('--local', 'Gỡ khỏi repo hiện tại')
  .option('--global', 'Gỡ khỏi global')
  .action(async (name, opts) => {
    const { uninstallCommand } = await import('./commands/uninstall.js');
    await uninstallCommand(name, opts);
  });

program
  .command('rename <old-name> <new-name>')
  .description('Đổi tên skill (slug + folder)')
  .action(async (oldName, newName) => {
    const { renameCommand } = await import('./commands/rename.js');
    await renameCommand(oldName, newName);
  });

// ── Maintenance ──
program
  .command('update')
  .description('git pull registry + re-install outdated skills')
  .action(async () => {
    const { updateCommand } = await import('./commands/update.js');
    await updateCommand();
  });

program
  .command('validate [name]')
  .description('Validate skill(s). Không có arg = validate tất cả')
  .action(async (name) => {
    const { validateCommand } = await import('./commands/validate.js');
    validateCommand(name);
  });

program
  .command('status [name]')
  .description('Tổng quan skill-hub, hoặc xem skill cụ thể đã cài ở đâu')
  .action(async (name) => {
    const { statusCommand } = await import('./commands/status.js');
    statusCommand(name);
  });

program
  .command('doctor')
  .description('Health check môi trường')
  .action(async () => {
    const { doctorCommand } = await import('./commands/doctor.js');
    doctorCommand();
  });

program
  .command('help-guide')
  .description('Quick guide tất cả lệnh')
  .action(async () => {
    const { helpCommand } = await import('./commands/help.js');
    helpCommand();
  });

program.parse(process.argv);
