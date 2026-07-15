# TutorLog Shared UI Foundation Contract

**Status:** Gate 2 contract draft. Awaiting approval.

**Mode:** Preserve public marketing design and protected product behavior.

**Architecture:** Shared foundation with explicit public and protected adapters.

## 1. Authority and boundaries

Authority order:

1. Existing product behavior, route behavior, and data flow.
2. `AGENTS.md`.
3. `docs/superpowers/specs/2026-07-15-public-protected-shared-foundation-design.md`.
4. `docs/superpowers/specs/2026-07-13-protected-app-visual-system-design.md` for protected UI.
5. This shared-foundation contract.
6. TasteSkill v2 rules that fit the relevant surface.

TasteSkill is authoritative for public marketing composition and its anti-slop audit. It is not used to redesign protected tables, forms, data rows, route structure, or multi-step product UI.

This contract does not change:

- Route structure, page hierarchy, navigation labels, headings, or anchors.
- Public section order, hero composition, pricing flow, or CTA intent.
- Protected workflow, form order, validation, data mapping, quota, auth, or export behavior.
- Invoice preview, invoice templates, or PDF output.
- Legal copy, metadata, or analytics hooks.
- Dependencies, package files, build configuration, environment configuration, or CI.

## 2. File ownership

### 2.1 Shared foundation

```text
css/tutorlog-foundation.css
components/ui/control-types.ts
components/ui/button-primitive.tsx
components/ui/field-contract.ts
components/ui/use-dialog-behavior.ts
components/ui/navigation-link-primitive.tsx
components/ui/footer.tsx
components/ui/footer.module.css
```

Responsibilities:

- `css/tutorlog-foundation.css` owns shared brand tokens, shared semantic state tokens, spacing values, focus tokens, and reduced-motion defaults.
- `control-types.ts` owns shared control sizes, non-visual attributes, and discriminated button/link behavior types.
- `button-primitive.tsx` owns native button versus link rendering, loading semantics, activation blocking, and content slots. It does not own public or protected visual classes.
- `field-contract.ts` owns deterministic helper/error IDs and `aria-describedby` composition. It does not require React context.
- `use-dialog-behavior.ts` owns focus trap, Escape dismissal, scroll lock, scrollbar compensation, and focus return.
- `navigation-link-primitive.tsx` owns link rendering and `aria-current` behavior. It does not own navbar or app-navigation layout.
- `footer.tsx` and `footer.module.css` own the existing cross-surface footer and its visual treatment.

### 2.2 Public adapters

```text
components/public-ui/marketing-button.tsx
components/public-ui/public-icon-button.tsx
components/public-ui/public-field.tsx
components/public-ui/public-dialog-frame.tsx
components/PublicNav.tsx
components/MenuToggle.tsx
components/HamburgerMenu.tsx
```

Public adapters own marketing dimensions, shadows, typography treatment, navigation composition, and dialog presentation. Hero, story layout, product proof, pricing, and decoration stay in their current public components.

### 2.3 Protected adapters

Protected adapters remain in:

```text
components/app-ui/controls.tsx
components/app-ui/navigation.tsx
components/app-ui/overlays.tsx
components/app-ui/app-ui.module.css
```

The protected public API remains stable. Route code continues importing protected components from `components/app-ui/*`.

Protected-only components remain protected-only:

- `Surface`
- `PageHeader`
- `SectionHeading`
- `Section`
- `SummaryBand`
- `FeedbackMessage`
- `DataRow`
- `SegmentedNavigation`
- `ChoiceGroup`
- `BottomSheet`
- `SidePanel`
- `EmptyState`
- `LoadingState`
- `LoadingLayout`
- `ErrorState`
- `RouteCanvas`
- `PageMain`

## 3. Dependency direction

Allowed imports:

```text
public adapter -> shared foundation
protected adapter -> shared foundation
route or feature -> its own surface adapter
shared footer -> shared foundation tokens
```

Forbidden imports:

```text
public route -> components/app-ui/*
protected route -> components/public-ui/*
shared foundation -> public adapter
shared foundation -> protected adapter
shared foundation -> route or feature code
```

Temporary compatibility re-exports are allowed while consumers migrate. They must be removed after the final consumer moves.

