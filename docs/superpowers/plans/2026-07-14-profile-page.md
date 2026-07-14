# Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `/app/profil` page and "Gabung Komunitas" dropdown item.

**Architecture:** Server component fetches user + quota + community link data; client component renders inline-editable form. Community link stored in `app_config` table.

**Tech Stack:** Next.js 15, Supabase Auth, existing app-ui primitives

---

### Task 1: Update QuotaInfo with activeUntil

**Files:**
- Modify: `lib/data/quota.ts`

- [ ] **Add `activeUntil` to `QuotaInfo` interface**

```typescript
export interface QuotaInfo {
  plan: string;
  pdfExportCount30d: number;
  csvExportCount30d: number;
  pdfExportUnlimited: boolean;
  exportWindowDays: number;
  activeUntil: string | null;
}
```

- [ ] **Extract `active_until` from RPC result**

```typescript
return {
  plan: (result.plan as string) ?? "free",
  pdfExportCount30d: (result.pdf_export_count_30d as number) ?? 0,
  csvExportCount30d: (result.csv_export_count_30d as number) ?? 0,
  pdfExportUnlimited: (result.pdf_export_unlimited as boolean) ?? false,
  exportWindowDays: (result.export_window_days as number) ?? 30,
  activeUntil: (result.active_until as string) ?? null,
};
```

---

### Task 2: Create app-config data helper

**Files:**
- Create: `lib/data/app-config.ts`

- [ ] **Create `getCommunityLink` function**

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCommunityLink(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "community_link")
    .maybeSingle();

  if (!data?.value) return null;
  const value = data.value as Record<string, unknown>;
  const url = value?.telegram_url;
  return typeof url === "string" && url.trim() ? url.trim() : null;
}
```

---

### Task 3: Add route + type + navigation

**Files:**
- Modify: `components/app-ui/types.ts`
- Modify: `components/app-ui/routes.ts`

- [ ] **Add `"settings"` to `AppRoute`** in `components/app-ui/types.ts`

```typescript
export type AppRoute = "home" | "recap" | "invoice" | "settings";
```

- [ ] **Add route item** in `components/app-ui/routes.ts` (before the closing `]`)

```typescript
{ route: "settings", label: "Profil", href: "/app/profil" },
```

- [ ] **Add path match** in `getActiveAppRoute()`

```typescript
if (pathname.startsWith("/app/profil")) return "settings";
```

---

### Task 4: Update layout to fetch community link

**Files:**
- Modify: `app/app/layout.tsx`

- [ ] **Add import**

```typescript
import { getCommunityLink } from "@/lib/data/app-config";
```

- [ ] **Fetch link and pass to AppTopBar**

After `const isPlus = ...`:
```typescript
const communityLink = await getCommunityLink();
```

Change AppTopBar to:
```tsx
<AppTopBar name={name} initials={initials} isPlus={isPlus} communityLink={communityLink} />
```

---

### Task 5: Update AppTopBar dropdown

**Files:**
- Modify: `components/AppTopBar.tsx`

- [ ] **Add communityLink prop**

```typescript
interface AppTopBarProps {
  name: string;
  initials: string;
  isPlus: boolean;
  communityLink?: string | null;
}
```

- [ ] **Add "Profil" and "Gabung Komunitas" to dropdown** (between the account block and Bantuan)

After the name/plan block (around current line 101), add:
```tsx
<Link className={`${styles.appAccountLink} ${styles.appAccountMenuItem}`} href="/app/profil" onClick={closeMenu}>
  <User size={16} />
  Profil
</Link>

{communityLink ? (
  <a className={`${styles.appAccountLink} ${styles.appAccountMenuItem}`} href={communityLink} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
    <TelegramLogo size={16} />
    Gabung Komunitas
  </a>
) : null}
```

Add imports for `User` and `TelegramLogo` from `@phosphor-icons/react`.

Note: `TelegramLogo` may not exist in phosphor; use `ChatTelevision` or `PaperPlaneTilt` as fallback. Let me check what icon is appropriate. Actually, use `PaperPlaneTilt` which is closest to Telegram's send icon.

---

### Task 6: Create profile content component

**Files:**
- Create: `components/ProfileContent.tsx`

- [ ] **Create client component for profile form**

```typescript
"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, DeviceMobile, EnvelopeSimple, PencilSimple, User } from "@phosphor-icons/react";
import { Button, Field, TextField } from "@/components/app-ui/controls";
import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import { PageHeader, Surface } from "@/components/app-ui/structure";
import { updateName } from "@/app/app/actions";

interface ProfileContentProps {
  email: string;
  name: string;
  initials: string;
  plan: string;
  activeUntil: string | null;
}

