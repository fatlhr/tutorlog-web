# Beranda Visual Corrections Design

**Status:** Approved in conversation on 2026-07-13 and revised after runtime feedback.

## Context

The Step 3A Beranda migration uses the approved protected-app paper system, but the first runtime screenshots exposed three composition issues:

- the `Buka rekap` card begins above the session table instead of sharing its top edge;
- the mobile `Lihat semua` action carries inline padding that breaks the left alignment of the section copy;
- `RouteCanvas` reserves a full viewport inside a shell that already owns the topbar and footer, leaving a long empty canvas and pushing the footer below the initial desktop viewport.

The summary band also lacks enough visual weight for the main monthly information. A later review found that the growing footer was too tall and that the protected top navigation combined too many active-state treatments.

## Approved design

### Session area

- Keep `Sesi terbaru`, its description, and `Lihat semua` constrained to the session-table column.
- Use matching desktop and tablet grid tracks for the heading row and content row.
- Place the session table and `Buka rekap` card in the same content row so their top borders align exactly.
- Preserve the current session rows, links, labels, data, and contextual-action behavior.

### Mobile action alignment

- Collapse the session area to one column below 768px.
- Keep `Lihat semua` directly below the section description.
- Remove the quiet-button inline inset within a mobile `SectionHeading` so its visible label starts on the same left line as the heading and description.
- Preserve a minimum 44px touch target and visible focus treatment.

### Summary band

- Keep one full-width summary band rather than three separate cards.
- Apply a solid soft-mint surface across the band with the existing line color and flat elevation.
- Target about 116px height on desktop with 30px Courier Prime bold values and 13px labels.
- Keep the three metrics equal in hierarchy. Do not make income the dominant metric.
- Retain the vertical mobile layout with 22px values and slightly increased row padding.

### Footer and short-page composition

- Let the route canvas absorb unused short-page height so the paper background reaches a compact footer at the bottom of the viewport.
- Render the footer as a full-width muted-mint closing field.
- Keep footer content inside the existing 1280px maximum content line.
- Keep the footer at its intrinsic height with 18px desktop block padding instead of letting it grow into the remaining viewport.
- Keep the mobile footer in one row when space allows and pad it above the fixed bottom navigation.
- Apply the shell correction consistently to protected routes without changing route content or navigation behavior.

### Protected top navigation

- Keep the public `/` navigation and its 3D treatment unchanged.
- Remove the pill container and filled active background from the `/app` desktop navigation.
- Use the route accent only for the active text/icon and a centered underline.
- Keep the mobile bottom-navigation active fill because the underline-only decision applies to the desktop top navigation.

## Constraints

- No new metrics, cards, dummy data, or secondary contextual action.
- No route, query, quota, link, label, accessible-name, or analytics changes.
- Keep the protected light paper theme, existing type families, radius scale, focus treatment, and reduced-motion behavior.
- Do not migrate Rekap or Invoice content as part of this correction.
- Do not change the public navigation or landing-page 3D design.

## Verification

- Run `rtk git diff --check` and `rtk node scripts/audit-protected-app-system.mjs`.
- Review the authenticated paid state at 1440x900, 1024x768, and 390x844.
- Confirm table and contextual-card top alignment, summary hierarchy, mobile action alignment, compact footer containment, bottom-navigation clearance, underline-only top navigation, and no horizontal overflow.
- Do not run build, lint, automated accessibility, responsive sweep, or visual regression during this development step.
