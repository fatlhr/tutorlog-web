# Homepage PR Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the demo disclosure, dialog keyboard-accessibility, and generated-artifact findings so `feat/homepage-redesign` is ready for a pull request into `develop`.

**Architecture:** Add one focused client hook for modal keyboard and scroll behavior, then adopt it in the existing demo and product-proof dialogs without changing their visual structure. Cover each migration with a Playwright red-green cycle and remove Playwright output from Git tracking.

**Tech Stack:** Next.js 16, React 19, TypeScript, Playwright, existing CSS.

## Global Constraints

- Keep the `Lihat demo` CTA and existing dummy YouTube URL.
- Visible dialog copy must state that the video is temporary placeholder content, not a real TutorLog recording.
- Do not add dependencies or replace the existing dialog markup with a modal library.
- Preserve Escape, backdrop close, and trigger-focus restoration behavior.
- Lock body scrolling only while a dialog is open.
- Do not modify the `/app` redesign.
- Do not rewrite published branch history.
- Run targeted tests only; do not run responsive, visual-regression, accessibility, or full test suites for this PR into `develop`.

---

## File Structure

- Create `components/useAccessibleDialog.ts`: shared focus trap, Escape handling, focus restoration, and body scroll lock.
- Create `tests/public-dialogs.spec.ts`: focused browser regression coverage for the two public dialog types.
- Modify `components/LandingDemoDialog.tsx`: honest placeholder copy and shared dialog behavior.
- Modify `components/PublicProofDialog.tsx`: shared dialog behavior.
- Remove tracked `test-results/.last-run.json`: keep generated Playwright state out of the PR.

### Task 1: Demo Disclosure and Accessible Dialog Hook

**Files:**
- Create: `components/useAccessibleDialog.ts`
- Create: `tests/public-dialogs.spec.ts`
- Modify: `components/LandingDemoDialog.tsx`

**Interfaces:**
- Produces: `useAccessibleDialog({ open, onClose, triggerRef, dialogRef, initialFocusRef }): void`
- `triggerRef`, `dialogRef`, and `initialFocusRef` are `RefObject<HTMLElement | null>`.

- [ ] **Step 1: Write failing demo-dialog tests**

Create `tests/public-dialogs.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.describe('Public dialogs', () => {
  test('demo discloses placeholder content and contains keyboard focus', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Lihat demo' });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Preview sementara TutorLog' });
    const close = dialog.getByRole('button', { name: 'Tutup demo' });
    const frame = dialog.locator('iframe');

    await expect(dialog).toContainText('Video contoh sementara');
    await expect(dialog).toContainText('Rekaman TutorLog sedang disiapkan');
    await expect(frame).toHaveAttribute('title', 'Video contoh sementara');
    await expect(close).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

    await page.keyboard.press('Shift+Tab');
    await expect(frame).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Start the isolated server:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3100
```

In another shell run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npx playwright test tests/public-dialogs.spec.ts --grep "demo discloses"
```

Expected: FAIL because `Preview sementara TutorLog`, placeholder disclosure copy, scroll locking, and focus wrapping do not exist.

- [ ] **Step 3: Implement the shared hook**

Create `components/useAccessibleDialog.ts`:

```ts
"use client";

import type { RefObject } from "react";
import { useEffect } from "react";

type AccessibleDialogOptions = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'iframe',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function useAccessibleDialog({
  open,
  onClose,
  triggerRef,
  dialogRef,
  initialFocusRef,
}: AccessibleDialogOptions) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    initialFocusRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => triggerRef.current?.focus());
    };
  }, [dialogRef, initialFocusRef, onClose, open, triggerRef]);
}
```

- [ ] **Step 4: Adopt the hook and correct demo disclosure**

In `components/LandingDemoDialog.tsx`:

```tsx
import { useCallback } from "react";
import useAccessibleDialog from "@/components/useAccessibleDialog";

const dialogRef = useRef<HTMLElement>(null);
const close = useCallback(() => setOpen(false), []);
useAccessibleDialog({ open, onClose: close, triggerRef, dialogRef, initialFocusRef: closeRef });
```

Attach `ref={dialogRef}` and change the dialog content to:

```tsx
<section
  ref={dialogRef}
  className="tl-demo-dialog"
  role="dialog"
  aria-modal="true"
  aria-label="Preview sementara TutorLog"
  onMouseDown={(event) => event.stopPropagation()}
