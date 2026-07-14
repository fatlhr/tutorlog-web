# Beranda Mobile Correction Design

**Status:** Approved visually and in written review on 2026-07-13.

## Context

The approved Bookmark Fan passes desktop and most breakpoint checks, but at exactly `768px` its `.86` scale overlaps the Beranda heading and description by about `40px`. The mobile recent-session rows still show more information than needed, while the previous-month archive uses an uneven `2 + 1` metric layout.

This pass corrects those three issues without changing desktop content, data loading, routes, shared navigation, footer, or the roadmap panel.

## Design direction

Treat this as a targeted preservation redesign for a private tutor. Keep the existing paper-planner visual language, mint accent, typography, surface radius, and static interaction model.

- `DESIGN_VARIANCE: 5`
- `MOTION_INTENSITY: 1`
- `VISUAL_DENSITY: 6`

Use route-local markup and CSS overrides. Do not add a dependency, client state, animation, or a new shared component variant.

## Bookmark Fan correction

- Desktop above `1100px` keeps the current unscaled Bookmark Fan.
- Tablet from `851px` through `1100px` keeps the current `.86` scale.
- Narrow tablet from `768px` through `850px` uses `.66` scale with the existing `right center` transform origin.
- Mobile below `768px` continues to hide the fan and show only the slim mint edge marker.
- Do not change bookmark geometry, colors, icons, rotations, stacking, or shadow.

## Mobile recent-session rows

At widths below `768px`, each recent-session row is one inline scan line:

```text
04 Jul 2026    Hanif Mubarak    1.5 jam
```

The date stays left, the student name occupies the flexible middle column, and duration stays right. The row keeps the existing surface, separators, and minimum touch-friendly height.

Mobile visual content is limited to:

- session date;
- name;
- duration.

School or mode metadata and session amount are visually hidden on mobile. Desktop and tablet continue to show the existing date, name, school or mode metadata, duration metadata, and amount.

Implementation stays route-local:

- keep the existing `DataRow` component and its public API unchanged;
- wrap the name, metadata, amount, and duration in route-local spans;
- keep the existing three-column `DataRow` grid: date, flexible name, and trailing value;
- add a duration span that is hidden by default and shown only on mobile;
- hide the metadata wrapper and amount span below `768px`;
- preserve the complete accessible row label so assistive technology retains the session context.

Long names truncate with an ellipsis in the flexible middle column rather than wrapping or pushing the duration outside the row.

## Mobile previous-month archive

Below `768px`, the archive becomes a compact vertical key-value section.

### Header

- Keep `Arsip bulan lalu` and the month grouped on the left.
- Keep the compact `Buka rekap` action aligned at the top right in the same row.
- The action retains its current label, destination, month-specific accessible name, arrow icon, and minimum touch target.
- Keep this header on one row at the supported `390px` check. If space is tight, reduce the mobile gap or horizontal action padding instead of stacking the action.

### Metrics

Render the three metrics as separate horizontal rows:

```text
Sesi selesai              9
Waktu mengajar          15.6
Estimasi pendapatan  Rp 1.3jt
```

- Labels align left and values align right.
- Use one bottom divider between adjacent metric rows.
- Remove the desktop inline-end dividers and the current mobile `2 + 1` grid.
- Keep existing font families, muted labels, emphasized values, and real data.
- Values must not cause horizontal overflow; the label column can shrink first.

The roadmap panel remains below the archive with its current copy, icon, mint tint, and top divider.

## Files and boundaries

Expected implementation files:

- `app/app/page.tsx`: add route-local name, metadata, amount, and duration spans inside the existing recent-session `DataRow` props.
- `app/app/home.module.css`: control mobile session visibility and archive header or metric layout.
- `components/app-ui/app-ui.module.css`: add only the narrow-tablet Bookmark Fan scale. Keep the shared `DataRow` grid unchanged.

Do not change:

- `DataRow` props or shared component behavior outside Beranda;
- data fetching, date formatting, session ordering, quota logic, or empty and error states;
- desktop or tablet session content;
- archive data, link parameters, roadmap content, navigation, footer, or public pages.

## Verification

After implementation, run the explicitly approved responsive check at:

- `1101 x 900`;
- `1100 x 900`;
- `850 x 900`;
- `768 x 900`;
- `767 x 900`;
- `390 x 844`.

For every viewport, verify horizontal overflow is absent. At `768px` verify the fan no longer overlaps the heading or description. At `767px` and `390px`, verify the fan is hidden, the mint marker remains visible, every session row contains only date, name, and duration visually, and the archive header and metric values remain aligned.

Run `rtk git diff --check` and focused source scans. Do not run the automated test suite, build, lint, accessibility automation, or visual regression unless separately authorized under the repository development-test policy.

Do not stage or commit without explicit git authorization.

## Acceptance criteria

- The Bookmark Fan does not overlap Beranda copy at any approved breakpoint.
- Mobile session rows show only date, name, and duration on one line.
- Long names truncate without hiding the duration or creating horizontal scroll.
- The mobile archive header keeps the month left and `Buka rekap` right.
- Archive metrics form three orderly label-value rows.
- Desktop and tablet session presentation remains unchanged.
- The roadmap panel and all data behavior remain unchanged.
