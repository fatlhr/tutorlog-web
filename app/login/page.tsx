import type { Metadata } from "next";
import Link from "next/link";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { MarketingButton } from "@/components/public-ui/marketing-button";
import { PublicField } from "@/components/public-ui/public-field";
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
      subtitle="Masukkan email yang kamu pakai di aplikasi. Kami akan mengirim link masuk ke emailmu. Kamu tidak perlu password."
      icon={null}
      showBackLink
    >
      <section className="tl-auth-layout tl-auth-login-layout" aria-label="Masuk ke TutorLog">
        <form className="tl-auth-form" action={sendMagicLink}>
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
            helper="Link berlaku 1 jam. Kalau email belum terdaftar, akun baru akan dibuat otomatis."
          />
          <MarketingButton
            type="submit"
            size="large"
            block
            leadingIcon={<PaperPlaneTilt size={18} weight="fill" />}
          >
            Kirim link masuk
          </MarketingButton>
          <p className="tl-auth-legal">Dengan masuk, kamu menyetujui <Link href="/privacy">Kebijakan Privasi</Link> dan <Link href="/terms">Syarat &amp; Ketentuan</Link> TutorLog.</p>
        </form>
      </section>
    </PublicShell>
  );
}
