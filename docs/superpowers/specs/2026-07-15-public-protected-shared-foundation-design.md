# TutorLog Public and Protected Shared Foundation

**Status:** Design approved on 2026-07-15. Ready for audit prompt review. Implementation has not started.

## Goal

Create one internal design-system foundation for TutorLog without flattening the differences between its two surfaces:

- Public routes remain marketing-oriented and preserve their current visual composition.
- Protected routes remain a product workspace with their existing playful editorial planner direction.
- Components are shared only when their semantics, interaction, state model, or base dimensions genuinely match.
- Surface adapters keep public and protected visual treatment independent where their jobs differ.

## Design Read

TutorLog is one brand with two interface modes. Public pages explain and sell the product. Protected pages help tutors review sessions, prepare recaps, and create invoices. The shared system should make controls feel related without making the marketing site look like an app dashboard or making the app feel like a landing page.

TasteSkill v2 is the visual-direction and anti-slop authority for public marketing surfaces. The existing protected-app contract remains the authority for product UI. TasteSkill rules apply to protected routes only when they fit product UI, accessibility, and interaction requirements.

## Approved Architecture

Use **shared foundation + surface adapters**.

```text
components/ui/
  shared semantic tokens
  interaction and accessibility foundations
  low-level component cores

components/public-ui/ or existing public wrappers
  marketing-specific adapters
  hero, story, feature, pricing, and CTA compositions

components/app-ui/
  protected adapters
  surface, summary, data-row, filters, forms, and app overlays
```

The exact folder names are proposals. The audit must verify whether moving files is useful before the contract fixes the final ownership.

## Token Layers

### Brand tokens

Shared across both surfaces:

- Primary brand color and semantic text colors
- Font families and font loading
- Border and focus colors
- Icon family
- Motion accessibility behavior

### Shared component tokens

Shared where component semantics match:

- Control heights
- Icon sizes
- Focus-ring treatment
- Hover, active, disabled, loading, and error states
- Touch-target minimums
- Base spacing scale
- Semantic radius names such as `control`, `surface`, and `overlay`

### Public surface tokens

Owned by public marketing composition:

- Marketing section rhythm
- Hero typography scale
- Marketing-card treatment
- Decorative spacing and motion
- Public navigation composition

### Protected surface tokens

Owned by the product workspace:

- Route gaps and content density
- Paper surfaces and route accents
- Data-row and table dimensions
- Form density
- App navigation composition
- Route canvas decoration

## Sharing Decision Rules

Each candidate component must be classified using these rules:

1. **Share foundation** when semantics, interaction cycle, accessibility contract, and base dimensions match.
2. **Share through adapters** when behavior matches but visual composition differs.
3. **Keep surface-specific** when the component has a different content model, hierarchy, density, or page role.
4. **Retire after migration** only when all consumers have moved and the old implementation has no remaining contract.

No component should be shared only because its current markup looks similar.

## Initial Candidate Map

The audit may revise this map with evidence.

| Candidate | Initial direction | Boundary |
| --- | --- | --- |
| Button | Shared foundation with public and protected adapters | Common states and sizing; surface-specific emphasis and composition |
| IconButton | Shared foundation with adapters | Common touch target, icon size, focus, disabled, and loading behavior |
| Field shell | Shared foundation with adapters | Common label, hint, error, required, disabled, and control association |
| Text input controls | Shared behavior and dimensions where compatible | Public and protected typography or density may differ |
| Dialog foundation | Shared accessibility and interaction foundation | Public and protected content layout may differ |
| Navigation item | Shared link, focus, and active semantics | Public navbar and app navigation stay separate compositions |
| Footer frame | Audit first | Share only container rhythm and semantics if both surfaces benefit |
| Card and Surface | Keep separate by default | Marketing card and operational surface have different hierarchy |
| Hero | Public-only | No protected equivalent |
| SummaryBand and DataRow | Protected-only | Product data components |
| Decoration and RouteCanvas | Surface-specific | Palette constraints may be shared, placement may not |

## Preservation Boundaries

The design-system work must not change these without separate approval:

- Route structure, navigation labels, and page hierarchy
- Public section order, hero composition, pricing flow, or marketing CTA intent
- Protected workflow, field order, validation, data mapping, quota rules, auth, or export behavior
- Invoice preview and PDF output
- Legal copy
- Analytics hooks
- Dependency, package, build, environment, or CI configuration

