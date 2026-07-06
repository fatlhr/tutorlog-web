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
                    <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 18, margin: "0 0 12px" }}>Langganan</h2>

                    <div className="mob-current-plan">
                      <div className="mob-cp-left">
                        <div className="mob-cp-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" /></svg>
                        </div>
                        <div>
                          <div className="mob-cp-name">Free Plan</div>
                          <div className="mob-cp-desc">Export terbatas · 1×/bulan</div>
                        </div>
                      </div>
                      <div className="mob-cp-badge">Aktif</div>
                    </div>

                    <div className="mob-plan-card">
                      <div className="plan-orb"></div>
                      <span className="tag">Upgrade</span>
                      <div className="plan-title">TutorLog Plus</div>
                      <div className="price-row" style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                        <div style={{ flex: 1, background: "rgba(255,255,255,.08)", borderRadius: "var(--r-md)", padding: "10px 12px", textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 18 }}>Rp 149rb</div>
                          <div style={{ fontFamily: "var(--f-body)", fontSize: 10, opacity: .7, marginTop: 2 }}>Sekali bayar</div>
                        </div>
                        <div style={{ flex: 1, background: "rgba(255,255,255,.08)", borderRadius: "var(--r-md)", padding: "10px 12px", textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 18 }}>Rp 19rb</div>
                          <div style={{ fontFamily: "var(--f-body)", fontSize: 10, opacity: .7, marginTop: 2 }}>Per bulan</div>
                        </div>
                      </div>
                      <ul className="p-feats">
                        <li><span className="ck"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Export invoice PDF tanpa batas</li>
                        <li><span className="ck"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Export rekap PDF & CSV tanpa batas</li>
                        <li><span className="ck"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>3 template invoice + kustom warna</li>
                        <li><span className="ck"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Prioritas dukungan via WhatsApp</li>
                      </ul>
                      <a href="https://lynk.id/tutorlog" target="_blank" rel="noopener" className="btn btn-primary btn-sm" style={{ width: "100%", height: 46, fontSize: 14, justifyContent: "center", background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)", gap: 8 }}>
                        Bayar via Lynk.id
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3" /></svg>
                      </a>
                    </div>

                    <div className="mob-or-divider">
                      <div className="mob-or-line"></div>
                      <span className="mob-or-text">atau transfer manual</span>
                      <div className="mob-or-line"></div>
                    </div>

                    <div className="mob-pay-info" style={{ marginTop: 0 }}>
                      <div className="mob-bank-block">
                        <div className="lg">BCA</div>
                        <div>
                          <div className="bn">Bank Central Asia</div>
                          <div className="no">7712 3456 789</div>
                          <div className="an">a/n Kalilinux Studio</div>
                        </div>
                      </div>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ width: "100%", gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3" /></svg>
                        Konfirmasi pembayaran
                      </button>
                    </div>

                    <div className="mob-how-it-works">
                      <h3>Cara aktivasi</h3>
                      <div className="mob-hiw-steps">
                        <div className="mob-hiw-step">
                          <div className="mob-hiw-num">1</div>
                          <span>Bayar via Lynk.id atau transfer</span>
                        </div>
                        <div className="mob-hiw-step">
                          <div className="mob-hiw-num">2</div>
                          <span>Tunggu 5 menit untuk aktivasi</span>
                        </div>
                        <div className="mob-hiw-step">
                          <div className="mob-hiw-num">3</div>
                          <span>Belum aktif? Tap &ldquo;Konfirmasi&rdquo;</span>
                        </div>
                      </div>
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
              <div className="app-header" style={{ marginBottom: 20 }}>
                <div>
                  <h1>Langganan</h1>
                  <div className="sub">Aktifkan TutorLog Plus untuk fitur export tanpa batas.</div>
                </div>
                <span className="chip"><span className="chip-dot"></span>Free plan aktif</span>
              </div>

              <div className="subs-layout">
                <div className="plan-card">
                  <span className="tag">Direkomendasikan</span>
                  <div className="plan-title">TutorLog Plus</div>
                  <div className="p-desc">Untuk tutor yang mengelola lebih dari 3 murid dan butuh tagihan rutin.</div>
                  <div className="price-row" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, background: "rgba(255,255,255,.08)", borderRadius: "var(--r-md)", padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 20 }}>Rp 149rb</div>
                      <div style={{ fontFamily: "var(--f-body)", fontSize: 11, opacity: .7, marginTop: 2 }}>Sekali bayar</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,.08)", borderRadius: "var(--r-md)", padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 20 }}>Rp 19rb</div>
                      <div style={{ fontFamily: "var(--f-body)", fontSize: 11, opacity: .7, marginTop: 2 }}>Per bulan</div>
                    </div>
                  </div>
                  <ul className="p-feats">
                    <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Export invoice PDF tanpa batas</li>
                    <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Export rekap PDF & CSV tanpa batas</li>
                    <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>3 template invoice + kustom warna</li>
                    <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Simpan rekening + template favorit</li>
                    <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Prioritas dukungan via WhatsApp</li>
                  </ul>
                  <a href="https://lynk.id/tutorlog" target="_blank" rel="noopener" className="btn btn-primary btn-lg" style={{ background: "#fff", color: "var(--tw-primary)", width: "100%", justifyContent: "center", gap: 8 }}>
                    Bayar via Lynk.id
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3" /></svg>
                  </a>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="pay-info">
                    <h3>Transfer manual</h3>
                    <div className="tw-helper">Sudah bayar di Lynk.id? Konfirmasi manual di sini kalau otomatisasi belum tersinkron.</div>
                    <div className="bank-block">
                      <div className="lg">BCA</div>
                      <div>
                        <div className="bn">Bank Central Asia</div>
                        <div className="no">7712 3456 789</div>
                        <div className="an">a/n Kalilinux Studio</div>
                      </div>
                    </div>
                    <button type="button" className="btn btn-secondary btn-lg" style={{ gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3" /></svg>
                      Konfirmasi pembayaran
                    </button>
                  </div>

                  <div className="pay-info">
                    <h3>Cara aktivasi</h3>
                    <ul className="step-list">
                      <li><span className="num">1</span><span>Klik <b>&ldquo;Bayar via Lynk.id&rdquo;</b> → selesaikan pembayaran di halaman Lynk.</span></li>
                      <li><span className="num">2</span><span>Status langganan akan otomatis aktif dalam 5 menit setelah pembayaran berhasil.</span></li>
                      <li><span className="num">3</span><span>Kalau belum aktif setelah 15 menit, gunakan <b>&ldquo;Konfirmasi pembayaran&rdquo;</b> dan lampirkan bukti transfer.</span></li>
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