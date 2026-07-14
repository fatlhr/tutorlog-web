# TutorLog Protected App Design-System Contract

**Status:** Step 2A approved on 2026-07-13

**Mode:** Preserve-brand visual overhaul

**Routes:** `/app`, `/app/rekap`, `/app/invoice`

**Reference route:** `/app` Beranda

**Dials:** `DESIGN_VARIANCE 5`, `MOTION_INTENSITY 5`, `VISUAL_DENSITY 5`

## 1. Design read and authority

Reading this as: protected workspace untuk tutor privat individual, dengan bahasa playful editorial planner yang dibangun sebagai internal React design system di atas identitas kertas, hijau, Courier Prime, dan Source Serif TutorLog.

Urutan authority tetap:

1. Existing product behavior and data flow.
2. `docs/superpowers/plans/2026-07-12-app-foundation-redesign.md`.
3. Existing TutorLog colors, fonts, logo, copy, and accessibility behavior.
4. Kontrak visual ini.

Kontrak ini tidak mengubah route, navigation labels, field names, field order, heading semantics, anchor IDs, accessible names, analytics hooks, Supabase queries, data model, quota, draft persistence, authentication, PDF generation, atau payment boundary.

`Internal React design system` di kontrak ini berarti komponen lokal yang dipakai ulang oleh protected routes. Ini bukan package, framework, atau standalone component library baru. Business logic tetap berada di route dan feature code, sesuai batas arsitektur plan.

Tema protected app dikunci ke light paper theme. Dark mode tidak ditambahkan karena itu feature baru dan tidak termasuk scope overhaul ini.

## 2. Foundation tokens

### 2.1 Color roles

```css
.app-shell-h {
  --app-canvas: #F4FAF8;
  --app-paper: #FFFFFF;
  --app-paper-soft: #EDF7F3;
  --app-paper-muted: #E8EFF1;

  --app-ink: #12211F;
  --app-ink-secondary: #3E4944;
  --app-ink-muted: #50645E;
  --app-ink-disabled: #72827D;

  --app-line: #B7D1C8;
  --app-line-strong: #8EADA3;
  --app-overlay: rgb(18 33 31 / 42%);

  --app-action: #006C53;
  --app-action-hover: #00523F;
  --app-on-action: #FFFFFF;

  --app-success: #006C53;
  --app-warning: #8A5A00;
  --app-warning-soft: #FFE3A3;
  --app-error: #D9706A;
  --app-error-ink: #7D302C;
  --app-info: #235C8F;
  --app-info-soft: #D7E9FF;

  --app-home-accent: #D8F1E7;
  --app-home-accent-ink: #006C53;
  --app-recap-accent: #E9E3FA;
  --app-recap-accent-ink: #63548D;
  --app-invoice-accent: #FCE1D9;
  --app-invoice-accent-ink: #805346;
}
```

Role rules:

- `--app-action` is the only primary action fill across routes.
- Route accents identify context. They may color active navigation, a section marker, route eyebrow, and canvas decoration.
- Route accents never replace success, warning, error, or focus colors.
- `--app-paper` is mandatory beneath forms, rows, dialogs, bottom sheets, data, and invoice previews.
- `--app-error` is for border and icon. Error text uses `--app-error-ink` so normal-size copy keeps readable contrast.
- Pure black, random gradients, translucent data surfaces, and page-specific color literals are forbidden.

### 2.2 Spacing scale

Only this scale may be used in protected UI:

```css
--space-0: 0;
--space-1: 2px;
--space-2: 4px;
--space-3: 8px;
--space-4: 12px;
--space-5: 16px;
--space-6: 20px;
--space-7: 24px;
--space-8: 32px;
--space-9: 40px;
--space-10: 48px;
--space-11: 64px;
```

Arbitrary margins or padding values are forbidden. A component may expose named density or padding variants, never a numeric spacing prop.

### 2.3 Typography roles

