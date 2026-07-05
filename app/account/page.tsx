import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MenuToggle from "@/components/MenuToggle";

export const metadata: Metadata = {
  title: "TutorLog — Hapus Akun",
  description: "Panduan penghapusan akun TutorLog — data yang dihapus, cara mengajukan, dan estimasi proses.",
};

const particles = [
  { x: "8%", y: "20%", s: 5, glow: true, pd: "5s", po: ".4" },
  { x: "25%", y: "35%", s: 4, glow: false, pd: "4s", po: ".25" },
  { x: "55%", y: "15%", s: 6, glow: true, pd: "6s", po: ".45" },
  { x: "78%", y: "30%", s: 5, glow: false, pd: "4.5s", po: ".3" },
  { x: "92%", y: "20%", s: 7, glow: true, pd: "5s", po: ".4" },
  { x: "40%", y: "55%", s: 4, glow: false, pd: "5.5s", po: ".2" },
  { x: "70%", y: "60%", s: 5, glow: true, pd: "4s", po: ".35" },
  { x: "15%", y: "65%", s: 6, glow: true, pd: "6s", po: ".4" },
];

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

function SvgBolt({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M13 2 3 14h8l-1 8 10-12h-8Z" />
    </svg>
  );
}

const steps = [
  { n: "1", t: "Kirim email", d: <>Kirim email ke <a href="mailto:tutorlog.admin@gmail.com" style={{ color: "var(--tw-primary)", fontWeight: 700 }}>tutorlog.admin@gmail.com</a>.</> },
  { n: "2", t: "Gunakan subjek yang benar", d: <>Gunakan subjek: <b>Hapus akun TutorLog</b>.</> },
  { n: "3", t: "Sertakan email login", d: "Sertakan email yang dipakai untuk login TutorLog." },
  { n: "4", t: "Tulis konfirmasi", d: "Tulis konfirmasi singkat bahwa kamu ingin akun dan data TutorLog dihapus." },
];

export default function AccountPage() {
  return (
    <>
      {/* MOBILE */}
      <div className="vp-mobile">
        <div className="mob-page tw">
          <div className="mob-soft-hero">
            <nav className="mob-nav">
              <Link className="brand" href="/">
                <span className="mk"><Image src="/tutorlog-logo.png" alt="" width={32} height={32} /></span>
                <span className="wm">TutorLog</span>
              </Link>
              <MenuToggle />
            </nav>
            <div className="mob-soft-hero__content">
              <div className="mob-soft-hero__icon"><SvgUsers size={22} /></div>
              <h1>Hapus Akun</h1>
              <p className="mob-soft-hero__sub">Terakhir diperbarui: 3 Juni 2026</p>
            </div>
          </div>

          <div className="mob-legal-body">
            <div className="mob-legal-callout" style={{ borderLeftColor: "var(--tw-warning)" }}>
              <div className="mob-legal-callout__icon" style={{ background: "var(--tw-warning-soft)", color: "var(--tw-warning)" }}><SvgBolt size={16} /></div>
              <div>Penghapusan akun bersifat <strong>permanen</strong>. Semua data akan dihapus dan tidak bisa dikembalikan.</div>
            </div>

            <h2>Cara Mengajukan</h2>
            <p>Kirim email ke <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a> dengan subjek &quot;Hapus akun TutorLog&quot; dan sertakan email login kamu.</p>

            <h2>Data yang Dihapus</h2>
            <ul>
              <li>Akun autentikasi</li>
              <li>Profil tutor</li>
              <li>Data murid dan lokasi</li>
              <li>Riwayat sesi</li>
              <li>Data akses premium dan voucher</li>
            </ul>

            <h2>Estimasi Proses</h2>
            <p>Maksimal 7 hari setelah verifikasi selesai.</p>
          </div>

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
          {particles.map((p, i) => (
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
                <SvgUsers size={24} />
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, letterSpacing: "-.5px", margin: 0, color: "#F5EFE4" }}>Hapus Akun</h1>
                <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "rgba(140,246,210,.55)", margin: "4px 0 0" }}>Terakhir diperbarui: 3 Juni 2026</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 64px", fontFamily: "var(--f-body)", fontSize: 15, lineHeight: 1.7, color: "var(--tw-text-2)" }}>
          {/* CARA MENGAJUKAN */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Cara Mengajukan Penghapusan</h2>
            <p style={{ marginBottom: 16 }}>User TutorLog bisa meminta penghapusan akun dan data meskipun app sudah dihapus dari perangkat.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 14, alignItems: "flex-start" }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: "var(--r-full)",
                    background: "var(--tw-secondary-soft)", color: "var(--tw-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 15,
                  }}>{s.n}</span>
                  <div>
                    <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 16, color: "var(--tw-text)", marginBottom: 4 }}>{s.t}</div>
                    <div style={{ fontSize: 14 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DATA YANG DIHAPUS */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Data yang Akan Dihapus atau Dianonimkan</h2>
            <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
              <li style={{ marginBottom: 8 }}>Akun autentikasi TutorLog.</li>
              <li style={{ marginBottom: 8 }}>Profil tutor.</li>
              <li style={{ marginBottom: 8 }}>Data murid dan lokasi belajar.</li>
              <li style={{ marginBottom: 8 }}>Riwayat sesi dan attendance records.</li>
              <li style={{ marginBottom: 8 }}>Data akses premium, voucher, dan counter penggunaan fitur.</li>
              <li style={{ marginBottom: 8 }}>Catatan support terkait request, jika sudah tidak dibutuhkan.</li>
            </ul>
            <p style={{ margin: 0 }}>Jika ada data yang perlu disimpan untuk alasan keamanan, pencegahan penyalahgunaan, atau kewajiban hukum, TutorLog akan menyimpan data seminimal mungkin dan menghapus detail les personal jika memungkinkan.</p>
          </div>

          {/* VERIFIKASI */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Verifikasi Request</h2>
            <p style={{ margin: 0 }}>Untuk menjaga keamanan akun, TutorLog akan memverifikasi bahwa request berasal dari email yang sama dengan akun TutorLog. Jika email berbeda, owner TutorLog dapat meminta konfirmasi tambahan.</p>
          </div>

          {/* ESTIMASI */}
          <div>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Estimasi Proses</h2>
            <p style={{ margin: 0 }}>Request yang sudah terverifikasi akan diproses secepatnya selama early access. Target proses penghapusan adalah maksimal 7 hari setelah verifikasi selesai.</p>
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
