# Public Story Rail Contract

## Status

- [x] M0: baseline and handoff contract
- [x] M1: shared public foundation
- [x] M2: real product proof
- [x] M3: landing rebuild
- [x] M4: fitur rebuild
- [ ] M5: panduan rebuild
- [ ] M6: regression and PR review

## Visual Contract

### Shared composition

- Desktop and tablet use a single narrative column on the left and a sticky product rail on the right, separated by one vertical rule.
- The rail starts beside the hero and stays visible while related narrative sections scroll.
- Arrows are limited to outcome annotations beside a matching product proof. They never number, sequence, separate rows, or animate.
- Mobile is one column. It has no sticky rail, vertical rule, absolute screenshot overlay, small path label, or duplicated desktop markup.
- Product proof is a real image or a real TutorLog component. Do not create product preview UI with decorative divs.

### Tokens

| Token | Value |
| --- | --- |
| Surface | `#F4FAF8` |
| Soft surface | `#EDF7F3` |
| Ink | `#12211F` |
| Muted | `#50645E` |
| Rule | `#B7D1C8` |
| Accent | `#006C53` |
| Accent soft | `#D8F1E7` |

### Breakpoints

| Mode | Contract |
| --- | --- |
| Desktop `>=1200px` | `1280px` max container, `80px` outer gutter at `1440px`, `72px` nav, story columns `748px / 1px / 435px`, `48px` side gaps, `60px` H1 using the narrative column width, rail top `96px`, rail proof `326px` wide. |
| Tablet `768-1199px` | `32px` gutter, story columns `minmax(0, 1fr) / 1px / 288px`, `28px` side gaps, `48px` H1, rail top `88px`, rail proof `248px` wide. |
| Mobile `<768px` | `24px` gutter, `64px` nav, `43px` H1, primary CTA `52px` high and full width, secondary CTA as text link, proof `208-232px` wide, `56px` section gaps. |

### Product proof manifest

| State | Source | Used by |
| --- | --- | --- |
| Mobile | `/images/tutorlog-clean-home.png` | Landing, Fitur, Panduan |
| Rekap | Real web rekap screenshot or `/images/web-recap-placeholder.png` bitmap only | Landing, Fitur, Panduan |
| Invoice | `TplModern` with deterministic `InvoiceData` | Landing, Fitur, Panduan |

### Forbidden selectors and patterns

- `.tl-rail-path`, `.tl-strip-route`, `.tl-guide-step-route`
- `.tl-mini-invoice`, `.tl-export-placeholder`, `.tl-strip-slot`, `.tl-flow-slot`, `.tl-guide-web-slot`
- numbered feature or guide steps, vertical rail paths, dashed product placeholders, card grids, large diagonal backgrounds

## Page Copy and Structure

### Landing

1. Hero: `Rekap dan invoice untuk tutor privat.` with current subcopy and two CTAs.
2. Problem: `Yang biasanya tercecer, kini terkumpul.`
3. Pricing cue: plain `Free` and `Plus` ledger rows with link to `/harga`.
4. Hover Quote: Miss Binar, text only, quote body at most three lines.
5. Final action: one CTA with action-focused hierarchy.

### Fitur

1. Hero: `Data les bergerak dari HP ke rekap.`
2. `Catat sesi di HP.`
3. `Baca rekap di web.`
4. `Siapkan invoice dan export.`

### Panduan

1. Hero: `Catat di HP, buat invoice di web.`
2. Phase `Di HP`: install, add student and rate, save session.
3. Phase `Di web`: sign in, review recap, create invoice.

## Review Gate Before Every Commit

1. Inspect the diff and run `git diff --check`.
2. Capture initial fold, mid-scroll, and CTA/footer at `1440x900`, `1024x768`, `390x844`; include `1052x883` for rail checks.
3. Compare screenshots to this document: no card bloat, fake UI, tiny labels, step arrows, cropped proof, or empty tablet space.
4. Re-read visible copy and remove repeated or meta language.
5. Run the milestone test set. Before M6, run lint, build, responsive sweep, and a11y.
6. Stage only source, test, and docs files related to the milestone.

## Handoff

The next agent must read this file, check `git status --short`, run the listed test for the first unchecked milestone, then continue from that milestone only.