| Role | Font | Desktop and tablet | Mobile | Weight and detail |
| --- | --- | --- | --- | --- |
| `routeEyebrow` | Courier Prime | 11/16 | 11/16 | 700, uppercase, `0.06em` |
| `pageTitle` | Courier Prime | 28/34 | 24/30 | 700 |
| `sectionTitle` | Courier Prime | 20/26 | 18/24 | 700 |
| `componentTitle` | Courier Prime | 16/22 | 16/22 | 700 |
| `metricValue` | Courier Prime | 24/29 | 20/25 | 700, tabular numbers |
| `bodyLarge` | Source Serif 4 | 16/24 | 16/24 | 400 |
| `body` | Source Serif 4 | 14/21 | 14/21 | 400 |
| `bodySmall` | Source Serif 4 | 13/19 | 13/19 | 400 |
| `label` | Source Serif 4 | 13/18 | 13/18 | 700 |
| `helper` | Source Serif 4 | 12/17 | 12/17 | 400 |
| `navigation` | Source Serif 4 | 13/18 | 12/17 | 700 |
| `data` | Source Serif 4 | 13/18 | 12/17 | 400, tabular numbers for amounts |

Rules:

- Courier Prime is limited to headings, short labels, route context, and important values.
- Source Serif 4 owns instructions, forms, rows, helper copy, and dialogs.
- Headings do not use marketing scale, italics, gradient text, or forced line breaks.
- Only `routeEyebrow` uses tracking and uppercase. Do not repeat it above every section.

### 2.4 Radius scale

```css
--radius-0: 0;
--radius-small: 6px;
--radius-control: 10px;
--radius-surface: 14px;
--radius-overlay: 18px;
--radius-round: 999px;
```

Shape allocation:

- Buttons and segmented items: `--radius-round`.
- Fields, selects, date fields, compact choice cards: `--radius-control`.
- Paper surfaces, summary bands, list containers, feedback messages: `--radius-surface`.
- Dialogs, menus, side panels: `--radius-overlay`.
- Bottom sheets: `--radius-overlay` on top corners and `0` on bottom corners.
- A4 paper and small paper tabs: `--radius-small`.
- Do not clip, rotate, or notch operational surfaces.

### 2.5 Borders and dividers

- Default border: `1px solid var(--app-line)`.
- Strong selected border: `1px solid var(--app-line-strong)` plus the selected background. Selection must not depend on border alone.
- Fields use a 1px idle border. Focus is expressed by the focus ring, not by changing layout thickness.
- A list container owns its outer border. Rows use one bottom divider, with no divider on the final row.
- Open page sections use spacing or one top divider. Do not put both top and bottom borders on every section or row.
- A contextual surface may use one `3px` route-colored leading edge. Data rows and form fields may not.

### 2.6 Elevation

| Token | Value | Usage |
| --- | --- | --- |
| `elevation-flat` | `none` | default surfaces, fields, summary bands, rows |
| `elevation-menu` | `0 8px 24px rgb(18 33 31 / 12%)` | account menu |
| `elevation-overlay` | `0 20px 48px rgb(18 33 31 / 16%)` | dialog, side panel, bottom sheet |
| `elevation-toast` | `0 12px 32px rgb(18 33 31 / 14%)` | temporary feedback |

Hover lift and shadow growth are forbidden on operational surfaces. Hover feedback uses fill, border, or text color.

### 2.7 Motion

```css
--motion-instant: 0ms;
--motion-fast: 120ms;
--motion-standard: 180ms;
--motion-slow: 240ms;
--motion-overlay: 280ms;
--ease-standard: cubic-bezier(.2, 0, 0, 1);
--ease-out: cubic-bezier(.16, 1, .3, 1);
```

