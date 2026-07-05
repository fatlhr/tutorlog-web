import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MenuToggle from "@/components/MenuToggle";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "TutorLog — Fitur",
  description: "Semua yang kamu butuh setelah sesi berakhir: rekap bulanan, export PDF & CSV, invoice builder, dan sinkronisasi app.",
};

export default function FiturPage() {
  return (
    <>
      <ScrollReveal />
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" /></svg>
              </div>
              <h1>Fitur</h1>
              <p className="mob-soft-hero__sub">Semua yang kamu butuh setelah sesi berakhir.</p>
          </div>
        </div>

        <div className="mob-fitur-body">
          {/* Feature 1: Rekap */}
          <div className="mob-fitur-showcase">
            <div className="mob-fitur-showcase__head">
              <div className="mob-fitur-showcase__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" /></svg>
              </div>
              <h2>Rekap Bulanan</h2>
              <p>Total sesi, jam, dan pendapatan per bulan. Filter per murid dengan satu tap.</p>
            </div>
            <div className="mob-fitur-mockup">
              <div className="mfm-stats">
                <div className="mfm-stat"><span className="mfm-v">32</span><span className="mfm-l">Sesi</span></div>
                <div className="mfm-stat"><span className="mfm-v">48,5</span><span className="mfm-l">Jam</span></div>
                <div className="mfm-stat"><span className="mfm-v">5.9jt</span><span className="mfm-l">Pendapatan</span></div>
              </div>
              <div className="mfm-row"><span className="mfm-dot" style={{ background: "#D5EDE4" }}></span><span className="mfm-name">Bintang W.</span><span className="mfm-amt">Rp 2.6jt</span></div>
              <div className="mfm-row"><span className="mfm-dot" style={{ background: "#E8D5F5" }}></span><span className="mfm-name">Meilani S.</span><span className="mfm-amt">Rp 1.4jt</span></div>
              <div className="mfm-row"><span className="mfm-dot" style={{ background: "#D5E0F5" }}></span><span className="mfm-name">Kirana P.</span><span className="mfm-amt">Rp 1.1jt</span></div>
            </div>
          </div>

          {/* Feature 2: Export */}
            <div className="mob-fitur-hcard">
              <div className="mob-fitur-hcard__icon" style={{ background: "oklch(.92 .03 280)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5" /></svg>
              </div>
              <div className="mob-fitur-hcard__text">
                <h3>Export PDF & CSV</h3>
                <p>Sesi bulan ini jadi dokumen rapi. Arsip pribadi atau lampiran pajak.</p>
                <div className="mob-fitur-tags">
                  <span>PDF</span><span>CSV</span><span>Free: 1×/bln</span>
                </div>
              </div>
            </div>

            {/* Feature 3: Invoice */}
            <div className="mob-fitur-showcase" style={{ background: "var(--tw-surface)" }}>
              <div className="mob-fitur-showcase__head">
                <div className="mob-fitur-showcase__icon" style={{ background: "oklch(.92 .04 160)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg>
                </div>
                <h2>Invoice Builder</h2>
                <p>3 template profesional. Kustomisasi warna brand, isi rekening sekali, pakai terus.</p>
              </div>
              <div className="mob-fitur-templates">
                <div className="mft-card">
                  <div className="mft-top" style={{ background: "#006C53" }}></div>
                  <div className="mft-body"><div className="mft-line"></div><div className="mft-line short"></div></div>
                  <span>Klasik</span>
                </div>
                <div className="mft-card active">
                  <div className="mft-top" style={{ background: "#1a1a1a" }}></div>
                  <div className="mft-body"><div className="mft-line"></div><div className="mft-line short"></div></div>
                  <span>Modern</span>
                </div>
                <div className="mft-card">
                  <div className="mft-top" style={{ background: "#E8E0D4" }}></div>
                  <div className="mft-body"><div className="mft-line"></div><div className="mft-line short"></div></div>
                  <span>Minimal</span>
                </div>
              </div>
            </div>

            {/* Feature 4: Sync */}
            <div className="mob-fitur-hcard">
              <div className="mob-fitur-hcard__icon" style={{ background: "oklch(.92 .04 90)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" /></svg>
              </div>
              <div className="mob-fitur-hcard__text">
                <h3>Sinkronisasi</h3>
                <p>Data sesi otomatis dari app mobile. Login sekali via Magic Link — selesai.</p>
                <div className="mob-fitur-tags">
                  <span>Magic Link</span><span>Real-time</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mob-fitur-cta">
              <h3>Siap mencoba?</h3>
              <p>Mulai gratis, upgrade kapan saja.</p>
              <Link className="btn btn-primary btn-lg" href="/login" style={{ width: "100%", height: 48, fontSize: 14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                <span>Masuk dengan Magic Link</span>
              </Link>
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
        {/* HERO BAND with DARK NAV (mirror landing page) */}
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" /></svg>
                </div>
                <div>
                  <h1 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, letterSpacing: "-.5px", margin: 0, color: "#F5EFE4" }}>Fitur</h1>
                  <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "rgba(140,246,210,.55)", margin: "4px 0 0" }}>Semua yang kamu butuh setelah sesi berakhir.</p>
                </div>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 64px", fontFamily: "var(--f-body)", fontSize: 15, lineHeight: 1.7, color: "var(--tw-text-2)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
              {[
                {
                  icon: <path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" />,
                  title: "Rekap Bulanan",
                  desc: "Lihat total sesi, jam mengajar, dan pendapatan per bulan dalam satu dashboard. Filter per murid untuk detail lebih dalam.",
                  details: [
                    "Stat cards: total sesi, total jam, total pendapatan",
                    "Tabel sesi lengkap dengan tanggal, murid, materi, durasi",
                    "Filter per murid via tab segmented control",
                    "Custom date range untuk rentang tanggal spesifik",
                    "Month picker navigasi cepat antar bulan",
                  ]
                },
                {
                  icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5" />,
                  title: "Export PDF & CSV",
                  desc: "Ubah data sesi jadi dokumen rapi — arsip pribadi, lampiran pajak, atau laporan untuk orang tua murid.",
                  details: [
                    "Export rekap bulanan ke PDF dengan format rapi",
                    "Export ke CSV untuk olah data di spreadsheet",
                    "Quota badge untuk user Free plan (1 export/bulan)",
                    "Unlimited export untuk TutorLog Plus",
                  ]
                },
                {
                  icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" />,
                  title: "Invoice Builder",
                  desc: "Buat invoice profesional untuk menagih orang tua murid. Pilih template, kustomisasi warna, isi rekening, langsung export.",
                  details: [
                    "3 template siap pakai: Klasik, Modern, Minimal",
                    "6 preset warna aksen yang bisa dipilih",
                    "Live preview A4 di sebelah kanan form",
                    "Isi data rekening sekali, pakai terus",
                    'Watermark "Generated by TutorLog" otomatis',
                  ]
                },
                {
                  icon: <path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" />,
                  title: "Sinkronisasi App ↔ Web",
                  desc: "Semua data sesi yang dicatat di app mobile otomatis tersinkron ke companion web. Login sekali via Magic Link, data langsung tersedia.",
                  details: [
                    "Login tanpa password — cukup Magic Link via email",
                    "Data sesi real-time dari app mobile TutorLog",
                    "Satu akun, dua platform (mobile + web)",
                    "Tidak perlu input ulang data secara manual",
                  ]
                },
              ].map((f, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "flex-start" }}>
                  <div>
                    <div style={{
                      width: 56, height: 56, borderRadius: "var(--r-lg)",
                      background: "var(--tw-secondary-soft)", color: "var(--tw-primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 16,
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>{f.icon}</svg>
                    </div>
                    <h3 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 24, margin: "0 0 12px", color: "var(--tw-text)" }}>{f.title}</h3>
                    <p style={{ margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
                  </div>
                  <div className="card" style={{ padding: "24px 28px", position: "relative", overflow: "hidden" }}>
                    <div style={{
                      position: "absolute", left: 0, top: 16, bottom: 16, width: 3,
                      background: "var(--tw-primary)", borderRadius: "0 3px 3px 0", opacity: 0.25,
                    }} />
                    <div style={{
                      fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 11,
                      color: "var(--tw-primary)", letterSpacing: "1px",
                      textTransform: "uppercase", marginBottom: 18,
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <span>Detail</span>
                      <div style={{ flex: 1, height: 1, background: "var(--tw-border)", opacity: 0.5 }} />
                    </div>
                    <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                      {f.details.map((d, j) => (
                        <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, lineHeight: 1.5 }}>
                          <span style={{
                            width: 20, height: 20, borderRadius: "var(--r-full)",
                            background: "var(--tw-secondary-soft)", color: "var(--tw-primary)",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            flex: "0 0 20px", marginTop: 2,
                          }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ marginTop: 56, textAlign: "center" }}>
              <div className="card" style={{ padding: "32px", background: "var(--tw-secondary-soft)", border: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 480 }}>
                <h3 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: 0 }}>Siap mencoba?</h3>
                <p style={{ margin: 0, fontSize: 14, color: "var(--tw-text-2)" }}>Mulai gratis, upgrade kapan saja kamu butuh export tanpa batas.</p>
                <Link className="btn btn-primary btn-lg" href="/login">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                  <span>Masuk dengan Magic Link</span>
                </Link>
              </div>
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
