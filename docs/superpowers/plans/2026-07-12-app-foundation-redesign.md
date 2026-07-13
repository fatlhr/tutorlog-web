# TutorLog Protected App Foundation Redesign

> **For agentic workers:** Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Update each checkbox immediately after its task is complete.

**Goal:** Rebuild the protected TutorLog web companion as a calm personal workspace for individual private tutors.

**Architecture:** Mobile remains the source for recording and revising sessions. The web reads session data, presents recaps, and creates invoices. Existing Next.js, Supabase, CSS tokens, and Phosphor icons remain the foundation.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, custom CSS, Phosphor icons, jsPDF, html2canvas.

## Global Constraints

- No dummy user data in protected routes, including development mode.
- No new design system or dependency.
- No full tests during development. Use manual review and `git diff --check`.
- Do not push, open a PR, sync, or merge to `main` before manual approval.
- Do not stage `.superpowers/`, `live-screenshots/`, `AGENTS.md`, or test output.
- Every completed task must be checked before starting the next task.

## Milestone 0: Baseline and Handoff

- [x] Isolate app redesign from current public-page changes.
- [x] Create `feat/app-foundation-redesign` in the main repository from approved public baseline `dc45741`.
- [x] Save this implementation plan.
- [x] Capture `/app`, `/app/rekap`, and `/app/invoice` at `1440x900`, `1024x768`, and `390x844`. Baseline extracted from `develop` to `/private/tmp/tutorlog-app-baseline`.
- [x] Classify recommendations in `docs/app-audit-redesign.md` as implement, defer, or reject.
- [x] Run `git diff --check`.
- [x] Include the design contract in source checkpoint `60d4c83` after migration to the main repository branch.

**Status:** Complete. Baseline review will be repeated against the redesigned routes during their milestones.

## Milestone 1: Truthful Data

- [x] Make `fetchRekapDataByRange()` throw on query failure while preserving a valid empty result.
- [x] Remove `DUMMY_ROWS`, `DUMMY_BARS`, and `NODE_ENV` fallbacks.
- [x] Add a recap load-error state distinct from empty data.
- [x] Remove invoice `DUMMY_STUDENTS`.
- [x] Distinguish invoice loading, empty students, empty sessions, and fetch errors.
- [x] Add route-level loading UI shaped like the final summary and rows.
- [x] Review empty and error states at desktop, tablet, and mobile.
- [x] Run `git diff --check`.
- [x] Commit truthful data changes in source checkpoint `60d4c83`.

## Milestone 2: Shared App Shell

- [x] Use `Beranda`, `Rekap`, and `Invoice` on desktop and mobile navigation.
- [x] Remove the `Lainnya` bottom tab.
- [x] Move `Bantuan` and `Keluar` into the account menu.
- [x] Add `aria-current="page"` and consistent active states.
- [x] Replace duplicated desktop/mobile footer markup with one responsive footer.
- [x] Replace shell hand-drawn icons with Phosphor icons.
- [x] Remove duplicated responsive markup from touched pages.
- [x] Review keyboard navigation and three viewports.
- [x] Run `git diff --check`.
- [x] Commit shared shell changes in source checkpoint `60d4c83`.

**Status:** Complete. Desktop, tablet, mobile, active routes, account menu, and Escape close were reviewed in Chrome and checkpointed in `60d4c83`.

## Milestone 3: Personal Home and Conversion Entry

- [x] Add `fetchRecentSessions(limit = 3)`.
- [x] Show a short greeting and current-month label.
- [x] Show one summary band for sessions, hours, and estimated income.
- [x] Show three recent-session rows.
- [x] Show one contextual next action.
- [x] Show mobile onboarding, without upsell, when no sessions exist.
- [x] Remove full pricing cards, WhatsApp confirmation, and permanent Play Store promotion.
- [x] Load quota alongside home data.
- [x] Show a compact upgrade prompt only to active free users.
- [x] Link upgrade actions to `/harga`, not directly to a payment provider.
- [x] Show paid status only inside the account menu.
- [x] Remove `PricingCards` if no consumer remains.
- [x] Review empty-account state.
- [x] Review active free state with quota available.
- [x] Review exhausted free state.
- [x] Review paid state with real sessions.
- [x] Run `git diff --check`.
- [x] Commit home overview changes in source checkpoint `60d4c83`.

