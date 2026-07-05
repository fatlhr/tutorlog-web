import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MenuToggle from "@/components/MenuToggle";

export const metadata: Metadata = {
  title: "TutorLog — Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan TutorLog — aplikasi pencatat sesi les untuk tutor privat.",
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

function SvgFile({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

export default function TermsPage() {
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
              <div className="mob-soft-hero__icon"><SvgFile size={22} /></div>
              <h1>Syarat &amp; Ketentuan</h1>
              <p className="mob-soft-hero__sub">Terakhir diperbarui: 3 Juni 2026</p>
            </div>
          </div>

          <div className="mob-legal-body">
            <h2>Penerimaan Syarat</h2>
            <p>Dengan menggunakan aplikasi TutorLog (&quot;Layanan&quot;), kamu setuju untuk terikat dengan syarat dan ketentuan ini. Jika tidak setuju, jangan gunakan Layanan.</p>

            <h2>Deskripsi Layanan</h2>
            <p>TutorLog adalah aplikasi pencatat sesi les untuk tutor privat di Indonesia. Layanan mencakup pencatatan sesi, rekap tagihan, export PDF/CSV, dan invoice builder melalui aplikasi mobile dan companion web.</p>

            <h2>Akun Pengguna</h2>
            <ul>
              <li>Kamu bertanggung jawab menjaga kerahasiaan akses akun (email login dan magic link).</li>
              <li>Satu akun hanya boleh digunakan oleh satu orang tutor.</li>
              <li>TutorLog berhak menonaktifkan akun yang melanggar ketentuan ini.</li>
            </ul>

            <h2>Penggunaan yang Diperbolehkan</h2>
            <p>Kamu setuju untuk menggunakan Layanan hanya untuk tujuan yang sah dan sesuai dengan fungsi yang disediakan:</p>
            <ul>
              <li>Mencatat dan mengelola sesi les privat.</li>
              <li>Membuat rekap dan tagihan untuk murid/orang tua murid.</li>
              <li>Mengexport data sesi dalam format PDF atau CSV.</li>
            </ul>

            <h2>Langganan dan Pembayaran</h2>
            <ul>
              <li>Beberapa fitur (export PDF tanpa batas, invoice builder) memerlukan langganan TutorLog Plus.</li>
              <li>Pembayaran diproses melalui Lynk.id atau transfer manual.</li>
              <li>Langganan berlaku per bulan dan tidak diperpanjang otomatis.</li>
              <li>Pembayaran yang sudah dilakukan tidak dapat dikembalikan (non-refundable).</li>
            </ul>

            <h2>Batasan Tanggung Jawab</h2>
            <p>TutorLog disediakan &quot;sebagaimana adanya&quot; (as-is). Kami tidak menjamin bahwa Layanan akan selalu tersedia, bebas error, atau memenuhi semua kebutuhan spesifik kamu. TutorLog tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan Layanan.</p>

            <h2>Perubahan Ketentuan</h2>
            <p>TutorLog dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui aplikasi atau email. Penggunaan Layanan setelah perubahan berarti kamu menyetujui ketentuan yang diperbarui.</p>

            <h2>Kontak</h2>
            <p>Untuk pertanyaan tentang syarat dan ketentuan ini, hubungi <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a>.</p>
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
                <SvgFile size={24} />
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, letterSpacing: "-.5px", margin: 0, color: "#F5EFE4" }}>Syarat &amp; Ketentuan</h1>
                <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "rgba(140,246,210,.55)", margin: "4px 0 0" }}>Terakhir diperbarui: 3 Juni 2026</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 64px", fontFamily: "var(--f-body)", fontSize: 15, lineHeight: 1.7, color: "var(--tw-text-2)" }}>
          {/* PENERIMAAN SYARAT */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Penerimaan Syarat</h2>
            <p style={{ margin: 0 }}>Dengan menggunakan aplikasi TutorLog (&quot;Layanan&quot;), kamu setuju untuk terikat dengan syarat dan ketentuan ini. Jika tidak setuju, jangan gunakan Layanan.</p>
          </div>

          {/* DESKRIPSI LAYANAN */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Deskripsi Layanan</h2>
            <p style={{ margin: 0 }}>TutorLog adalah aplikasi pencatat sesi les untuk tutor privat di Indonesia. Layanan mencakup pencatatan sesi, rekap tagihan, export PDF/CSV, dan invoice builder melalui aplikasi mobile dan companion web.</p>
          </div>

          {/* AKUN PENGGUNA */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Akun Pengguna</h2>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>Kamu bertanggung jawab menjaga kerahasiaan akses akun (email login dan magic link).</li>
              <li style={{ marginBottom: 8 }}>Satu akun hanya boleh digunakan oleh satu orang tutor.</li>
              <li style={{ marginBottom: 8 }}>TutorLog berhak menonaktifkan akun yang melanggar ketentuan ini.</li>
            </ul>
          </div>

          {/* PENGGUNAAN YANG DIPERBOLEHKAN */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Penggunaan yang Diperbolehkan</h2>
            <p style={{ marginBottom: 12 }}>Kamu setuju untuk menggunakan Layanan hanya untuk tujuan yang sah dan sesuai dengan fungsi yang disediakan:</p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>Mencatat dan mengelola sesi les privat.</li>
              <li style={{ marginBottom: 8 }}>Membuat rekap dan tagihan untuk murid/orang tua murid.</li>
              <li style={{ marginBottom: 8 }}>Mengexport data sesi dalam format PDF atau CSV.</li>
            </ul>
          </div>

          {/* LANGGANAN DAN PEMBAYARAN */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Langganan dan Pembayaran</h2>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>Beberapa fitur (export PDF tanpa batas, invoice builder) memerlukan langganan TutorLog Plus.</li>
              <li style={{ marginBottom: 8 }}>Pembayaran diproses melalui Lynk.id atau transfer manual.</li>
              <li style={{ marginBottom: 8 }}>Langganan berlaku per bulan dan tidak diperpanjang otomatis.</li>
              <li style={{ marginBottom: 8 }}>Pembayaran yang sudah dilakukan tidak dapat dikembalikan (non-refundable).</li>
            </ul>
          </div>

          {/* BATASAN TANGGUNG JAWAB */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Batasan Tanggung Jawab</h2>
            <p style={{ margin: 0 }}>TutorLog disediakan &quot;sebagaimana adanya&quot; (as-is). Kami tidak menjamin bahwa Layanan akan selalu tersedia, bebas error, atau memenuhi semua kebutuhan spesifik kamu. TutorLog tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan Layanan.</p>
          </div>

          {/* PERUBAHAN KETENTUAN */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Perubahan Ketentuan</h2>
            <p style={{ margin: 0 }}>TutorLog dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui aplikasi atau email. Penggunaan Layanan setelah perubahan berarti kamu menyetujui ketentuan yang diperbarui.</p>
          </div>

          {/* KONTAK */}
          <div>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Kontak</h2>
            <p style={{ margin: 0 }}>Untuk pertanyaan tentang syarat dan ketentuan ini, hubungi <a href="mailto:tutorlog.admin@gmail.com" style={{ color: "var(--tw-primary)", fontWeight: 700 }}>tutorlog.admin@gmail.com</a>.</p>
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
