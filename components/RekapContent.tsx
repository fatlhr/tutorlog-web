"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sessionsToCSV, downloadCSV, type SessionRow } from "@/lib/csv";
import type { RekapData } from "@/lib/data/rekap";

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
const IcSpinner = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// Fallback dummy data (matches design exactly — dev only)
const DUMMY_ROWS: SessionRow[] = [
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

const DUMMY_BARS = [
  { m: "Jan", h: 32 }, { m: "Feb", h: 38 }, { m: "Mar", h: 28 },
  { m: "Apr", h: 42 }, { m: "Mei", h: 40 }, { m: "Jun", h: 48.5 },
];
const MAX_H = 50;

const STUDENT_COLORS = ["#D5EDE4", "#D5E0F5", "#F5E8D5", "#E8D5F5", "#F5D5E0", "#E0F5D5"];

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function shortDate(d: string): string {
  const parts = d.split(" ");
  if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
  return d;
}

interface RekapContentProps {
  rekapData: RekapData | null;
  year: number;
  month: number;
}

export default function RekapContent({ rekapData, year, month }: RekapContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  const isDev = process.env.NODE_ENV === "development";
  const hasRealData = rekapData !== null && rekapData.sessions.length > 0;

  const allRows = useMemo(() => hasRealData ? rekapData!.sessions : (isDev ? DUMMY_ROWS : []), [hasRealData, isDev, rekapData]);
  const rows = useMemo(() => {
    if (!studentFilter) return allRows;
    return allRows.filter((r) => r.m === studentFilter);
  }, [allRows, studentFilter]);

  const summary = hasRealData
    ? rekapData!.summary
    : (isDev
      ? { totalSesi: 32, totalJam: 48.5, totalPendapatan: "Rp 5.9jt", totalMurid: 4, students: ["Bintang Wijaya", "Kirana Putri", "Aditya Rahman", "Meilani Sari"] }
      : { totalSesi: 0, totalJam: 0, totalPendapatan: "Rp 0", totalMurid: 0, students: [] });
  const monthLabel = `${MONTHS[month - 1]} ${year}`;

  const studentColors = useMemo(() => {
    const map = new Map<string, string>();
    summary.students.forEach((name, i) => {
      map.set(name, STUDENT_COLORS[i % STUDENT_COLORS.length]);
    });
    return map;
  }, [summary.students]);

  const mobileGroups = useMemo(() => {
    const groups = new Map<string, typeof rows>();
    rows.forEach((r) => {
      const sd = shortDate(r.d);
      if (!groups.has(sd)) groups.set(sd, []);
      groups.get(sd)!.push(r);
    });
    return Array.from(groups.entries()).map(([date, items]) => ({
      date,
      items: items.map((r) => ({
        ...r,
        initials: initialsOf(r.m),
        color: studentColors.get(r.m) ?? STUDENT_COLORS[0],
      })),
    }));
  }, [rows, studentColors]);

  const bars = DUMMY_BARS;

  const goToMonth = useCallback((dir: -1 | 1) => {
    startTransition(() => {
      let m = month + dir;
      let y = year;
      if (m < 1) { m = 12; y--; }
      if (m > 12) { m = 1; y++; }
      router.push(`/app/rekap?month=${y}-${String(m).padStart(2, "0")}`);
    });
  }, [month, year, router]);

  const handleExportCSV = useCallback(() => {
    setCsvLoading(true);
    // Small delay so the loading state is visible even for fast operations
    setTimeout(() => {
      const csv = sessionsToCSV(rows);
      downloadCSV(csv, `rekap-sesi-${monthLabel.toLowerCase().replace(/\s+/g, "-")}.csv`);
      setCsvLoading(false);
    }, 100);
  }, [rows, monthLabel]);

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
                <button type="button" aria-label="Bulan sebelumnya" onClick={() => goToMonth(-1)} disabled={isPending}><IcChevL /></button>
                <span className="m">{monthLabel}</span>
                <button type="button" aria-label="Bulan berikutnya" onClick={() => goToMonth(1)} disabled={isPending}><IcChevR /></button>
              </div>

              <div className="mob-summary-card">
                <div className="mob-summary-top">
                  <div className="mob-summary-stat">
                    <div className="mob-summary-val">{summary.totalPendapatan}</div>
                    <div className="mob-summary-label">Pendapatan</div>
                  </div>
                  <div className="mob-summary-stats-sm">
                    <div><span className="v">{summary.totalSesi}</span><span className="l">Sesi</span></div>
                    <div><span className="v">{summary.totalJam}</span><span className="l">Jam</span></div>
                    <div><span className="v">{summary.totalMurid}</span><span className="l">Murid</span></div>
                  </div>
                </div>
                <div className="mob-mini-chart">
                  {bars.map((b, i) => (
                    <div key={i} className="mob-mini-bar-col">
                      <div className="mob-mini-bar-track">
                        <div
                          className={"mob-mini-bar" + (i === bars.length - 1 ? " active" : "")}
                          style={{ height: (b.h / MAX_H) * 100 + "%" }}
                        ></div>
                      </div>
                      <span className="mob-mini-bar-label">{b.m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mob-export-bar">
                <button type="button" className="mob-export-btn" onClick={handleExportCSV} disabled={csvLoading}>
                  {csvLoading ? <IcSpinner size={14} /> : <IcDownload size={14} />}
                  <span>{csvLoading ? "..." : "CSV"}</span>
                </button>
                <button type="button" className="mob-export-btn">
                  <IcFile size={14} /><span>PDF</span>
                  <span style={{ fontSize: 9, fontWeight: 700, background: "var(--tw-warning-soft)", color: "var(--tw-warning)", padding: "1px 6px", borderRadius: 99 }}>1×</span>
                </button>
              </div>

              <div className="mob-filter-row">
                <span className={`mob-chip${studentFilter === null ? " on" : ""}`} onClick={() => setStudentFilter(null)}>Semua</span>
                {summary.students.map((s) => (
                  <span key={s} className={`mob-chip${studentFilter === s ? " on" : ""}`} onClick={() => setStudentFilter(s)}>{s.split(" ")[0]}</span>
                ))}
              </div>

              <div className="mob-session-groups">
                {rows.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 16px", fontFamily: "var(--f-body)", fontSize: 14, color: "var(--tw-text-3)" }}>
                    Belum ada sesi di bulan ini.
                  </div>
                ) : (
                  mobileGroups.map((g, gi) => (
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
                  ))
                )}
              </div>

              <div style={{ textAlign: "center", padding: "14px 0", fontFamily: "var(--f-body)", fontSize: 12, color: "var(--tw-text-3)" }}>
                Menampilkan {rows.length} dari {allRows.length} sesi
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
              <button type="button" className="export-btn" onClick={handleExportCSV} disabled={csvLoading}>
                {csvLoading ? <IcSpinner size={16} /> : <IcDownload size={16} />}
                <span>{csvLoading ? "Mengekspor..." : "Export CSV"}</span>
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
                <button type="button" aria-label="Bulan sebelumnya" onClick={() => goToMonth(-1)} disabled={isPending}><IcChevL size={18} /></button>
                <span className="m">{monthLabel}</span>
                <button type="button" aria-label="Bulan berikutnya" onClick={() => goToMonth(1)} disabled={isPending}><IcChevR size={18} /></button>
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
              <button type="button" className={studentFilter === null ? "on" : ""} onClick={() => setStudentFilter(null)}>Semua</button>
              {summary.students.map((s) => (
                <button type="button" key={s} className={studentFilter === s ? "on" : ""} onClick={() => setStudentFilter(s)}>{s.split(" ")[0]}</button>
              ))}
            </div>
          </div>

          <div className="stat-row" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="lbl">Total Sesi</div>
              <div className="val">{summary.totalSesi}</div>
              <div className="foot">Bulan {monthLabel}</div>
            </div>
            <div className="stat-card">
              <div className="lbl">Total Jam</div>
              <div className="val">{summary.totalJam}</div>
              <div className="foot">{summary.totalMurid} murid</div>
            </div>
            <div className="stat-card">
              <div className="lbl">Total Pendapatan</div>
              <div className="val">{summary.totalPendapatan}</div>
              <div className="foot">{summary.totalSesi} sesi</div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="tw-title-md">Detail Sesi</div>
              <div className="tw-helper">Menampilkan {rows.length} dari {allRows.length} sesi</div>
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
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "32px 24px", textAlign: "center", fontFamily: "var(--f-body)", fontSize: 14, color: "var(--tw-text-3)" }}>
                      Belum ada sesi di bulan ini.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ paddingLeft: 24 }}>{r.d}</td>
                    <td style={{ fontWeight: 700 }}>{r.m}</td>
                    <td style={{ color: "var(--tw-text-2)" }}>{r.s}</td>
                    <td className="right"><span className="mono">{r.h.toFixed(1)}</span></td>
                    <td className="right" style={{ paddingRight: 24 }}><span className="mono" style={{ color: "var(--tw-primary)" }}>{r.t}</span></td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}