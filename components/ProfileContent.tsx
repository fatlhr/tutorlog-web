"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DeviceMobile, PencilSimple } from "@phosphor-icons/react";
import { Button, Field, TextField } from "@/components/app-ui/controls";
import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import { PageHeader, Surface } from "@/components/app-ui/structure";
import { updateName } from "@/app/app/actions";

interface ProfileContentProps {
  email: string;
  name: string;
  initials: string;
  isPlus: boolean;
  activeUntil: string | null;
}

export default function ProfileContent({ email, name: initialName, initials, isPlus, activeUntil }: ProfileContentProps) {
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

  const END_OF_DAY_MS = 86400000;
  const activeUntilDate = activeUntil ? new Date(activeUntil) : null;
  const isExpired = activeUntilDate ? activeUntilDate.getTime() + END_OF_DAY_MS < Date.now() : false;

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

          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--app-ink-muted, #5f6b68)", marginBottom: 4 }}>Nama</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>{name}</span>
              {!editing && (
                <Button type="button" variant="quiet" size="compact" onClick={() => { setEditValue(name); setEditing(true); }}>
                  <PencilSimple size={16} />
                </Button>
              )}
            </div>
          </div>

          {editing && (
            <div style={{ marginTop: 12 }}>
              <Field controlId="profile-name" label="Edit nama" required error={error ?? undefined}>
                <TextField id="profile-name" value={editValue} onChange={setEditValue} placeholder="Nama lengkap" autoComplete="name" />
              </Field>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <Button type="button" variant="quiet" size="compact" onClick={() => setEditing(false)}>
                  Batal
                </Button>
                <Button type="button" variant="primary" size="compact" disabled={pending} onClick={handleSave}>
                  {pending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          )}
        </Surface>

        {isPlus ? (
          <Surface padding="compact" style={{ marginTop: 16 }} variant={isExpired ? "paper" : "soft"}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--app-ink-muted)", marginBottom: 8 }}>
              Status Akses
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: isExpired ? "var(--app-error)" : undefined }}>
              {isExpired ? "Plus — Kedaluwarsa" : "Plus"}
            </div>
            {activeUntilDate && !isExpired && (
              <div style={{ fontSize: 13, color: "var(--app-ink-muted)", marginTop: 4 }}>
                Aktif sampai {activeUntilDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}
            {isExpired && (
              <div style={{ marginTop: 10 }}>
                <Button href="/harga" variant="primary" size="compact">Perpanjang Plus</Button>
              </div>
            )}
          </Surface>
        ) : (
          <Surface padding="compact" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--app-ink-muted)", marginBottom: 8 }}>
              Status Akses
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              Paket Free
            </div>
          </Surface>
        )}

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
