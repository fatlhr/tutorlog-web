import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, EnvelopeOpen } from "@phosphor-icons/react/dist/ssr";
import { PublicShell } from "@/components/PublicShell";
import { sendMagicLink } from "../actions";

export const metadata: Metadata = {
  title: "TutorLog - Cek Email",
  description: "Buka link dari email untuk masuk ke TutorLog.",
};

export default async function LoginSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const emailLabel = email || "alamat email kamu";

  return (
    <PublicShell
      compact
      className="tl-auth-page tl-auth-sent-page"
      eyebrow="Link masuk terkirim"
      title="Cek email kamu."
      subtitle="Buka link yang baru kami kirim untuk melanjutkan ke TutorLog web."
      icon={null}
      showBackLink
    >
      <section className="tl-auth-layout tl-auth-sent-layout" aria-label="Petunjuk membuka link masuk">
        <div className="tl-auth-context">
          <span className="tl-auth-icon" aria-hidden="true"><EnvelopeOpen size={28} weight="duotone" /></span>
          <h2>Link dikirim ke:</h2>
          <p className="tl-auth-email">{emailLabel}</p>
          <p className="tl-auth-note">Link berlaku selama 1 jam.</p>
        </div>
        <div className="tl-auth-divider" aria-hidden="true" />
        <div className="tl-auth-form tl-auth-sent-actions">
          <div className="tl-auth-form-heading">
            <h2>Buka email, lalu kembali ke sini.</h2>
            <p>Kalau email belum terlihat, cek folder spam atau tunggu beberapa detik.</p>
          </div>
          <a className="tl-button tl-button-primary tl-auth-submit" href="https://mail.google.com" target="_blank" rel="noopener">
            <span>Buka Gmail</span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          {email ? (
            <form action={sendMagicLink}>
              <input type="hidden" name="email" value={email} />
              <button className="tl-auth-text-button" type="submit">Kirim ulang link</button>
            </form>
          ) : null}
          <p className="tl-auth-legal">Salah alamat? <Link href="/login">Ganti email</Link>.</p>
        </div>
      </section>
    </PublicShell>
  );
}