| Moment | Duration | Properties | Purpose |
| --- | --- | --- | --- |
| hover and focus color | 120ms | color, background, border-color | feedback |
| pressed control | 80-120ms | `transform: translateY(1px)` | action acknowledgement |
| active navigation marker | 180ms | opacity, transform | route state |
| feedback message | 240ms | opacity, translateY up to 6px | state change |
| dialog | 240ms | opacity, translateY up to 8px | overlay transition |
| bottom sheet and side panel | 280ms | opacity, translate on one axis | spatial state change |
| restrained route entrance | 240ms | opacity, translateY up to 6px | hierarchy |

No animation may change width, height, top, or left. Data rows, fields, A4 previews, and reading surfaces do not animate on entrance. Scroll animation, parallax, marquee, cursor effects, infinite decoration, shimmer, and magnetic effects are forbidden.

Under `prefers-reduced-motion: reduce`, all transforms and entrance animation are removed. State changes render immediately, while focus visibility remains unchanged.

## 3. Exact dimension contract

| Element | Compact | Default | Large |
| --- | ---: | ---: | ---: |
| Button height | 40px | 44px | 48px |
| Button horizontal padding | 14px | 18px | 22px |
| Button icon | 16px | 18px | 20px |
| IconButton visual box | 40px | 44px | 48px |
| IconButton icon | 16px | 18px | 20px |
| Text input | 40px | 48px | not supported |
| Select | 40px | 48px | not supported |
| DateField | 40px | 48px | not supported |

Additional dimensions:

- Compact 40px controls are allowed only at `>=768px`. Their interactive footprint must remain at least 44px through container spacing or a non-overlapping hit area. Mobile always uses default 44px or 48px controls.
- Textarea: minimum 96px, vertical padding 12px, resize vertical.
- Desktop and tablet top navigation: 64px high.
- Mobile top navigation: 56px high.
- Mobile bottom navigation: 72px high, plus safe-area inset.
- Desktop and tablet data row: 44px minimum.
- Mobile data row: 52px minimum and maximum two visible text lines.
- Account menu: 224px wide, 8px inner padding.
- Dialog radius: 18px. Padding is 24px compact, 32px default.
- Dialog widths: `small 400px`, `medium 560px`, `large 760px`, `preview min(1040px, calc(100vw - 32px))`.
- Bottom sheet radius: 18px top corners. Header padding 18px 20px. Body padding 0 20px 24px.
- Side panel width: `min(400px, calc(100vw - 48px))`. Outer viewport gap 24px.
- Paper surface radius: 14px. Padding is `compact 16px`, `default 24px`, `spacious 32px`.
- A4 preview paper radius: 6px. Decoration is forbidden inside its bounds.

Summary band spacing:

| Viewport | Layout | Item padding | Divider |
| --- | --- | --- | --- |
| 1440x900 | three columns | 20px 24px | vertical |
| 1024x768 | three columns | 18px 20px | vertical |
| 390x844 | three rows | 14px 16px | horizontal |

Page rhythm:

| Viewport | Content max | Page padding | Route gap | Section gap |
| --- | ---: | --- | ---: | ---: |
| 1440x900 | 1200px | 96px top, 64px sides, 56px bottom | 32px | 28px |
| 1024x768 | none beyond viewport | 88px top, 32px sides, 48px bottom | 28px | 24px |
| 390x844 | full width | 80px top, 20px sides, 96px bottom | 24px | 20px |

## 4. Shared interaction states

### 4.1 Focus

- All keyboard-operable elements use a 2px `--app-action` outline with 2px offset.
- Primary filled buttons use a paper halo and green outer ring: `0 0 0 2px var(--app-paper), 0 0 0 4px var(--app-action)`.
- Focus is never encoded by route accent alone.
- Focus order follows DOM order. Visual reordering must not change the reading sequence.

### 4.2 Hover and active

- Hover styles only apply under `@media (hover: hover)`.
- Primary hover uses `--app-action-hover`.
- Quiet and row hover use `--app-paper-soft`.
- Active controls move down by 1px for at most 120ms. They never scale.
- Selected state uses a filled accent or action color plus a text or icon change. Color alone is insufficient.

