#!/usr/bin/env bash
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_BIN="$HOME/.local/bin"

echo "=== skill-hub setup ==="
echo ""

# 1. Node version check
NODE_MAJOR=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 18 ]; then
  echo "✗ Node.js >= 18 required. Current: $(node --version 2>/dev/null || echo 'not found')"
  echo "  Install: https://nodejs.org"
  exit 1
fi
echo "✓ Node.js $(node --version)"

# 2. npm install
echo ""
echo "Installing dependencies..."
npm install --prefix "$REPO_DIR"
echo "✓ Dependencies installed"

# 3. Link CLI — user-local (no sudo)
echo ""
echo "Linking skh CLI to $LOCAL_BIN ..."
mkdir -p "$LOCAL_BIN"
npm config set prefix "$HOME/.local"
cd "$REPO_DIR" && npm link
echo "✓ skh linked → $LOCAL_BIN/skh"

# 4. PATH check
if ! echo "$PATH" | grep -q "$LOCAL_BIN"; then
  echo ""
  echo "⚠ $LOCAL_BIN chưa có trong PATH."
  echo "  Thêm dòng sau vào ~/.bashrc hoặc ~/.zshrc:"
  echo ""
  echo "    export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo ""
  echo "  Sau đó chạy: source ~/.bashrc"
  echo "  Hoặc trong session này: export PATH=\"\$HOME/.local/bin:\$PATH\""
else
  echo "✓ PATH OK"
fi

# 5. skh init
echo ""
skh init

echo ""
echo "=== Done! Thử ngay: ==="
echo "  skh list"
echo "  skh search \"sql\""
echo "  skh install"
