"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, DeviceMobile, PencilSimple } from "@phosphor-icons/react";
import { Button, IconButton } from "@/components/app-ui/controls";
import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import { PageHeader, Surface } from "@/components/app-ui/structure";
import styles from "@/components/app-ui/app-ui.module.css";
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
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
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
            <div style={{ flex: 1, minWidth: 0 }}>
              {!editing ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{name}</span>
                    <Button type="button" variant="quiet" size="compact" onClick={() => { setEditValue(name); setEditing(true); }}>
                      <PencilSimple size={16} />
                    </Button>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--app-ink-muted, #5f6b68)", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
                </>
              ) : (
                <div>
                  <label
                    className={styles.fieldLabel}
                    htmlFor="profile-name"
                    style={{ display: "block", marginBottom: 8 }}
                  >
                    Edit nama<span className={styles.requiredMark}> *</span>
                  </label>
                  <div
                    className={`${styles.fieldControl} ${styles.fieldControlSizeDefault}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      width: "fit-content",
                      maxWidth: "100%",
                      paddingInline: 8,
                    }}
                  >
                    <input
                      id="profile-name"
                      value={editValue}
                      onChange={(event) => setEditValue(event.target.value)}
                      placeholder="Nama lengkap"
                      autoComplete="name"
                      required
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? "profile-name-error" : undefined}
                      style={{
                        flex: "1 1 120px",
                        minWidth: 0,
                        width: `max(120px, ${Math.max(editValue.length, 1) + 1}ch)`,
                        border: 0,
                        outline: "none",
                        background: "transparent",
                        fontFamily: "var(--app-font-body)",
                        fontSize: 14,
                        lineHeight: "21px",
                        color: "var(--app-ink)",
                        fieldSizing: "content",
                      }}
                    />
                    <IconButton
                      icon={<Check size={18} weight="light" />}
                      label="Simpan"
                      variant="quiet"
                      size="compact"
                      disabled={pending}
                      onClick={handleSave}
                    />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      style={{
                        appearance: "none",
                        border: 0,
                        background: "transparent",
                        padding: "0 4px",
                        color: "var(--app-ink-muted, #5f6b68)",
                        fontFamily: "var(--app-font-body)",
                        fontSize: 13,
                        fontWeight: 700,
                        lineHeight: "18px",
                        cursor: "pointer",
                      }}
                    >
                      Batal
                    </button>
                  </div>
                  {error ? (
                    <p id="profile-name-error" className={styles.fieldError} role="alert" style={{ marginTop: 8 }}>
                      {error}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
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
          <div className={styles.profileCta}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
              <DeviceMobile size={24} aria-hidden="true" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Catat sesi dari aplikasi TutorLog</div>
                <div style={{ fontSize: 13, color: "var(--app-ink-muted, #5f6b68)" }}>Unduh aplikasi untuk mencatat sesi les di HP.</div>
              </div>
            </div>
            <div className={styles.profileCtaButton}>
              <Button href="https://play.google.com/store/apps/details?id=com.tutorlog.app" target="_blank" variant="primary" size="compact">
                Buka aplikasi
              </Button>
            </div>
          </div>
        </Surface>
      </PageMain>
    </RouteCanvas>
  );
}
