import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, EnvelopeOpen } from "@phosphor-icons/react/dist/ssr";
import { PublicShell } from "@/components/PublicShell";
import { MarketingButton } from "@/components/public-ui/marketing-button";
import { safeNextPath } from "@/lib/auth/safe-next";
import { OtpForm } from "./otp-form";

export const metadata: Metadata = {
  title: "TutorLog - Cek email",
  description: "Buka tautan dari email untuk masuk ke TutorLog.",
};

export default async function LoginSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string; error?: string }>;
}) {
  const { email, next: requestedNext, error } = await searchParams;
  const next = safeNextPath(requestedNext);
  const emailLabel = email || "alamat email kamu";
  const errorMessage =
    error === "rate-limited"
      ? "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi."
      : error === "invalid-code"
        ? "Kode salah atau sudah kedaluwarsa. Periksa lagi atau kirim kode baru."
        : null;

  return (
    <PublicShell
      compact
      className="tl-auth-page tl-auth-sent-page"
      eyebrow="Tautan masuk sudah dikirim"
      title="Cek email kamu."
      subtitle="Buka tautan di email untuk masuk ke web TutorLog."
      icon={null}
      showBackLink
    >
      <section className="tl-auth-layout tl-auth-sent-layout" aria-label="Petunjuk membuka tautan masuk">
        <div className="tl-auth-context">
          <span className="tl-auth-icon" aria-hidden="true"><EnvelopeOpen size={28} weight="duotone" /></span>
          <h2>Tautan dikirim ke:</h2>
          <p className="tl-auth-email">{emailLabel}</p>
          <p className="tl-auth-note">Tautan dan kode berlaku selama 1 jam.</p>
        </div>
        <div className="tl-auth-divider" aria-hidden="true" />
        <div className="tl-auth-form tl-auth-sent-actions">
          <div className="tl-auth-form-heading">
            <h2>Buka email lalu pilih tautan masuk.</h2>
            <p>Kalau email belum terlihat, cek folder spam atau tunggu beberapa detik.</p>
          </div>
          <MarketingButton
            href="https://mail.google.com"
            target="_blank"
            rel="noopener"
            size="large"
            block
            trailingIcon={<ArrowRight size={18} />}
          >
            Buka Gmail
          </MarketingButton>
          {errorMessage ? <p className="tl-auth-error" role="alert">{errorMessage}</p> : null}
          {email ? <OtpForm email={email} next={next} /> : null}
          <p className="tl-auth-legal">Salah alamat? <Link href={`/login?next=${encodeURIComponent(next)}`}>Ganti email</Link>.</p>
        </div>
      </section>
    </PublicShell>
  );
}
