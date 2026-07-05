# Git Strategy — Trunk-Based Development

> Diadopsi dari TutorPlis. Selalu ikuti rules ini.

## Branch Model

```
main ──────────────────────────────────────────────────────►
  │                                                          
  ├── feat/m1-foundation ───┬──► PR ──► merge ──► delete    
  │                         │                                
  ├── feat/m2-registration ─┤                                
  │                         │                                
  ├── fix/search-bar ───────┘                                
```

## Aturan

| Aturan | Detail |
|--------|--------|
| **Satu branch abadi** | `main` — selalu deployable, selalu production-ready |
| **Feature branch** | `feat/<milestone>` atau `feat/<deskripsi>` — hidup max 2 hari |
| **Fix branch** | `fix/<deskripsi>` — langsung dari `main`, cepat merge |
| **Commit ke main langsung** | Hanya untuk docs, config, typo fix — tanpa PR |
| **PR wajib** | Semua perubahan kode. Self-review dulu sebelum merge |
| **Squash merge** | Semua PR di-squash ke 1 commit di main |
| **Delete branch** | Hapus setelah merge |

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
# Pagi: sync main
git checkout main && git pull

# Buat branch fitur
git checkout -b feat/m2-registration

# Kerja: commit kecil & sering
git add <files> && git commit -m "feat: add zod validation for step 1"

# Push & buat PR
git push -u origin feat/m2-registration
# Buka PR via GitHub / gh CLI

# Setelah merge: bersihkan
git checkout main && git pull && git branch -d feat/m2-registration
```

## CI/CD

- `main` branch → auto-deploy ke Vercel production
- PR branch → Vercel preview deployment
- Build gagal = merge di-block
