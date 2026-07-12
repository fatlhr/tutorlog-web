"use client";

import { useCallback, useMemo, useState } from "react";
import { FileCsv, FilePdf } from "@phosphor-icons/react";
import { sessionsToCSV, downloadCSV } from "@/lib/csv";
import { canExport, recordExportEvent } from "@/lib/data/quota";
import PaywallDialog from "@/components/PaywallDialog";
import type { RekapData } from "@/lib/data/rekap";
import { formatCurrency } from "@/lib/format";

const STUDENT_COLORS = ["#D5EDE4", "#D5E0F5", "#F5E8D5", "#E8D5F5", "#F5D5E0", "#E0F5D5"];

type RangeMode = "current" | "previous" | "custom";

interface RekapContentProps {
  rekapData: RekapData | null;
  from: string;
  to: string;
  loadError?: boolean;
}

function monthDateRange(offset: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + offset);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${year}-${String(month).padStart(2, "0")}-01`,
    to: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

function initialsOf(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}

export default function RekapContent({ rekapData, from, to, loadError = false }: RekapContentProps) {
  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(from);
  const [dateTo, setDateTo] = useState(to);
  const [rangeMode, setRangeMode] = useState<RangeMode>(() => {
    const current = monthDateRange(0);
    const previous = monthDateRange(-1);
    if (from === current.from && to === current.to) return "current";
    if (from === previous.from && to === previous.to) return "previous";
    return "custom";
  });

  const allRows = useMemo(() => rekapData?.sessions ?? [], [rekapData]);
  const rows = useMemo(
    () => studentFilter ? allRows.filter((row) => row.m === studentFilter) : allRows,
    [allRows, studentFilter],
  );
  const summary = useMemo(() => rekapData?.summary ?? {
    totalSesi: 0,
    totalJam: 0,
    totalPendapatan: "Rp 0",
    totalPendapatanRaw: 0,
    totalMurid: 0,
    students: [],
  }, [rekapData]);
  const filteredSummary = useMemo(() => {
    if (!studentFilter) return summary;
    const totalJam = Math.round(rows.reduce((total, row) => total + row.h, 0) * 10) / 10;
    const totalPendapatanRaw = rows.reduce((total, row) => total + row.rawAmount, 0);
    return {
      ...summary,
      totalSesi: rows.length,
      totalJam,
      totalPendapatan: formatCurrency(totalPendapatanRaw),
      totalPendapatanRaw,
      totalMurid: new Set(rows.map((row) => row.m)).size,
    };
  }, [rows, studentFilter, summary]);

  const studentColors = useMemo(() => new Map(summary.students.map((name, index) => [name, STUDENT_COLORS[index % STUDENT_COLORS.length]])), [summary.students]);

  const openRange = useCallback((newFrom: string, newTo: string) => {
    window.location.href = `/app/rekap?from=${newFrom}&to=${newTo}`;
  }, []);

  const handleRangeMode = useCallback((mode: RangeMode) => {
    setRangeMode(mode);
    if (mode === "custom") return;
    const range = monthDateRange(mode === "current" ? 0 : -1);
    setDateFrom(range.from);
    setDateTo(range.to);
    openRange(range.from, range.to);
  }, [openRange]);

  const handleExportCSV = useCallback(async () => {
    const { allowed } = await canExport("csv");
    if (!allowed) {
      setPaywallOpen(true);
      return;
    }
    setCsvLoading(true);
    const csv = sessionsToCSV(rows.map(({ d, m, s, h, t }) => ({ d, m, s, h, t })));
    downloadCSV(csv, "rekap-sesi.csv");
    await recordExportEvent("csv");
    setCsvLoading(false);
  }, [rows]);

  const handleExportPDF = useCallback(async () => {
    const { allowed } = await canExport("pdf");
    if (!allowed) {
      setPaywallOpen(true);
      return;
    }
    setPdfLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 18;
      let y = 22;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Rekap Sesi TutorLog", margin, y);
      y += 9;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(rekapData?.monthLabel || `${dateFrom} - ${dateTo}`, margin, y);
      y += 10;
      pdf.text(`${filteredSummary.totalSesi} sesi · ${filteredSummary.totalJam} jam · ${filteredSummary.totalPendapatan}`, margin, y);
      y += 10;
      rows.forEach((row) => {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFont("helvetica", "bold");
        pdf.text(`${row.d}  ${row.m}`, margin, y);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${row.s} · ${row.h} jam`, margin, y + 5);
        pdf.text(row.t, 192, y, { align: "right" });
        y += 14;
      });
      pdf.save("rekap-sesi.pdf");
      await recordExportEvent("pdf");
    } finally {
      setPdfLoading(false);
    }
  }, [dateFrom, dateTo, filteredSummary, rekapData, rows]);

  return (
    <>
      <main className="app-main app-recap-main" id="main-content">
        <header className="app-recap-heading">
          <div>
            <p>Rekap sesi</p>
            <h1>Periksa sesi mengajarmu.</h1>
            <span>{rekapData?.monthLabel || "Pilih periode yang ingin dilihat."}</span>
          </div>
          <div className="app-recap-downloads">
            <button type="button" onClick={handleExportCSV} disabled={csvLoading || loadError || rows.length === 0}>
              <FileCsv size={18} aria-hidden="true" /> {csvLoading ? "Menyiapkan..." : "Unduh CSV"}
            </button>
            <button type="button" onClick={handleExportPDF} disabled={pdfLoading || loadError || rows.length === 0}>
              <FilePdf size={18} aria-hidden="true" /> {pdfLoading ? "Menyiapkan..." : "Unduh PDF"}
            </button>
          </div>
        </header>

        <section className="app-recap-controls" aria-label="Filter rekap">
          <div className="app-recap-presets" role="group" aria-label="Periode">
            <button type="button" className={rangeMode === "current" ? "active" : ""} onClick={() => handleRangeMode("current")}>Bulan ini</button>
            <button type="button" className={rangeMode === "previous" ? "active" : ""} onClick={() => handleRangeMode("previous")}>Bulan lalu</button>
            <button type="button" className={rangeMode === "custom" ? "active" : ""} onClick={() => handleRangeMode("custom")}>Pilih tanggal</button>
          </div>

          {rangeMode === "custom" ? (
            <div className="app-recap-custom-range">
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="Tanggal mulai" />
              <span>sampai</span>
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="Tanggal selesai" />
              <button type="button" onClick={() => openRange(dateFrom, dateTo)}>Terapkan</button>
            </div>
          ) : null}

          <div className="app-recap-students" role="group" aria-label="Filter murid">
            <button type="button" className={studentFilter === null ? "active" : ""} onClick={() => setStudentFilter(null)}>Semua murid</button>
            {summary.students.map((student) => (
              <button type="button" key={student} className={studentFilter === student ? "active" : ""} onClick={() => setStudentFilter(student)}>{student.split(" ")[0]}</button>
            ))}
          </div>
        </section>

        <section className="app-recap-summary" aria-label="Ringkasan periode">
          <div><span>Jumlah sesi</span><strong>{filteredSummary.totalSesi}</strong></div>
          <div><span>Total jam</span><strong>{filteredSummary.totalJam}</strong></div>
          <div><span>Perkiraan pendapatan</span><strong>{filteredSummary.totalPendapatan}</strong></div>
        </section>

        <section className="app-recap-list" aria-labelledby="recap-list-title">
          <div className="app-recap-list-heading">
            <h2 id="recap-list-title">Daftar sesi</h2>
            <span>{rows.length} sesi</span>
          </div>

          {loadError ? (
            <div className="app-data-state app-data-state-error">
              <strong>Rekap belum dapat dimuat.</strong>
              <button type="button" onClick={() => window.location.reload()}>Coba lagi</button>
            </div>
          ) : rows.length === 0 ? (
            <div className="app-data-state">Belum ada sesi pada periode ini.</div>
          ) : (
            <>
              <div className="app-recap-table-wrap">
                <table className="table">
                  <thead><tr><th>Tanggal</th><th>Murid</th><th>Sesi</th><th className="right">Jam</th><th className="right">Tagihan</th></tr></thead>
                  <tbody>{rows.map((row) => (
                    <tr key={row.id}><td>{row.d}</td><td><strong>{row.m}</strong></td><td>{row.s}</td><td className="right">{row.h}</td><td className="right">{row.t}</td></tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="app-recap-mobile-list">
                {rows.map((row) => (
                  <div className="app-recap-mobile-row" key={row.id}>
                    <span className="app-recap-avatar" style={{ background: studentColors.get(row.m) }}>{initialsOf(row.m)}</span>
                    <div><strong>{row.m}</strong><span>{row.d} · {row.s}</span></div>
                    <div><strong>{row.t}</strong><span>{row.h} jam</span></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <PaywallDialog open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}
