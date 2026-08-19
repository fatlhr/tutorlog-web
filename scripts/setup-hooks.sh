#!/bin/bash
# Setup git hooks untuk tutorlog-web
# Jalankan setelah fresh clone: bash scripts/setup-hooks.sh

set -e

HOOK_DIR="$(git rev-parse --git-dir)/hooks"

cat > "$HOOK_DIR/pre-push" << 'HOOK'
#!/bin/bash
# Block push langsung ke main. main menerima perubahan lewat PR dari develop.
#
# Catatan: hook ini lokal dan bisa dilewati dengan --no-verify. Pagar yang
# sebenarnya adalah branch ruleset di GitHub. Hook ini cuma rem cepat supaya
# kesalahan ketahuan sebelum kena jaringan.

protected_ref='refs/heads/main'
blocked=0

# pre-push menerima daftar ref lewat stdin:
#   <local ref> <local sha> <remote ref> <remote sha>
# Yang dicek ref tujuan, bukan branch aktif — supaya `git push origin develop:main`
# dan `git push origin HEAD:main` ikut ketahan, bukan cuma push saat sedang di main.
while read -r _local_ref _local_sha remote_ref _remote_sha; do
  if [ "$remote_ref" = "$protected_ref" ]; then
    blocked=1
  fi
done

if [ "$blocked" = "1" ]; then
  echo ""
  echo "⛔ Push langsung ke main ditolak."
  echo ""
  echo "main = production (tutorlog.id). Perubahan masuk lewat PR dari develop,"
  echo "supaya ada diff yang bisa direview dan jejak apa yang naik ke production."
  echo ""
  echo "Alur rilis:"
  echo "  git checkout develop && git push origin develop"
  echo "  gh pr create --base main --head develop"
  echo ""
  echo "Darurat (hotfix production yang gak bisa nunggu): git push --no-verify"
  echo ""
  exit 1
fi

exit 0
HOOK

chmod +x "$HOOK_DIR/pre-push"
echo "✓ Pre-push hook installed (blocks direct push to main)"