### 4.3 Disabled and loading

- Disabled controls use `--app-paper-muted`, `--app-ink-disabled`, and `--app-line`. They do not use opacity on the entire component.
- Native buttons and fields use the native `disabled` attribute. Disabled links are forbidden.
- Loading controls retain their width, set `aria-busy="true"`, block repeat activation, show a 16px or 18px spinner, and keep a concrete loading label such as `Menyiapkan...`.
- Loading skeletons match the final shape. They use a static soft fill under reduced motion.

## 5. Component API contract

Props not listed below are forbidden. All applicable interactive primitives may forward only these non-visual attributes: `id`, `name`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-expanded`, and `data-analytics-id`.

Visual escape hatches are forbidden across the system: `className`, `style`, `sx`, arbitrary `color`, arbitrary `radius`, numeric `padding`, numeric `gap`, numeric `iconSize`, arbitrary shadow, and arbitrary animation props.

### 5.1 Core controls

| Component | Variants and sizes | Allowed props | States and responsive behavior |
| --- | --- | --- | --- |
| `Button` | `variant: primary, secondary, quiet`; `size: compact, default, large` | `children`, `variant`, `size`, `type`, `onClick`, `href`, `leadingIcon`, `trailingIcon`, `block`, `disabled`, `loading`, `loadingLabel` | default, hover, active, focus, disabled, loading. `href` and `disabled` cannot coexist. Mobile uses default or large. |
| `IconButton` | `variant: quiet, outline, primary`; `size: compact, default, large` | `icon`, required `label`, `variant`, `size`, `onClick`, `disabled`, `loading`, `pressed` | no visible text children. Mobile minimum is default. `pressed` adds `aria-pressed`. |
| `Field` | `density: compact, default` | `controlId`, `label`, `required`, `helper`, `error`, `children` | Owns label, helper, and error IDs. Must wrap exactly one form control. |
| `Select` | `size: compact, default` | `id`, `name`, `value`, `options`, `onChange`, `disabled`, `required`, `autoComplete` | default, hover, focus, filled, invalid, disabled. Always composed inside `Field`. |
| `DateField` | `size: compact, default` | `id`, `name`, `value`, `min`, `max`, `onChange`, `disabled`, `required` | Native date behavior is preserved. Always composed inside `Field`. |

`Button` may render either a native button or Next.js link through a discriminated prop contract. It may not render arbitrary child wrappers. Icons must come from the existing Phosphor package.

The current text input is retained as `TextField` with the same contract as `Select`, adding `type: text, email, tel, number`, `placeholder`, `autoComplete`, and `inputMode`. `type="date"` is forbidden in `TextField`; use `DateField`.

### 5.2 Surfaces and structure

| Component | Variants | Allowed props | Rules |
| --- | --- | --- | --- |
| `Surface` | `variant: paper, soft, contextual, preview`; `padding: none, compact, default, spacious`; `tone: neutral, home, recap, invoice, error` | `as: div, section, aside`, `variant`, `padding`, `tone`, `labelledBy`, `children` | Non-interactive. `contextual` may use one 3px tone edge. `preview` may only contain preview-stage content. |
| `PageHeader` | `route: home, recap, invoice` | `route`, `eyebrow`, `title`, `description`, `actions` | One per route. `actions` accepts up to two `Button` or `IconButton` elements. |
| `SectionHeading` | `level: h2, h3`; `size: default, compact` | `level`, `size`, `title`, `description`, `action` | No eyebrow prop. One optional action. Stacks on mobile if the action would squeeze the title. |
| `SummaryBand` | `density: default, compact`; `tone: home, recap, invoice` | `label`, `items`, `density`, `tone` | `items` contains 1-4 `{label, value}` entries. Three columns at `>=768px`, rows below. It already owns its surface. |
| `DataRow` | `density: compact, default`; `tone: neutral, home, recap` | `label`, `leading`, `title`, `metadata`, `trailing`, exactly one of `href` or `onActivate` | Whole row is one trigger. No nested button, link, checkbox, or menu. 44px at `>=768px`, 52px mobile. |
| `FeedbackMessage` | `status: info, success, warning, error`; `density: compact, default` | `status`, `title`, `body`, `action`, `live` | One action maximum. `live` maps to polite status or assertive alert based on severity. |

### 5.3 Navigation and choices

| Component | Variants | Allowed props | Rules |
| --- | --- | --- | --- |
| `NavigationItem` | `mode: top, bottom`; `route: home, recap, invoice` | `href`, `label`, `icon`, `route`, `mode`, `active` | Internal shell component. Active state sets `aria-current="page"`. Top mode is used at `>=768px`, bottom mode below. |
| `SegmentedNavigation` | `size: compact, default`; `tone: neutral, home, recap, invoice` | `label`, `items`, `value`, `onChange`, `size`, `tone` | Maximum four items. Uses radio-group semantics and roving focus with Arrow keys, Home, and End. |
| `ChoiceGroup` | `layout: wrap, grid` | `label`, `options`, `value`, `onChange`, `disabled` | For student filtering or bounded single choice. It is not navigation and may wrap. |

`SegmentedNavigation` is used for route navigation and the three period presets. Student filtering uses `ChoiceGroup`, because an unknown number of students must not become a segmented control.

### 5.4 Overlays

| Component | Variants | Allowed props | Rules |
| --- | --- | --- | --- |
| `Dialog` | `size: small, medium, large, preview` | `open`, `onOpenChange`, `title`, `description`, `children`, `footer`, `initialFocusRef`, `returnFocusRef`, `dismissible` | Centered at `>=768px`. `preview` becomes full-screen below 768px. Traps focus, closes with Escape when dismissible, locks body scroll, and returns focus. |
| `BottomSheet` | `height: content, tall` | `open`, `onOpenChange`, `title`, `children`, `footer`, `initialFocusRef`, `returnFocusRef`, `dismissible` | Mobile only. No swipe-only dismissal. Has visible close control, focus trap, Escape, scroll lock, and focus return. |
| `SidePanel` | `size: default` | `open`, `onOpenChange`, `title`, `children`, `footer`, `initialFocusRef`, `returnFocusRef` | Used for session detail at `>=768px`. Enters from the inline end. Same dialog semantics and focus contract. |

`Dialog`, `BottomSheet`, and `SidePanel` share one overlay behavior hook. None may be mounted inside another overlay.

### 5.5 Content states

| Component | Variants | Allowed props | Rules |
| --- | --- | --- | --- |
| `EmptyState` | `context: home, recap, invoice` | `context`, `title`, `body`, `action`, `visual` | One short paragraph and one action. `visual` is allowed only for approved onboarding or handoff imagery. |
| `LoadingState` | `shape: summary, rows, form, preview` | `shape`, `rowCount`, `label` | `rowCount` is 1-6. Uses final-layout dimensions. Accessible label is available to assistive technology. |
| `ErrorState` | `scope: page, section, inline` | `scope`, `title`, `body`, `retry` | Direct explanation and one retry action. Never substitutes fake data. |

`EmptyState`, `LoadingState`, and `ErrorState` are mutually exclusive siblings. They may not be nested inside each other.

## 6. Composition rules

```text
AppShell
├── AppTopBar
│   ├── NavigationItem x3
│   └── AccountMenu
├── RouteCanvas
│   └── PageMain
│       ├── PageHeader
│       ├── SummaryBand or route content
│       └── Section
│           ├── SectionHeading
│           └── Surface
│               └── DataRow, Field, or route-specific content
└── MobileNavigation
    └── NavigationItem x3
