import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import MenuToggle from "@/components/MenuToggle";
import Modal from "@/components/Modal";

export default function Home() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <ScrollReveal />
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
              <MenuToggle />
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
              <span className="kicker-dark"><span className="dot"></span>Untuk Guru Les Privat</span>
              <h1>Fokus mengajar.<br />Administrasi biar<br />TutorLog <span className="em">yang urus</span>.</h1>
              <p className="hero-desc">Catat sesi, rekap pendapatan, buat invoice — semua otomatis dari ponselmu. Coba gratis. Nanti bisa upgrade kalau butuh fitur lengkap.</p>
              <div className="cta-col">
                <a className="btn-hero primary" href="https://play.google.com/store/apps/details?id=com.tutorlog.app" target="_blank" rel="noopener">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}><path d="M3.609 1.814a.75.75 0 0 1 .396.112l16.5 9.75a.75.75 0 0 1 0 1.256l-16.5 9.75A.75.75 0 0 1 3 22.25V1.75a.75.75 0 0 1 .609-.936z"/></svg>
                  <span>Mulai Gratis</span>
                </a>
                <button className="btn-hero ghost" type="button" onClick={() => setShowVideo(true)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}><path d="M8 5v14l11-7z"/></svg>
                  <span>Lihat Demo</span>
                </button>
              </div>
              <div className="trust-row">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Gratis mulai</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Fitur lengkap</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Upgrade kapan saja</span>
              </div>
            </div>
          </div>

          {/* PROBLEM */}
          <div className="mob-section" data-reveal>
            <div className="mob-section-label">Masalahnya</div>
            <h2 className="mob-section-title">Kamu mengajar berjam-jam.<br /><span className="em">Administrasinya</span> yang bikin capek.</h2>
            <div className="mob-problem-grid">
              <div className="mob-problem-card" data-reveal>
                <div className="mob-problem-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                </div>
                <h3>Catatan berserakan</h3>
                <p>Murid di buku tulis, jadwal di kepala, tagihan sering kelewat. Pas dibutuhin, susah dicari.</p>
              </div>
              <div className="mob-problem-card" data-reveal>
                <div className="mob-problem-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <h3>Waktu habis untuk admin</h3>
                <p>Jam yang harusnya buat mengajar malah habis ngurus catatan, nagih bayaran, bikin invoice.</p>
              </div>
              <div className="mob-problem-card" data-reveal>
                <div className="mob-problem-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <h3>Reputasi nggak kelihatan</h3>
                <p>Bertahun-tahun ngajar, tapi calon murid baru cuma lihat &quot;salah satu guru les&quot; biasa.</p>
              </div>
            </div>
          </div>

          {/* FEATURES */}
          <div className="mob-section" data-reveal>
            <div className="mob-section-label">Solusinya</div>
            <h2 className="mob-section-title">Satu aplikasi untuk <span className="em">seluruh</span> kegiatan mengajarmu.</h2>
            <div className="mob-feature-grid">
              <div className="mob-feature-card" data-reveal>
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" /></svg></div>
                <div>
                  <h3>Rekap Otomatis</h3>
                  <p>Total sesi, jam, dan pendapatan terhitung otomatis. Filter per bulan, per murid.</p>
                </div>
              </div>
              <div className="mob-feature-card" data-reveal>
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5" /></svg></div>
                <div>
                  <h3>Invoice Sekali Klik</h3>
                  <p>3 template profesional. Pilih warna, isi rekening, export PDF, kirim ke orangtua.</p>
                </div>
              </div>
              <div className="mob-feature-card" data-reveal>
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" /></svg></div>
                <div>
                  <h3>Sinkron dengan App</h3>
                  <p>Data sesi otomatis dari TutorLog di ponsel. Login sekali, langsung pakai.</p>
                </div>
              </div>
              <div className="mob-feature-card" data-reveal>
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg></div>
                <div>
                  <h3>Export CSV &amp; PDF</h3>
                  <p>Arsip pribadi atau lampiran pajak. Data rapi, siap download kapan saja.</p>
                </div>
              </div>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="mob-section" data-reveal>
            <div className="mob-section-label">Cara Kerja</div>
            <h2 className="mob-section-title">Mulai dalam <span className="em">tiga langkah</span> simpel.</h2>
            <div className="mob-steps">
              <div className="mob-step" data-reveal>
                <div className="mob-step-num">1</div>
                <div>
                  <h3>Download &amp; daftar</h3>
                  <p>Buat akun dalam semenit. Langsung dapat masa coba gratis.</p>
                </div>
              </div>
              <div className="mob-step" data-reveal>
                <div className="mob-step-num">2</div>
                <div>
                  <h3>Catat tiap selesai les</h3>
                  <p>Selesai ngajar, tinggal tap. Kehadiran, durasi, dan materi langsung tercatat.</p>
                </div>
              </div>
              <div className="mob-step" data-reveal>
                <div className="mob-step-num">3</div>
                <div>
                  <h3>Rekap &amp; invoice otomatis</h3>
                  <p>Total sesi, pendapatan, dan invoice terhitung sendiri. Tinggal download.</p>
                </div>
              </div>
            </div>
          </div>

          {/* TESTIMONIAL */}
          <div className="mob-section" data-reveal>
            <div className="mob-section-label">Kata Guru</div>
            <div className="mob-testimonial">
              <div className="mob-testimonial-quote">&quot;Data murid, jadwal, catatan, sampai pembayaran — semua yang saya kerjakan manual selama ini akhirnya jadi satu.&quot;</div>
              <div className="mob-testimonial-author">
                <div className="mob-testimonial-avatar">B</div>
                <div>
                  <div className="mob-testimonial-name">Bu Binar</div>
                  <div className="mob-testimonial-role">Guru Les Privat</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mob-section" data-reveal>
            <div className="mob-cta-box">
              <h2>Mulai catat <span className="em">sesi pertamamu</span> hari ini.</h2>
              <p>Gratis mulai. Nanti bisa upgrade kapan saja kalau butuh fitur lengkap.</p>
              <a className="btn-hero primary" href="https://play.google.com/store/apps/details?id=com.tutorlog.app" target="_blank" rel="noopener" style={{ width: "100%", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}><path d="M3.609 1.814a.75.75 0 0 1 .396.112l16.5 9.75a.75.75 0 0 1 0 1.256l-16.5 9.75A.75.75 0 0 1 3 22.25V1.75a.75.75 0 0 1 .609-.936z"/></svg>
                <span>Mulai Gratis</span>
              </a>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mob-footer">
            <div className="links">
              <Link href="/fitur">Fitur</Link><Link href="/harga">Harga</Link><Link href="/panduan">Panduan</Link>
              <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/kontak">Kontak</Link>
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
              <svg className="hero-connections" preserveAspectRatio="none">
                <line x1="5%" y1="12%" x2="18%" y2="6%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
                <line x1="18%" y1="6%" x2="35%" y2="15%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
                <line x1="35%" y1="15%" x2="52%" y2="8%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
                <line x1="52%" y1="8%" x2="68%" y2="20%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
                <line x1="68%" y1="20%" x2="82%" y2="10%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
                <line x1="82%" y1="10%" x2="90%" y2="25%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              </svg>
            </div>

            <div className="hero-text">
              <span className="kicker-dark anim-up">
                <span className="dot"></span>
                Untuk Guru Les Privat Indonesia
              </span>
              <h1 className="anim-up-d1">Fokus mengajar.<br />Administrasi biar<br />TutorLog <span className="em">yang urus</span>.</h1>
              <p className="hero-desc anim-up-d2">
                Catat sesi, rekap pendapatan, buat invoice — semua otomatis dari ponselmu. Coba gratis. Nanti bisa upgrade kalau butuh fitur lengkap.
              </p>
              <div className="cta-row anim-up-d3">
                <a className="btn-hero primary" href="https://play.google.com/store/apps/details?id=com.tutorlog.app" target="_blank" rel="noopener">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}><path d="M3.609 1.814a.75.75 0 0 1 .396.112l16.5 9.75a.75.75 0 0 1 0 1.256l-16.5 9.75A.75.75 0 0 1 3 22.25V1.75a.75.75 0 0 1 .609-.936z"/></svg>
                  <span>Mulai Gratis</span>
                </a>
                <button className="btn-hero ghost" type="button" onClick={() => setShowVideo(true)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}><path d="M8 5v14l11-7z"/></svg>
                  <span>Lihat Demo</span>
                </button>
              </div>
              <div className="trust-row anim-up-d4">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Gratis mulai</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Fitur lengkap</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> Upgrade kapan saja</span>
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
              <div className="hero-stat-node anim-fade-d1" style={{ position: "absolute", top: "16%", right: "2%", animation: "floatA 6s ease-in-out infinite 0.5s" }}>
                <div className="sn-label">Bulan ini</div>
                <div className="sn-val">32 sesi</div>
              </div>
              <div className="hero-stat-node anim-fade-d2" style={{ position: "absolute", bottom: "14%", left: "0%", animation: "floatB 7s ease-in-out infinite 1s" }}>
                <div className="sn-label">4 murid</div>
                <div className="sn-val">Rp 5.9jt</div>
              </div>
              <div className="login-fi-dark df1" style={{ position: "absolute", top: "10%", left: "6%" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              </div>
              <div className="login-fi-dark lav df3" style={{ position: "absolute", bottom: "8%", right: "10%" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg>
              </div>
            </div>
          </section>

          {/* PROBLEM SECTION */}
          <section className="landing-problem">
            <div className="landing-problem-inner">
              <span className="section-label">Masalahnya</span>
              <h2>Kamu mengajar berjam-jam.<br /><span className="em">Administrasinya</span> yang bikin capek.</h2>
              <div className="problem-grid">
                <div className="problem-card" data-reveal>
                  <div className="problem-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                  </div>
                  <h3>Catatan berserakan</h3>
                  <p>Murid di buku tulis, jadwal di kepala, tagihan sering kelewat. Pas dibutuhin, susah dicari.</p>
                </div>
                <div className="problem-card" data-reveal>
                  <div className="problem-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <h3>Waktu habis untuk admin</h3>
                  <p>Jam yang harusnya buat mengajar malah habis ngurus catatan, nagih bayaran, bikin invoice.</p>
                </div>
                <div className="problem-card" data-reveal>
                  <div className="problem-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  </div>
                  <h3>Reputasi nggak kelihatan</h3>
                  <p>Bertahun-tahun ngajar, tapi calon murid baru cuma lihat &quot;salah satu guru les&quot; biasa.</p>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section className="features-v2">
            <div className="features-head">
              <span className="section-label">Solusinya</span>
              <h2>Satu aplikasi untuk <span className="em">seluruh</span> kegiatan mengajarmu.</h2>
              <div className="lede">
                Dibuat khusus untuk guru les privat di Indonesia. Ringan, jelas, langsung kepakai tiap hari.
              </div>
            </div>
            <div className="feature-grid">
              <div className="feature-card anim-card-0">
                <div className="ic" style={{ color: "var(--tw-primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" /></svg></div>
                <h3>Rekap Otomatis</h3>
                <p>Total sesi, jam, dan pendapatan terhitung otomatis. Filter per bulan, per murid — langsung terlihat.</p>
              </div>
              <div className="feature-card anim-card-1">
                <div className="ic" style={{ color: "var(--tw-primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5" /></svg></div>
                <h3>Invoice Sekali Klik</h3>
                <p>3 template profesional. Pilih warna, isi rekening, export PDF, kirim ke orangtua.</p>
              </div>
              <div className="feature-card anim-card-2">
                <div className="ic" style={{ color: "var(--tw-primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" /></svg></div>
                <h3>Sinkron dengan App</h3>
                <p>Data sesi otomatis dari TutorLog di ponsel. Login sekali via Magic Link, langsung pakai.</p>
              </div>
              <div className="feature-card anim-card-3">
                <div className="ic" style={{ color: "var(--tw-primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg></div>
                <h3>Export CSV &amp; PDF</h3>
                <p>Arsip pribadi atau lampiran pajak. Data rapi, siap download kapan saja.</p>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="landing-steps">
            <div className="landing-steps-inner">
              <span className="section-label">Cara Kerja</span>
              <h2>Mulai dalam <span className="em">tiga langkah</span> simpel.</h2>
              <p className="lede">Nggak perlu pelatihan. Kalau kamu bisa chat WhatsApp, kamu bisa pakai TutorLog.</p>
              <div className="steps-grid">
                <div className="step-card" data-reveal>
                  <div className="step-num">1</div>
                  <h3>Download &amp; daftar</h3>
                  <p>Buat akun dalam semenit. Langsung dapat masa coba gratis. Tanpa kartu kredit.</p>
                </div>
                <div className="step-card" data-reveal>
                  <div className="step-num">2</div>
                  <h3>Catat tiap selesai les</h3>
                  <p>Selesai ngajar, tinggal tap. Kehadiran, durasi, materi, dan nilai langsung tercatat.</p>
                </div>
                <div className="step-card" data-reveal>
                  <div className="step-num">3</div>
                  <h3>Rekap &amp; invoice otomatis</h3>
                  <p>Total sesi, pendapatan, dan invoice terhitung sendiri. Tinggal download dan kirim.</p>
                </div>
              </div>
            </div>
          </section>

          {/* TESTIMONIAL */}
          <section className="landing-testimonial">
            <div className="landing-testimonial-inner">
              <span className="section-label">Kata Guru</span>
              <div className="testimonial-card" data-reveal>
                <div className="testimonial-quote">&quot;Profil guru, data murid, jadwal, catatan, sampai pembayaran — memang sedang saya butuhkan. Semua yang saya kerjakan manual selama ini akhirnya jadi satu.&quot;</div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">B</div>
                  <div>
                    <div className="testimonial-name">Bu Binar</div>
                    <div className="testimonial-role">Guru Les Privat</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="landing-final-cta">
            <div className="landing-final-cta-inner">
              <h2>Mulai catat <span className="em">sesi pertamamu</span> hari ini.</h2>
              <p>Gratis mulai. Nanti bisa upgrade kapan saja kalau butuh fitur lengkap.</p>
              <div className="cta-row">
                <a className="btn-hero primary" href="https://play.google.com/store/apps/details?id=com.tutorlog.app" target="_blank" rel="noopener">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}><path d="M3.609 1.814a.75.75 0 0 1 .396.112l16.5 9.75a.75.75 0 0 1 0 1.256l-16.5 9.75A.75.75 0 0 1 3 22.25V1.75a.75.75 0 0 1 .609-.936z"/></svg>
                  <span>Mulai Gratis</span>
                </a>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <div className="landing-footer">
            <div className="footer-links">
              <div className="link-group">
                <Link href="/fitur">Fitur</Link>
                <Link href="/harga">Harga</Link>
                <Link href="/panduan">Panduan</Link>
              </div>
              <div className="link-group">
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/account">Account Deletion</Link>
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
      <Modal open={showVideo} onClose={() => setShowVideo(false)} title="Demo TutorLog">
        <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(245,239,228,.4)", fontFamily: "var(--f-body)", fontSize: 15 }}>
          Video demo segera hadir
        </div>
      </Modal>
    </>
  );
}
