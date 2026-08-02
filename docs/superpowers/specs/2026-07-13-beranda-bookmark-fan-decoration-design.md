# Beranda Bookmark Fan Decoration Design

**Status:** Approved visually and in written review on 2026-07-13.

## Context

The current `TutorPlannerCanvas` repeats the same rectangular frame, rows, columns, and blocks already used by the summary band and session table. The Beranda hero needs a more playful tutoring motif without competing with operational data below it.

## Approved direction

Replace the desktop and tablet timetable decoration with the selected `Bookmark Fan` composition from preview C.

The decoration contains three overlapping bookmark shapes anchored as one group:

- mint bookmark with an open-book icon;
- soft coral bookmark with a clock icon;
- soft lilac bookmark with a document icon.

Each bookmark uses the existing protected-app line color and a maximum rotation of three degrees. The group has no outer frame, grid, visible label, fake data, or interactive behavior.

## Placement

- Keep the decoration in the current top-right Beranda hero region.
- Preserve the current hero copy width and prevent overlap with the greeting or description.
- Keep the composition within approximately the same desktop footprint as `TutorPlannerCanvas`.
- Treat the three bookmarks as one anchored composition rather than detached cards or stickers.

## Visual rules

- Use the existing TutorLog paper, mint, coral, lilac, and green-ink tokens.
- Use Phosphor icons already installed in the project. Do not add a package or hand-draw SVG paths.
- Use flat fills, restrained borders, and at most one subtle tinted shadow beneath the complete group.
- Do not add gradients, glow, decorative text, names, dates, amounts, dots, clips, or animation.
- Keep `pointer-events: none` and `aria-hidden="true"`.

## Responsive behavior

- Desktop above 1100px shows the complete bookmark fan.
- Tablet from 768px through 1100px scales the complete group down without changing its composition.
- Mobile below 768px hides the bookmark fan and preserves the current slim mint edge marker.

## Implementation boundary

- Replace `TutorPlannerCanvas` with a route-local `BookmarkFanDecoration` inside `components/app-ui/route-canvas.tsx`.
- Keep all visual styling inside `components/app-ui/app-ui.module.css`.
- Do not change Beranda data, summary, session rows, archive rail, navigation, footer, routes, or public pages.

## Verification

- Run `rtk git diff --check`.
- Review the authenticated Beranda desktop composition and confirm that the decoration does not resemble a table or overlap the hero copy.
- Run a tablet and mobile visual check only when explicitly requested under the repository development-test policy.
- Do not run the full test suite unless preparing to sync, merge, or open a PR to `main`, or when explicitly requested.

## Acceptance criteria

- The timetable board is no longer rendered on Beranda.
- The three bookmark shapes are visible as one playful tutoring composition on desktop and tablet.
- The book, clock, and document symbols remain recognizable without visible text.
- The decoration stays behind and outside operational content surfaces.
- Mobile retains only the existing route marker.