**Status:** Complete. Empty, active free, exhausted free, and paid states were reviewed at desktop, tablet, and mobile. The development-only review fixture was removed before this checkpoint.

## Milestone 4: Understandable Recap

- [x] Add `Bulan ini`, `Bulan lalu`, and `Pilih tanggal` presets.
- [x] Show native date inputs only for custom dates.
- [x] Keep summary, student filter, session list, and download actions.
- [x] Remove the dummy chart without replacing it.
- [x] Replace visible `Export` copy with `Unduh`.
- [x] Add a normal period summary row.
- [x] Add clear empty and retryable error states.
- [x] Show paywall only after a blocked download action.
- [x] Review desktop table and mobile session list.
- [x] Run `git diff --check`.
- [x] Commit recap changes in source checkpoint `60d4c83`.

## Milestone 5: Stable Invoice Workflow

- [x] Keep form and A4 preview side-by-side at `>=1200px`.
- [x] Use a single-column form with preview dialog at `768-1199px`.
- [x] Show a laptop handoff page below `768px` without editor or blocking modal.
- [x] Order form as student and period, sessions, payment, appearance, review, download.
- [x] Rename `Lembaga` to `Nama layanan atau brand (opsional)` and move it to additional details.
- [x] Add full draft autosave under `tutorlog-invoice-draft:v1`.
- [x] Keep saved settings separate from draft data.
- [x] Use `Buat invoice`, `Periksa invoice`, and `Unduh PDF` copy.
- [x] Preserve quota gate and client-side PDF generation.
- [x] Review draft restore, data states, tablet preview, and mobile handoff.
- [x] Run `git diff --check`.
- [x] Commit invoice changes in `60d4c83` and runtime rendering fix in `ed2b278`.

**Status:** Complete. Draft restore, real and empty session states, tablet preview dialog, mobile handoff, and desktop side-by-side preview were reviewed in the authenticated session.

## Milestone 6: Final Review Gate

- [x] Audit all visible copy for novice-friendly language.
- [x] Audit card density, dummy data, and responsive duplication.
- [x] Review all protected routes at desktop, tablet, and mobile for the authenticated paid account.
- [ ] Wait for manual approval.
- [ ] Move protected test session token to an environment variable before `main` integration.
- [ ] Run lint, build, protected responsive sweep, accessibility, reduced motion, and visual regression only when integration is requested.
- [ ] Commit `test: verify protected tutor workflows` after verification.

## Deferred

- Third-party checkout and automatic Plus activation.
- Payment failure, expiry, retry, and reconciliation.
- Conversion analytics, invoice history, full settings, and web student management.
- File sharing, search, pagination, deltas, batch invoice, and notifications.

## Milestone Log

| Milestone | Commit | `git diff --check` | Manual review |
| --- | --- | --- | --- |
| 0 | `60d4c83` | Passed | Baseline captured; final visual comparison pending implementation |
| 1 | `60d4c83` | Passed | Empty and error states reviewed before server became unavailable |
| 2 | `60d4c83` | Passed | Desktop, tablet, mobile shell and account menu reviewed |
| 3 | `60d4c83` | Passed | Empty, active free, exhausted free, and paid states reviewed at three breakpoints; temporary fixture removed |
| 4 | `60d4c83` | Passed | Desktop table, tablet table, and mobile session rows reviewed at runtime |
| 5 | `60d4c83`, `ed2b278` | Passed | Draft restore, real and empty session states, tablet dialog, mobile handoff, and desktop preview reviewed at runtime |
| 6 | Pending | Pending | Pending |

## Continuation Handoff

- Branch: `feat/app-foundation-redesign`
- Repository: `/Users/fatih/Code/Playground/tutorlog-web`
- Source implementation and runtime review for Milestones 1-5 are complete.
- Full tests remain intentionally deferred until integration to `main` is requested.
- Continue from the first unchecked Milestone 6 item. Do not reopen completed source tasks unless manual review finds a regression.
- Source was moved from the temporary worktree into the main repository branch on 2026-07-13. Continue all work from the repository path above.
