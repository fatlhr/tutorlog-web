import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MenuToggle from "@/components/MenuToggle";

export const metadata: Metadata = {
  title: "TutorLog — Panduan",
  description: "Dari download aplikasi sampai invoice pertama — panduan singkat pakai TutorLog.",
};

const steps = [
  { n: "1", t: "Download di Play Store", d: "Download, install, daftar pake email.", phase: "App" },
  { n: "2", t: "Tambah murid", d: "Masukin nama murid, kelas, sama tarif per jam.", phase: "App" },
  { n: "3", t: "Mulai sesi les", d: "Pilih murid, tap \"Mulai Sesi\", timer langsung jalan.", phase: "App" },
  { n: "4", t: "Login ke Web", d: "Buka website, masuk pake Magic Link — emailnya sama.", phase: "Web" },
  { n: "5", t: "Lihat rekap", d: "Semua sesi langsung kebaca. Tinggal filter dan export.", phase: "Web" },
  { n: "6", t: "Buat invoice", d: "Pilih murid, pilih template, atur warna, export PDF.", phase: "Web" },
];

const dSteps = [
  { n: "1", t: "Download TutorLog di Play Store", d: "Download aplikasi TutorLog dari Play Store, install, terus daftar pake email." },
  { n: "2", t: "Tambah murid", d: "Buka app, tekan \"Tambah Murid\", isi nama, kelas, tarif per jam, sama tipe tagihan." },
  { n: "3", t: "Mulai sesi les", d: "Dari halaman utama, pilih murid terus tap \"Mulai Sesi\". Timer otomatis jalan. Kalau udah selesai, tinggal tap \"Selesaikan Sesi\"." },
  { n: "4", t: "Login ke TutorLog Web", d: "Buka website TutorLog, klik \"Masuk dengan Magic Link\", masukin email yang sama. Cek inbox kamu untuk link masuknya." },
  { n: "5", t: "Lihat rekap & export", d: "Semua sesi yang kamu catat langsung muncul di halaman Rekap. Filter per bulan atau per murid, lalu export PDF atau CSV." },
  { n: "6", t: "Buat invoice", d: "Buka Invoice Builder, pilih murid sama template, atur warna sesuai selera, isi nomor rekening, export PDF, kirim ke orang tua." },
];

const dTips = [
  { t: "Catat rutin", d: "Biasakan catat sesi begitu selesai ngajar. Jangan nunggu numpuk, makin lama makin males ngurusnya." },
  { t: "Template favorit", d: "Coba dulu ketiga template yang ada, pilih yang paling cocok, pake terus biar kelihatan rapi." },
  { t: "Export rutin", d: "Export rekap tiap awal bulan. Jadi arsip digital yang rapi — gak perlu lagi nyimpen catatan kertas." },
  { t: "Upgrade kalau butuh", d: "Free plan udah cukup buat mulai. Upgrade ke Plus aja kalau butuh export lebih dari satu kali sebulan." },
];

function SvgSpark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4" />
      <path d="M12 14a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4" />
    </svg>
  );
}

