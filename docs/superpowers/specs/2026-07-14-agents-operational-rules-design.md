# AGENTS Operational Rules Design

Date: 2026-07-14
Scope: `/Users/fatih/Code/Playground/tutorlog-web`

## Goal

Replace the current minimal `AGENTS.md` with operational rules that prevent the recurring workflow problems seen in this repo: unapproved Git actions, over-eager verification, temporary artifacts left in the tree, UI scope drift, premature completion claims, and large changes without an approval gate.

The rules are repo-local. They should not define global behavior for other projects.

## Chosen Approach

Use an operational checklist style. It is stricter than a short policy note, but lighter than a full SOP. The file should be practical for agents to follow during ordinary coding turns.

## Required Rule Sections

### 1. Git Boundaries

Allowed without extra approval:

- `git status`, `git diff`, `git log`, and other read-only inspection commands.
- `git diff --check` as the default lightweight verification.
- Docs-only commits directly on `develop`, only when the change does not affect app behavior, runtime config, scripts, dependencies, package files, CI, or workflow automation.

Requires explicit user approval:

- Creating or switching branches.
- Creating or using Git worktrees.
- Committing code changes.
- Merging into any branch.
- Pushing to any remote.
- Creating or updating PRs.

Worktrees should not be used unless the user asks for them explicitly.

### 2. Test And Verification Policy

During development or feature work, agents must not run tests, full test suites, responsive sweeps, accessibility checks, visual regression, or PDF export tests unless the user asks.

Before a normal development commit, the default verification is:

- Review the relevant diff.
- Run `git diff --check`.

Before merging or syncing into `develop`, the agent must stop and ask whether to run or skip each relevant check:

- Tests.
- Responsive sweep.
- Accessibility check.
- Visual regression.
- PDF export test.

Before PRs or merges targeting `main`, the full suite is required unless the user explicitly changes that requirement.

If a check is skipped, the agent must say that it was skipped and must not claim it passed.

### 3. Temporary Artifact Policy

Agents must not leave screenshots, PDF exports, HTML dumps, traces, logs, or scratch files in the repository unless the user asks to keep them.

If temporary artifacts are needed, they may be placed in a clearly temporary location such as `tmp/` or `live-screenshots/`, then cleaned before handoff.

Before commit or handoff, agents must run `git status --short` and explain which remaining changed files are intentional.

`.superpowers/` should not be created or retained unless it is the active source of workflow state for the current task.

### 4. Scope And UX Boundaries

Allowed without extra approval when already in scope:

- Visual styling changes: spacing, radius, border, shadow, color token usage, typography scale, and alignment.
- Responsive layout corrections that preserve the same content and workflow.
- Local CSS or component cleanup when the UI output remains equivalent.
- Bug fixes clearly requested through a screenshot or direct instruction.
- Decoration or illustration changes when the user asks for a new visual direction.
- Small placeholder, hint, or helper-copy edits that clarify an input without changing the workflow.

Requires explicit user approval:

- Route changes, navigation changes, page hierarchy changes, or new entry points.
- Workflow order changes, including invoice, recap, auth, and protected app flows.
- Field additions, removals, required or optional status changes, or data mapping changes.
- Business logic changes, including invoice calculations, recap filters, session aggregation, and PDF export behavior.
- Legal copy, formal invoice wording, and payment wording changes.
- State management, API contracts, schemas, environment config, dependencies, package files, build config, or CI config.
- Large UX pattern changes, such as page to modal, modal to page, table to cards, dialog to bottom sheet, or similar structural shifts.
- Dummy data changes that affect preview contracts.
- Redesign work outside the user-requested route or surface.

Allowed as proposals only, not direct implementation:

- UX or product flow alternatives.
- Protected app screens that feel like landing pages.
- Removing analytics hooks, accessibility attributes, validation, or error handling.
- Updating plan ledgers or milestone status before the related work is verified.

If the user approves a proposal, it becomes in scope.

### 5. Planning Gate

Agents must present a mini plan and get approval before changes involving:

- Shared components, tokens, layout systems, or the invoice/PDF generator.
- Page structure changes.
- Data mapping, business logic, validation, export, or auth.
- Refactors beyond local styling.
- Work that requires screenshots or manual QA afterward.

Small fixes may proceed directly after reading the relevant files, including local spacing, copy, label, padding, and typo fixes.

### 6. Completion Claims

Before saying work is done, fixed, passing, or ready, agents must perform a self-check appropriate to the work:

- Run `git status --short`.
- Run `git diff --check` unless the user explicitly skipped it.
- Review the diff for unintended files.
- State clearly which checks were run and which were skipped.

For UI or PDF changes, agents must not imply a visual result was verified unless they actually checked it. If visual QA was not requested or not run, the handoff must say so.

### 7. Claude Mem Removal

Remove the `claude-mem-context` block from `AGENTS.md`. The project rules should not carry auto-updated memory timestamp noise.

## Acceptance Criteria

- `AGENTS.md` no longer contains the `claude-mem-context` block.
- `AGENTS.md` contains the operational rules above in concise Indonesian.
- Existing development test policy is preserved but clarified with the `develop` merge confirmation gate.
- Rules distinguish between allowed action, approval-required action, and proposal-only action.
- Docs-only commit exception is explicit and limited.
- No unrelated project files are changed.
