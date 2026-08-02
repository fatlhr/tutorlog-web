# Profile Page + Community Link Spec

**Version:** 1.0
**Date:** 2026-07-14

## Overview

Dedicated profile page at `/app/profil` following the tutorlog mobile app. Name editing saves to `user_metadata.full_name` and auto-syncs with mobile via Supabase Auth. Also adds "Gabung Komunitas" dropdown item with link stored in `app_config` table.

## Routes

| Route | Key | Label | Navigation |
|-------|-----|-------|------------|
| `/app/profil` | `"settings"` | Profil | AppTopBar dropdown |
| `/app` | `"home"` | Beranda | TabBar + TopNav |
| `/app/rekap` | `"recap"` | Rekap | TabBar + TopNav |
| `/app/invoice` | `"invoice"` | Invoice | TabBar + TopNav |

- No TabBar entry for Profil (matching mobile pattern — only accessible from dropdown).

## Page Structure: `/app/profil`

Server component layout, client component for interactive form:

### Server (`app/app/settings/page.tsx`)
- Fetches user data via `supabase.auth.getUser()`
- Fetches quota via `checkQuota()` (includes `activeUntil`)
- Passes data to client component

### Client (`components/ProfileContent.tsx`)
- Avatar: 96px circle, letter initial from name, auto-colored background
- Name field: inline edit via pencil icon → text field → checkmark → save
  - Calls `updateName` server action (already exists at `app/app/actions.ts`)
- Email display: read-only card with envelope icon
- Access status card: shows plan name + active until date or expired/free state
- CTA: "Catat sesi dari aplikasi TutorLog" with Play Store link

### Access Status Display Rules

| Plan | Display |
|------|---------|
| `"full_access"` + `activeUntil` exists | "Plus — Aktif sampai DD Month YYYY" (green) |
| `"full_access"` + no `activeUntil` | "Plus — Aktif" (green) |
| `"expired"` | "Plus — Kedaluwarsa" (red) + CTA ke `/harga` |
| `"free"` (or anything else) | "Paket Free" (neutral) |

## AppTopBar Dropdown Changes

Current dropdown: [name/status] → Bantuan → Keluar

New dropdown: [name/status] → **Profil** → **Gabung Komunitas** (if link available) → Bantuan → Keluar

- "Profil" → internal link to `/app/profil`
- "Gabung Komunitas" → external link, fetched from `app_config` table, opens in new tab
- "Bantuan" → unchanged, links to `/kontak`
- "Keluar" → unchanged, calls `supabase.auth.signOut()`

## Community Link (Database-Backed)

- Table: `app_config` (key-value, already exists)
- Key: `'community_link'` (new row, user adds manually)
- Value: `{ "telegram_url": "https://t.me/..." }`
- Query: `supabase.from('app_config').select('value').eq('key', 'community_link').maybeSingle()`
- If row doesn't exist or value is null: hide the dropdown item
- Fetched server-side in `app/app/layout.tsx`, passed as prop to `AppTopBar`

## Data Layer Changes

### `lib/data/quota.ts`
- Add `activeUntil: string | null` to `QuotaInfo` interface
- Extract `active_until` from `get_user_access_status` RPC result

### `lib/data/app-config.ts` (new)
- `getAppConfig(key: string)`: generic function to read a row from `app_config`
- `getCommunityLink()`: specific function returning `telegram_url` string or null

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `app/app/settings/page.tsx` | Profile page (server component) |
| `components/ProfileContent.tsx` | Profile page form (client component) |
| `lib/data/app-config.ts` | `app_config` table query helpers |

### Modified Files
| File | Change |
|------|--------|
| `lib/data/quota.ts` | Add `activeUntil` to `QuotaInfo`, extract from RPC |
| `components/app-ui/types.ts` | Add `"settings"` to `AppRoute` |
| `components/app-ui/routes.ts` | Add route item `settings` → `/app/profil` |
| `components/AppTopBar.tsx` | Add "Profil" + "Gabung Komunitas" to dropdown |
| `app/app/layout.tsx` | Fetch community link, pass to `AppTopBar` |
| `components/app-ui/app-ui.module.css` | (Maybe) Add any profile-specific styles |

## Edge Cases
- **No name set**: Dialog still works (from previous feature); profile page shows email-username as fallback display
- **Update fails**: Show error message in the form (not a global toast)
- **Community link missing**: "Gabung Komunitas" simply not rendered
- **Active until missing for Plus users**: Show "Aktif" without date
- **Mobile app CTA**: Same Play Store URL used elsewhere in the app; extracted to shared constant