```

Rules:

- `RouteCanvas` owns decoration and sits outside `PageMain` content surfaces.
- `Surface` may not be placed inside another `Surface`. The A4 document inside `Surface variant="preview"` is the only exception, and the A4 document is not implemented as `Surface`.
- `SummaryBand` is not wrapped in `Surface` because it already owns its border and paper fill.
- A list uses one `Surface padding="none"` containing consecutive `DataRow` elements.
- `DataRow` cannot contain `Button`, `IconButton`, link, checkbox, or another interactive element.
- `Field` wraps exactly one `TextField`, `Select`, `DateField`, or textarea control. It cannot wrap buttons or choice groups.
- `Dialog`, `BottomSheet`, and `SidePanel` cannot contain each other.
- Route-specific components may compose primitives but cannot pass visual overrides into them.
- Data fetching, quota decisions, draft persistence, invoice calculation, and PDF generation remain in route or feature code.

Forbidden combinations:

- decoration inside `Surface`, `Field`, `DataRow`, overlay, table, list row, or A4 preview;
- `SegmentedNavigation` for an unbounded student list;
- multiple primary buttons in one local action group;
- page-level `EmptyState` beside live data;
- success, warning, and error styling based on route accent;
- interactive `Surface` used in place of `Button` or `DataRow`;
- nested cards used only to create visual depth.

## 7. Decorative grammar

Every decoration must identify a route, reinforce hierarchy, or explain a state. If its purpose cannot be stated in one sentence, remove it.

### Approved motifs

| Route | Motif | Purpose |
| --- | --- | --- |
| Beranda | timetable grid, blank schedule blocks, one paper tab | establish the weekly planning context |
| Rekap | ledger rows, restrained column guides, one period marker | support the sense of scanning a record |
| Invoice | ruled paper, sparse crop marks outside preview, one document tab | identify document composition |

Shared motifs are paper tabs, restrained annotations, scheduling marks, and editorial dividers. Decorative text, names, dates, amounts, percentages, and fake status are forbidden. The current fake names in `AppPlannerCanvas` must not migrate.

### Placement and opacity

- Canvas lines sit behind the page canvas only: 6% opacity desktop, 5% tablet, 4% mobile.
- Decorative borders or crop marks use route-accent ink at 14% opacity.
- Soft accent blocks use the existing pale accent color at 60-80% opacity. They may not sit behind text.
- One primary background motif is allowed per route. One additional paper tab or annotation may attach to the PageHeader or an editorial divider.
- Decorative regions use `pointer-events: none` and `aria-hidden="true"`.
- Mobile removes nonessential annotations and keeps only the route background motif.

Random blobs, generic gradients, floating status dots, paper clips, stickers, unrelated illustrations, arbitrary polygons, detached rotated cards, and decoration used to fill empty space are forbidden.

## 8. Responsive contract

### 8.1 Desktop, 1440x900

- Top navigation is 64px and uses the shared segmented route model.
- Main content is capped at 1200px with 64px side padding.
- Beranda establishes PageHeader, SummaryBand, section rhythm, DataRow, FeedbackMessage, and route decoration.
- Rekap period and student controls stay inline. The list uses 44px rows and session detail uses `SidePanel`.
- Invoice uses `minmax(360px, 430px)` for the form and the remaining width for a solid preview surface.
- No route decoration enters form, list, dialog, or preview bounds.

### 8.2 Tablet, 1024x768

- Top navigation remains 64px. Mobile bottom navigation is not rendered.
- Page side padding becomes 32px.
- Beranda and Rekap summary bands remain three columns.
- Rekap controls may wrap into two lines but remain inline and fully visible. Session detail still uses `SidePanel`.
- Invoice is one form column. `Periksa invoice` opens a centered `Dialog size="preview"` fitted to the viewport.

### 8.3 Mobile, 390x844

- Header is 56px. Bottom navigation is 72px plus safe-area inset.
- Page side padding is 20px and bottom padding is 96px.
- Asymmetric compositions collapse to one column.
- Summary bands become stacked rows.
- Beranda recent sessions remain compact rows, not separate cards.
- Rekap shows one Filter button. Filters and session detail use separate `BottomSheet` instances.
- Invoice begins with the existing laptop handoff. `Lanjutkan di sini` opens the approved one-column editor, and preview is full-screen.
- No horizontal overflow is allowed at 390px.

## 9. Accessibility contract

- Use native button, link, select, input, and heading elements before ARIA.
- Navigation preserves `aria-current="page"` and labels `Beranda`, `Rekap`, and `Invoice`.
- All visible form labels are programmatically associated with controls. Required and error states are conveyed in text and semantics.
- Body and control text must meet WCAG AA 4.5:1. Large text and essential non-text boundaries must meet 3:1.
- Every mobile target is at least 44x44px. Adjacent compact targets have at least 8px separation.
- Keyboard operation follows native Enter and Space behavior. Segmented controls additionally support Arrow keys, Home, and End.
- Dialog, BottomSheet, and SidePanel trap focus, close with Escape when dismissible, expose a visible close action, lock background scroll, and return focus to the trigger.
- Scrim click may close a dismissible overlay, but it is never the only dismissal mechanism.
- Focus is visible at all times and never removed for mouse users through global outline suppression.
- Reduced-motion behavior follows Section 2.7. No loading or decorative motion is required to understand state.
- Decorative elements are ignored by assistive technology and never appear in the accessibility tree.

## 10. Migration map

### 10.1 Shared selectors and components

| Current source | Replacement | Notes and risk |
| --- | --- | --- |
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-sm`, `.btn-lg` and route-specific raw buttons | `Button` | Preserve labels, types, hooks, and handlers. Remove height variants from page CSS. |
| `.zoom-ctl button`, account close buttons, filter close buttons, preview close button | `IconButton` | Required accessible label. Compact size cannot be used on mobile. |
| `.field`, `.lbl`, `.input`, raw invoice inputs and selects | `Field`, `TextField`, `Select`, `DateField` | Highest form-risk area. Preserve name, order, native date behavior, autocomplete, and validation. |
| `.app-workspace-surface`, `.inv-form`, `.inv-preview-wrap`, `.app-data-state` | `Surface` and content-state primitives | Do not migrate business logic into Surface. |
| `.app-home-summary`, `.app-recap-summary` | `SummaryBand` | Beranda defines the reference composition. Rekap inherits compact density. |
| `.app-home-session-row`, `.app-recap-session-row` | `DataRow` | Home rows remain non-interactive where appropriate. Rekap rows remain one trigger. |
| `.app-home-section-heading`, `.app-recap-list-heading`, `.inv-section-title` | `SectionHeading` | Route eyebrow stays only in PageHeader. |
| `.app-topbar-nav a`, `.mob-tab` | `NavigationItem` | `AppTopBar` and `TabBar` remain shell containers sharing one route configuration. |
| `.app-recap-presets` | `SegmentedNavigation` | Preserve three preset labels and date behavior. |
| `.app-recap-students` | `ChoiceGroup` | Supports wrapping and an unknown student count. |
| `.app-recap-sheet-scrim`, `.app-recap-filter-sheet` | `BottomSheet` | Mobile only. Add focus trap, Escape, close, scroll lock, and focus return. |
| `.app-session-detail-scrim`, `.app-session-detail` | `SidePanel` at `>=768px`, `BottomSheet` below | `RekapSessionDetail` remains route-specific content. |
| `Modal`, `.paywall-scrim`, `.paywall-dialog`, `.inv-preview-scrim`, `.inv-preview-dialog` | `Dialog` | Consolidate overlay behavior. Preserve quota and draft decisions outside Dialog. |
| `.app-data-state`, `.app-loading` | `EmptyState`, `ErrorState`, `LoadingState` | Never replace load failure with examples. |
| `.app-success-toast` | `FeedbackMessage` in a toast region | Preserve `role="status"`; no decorative motion. |
| `AppPlannerCanvas` | `RouteCanvas route="home"` decoration | Remove fake names and arbitrary schedule data. |

