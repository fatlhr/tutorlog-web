# TutorLog Protected App Foundation and Visual System Redesign

> **For agentic workers:** Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Update each checkbox immediately after its task is complete.

**Goal:** Rebuild the protected TutorLog web companion as a calm, playful personal workspace for individual private tutors without turning it into an institution-style dashboard.

**Architecture:** Mobile remains the source for recording and revising sessions. The web reads session data, presents recaps, and creates invoices. Existing Next.js, Supabase, CSS tokens, and Phosphor icons remain the foundation. A scoped visual layer adds route-aware workspace surfaces and reusable primitives without adding a package or replacing the existing public-site identity.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, custom CSS, Phosphor icons, jsPDF, html2canvas. Reference contract: `docs/superpowers/specs/2026-07-13-protected-app-visual-system-design.md`.

## Global Constraints

- No dummy user data in protected routes, including development mode.
- No new dependency or external design-system package. Internal tokens and scoped reusable UI primitives are required for Milestones 6-10.
- No full tests during development. Use manual review and `git diff --check`.
- Do not push, open a PR, sync, or merge to `main` before manual approval.
- Do not stage `.superpowers/`, `live-screenshots/`, `AGENTS.md`, or test output.
- Every completed task must be checked before starting the next task.
- After every milestone, record the commit SHA, `git diff --check` result, and manual review status in the Milestone Log.
- Every implementation milestone must be reviewed at `1440x900`, `1024x768`, and `390x844` before its commit. Do not claim test coverage: automated checks remain deferred until Milestone 11 and only after a request to integrate toward `main`.
- Decorative route backgrounds may sit behind page canvas only. They must never overlap, tint, or reduce the legibility of tables, forms, dialogs, previews, or session rows.

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

**Status:** Complete as the functional foundation. The visual composition and final invoice behavior below supersede its current presentation without reopening its data truthfulness or draft work.

## Milestone 6: Visual Foundation and Route-Aware Shell

**Purpose:** Make the protected area feel related to the public TutorLog experience while keeping daily work quiet, compact, and legible.

- [x] Add protected-app tokens in the scoped app CSS: base, paper surface, muted ink, line, green, mint, lilac recap accent, and coral invoice accent. Do not alter public-page token behavior.
- [x] Define reusable structural primitives for page canvas, route eyebrow, page heading, summary band, compact row, data surface, contextual panel, and section divider. Reuse class contracts instead of creating a component library or duplicate markup.
- [x] Apply a timetable-grid background to Beranda, a lighter ledger-grid background to Rekap, and a ruled-paper background to Invoice. Keep all ornament within the route canvas and behind solid data/form surfaces.
- [x] Make all table, session list, form, invoice preview, dialog, and upgrade surfaces solid. No transparent table surface may visually merge into a decorative background.
- [x] Update desktop/tablet shell to use the same `Beranda`, `Rekap`, `Invoice` segmented navigation with one route-accent active state. Preserve `aria-current="page"`.
- [x] Update mobile header and bottom navigation to the same route model, while preserving a 44px minimum touch target and no route-layout jump.
- [x] Move account status, help, and logout into a compact account menu whose Plus state is informative, not promotional.
- [x] Keep page headings at 28px desktop/tablet and 24px mobile; retain existing TutorLog title and body fonts.
- [ ] Review the shared shell at `1440x900`, `1024x768`, and `390x844`, checking background containment, navigation alignment, focus visibility, and no horizontal overflow.
- [x] Run `git diff --check`.
- [ ] Commit: `style: establish protected tutor workspace system`.

**Gate:** Routes share one recognisable workspace language, while each route has a quiet distinct context and no decorative element compromises content.

**Status:** Internal design-system foundation manually approved on 2026-07-13. Production shell migration, three-viewport visual review, and the milestone commit remain pending.

## Milestone 7: Beranda Workspace and Quiet Conversion

**Purpose:** Make the home route useful for a tutor opening the web after teaching, without filling it with dashboards or pricing cards.

- [x] Replace scattered home stat treatment with one solid current-month summary band: completed sessions, total teaching time, and estimated income.
- [x] Keep the greeting and period short. Use one route eyebrow and one action-oriented heading; avoid marketing-style copy inside the protected app.
- [x] Render the three latest sessions as compact rows with date, student, duration, amount, and a clear route to recap. Rows must remain scannable without card stacking.
- [x] Show exactly one next action based on the user state. Empty accounts receive mobile onboarding; accounts with sessions receive the next relevant recap or invoice action.
- [x] Restyle `HomeUpgradePrompt` as a quiet contextual strip for free users with sessions. Use quota wording only for recap downloads: available quota links to `Lihat Plus`; exhausted quota uses `Aktifkan Plus` and links to `/harga`.
- [x] Ensure paid users see no promotional home block. `Plus aktif` remains visible only in the account menu.
- [x] Preserve the existing no-session state: guide the tutor to record sessions in mobile first and do not show an upsell.
- [ ] Review empty, free-with-quota, free-quota-exhausted, and paid states at `1440x900`, `1024x768`, and `390x844`.
- [x] Run `git diff --check`.
- [ ] Commit: `feat: polish tutor home workspace`.

