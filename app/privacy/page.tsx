import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MenuToggle from "@/components/MenuToggle";

export const metadata: Metadata = {
  title: "TutorLog — Kebijakan Privasi",
  description: "Kebijakan privasi TutorLog — data yang dipakai, penyimpanan, dan hak pengguna.",
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

function SvgLock({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function SvgSpark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4" />
      <path d="M12 14a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4" />
    </svg>
  );
}

export default function PrivacyPage() {
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
              <div className="mob-soft-hero__icon"><SvgLock size={22} /></div>
              <h1>Kebijakan Privasi</h1>
              <p className="mob-soft-hero__sub">Terakhir diperbarui: 3 Juni 2026</p>
            </div>
          </div>

          <div className="mob-legal-body">
            <div className="mob-legal-callout">
              <div className="mob-legal-callout__icon"><SvgSpark size={16} /></div>
              <div><strong>Ringkasan:</strong> TutorLog membantu tutor privat mencatat sesi les, menyimpan riwayat murid, membuat rekap tagihan, dan export ke PDF/CSV.</div>
            </div>

            <h2>Data yang Dipakai</h2>
            <ul>
              <li><b>Data akun:</b> email dan ID autentikasi.</li>
              <li><b>Profil tutor:</b> nama untuk laporan dan export.</li>
              <li><b>Data murid:</b> nama, tingkat pendidikan, tarif.</li>
              <li><b>Data lokasi:</b> lokasi murid dan sesi (foreground only).</li>
              <li><b>Aktivitas sesi:</b> waktu, durasi, estimasi tagihan.</li>
              <li><b>Data premium:</b> voucher, status akses.</li>
            </ul>

            <h2>Penggunaan Lokasi</h2>
            <p>TutorLog hanya memakai foreground location untuk fungsi sesi les. Tidak ada background tracking.</p>

            <h2>Penyimpanan &amp; Keamanan</h2>
            <p>Data disimpan di Supabase via HTTPS. User hanya bisa akses data miliknya sendiri.</p>

            <h2>Penghapusan Data</h2>
            <p>Kirim email ke <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a> untuk request penghapusan akun dan data.</p>
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
                <SvgLock size={24} />
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, letterSpacing: "-.5px", margin: 0, color: "#F5EFE4" }}>Kebijakan Privasi</h1>
                <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "rgba(140,246,210,.55)", margin: "4px 0 0" }}>Terakhir diperbarui: 3 Juni 2026</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 64px", fontFamily: "var(--f-body)", fontSize: 15, lineHeight: 1.7, color: "var(--tw-text-2)" }}>
          {/* RINGKASAN */}
          <div className="card" style={{ padding: "24px 28px", marginBottom: 32, background: "var(--tw-secondary-soft)", border: "none" }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 20, margin: "0 0 12px", color: "var(--tw-text)" }}>Ringkasan</h2>
            <p style={{ margin: 0 }}>TutorLog membantu tutor privat mencatat sesi les, menyimpan riwayat murid, membuat rekap tagihan, dan export rekap ke PDF/CSV. Kebijakan ini menjelaskan data yang dipakai TutorLog dan alasannya.</p>
          </div>

          {/* DATA YANG DIPAKAI */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Data yang Dipakai TutorLog</h2>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><b>Data akun:</b> alamat email dan ID autentikasi.</li>
              <li style={{ marginBottom: 8 }}><b>Profil tutor:</b> nama tutor untuk laporan dan export PDF.</li>
              <li style={{ marginBottom: 8 }}><b>Data murid:</b> nama, tingkat pendidikan, tipe tagihan, tarif, dan status aktif/tersembunyi.</li>
              <li style={{ marginBottom: 8 }}><b>Data lokasi:</b> lokasi belajar murid dan lokasi sesi saat user menyimpan lokasi murid, mulai sesi tatap muka, atau menyelesaikan sesi.</li>
              <li style={{ marginBottom: 8 }}><b>Aktivitas sesi:</b> waktu mulai, waktu selesai, mode ajar, durasi, estimasi tagihan, status sinkronisasi, dan riwayat sesi.</li>
              <li style={{ marginBottom: 8 }}><b>Data akses premium:</b> voucher, status akses, tanggal aktif, dan counter penggunaan export.</li>
              <li style={{ marginBottom: 8 }}><b>File export:</b> PDF atau CSV yang dibuat hanya saat user memilih export/share.</li>
            </ul>
          </div>

          <p style={{ marginBottom: 32 }}>TutorLog tidak mengambil lokasi di background dan tidak melacak pergerakan user secara langsung.</p>

          {/* ALASAN DATA DIGUNAKAN */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Alasan Data Digunakan</h2>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>Login dan pengelolaan akun tutor.</li>
              <li style={{ marginBottom: 8 }}>Mencocokkan sesi tatap muka dengan lokasi murid yang tersimpan.</li>
              <li style={{ marginBottom: 8 }}>Mencatat riwayat sesi dan durasi mengajar.</li>
              <li style={{ marginBottom: 8 }}>Menghitung rekap tagihan.</li>
              <li style={{ marginBottom: 8 }}>Membuat PDF/CSV saat diminta user.</li>
              <li style={{ marginBottom: 8 }}>Mengelola limit akses, voucher, dan early access.</li>
              <li style={{ marginBottom: 8 }}>Membantu debugging atau support saat user melaporkan masalah.</li>
            </ul>
          </div>

          {/* PENGGUNAAN LOKASI */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Penggunaan Lokasi</h2>
            <p style={{ marginBottom: 12 }}>TutorLog meminta izin lokasi hanya untuk fungsi yang berkaitan dengan sesi les, yaitu menyimpan lokasi murid, mulai sesi tatap muka di dekat lokasi murid, dan menyimpan titik lokasi saat sesi selesai.</p>
            <p style={{ marginBottom: 0 }}>TutorLog hanya memakai foreground location. App tidak meminta permission <code style={{ background: "var(--tw-surface-soft)", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>ACCESS_BACKGROUND_LOCATION</code>.</p>
          </div>

          {/* PENYIMPANAN DAN KEAMANAN */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Penyimpanan dan Keamanan</h2>
            <p style={{ marginBottom: 12 }}>TutorLog menyimpan data app di Supabase. Data dikirim melalui koneksi HTTPS terenkripsi. Access rules dikonfigurasi agar user yang login hanya bisa mengakses data TutorLog miliknya sendiri.</p>
            <p style={{ marginBottom: 0 }}>File PDF dan CSV dibuat dari data rekap yang dipilih user. Setelah export, user mengontrol sendiri tempat file tersebut dibagikan atau disimpan.</p>
          </div>

          {/* RETENSI DAN PENGHAPUSAN */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Retensi dan Penghapusan Data</h2>
            <p style={{ marginBottom: 12 }}>TutorLog menyimpan data akun, murid, sesi, voucher, dan rekap selama akun aktif agar tutor bisa melihat riwayat dan membuat laporan.</p>
            <p style={{ marginBottom: 0 }}>Jika user meminta penghapusan akun atau data, TutorLog akan memverifikasi request tersebut lalu menghapus atau menganonimkan data terkait sesuai proses penghapusan akun.</p>
          </div>

          {/* KONTAK */}
          <div>
            <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 16px", color: "var(--tw-text)" }}>Kontak</h2>
            <p style={{ margin: 0 }}>Untuk pertanyaan privasi atau penghapusan data, kirim email ke <a href="mailto:tutorlog.admin@gmail.com" style={{ color: "var(--tw-primary)", fontWeight: 700 }}>tutorlog.admin@gmail.com</a>.</p>
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
