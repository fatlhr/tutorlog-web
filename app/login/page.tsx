import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendMagicLink } from "./actions";

export const metadata: Metadata = {
  title: "TutorLog — Masuk",
  description: "Masuk ke TutorLog dengan Magic Link — tanpa password.",
};

const particles = [
  { x: "15%", y: "8%", s: 5, glow: false, pd: "4s", po: ".3", pt: "0s" },
  { x: "62%", y: "12%", s: 8, glow: true, pd: "5s", po: ".5", pt: ".6s" },
  { x: "85%", y: "18%", s: 4, glow: false, pd: "4.5s", po: ".25", pt: "1s" },
  { x: "8%", y: "28%", s: 6, glow: true, pd: "6s", po: ".45", pt: ".3s" },
  { x: "42%", y: "14%", s: 7, glow: true, pd: "5s", po: ".4", pt: "1.5s" },
  { x: "78%", y: "35%", s: 5, glow: false, pd: "4s", po: ".3", pt: "2s" },
  { x: "22%", y: "52%", s: 9, glow: true, pd: "6s", po: ".5", pt: ".8s" },
  { x: "88%", y: "55%", s: 4, glow: false, pd: "5s", po: ".2", pt: "1.2s" },
  { x: "55%", y: "65%", s: 6, glow: true, pd: "5.5s", po: ".4", pt: "0s" },
  { x: "12%", y: "72%", s: 5, glow: false, pd: "4s", po: ".35", pt: "1.8s" },
  { x: "72%", y: "78%", s: 7, glow: true, pd: "6s", po: ".45", pt: ".5s" },
  { x: "38%", y: "82%", s: 4, glow: false, pd: "5s", po: ".25", pt: "2.2s" },
  { x: "90%", y: "85%", s: 6, glow: true, pd: "4.5s", po: ".4", pt: "1s" },
  { x: "48%", y: "90%", s: 5, glow: false, pd: "5s", po: ".3", pt: ".4s" },
  { x: "30%", y: "38%", s: 3, glow: false, pd: "4s", po: ".2", pt: "1.6s" },
  { x: "68%", y: "48%", s: 4, glow: false, pd: "5.5s", po: ".25", pt: "2s" },
];

const mobileParticles = [
  { x: "12%", y: "15%", s: 5, glow: true, pd: "5s", po: ".35", pt: "0s" },
  { x: "75%", y: "10%", s: 4, glow: false, pd: "4s", po: ".2", pt: ".5s" },
  { x: "90%", y: "35%", s: 6, glow: true, pd: "6s", po: ".4", pt: "1s" },
  { x: "25%", y: "65%", s: 4, glow: false, pd: "5s", po: ".25", pt: "1.5s" },
  { x: "60%", y: "78%", s: 5, glow: true, pd: "4.5s", po: ".3", pt: ".3s" },
  { x: "85%", y: "85%", s: 4, glow: false, pd: "5.5s", po: ".2", pt: "2s" },
];

