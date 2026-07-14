"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, DeviceMobile, PencilSimple } from "@phosphor-icons/react";
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

  return (
    <RouteCanvas route="settings">
      <PageMain>
        <PageHeader route="settings" title="Profil" description="Nama dan informasi akun kamu." />

        <Surface padding="compact">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(0,108,83,.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
                color: "#006c53",
                border: "2px solid var(--app-line, #d0ddd6)",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
              <div style={{ fontSize: 13, color: "var(--app-ink-muted, #5f6b68)", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
            </div>
          </div>

          <Field controlId="profile-name" label="Nama" required error={error ?? undefined}>
            {editing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <TextField id="profile-name" value={editValue} onChange={setEditValue} placeholder="Nama lengkap" autoComplete="name" />
                </div>
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

        <Surface padding="compact" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--app-ink-muted, #5f6b68)", marginBottom: 12 }}>
            Status Akses
          </div>
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              background: isFullAccess ? "rgba(0,108,83,.08)" : "var(--app-bg-soft, #f0f5f3)",
              border: "1px solid",
              borderColor: isFullAccess ? "rgba(0,108,83,.2)" : "var(--app-line, #d0ddd6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14 }}>
              {isFullAccess ? "Plus" : isExpired ? "Plus — Kedaluwarsa" : "Paket Free"}
            </div>
            {isFullAccess && activeUntil && (
              <div style={{ fontSize: 13, color: "var(--app-ink-muted, #5f6b68)", marginTop: 4 }}>
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

        <Surface padding="compact" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <DeviceMobile size={24} aria-hidden="true" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Catat sesi dari aplikasi TutorLog</div>
              <div style={{ fontSize: 13, color: "var(--app-ink-muted, #5f6b68)" }}>Unduh aplikasi untuk mencatat sesi les di HP.</div>
            </div>
            <Button href="https://play.google.com/store/apps/details?id=com.tutorlog.app" target="_blank" variant="primary" size="compact" style={{ flexShrink: 0 }}>
              Buka aplikasi
            </Button>
          </div>
        </Surface>
      </PageMain>
    </RouteCanvas>
  );
}
