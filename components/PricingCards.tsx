"use client";

import Link from "next/link";

interface PricingCardsProps {
  variant: "home" | "harga";
}

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg>
);

const CheckIconLg = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 6 9 17l-5-5" /></svg>
);

const ExtIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3" /></svg>
);

const LYNK_URL = "https://lynk.id/tutorlog";

const freeFeatures = ["Rekap bulanan lengkap", "Filter per murid", "Export PDF rekap (1×/bulan)", "Export CSV (1×/bulan)", "Invoice builder (preview only)"];
const plusFeatures = ["Semua fitur Free", "Export invoice PDF tanpa batas", "Export rekap tanpa batas", "3 template + kustom warna", "Prioritas dukungan WA"];
const bulkFeatures = ["Semua fitur PLUS", "Bayar per bulan, tanpa komitmen", "Bisa berhenti kapan saja"];

const desktopFreeFeatures = ["Rekap bulanan lengkap", "Filter per murid", "Export PDF rekap (1×/bulan)", "Export CSV rekap (1×/bulan)", "Invoice builder (preview only)"];
const desktopPlusFeatures = ["Semua fitur Free", "Export invoice PDF tanpa batas", "Export rekap PDF & CSV tanpa batas", "3 template invoice + kustom warna", "Simpan rekening + template favorit", "Prioritas dukungan via WhatsApp"];
const desktopBulkFeatures = ["Semua fitur PLUS", "Bayar per bulan", "Bisa berhenti kapan saja"];

