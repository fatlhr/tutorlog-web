#!/bin/bash
# Setup git hooks untuk tutorlog-web
# Jalankan setelah fresh clone: bash scripts/setup-hooks.sh

set -e

HOOK_DIR="$(git rev-parse --git-dir)/hooks"

cat > "$HOOK_DIR/pre-push" << 'HOOK'
#!/bin/bash
protected_branch='main'
current_branch=$(git symbolic-ref HEAD | sed -e 's|^refs/heads/||')

if [ "$current_branch" = "$protected_branch" ]; then
  echo ""
  echo "⛔ DILARANG PUSH KE MAIN!"
  echo ""
  echo "Main branch LOCKED sampai Next.js v2 siap deploy."
  echo "Main = production legal web yang sedang aktif dipakai."
  echo ""
  echo "Push ke develop atau feature branch instead:"
  echo "  git checkout develop"
  echo "  git push origin develop"
  echo ""
  exit 1
fi
HOOK

chmod +x "$HOOK_DIR/pre-push"
echo "✓ Pre-push hook installed (blocks push to main)"
