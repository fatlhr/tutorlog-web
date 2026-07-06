"use client";

import { useCallback } from "react";
import { sessionsToCSV, downloadCSV, type SessionRow } from "@/lib/csv";

const IcChevL = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
);
const IcChevR = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
);
const IcDownload = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" /></svg>
);
const IcFile = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5" /></svg>
);

const rows: SessionRow[] = [
  { d: "03 Jun 2026", m: "Bintang Wijaya", s: "Matematika · Trigonometri", h: 1.5, t: "Rp 180.000" },
  { d: "05 Jun 2026", m: "Kirana Putri", s: "Bahasa Inggris · Speaking", h: 1.0, t: "Rp 120.000" },
  { d: "05 Jun 2026", m: "Bintang Wijaya", s: "Matematika · Latihan Soal", h: 1.5, t: "Rp 180.000" },
  { d: "10 Jun 2026", m: "Bintang Wijaya", s: "Fisika · Gerak Lurus", h: 2.0, t: "Rp 260.000" },
  { d: "11 Jun 2026", m: "Aditya Rahman", s: "Kimia · Stoikiometri", h: 1.5, t: "Rp 195.000" },
  { d: "12 Jun 2026", m: "Bintang Wijaya", s: "Matematika · Trigonometri", h: 1.5, t: "Rp 180.000" },
  { d: "15 Jun 2026", m: "Meilani Sari", s: "Matematika · Aljabar", h: 1.5, t: "Rp 180.000" },
  { d: "17 Jun 2026", m: "Bintang Wijaya", s: "Fisika · Hukum Newton", h: 2.0, t: "Rp 260.000" },
  { d: "19 Jun 2026", m: "Kirana Putri", s: "Bahasa Inggris · Grammar", h: 1.0, t: "Rp 120.000" },
  { d: "24 Jun 2026", m: "Bintang Wijaya", s: "Fisika · Energi & Usaha", h: 2.0, t: "Rp 260.000" },
  { d: "26 Jun 2026", m: "Bintang Wijaya", s: "Matematika · Review UH", h: 1.5, t: "Rp 180.000" },
  { d: "28 Jun 2026", m: "Meilani Sari", s: "Matematika · Persiapan UH", h: 1.5, t: "Rp 180.000" },
];

const groups = [
  { date: "28 Jun", items: [
    { m: "Meilani Sari", s: "Matematika · Persiapan UH", h: 1.5, t: "Rp 180.000", initials: "MS", color: "#E8D5F5" },
  ]},
  { date: "26 Jun", items: [
    { m: "Bintang Wijaya", s: "Matematika · Review UH", h: 1.5, t: "Rp 180.000", initials: "BW", color: "#D5EDE4" },
  ]},
  { date: "24 Jun", items: [
    { m: "Bintang Wijaya", s: "Fisika · Energi & Usaha", h: 2.0, t: "Rp 260.000", initials: "BW", color: "#D5EDE4" },
    { m: "Kirana Putri", s: "B. Inggris · Grammar", h: 1.0, t: "Rp 120.000", initials: "KP", color: "#D5E0F5" },
  ]},
  { date: "17 Jun", items: [
    { m: "Bintang Wijaya", s: "Fisika · Hukum Newton", h: 2.0, t: "Rp 260.000", initials: "BW", color: "#D5EDE4" },
  ]},
  { date: "15 Jun", items: [
    { m: "Meilani Sari", s: "Matematika · Aljabar", h: 1.5, t: "Rp 180.000", initials: "MS", color: "#E8D5F5" },
  ]},
  { date: "12 Jun", items: [
    { m: "Bintang Wijaya", s: "Matematika · Trigonometri", h: 1.5, t: "Rp 180.000", initials: "BW", color: "#D5EDE4" },
    { m: "Aditya Rahman", s: "Kimia · Stoikiometri", h: 1.5, t: "Rp 195.000", initials: "AR", color: "#F5E8D5" },
  ]},
  { date: "10 Jun", items: [
    { m: "Bintang Wijaya", s: "Fisika · Gerak Lurus", h: 2.0, t: "Rp 260.000", initials: "BW", color: "#D5EDE4" },
  ]},
];

const bars = [
  { m: "Jan", h: 32 }, { m: "Feb", h: 38 }, { m: "Mar", h: 28 },
  { m: "Apr", h: 42 }, { m: "Mei", h: 40 }, { m: "Jun", h: 48.5 },
];
const maxH = 50;