export default function PricingCards({ variant }: PricingCardsProps) {
  const isHome = variant === "home";

  return (
    <>
      {/* MOBILE */}
      <div className="vp-mobile">
        <div className="mob-price-card mob-price-card--free" style={{ marginBottom: 16, ...(isHome ? { border: "2px solid var(--tw-primary)" } : {}) }}>
          <div className="mob-price-header">
            {isHome ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="mob-price-tier">Free</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--tw-primary)", background: "var(--tw-secondary-soft)", padding: "2px 8px", borderRadius: 99 }}>Plan saat ini</span>
              </div>
            ) : (
              <span className="mob-price-tier">Free</span>
            )}
            <div className="mob-price-amount">
              <span className="mob-price-currency">Rp</span>
              <span className="mob-price-value">0</span>
            </div>
            <span className="mob-price-period">selamanya</span>
          </div>
          <div className="mob-price-divider"></div>
          <ul className="mob-price-features">
            {freeFeatures.map((f, i) => (
              <li key={i}><span className="mob-price-check"><CheckIcon /></span>{f}</li>
            ))}
          </ul>
          {isHome ? (
            <button type="button" className="btn btn-secondary btn-sm" disabled style={{ width: "100%", opacity: .6, cursor: "not-allowed" }}>Paket saat ini</button>
          ) : (
            <Link className="btn btn-secondary btn-sm" href="/login" style={{ width: "100%" }}>Mulai Gratis</Link>
          )}
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
            {plusFeatures.map((f, i) => (
              <li key={i}><span className="mob-price-check"><CheckIcon /></span>{f}</li>
            ))}
          </ul>
          <a href={LYNK_URL} target="_blank" rel="noopener" className="btn btn-primary btn-sm"
            style={{ width: "100%", background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)", gap: 6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Pilih Selamanya
              <ExtIcon size={14} />
            </span>
          </a>
        </div>

        <div className="mob-price-card mob-price-card--free" style={{ borderColor: "var(--tw-primary-soft)", marginBottom: 16 }}>
          <div className="mob-price-header">
            <span className="mob-price-tier">PLUS Bulanan</span>
            <div style={{ fontSize: 11, color: "#b91c1c", fontWeight: 600, background: "rgba(239,68,68,.1)", padding: "2px 8px", borderRadius: 4, display: "inline-block", marginBottom: 4 }}>Hemat 53%</div>
            <div style={{ fontSize: 14, textDecoration: "line-through", color: "#b91c1c", marginBottom: 2, fontWeight: 500 }}>Rp 19rb</div>
            <div className="mob-price-amount">
              <span className="mob-price-currency">Rp</span>
              <span className="mob-price-value">9rb</span>
            </div>
            <span className="mob-price-period">per bulan</span>
          </div>
          <div className="mob-price-divider"></div>
          <ul className="mob-price-features">
            {bulkFeatures.map((f, i) => (
              <li key={i}><span className="mob-price-check"><CheckIcon /></span>{f}</li>
            ))}
          </ul>
          <a href={LYNK_URL} target="_blank" rel="noopener" className="btn btn-secondary btn-sm" style={{ width: "100%" }}>Pilih Bulanan</a>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="vp-desktop">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          <div className="card" style={{ padding: "32px 28px", display: "flex", flexDirection: "column", ...(isHome ? { border: "2px solid var(--tw-primary)" } : {}) }}>
            {isHome ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 13, color: "var(--tw-text-3)", letterSpacing: ".5px", textTransform: "uppercase" }}>Free</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--tw-primary)", background: "var(--tw-secondary-soft)", padding: "2px 10px", borderRadius: 99 }}>Plan saat ini</span>
              </div>
            ) : (
              <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 13, color: "var(--tw-text-3)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>Free</div>
            )}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, color: "var(--tw-text)" }}>Rp 0</div>
              <div style={{ fontSize: 13, color: "var(--tw-text-3)", marginTop: 4 }}>/ selamanya</div>
            </div>
            <p style={{ fontSize: 14, color: "var(--tw-text-2)", marginBottom: 24, lineHeight: 1.6 }}>Untuk tutor yang baru mulai atau mengelola sedikit murid.</p>
            <ul style={{ paddingLeft: 0, margin: "0 0 32px", listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {desktopFreeFeatures.map((f, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "var(--r-full)", background: "var(--tw-secondary-soft)", color: "var(--tw-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 20px", marginTop: 1 }}>
                    <CheckIconLg />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "auto" }}>
              {isHome ? (
                <button type="button" className="btn btn-secondary btn-lg" disabled style={{ width: "100%", opacity: .6, cursor: "not-allowed" }}>Paket saat ini</button>
              ) : (
                <Link className="btn btn-secondary btn-lg" href="/login" style={{ width: "100%" }}>Mulai Gratis</Link>
              )}
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
              {desktopPlusFeatures.map((f, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "var(--r-full)", background: "rgba(140,246,210,.12)", color: "var(--tw-primary-soft)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 20px", marginTop: 1 }}>
                    <CheckIconLg />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "auto" }}>
              <a href={LYNK_URL} target="_blank" rel="noopener" className="btn btn-primary btn-lg"
                style={{ width: "100%", padding: "0 24px", background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)", gap: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Pilih Selamanya
                  <ExtIcon size={16} />
                </span>
              </a>
            </div>
          </div>

          <div className="card" style={{ padding: "32px 28px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 13, color: "var(--tw-text-3)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>PLUS Bulanan</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#b91c1c", fontWeight: 600, fontFamily: "var(--f-body)", background: "rgba(239,68,68,.1)", padding: "2px 10px", borderRadius: 4, display: "inline-block", marginBottom: 4 }}>Hemat 53%</div>
              <div style={{ fontSize: 16, textDecoration: "line-through", color: "#b91c1c", marginBottom: 2, fontWeight: 500 }}>Rp 19rb</div>
              <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 36, color: "var(--tw-text)" }}>Rp 9rb</div>
              <div style={{ fontSize: 13, color: "var(--tw-text-3)", marginTop: 4 }}>/ bulan</div>
            </div>
            <p style={{ fontSize: 14, color: "var(--tw-text-2)", marginBottom: 24, lineHeight: 1.6 }}>Alternatif fleksibel — bayar bulanan, tanpa komitmen jangka panjang.</p>
            <ul style={{ paddingLeft: 0, margin: "0 0 32px", listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {desktopBulkFeatures.map((f, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "var(--r-full)", background: "var(--tw-secondary-soft)", color: "var(--tw-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 20px", marginTop: 1 }}>
                    <CheckIconLg />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "auto" }}>
              <a href={LYNK_URL} target="_blank" rel="noopener" className="btn btn-secondary btn-lg" style={{ width: "100%" }}>Pilih Bulanan</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}