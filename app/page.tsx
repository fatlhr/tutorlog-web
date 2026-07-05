import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* MOBILE */}
      <div className="vp-mobile">
        <div className="mob-page tw">
          {/* HERO */}
          <div className="mob-hero">
            <nav className="mob-nav mob-nav-dark">
              <Link className="brand" href="/">
                <span className="mk"><Image src="/tutorlog-logo.png" alt="" width={32} height={32} /></span>
                <span className="wm">TutorLog</span>
              </Link>
              <button className="hamburger" aria-label="Buka menu" aria-expanded="false">
                <span></span><span></span><span></span>
              </button>
            </nav>

            <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
              <div className="login-particle pulse glow" style={{ left: "8%", top: "10%", width: 5, height: 5, ["--pd" as string]: "5s", ["--po" as string]: 0.35, ["--pt" as string]: "0s" }}></div>
              <div className="login-particle pulse" style={{ left: "78%", top: "8%", width: 4, height: 4, ["--pd" as string]: "4s", ["--po" as string]: 0.2, ["--pt" as string]: "0.6s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "92%", top: "28%", width: 6, height: 6, ["--pd" as string]: "6s", ["--po" as string]: 0.4, ["--pt" as string]: "1.2s" }}></div>
              <div className="login-particle pulse" style={{ left: "15%", top: "52%", width: 4, height: 4, ["--pd" as string]: "4.5s", ["--po" as string]: 0.25, ["--pt" as string]: "1.8s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "62%", top: "62%", width: 7, height: 7, ["--pd" as string]: "5s", ["--po" as string]: 0.35, ["--pt" as string]: "0.4s" }}></div>
              <div className="login-particle pulse" style={{ left: "38%", top: "82%", width: 4, height: 4, ["--pd" as string]: "5.5s", ["--po" as string]: 0.2, ["--pt" as string]: "2.2s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "88%", top: "72%", width: 5, height: 5, ["--pd" as string]: "4s", ["--po" as string]: 0.3, ["--pt" as string]: "1s" }}></div>
            </div>

            <div className="hero-content">
              <span className="kicker-dark"><span className="dot"></span>Companion Web</span>
              <h1>Rekap sesi les.<br />Invoice <span className="em">rapi</span>.</h1>
              <p className="hero-desc">TutorLog di ponsel mencatat — companion web merangkum dan menagih.</p>
              <div className="cta-col">
                <Link className="btn-hero primary" href="/login">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                  <span>Masuk dengan Magic Link</span>
                </Link>
                <Link className="btn-hero ghost" href="/panduan">
                  <span>Lihat demo</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M5 12h14 M13 6l6 6-6 6" /></svg>
                </Link>
              </div>
              <div className="trust-row">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Gratis untuk mulai</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Tanpa kartu kredit</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Sinkron dengan app</span>
              </div>
            </div>

            <div className="stat-float" style={{ top: "58%", right: 20, animation: "fadeSlideUp 0.7s ease-out 0.5s both" }}>
              <div className="sf-lbl">Bulan ini</div>
              <div className="sf-val">32 sesi</div>
            </div>

            <div className="mob-glass-wrap">
              <div className="mob-orb"></div>
              <svg className="mob-rings" width="320" height="320" viewBox="0 0 320 320">
                <circle cx="160" cy="160" r="100" />
                <circle cx="160" cy="160" r="140" />
              </svg>
              <div className="mob-glass-card login-glass-card">
                <div className="gc-hdr"><span className="gc-title">INV-2026/06-014</span><span className="gc-date">Juni 2026</span></div>
                <div className="gc-rows">
                  <div className="gc-r">
                    <span><div className="nm">Bintang Wijaya</div><div className="meta">Matematika · 4 sesi</div></span>
                    <span className="amt">Rp 720rb</span>
                  </div>
                  <div className="gc-r">
                    <span><div className="nm">Kirana Putri</div><div className="meta">B. Inggris · 3 sesi</div></span>
                    <span className="amt">Rp 360rb</span>
                  </div>
                </div>
                <div className="gc-total"><span className="lbl">Total</span><span className="val" style={{ fontSize: 18 }}>Rp 1.08jt</span></div>
              </div>
            </div>

            <div className="mob-fi" style={{ bottom: 60, left: 16, animation: "fadeScale 0.5s ease-out 0.7s both" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" /></svg>
            </div>
            <div className="mob-fi lav" style={{ bottom: 110, right: 20, animation: "fadeScale 0.5s ease-out 0.8s both" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5" /></svg>
            </div>
          </div>

          {/* FEATURES */}
          <div className="mob-features">
            <h2>Semua yang kamu butuh.</h2>
            <p className="sub">App mobile mencatat. Web merangkum dan menagih.</p>
            <div className="mob-feature-grid">
              <div className="mob-feature-card">
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" /></svg></div>
                <div>
                  <h3>Rekap Bulanan</h3>
                  <p>Filter per bulan, per murid. Total sesi, jam, dan pendapatan.</p>
                </div>
              </div>
              <div className="mob-feature-card">
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5" /></svg></div>
                <div>
                  <h3>Export PDF &amp; CSV</h3>
                  <p>Sesi bulan ini jadi dokumen rapi — arsip atau lampiran pajak.</p>
                </div>
              </div>
              <div className="mob-feature-card">
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg></div>
                <div>
                  <h3>Invoice Builder</h3>
                  <p>3 template siap pakai. Kustom warna, isi rekening, export PDF.</p>
                </div>
              </div>
              <div className="mob-feature-card">
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" /></svg></div>
                <div>
                  <h3>Sinkron dengan App</h3>
                  <p>Data sesi otomatis dari TutorLog di ponsel.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mob-footer">
            <Link className="top" href="/">
              <span style={{ width: 24, height: 24, borderRadius: "var(--r-sm)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src="/tutorlog-logo.png" alt="" width={24} height={24} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </span>
              <span className="brand-sm">TutorLog</span>
            </Link>
            <div className="links">
              <Link href="/fitur">Fitur</Link><Link href="/harga">Harga</Link><Link href="/panduan">Panduan</Link>
              <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/kontak">Kontak</Link>
            </div>
            <div className="copy">© 2026 · Buat tutor Indonesia dengan ♥</div>
          </div>
        </div>

        {/* MENU OVERLAY */}
        <div className="mob-menu" id="mobMenu" hidden>
          <nav className="mob-nav mob-nav-dark">
            <Link className="brand" href="/">
              <span className="mk"><Image src="/tutorlog-logo.png" alt="" width={32} height={32} /></span>
              <span className="wm">TutorLog</span>
            </Link>
            <button className="hamburger" aria-label="Tutup menu" aria-expanded="true">
              <span></span><span></span><span></span>
            </button>
          </nav>
          <div className="menu-links">
            <Link href="/fitur">Fitur</Link>
            <Link href="/harga">Harga</Link>
            <Link href="/panduan">Panduan</Link>
            <Link href="/kontak">Kontak</Link>
          </div>
          <div className="menu-cta">
            <Link className="btn-hero primary" href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 52, borderRadius: "var(--r-full)", background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)", fontFamily: "var(--f-body)", fontWeight: 700, fontSize: 15 }}>
              <span>Masuk dengan Magic Link</span>
            </Link>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="vp-desktop">
        <div className="web-page tw" style={{ background: "#0d1f18" }}>
          {/* HERO */}
          <section className="hero-v2">
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
              <Link className="btn btn-primary btn-sm" href="/login" style={{ background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)" }}>Masuk</Link>
            </nav>

            <div className="hero-particles">
              <div className="login-particle pulse" style={{ left: "5%", top: "12%", width: 5, height: 5, ["--pd" as string]: "4s", ["--po" as string]: 0.3, ["--pt" as string]: "0s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "18%", top: "6%", width: 7, height: 7, ["--pd" as string]: "5s", ["--po" as string]: 0.5, ["--pt" as string]: "0.6s" }}></div>
              <div className="login-particle pulse" style={{ left: "35%", top: "15%", width: 4, height: 4, ["--pd" as string]: "4.5s", ["--po" as string]: 0.25, ["--pt" as string]: "1s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "52%", top: "8%", width: 6, height: 6, ["--pd" as string]: "6s", ["--po" as string]: 0.45, ["--pt" as string]: "0.3s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "68%", top: "20%", width: 8, height: 8, ["--pd" as string]: "5s", ["--po" as string]: 0.4, ["--pt" as string]: "1.5s" }}></div>
              <div className="login-particle pulse" style={{ left: "82%", top: "10%", width: 5, height: 5, ["--pd" as string]: "4s", ["--po" as string]: 0.3, ["--pt" as string]: "2s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "90%", top: "25%", width: 6, height: 6, ["--pd" as string]: "5.5s", ["--po" as string]: 0.45, ["--pt" as string]: "0.8s" }}></div>
              <div className="login-particle pulse" style={{ left: "8%", top: "55%", width: 4, height: 4, ["--pd" as string]: "5s", ["--po" as string]: 0.2, ["--pt" as string]: "1.2s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "25%", top: "75%", width: 6, height: 6, ["--pd" as string]: "6s", ["--po" as string]: 0.4, ["--pt" as string]: "0s" }}></div>
              <div className="login-particle pulse" style={{ left: "48%", top: "85%", width: 5, height: 5, ["--pd" as string]: "4s", ["--po" as string]: 0.35, ["--pt" as string]: "1.8s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "72%", top: "70%", width: 7, height: 7, ["--pd" as string]: "6s", ["--po" as string]: 0.45, ["--pt" as string]: "0.5s" }}></div>
              <div className="login-particle pulse" style={{ left: "88%", top: "80%", width: 4, height: 4, ["--pd" as string]: "5s", ["--po" as string]: 0.25, ["--pt" as string]: "2.2s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "95%", top: "60%", width: 5, height: 5, ["--pd" as string]: "4.5s", ["--po" as string]: 0.4, ["--pt" as string]: "1s" }}></div>
              <div className="login-particle pulse" style={{ left: "15%", top: "40%", width: 3, height: 3, ["--pd" as string]: "4s", ["--po" as string]: 0.2, ["--pt" as string]: "1.6s" }}></div>
              <div className="login-particle pulse" style={{ left: "60%", top: "50%", width: 4, height: 4, ["--pd" as string]: "5.5s", ["--po" as string]: 0.25, ["--pt" as string]: "2s" }}></div>
              <div className="login-particle pulse glow" style={{ left: "78%", top: "45%", width: 5, height: 5, ["--pd" as string]: "5s", ["--po" as string]: 0.35, ["--pt" as string]: "0.4s" }}></div>
              <svg className="hero-connections" preserveAspectRatio="none">
                <line x1="5%" y1="12%" x2="18%" y2="6%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
                <line x1="18%" y1="6%" x2="35%" y2="15%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
                <line x1="35%" y1="15%" x2="52%" y2="8%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
                <line x1="52%" y1="8%" x2="68%" y2="20%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
                <line x1="68%" y1="20%" x2="82%" y2="10%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
                <line x1="82%" y1="10%" x2="90%" y2="25%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
                <line x1="8%" y1="55%" x2="25%" y2="75%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
                <line x1="25%" y1="75%" x2="48%" y2="85%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
                <line x1="72%" y1="70%" x2="88%" y2="80%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
                <line x1="60%" y1="50%" x2="78%" y2="45%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
                <line x1="78%" y1="45%" x2="95%" y2="60%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
                <line x1="15%" y1="40%" x2="8%" y2="55%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
              </svg>
            </div>

            <div className="hero-text">
              <span className="kicker-dark anim-up">
                <span className="dot"></span>
                Companion Web · Untuk Tutor
              </span>
              <h1 className="anim-up-d1">Rekap sesi les.<br />Invoice <span className="em">rapi</span> tiap bulan.</h1>
              <p className="hero-desc anim-up-d2">
                TutorLog di ponsel mencatat — companion web ini merangkum, menagih, dan mengarsipkan. Satu flow, dari sesi ke tagihan.
              </p>
              <div className="cta-row anim-up-d3">
                <Link className="btn-hero primary" href="/login">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                  <span>Masuk dengan Magic Link</span>
                </Link>
                <Link className="btn-hero ghost" href="/panduan">
                  <span>Lihat demo</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M5 12h14 M13 6l6 6-6 6" /></svg>
                </Link>
              </div>
              <div className="trust-row anim-up-d4">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Gratis untuk mulai</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Tanpa kartu kredit</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Sinkron dengan app</span>
              </div>
            </div>

            <div className="hero-visual-wrap">
              <div className="hero-orb"></div>
              <svg className="hero-rings" width="440" height="440" viewBox="0 0 440 440">
                <circle cx="220" cy="220" r="80" />
                <circle cx="220" cy="220" r="135" />
                <circle cx="220" cy="220" r="195" />
              </svg>
              <div className="hero-glass-card login-glass-card anim-scale">
                <div className="gc-hdr">
                  <span className="gc-title">INV-2026/06-014</span>
                  <span className="gc-date">Juni 2026</span>
                </div>
                <div className="gc-rows">
                  <div className="gc-r">
                    <span><div className="nm">Bintang Wijaya</div><div className="meta">Matematika · 4 sesi</div></span>
                    <span className="amt">Rp 720rb</span>
                  </div>
                  <div className="gc-r">
                    <span><div className="nm">Bintang Wijaya</div><div className="meta">Fisika · 4 sesi</div></span>
                    <span className="amt">Rp 1.04jt</span>
                  </div>
                  <div className="gc-r">
                    <span><div className="nm">Kirana Putri</div><div className="meta">B. Inggris · 3 sesi</div></span>
                    <span className="amt">Rp 360rb</span>
                  </div>
                  <div className="gc-r">
                    <span><div className="nm">Meilani Sari</div><div className="meta">Matematika · 5 sesi</div></span>
                    <span className="amt">Rp 600rb</span>
                  </div>
                </div>
                <div className="gc-total">
                  <span className="lbl">Total</span>
                  <span className="val">Rp 2.72jt</span>
                </div>
              </div>
              <div className="hero-stat-node anim-fade-d1" style={{ position: "absolute", top: "14%", right: "-10%", animation: "floatA 6s ease-in-out infinite 0.5s" }}>
                <div className="sn-label">Bulan ini</div>
                <div className="sn-val">32 sesi</div>
              </div>
              <div className="hero-stat-node anim-fade-d2" style={{ position: "absolute", bottom: "12%", left: "-6%", animation: "floatB 7s ease-in-out infinite 1s" }}>
                <div className="sn-label">4 murid</div>
                <div className="sn-val">Rp 5.9jt</div>
              </div>
              <div className="login-fi-dark df1" style={{ position: "absolute", top: "6%", left: "-12%" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              </div>
              <div className="login-fi-dark lav df3" style={{ position: "absolute", bottom: "6%", right: "-16%" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section className="features-v2">
            <div className="features-head" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
              <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 34, letterSpacing: "-0.5px", margin: 0, maxWidth: 640 }}>
                Semua yang kamu butuh setelah sesi berakhir.
              </h2>
              <div style={{ fontFamily: "var(--f-body)", fontSize: 15, color: "var(--tw-text-3)", maxWidth: 320 }}>
                App mobile mencatat. Web ini merangkum, menagih, dan mengarsipkan — jadi kamu tinggal ngajar.
              </div>
            </div>
            <div className="feature-grid">
              <div className="feature-card anim-card-0">
                <div className="ic" style={{ color: "var(--tw-primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" /></svg></div>
                <h3>Rekap Bulanan</h3>
                <p>Filter per bulan, per murid. Total sesi, jam, dan pendapatan langsung terlihat.</p>
              </div>
              <div className="feature-card anim-card-1">
                <div className="ic" style={{ color: "var(--tw-primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5" /></svg></div>
                <h3>Export PDF &amp; CSV</h3>
                <p>Sesi bulan ini jadi dokumen rapi — arsip pribadi atau lampiran pajak.</p>
              </div>
              <div className="feature-card anim-card-2">
                <div className="ic" style={{ color: "var(--tw-primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg></div>
                <h3>Invoice Builder</h3>
                <p>3 template siap pakai. Pilih warna, isi rekening, ekspor PDF, kirim ke orangtua.</p>
              </div>
              <div className="feature-card anim-card-3">
                <div className="ic" style={{ color: "var(--tw-primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" /></svg></div>
                <h3>Sinkron dengan App</h3>
                <p>Data sesi otomatis dari TutorLog di ponsel. Login sekali via Magic Link.</p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <div className="landing-footer">
            <div className="l">
              <span className="mk" style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", background: "var(--tw-surface-soft)", border: "1px solid var(--tw-border)" }}>
                <Image src="/tutorlog-logo.png" alt="" width={32} height={32} />
              </span>
              <span className="brand-sm">TutorLog</span>
              <span>© 2026 · Buat tutor Indonesia dengan ♥</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <div className="r">
                <Link href="/fitur">Fitur</Link>
                <Link href="/harga">Harga</Link>
                <Link href="/panduan">Panduan</Link>
                <a href="#">Blog</a>
              </div>
              <div style={{ width: 1, height: 20, background: "var(--tw-border)" }}></div>
              <div className="r">
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/account">Account Deletion</Link>
                <Link href="/kontak">Kontak</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
