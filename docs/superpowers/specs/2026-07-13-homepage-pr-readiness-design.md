# Homepage PR Readiness Design

## Goal

Prepare `feat/homepage-redesign` for a pull request into `develop` by resolving the concrete issues found during self-review without changing the approved public-page direction.

## Scope

### Demo dialog

- Keep the `Lihat demo` CTA and the existing dummy YouTube URL.
- Present the dialog as a temporary interaction preview, not as an authentic TutorLog recording.
- Use visible copy that states the video is placeholder content while the TutorLog recording is being prepared.
- Give the iframe a neutral title that matches its temporary role.
- Keep the iframe unmounted while the dialog is closed.

### Dialog accessibility

- Apply the same keyboard behavior to `LandingDemoDialog` and `PublicProofDialog`.
- When opened, focus moves to the close button.
- `Tab` and `Shift+Tab` remain inside the active dialog.
- `Escape` and backdrop interaction close the dialog.
- Closing restores focus to the trigger.
- Opening locks document scrolling; closing or unmounting restores it.
- Do not introduce a modal library or a general-purpose component migration.

### Test artifact hygiene

- Remove `test-results/.last-run.json` from Git tracking.
- Keep `/test-results/` ignored so future Playwright runs do not modify tracked files.
- Do not add generated screenshots or reports to the PR.

### Branch scope

- Keep `f63e82c chore: ignore .worktrees directory`. The ignore rule is required by the repository's isolated-worktree workflow.
- Do not modify the newer `/app` redesign work.
- Do not rewrite published branch history.

## Implementation Shape

- Add a small client-side dialog utility hook that accepts the open state plus trigger, dialog, and initial-focus refs.
- The hook owns focus trapping, Escape handling, focus restoration, and body scroll locking.
- Both existing dialogs retain their markup and visual styling, using the hook only for shared behavior.
- Add narrow Playwright assertions for forward and reverse focus wrapping, Escape closure, focus restoration, scroll locking, and honest placeholder copy.

## Verification

The development policy does not require the full suite for a PR into `develop`. Run only checks needed for this fix:

1. New targeted dialog tests fail before implementation and pass afterward.
2. Existing targeted dialog tests remain green.
3. `npm run lint`.
4. `npm run build`.
5. `git diff --check`.
6. Final diff review against `origin/develop` confirms no generated test output or `/app` redesign files are included by the readiness fix.

Do not claim the responsive or accessibility suites pass unless they are run fresh.

## Acceptance Criteria

- The dummy video is visibly identified as temporary placeholder content.
- Keyboard focus cannot leave either open dialog.
- Background scrolling is locked only while a dialog is open.
- Closing restores focus to the correct trigger.
- `test-results/.last-run.json` is no longer tracked.
- The branch is pushed with a clean working tree and a PR summary targeting `develop`.
