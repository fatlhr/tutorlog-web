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

                    <div className="mob-price-card mob-price-card--free" style={{ marginBottom: 16 }}>
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
                    </div>

                    <div className="mob-price-card mob-price-card--plus" style={{ marginBottom: 16 }}>
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
                      <a href="https://lynk.id/tutorlog" target="_blank" rel="noopener" className="btn btn-primary btn-sm"
                        style={{ width: "100%", background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)", gap: 6 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          Bayar via Lynk.id
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3" /></svg>
                        </span>
                      </a>
                    </div>

                    <div className="mob-price-card mob-price-card--free" style={{ borderColor: "var(--tw-primary-soft)", marginBottom: 16 }}>
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
                      <a href="https://lynk.id/tutorlog" target="_blank" rel="noopener" className="btn btn-secondary btn-sm" style={{ width: "100%" }}>Pilih Bulanan</a>
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
                  <div className="sub">Mulai gratis, upgrade kalau butuh.</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 32 }}>
                <div className="card" style={{ padding: "32px 28px", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 13, color: "var(--tw-text-3)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>Free</div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, color: "var(--tw-text)" }}>Rp 0</div>
                    <div style={{ fontSize: 13, color: "var(--tw-text-3)", marginTop: 4 }}>/ selamanya</div>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--tw-text-2)", marginBottom: 24, lineHeight: 1.6 }}>Untuk tutor yang baru mulai atau mengelola sedikit murid.</p>
                  <ul style={{ paddingLeft: 0, margin: "0 0 32px", listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                    {["Rekap bulanan lengkap", "Filter per murid", "Export PDF rekap (1×/bulan)", "Export CSV rekap (1×/bulan)", "Invoice builder (preview only)"].map((f, i) => (
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
                    <a href="https://lynk.id/tutorlog" target="_blank" rel="noopener" className="btn btn-primary btn-lg"
                      style={{ width: "100%", padding: "0 24px", background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)", gap: 6 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        Bayar via Lynk.id
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3" /></svg>
                      </span>
                    </a>
                  </div>
                </div>

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
                    <a href="https://lynk.id/tutorlog" target="_blank" rel="noopener" className="btn btn-secondary btn-lg" style={{ width: "100%" }}>Pilih Bulanan</a>
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