Visible adjustments are allowed when a genuinely shared component is normalized, for example control height, focus ring, icon alignment, loading state, or disabled state. Each visible adjustment must be listed in the preservation audit.

## Workflow

### Gate 1: Audit

Inspect the current implementation and produce:

- Separate Design Reads for public and protected surfaces
- Separate dial readings for `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY`
- Token inventory
- Component and consumer inventory
- Duplication and drift evidence
- Sharing matrix
- Proposed ownership map
- Migration risks
- Visual-preservation baseline

Stop for approval. Do not edit application code.

### Gate 2: Design-system contract

Using the approved audit, define:

- Token layers and naming
- Shared component APIs
- Public adapter APIs
- Protected adapter APIs
- Allowed variants
- Interaction and accessibility states
- Responsive behavior
- Component ownership
- Migration order
- Verification requirements

Stop for approval. Do not edit application code.

### Gate 3: Incremental migration

Work one component family at a time in this default order:

1. Shared tokens and interaction states
2. Button and IconButton
3. Field foundation and compatible controls
4. Dialog foundation
5. Navigation behavior
6. Footer frame only if the audit approves it

For each family:

- Add or extract the shared foundation.
- Preserve public and protected adapters.
- Migrate consumers without unrelated refactors.
- Review the focused diff.
- Verify the affected public and protected routes.
- Remove the old implementation only after its final consumer is gone.
- Stop for review when the contract or visible result changes materially.

### Gate 4: Final audit

Run surface-specific and cross-surface checks. Any failure blocks completion.

Public checks:

- Brand fidelity
- Hero discipline
- Section-layout repetition
- Marketing CTA consistency
- Decoration and motion
- Responsive composition
- Preservation of current design

Protected checks:

- Component-state completeness
- Form and table density
- Focus, Escape, scroll lock, and focus return
- Touch targets
- Loading, empty, error, and locked states
- Decoration isolation
- Reduced motion

Cross-surface checks:

- Token consistency
- Duplicate-component inventory
- Radius and spacing semantics
- Icon family and sizing
- Shared-state parity
- Public preservation audit
- Protected regression audit

Before merge or sync to `develop`, ask whether to run or skip tests, responsive sweep, accessibility check, visual regression, and PDF export test.

## Ready-to-Paste Prompt 1: Audit

```text
I have loaded design-taste-frontend v2 (experimental).

Use it as the visual-direction and anti-slop authority for TutorLog public marketing routes. For protected product routes, the existing protected-app design contract is authoritative. Apply TasteSkill rules there only when they fit product UI, accessibility, and interaction requirements.

Repository:
/Users/fatih/Code/Playground/tutorlog-web

Design intent:
- Public routes remain marketing-oriented.
- Preserve the current public design and composition.
- Protected routes remain a playful editorial planner workspace.
- Build toward shared foundation + surface adapters.
- Share only components whose semantics, interaction, state model, or base dimensions genuinely match.

Read before auditing:
- AGENTS.md
- app/globals.css
- css/tutorlog-web.css
- css/tutorlog-web-mobile.css
- css/site.css
- components/app-ui/README.md
- components/app-ui/app-ui.module.css
- docs/superpowers/specs/2026-07-13-protected-app-visual-system-design.md
- docs/superpowers/specs/2026-07-15-public-protected-shared-foundation-design.md
- relevant public and protected component files and consumers

Scope:
- Public: /, /fitur, /harga, /panduan, /kontak, public auth and legal surfaces where shared components appear.
- Protected: /app, /app/rekap, /app/invoice, /app/profil, and the shared app shell.

Step 1. Audit only. Do not edit code.

Produce:
1. A one-sentence Design Read for public routes and another for protected routes.
2. Current DESIGN_VARIANCE, MOTION_INTENSITY, and VISUAL_DENSITY readings for each surface, with one-line reasoning.
3. Brand and semantic token inventory: color, typography, spacing, radius, elevation, motion, focus, control sizing, breakpoints, and icon rules.
4. Component inventory with every current public and protected owner and consumer.
5. Evidence of duplication, API drift, state drift, and visual drift.
6. A component-sharing matrix with these columns:
   Component
   Current public owner
   Current protected owner
   Shared semantics
   Visual differences
   Classification
   Proposed foundation
   Public adapter
   Protected adapter
   Migration risk
7. Classify every candidate as:
   Share foundation
   Share through adapters
   Keep surface-specific
   Retire after migration
8. A proposed token-layer map: brand, shared component, public surface, and protected surface.
9. A preservation baseline listing public compositions and protected behaviors that must remain unchanged.
10. A recommended component-family migration order.

Decision rules:
- Do not share components merely because their markup looks similar.
- Hero, marketing sections, protected surfaces, tables, summary bands, data rows, and decorations remain surface-specific unless the audit proves otherwise.
- Do not propose route, workflow, business-logic, field-mapping, quota, auth, invoice, PDF, legal-copy, analytics, dependency, package, build, environment, or CI changes.
- Do not create a new external design-system dependency.
- Do not modify files, stage changes, commit, or update a ledger.

Post the audit in writing and stop for approval.
```