### 10.2 Components that remain page-specific

- `AppTopBar` and `TabBar`: shell composition and route lookup.
- `HomeUpgradePrompt`: eligibility, quota wording, and `/harga` boundary. It composes `FeedbackMessage` or `Surface` plus `Button`.
- `RekapContent`: query-derived state, filter state, pagination, downloads, and selected session state.
- `RekapSessionDetail`: route-specific read-only session content.
- `InvoiceComposer`: draft, session derivation, validation, appearance state, and download flow.
- `InvoiceTemplatePicker` and `InvoiceAccentPicker`: invoice-specific choices. Their interactive items must become real buttons or radio controls.
- `TplKlasik`, `TplMinimal`, `TplModern`, and `A4Page`: invoice document rendering.
- `PaywallDialog`: product copy and quota or invoice decision remain page-specific, while its frame and behavior migrate to `Dialog`.

### 10.3 Migration order

1. Add protected semantic tokens and remove duplicate protected aliases.
2. Build controls, surfaces, headings, state primitives, and overlay behavior in isolation.
3. Migrate shell navigation and account menu without changing routes or labels.
4. Migrate Beranda as the reference route and review all states.
5. Migrate Rekap using inherited primitives plus list, filter, SidePanel, and BottomSheet compositions.
6. Migrate Invoice last because field preservation, preview sizing, draft behavior, and PDF boundaries carry the highest regression risk.
7. Retire migrated selectors only after no production consumer remains.