**Gate:** Beranda feels like a personal weekly work surface: enough information to act, no KPI wall, no pricing takeover.

## Milestone 8: Rekap Compact List, Filters, and Session Detail

**Purpose:** Let a tutor read many sessions comfortably without a large desktop table or a long mobile card list.

- [x] Replace the recap table treatment with compact data rows. Desktop/tablet rows target about 44px; mobile rows target about 52px and never exceed two text lines before truncation.
- [x] Keep each row as one simple trigger: date, student, duration, amount, and chevron. Avoid nested buttons or repeated action icons.
- [x] Open a read-only session detail panel on desktop/tablet and a bottom sheet on mobile. Include time, teaching mode, location, rate, total, and the tutor's session note; retain no web editing control.
- [x] Add simple pagination with an initial 20-session page size. Do not introduce search, infinite scroll, or batch operations.
- [x] Keep `Bulan ini`, `Bulan lalu`, and `Pilih tanggal`. Desktop filters stay compact inline; mobile exposes one `Filter` control with an active-count badge and opens a bottom sheet.
- [x] Present filter choices as compact controls, not a permanent tall filter card. Native date inputs appear only for `Pilih tanggal`.
- [x] Preserve the period summary, student filter, empty state, retryable error state, and existing recap download behavior.
- [x] Use `Unduh` consistently. Free recap PDF/CSV remains governed by the existing monthly quota; only a blocked download opens the quota upgrade dialog.
- [ ] Review dense data at `1440x900`, filter disclosure at `1024x768`, and list/detail/bottom-sheet behavior at `390x844`.
- [x] Run `git diff --check`.
- [ ] Commit: `feat: compact tutor session recap`.

**Gate:** A tutor can scan a busy month, filter it, inspect one session, and download a recap without feeling pushed through analytics tooling.

## Milestone 9: Invoice Composition and Plus Boundary

**Purpose:** Make invoice creation readable and reliable, using mobile session notes as invoice descriptions and a clear TutorLog Plus download boundary.

- [x] Remove manual session selection and all `selectedSessionIds` UI/state from invoice composition. Student plus date range is the sole session scope.
- [x] Load every completed session for the selected student and date range automatically. Do not show a duplicate session-preview list in the form; use the helper copy: `Semua sesi selesai pada periode ini dimasukkan otomatis ke preview.`
- [x] Populate each invoice item description from `session_learning_notes.tutor_note`. Use exactly `Belum ada catatan sesi` only when the note is absent.
- [x] Update draft serialisation and restore logic to omit selected session IDs and rederive sessions after student/range restore. Retain the `tutorlog-invoice-draft:v1` key and all other draft fields.
- [x] Desktop `>=1200px`: use one form column and a solid A4 preview column, side by side, within the invoice route paper canvas.
- [x] Tablet `768-1199px`: keep the form single-column and open a centered preview dialog. The dialog preview must be centered at its largest safe size, not inherit an inline proof scale.
- [x] Mobile `<768px`: make `Kembali ke Beranda` the primary handoff action and `Lanjutkan di sini` the secondary action. The secondary path opens a simplified one-column editor; `Periksa invoice` opens a full-screen preview rather than a persistent A4 pane.
- [x] Keep the form order: student and period, payment, invoice appearance, additional details, review, then download. `Nama layanan atau brand (opsional)` stays in additional details.
- [x] Mark `Unduh PDF` with a lock for free users and show `Unduh PDF tersedia untuk TutorLog Plus.` before download. Clicking opens a Plus upgrade dialog that preserves the draft and links to `/harga`.
- [x] Paid users download normally with no upsell. Invoice download never consumes recap quota.
- [x] Replace remaining hand-drawn invoice icons with existing Phosphor icons.
- [ ] Review automatic inclusion, note fallback, draft restore, desktop preview, tablet centered dialog, mobile handoff/continue, free lock dialog, and paid download at `1440x900`, `1024x768`, and `390x844`.
- [x] Run `git diff --check`.
- [ ] Commit: `feat: refine invoice composition and Plus gate`.

**Gate:** The invoice remains a clear desktop-first task, a workable mobile fallback, and a trustworthy paid conversion moment without exposing irrelevant session-selection complexity.

