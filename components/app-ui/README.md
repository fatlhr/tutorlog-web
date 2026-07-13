# Protected app UI foundation

This directory is the isolated visual foundation for `/app`. It implements the approved protected-app contract without migrating a production route. Import components from their source files so server components do not inherit a client boundary from a barrel export.

## Scope

- Visual authority: `design-taste-frontend` v2 and `docs/superpowers/specs/2026-07-13-protected-app-visual-system-design.md`.
- Theme: light paper only, scoped by `.app-shell-h` or the internal overlay theme wrapper.
- Dependencies: React, Next.js, and the existing Phosphor package only.
- Boundaries: no fetching, quota logic, persistence, calculations, PDF behavior, or route exceptions.
- Status: foundation only. Existing routes must not consume it until this review is approved.

## Tokens and responsive rules

`app-ui.module.css` owns the protected semantic color, spacing, radius, elevation, motion, and typography tokens. Route accents describe context; `--app-action` remains the only primary action fill. Operational content always sits on an opaque paper surface.

The fixed viewport contract is encoded at three ranges:

| Range | Page padding | Route gap | Data row | Navigation |
| --- | --- | --- | --- | --- |
| Desktop, above 1100px | `96px 64px 56px` | `32px` | `44px` minimum | top |
| Tablet, 768px to 1100px | `88px 32px 48px` | `28px` | `44px` minimum | top |
| Mobile, below 768px | `80px 20px 96px` | `24px` | `52px` minimum | bottom |

Compact controls become their default size below 768px. Reduced motion removes transforms and animation without changing focus visibility.

## Public components

| Source | Components | Variants and purpose |
| --- | --- | --- |
| `controls.tsx` | `Button`, `IconButton` | primary, secondary, quiet and compact, default, large controls; external link buttons may preserve `_blank` and `rel` behavior |
| `controls.tsx` | `Field`, `TextField`, `Select`, `DateField`, `Textarea` | labelled form composition with shared helper and error semantics |
| `structure.tsx` | `Surface`, `PageHeader`, `SectionHeading`, `Section`, `SummaryBand`, `FeedbackMessage` | paper hierarchy, route context, section rhythm, metrics, and feedback |
| `data-row.tsx` | `DataRow` | static or exactly one whole-row link or button trigger |
| `navigation.tsx` | `NavigationItem`, `SegmentedNavigation`, `ChoiceGroup` | route links, bounded single choice, and variable-length choice lists |
| `overlays.tsx` | `Dialog`, `BottomSheet`, `SidePanel` | shared focus trap, Escape handling, scroll lock, focus return, and visible close action |
| `states.tsx` | `EmptyState`, `LoadingState`, `ErrorState` | mutually exclusive content states using final-layout dimensions |
| `route-canvas.tsx` | `RouteCanvas`, `PageMain` | route decoration outside the operational content layer and fixed page rhythm |
| `routes.ts` | `APP_ROUTE_ITEMS`, `getActiveAppRoute` | one route-label configuration for shell migration |

The 21 named components in the formal API tables are implemented. `Textarea`, `Section`, `RouteCanvas`, and `PageMain` are explicit contract clarifications because the composition and dimension sections require them but the API tables do not define them.

`PageMain` is a layout `div`, not another `main` landmark, because the root layout already owns the document's `main#main-content` target.

| Clarified component | Allowed props | Rule |
| --- | --- | --- |
| `Textarea` | shared field `id`, `name`, `value`, `onChange`, `placeholder`, `disabled`, `required`, and allowed non-visual attributes | fixed 96px minimum, vertical resize, and exactly one `Field` parent |
| `Section` | `labelledBy`, `children` | owns the 28px, 24px, and 20px section gap across desktop, tablet, and mobile |
| `RouteCanvas` | `route`, `children` | owns one approved route motif and all `aria-hidden` decoration |
| `PageMain` | `children` | owns content width, page padding, and route gap without creating a second `main` landmark |

`SectionHeading` accepts `headingId` for an existing section anchor or `aria-labelledby` relationship. The ID is applied to the rendered `h2` or `h3`, never its wrapper.

## Composition

```tsx
<RouteCanvas route="home">
  <PageMain>
    <PageHeader route="home" eyebrow="Beranda" title="Rencana belajar" />
    <SummaryBand label="Ringkasan" tone="home" items={summaryItems} />
    <Surface as="section" padding="none" labelledBy="recent-heading">
      <DataRow label="Buka sesi" href="/app/sesi/1" title="Sesi belajar" />
    </Surface>
  </PageMain>
</RouteCanvas>
```

Use `Field` around exactly one `TextField`, `Select`, `DateField`, or `Textarea`. Do not nest `Surface`, content states, or overlays. Do not put an interactive child inside `DataRow`. Decoration belongs to `RouteCanvas`, never to forms, rows, overlays, lists, or invoice paper.

`LoadingState rowCount` controls summary, row, and form placeholders. Preview loading always renders one paper-sized placeholder because multiple preview pages would not match the final layout.

`NavigationItem` owns actual route navigation. `SegmentedNavigation` is reserved for bounded choices such as period presets. `ChoiceGroup` owns variable-length student filtering.

## Migration helpers

1. Reuse `APP_ROUTE_ITEMS` in `AppTopBar` and `TabBar`, then replace route anchors with `NavigationItem`.
2. Migrate Beranda first using `RouteCanvas`, `PageMain`, structure primitives, and content states.
3. Migrate Rekap after Beranda review, keeping query, filter, download, and selection state in route code.
4. Migrate Invoice last, preserving field IDs and names, native behavior, draft restore, preview scale, and PDF boundaries.
5. Remove old selectors only after the final production consumer is gone.

Run `rtk node scripts/audit-protected-app-system.mjs` after foundation changes. It compares component inventory and audits tokens, radii, control dimensions, focus treatment, route isolation, and the no-new-package boundary. During feature development, pair it with `rtk git diff --check`; do not run the full test suite unless the repository policy allows it.

## Contract clarifications

- Exact component dimensions override the spacing scale where the approved contract gives raw values such as 14px, 18px, 22px, and 28px.
- `DataRow` supports a static form for the Beranda migration map; interactive rows still accept exactly one trigger.
- `SummaryBand` uses the item count as its desktop column count for one to four entries and stacks every item on mobile.
- Dialog padding maps `small` to 24px and other desktop sizes to 32px.
- Primary press feedback uses the approved 120ms boundary.
- The mobile Home canvas keeps one 13px by 50px paper tab from the approved prototype. This is the only intentional deviation from the written rule that mobile keeps only the background motif; its inner schedule blocks are removed.
