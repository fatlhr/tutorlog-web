# Protected App Prototype

> **Status:** Archived reference. Step 2B visual approval was skipped by explicit user direction on 2026-07-13 because the production Beranda implementation had already superseded this prototype through later approved visual iterations. Do not use this artifact as the current visual acceptance source.

Isolated coded prototype for the approved TutorLog protected-app visual system. It does not enter Next.js routing and does not connect to Supabase, authentication, production data, quota, or PDF logic.

## Serve locally

From the repository root:

```sh
python3 -m http.server 4173
```

Open:

```text
http://127.0.0.1:4173/design/protected-app-prototype/
```

## Prototype states

- `?state=default&plus=eligible`
- `?state=default&plus=exhausted`
- `?state=default&plus=paid`
- `?state=loading`
- `?state=empty`
- `?state=error`
- `?state=lab`
- add `&motion=reduce` to force the reduced-motion treatment
- add `&focus=primary` to open with the primary action focused

The static names, dates, sessions, and amounts are prototype content only.

## Decorative purpose

- The canvas grid identifies Beranda as the weekly planning route.
- The blank timetable board makes the schedule structure visible without inventing student or session data.
- The attached paper tab connects the desktop board and mobile page edge to a tutor's working materials.

All three decorations are non-interactive, hidden from assistive technology, and kept outside data surfaces.

## Icons

SVG files under `icons/` are generated from the installed `@phosphor-icons/react` package:

```sh
node design/protected-app-prototype/generate-icons.mjs
```