## Milestone 10: State, Density, and Copy Polish

**Purpose:** Make the redesigned routes feel coherent in normal, empty, loading, and error states before final integration review.

- [x] Apply the approved visual system to route loading, empty, error, upgrade, and dialog states. Each state must use an existing real UI pattern, not illustrations or extra cards.
- [x] Bring the approved Tutor Planner Canvas treatment into Beranda summary, empty state, Plus prompt, active navigation, and export success feedback without placing ornaments over data surfaces.
- [x] Audit every protected route for card bloat. Convert decorative containers into dividers, surface bands, or rows where framing has no functional purpose.
- [x] Confirm all public-facing protected copy uses common terms: `Beranda`, `Rekap sesi`, `Buat invoice`, `Periksa invoice`, and `Unduh PDF`.
- [x] Check low-density and high-density scenarios: no-session tutor, three recent sessions, 20 recap rows, a long session note, and a form with optional invoice details.
- [x] Confirm backgrounds remain quiet and do not sit beneath opaque content incorrectly; table/form surfaces must be solid and ornaments must not intrude into their bounds.
- [ ] Review keyboard focus, menu/dialog Escape close, mobile bottom-sheet dismissal, and touch-target spacing at `1440x900`, `1024x768`, and `390x844`.
- [x] Run `git diff --check`.
- [ ] Commit: `style: polish protected tutor workspace states`.

**Gate:** The app feels friendly and consistent at every density, without the visual overhead of a generic SaaS dashboard.

## Milestone 11: Final Review and Integration Gate

- [x] Audit all visible copy for novice-friendly language during the foundation redesign.
- [x] Audit card density, dummy data, and responsive duplication during the foundation redesign.
- [x] Review protected routes at desktop, tablet, and mobile for the authenticated paid account during the foundation redesign.
- [ ] Perform a full post-visual-system audit for copy, density, dummy data, duplicate responsive markup, and paid/free boundaries.
- [ ] Wait for manual approval to prepare integration toward `main`.
- [ ] Move the protected test session token to an environment variable before any `main` integration.
- [ ] Run lint, build, protected responsive sweep, accessibility, reduced motion, and visual regression only after integration is explicitly requested.
- [ ] Commit `test: verify protected tutor workflows` after requested verification.

## Deferred After UI Redesign

- Third-party checkout and automatic Plus activation.
- Payment failure, expiry, retry, and reconciliation.
- Conversion analytics, invoice history, full settings, and web student management.
- File sharing, search, deltas, batch invoice, and notifications.

## Milestone Log

| Milestone | Commit | `git diff --check` | Manual review |
| --- | --- | --- | --- |
| 0 | `60d4c83` | Passed | Baseline captured; final visual comparison pending implementation |
| 1 | `60d4c83` | Passed | Empty and error states reviewed before server became unavailable |
| 2 | `60d4c83` | Passed | Desktop, tablet, mobile shell and account menu reviewed |
| 3 | `60d4c83` | Passed | Empty, active free, exhausted free, and paid states reviewed at three breakpoints; temporary fixture removed |
| 4 | `60d4c83` | Passed | Desktop table, tablet table, and mobile session rows reviewed at runtime |
| 5 | `60d4c83`, `ed2b278` | Passed | Draft restore, real and empty session states, tablet dialog, mobile handoff, and desktop preview reviewed at runtime |
| 6 | Pending (working tree based on `2eb8d86`) | Passed on 2026-07-13 | Internal component APIs, scoped tokens, interaction states, responsive rules, decorative utilities, documentation, and static audits manually approved; production shell and viewport review pending |
| 7 | Pending | Passed | Pending: Beranda workspace and quiet conversion |
| 8 | Pending | Passed | Pending: compact recap, filters, and session detail |
| 9 | Pending | Passed | Pending: invoice composition and Plus boundary |
| 10 | Pending | Passed | Pending: state, density, and copy polish |
| 11 | Pending | Pending | Pending: final review only after manual integration approval |

## Continuation Handoff

- Branch: `feat/app-foundation-redesign`
- Repository: `/Users/fatih/Code/Playground/tutorlog-web`
- Source implementation and runtime review for Milestones 1-5 are complete. Milestones 6-10 are the approved visual-system work and Milestone 11 is the integration gate.
- Full tests remain intentionally deferred until integration to `main` is explicitly requested.
- Continue from the first unchecked Milestone 6 item. Update its checkbox immediately after each item, then update the Milestone Log before committing the milestone.
- Do not reopen completed source tasks unless visual review finds a regression. Do not create a worktree, switch branch, push, merge, sync, or create a PR without user instruction.
- Source was moved from the temporary worktree into the main repository branch on 2026-07-13. Continue all work from the repository path above.