>
  <div className="tl-demo-dialog-header">
    <div>
      <p className="tl-kicker">Video contoh sementara</p>
      <h2>Melihat format demo.</h2>
      <p>Rekaman TutorLog sedang disiapkan. Video ini dipakai sementara untuk mencoba tampilan pemutar.</p>
    </div>
    <button ref={closeRef} className="tl-demo-close" type="button" aria-label="Tutup demo" onClick={close}>
      <X size={20} weight="bold" aria-hidden="true" />
    </button>
  </div>
  <div className="tl-demo-video">
    <iframe
      src={demoUrl}
      title="Video contoh sementara"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  </div>
</section>
```

- [ ] **Step 5: Run the targeted test and verify GREEN**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npx playwright test tests/public-dialogs.spec.ts --grep "demo discloses"
```

Expected: `1 passed`.

- [ ] **Step 6: Commit Task 1**

```bash
git add components/useAccessibleDialog.ts components/LandingDemoDialog.tsx tests/public-dialogs.spec.ts
git commit -m "fix: make landing demo dialog accessible"
```

### Task 2: Product Proof Dialog Accessibility

**Files:**
- Modify: `tests/public-dialogs.spec.ts`
- Modify: `components/PublicProofDialog.tsx`

**Interfaces:**
- Consumes: `useAccessibleDialog({ open, onClose, triggerRef, dialogRef, initialFocusRef }): void` from Task 1.

- [ ] **Step 1: Add a failing product-proof dialog test**

Append inside the existing `test.describe`:

```ts
test('product proof traps focus and restores the trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Perbesar Mobile' }).first();
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Perbesar tampilan TutorLog' });
  const close = dialog.getByRole('button', { name: 'Tutup tampilan' });
  await expect(close).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
});
```

- [ ] **Step 2: Run the test and verify RED**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npx playwright test tests/public-dialogs.spec.ts --grep "product proof traps"
```

Expected: FAIL because focus can leave the proof dialog and body scrolling is not locked.

- [ ] **Step 3: Adopt the hook in `PublicProofDialog`**

Add the hook and dialog ref:

```tsx
import { useCallback } from "react";
import useAccessibleDialog from "@/components/useAccessibleDialog";

const dialogRef = useRef<HTMLElement>(null);
const close = useCallback(() => setOpen(false), []);
useAccessibleDialog({ open, onClose: close, triggerRef, dialogRef, initialFocusRef: closeRef });
```

Attach `ref={dialogRef}` to the dialog `<section>` and remove the component-local `useEffect`, keydown listener, and manual focus-restoration code.

- [ ] **Step 4: Run all public-dialog tests and verify GREEN**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npx playwright test tests/public-dialogs.spec.ts
```

Expected: `2 passed`.

- [ ] **Step 5: Commit Task 2**

```bash
git add components/PublicProofDialog.tsx tests/public-dialogs.spec.ts
git commit -m "fix: contain focus in product proof dialogs"
```

### Task 3: Generated Artifact Cleanup and PR Verification

**Files:**
- Remove from Git: `test-results/.last-run.json`

**Interfaces:**
- No runtime interface changes.

- [ ] **Step 1: Remove tracked Playwright state**

```bash
git rm test-results/.last-run.json
git check-ignore -v test-results/.last-run.json
```

Expected: the file is staged for deletion and `/test-results/` is reported from `.gitignore`.

- [ ] **Step 2: Verify targeted behavior**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npx playwright test tests/public-dialogs.spec.ts
```

Expected: `2 passed` and generated files remain ignored.

- [ ] **Step 3: Run static verification**

```bash
npm run lint
npm run build
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 4: Review branch scope**

```bash
git status --short
git diff --stat origin/develop...HEAD
git diff --name-only origin/develop...HEAD | rg '^app/app/|^components/App|^components/Rekap|^docs/app-audit-redesign'
```

Expected: only `test-results/.last-run.json` remains staged before the cleanup commit; the final `rg` command returns no matches.

- [ ] **Step 5: Commit cleanup**

```bash
git add -u test-results/.last-run.json
git commit -m "chore: remove tracked Playwright results"
```

- [ ] **Step 6: Push and verify remote SHA**

```bash
git push origin feat/homepage-redesign
git rev-parse HEAD
git rev-parse origin/feat/homepage-redesign
```

Expected: both SHAs are identical.

- [ ] **Step 7: Prepare PR summary**

Include:

```markdown
## Summary
- rebuild the public landing, feature, guide, pricing, and authentication pages around a shared TutorLog visual system
- use real TutorLog product proof with responsive, keyboard-accessible preview dialogs
- add an honest temporary demo preview and responsive/accessibility regression coverage

## Verification
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npx playwright test tests/public-dialogs.spec.ts`
- `npm run lint`
- `npm run build`
- `git diff --check`

## Known limitation
- the landing demo intentionally uses placeholder video content and labels it clearly while the TutorLog recording is prepared
```