function SvgDownload({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SvgUsers({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SvgTime({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SvgMail({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SvgBarChart({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SvgInvoice({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function SvgExt({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function PanduanPage() {
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
                <SvgInvoice size={22} />
              </div>
              <h1>Panduan</h1>
              <p className="mob-soft-hero__sub">Dari download aplikasi sampai invoice pertama.</p>
            </div>
          </div>

          <div className="mob-panduan-body">
            {/* INTRO */}
            <div className="mob-panduan-intro" style={{ marginBottom: 32 }}>
              <div className="mob-panduan-intro__icon"><SvgSpark size={16} /></div>
              <div>
                <strong>TutorLog</strong> punya dua aplikasi: satu di HP buat catat sesi les, satu di website ini buat lihat rekap dan bikin invoice. Dua-duanya pake email yang sama.
              </div>
            </div>

            {/* TIMELINE */}
            <div className="mob-timeline" style={{ marginBottom: 36 }}>
              {steps.map((s, i) => {
                const showPhase = i === 0 || steps[i - 1].phase !== s.phase;
                const icons = [SvgDownload, SvgUsers, SvgTime, SvgMail, SvgBarChart, SvgInvoice];
                const Icon = icons[i];
                return (
                  <div key={i}>
                    {showPhase && (
                      <div className="mob-timeline-phase">
                        <div className="mob-tp-dot"></div>
                        <span className="mob-tp-label">{s.phase === "App" ? "App Mobile" : "Companion Web"}</span>
                      </div>
                    )}
                    <div className="mob-timeline-step">
                      <div className="mob-ts-rail">
                        <div className="mob-ts-num">{s.n}</div>
                        {i < steps.length - 1 && <div className="mob-ts-line"></div>}
                      </div>
                      <div className="mob-ts-card">
                        <div className="mob-ts-icon"><Icon size={16} /></div>
                        <h3>{s.t}</h3>
                        <p>{s.d}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mob-fitur-cta">
              <h3>Butuh bantuan?</h3>
              <p>Ada yang bingung? Email aja, kami bantu.</p>
              <Link className="btn btn-primary btn-sm" href="/kontak"
                style={{ width: "100%", background: "var(--tw-primary)", color: "#fff" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Hubungi Kami
                  <SvgMail size={14} />
                </span>
              </Link>
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
                <SvgInvoice size={24} />
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, letterSpacing: "-.5px", margin: 0, color: "#F5EFE4" }}>Panduan</h1>
                <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "rgba(140,246,210,.55)", margin: "4px 0 0" }}>Dari download aplikasi sampai invoice pertama, gak sampe 10 menit.</p>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 64px", fontFamily: "var(--f-body)", fontSize: 15, lineHeight: 1.7, color: "var(--tw-text-2)" }}>
          {/* SEBELUM MULAI */}
          <div style={{ marginBottom: 64 }}>
            <div className="card" style={{ padding: "24px 28px", background: "var(--tw-secondary-soft)", border: "none" }}>
              <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 20, margin: "0 0 12px", color: "var(--tw-text)" }}>Sebelum mulai</h2>
              <p style={{ margin: 0 }}>TutorLog punya dua bagian: aplikasi Android di Play Store buat catat sesi les, sama website ini buat rekap dan invoice. Cukup pake satu email, dua-duanya nyambung.</p>
            </div>
          </div>

          {/* LANGKAH */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Langkah-langkah</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {dSteps.map((s, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 20, alignItems: "flex-start" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "var(--r-lg)",
                  background: i < 3 ? "var(--tw-secondary-soft)" : "linear-gradient(135deg, rgba(140,246,210,.12), rgba(140,246,210,.04))",
                  border: i >= 3 ? "1px solid rgba(0,108,83,.12)" : "none",
                  color: "var(--tw-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22,
                }}>{s.n}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ color: "var(--tw-primary)" }}>
                      {i === 0 && <SvgDownload size={20} />}
                      {i === 1 && <SvgUsers size={20} />}
                      {i === 2 && <SvgTime size={20} />}
                      {i === 3 && <SvgMail size={20} />}
                      {i === 4 && <SvgBarChart size={20} />}
                      {i === 5 && <SvgInvoice size={20} />}
                    </span>
                    <h3 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 18, margin: 0, color: "var(--tw-text)" }}>{s.t}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* TIPS */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Tips</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {dTips.map((t, i) => (
              <div key={i} className="card" style={{ padding: "20px 24px" }}>
                <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 16, color: "var(--tw-text)", marginBottom: 6 }}>{t.t}</div>
                <p style={{ margin: 0, fontSize: 14 }}>{t.d}</p>
              </div>
            ))}
          </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center" }}>
            <div className="card" style={{ padding: "32px", background: "var(--tw-secondary-soft)", border: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 480 }}>
              <h3 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: 0 }}>Butuh bantuan?</h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--tw-text-2)" }}>Ada yang bingung? Email aja, kami bantu.</p>
              <Link className="btn btn-primary btn-lg" href="/kontak"
                style={{ background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Hubungi Kami
                  <SvgMail size={16} />
                </span>
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
              <a href="#">Blog</a>
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
    </>
  );
}