export default function RekapContent() {
  const handleExportCSV = useCallback(() => {
    const csv = sessionsToCSV(rows);
    downloadCSV(csv, "rekap-sesi-juni-2026.csv");
  }, []);

  return (
    <>
      {/* MOBILE */}
      <div className="vp-mobile">
        <div className="mob-page tw">
          <div className="mob-app-shell">
            <div className="mob-app-main">
              <div className="mob-app-hdr">
                <div className="top-row"><h1>Rekap Sesi</h1><div className="av">RN</div></div>
                <div className="sub">Rina Novianti</div>
              </div>

              <div className="mob-month-picker">
                <button type="button" aria-label="Bulan sebelumnya"><IcChevL /></button>
                <span className="m">Juni 2026</span>
                <button type="button" aria-label="Bulan berikutnya"><IcChevR /></button>
              </div>

              <div className="mob-summary-card">
                <div className="mob-summary-top">
                  <div className="mob-summary-stat">
                    <div className="mob-summary-val">Rp 5.9jt</div>
                    <div className="mob-summary-label">Pendapatan</div>
                  </div>
                  <div className="mob-summary-stats-sm">
                    <div><span className="v">32</span><span className="l">Sesi</span></div>
                    <div><span className="v">48,5</span><span className="l">Jam</span></div>
                    <div><span className="v">4</span><span className="l">Murid</span></div>
                  </div>
                </div>
                <div className="mob-mini-chart">
                  {bars.map((b, i) => (
                    <div key={i} className="mob-mini-bar-col">
                      <div className="mob-mini-bar-track">
                        <div
                          className={"mob-mini-bar" + (i === bars.length - 1 ? " active" : "")}
                          style={{ height: (b.h / maxH) * 100 + "%" }}
                        ></div>
                      </div>
                      <span className="mob-mini-bar-label">{b.m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mob-export-bar">
                <button type="button" className="mob-export-btn" onClick={handleExportCSV}>
                  <IcDownload size={14} /><span>CSV</span>
                </button>
                <button type="button" className="mob-export-btn">
                  <IcFile size={14} /><span>PDF</span>
                  <span style={{ fontSize: 9, fontWeight: 700, background: "var(--tw-warning-soft)", color: "var(--tw-warning)", padding: "1px 6px", borderRadius: 99 }}>1×</span>
                </button>
              </div>

              <div className="mob-filter-row">
                <span className="mob-chip on">Semua</span>
                <span className="mob-chip">Bintang</span>
                <span className="mob-chip">Kirana</span>
                <span className="mob-chip">Aditya</span>
                <span className="mob-chip">Meilani</span>
              </div>

              <div className="mob-session-groups">
                {groups.map((g, gi) => (
                  <div key={gi} className="mob-session-group">
                    <div className="mob-group-date">{g.date}</div>
                    {g.items.map((r, ri) => (
                      <div key={ri} className="mob-session-row">
                        <div className="mob-session-avatar" style={{ background: r.color }}>
                          <span>{r.initials}</span>
                        </div>
                        <div className="mob-session-info">
                          <div className="mob-session-name">{r.m}</div>
                          <div className="mob-session-subj">{r.s}</div>
                        </div>
                        <div className="mob-session-end">
                          <div className="mob-session-amt">{r.t}</div>
                          <div className="mob-session-hrs">{r.h.toFixed(1)} jam</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", padding: "14px 0", fontFamily: "var(--f-body)", fontSize: 12, color: "var(--tw-text-3)" }}>
                Menampilkan 9 dari 32 sesi
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
              <h1>Rekap Sesi</h1>
              <div className="sub">Ringkasan semua sesi les yang sudah tercatat dari app mobile.</div>
            </div>
            <div className="export-row">
              <button type="button" className="export-btn" onClick={handleExportCSV}>
                <IcDownload size={16} />
                <span>Export CSV</span>
              </button>
              <button type="button" className="export-btn">
                <IcFile size={16} />
                <span>Export PDF</span>
                <span className="quota">1 tersisa</span>
              </button>
            </div>
          </div>

          <div className="rekap-toolbar">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="month-picker">
                <button type="button" aria-label="Bulan sebelumnya"><IcChevL size={18} /></button>
                <span className="m">Juni 2026</span>
                <button type="button" aria-label="Bulan berikutnya"><IcChevR size={18} /></button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="input" style={{ height: 44, width: 150, fontSize: 13, padding: "0 14px", borderRadius: "var(--r-md)" }}>
                  01 Jun 2026
                </div>
                <span style={{ color: "var(--tw-text-3)", fontSize: 13, fontWeight: 700 }}>—</span>
                <div className="input" style={{ height: 44, width: 150, fontSize: 13, padding: "0 14px", borderRadius: "var(--r-md)" }}>
                  30 Jun 2026
                </div>
              </div>
            </div>
            <div className="seg">
              <button type="button" className="on">Semua</button>
              <button type="button">Bintang</button>
              <button type="button">Kirana</button>
              <button type="button">Aditya</button>
              <button type="button">Meilani</button>
            </div>
          </div>

          <div className="stat-row" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="lbl">Total Sesi</div>
              <div className="val">32</div>
              <div className="foot"><span className="accent">+6</span> dari Mei</div>
            </div>
            <div className="stat-card">
              <div className="lbl">Total Jam</div>
              <div className="val">48,5</div>
              <div className="foot"><span className="accent">+8,5 jam</span> dari Mei</div>
            </div>
            <div className="stat-card">
              <div className="lbl">Total Pendapatan</div>
              <div className="val">Rp 5.9jt</div>
              <div className="foot"><span className="accent">+Rp 900rb</span> dari Mei</div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="tw-title-md">Detail Sesi</div>
              <div className="tw-helper">Menampilkan 12 dari 32 sesi</div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 24 }}>Tanggal</th>
                  <th>Murid</th>
                  <th>Sesi</th>
                  <th className="right">Jam</th>
                  <th className="right" style={{ paddingRight: 24 }}>Tagihan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ paddingLeft: 24 }}>{r.d}</td>
                    <td style={{ fontWeight: 700 }}>{r.m}</td>
                    <td style={{ color: "var(--tw-text-2)" }}>{r.s}</td>
                    <td className="right"><span className="mono">{r.h.toFixed(1)}</span></td>
                    <td className="right" style={{ paddingRight: 24 }}><span className="mono" style={{ color: "var(--tw-primary)" }}>{r.t}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}