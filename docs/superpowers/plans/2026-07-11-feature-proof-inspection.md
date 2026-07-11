# Feature Proof Inspection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/fitur` denser at desktop and tablet widths, let every product proof open in an accessible enlarged view, and make returning to the public landing explicit.

**Architecture:** `PublicProductProof` gains a client leaf trigger that opens a single reusable proof dialog. Its media is supplied by the proof component, so the existing mobile images, recap composite, and `TplModern` invoice remain the source of truth. The feature page owns longer desktop copy and short platform indicators; CSS owns compact proof geometry and preserves the existing one-column mobile order.

**Tech Stack:** Next.js Server Components and client leaves, existing `@phosphor-icons/react`, existing CSS, Playwright, Axe.

## Global Constraints

- Scope is `/fitur` plus the shared public navigation used by `/fitur`, `/harga`, and `/panduan`; landing `/` does not show a back link.
- Keep four paired rows: mobile session logging, mobile history revision, mobile/web recap and export, web invoice creation.
- Desktop and tablet proof triggers are compact: portrait images `188px` desktop and `168px` tablet; recap/invoice surface maximum `280px` desktop and `248px` tablet.
- Every proof trigger opens an accessible dialog. Escape and the close control close it; focus returns to the trigger. Mobile keeps the same capability.
- Copy gets a plain platform indicator, never a card or ledger: `Mobile`, `Mobile dan web`, or `Web`.
- Mobile copy stays direct. Proof follows its matching copy and remains centered. No global rail, sticky proof, step label, or animated arrow is introduced.
- Back navigation is a visible text link `Beranda` with a left arrow on `/fitur`, `/harga`, and `/panduan`; the logo remains the home link. It is omitted on `/`.
- Do not stage `live-screenshots/`, `.superpowers/`, `AGENTS.md`, or test artifacts.

### Task 1: Test the proof inspection and home-navigation contracts

**Files:**
- Modify: `tests/responsive-sweep.spec.ts`

**Interfaces:**
- Requires a dialog named `Perbesar tampilan TutorLog` and trigger labels starting with `Perbesar`.
- Requires `.tl-public-back-link` to exist on `/fitur`, `/harga`, and `/panduan`, but not `/`.

- [x] Add a failing test at `1440px` that checks every `[data-feature-row]` has one proof button, opens the mobile proof dialog, checks visible dialog content, presses Escape, and confirms focus returns to the clicked trigger.
- [x] Add a failing test at `390px` and `516px` that checks every proof follows its row copy and the four trigger buttons remain visible without horizontal overflow.
- [x] Add a failing test at `1440px` and `1024px` that checks the mobile proof width is at most `188px` desktop and `168px` tablet, and that every proof label aligns with the platform indicator within `2px`.
- [x] Add a failing navigation test for `.tl-public-back-link` on `/fitur`, `/harga`, `/panduan`, and absence on `/`.
- [x] Run `rtk PLAYWRIGHT_BASE_URL=http://localhost:3001 npx playwright test tests/responsive-sweep.spec.ts --grep "Feature proof inspection|Public home navigation"` and confirm it fails because the trigger and link are absent.

### Task 2: Build the reusable enlarged proof dialog

**Files:**
- Create: `components/PublicProofDialog.tsx`
- Modify: `components/PublicProductRail.tsx`

**Interfaces:**
- `PublicProofDialog` is a client component accepting `{ label, proofId, triggerContent, dialogContent }` and renders a trigger plus a dialog named `Perbesar tampilan TutorLog`.
- `PublicProductProof` wraps each existing proof surface with `PublicProofDialog`, preserving `data-rail-proof` on the figure and intrinsic image dimensions.

- [x] Implement the dialog with `useState`, trigger ref, close ref, Escape handling, focus on close control when opened, and focus restoration on close.
- [x] Use `MagnifyingGlassPlus` for the trigger affordance and `X` for close, from the existing Phosphor package.
- [x] Keep the actual proof in the trigger visually compact. Render a larger copy in the dialog: image proofs at natural constrained dimensions, recap composite intact, and `TplModern` at readable scaled A4 size.
- [x] Run the targeted inspection test and confirm dialog open/close and focus behavior pass.

### Task 3: Compact the feature rows and add platform context

**Files:**
- Modify: `app/fitur/page.tsx`
- Modify: `css/site.css`

**Interfaces:**
- Add `.tls-feature-platform` before each row heading with exact labels: `Mobile`, `Mobile`, `Mobile dan web`, `Web`.
- Feature row proof trigger stays right of the divider at desktop/tablet and follows copy at mobile.

- [x] Expand each desktop paragraph to two precise sentences about the named capability while retaining a direct one-sentence mobile rendering through responsive CSS content handling or short source copy that stays readable at mobile.
- [x] Add the four platform labels and scope their visual styling to feature rows.
- [x] Set desktop row proof surfaces to compact fixed widths, align the proof label with the platform indicator/heading region, and size row spacing from copy rather than portrait-image height.
- [x] Set tablet widths and gaps per the global constraints. Mobile keeps proof width at most `232px`, no proof annotation, and a compact gap after its matching copy.
- [x] Add dialog styles as one framed tool, including backdrop, close button, viewport-safe media sizing, and reduced-motion-safe transitions.
- [x] Run the feature paired-row and proof-inspection tests. Inspect `1440x900`, `1024x768`, `516x939`, and `390x844` screenshots generated under Playwright output paths.

### Task 4: Expose explicit return-to-home navigation

**Files:**
- Modify: `components/PublicNav.tsx`
- Modify: `css/site.css`

**Interfaces:**
- `PublicNav` derives `showBackLink` from `usePathname() !== "/"` and displays `<Link className="tl-public-back-link" href="/">Beranda</Link>` only on `/fitur`, `/harga`, and `/panduan`.

- [x] Add the back link beside the brand without displacing the desktop nav links or right-aligned login control.
- [x] At mobile, retain the two-sided nav layout with the hamburger at the right gutter; the link must not compete with the wordmark.
- [x] Run the navigation contract test and keyboard focus checks for the link and mobile menu.

### Task 5: Regression and self-review

**Files:**
- Modify: `docs/public-story-rail.md`
- Test: `tests/responsive-sweep.spec.ts`, `tests/a11y.spec.ts`

- [x] Document that `/fitur` presents compact paired proofs with inspection dialog, while `/panduan` retains its pinned rail.
- [x] Run `rtk git diff --check`.
- [x] Run `rtk npm run lint`.
- [x] Run `rtk npm run build`.
- [x] Run `rtk PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:responsive`.
- [x] Run `rtk PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:a11y`.
- [ ] Verify the staged diff contains only source, tests, and docs related to this plan, then commit with `feat: add inspectable feature proofs`.