Primary risks:

- protected styles currently span `css/tutorlog-web.css` and `css/site.css`, so cascade order can hide incomplete migration;
- generic `Button`, `Input`, and `Modal` exist but are not consistently consumed by protected routes;
- invoice markup contains inline dimensions and non-semantic clickable template and color choices;
- current overlays have incomplete focus trap and focus return behavior;
- replacing fields can accidentally change IDs, names, browser behavior, validation, draft restore, or analytics hooks;
- changing preview wrappers can affect visual scale even when PDF generation remains untouched.

## 11. Beranda as reference route

Beranda establishes:

- AppShell, top and bottom navigation, account menu, and route active state;
- the PageHeader hierarchy and page rhythm;
- the 14px paper surface, 1px border, divider, and flat elevation rules;
- the three-part SummaryBand and its mobile row fallback;
- SectionHeading, DataRow, contextual FeedbackMessage, and all shared states;
- focus, active, loading, reduced-motion, and timetable decoration behavior.

Rekap inherits the shell, typography, spacing, controls, surfaces, states, overlays, and motion. It intentionally uses lilac route accents, tighter DataRow content, inline tablet filters, ledger decoration, and read-only detail disclosure.

Invoice inherits the shell, typography, fields, buttons, surfaces, dialogs, state treatment, and motion. It intentionally uses coral route accents, ruled-paper canvas, a longer single-column form rhythm, and a visually stable A4 proof surface.

The routes feel related because primitives and behavior are shared. Their character comes from route accent, background grammar, density, and composition, not page-specific restyling of the same primitive.

## 12. Step 2A acceptance checklist

- [x] Semantic and route color roles are approved.
- [x] Spacing, typography, radius, border, elevation, and motion scales are approved.
- [x] Exact component APIs, states, and forbidden props are approved.
- [x] Dimension and responsive contracts are approved at 1440x900, 1024x768, and 390x844.
- [x] Decorative grammar is approved.
- [x] Migration map and Beranda reference-route role are approved.
- [x] Accessibility and reduced-motion behavior are approved.

These approval boxes belong to this design contract. They do not update the active implementation-plan checkboxes.

## 13. Step 2B disposition

Step 2B visual approval was skipped by explicit user direction on 2026-07-13. The isolated prototype had become an outdated reference after the production Beranda implementation received later approved visual iterations. The prototype remains available for historical context, but production source and fresh runtime review are the acceptance authority from Step 3 onward.
