import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PricingCards from "@/components/PricingCards";

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

<PricingCards variant="home" />

              <div style={{ background: "var(--tw-surface)", borderRadius: "var(--r-lg)", padding: "20px 24px", marginTop: 24 }}>
                <p style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--tw-text-2)", lineHeight: 1.6, margin: "0 0 14px" }}>
                  Sudah transfer tapi TutorLog Plus belum aktif? Kirim konfirmasi lewat WhatsApp — tim kami proses dalam 1×24 jam.
                </p>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20TutorLog%2C%20saya%20sudah%20transfer%20untuk%20langganan%20Plus.%20Tolong%20diaktifkan."
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary btn-sm"
                  style={{ width: "100%", gap: 8 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                  Konfirmasi via WhatsApp
                </a>
              </div>
                  </div>
                )}

                <div style={{
                  position: "relative", overflow: "hidden",
                  background: "linear-gradient(135deg, #E9FFF7 0%, #CFF8EA 40%, #89D9BE 100%)",
                  borderRadius: 16,
                  border: "1px solid rgba(0,108,83,.15)",
                  padding: 24,
                  marginTop: 32,
                }}>
                  <div style={{ position: "absolute", right: -16, top: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.45)" }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, width: 6, height: 6, borderRadius: "50%", background: "#FFDBD1" }} />
                  <div style={{ position: "absolute", bottom: 18, left: 24, width: 6, height: 6, borderRadius: "50%", background: "rgba(0,108,83,.2)" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
                        <Image src="/tutorlog-logo.png" alt="" width={28} height={28} style={{ objectFit: "contain" }} />
                      </div>
                      <span style={{ fontFamily: "var(--f-title)", fontWeight: 800, fontSize: 16, color: "var(--tw-primary)" }}>TutorLog</span>
                      <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--tw-primary)", background: "rgba(255,255,255,.8)", padding: "3px 8px", borderRadius: 99, border: "1px solid rgba(0,108,83,.15)" }}>Gratis</span>
                    </div>
                    <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 22, lineHeight: 1.1, color: "#161D1F", margin: "0 0 8px" }}>
                      Catat les.<br /><span style={{ fontStyle: "italic", color: "var(--tw-primary)" }}>Lebih rapi.</span>
                    </h2>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "#3E4944", lineHeight: 1.5, margin: "0 0 16px" }}>
                      Jadwal, absensi, dan rekap sesi tutor dalam satu app.
                    </p>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.tutorlog.app"
                      target="_blank"
                      rel="noopener"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "12px 20px",
                        background: "var(--tw-primary)", color: "#fff",
                        borderRadius: 99, fontFamily: "var(--f-body)", fontWeight: 700, fontSize: 14,
                        textDecoration: "none",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814a.75.75 0 0 1 .396.112l16.5 9.75a.75.75 0 0 1 0 1.256l-16.5 9.75A.75.75 0 0 1 3 22.25V1.75a.75.75 0 0 1 .609-.936z" /></svg>
                      Download di Play Store
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="vp-desktop">
        <main className="app-main">
          <div className="app-header" style={{ marginBottom: 40 }}>
            <div>
              <h1>Halo, {email.split("@")[0]}</h1>
              <div className="sub">Semua tools tutor dalam satu tempat.</div>
            </div>
          </div>

          <div className="home-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 48 }}>
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
            <div style={{ marginBottom: 48 }}>
              <div className="app-header" style={{ marginBottom: 24, paddingTop: 48, borderTop: "1px solid var(--tw-divider)" }}>
                <div>
                  <h1>Langganan</h1>
                  <div className="sub">Mulai gratis, upgrade kalau butuh.</div>
                </div>
              </div>

              <PricingCards variant="home" />
            </div>
          )}

          <div style={{ paddingTop: 48, borderTop: "1px solid var(--tw-divider)" }}>
            <div style={{
              position: "relative", overflow: "hidden",
              background: "linear-gradient(135deg, #E9FFF7 0%, #CFF8EA 40%, #89D9BE 100%)",
              borderRadius: 16,
              border: "1px solid rgba(0,108,83,.15)",
              padding: "32px 36px",
          }}>
            <div style={{ position: "absolute", right: -24, top: -24, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.45)" }} />
            <div style={{ position: "absolute", bottom: 16, left: 16, width: 8, height: 8, borderRadius: "50%", background: "#FFDBD1" }} />
            <div style={{ position: "absolute", bottom: 24, left: 36, width: 8, height: 8, borderRadius: "50%", background: "rgba(0,108,83,.2)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
                  <Image src="/tutorlog-logo.png" alt="" width={34} height={34} style={{ objectFit: "contain" }} />
                </div>
                <span style={{ fontFamily: "var(--f-title)", fontWeight: 800, fontSize: 20, color: "var(--tw-primary)" }}>TutorLog</span>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--tw-primary)", background: "rgba(255,255,255,.8)", padding: "4px 10px", borderRadius: 99, border: "1px solid rgba(0,108,83,.15)" }}>Gratis</span>
              </div>
              <h2 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, lineHeight: 1.05, color: "#161D1F", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
                Catat les.<br /><span style={{ fontStyle: "italic", color: "var(--tw-primary)" }}>Lebih rapi.</span>
              </h2>
              <p style={{ fontFamily: "var(--f-body)", fontSize: 15, color: "#3E4944", lineHeight: 1.6, margin: "0 0 20px" }}>
                Jadwal, absensi, riwayat sesi, dan rekap mengajar dalam satu app untuk tutor privat.
              </p>
              <a
                href="https://play.google.com/store/apps/details?id=com.tutorlog.app"
                target="_blank"
                rel="noopener"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 24px",
                  background: "var(--tw-primary)", color: "#fff",
                  borderRadius: 99, fontFamily: "var(--f-body)", fontWeight: 700, fontSize: 15,
                  textDecoration: "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814a.75.75 0 0 1 .396.112l16.5 9.75a.75.75 0 0 1 0 1.256l-16.5 9.75A.75.75 0 0 1 3 22.25V1.75a.75.75 0 0 1 .609-.936z" /></svg>
                Download di Play Store
              </a>
            </div>
          </div>
          </div>
        </main>
      </div>
    </>
  );
}