## Ready-to-Paste Prompt 2: Contract and Migration

```text
Continue from the approved TutorLog public and protected design-system audit.

Architecture:
Shared foundation + surface adapters.

Public routes remain marketing-oriented and preserve their current composition. Protected routes remain a product workspace using the approved playful editorial planner system. Shared components may normalize justified details such as control height, focus ring, state behavior, icon alignment, or touch targets. List every visible adjustment.

Step 1. Write the design-system contract before editing code.

Define:
- Token layers and exact ownership
- Shared component APIs
- Public adapter APIs
- Protected adapter APIs
- Allowed variants and forbidden variants
- Loading, hover, active, focus, disabled, error, and reduced-motion states
- Responsive behavior and touch-target rules
- Consumer migration map
- File ownership and import boundaries
- Component-family migration order
- Per-family verification plan

Keep Card, Surface, hero, page sections, tables, summaries, data rows, and decoration separate unless the approved audit explicitly says otherwise.

Post the contract in writing and stop for approval. Do not edit application code yet.

Step 2. After approval, follow AGENTS.md Git rules. If currently on develop, create an appropriately named branch before changing application code. Do not create a worktree unless explicitly requested.

Implement one approved component family at a time:
1. Shared tokens and interaction states
2. Button and IconButton
3. Field foundation and compatible controls
4. Dialog foundation
5. Navigation behavior
6. Footer frame only if approved by the audit

For every family:
- Add or extract the smallest shared foundation.
- Keep public and protected adapters explicit.
- Preserve existing component APIs when practical. Document intentional API changes.
- Migrate only relevant consumers.
- Avoid unrelated refactors.
- Review the focused diff.
- Run git diff --check unless explicitly skipped.
- Report affected routes and checks not run.
- Stop for review if implementation needs a contract change or creates a material visual change.

Do not change:
- Routes, navigation labels, page hierarchy, or public section order
- Protected workflow, field order, validation, data mapping, quota, auth, or export behavior
- Invoice preview or PDF output
- Legal copy or analytics hooks
- Dependencies, package files, build config, environment config, or CI

Final written audits:

Public:
- Relevant TasteSkill Pre-Flight items
- Brand fidelity
- Hero and section preservation
- CTA consistency
- Responsive composition
- Decoration and motion

Protected:
- State completeness
- Form and table density
- Focus, Escape, scroll lock, and focus return
- Touch targets
- Loading, empty, error, and locked states
- Decoration isolation
- Reduced motion

Cross-surface:
- Token consistency
- Duplicate-component inventory
- Radius and spacing semantics
- Icon family and sizing
- Shared-state parity
- Public preservation audit listing every visible change
- Protected regression audit
- Visible-copy audit with zero em dash or en dash characters in newly touched copy

Any Fail blocks completion.

Before merge or sync to develop, stop and ask whether to run or skip:
- Tests
- Responsive sweep
- Accessibility check
- Visual regression
- PDF export test

Do not merge, push, or open a PR without explicit approval.
```

## Spec Self-Review

- No placeholder or unresolved decision remains in the architecture.
- Public preservation and protected product boundaries are explicit.
- The shared-component rule is based on semantics and behavior, not visual similarity.
- TasteSkill scope is limited where its marketing rules do not fit product UI.
- Audit, contract, implementation, verification, and Git approval gates do not conflict.
- Implementation remains a separate approved step.
