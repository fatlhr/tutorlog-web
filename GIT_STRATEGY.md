# Git Strategy — Develop + Feature Branches

## Branch Model

```
main ──────────────────────────────────────────────────────►
│  (production — tutorlog.id, live di Cloudflare Workers)    │
│  ▲                                                         │
│  └── PR rilis ──────────────────────────────────┐          │
│                                                 │          │
└── develop ─────────────────────────────────────────────────►
    │  (integrasi — semua fitur mendarat di sini dulu)       │
    │                                                        │
    ├── feat/m1-foundation ───┬──► PR ──► merge ──► delete  │
    │                         │                              │
    ├── feat/m2-auth ─────────┤                              │
    │                         │                              │
    └── fix/login-bug ────────┘                              │
```

## Status main

`main` sudah **tidak lagi locked**. Kunci lama berlaku selama migrasi Next.js v2 belum
deploy; sejak `tutorlog.id` live di Cloudflare Workers (lihat TASKS.md 8.4), syarat itu
sudah terpenuhi.

Yang berlaku sekarang: `main` = production. Apapun yang masuk ke `main` langsung jadi
yang dilihat user, jadi masuknya lewat PR dari `develop`, bukan push langsung.

| Aturan | Detail |
|--------|--------|
| **`main`** | Production (`tutorlog.id`). Hanya menerima merge lewat PR dari `develop`. Tidak ada push langsung. |
| **`develop`** | Branch integrasi. Semua feature branch start dari sini. |
| **Feature branch** | `feat/<milestone>` atau `feat/<deskripsi>` — hidup max 2 hari, start dari `develop` |
| **Fix branch** | `fix/<deskripsi>` — langsung dari `develop`, cepat merge |
| **Commit ke `develop` langsung** | Hanya untuk docs, config, typo fix — tanpa PR |
| **PR wajib** | Semua perubahan kode. Self-review dulu sebelum merge |
| **Squash merge** | Semua PR di-squash ke 1 commit di `develop` |
| **Delete branch** | Hapus setelah merge |
| **Rilis ke `main`** | PR `develop` → `main`. Isinya commit yang sudah direview waktu masuk `develop`, jadi PR ini fungsinya checkpoint rilis: lihat diff yang akan naik, catat verifikasi, baru merge. |

### Kenapa PR untuk rilis, padahal solo

Bukan soal nunggu approval orang lain. Tiga alasan praktis:

1. **Jeda yang disengaja** sebelum sesuatu jadi live.
2. **Diff yang kebaca** — kelihatan persis apa yang naik, bukan asumsi.
3. **Jejak rilis** — waktu ada yang rusak, "kapan ini naik?" kejawab dari daftar PR.

## Commit Convention

```
<type>: <description>
```
| Type | Penggunaan |
|------|-----------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `refactor` | Restruktur kode tanpa ubah behavior |
| `style` | Formatting, whitespace |
| `docs` | Dokumentasi |
| `test` | Test |
| `chore` | Build, config, dependencies |

## Workflow Harian

```bash
# Pagi: sync develop
git checkout develop && git pull

# Buat branch fitur
git checkout -b feat/m2-auth

# Kerja: commit kecil & sering
git add <files> && git commit -m "feat: add magic link auth"

# Push & buat PR
git push -u origin feat/m2-auth
# Buka PR via GitHub / gh CLI

# Setelah merge: bersihkan
git checkout develop && git pull && git branch -d feat/m2-auth
```

## Deploy

Vercel sudah tidak dipakai — project-nya tidak ada lagi (lihat TASKS.md 8.4.1).
Sekarang di Cloudflare Workers lewat OpenNext:

| Target | Worker | URL |
|--------|--------|-----|
| Production | `tutorlog-web` | `tutorlog.id` (+ `www` redirect ke apex) |
| Staging | `tutorlog-web-staging` | `tutorlog-web-staging.fatlhr.workers.dev` |

Deploy masih **manual** lewat `npm run deploy` (production) atau
`wrangler deploy --name tutorlog-web-staging` (staging). Belum ada auto-deploy.

**Belum ada CI.** Tidak ada `.github/workflows/`, jadi tidak ada gate otomatis yang
nge-block merge kalau lint/build gagal — untuk sekarang itu tanggung jawab manual
sebelum merge (`npm run lint && npm run build`). Kalau nanti CI ditambah, itu juga
yang bikin "require status checks" di ruleset GitHub jadi ada artinya.

## Git Hooks

Pre-push hook nolak push langsung ke `main`. File: `.git/hooks/pre-push`.

Hook baca daftar ref dari stdin dan cek ref **tujuan**, bukan branch yang lagi aktif.
Bedanya penting: versi lama cuma cek branch aktif, jadi `git push origin develop:main`
lolos begitu saja.

**Hook tidak ter-track oleh git.** Setelah fresh clone, jalankan:
```bash
bash scripts/setup-hooks.sh
```

### Hook bukan pengaman

Hook ini lokal dan bisa dilewati dengan `--no-verify`. Fungsinya rem cepat supaya
kesalahan ketahuan sebelum kena jaringan, bukan pagar.

Pagar sebenarnya = **branch ruleset di GitHub**: server-side, gak bisa dilewati, dan
tetap berlaku dari mesin manapun termasuk yang belum jalanin `setup-hooks.sh`.
Repo ini public, jadi ruleset gratis.
