"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { sessionsToCSV, downloadCSV, type SessionRow } from "@/lib/csv";
import { canExport, recordExportEvent } from "@/lib/data/quota";
import PaywallDialog from "@/components/PaywallDialog";
import type { RekapData } from "@/lib/data/rekap";
import { formatCurrency } from "@/lib/format";

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

const DUMMY_ROWS: SessionRow[] = [
  { d: "03 Jun 2026", m: "Bintang Wijaya", s: "Matematika · Trigonometri", h: 1.5, t: "Rp 180.000", rawAmount: 180000 },
  { d: "05 Jun 2026", m: "Kirana Putri", s: "Bahasa Inggris · Speaking", h: 1.0, t: "Rp 120.000", rawAmount: 120000 },
  { d: "05 Jun 2026", m: "Bintang Wijaya", s: "Matematika · Latihan Soal", h: 1.5, t: "Rp 180.000", rawAmount: 180000 },
  { d: "10 Jun 2026", m: "Bintang Wijaya", s: "Fisika · Gerak Lurus", h: 2.0, t: "Rp 260.000", rawAmount: 260000 },
  { d: "11 Jun 2026", m: "Aditya Rahman", s: "Kimia · Stoikiometri", h: 1.5, t: "Rp 195.000", rawAmount: 195000 },
  { d: "12 Jun 2026", m: "Bintang Wijaya", s: "Matematika · Trigonometri", h: 1.5, t: "Rp 180.000", rawAmount: 180000 },
  { d: "15 Jun 2026", m: "Meilani Sari", s: "Matematika · Aljabar", h: 1.5, t: "Rp 180.000", rawAmount: 180000 },
  { d: "17 Jun 2026", m: "Bintang Wijaya", s: "Fisika · Hukum Newton", h: 2.0, t: "Rp 260.000", rawAmount: 260000 },
  { d: "19 Jun 2026", m: "Kirana Putri", s: "Bahasa Inggris · Grammar", h: 1.0, t: "Rp 120.000", rawAmount: 120000 },
  { d: "24 Jun 2026", m: "Bintang Wijaya", s: "Fisika · Energi & Usaha", h: 2.0, t: "Rp 260.000", rawAmount: 260000 },
  { d: "26 Jun 2026", m: "Bintang Wijaya", s: "Matematika · Review UH", h: 1.5, t: "Rp 180.000", rawAmount: 180000 },
  { d: "28 Jun 2026", m: "Meilani Sari", s: "Matematika · Persiapan UH", h: 1.5, t: "Rp 180.000", rawAmount: 180000 },
];

const DUMMY_BARS = [
  { m: "Jan", h: 32 }, { m: "Feb", h: 38 }, { m: "Mar", h: 28 },
  { m: "Apr", h: 42 }, { m: "Mei", h: 40 }, { m: "Jun", h: 48.5 },
];
const MAX_H = 50;

const STUDENT_COLORS = ["#D5EDE4", "#D5E0F5", "#F5E8D5", "#E8D5F5", "#F5D5E0", "#E0F5D5"];

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
  from: string;
  to: string;
}

