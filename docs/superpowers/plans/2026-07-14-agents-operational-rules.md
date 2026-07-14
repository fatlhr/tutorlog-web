# AGENTS Operational Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the minimal repo-local `AGENTS.md` with concise operational rules for `tutorlog-web`.

**Architecture:** This is a docs-only update. `AGENTS.md` becomes the single runtime instruction source for agents in this repo, while the approved design stays in `docs/superpowers/specs/2026-07-14-agents-operational-rules-design.md`.

**Tech Stack:** Markdown, Git.

## Global Constraints

- Use `rtk` before shell commands.
- Remove the `claude-mem-context` block from `AGENTS.md`.
- Do not use Git worktrees unless the user explicitly asks.
- Do not run tests, responsive sweeps, accessibility checks, visual regression, or PDF export tests during development unless the user asks.
- Before merging or syncing into `develop`, ask whether to run or skip each relevant check.
- Docs-only commits may be made directly on `develop` only when they do not affect app behavior, runtime config, scripts, dependencies, package files, CI, or workflow automation.
- No unrelated project files should be changed.

---

### Task 1: Rewrite Repo Agent Rules

**Files:**
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-07-14-agents-operational-rules-design.md`
- Produces: repo-local operational rules that future agents must follow.

- [x] **Step 1: Replace `AGENTS.md` content**

Replace the file with Indonesian operational rules covering:

```markdown
@/Users/fatih/.codex/RTK.md

# TutorLog Web Agent Rules

[sections for command style, git boundaries, test policy, temp artifacts, scope/UX, planning gate, completion claims]
```

The rewrite must remove the old `claude-mem-context` block.

- [x] **Step 2: Check the rewritten file**

Run:

```bash
rtk sed -n '1,260p' AGENTS.md
```

Expected: the file starts with `@/Users/fatih/.codex/RTK.md`, contains no `claude-mem-context`, and includes the operational sections from the spec.

- [x] **Step 3: Verify docs-only diff**

Run:

```bash
rtk git diff --check
rtk git status --short
rtk git diff -- AGENTS.md
```

Expected: no whitespace errors, and only `AGENTS.md` is modified for this implementation step.

- [ ] **Step 4: Commit docs-only change**

Run:

```bash
rtk git add AGENTS.md docs/superpowers/plans/2026-07-14-agents-operational-rules.md
rtk git commit -m "docs: update repo agent rules"
```

Expected: commit succeeds on `develop`.

## Self-Review

- Spec coverage: Task 1 covers Git boundaries, test policy, temporary artifacts, scope/UX, planning gate, completion claims, docs-only commit exception, and Claude Mem removal.
- Placeholder scan: no TBD/TODO markers are used.
- Scope check: this is a single docs-only implementation and does not require decomposition.