## 4. Server and client boundary

- `button-primitive.tsx`, `navigation-link-primitive.tsx`, and `field-contract.ts` must remain free of a top-level `"use client"` directive.
- Public server routes may use server-safe adapters for links, form submits, and static controls.
- A shared primitive imported by a client adapter may participate in that client bundle without forcing unrelated public routes into a client boundary.
- `use-dialog-behavior.ts` is explicitly client-only.
- The foundation may not introduce global React state or a provider at the root layout.
- Continuous animation state remains outside the shared foundation.

## 5. Shared tokens

### 5.1 Brand roles

```css
--tl-brand-action: #006c53;
--tl-brand-action-hover: #00523f;
--tl-brand-on-action: #ffffff;
--tl-brand-success: #006c53;
--tl-brand-warning: #8a5a00;
--tl-brand-warning-soft: #ffe3a3;
--tl-brand-error: #d9706a;
--tl-brand-info: #235c8f;
--tl-brand-info-soft: #d7e9ff;
```

Existing `--tw-*` and `--app-*` variables become compatibility aliases during migration. They are not removed in the same task that introduces the shared tokens.

Surface-specific colors remain separate:

- Public canvas, ink, lavender, peach, and marketing gradients.
- Protected canvas, paper, ink hierarchy, route accents, and disabled colors.

### 5.2 Spacing

The shared scale is:

```css
--tl-space-0: 0;
--tl-space-1: 2px;
--tl-space-2: 4px;
--tl-space-3: 8px;
--tl-space-4: 12px;
--tl-space-5: 16px;
--tl-space-6: 20px;
--tl-space-7: 24px;
--tl-space-8: 32px;
--tl-space-9: 40px;
--tl-space-10: 48px;
--tl-space-11: 64px;
```

Protected `--space-*` variables become aliases. Public layout spacing is not bulk-rewritten. Public adapters use shared spacing only when a touched control maps cleanly to the scale.

### 5.3 Radius roles

Shared semantic names:

```css
--tl-radius-small: 6px;
--tl-radius-control: 10px;
--tl-radius-surface: 14px;
--tl-radius-overlay: 18px;
--tl-radius-round: 999px;
```

These names do not require every surface to use the same radius. Public marketing cards may retain 22px or 32px. Public proof dialogs may retain 8px. A visible radius adjustment is allowed only for a touched control with the same semantic role and must be listed during review.

### 5.4 Focus and motion

Shared focus contract:

- Keyboard focus uses a minimum 2px green outline with a 2px offset.
- Filled primary controls may use a paper halo and green outer ring.
- Focus remains visible under reduced motion.
- Product-proof triggers may retain a 3px ring because the focused target is a media surface.

Shared motion contract:

- Hover and active feedback animate only color, background, border, transform, and opacity.
- Pressed controls translate down by 1px. They do not scale.
- Reduced motion removes non-essential transforms and entrance animation.
- Public GSAP storytelling remains public-only.
- Protected overlay and state motion remains protected-only.

## 6. Shared behavior APIs

### 6.1 Control types

```ts
export type SharedControlSize = "compact" | "default" | "large";

export interface SharedNonVisualAttributes {
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "data-analytics-id"?: string;
}
```

Visual escape hatches are forbidden in route-facing component APIs:

- `className`
- `style`
- arbitrary color
- arbitrary radius
- numeric gap or padding
- arbitrary icon size
- arbitrary animation props

Internal primitives may accept adapter class slots. Those props are not exported through public or protected route-facing APIs.

### 6.2 Button primitive

Shared behavior props:

```ts
interface SharedButtonBehavior {
  children: React.ReactNode;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  block?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

type SharedButtonAction =
  | {
      href?: never;
      type?: "button" | "submit" | "reset";
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
      disabled?: boolean;
    }
  | {
      href: string;
      type?: never;
      onClick?: React.MouseEventHandler<HTMLAnchorElement>;
      disabled?: never;
      target?: "_blank";
      rel?: string;
    };
```

Behavior rules:

- Loading retains control width and exposes `aria-busy="true"`.
- Loading blocks repeat activation.
- A loading link exposes `aria-disabled="true"` and prevents navigation.
- Disabled links are forbidden.
- External links preserve explicit `target` and `rel`.
- Labels remain one line at desktop.