export default function RekapContent({ rekapData, from, to }: RekapContentProps) {
  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(from);
  const [dateTo, setDateTo] = useState(to);

  const isDev = process.env.NODE_ENV === "development";
  const hasRealData = rekapData !== null && rekapData.sessions.length > 0;

  const allRows = useMemo(() => hasRealData ? rekapData!.sessions : (isDev ? DUMMY_ROWS : []), [hasRealData, isDev, rekapData]);

  const rows = useMemo(() => {
    let filtered = allRows;
    if (studentFilter) {
      filtered = filtered.filter((r) => r.m === studentFilter);
    }
    return filtered;
  }, [allRows, studentFilter]);

  const summary = useMemo(() => hasRealData
    ? rekapData!.summary
    : (isDev
      ? { totalSesi: 32, totalJam: 48.5, totalPendapatan: "Rp 5.9jt", totalMurid: 4, students: ["Bintang Wijaya", "Kirana Putri", "Aditya Rahman", "Meilani Sari"] }
      : { totalSesi: 0, totalJam: 0, totalPendapatan: "Rp 0", totalMurid: 0, students: [] }), [hasRealData, isDev, rekapData]);

  const filteredSummary = useMemo(() => {
    if (!studentFilter) return summary;
    const totalSesi = rows.length;
    const totalJam = Math.round(rows.reduce((sum, r) => sum + r.h, 0) * 10) / 10;
    const totalPendapatanRaw = rows.reduce((sum, r) => sum + (r.rawAmount ?? 0), 0);
    const totalMurid = new Set(rows.map((r) => r.m)).size;
    return {
      ...summary,
      totalSesi,
      totalJam,
      totalPendapatan: formatCurrency(totalPendapatanRaw),
      totalMurid,
      students: summary.students,
    };
  }, [studentFilter, rows, summary]);
  const rangeLabel = rekapData?.monthLabel ?? "";

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

  const handleDateChange = useCallback((newFrom: string, newTo: string) => {
    setDateFrom(newFrom);
    setDateTo(newTo);
    window.location.href = `/app/rekap?from=${newFrom}&to=${newTo}`;
  }, []);

  const fileSlug = "rekap-sesi";
  const fileSuffix = studentFilter ? `-${studentFilter.split(" ")[0].toLowerCase()}` : "";

  const handleExportCSV = useCallback(async () => {
    const { allowed } = await canExport("csv");
    if (!allowed) {
      setPaywallOpen(true);
      return;
    }
    setCsvLoading(true);
    setTimeout(() => {
      const filteredRows = rows.map(({ d, m, s, h, t }) => ({ d, m, s, h, t }));
      const csv = sessionsToCSV(filteredRows);
      downloadCSV(csv, `rekap-sesi-${fileSlug}${fileSuffix}.csv`);
      recordExportEvent("csv");
      setCsvLoading(false);
    }, 100);
  }, [rows, fileSlug, fileSuffix]);

  const handleExportPDF = useCallback(async () => {
    const { allowed } = await canExport("pdf");
    if (!allowed) {
      setPaywallOpen(true);
      return;
    }
    setPdfLoading(true);
    try {
      const { jsPDF } = await import("jspdf");

      const title = studentFilter
        ? `Rekap Sesi — ${studentFilter} · ${rangeLabel}`
        : `Rekap Sesi — ${rangeLabel}`;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const margin = 14;
      let y = margin;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(0, 108, 83);
      pdf.text(title, margin, y);
      y += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(109, 122, 116);
      pdf.text("Dibuat oleh TutorLog", margin, y);
      y += 10;

      const summaryRows = [
        ["Total Sesi", String(filteredSummary.totalSesi)],
        ["Total Jam", String(filteredSummary.totalJam)],
        ["Total Pendapatan", filteredSummary.totalPendapatan],
      ];

      const boxW = (pageW - margin * 2 - 16) / 3;
      summaryRows.forEach(([label, value], i) => {
        const bx = margin + i * (boxW + 8);
        pdf.setFillColor(237, 247, 243);
        pdf.roundedRect(bx, y, boxW, 18, 4, 4, "F");
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(109, 122, 116);
        pdf.text(label, bx + 4, y + 6);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(22, 29, 31);
        pdf.text(value, bx + 4, y + 14);
      });
      y += 24;

      const colX = [margin, margin + 30, margin + 70, margin + 122, margin + 144];
      const headers = ["Tanggal", "Siswa", "Sesi", "Durasi", "Tagihan"];

      pdf.setFillColor(237, 247, 243);
      pdf.rect(margin, y, pageW - margin * 2, 8, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(109, 122, 116);
      headers.forEach((h, i) => {
        pdf.text(h, colX[i], y + 5.5);
      });
      y += 9;

      pdf.setDrawColor(232, 239, 241);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(22, 29, 31);

      rows.forEach((r) => {
        if (y > 270) {
          pdf.addPage();
          y = margin;
        }
        pdf.line(margin, y, pageW - margin, y);
        pdf.text(r.d, colX[0], y + 5);
        pdf.setFont("helvetica", "bold");
        pdf.text(r.m, colX[1], y + 5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(62, 73, 68);
        pdf.text(r.s.length > 28 ? r.s.slice(0, 28) + "…" : r.s, colX[2], y + 5);
        pdf.setTextColor(22, 29, 31);
        pdf.text(r.h.toFixed(1).replace(".", ",") + " jam", colX[3], y + 5, { align: "right" });
        pdf.setTextColor(0, 108, 83);
        pdf.setFont("helvetica", "bold");
        pdf.text(r.t, colX[4], y + 5, { align: "right" });
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(22, 29, 31);
        y += 7;
      });

      y += 6;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(8);
      pdf.setTextColor(184, 203, 196);
      pdf.text("Generated by TutorLog", pageW - margin, y, { align: "right" });

      pdf.save(`rekap-sesi-${fileSlug}${fileSuffix}.pdf`);
      recordExportEvent("pdf");
    } catch {
      // silently fail
    }
    setPdfLoading(false);
  }, [fileSlug, fileSuffix, rows, filteredSummary, studentFilter, rangeLabel]);

  return (
    <>
      {/* MOBILE */}
      <div className="vp-mobile">
        <div className="mob-page tw">
          <div className="mob-app-shell">
            <div className="mob-app-main">
              <div className="mob-app-hdr">
                <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--f-body)", fontSize: 13, color: "var(--tw-primary)", textDecoration: "none", marginBottom: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5 M11 6l-6 6 6 6" /></svg>
                  Home
                </Link>
                <div className="top-row"><h1>Rekap Sesi</h1><div className="av">RN</div></div>
                <div className="sub" style={{ fontSize: 12, color: "var(--tw-text-2)" }}>{rangeLabel}</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, marginTop: 16 }}>
                <div onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.showPicker?.()} style={{ flex: 1, cursor: "pointer" }}>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => handleDateChange(e.target.value, dateTo)}
                    className="input"
                    style={{ height: 40, width: "100%", fontSize: 12, padding: "0 10px", borderRadius: "var(--r-md)", fontFamily: "var(--f-body)", border: "2px solid var(--tw-border)", background: "var(--tw-surface)", cursor: "pointer" }}
                  />
                </div>
                <span style={{ color: "var(--tw-text-3)", fontSize: 12, fontWeight: 700 }}>—</span>
                <div onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.showPicker?.()} style={{ flex: 1, cursor: "pointer" }}>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => handleDateChange(dateFrom, e.target.value)}
                    className="input"
                    style={{ height: 40, width: "100%", fontSize: 12, padding: "0 10px", borderRadius: "var(--r-md)", fontFamily: "var(--f-body)", border: "2px solid var(--tw-border)", background: "var(--tw-surface)", cursor: "pointer" }}
                  />
                </div>
              </div>

              <div className="mob-summary-card">
                <div className="mob-summary-top">
                  <div className="mob-summary-stat">
                    <div className="mob-summary-val">{filteredSummary.totalPendapatan}</div>
                    <div className="mob-summary-label">Pendapatan</div>
                  </div>
                  <div className="mob-summary-stats-sm">
                    <div><span className="v">{filteredSummary.totalSesi}</span><span className="l">Sesi</span></div>
                    <div><span className="v">{filteredSummary.totalJam}</span><span className="l">Jam</span></div>
                    <div><span className="v">{filteredSummary.totalMurid}</span><span className="l">Murid</span></div>
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
                <button type="button" className="mob-export-btn" onClick={handleExportPDF} disabled={pdfLoading}>
                  {pdfLoading ? <IcSpinner size={14} /> : <IcFile size={14} />}
                  <span>{pdfLoading ? "..." : "PDF"}</span>
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
              <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--f-body)", fontSize: 12, color: "var(--tw-primary)", textDecoration: "none", marginBottom: 8 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5 M11 6l-6 6 6 6" /></svg>
                Home
              </Link>
              <h1>Rekap Sesi</h1>
              <div className="sub">Ringkasan semua sesi les yang sudah tercatat dari app mobile.</div>
            </div>
            <div className="export-row">
              <button type="button" className="export-btn" onClick={handleExportCSV} disabled={csvLoading}>
                {csvLoading ? <IcSpinner size={16} /> : <IcDownload size={16} />}
                <span>{csvLoading ? "Mengekspor..." : "Export CSV"}</span>
              </button>
              <button type="button" className="export-btn" onClick={handleExportPDF} disabled={pdfLoading}>
                {pdfLoading ? <IcSpinner size={16} /> : <IcFile size={16} />}
                <span>{pdfLoading ? "Mengekspor..." : "Export PDF"}</span>
                <span className="quota">1 tersisa</span>
              </button>
            </div>
          </div>

          <div className="rekap-toolbar">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 13, fontFamily: "var(--f-body)", color: "var(--tw-text-2)", fontWeight: 600 }}>{rangeLabel}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.showPicker?.()} style={{ cursor: "pointer" }}>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => handleDateChange(e.target.value, dateTo)}
                    className="input"
                    style={{ height: 44, width: 150, fontSize: 13, padding: "0 14px", borderRadius: "var(--r-md)", fontFamily: "var(--f-body)", border: "2px solid var(--tw-border)", background: "var(--tw-surface)", cursor: "pointer" }}
                  />
                </div>
                <span style={{ color: "var(--tw-text-3)", fontSize: 13, fontWeight: 700 }}>—</span>
                <div onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.showPicker?.()} style={{ cursor: "pointer" }}>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => handleDateChange(dateFrom, e.target.value)}
                    className="input"
                    style={{ height: 44, width: 150, fontSize: 13, padding: "0 14px", borderRadius: "var(--r-md)", fontFamily: "var(--f-body)", border: "2px solid var(--tw-border)", background: "var(--tw-surface)", cursor: "pointer" }}
                  />
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
              <div className="val">{filteredSummary.totalSesi}</div>
              <div className="foot">{rangeLabel || "Bulan ini"}</div>
            </div>
            <div className="stat-card">
              <div className="lbl">Total Jam</div>
              <div className="val">{filteredSummary.totalJam}</div>
              <div className="foot">{filteredSummary.totalMurid} murid</div>
            </div>
            <div className="stat-card">
              <div className="lbl">Total Pendapatan</div>
              <div className="val">{filteredSummary.totalPendapatan}</div>
              <div className="foot">{filteredSummary.totalSesi} sesi</div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="tw-title-md">Detail Sesi</div>
              <div className="tw-helper">Menampilkan {rows.length} dari {allRows.length} sesi</div>
            </div>
            <div style={{ overflowX: "auto" }}>
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
          </div>
        </main>
      </div>

      <PaywallDialog open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}