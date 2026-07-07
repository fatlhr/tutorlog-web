import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MenuToggle from "@/components/MenuToggle";
import PricingCards from "@/components/PricingCards";

export const metadata: Metadata = {
  title: "TutorLog — Harga",
  description: "Mulai gratis, upgrade kalau butuh. Free, PLUS Beli Putus, dan PLUS Bulanan.",
};

export default function HargaPage() {
  return (
    <>
      {/* MOBILE */}
      <div className="vp-mobile">
        <div className="mob-page tw">
          {/* SOFT HERO */}
          <div className="mob-soft-hero">
            <nav className="mob-nav">
              <Link className="brand" href="/">
                <span className="mk"><Image src="/tutorlog-logo.png" alt="" width={32} height={32} /></span>
                <span className="wm">TutorLog</span>
              </Link>
              <MenuToggle />
            </nav>
            <div className="mob-soft-hero__content">
              <div className="mob-soft-hero__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M3 7a2 2 0 0 1 2-2h14v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M3 9h18 M17 15h.01" /></svg>
              </div>
              <h1>Harga</h1>
              <p className="mob-soft-hero__sub">Mulai gratis, upgrade kalau butuh.</p>
            </div>
          </div>

          <div className="mob-harga-body">
            <PricingCards variant="harga" />

            {/* FAQ */}
            <div className="mob-faq-section">
              <h3>Pertanyaan Umum</h3>
              <div className="mob-faq-item">
                <div className="mob-faq-q">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M9 18l6-6-6-6" /></svg>
                  <span>Data hilang kalau tidak upgrade?</span>
                </div>
                <div className="mob-faq-a" style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--tw-text-2)", marginTop: 6, lineHeight: 1.5 }}>Tidak. Data tetap aman. Hanya export dan invoice terbatas di Free.</div>
              </div>
              <div className="mob-faq-item">
                <div className="mob-faq-q">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M9 18l6-6-6-6" /></svg>
                  <span>Apa bedanya Beli Putus dan Bulanan?</span>
                </div>
                <div className="mob-faq-a" style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--tw-text-2)", marginTop: 6, lineHeight: 1.5 }}>Beli Putus: bayar Rp 149rb sekali, akses fitur PLUS selamanya. Bulanan: bayar Rp 19rb per bulan, bisa berhenti kapan saja. Fiturnya sama.</div>
              </div>
              <div className="mob-faq-item">
                <div className="mob-faq-q">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M9 18l6-6-6-6" /></svg>
                  <span>Bagaimana cara bayar?</span>
                </div>
                <div className="mob-faq-a" style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--tw-text-2)", marginTop: 6, lineHeight: 1.5 }}>Via Lynk.id (QRIS/transfer) atau transfer manual ke rekening BCA/Mandiri. Detail di halaman Langganan.</div>
              </div>
              <div className="mob-faq-item">
                <div className="mob-faq-q">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M9 18l6-6-6-6" /></svg>
                  <span>Bisa refund?</span>
                </div>
                <div className="mob-faq-a" style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--tw-text-2)", marginTop: 6, lineHeight: 1.5 }}>Pembayaran non-refundable.</div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mob-footer">
            <div className="links">
              <Link href="/fitur">Fitur</Link><Link href="/harga">Harga</Link><Link href="/panduan">Panduan</Link>
              <Link href="/privacy">Privasi</Link><Link href="/terms">Syarat</Link><Link href="/account">Hapus Akun</Link><Link href="/kontak">Kontak</Link>
            </div>
            <div className="bottom">
              <Link className="brand" href="/">
                <span style={{ width: 24, height: 24, borderRadius: "var(--r-sm)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Image src="/tutorlog-logo.png" alt="" width={24} height={24} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </span>
                <span className="brand-sm">TutorLog</span>
              </Link>
              <div className="copy">© 2026 · TutorLog untuk tutor Indonesia</div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="vp-desktop">
        {/* HERO BAND with DARK NAV */}
        <div style={{
          position: "relative", overflow: "hidden", padding: "100px clamp(24px, 6.5vw, 96px) 56px",
          background: "linear-gradient(160deg, #0f2920 0%, #143328 35%, #122a22 60%, #0d1f18 100%)",
        }}>
          <nav className="nav-top-dark">
            <Link className="brand" href="/" style={{ textDecoration: "none" }}>
              <span className="mk" style={{ width: 40, height: 40, borderRadius: "var(--r-md)" }}>
                <Image src="/tutorlog-logo.png" alt="" width={40} height={40} />
              </span>
              <span className="wm">TutorLog</span>
            </Link>
            <div className="links">
              <Link href="/fitur">Fitur</Link>
              <Link href="/harga">Harga</Link>
              <Link href="/panduan">Panduan</Link>
            </div>
            <Link className="btn btn-primary btn-sm" href="/login">Masuk</Link>
          </nav>
          <div style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(140,246,210,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(140,246,210,.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}></div>
          {[
            { x: "8%", y: "20%", s: 5, glow: true, pd: "5s", po: ".4" },
            { x: "25%", y: "35%", s: 4, glow: false, pd: "4s", po: ".25" },
            { x: "55%", y: "15%", s: 6, glow: true, pd: "6s", po: ".45" },
            { x: "78%", y: "30%", s: 5, glow: false, pd: "4.5s", po: ".3" },
            { x: "92%", y: "20%", s: 7, glow: true, pd: "5s", po: ".4" },
            { x: "40%", y: "55%", s: 4, glow: false, pd: "5.5s", po: ".2" },
            { x: "70%", y: "60%", s: 5, glow: true, pd: "4s", po: ".35" },
            { x: "15%", y: "65%", s: 6, glow: true, pd: "6s", po: ".4" },
          ].map((p, i) => (
            <div key={i} className={"login-particle pulse" + (p.glow ? " glow" : "")}
              style={{ left: p.x, top: p.y, width: p.s, height: p.s, ["--pd" as string]: p.pd, ["--po" as string]: p.po, ["--pt" as string]: (i * 0.4) + "s" }}
            />
          ))}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }} preserveAspectRatio="none">
            <line x1="8%" y1="20%" x2="25%" y2="35%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
            <line x1="55%" y1="15%" x2="78%" y2="30%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
            <line x1="78%" y1="30%" x2="92%" y2="20%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
            <line x1="15%" y1="65%" x2="40%" y2="55%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
            <line x1="40%" y1="55%" x2="70%" y2="60%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
          </svg>
          <div style={{ position: "relative", zIndex: 10, maxWidth: 780, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 52, height: 52, borderRadius: "var(--r-lg)",
                background: "rgba(140,246,210,.08)", border: "1px solid rgba(140,246,210,.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--tw-primary-soft)",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M3 7a2 2 0 0 1 2-2h14v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M3 9h18 M17 15h.01" /></svg>
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, letterSpacing: "-.5px", margin: 0, color: "#F5EFE4" }}>Harga</h1>
                <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "rgba(140,246,210,.55)", margin: "4px 0 0" }}>Mulai gratis, upgrade kalau butuh.</p>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 32px 64px", fontFamily: "var(--f-body)", fontSize: 15, lineHeight: 1.7, color: "var(--tw-text-2)" }}>
          <div className="harga-pricing" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 48 }}>
            <PricingCards variant="harga" />
          </div>

          <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Pertanyaan Umum</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
            {[
              { q: "Apakah data saya hilang kalau tidak upgrade?", a: "Tidak. Data sesi kamu tetap tersimpan. Hanya fitur export PDF/CSV dan invoice yang terbatas di Free plan." },
              { q: "Apa bedanya Beli Putus dan Bulanan?", a: "Beli Putus: bayar Rp 149rb sekali, akses fitur PLUS selamanya. Bulanan: bayar Rp 19rb per bulan, bisa berhenti kapan saja. Keduanya punya fitur yang sama — bedanya hanya cara bayar." },
              { q: "Bagaimana cara bayar?", a: 'Klik "Bayar via Lynk.id" di halaman Langganan untuk bayar pakai QRIS/transfer. Kamu juga bisa transfer manual ke rekening BCA atau Mandiri yang tertera, lalu konfirmasi di halaman Langganan.' },
              { q: "Bisa refund?", a: "Pembayaran yang sudah dilakukan bersifat non-refundable. Pastikan kamu sudah yakin sebelum membayar." },
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: "20px 24px" }}>
                <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 16, color: "var(--tw-text)", marginBottom: 8 }}>{f.q}</div>
                <p style={{ margin: 0, fontSize: 14 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="landing-footer">
          <div className="footer-links">
            <div className="link-group">
              <Link href="/fitur">Fitur</Link>
              <Link href="/harga">Harga</Link>
                <Link href="/panduan">Panduan</Link>
              </div>
              <div className="link-group">
                <Link href="/privacy">Privasi</Link>
                <Link href="/terms">Syarat</Link>
                <Link href="/account">Hapus Akun</Link>
              <Link href="/kontak">Kontak</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-brand">
              <span className="mk" style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", background: "var(--tw-surface-soft)", border: "1px solid var(--tw-border)" }}>
                <Image src="/tutorlog-logo.png" alt="" width={32} height={32} />
              </span>
              <span className="brand-sm">TutorLog</span>
            </div>
            <div className="footer-copy">© 2026 · TutorLog untuk tutor Indonesia</div>
          </div>
        </div>
      </div>
    </>
  );
}
