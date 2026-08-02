import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { PublicField } from "@/components/public-ui/public-field";
import { safeNextPath } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";
import { sendMagicLink } from "./actions";
import { LoginSubmitButton } from "./login-submit-button";

export const metadata: Metadata = {
  title: "TutorLog - Masuk",
  description: "Masuk ke TutorLog lewat tautan yang dikirim ke emailmu.",
};

const errorMessages: Record<string, string> = {
  "invalid-email": "Masukkan alamat email yang valid.",
  "send-failed": "Tautan belum berhasil dikirim. Coba lagi beberapa saat lagi.",
  auth: "Tautan masuk tidak valid atau sudah kedaluwarsa. Kirim tautan baru untuk masuk.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; next?: string }>;
}) {
  const { error, email = "", next: requestedNext } = await searchParams;
  const next = safeNextPath(requestedNext);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(next);

  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <PublicShell
      compact
      className="tl-auth-page"
      eyebrow="Masuk"
      title="Masuk ke TutorLog."
      subtitle="Masukkan email yang kamu pakai di aplikasi. Kami akan mengirim tautan masuk ke emailmu. Kamu tidak perlu kata sandi."
      icon={null}
      showBackLink
    >
      <section className="tl-auth-layout tl-auth-login-layout" aria-label="Masuk ke TutorLog">
        <form className="tl-auth-form" action={sendMagicLink}>
          <input type="hidden" name="next" value={next} />
          {errorMessage ? <p className="tl-auth-error" role="alert">{errorMessage}</p> : null}
          <PublicField
            controlId="login-email"
            label="Email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={email}
            placeholder="nama@email.com"
            required
            helper="Tautan berlaku selama 1 jam. Kalau email belum terdaftar, akun baru akan dibuat otomatis."
          />
          <LoginSubmitButton />
          <p className="tl-auth-legal">Dengan masuk, kamu menyetujui <Link href="/privacy">Kebijakan privasi</Link> dan <Link href="/terms">Syarat &amp; ketentuan</Link> TutorLog.</p>
        </form>
      </section>
    </PublicShell>
  );
}
