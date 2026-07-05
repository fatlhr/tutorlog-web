import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MenuToggle from "@/components/MenuToggle";

export const metadata: Metadata = {
  title: "TutorLog — Harga",
  description: "Mulai gratis, upgrade kalau butuh. Free, PLUS Beli Putus, dan PLUS Bulanan.",
};

export default function HargaPage() {
  return (
    <>
      <style>{`
        .mob-price-card { transition: all .25s ease; }
        .mob-price-card:hover { transform: translateY(-4px); }
        .mob-price-card--free:hover { border-color: var(--tw-primary-soft); }
        .harga-pricing .card { transition: all .25s ease; }
        .harga-pricing .card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,.08); }
      `}</style>
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
            {/* Free tier */}
            <div className="mob-price-card mob-price-card--free">
              <div className="mob-price-header">
                <span className="mob-price-tier">Free</span>
                <div className="mob-price-amount">
                  <span className="mob-price-currency">Rp</span>
                  <span className="mob-price-value">0</span>
                </div>
                <span className="mob-price-period">selamanya</span>
              </div>
              <div className="mob-price-divider"></div>
              <ul className="mob-price-features">
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Rekap bulanan lengkap</li>
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Filter per murid</li>
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Export PDF rekap (1×/bulan)</li>
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Export CSV (1×/bulan)</li>
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Invoice builder (preview only)</li>
              </ul>
              <Link className="btn btn-secondary btn-sm" href="/login" style={{ width: "100%" }}>Mulai Gratis</Link>
            </div>

            {/* PLUS Beli Putus */}
            <div className="mob-price-card mob-price-card--plus">
              <div className="mob-price-badge">Rekomendasi</div>
              <div className="plan-orb"></div>
              <div className="mob-price-header">
                <span className="mob-price-tier">PLUS Beli Putus</span>
                <div style={{ fontSize: 11, color: "#f87171", fontWeight: 600, background: "rgba(248,113,113,.1)", padding: "2px 8px", borderRadius: 4, display: "inline-block", marginBottom: 4 }}>Hemat 47%</div>
                <div style={{ fontSize: 14, textDecoration: "line-through", color: "#f87171", marginBottom: 2, fontWeight: 500 }}>Rp 149rb</div>
                <div className="mob-price-amount">
                  <span className="mob-price-currency">Rp</span>
                  <span className="mob-price-value">79rb</span>
                </div>
                <span className="mob-price-period">sekali bayar · akses seumur hidup</span>
              </div>
              <div className="mob-price-divider"></div>
              <ul className="mob-price-features">
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Semua fitur Free</li>
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Export invoice PDF tanpa batas</li>
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Export rekap tanpa batas</li>
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>3 template + kustom warna</li>
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Prioritas dukungan WA</li>
              </ul>
              <Link className="btn btn-primary btn-sm" href="/app/langganan"
                style={{ width: "100%", background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Bayar via Lynk.id
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3" /></svg>
                </span>
              </Link>
            </div>

            {/* PLUS Bulanan */}
            <div className="mob-price-card mob-price-card--free" style={{ borderColor: "var(--tw-primary-soft)" }}>
              <div className="mob-price-header">
                <span className="mob-price-tier">PLUS Bulanan</span>
                <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 600, background: "rgba(239,68,68,.1)", padding: "2px 8px", borderRadius: 4, display: "inline-block", marginBottom: 4 }}>Hemat 53%</div>
                <div style={{ fontSize: 14, textDecoration: "line-through", color: "#ef4444", marginBottom: 2, fontWeight: 500 }}>Rp 19rb</div>
                <div className="mob-price-amount">
                  <span className="mob-price-currency">Rp</span>
                  <span className="mob-price-value">9rb</span>
                </div>
                <span className="mob-price-period">per bulan</span>
              </div>
              <div className="mob-price-divider"></div>
              <ul className="mob-price-features">
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Semua fitur PLUS</li>
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Bayar per bulan, tanpa komitmen</li>
                <li><span className="mob-price-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg></span>Bisa berhenti kapan saja</li>
              </ul>
              <Link className="btn btn-secondary btn-sm" href="/app/langganan" style={{ width: "100%" }}>Pilih Bulanan</Link>
            </div>

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
            {/* Free plan */}
            <div className="card" style={{ padding: "32px 28px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 13, color: "var(--tw-text-3)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>Free</div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, color: "var(--tw-text)" }}>Rp 0</div>
                <div style={{ fontSize: 13, color: "var(--tw-text-3)", marginTop: 4 }}>/ selamanya</div>
              </div>
              <p style={{ fontSize: 14, color: "var(--tw-text-2)", marginBottom: 24, lineHeight: 1.6 }}>Untuk tutor yang baru mulai atau mengelola sedikit murid.</p>
              <ul style={{ paddingLeft: 0, margin: "0 0 32px", listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {["Rekap bulanan lengkap", "Filter per murid", "Custom date range", "Export PDF rekap (1×/bulan)", "Export CSV rekap (1×/bulan)", "Invoice builder (preview only)"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "var(--r-full)", background: "var(--tw-secondary-soft)", color: "var(--tw-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 20px", marginTop: 1 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "auto" }}>
                <Link className="btn btn-secondary btn-lg" href="/login" style={{ width: "100%" }}>Mulai Gratis</Link>
              </div>
            </div>

            {/* PLUS Beli Putus */}
            <div className="card" style={{
              padding: "32px 28px", display: "flex", flexDirection: "column",
              background: "linear-gradient(170deg, #0f2920, #143328)", color: "#F5EFE4",
              border: "1px solid rgba(140,246,210,.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 13, letterSpacing: ".5px", textTransform: "uppercase", color: "var(--tw-primary-soft)" }}>PLUS Beli Putus</div>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--f-body)", padding: "3px 10px", borderRadius: "var(--r-full)", background: "rgba(140,246,210,.15)", color: "var(--tw-primary-soft)" }}>Rekomendasi</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 12, color: "#f87171", fontWeight: 600, fontFamily: "var(--f-body)", background: "rgba(248,113,113,.1)", padding: "2px 10px", borderRadius: 4, display: "inline-block", marginBottom: 4 }}>Hemat 47%</div>
                <div style={{ fontSize: 16, textDecoration: "line-through", color: "#f87171", marginBottom: 2, fontWeight: 500 }}>Rp 149rb</div>
                <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36 }}>Rp 79rb</div>
                <div style={{ fontSize: 13, color: "rgba(140,246,210,.6)", fontWeight: 400, fontFamily: "var(--f-body)", marginTop: 4 }}>/ sekali</div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(245,239,228,.65)", marginBottom: 24, lineHeight: 1.5 }}>Akses seumur hidup. Bayar sekali, pakai selamanya.</p>
              <ul style={{ paddingLeft: 0, margin: "0 0 32px", listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {["Semua fitur Free", "Export invoice PDF tanpa batas", "Export rekap PDF & CSV tanpa batas", "3 template invoice + kustom warna", "Simpan rekening + template favorit", "Prioritas dukungan via WhatsApp"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "var(--r-full)", background: "rgba(140,246,210,.12)", color: "var(--tw-primary-soft)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 20px", marginTop: 1 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "auto" }}>
                <Link className="btn btn-primary btn-lg" href="/app/langganan"
                  style={{ width: "100%", padding: "0 24px", background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    Bayar via Lynk.id
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3" /></svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* PLUS Bulanan */}
            <div className="card" style={{ padding: "32px 28px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 13, color: "var(--tw-text-3)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>PLUS Bulanan</div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, fontFamily: "var(--f-body)", background: "rgba(239,68,68,.1)", padding: "2px 10px", borderRadius: 4, display: "inline-block", marginBottom: 4 }}>Hemat 53%</div>
                <div style={{ fontSize: 16, textDecoration: "line-through", color: "#ef4444", marginBottom: 2, fontWeight: 500 }}>Rp 19rb</div>
                <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, color: "var(--tw-text)" }}>Rp 9rb</div>
                <div style={{ fontSize: 13, color: "var(--tw-text-3)", marginTop: 4 }}>/ bulan</div>
              </div>
              <p style={{ fontSize: 14, color: "var(--tw-text-2)", marginBottom: 24, lineHeight: 1.6 }}>Alternatif fleksibel — bayar bulanan, tanpa komitmen jangka panjang.</p>
              <ul style={{ paddingLeft: 0, margin: "0 0 32px", listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {["Semua fitur PLUS", "Bayar per bulan", "Bisa berhenti kapan saja"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "var(--r-full)", background: "var(--tw-secondary-soft)", color: "var(--tw-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 20px", marginTop: 1 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "auto" }}>
                <Link className="btn btn-secondary btn-lg" href="/app/langganan" style={{ width: "100%" }}>Pilih Bulanan</Link>
              </div>
            </div>
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