const tabParticles = [
  { x: "8%", y: "10%", s: 6, glow: true, pd: "5s", po: ".4", pt: "0s" },
  { x: "22%", y: "6%", s: 4, glow: false, pd: "4s", po: ".25", pt: ".4s" },
  { x: "48%", y: "8%", s: 5, glow: true, pd: "6s", po: ".4", pt: "1s" },
  { x: "72%", y: "5%", s: 4, glow: false, pd: "4.5s", po: ".2", pt: "1.4s" },
  { x: "92%", y: "12%", s: 7, glow: true, pd: "5s", po: ".45", pt: ".6s" },
  { x: "5%", y: "22%", s: 5, glow: false, pd: "4s", po: ".3", pt: "1.8s" },
  { x: "88%", y: "28%", s: 4, glow: false, pd: "5.5s", po: ".25", pt: ".2s" },
  { x: "16%", y: "42%", s: 5, glow: true, pd: "5s", po: ".35", pt: "2s" },
  { x: "82%", y: "45%", s: 6, glow: true, pd: "6s", po: ".4", pt: ".8s" },
  { x: "10%", y: "58%", s: 4, glow: false, pd: "4.5s", po: ".2", pt: "1.2s" },
  { x: "92%", y: "62%", s: 5, glow: true, pd: "5.5s", po: ".35", pt: "1.6s" },
  { x: "6%", y: "78%", s: 6, glow: true, pd: "5s", po: ".4", pt: ".3s" },
  { x: "28%", y: "88%", s: 4, glow: false, pd: "4s", po: ".25", pt: "1.9s" },
  { x: "58%", y: "92%", s: 5, glow: true, pd: "6s", po: ".35", pt: ".7s" },
  { x: "82%", y: "84%", s: 4, glow: false, pd: "5s", po: ".2", pt: "2.4s" },
  { x: "95%", y: "76%", s: 7, glow: true, pd: "5.5s", po: ".45", pt: "1.1s" },
];

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/app/rekap");

  return (
    <>
      <style>{`
        .tab-only-nav, .tab-only-particle, .tab-only-quote, .tab-only-rings, .tab-only-conn, .tab-only-card { display: none; }
        .tab-bg-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(140, 246, 210, 0.3);
          pointer-events: none;
          z-index: 1;
        }
        @media (min-width: 768px) and (max-width: 1199px) {
          .login-wrap-v2 { grid-template-columns: 1fr !important; position: relative; }
          .login-right-v2 { display: none !important; }
          .login-left-v2 {
            background: radial-gradient(ellipse 80% 60% at 30% 20%, rgba(20,65,50,.9) 0%, transparent 55%),
                        radial-gradient(ellipse 60% 50% at 80% 80%, rgba(30,55,80,.4) 0%, transparent 50%),
                        linear-gradient(160deg, #0f2920 0%, #143328 35%, #122a22 60%, #0d1f18 100%) !important;
            min-height: 100svh;
            padding: 0 !important;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }
          .login-left-v2::before {
            display: block !important;
            background-image:
              linear-gradient(rgba(140,246,210,.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(140,246,210,.03) 1px, transparent 1px) !important;
            background-size: 50px 50px !important;
            width: 100% !important; height: 100% !important;
            left: 0 !important; top: 0 !important;
            border-radius: 0 !important;
            background-color: transparent !important;
          }
          .login-left-v2::after {
            content: '';
            position: absolute;
            left: 50%; top: 45%;
            transform: translate(-50%, -50%);
            width: 500px; height: 500px; border-radius: 50%;
            background: radial-gradient(circle, rgba(140,246,210,.12) 0%, rgba(0,108,83,.05) 40%, transparent 65%);
            pointer-events: none;
            z-index: 1;
            animation: orbPulse 5s ease-in-out infinite;
          }
          .login-form {
            max-width: 440px !important;
            background: rgba(255,255,255,.96);
            border-radius: 24px;
            padding: 40px 32px;
            box-shadow: 0 32px 80px rgba(0,0,0,.3), 0 0 80px rgba(140,246,210,.05);
            position: relative;
            z-index: 10;
          }
          .login-stat-node {
            padding: 10px 14px !important;
          }
          .login-stat-node .sn-val {
            font-size: 20px !important;
          }
          .login-stat-node .sn-label {
            font-size: 9px !important;
          }
          .login-stat-node .sn-sub {
            font-size: 10px !important;
          }
          .login-fi-dark {
            width: 44px !important; height: 44px !important;
          }
          .login-fi-dark svg {
            width: 18px !important; height: 18px !important;
          }
          .tab-only-nav { display: flex !important; }
          .tab-only-particle { display: block !important; }
          .tab-only-quote { display: block !important; }
          .tab-bg-dot { display: block !important; }
          .tab-only-rings { display: block !important; }
          .tab-only-conn { display: block !important; }
          .tab-only-card { display: block !important; }
          .tab-mini-card {
            position: absolute;
            width: 220px;
            background: rgba(140,246,210,.06);
            border: 1px solid rgba(140,246,210,.15);
            border-radius: 18px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            padding: 16px 18px;
            box-shadow: 0 24px 50px rgba(0,0,0,.3), 0 0 60px rgba(140,246,210,.06);
            z-index: 3;
            font-family: var(--f-body);
          }
          .tab-mini-card .mc-hdr {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 10px;
          }
          .tab-mini-card .mc-title {
            font-family: var(--f-title); font-weight: 700; font-size: 11px;
            color: var(--tw-primary-soft); opacity: .9; letter-spacing: .5px;
          }
          .tab-mini-card .mc-date {
            font-size: 9px; color: rgba(140,246,210,.5);
          }
          .tab-mini-card .mc-row {
            display: flex; justify-content: space-between;
            padding: 6px 8px;
            background: rgba(140,246,210,.06);
            border: 1px solid rgba(140,246,210,.08);
            border-radius: 8px;
            margin-bottom: 4px;
          }
          .tab-mini-card .mc-nm {
            font-weight: 700; font-size: 10px; color: rgba(245,239,228,.9);
          }
          .tab-mini-card .mc-amt {
            font-family: var(--f-title); font-weight: 700; font-size: 11px;
            color: var(--tw-primary-soft);
          }
          .tab-mini-card .mc-total {
            display: flex; justify-content: space-between; align-items: baseline;
            margin-top: 8px; padding-top: 8px;
            border-top: 1px dashed rgba(140,246,210,.15);
          }
          .tab-mini-card .mc-total-lbl {
            font-size: 9px; color: rgba(140,246,210,.5);
            text-transform: uppercase; letter-spacing: 1px; font-weight: 700;
          }
          .tab-mini-card .mc-total-val {
            font-family: var(--f-title); font-weight: 700; font-size: 15px;
            color: var(--tw-primary-soft);
          }
          .tab-corner-glow {
            position: absolute;
            width: 300px; height: 300px;
            border-radius: 50%;
            filter: blur(60px);
            pointer-events: none;
            z-index: 0;
          }
        }
        @keyframes orbPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.06); opacity: .8; }
        }
      `}</style>
      {/* MOBILE */}
      <div className="vp-mobile">
        <div className="mob-page tw">
          <div className="mob-login-full">
            <nav className="mob-nav mob-nav-dark">
              <Link className="brand" href="/">
                <span className="mk"><Image src="/tutorlog-logo.png" alt="" width={32} height={32} /></span>
                <span className="wm">TutorLog</span>
              </Link>
            </nav>
            {mobileParticles.map((p, i) => (
              <div key={i} className={"login-particle pulse" + (p.glow ? " glow" : "")}
                style={{ left: p.x, top: p.y, width: p.s, height: p.s, ["--pd" as string]: p.pd, ["--po" as string]: p.po, ["--pt" as string]: p.pt, position: "absolute", borderRadius: "50%", background: "var(--tw-primary-soft)", zIndex: 2 }}
              />
            ))}
            <form action={sendMagicLink}>
              <div className="mob-login-card">
                <div style={{ marginBottom: 32 }}>
                  <h1 style={{ 
                    fontFamily: "var(--f-title)", 
                    fontWeight: 700, 
                    fontSize: 28, 
                    letterSpacing: "-0.02em", 
                    margin: "0 0 12px", 
                    color: "var(--tw-text)",
                    lineHeight: 1.15
                  }}>
                    Masuk ke TutorLog.
                  </h1>
                  <p className="lead" style={{ 
                    fontFamily: "var(--f-body)", 
                    fontSize: 14, 
                    color: "var(--tw-text-2)", 
                    margin: 0, 
                    lineHeight: 1.6 
                  }}>
                    Ketik email yang kamu pakai di app. Kami kirim link masuk — gak perlu password.
                  </p>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <div className="field" style={{ marginBottom: 10 }}>
                    <label 
                      htmlFor="email-mobile" 
                      style={{ 
                        display: "block",
                        fontFamily: "var(--f-body)", 
                        fontWeight: 600, 
                        fontSize: 13, 
                        color: "var(--tw-text)", 
                        marginBottom: 6 
                      }}
                    >
                      Email
                    </label>
                    <input
                      id="email-mobile"
                      name="email"
                      type="email"
                      required
                      className="input"
                      placeholder="nama@email.com"
                      style={{
                        width: "100%",
                        height: 48,
                        fontSize: 15,
                        padding: "0 14px",
                        borderRadius: "var(--r-md)",
                        background: "var(--tw-surface)",
                        border: "2px solid var(--tw-border)",
                        fontFamily: "var(--f-body)",
                        color: "var(--tw-text)",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                    />
                  </div>
                  <p style={{ 
                    fontFamily: "var(--f-body)", 
                    fontSize: 12, 
                    color: "var(--tw-text-3)", 
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    Belum punya akun? Link akan otomatis mendaftarkan kamu.
                  </p>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg" 
                    style={{ 
                      width: "100%", 
                      height: 48, 
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                    <span>Kirim Magic Link</span>
                  </button>
                </div>

                <div className="terms" style={{
                  fontFamily: "var(--f-body)", 
                  fontSize: 12, 
                  color: "var(--tw-text-3)", 
                  textAlign: "center",
                  lineHeight: 1.5
                }}>
                  Dengan masuk kamu setuju dengan <Link href="/privacy">Privacy Policy</Link> dan <Link href="/terms">Terms</Link>.
                </div>
              </div>
            </form>
            <div className="mob-login-quote">
              <h3>Data aman. Terstruktur.</h3>
              <p>Setiap sesi jadi titik dalam konstelasi pengajaranmu.</p>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="vp-desktop">
        <div className="login-wrap-v2">
          <div className="login-left-v2">
            {/* Tablet-only nav */}
            <nav className="tab-only-nav" style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 40px", alignItems: "center", zIndex: 20 }}>
              <Link className="brand" href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mk" style={{ width: 32, height: 32 }}><Image src="/tutorlog-logo.png" alt="" width={32} height={32} /></span>
                <span className="wm" style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 18, color: "var(--tw-primary-soft)" }}>TutorLog</span>
              </Link>
            </nav>

            {/* Tablet-only corner glows */}
            <div className="tab-only-particle tab-corner-glow" style={{ top: "-100px", left: "-100px", background: "radial-gradient(circle, rgba(140,246,210,.18) 0%, transparent 70%)" }} />
            <div className="tab-only-particle tab-corner-glow" style={{ bottom: "-100px", right: "-100px", background: "radial-gradient(circle, rgba(222,208,255,.12) 0%, transparent 70%)" }} />
            <div className="tab-only-particle tab-corner-glow" style={{ top: "40%", right: "-150px", background: "radial-gradient(circle, rgba(255,219,209,.08) 0%, transparent 70%)" }} />

            {/* Tablet-only background dots */}
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={`dot-${i}`} className="tab-bg-dot" style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                opacity: 0.25 + (i % 3) * 0.15,
              }} />
            ))}

            {/* Tablet-only concentric rings behind form */}
            <svg className="tab-only-rings login-rings" width="700" height="700" viewBox="0 0 700 700" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 1 }}>
              <circle cx="350" cy="350" r="120" fill="none" stroke="rgba(140,246,210,.08)" strokeWidth="1" />
              <circle cx="350" cy="350" r="200" fill="none" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
              <circle cx="350" cy="350" r="290" fill="none" stroke="rgba(140,246,210,.045)" strokeWidth="1" />
              <circle cx="350" cy="350" r="340" fill="none" stroke="rgba(140,246,210,.03)" strokeWidth="1" strokeDasharray="4 6" />
            </svg>

            {/* Tablet-only constellation lines */}
            <svg className="tab-only-conn login-connections" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}>
              <line x1="8%" y1="10%" x2="22%" y2="6%" stroke="rgba(140,246,210,.08)" strokeWidth="1" />
              <line x1="22%" y1="6%" x2="48%" y2="8%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
              <line x1="48%" y1="8%" x2="72%" y2="5%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
              <line x1="72%" y1="5%" x2="92%" y2="12%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="5%" y1="22%" x2="16%" y2="42%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="16%" y1="42%" x2="10%" y2="58%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
              <line x1="10%" y1="58%" x2="6%" y2="78%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="88%" y1="28%" x2="82%" y2="45%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="82%" y1="45%" x2="92%" y2="62%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="92%" y1="62%" x2="95%" y2="76%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="6%" y1="78%" x2="28%" y2="88%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="28%" y1="88%" x2="58%" y2="92%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
              <line x1="58%" y1="92%" x2="82%" y2="84%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
            </svg>

            {/* Tablet-only particles */}
            {tabParticles.map((p, i) => (
              <div key={`tab-p-${i}`} className="tab-only-particle login-particle pulse" style={{
                position: "absolute",
                left: p.x, top: p.y,
                width: p.s, height: p.s,
                borderRadius: "50%",
                background: "var(--tw-primary-soft)",
                zIndex: 3,
                ["--pd" as string]: p.pd, ["--po" as string]: p.po, ["--pt" as string]: p.pt,
              }} />
            ))}

            {/* Tablet-only floating icons — kept out of form vertical range */}
            <div className="tab-only-particle login-fi-dark df1" style={{ top: "18%", left: "6%" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div className="tab-only-particle login-fi-dark lav df2" style={{ top: "18%", right: "6%" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            </div>
            <div className="tab-only-particle login-fi-dark warm df3" style={{ bottom: "8%", right: "8%" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div className="tab-only-particle login-fi-dark df4" style={{ top: "6%", left: "40%" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <div className="tab-only-particle login-fi-dark df5" style={{ bottom: "6%", left: "42%" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
            </div>

            {/* Tablet-only stat nodes — top corners */}
            <div className="tab-only-particle login-stat-node fA" style={{ top: "8%", right: "6%" }}>
              <div className="sn-label">Bulan ini</div>
              <div className="sn-val">32 sesi</div>
              <div className="sn-sub">+6 dari Mei</div>
            </div>
            <div className="tab-only-particle login-stat-node fB" style={{ top: "8%", left: "6%" }}>
              <div className="sn-label">Pendapatan</div>
              <div className="sn-val">Rp 5.9jt</div>
              <div className="sn-sub">4 murid aktif</div>
            </div>

            {/* Tablet-only mini invoice card — bottom-left */}
            <div className="tab-only-particle tab-mini-card" style={{ bottom: "14%", left: "4%" }}>
              <div className="mc-hdr">
                <span className="mc-title">INV-2026/06-014</span>
                <span className="mc-date">Juni</span>
              </div>
              <div className="mc-row">
                <span className="mc-nm">Bintang W.</span>
                <span className="mc-amt">Rp 720rb</span>
              </div>
              <div className="mc-row">
                <span className="mc-nm">Kirana P.</span>
                <span className="mc-amt">Rp 360rb</span>
              </div>
              <div className="mc-total">
                <span className="mc-total-lbl">Total</span>
                <span className="mc-total-val">Rp 2.12jt</span>
              </div>
            </div>

            <form action={sendMagicLink} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="login-form" style={{ maxWidth: 420, width: "100%" }}>
                <div style={{ marginBottom: 48 }}>
                  <h1 style={{ 
                    fontFamily: "var(--f-title)", 
                    fontWeight: 700, 
                    fontSize: 36, 
                    letterSpacing: "-0.02em", 
                    margin: "0 0 16px", 
                    color: "var(--tw-text)",
                    lineHeight: 1.1
                  }}>
                    Masuk ke TutorLog.
                  </h1>
                  <p className="lead" style={{ 
                    fontFamily: "var(--f-body)", 
                    fontSize: 16, 
                    color: "var(--tw-text-2)", 
                    margin: 0, 
                    lineHeight: 1.6 
                  }}>
                    Ketik email yang kamu pakai di app. Kami kirim link masuk sekali pakai — gak perlu password.
                  </p>
                </div>

                <div style={{ marginBottom: 40 }}>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label 
                      htmlFor="email-desktop" 
                      style={{ 
                        display: "block",
                        fontFamily: "var(--f-body)", 
                        fontWeight: 600, 
                        fontSize: 14, 
                        color: "var(--tw-text)", 
                        marginBottom: 8 
                      }}
                    >
                      Email
                    </label>
                    <input
                      id="email-desktop"
                      name="email"
                      type="email"
                      required
                      className="input"
                      placeholder="nama@email.com"
                      style={{
                        width: "100%",
                        height: 52,
                        fontSize: 16,
                        padding: "0 16px",
                        borderRadius: "var(--r-md)",
                        background: "var(--tw-surface)",
                        border: "2px solid var(--tw-border)",
                        fontFamily: "var(--f-body)",
                        color: "var(--tw-text)",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                    />
                  </div>
                  <p style={{ 
                    fontFamily: "var(--f-body)", 
                    fontSize: 13, 
                    color: "var(--tw-text-3)", 
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    Belum punya akun? Link masuk akan otomatis mendaftarkan kamu.
                  </p>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg" 
                    style={{ 
                      width: "100%",
                      height: 52,
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                    <span>Kirim Magic Link</span>
                  </button>
                </div>

                <div className="terms" style={{ 
                  fontFamily: "var(--f-body)", 
                  fontSize: 13, 
                  color: "var(--tw-text-3)", 
                  textAlign: "center",
                  lineHeight: 1.5
                }}>
                  Dengan masuk kamu setuju dengan <Link href="/privacy">Privacy Policy</Link> dan <Link href="/terms">Terms</Link>.
                </div>
              </div>
            </form>

            {/* Tablet-only quote */}
            <div className="tab-only-quote" style={{ position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center", zIndex: 10, padding: "0 40px" }}>
              <h3 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 18, color: "var(--tw-primary-soft)", margin: "0 0 4px", letterSpacing: "-0.2px" }}>Data aman. Terstruktur.</h3>
              <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "rgba(245,239,228,.4)", margin: 0 }}>Setiap sesi jadi titik dalam konstelasi pengajaranmu.</p>
            </div>
          </div>
          <div className="login-right-v2">
            <div className="login-right-logo" style={{ position: "absolute", top: 40, left: 48, zIndex: 10, display: "flex", alignItems: "center", gap: 12 }}>
              <span className="mk" style={{ width: 40, height: 40, borderRadius: "var(--r-md)", overflow: "hidden" }}>
                <Image src="/tutorlog-logo.png" alt="" width={40} height={40} />
              </span>
              <span className="wm" style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 20, color: "#F5EFE4" }}>TutorLog</span>
            </div>
            {particles.map((p, i) => (
              <div key={i} className={"login-particle pulse" + (p.glow ? " glow" : "")}
                style={{ left: p.x, top: p.y, width: p.s, height: p.s, ["--pd" as string]: p.pd, ["--po" as string]: p.po, ["--pt" as string]: p.pt }}
              />
            ))}
            <svg className="login-connections" preserveAspectRatio="none">
              <line x1="15%" y1="8%" x2="42%" y2="14%" stroke="rgba(140,246,210,.08)" strokeWidth="1" />
              <line x1="42%" y1="14%" x2="62%" y2="12%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
              <line x1="62%" y1="12%" x2="85%" y2="18%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="8%" y1="28%" x2="30%" y2="38%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
              <line x1="22%" y1="52%" x2="55%" y2="65%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="55%" y1="65%" x2="72%" y2="78%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
              <line x1="78%" y1="35%" x2="68%" y2="48%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="12%" y1="72%" x2="38%" y2="82%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
              <line x1="68%" y1="48%" x2="88%" y2="55%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
              <line x1="38%" y1="82%" x2="48%" y2="90%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
              <line x1="72%" y1="78%" x2="90%" y2="85%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
            </svg>
            <div className="login-orb-wrap">
              <div className="login-orb"></div>
            </div>
            <svg className="login-rings" width="500" height="500" viewBox="0 0 500 500">
              <circle cx="250" cy="250" r="85" />
              <circle cx="250" cy="250" r="145" />
              <circle cx="250" cy="250" r="210" />
            </svg>
            <div className="login-glass-card">
              <div className="gc-hdr">
                <span className="gc-title">INV-2026/06-014</span>
                <span className="gc-date">Juni 2026</span>
              </div>
              <div className="gc-rows">
                <div className="gc-r">
                  <span>
                    <div className="nm">Bintang Wijaya</div>
                    <div className="meta">Matematika · 4 sesi</div>
                  </span>
                  <span className="amt">Rp 720rb</span>
                </div>
                <div className="gc-r">
                  <span>
                    <div className="nm">Bintang Wijaya</div>
                    <div className="meta">Fisika · 4 sesi</div>
                  </span>
                  <span className="amt">Rp 1.04jt</span>
                </div>
                <div className="gc-r">
                  <span>
                    <div className="nm">Kirana Putri</div>
                    <div className="meta">B. Inggris · 3 sesi</div>
                  </span>
                  <span className="amt">Rp 360rb</span>
                </div>
              </div>
              <div className="gc-total">
                <span className="lbl">Total</span>
                <span className="val">Rp 2.12jt</span>
              </div>
            </div>
            <div className="login-fi-dark df1" style={{ top: "12%", left: "10%" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div className="login-fi-dark lav df2" style={{ top: "58%", right: "8%" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            </div>
            <div className="login-fi-dark warm df3" style={{ top: "45%", left: "6%" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div className="login-fi-dark df4" style={{ top: "26%", right: "10%" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <div className="login-fi-dark df5" style={{ bottom: "28%", right: "18%" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
            </div>
            <div className="login-stat-node fA" style={{ top: "6%", right: "6%" }}>
              <div className="sn-label">Bulan ini</div>
              <div className="sn-val">32 sesi</div>
              <div className="sn-sub">+6 dari Mei</div>
            </div>
            <div className="login-stat-node fB" style={{ bottom: "10%", left: "6%" }}>
              <div className="sn-label">Pendapatan</div>
              <div className="sn-val">Rp 5.9jt</div>
              <div className="sn-sub">4 murid aktif</div>
            </div>
            <div className="login-right-quote">
              <h3>Data aman. Terstruktur.</h3>
              <p>Setiap sesi jadi titik dalam konstelasi pengajaranmu.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
