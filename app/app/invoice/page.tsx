"use client";

import Link from "next/link";

const MonitorIcon = () => (
  <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8 M12 17v4" />
  </svg>
);

const IcLock = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const IcArrowL = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5 M11 6l-6 6 6 6" />
  </svg>
);

export default function InvoicePage() {
  return (
    <>
      {/* MOBILE */}
      <div className="vp-mobile">
        <div className="mob-page tw">
          <div className="mob-app-shell">
            <div className="mob-dialog-scrim">
              <div className="mob-dialog-card">
                <div className="mob-dialog-icon"><MonitorIcon /></div>
                <h2 className="mob-dialog-title">Buka di Desktop</h2>
                <p className="mob-dialog-desc">Invoice Builder dirancang untuk layar lebar. Buka di laptop atau PC untuk pengalaman terbaik.</p>
                <div className="mob-dialog-url">
                  <IcLock />
                  <span>web.tutorlog.id</span>
                </div>
                <div className="mob-dialog-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ width: "100%" }}
                    onClick={() => navigator.clipboard.writeText("https://web.tutorlog.id")}
                  >
                    Salin Link
                  </button>
                  <Link href="/app/rekap" className="btn btn-ghost btn-sm" style={{ width: "100%" }}>
                    <IcArrowL />
                    <span>Kembali ke Rekap</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="vp-desktop">
        <main className="app-main">
          <div className="app-header">
            <div>
              <h1>Invoice Builder</h1>
              <div className="sub">Pilih murid & rentang tanggal — semua sesi akan otomatis dimasukkan.</div>
            </div>
          </div>
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <div className="tw-title-md" style={{ marginBottom: 8 }}>Segera hadir</div>
            <div className="tw-helper">Invoice Builder akan dibangun di Task 5.2</div>
          </div>
        </main>
      </div>
    </>
  );
}