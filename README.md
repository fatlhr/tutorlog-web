# TutorLog Web

Web app for TutorLog — tutoring session management and invoice builder.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + custom design tokens (`--tw-*`)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Magic Link)
- **PDF Export:** Client-side (`jsPDF`, `html2canvas`)
- **Testing:** Playwright (responsive, visual diff, A11y)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run test:responsive` | Run responsive sweep tests |
| `npm run test:visual-diff` | Run visual diff tests |
| `npm run test:a11y` | Run accessibility tests |
| `npm run generate:diff` | Generate visual diff report |

## Project Structure

```
app/                    # Next.js App Router pages
  app/                  # Protected routes (auth required)
    rekap/              # Session recap
    invoice/            # Invoice builder
components/             # Shared React components
css/                    # Design tokens + component styles
design/                 # Original design artboards (Omelette)
tests/                  # Playwright test suites
```

## Deployment

Deployed on Vercel (Free tier). Custom domain: `web.tutorlog.id`.