### 6.3 Adapter variants

Public `MarketingButton`:

```ts
variant: "primary" | "secondary" | "editorial"
size: "compact" | "default" | "large"
```

Public size mapping:

| Size | Height | Current consumer |
| --- | ---: | --- |
| compact | 46px | price actions |
| default | 50px | hero and story CTA |
| large | 52px | auth submit |

The 38px public nav login remains navigation composition and does not use `MarketingButton`.

Protected `Button` keeps:

```ts
variant: "primary" | "secondary" | "quiet"
size: "compact" | "default" | "large"
```

Protected size mapping remains 40px, 44px, and 48px.

Public and protected adapters may map the same behavior to different typefaces, borders, shadows, and dimensions.

### 6.4 IconButton adapters

Shared behavior:

- Required accessible label.
- Native button semantics.
- `disabled`, `loading`, `pressed`, and `aria-busy` support.
- Icon size comes from adapter size, not caller input.

Public adapter sizes preserve 38px proof close, 40px demo close, and 44px mobile-menu close through named adapter sizes. Protected sizes remain 40px, 44px, and 48px.

### 6.5 Field contract

```ts
export interface FieldDescription {
  helperId?: string;
  errorId?: string;
  describedBy?: string;
  invalid: boolean;
}

export function getFieldDescription(
  controlId: string,
  helper?: string,
  error?: string,
  externalDescribedBy?: string,
): FieldDescription;
```

Rules:

- Label remains above its control.
- Helper and error IDs are deterministic.
- Helper and error may coexist.
- Error uses `role="alert"`.
- Public login may remain uncontrolled through `defaultValue`.
- Protected form controls remain controlled.
- Select, DateField, and Textarea remain protected-only until a real public consumer exists.

### 6.6 Dialog behavior

```ts
interface DialogBehaviorOptions {
  open: boolean;
  onClose: () => void;
  dismissible?: boolean;
  panelRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function useDialogBehavior(options: DialogBehaviorOptions): void;
```

Behavior rules:

- Focus moves into the overlay after opening.
- Tab and Shift+Tab remain inside the overlay.
- Escape closes only when dismissible.
- Body scroll is locked with scrollbar compensation.
- Focus returns to the explicit return target or previously focused element.
- Nested overlays throw during development.
- Scrim click remains a frame-level decision.
- Portal rendering and responsive availability remain protected frame decisions.

Public demo and proof frames retain their widths, radius, content layout, and media treatment.

### 6.7 Navigation primitive

```ts
interface NavigationLinkPrimitiveProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
}
```

The primitive owns internal link rendering and `aria-current="page"`. Public and protected adapters own classes, icon placement, underline, route tone, top or bottom layout, and responsive visibility.

## 7. State requirements

Every shared interactive family supports the states relevant to its semantics:

| Family | Required states |
| --- | --- |
| Button | default, hover, active, focus, disabled, loading |
| IconButton | default, hover, active, focus, disabled, loading, pressed when applicable |
| Field | default, filled, hover, focus, invalid, disabled, helper, error |
| Navigation link | default, hover, active route, focus |
| Dialog behavior | closed, opening, open, dismissing, reduced motion |

Public marketing adapters may use lift and shadow where currently present. Protected operational controls remain flat except for overlay elevation.

## 8. Responsive contract

Shared breakpoint:

- `<768px`: mobile interaction floor.
- `>=768px`: desktop and tablet control sizing may apply.

Shared touch rules:

- Mobile interactive targets are at least 44px by 44px.
- A smaller visual icon may sit inside a 44px hit target.
- Button labels do not wrap on desktop.

Surface-specific behavior:

- Public hero, story rail, pricing, and mobile menu keep their current collapse rules.
- Protected page rhythm keeps its 768px, 1100px, and 1200px contracts.
- Public motion and protected route motion remain separate.

## 9. Consumer migration map

### Button family

- `app/page.tsx`: hero and final CTA.
- `app/fitur/page.tsx`: Play Store CTA.
- `app/panduan/page.tsx`: help CTA.
- `app/harga/page.tsx`: plan actions.
- `app/login/page.tsx`: submit action.
- `app/login/sent/page.tsx`: mail and resend actions where compatible.
- `components/LandingDemoDialog.tsx`: editorial demo trigger.
- Existing protected Button consumers migrate internally without changing route imports.