export default function ProfileContent({ email, name: initialName, initials, plan, activeUntil }: ProfileContentProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed.length > 100) {
      setError("Nama tidak valid");
      return;
    }

    const formData = new FormData();
    formData.set("name", trimmed);

    startTransition(async () => {
      setError(null);
      const result = await updateName(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setName(trimmed);
        setEditing(false);
        router.refresh();
      }
    });
  }, [editValue, router]);

  const isFullAccess = plan === "full_access";
  const isExpired = plan === "expired";
  const isFree = plan === "free" || (!isFullAccess && !isExpired);

  return (
    <RouteCanvas route="settings">
      <PageMain>
        <PageHeader route="settings" title="Profil" description="Nama dan informasi akun kamu." />

        <Surface padding="compact">
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--tw-primary-alpha, rgba(0,108,83,.12))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 700, color: "var(--tw-primary, #006c53)",
              border: "2px solid var(--app-line, #d0ddd6)",
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
              <div style={{ fontSize: 13, color: "var(--app-ink-muted, #5f6b68)" }}>{email}</div>
            </div>
          </div>

          {/* Name field */}
          <Field controlId="profile-name" label="Nama" required error={error ?? undefined}>
            {editing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <TextField id="profile-name" value={editValue} onChange={setEditValue} placeholder="Nama lengkap" autoComplete="name" />
                <Button type="button" variant="primary" size="compact" disabled={pending} onClick={handleSave}>
                  {pending ? "..." : <Check size={16} />}
                </Button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1, padding: "8px 0", fontSize: 15 }}>{name}</div>
                <Button type="button" variant="quiet" size="compact" onClick={() => { setEditValue(name); setEditing(true); }}>
                  <PencilSimple size={16} />
                </Button>
              </div>
            )}
          </Field>
        </Surface>

        {/* Access status */}
        <Surface padding="compact" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--app-ink-muted)", marginBottom: 12 }}>
            Status Akses
          </div>
          <div style={{
            padding: "12px 16px", borderRadius: 8,
            background: isFullAccess ? "rgba(0,108,83,.08)" : "var(--app-bg-soft, #f0f5f3)",
            border: "1px solid",
            borderColor: isFullAccess ? "rgba(0,108,83,.2)" : "var(--app-line, #d0ddd6)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14 }}>
              {isFullAccess ? "Plus" : isExpired ? "Plus — Kedaluwarsa" : "Paket Free"}
            </div>
            {isFullAccess && activeUntil && (
              <div style={{ fontSize: 13, color: "var(--app-ink-muted)", marginTop: 4 }}>
                Aktif sampai {new Date(activeUntil).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}
            {isExpired && (
              <div style={{ marginTop: 8 }}>
                <Button href="/harga" variant="primary" size="compact">Perpanjang Plus</Button>
              </div>
            )}
          </div>
        </Surface>

        {/* CTA mobile app */}
        <Surface padding="compact" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <DeviceMobile size={24} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Catat sesi dari aplikasi TutorLog</div>
              <div style={{ fontSize: 13, color: "var(--app-ink-muted)" }}>Unduh aplikasi untuk mencatat sesi les di HP.</div>
            </div>
            <Button href="https://play.google.com/store/apps/details?id=com.tutorlog.app" target="_blank" variant="primary" size="compact">
              Buka aplikasi
            </Button>
          </div>
        </Surface>
      </PageMain>
    </RouteCanvas>
  );
}
```

---

### Task 7: Create profile page

**Files:**
- Create: `app/app/settings/page.tsx`

- [ ] **Create server component page**

```typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkQuota } from "@/lib/data/quota";
import ProfileContent from "@/components/ProfileContent";

export const metadata: Metadata = {
  title: "TutorLog - Profil",
  description: "Profil dan pengaturan akun.",
};

function displayName(email: string, metaName?: unknown): string {
  if (typeof metaName === "string" && metaName.trim()) return metaName.trim();
  return email.split("@")[0];
}

function initialsOf(name: string): string {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const email = user.email ?? "";
  const metaName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  const name = displayName(email, metaName);
  const initials = initialsOf(name);
  const quota = await checkQuota();

  return (
    <ProfileContent
      email={email}
      name={name}
      initials={initials}
      plan={quota.plan}
      activeUntil={quota.activeUntil}
    />
  );
}
```

---

### Task 8: Verify

- [ ] **Run lint**

Run: `npm run lint`
Expected: No new errors (pre-existing invoice/controls errors only)

- [ ] **Run responsive sweep tests**

Run: `npx playwright test tests/responsive-sweep.spec.ts`
Expected: 94/94 pass

- [ ] **Run a11y tests**

Run: `npx playwright test tests/a11y.spec.ts`
Expected: 13/13 pass

- [ ] **Commit**

```bash
git checkout -b feat/profile-page
git add .
git commit -m "feat: profile page at /app/profil with name editing and community link"
```
