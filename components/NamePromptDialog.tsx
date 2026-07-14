"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, TextField } from "@/components/app-ui/controls";
import { Dialog } from "@/components/app-ui/overlays";
import { updateName } from "@/app/app/actions";

interface NamePromptDialogProps {
  hasName: boolean;
}

export default function NamePromptDialog({ hasName }: NamePromptDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(!hasName);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = useCallback(() => {
    if (!name.trim() || name.trim().length > 100) {
      setError("Nama tidak valid");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());

    startTransition(async () => {
      setError(null);
      const result = await updateName(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  }, [name, router]);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Isi nama kamu"
      description="Nama akan muncul di sudut atas dan digunakan di invoice."
      size="small"
      dismissible
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button type="button" variant="quiet" onClick={() => setOpen(false)}>
            Nanti
          </Button>
          <Button type="button" variant="primary" disabled={pending || !name.trim()} onClick={handleSubmit}>
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      <Field
        controlId="name-input"
        label="Nama lengkap"
        required
        error={error ?? undefined}
      >
        <TextField
          id="name-input"
          name="name"
          value={name}
          onChange={setName}
          placeholder="Nama lengkap"
          autoComplete="name"
        />
      </Field>
    </Dialog>
  );
}