### IconButton family

- `components/PublicProofDialog.tsx` close action.
- `components/LandingDemoDialog.tsx` close action.
- `components/HamburgerMenu.tsx` close action.
- `components/MenuToggle.tsx` menu trigger if the hamburger composition remains intact.
- Existing protected IconButton consumers migrate internally.

### Field family

- `app/login/page.tsx`: email field only.
- `app/login/sent/page.tsx`: only fields proven compatible during implementation.
- Protected Field consumers migrate internally without changing form state or validation.

### Dialog family

- `components/LandingDemoDialog.tsx`.
- `components/PublicProofDialog.tsx`.
- `components/NamePromptDialog.tsx`.
- `components/PaywallDialog.tsx`.
- Protected `Dialog`, `BottomSheet`, and `SidePanel` frames.

### Navigation family

- `components/PublicNav.tsx`.
- `components/HamburgerMenu.tsx`.
- `components/AppTopBar.tsx` through protected `NavigationItem`.
- `components/TabBar.tsx` through protected `NavigationItem`.

### Footer family

- `components/PublicShell.tsx`.
- `components/PublicStoryLayout.tsx`.
- `app/page.tsx`.
- `components/app-ui/app-shell-footer.tsx`.

## 10. Legacy retirement

After migration and a final import audit, remove:

- `components/Button.tsx`
- `components/Input.tsx`
- `components/Modal.tsx`
- `components/Card.tsx`
- `components/Navbar.tsx`
- `components/Footer.tsx`

Related global selectors may be removed only when a selector-level search proves no active consumer remains. Do not combine broad `site.css` cleanup with a component-family migration commit.

## 11. Migration sequence and review gates

1. Shared tokens and compatibility aliases.
2. Button primitive and public/protected adapters.
3. IconButton adapters.
4. Field description contract and login field.
5. Dialog behavior and existing frames.
6. Navigation link primitive and adapters.
7. Footer ownership migration.
8. Legacy component retirement.
9. Cross-surface audit.

Each numbered item is a separate reviewable unit. A unit may contain multiple commits only when implementation and migration need separate rollback points.

Any contract change, visible public composition change, protected API change, or new dependency stops implementation for approval.

## 12. Verification contract

Per component family:

- Review the focused diff.
- Run `rtk git diff --check`.
- Confirm no unrelated files are staged.
- Run a static consumer search.
- Run targeted type and contract checks only when requested under repository policy.
- Review affected routes at 1440x900, 1024x768, and 390x844 when visual QA is approved.

Interaction checks when the family requires them:

- Keyboard focus visibility.
- Enter and Space activation for native controls.
- Loading activation blocking.
- Escape dismissal.
- Focus trap and focus return.
- Scroll lock and scrollbar compensation.
- Mobile touch targets.
- Reduced motion.

Public preservation checks:

- Schedule-grid homepage canvas remains intact.
- Hero and product-proof composition remain intact.
- Public section order and CTA intent remain intact.
- Public control dimensions match the approved adapter mapping.
- No new marketing layout family is introduced.

Protected preservation checks:

- Existing route imports remain stable where specified.
- Field order, form state, validation, and data behavior remain unchanged.
- Existing paper, route accent, data row, summary, and overlay composition remain intact.
- Invoice and PDF code remain untouched unless separately approved.

Before merge or sync to `develop`, ask whether to run or skip:

- Tests
- Responsive sweep
- Accessibility check
- Visual regression
- PDF export test

No completion claim is allowed while any requested check fails or a visible adjustment is undocumented.

## 13. Contract self-review

- Shared ownership and adapter ownership are explicit.
- Server and client boundaries are explicit.
- Public and protected component APIs do not import each other.
- Public visual dimensions are preserved through named adapter sizes.
- Protected route-facing APIs remain stable.
- Overlay behavior is shared without forcing a shared overlay layout.
- Field semantics are shared without forcing public forms to become controlled.
- Legacy cleanup is isolated from migration commits.
- No product, route, invoice, PDF, auth, quota, or business-logic change is included.
