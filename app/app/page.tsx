import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "TutorLog — Home",
  description: "Dashboard TutorLog — rekap sesi, invoice, dan langganan.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? "";

  let isFree = true;
  try {
    const { data } = await supabase.rpc("get_user_access_status");
    if (data) {
      const result = data as Record<string, unknown>;
      isFree = !(result.pdf_export_unlimited as boolean);
    }
  } catch { /* fallback: assume free */ }

  return (
    <>
      {/* MOBILE */}
      <div className="vp-mobile">
        <div className="mob-page tw">
          <div className="mob-app-shell">
            <div className="mob-app-main" style={{ padding: "68px 20px 100px" }}>
              <div className="mob-home">
                <h1 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, margin: "0 0 4px" }}>
                  Halo, {email.split("@")[0]}
                </h1>
                <p style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--tw-text-2)", margin: "0 0 24px" }}>
                  Semua tools tutor dalam satu tempat.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  <Link href="/app/rekap" className="home-card">
                    <div className="home-card-icon" style={{ color: "var(--tw-primary)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" /></svg>
                    </div>
                    <div className="home-card-text">
                      <div className="home-card-title">Rekap Sesi</div>
                      <div className="home-card-desc">Total sesi, jam, dan pendapatan per bulan</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--tw-text-3)" }}><path d="M9 18l6-6-6-6" /></svg>
                  </Link>

                  <Link href="/app/invoice" className="home-card">
                    <div className="home-card-icon" style={{ color: "var(--tw-primary)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg>
                    </div>
                    <div className="home-card-text">
                      <div className="home-card-title">Buat Invoice</div>
                      <div className="home-card-desc">3 template, kustom warna, export PDF</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--tw-text-3)" }}><path d="M9 18l6-6-6-6" /></svg>
                  </Link>
                </div>

                {isFree && (
                  <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 18, margin: "0 0 16px" }}>Langganan</h2>
                    <div className="plan-card" style={{ padding: 24, borderRadius: "var(--r-xxl)", marginBottom: 16 }}>
                      <span className="tag" style={{ display: "inline-block", background: "rgba(140,246,210,.2)", color: "#8CF6D2", padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, marginBottom: 12 }}>Direkomendasikan</span>
                      <div className="plan-title" style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>TutorLog Plus</div>
                      <div className="p-desc" style={{ fontFamily: "var(--f-body)", fontSize: 13, opacity: .8, lineHeight: 1.5, marginBottom: 16 }}>Export invoice PDF tanpa batas, 3 template, kustom warna.</div>
                      <div className="price-row" style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
                        <span className="price" style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 28 }}>Rp 149rb</span>
                        <span className="per" style={{ fontFamily: "var(--f-body)", fontSize: 13, opacity: .7 }}>sekali bayar</span>
                      </div>
                      <a href="https://lynk.id/tutorlog" target="_blank" rel="noopener" className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center", background: "#fff", color: "var(--tw-primary)" }}>
                        Bayar via Lynk.id
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3" /></svg>
                      </a>
                    </div>

                    <div style={{ background: "var(--tw-surface)", borderRadius: "var(--r-lg)", padding: 16, marginBottom: 12 }}>
                      <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Transfer manual</div>
                      <div style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--tw-text-2)", marginBottom: 12 }}>BCA · 7712 3456 789 · a/n Kalilinux Studio</div>
                    </div>

                    <div style={{ background: "var(--tw-surface)", borderRadius: "var(--r-lg)", padding: 16 }}>
                      <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Cara aktivasi</div>
                      <ol style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--tw-text-2)", paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                        <li>Bayar via Lynk.id atau transfer manual</li>
                        <li>Status aktif otomatis 5 menit setelah pembayaran</li>
                        <li>Belum aktif setelah 15 menit? Konfirmasi via WhatsApp</li>
                      </ol>
                    </div>
                  </div>
                )}

                <a
                  href="https://play.google.com/store/apps/details?id=com.tutorlog.app"
                  target="_blank"
                  rel="noopener"
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%", justifyContent: "center", gap: 8 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814a.75.75 0 0 1 .396.112l16.5 9.75a.75.75 0 0 1 0 1.256l-16.5 9.75A.75.75 0 0 1 3 22.25V1.75a.75.75 0 0 1 .609-.936z" /></svg>
                  <span>Download TutorLog di Play Store</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="vp-desktop">
        <main className="app-main">
          <div className="app-header" style={{ marginBottom: 32 }}>
            <div>
              <h1>Halo, {email.split("@")[0]}</h1>
              <div className="sub">Semua tools tutor dalam satu tempat.</div>
            </div>
          </div>

          <div className="home-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
            <Link href="/app/rekap" className="home-card home-card-lg">
              <div className="home-card-icon" style={{ color: "var(--tw-primary)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" /></svg>
              </div>
              <div className="home-card-text">
                <div className="home-card-title">Rekap Sesi</div>
                <div className="home-card-desc">Total sesi, jam mengajar, dan pendapatan per bulan. Filter per murid.</div>
              </div>
            </Link>

            <Link href="/app/invoice" className="home-card home-card-lg">
              <div className="home-card-icon" style={{ color: "var(--tw-primary)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg>
              </div>
              <div className="home-card-text">
                <div className="home-card-title">Buat Invoice</div>
                <div className="home-card-desc">3 template profesional, kustom warna, export PDF siap kirim.</div>
              </div>
            </Link>
          </div>

          {isFree && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 20, margin: "0 0 20px" }}>Langganan</h2>
              <div className="subs-layout">
                <div className="plan-card">
                  <span className="tag">Direkomendasikan</span>
                  <div className="plan-title">TutorLog Plus</div>
                  <div className="p-desc">Untuk tutor yang mengelola lebih dari 3 murid dan butuh tagihan rutin.</div>
                  <div className="price-row">
                    <span className="price">Rp 149rb</span>
                    <span className="per">sekali bayar</span>
                  </div>
                  <ul className="p-feats">
                    <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Export invoice PDF tanpa batas</li>
                    <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Export rekap PDF & CSV tanpa batas</li>
                    <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>3 template invoice + kustom warna</li>
                    <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Simpan rekening + template favorit</li>
                    <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Prioritas dukungan</li>
                  </ul>
                  <a href="https://lynk.id/tutorlog" target="_blank" rel="noopener" className="btn btn-primary btn-lg" style={{ background: "#fff", color: "var(--tw-primary)", width: "100%", justifyContent: "center", gap: 8 }}>
                    Bayar via Lynk.id
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3" /></svg>
                  </a>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="pay-info">
                    <h3>Transfer manual</h3>
                    <div className="tw-helper">Sudah bayar di Lynk.id? Konfirmasi di sini kalau belum otomatis.</div>
                    <div className="bank-block">
                      <div className="lg">BCA</div>
                      <div>
                        <div className="bn">Bank Central Asia</div>
                        <div className="no">7712 3456 789</div>
                        <div className="an">a/n Kalilinux Studio</div>
                      </div>
                    </div>
                  </div>

                  <div className="pay-info">
                    <h3>Cara aktivasi</h3>
                    <ul className="step-list">
                      <li><span className="num">1</span><span>Klik <b>&ldquo;Bayar via Lynk.id&rdquo;</b> → selesaikan pembayaran.</span></li>
                      <li><span className="num">2</span><span>Status aktif otomatis dalam 5 menit.</span></li>
                      <li><span className="num">3</span><span>Belum aktif setelah 15 menit? Konfirmasi via WhatsApp.</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", paddingTop: 20, borderTop: "1px solid var(--tw-divider)" }}>
            <a
              href="https://play.google.com/store/apps/details?id=com.tutorlog.app"
              target="_blank"
              rel="noopener"
              className="btn btn-primary btn-sm"
              style={{ gap: 8 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814a.75.75 0 0 1 .396.112l16.5 9.75a.75.75 0 0 1 0 1.256l-16.5 9.75A.75.75 0 0 1 3 22.25V1.75a.75.75 0 0 1 .609-.936z" /></svg>
              <span>Download TutorLog di Play Store</span>
            </a>
          </div>
        </main>
      </div>
    </>
  );
}