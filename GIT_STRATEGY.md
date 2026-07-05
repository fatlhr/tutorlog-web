# Git Strategy — Trunk-Based Development

## Branch Model

```
main ──────────────────────────────────────────────────────►
│  (production — legal web, jangan ganggu sampai v2 ready)   │
│                                                            │
└── develop ─────────────────────────────────────────────────►
    │  (development — Next.js migration)                     │
    │                                                        │
    ├── feat/m1-foundation ───┬──► PR ──► merge ──► delete  │
    │                         │                              │
    ├── feat/m2-auth ─────────┤                              │
    │                         │                              │
    └── fix/login-bug ────────┘                              │
```

## Aturan

| Aturan | Detail |
|--------|--------|
| **`main`** | Production — legal web TutorLog. **Jangan ganggu** sampai Next.js v2 siap deploy. |
| **`develop`** | Development branch untuk Next.js migration. Semua feature branch start dari sini. |
| **Feature branch** | `feat/<milestone>` atau `feat/<deskripsi>` — hidup max 2 hari, start dari `develop` |
| **Fix branch** | `fix/<deskripsi>` — langsung dari `develop`, cepat merge |
| **Commit ke `develop` langsung** | Hanya untuk docs, config, typo fix — tanpa PR |
| **PR wajib** | Semua perubahan kode. Self-review dulu sebelum merge |
| **Squash merge** | Semua PR di-squash ke 1 commit di `develop` |
| **Delete branch** | Hapus setelah merge |
| **Merge ke `main`** | Hanya saat Next.js v2 siap deploy. Buat PR `develop` → `main`. |

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

## CI/CD

- `develop` branch → auto-deploy ke Vercel preview
- PR branch → Vercel preview deployment
- `main` → **jangan auto-deploy** sampai v2 siap
- Build gagal = merge di-block
