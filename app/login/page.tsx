import type { Metadata } from "next";
import Link from "next/link";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { createClient } from "@/lib/supabase/server";
import { sendMagicLink } from "./actions";

export const metadata: Metadata = {
  title: "TutorLog - Masuk",
  description: "Masuk ke TutorLog lewat link yang dikirim ke emailmu.",
};

const errorMessages: Record<string, string> = {
  "invalid-email": "Masukkan alamat email yang valid.",
  "send-failed": "Link belum berhasil dikirim. Coba lagi beberapa saat lagi.",
  auth: "Link masuk tidak valid atau sudah kedaluwarsa. Kirim link baru untuk melanjutkan.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/app");

  const { error, email = "" } = await searchParams;
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <PublicShell
      compact
      className="tl-auth-page"
      eyebrow="Masuk"
      title="Masuk ke TutorLog."
      subtitle="Masukkan email yang kamu pakai di aplikasi mobile. Kami kirim link masuk tanpa password."
      icon={null}
      showBackLink
    >
      <section className="tl-auth-layout tl-auth-login-layout" aria-label="Masuk ke TutorLog">
        <form className="tl-auth-form" action={sendMagicLink}>
          {errorMessage ? <p className="tl-auth-error" role="alert">{errorMessage}</p> : null}
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={email}
            placeholder="nama@email.com"
            required
          />
          <p className="tl-auth-form-help">Link berlaku 1 jam. Belum punya akun? Kami akan membuatnya saat kamu masuk.</p>
          <button className="tl-button tl-button-primary tl-auth-submit" type="submit">
            <PaperPlaneTilt size={18} weight="fill" aria-hidden="true" />
            <span>Kirim Link Masuk</span>
          </button>
          <p className="tl-auth-legal">Dengan masuk, kamu menyetujui <Link href="/privacy">Privasi</Link> dan <Link href="/terms">Syarat</Link> TutorLog.</p>
        </form>
      </section>
    </PublicShell>
  );
}
