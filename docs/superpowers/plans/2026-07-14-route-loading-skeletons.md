# Route-specific loading skeletons

**Goal:** Keep the protected-app footer anchored below a meaningful page-shaped skeleton while Beranda, Rekap, or Invoice is loading.

**Architecture:** Each route loading boundary uses the same `RouteCanvas` and `PageMain` composition as its final page, then assembles existing `LoadingState` primitives in a small shared loading layout. The skeletons remain presentational: no fetching, temporary data, or route behavior is added.

**Verification boundary:** During feature development, run the focused protected-app audit and `git diff --check`. Do not run the full test suite, responsive sweep, accessibility test, visual regression, build, or lint without explicit user instruction.

## Task 1: Protect the loading contract with a focused audit

- Add Beranda, Rekap, and Invoice loading files to the protected-app consumer allowlist.
- Require each loading file to use its correct route canvas, `PageMain`, and at least three structured loading regions.
- Run the audit before implementation and confirm it fails for the missing contract.

## Task 2: Implement route-shaped loading boundaries

- Wrap Beranda loading with `RouteCanvas route="home"` and represent its header, monthly summary, recent sessions, and supporting panel.
- Add Rekap loading with `RouteCanvas route="recap"` and represent its header, filters, summary, and session list.
- Add Invoice loading with `RouteCanvas route="invoice"` and represent its header, form, and document preview.
- Add one shared responsive loading-layout composition so desktop structure collapses cleanly without route-specific inline styling.

## Task 3: Verify and record the result

- Run the focused protected-app audit and `git diff --check`.
- Inspect route transitions in the running app where the local transition is long enough to expose the loading boundary, and confirm the shell footer does not rise into the content area.
- Update the protected-app ledger with the loading-state correction and verification result.
- Stop for manual approval. Do not commit, push, merge, sync, or create a PR.
