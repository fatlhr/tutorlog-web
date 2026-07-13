"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CaretRight, FileCsv, FilePdf, Funnel, X } from "@phosphor-icons/react";
import { sessionsToCSV, downloadCSV } from "@/lib/csv";
import { canExport, recordExportEvent } from "@/lib/data/quota";
import PaywallDialog from "@/components/PaywallDialog";
import type { RekapData, SessionItem } from "@/lib/data/rekap";
import { formatCurrency } from "@/lib/format";

const PAGE_SIZE = 20;

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

interface RecapFilterControlsProps {
  rangeMode: RangeMode;
  dateFrom: string;
  dateTo: string;
  students: string[];
  studentFilter: string | null;
  onRangeMode: (mode: RangeMode) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onApplyRange: () => void;
  onStudentChange: (student: string | null) => void;
}

function RecapFilterControls({
  rangeMode,
  dateFrom,
  dateTo,
  students,
  studentFilter,
  onRangeMode,
  onDateFromChange,
  onDateToChange,
  onApplyRange,
  onStudentChange,
}: RecapFilterControlsProps) {
  return (
    <>
      <div className="app-recap-presets" role="group" aria-label="Periode">
        <button type="button" className={rangeMode === "current" ? "active" : ""} onClick={() => onRangeMode("current")}>Bulan ini</button>
        <button type="button" className={rangeMode === "previous" ? "active" : ""} onClick={() => onRangeMode("previous")}>Bulan lalu</button>
        <button type="button" className={rangeMode === "custom" ? "active" : ""} onClick={() => onRangeMode("custom")}>Pilih tanggal</button>
      </div>

      {rangeMode === "custom" ? (
        <div className="app-recap-custom-range">
          <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} aria-label="Tanggal mulai" />
          <span>sampai</span>
          <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} aria-label="Tanggal selesai" />
          <button type="button" onClick={onApplyRange}>Terapkan</button>
        </div>
      ) : null}

      <div className="app-recap-students" role="group" aria-label="Filter murid">
        <button type="button" className={studentFilter === null ? "active" : ""} onClick={() => onStudentChange(null)}>Semua murid</button>
        {students.map((student) => (
          <button type="button" key={student} className={studentFilter === student ? "active" : ""} onClick={() => onStudentChange(student)}>{student.split(" ")[0]}</button>
        ))}
      </div>
    </>
  );
}

export default function RekapContent({ rekapData, from, to, loadError = false }: RekapContentProps) {
  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [page, setPage] = useState(1);
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
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, rows],
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

  const openRange = useCallback((newFrom: string, newTo: string) => {
    window.location.href = `/app/rekap?from=${newFrom}&to=${newTo}`;
  }, []);

  const handleRangeMode = useCallback((mode: RangeMode) => {
    setRangeMode(mode);
    setPage(1);
    if (mode === "custom") return;
    const range = monthDateRange(mode === "current" ? 0 : -1);
    setDateFrom(range.from);
    setDateTo(range.to);
    openRange(range.from, range.to);
  }, [openRange]);

  const handleStudentChange = useCallback((student: string | null) => {
    setStudentFilter(student);
    setPage(1);
  }, []);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (!selectedSession) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSession(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedSession]);

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

        <section className="app-recap-controls app-recap-controls-desktop" aria-label="Filter rekap">
          <RecapFilterControls
            rangeMode={rangeMode}
            dateFrom={dateFrom}
            dateTo={dateTo}
            students={summary.students}
            studentFilter={studentFilter}
            onRangeMode={handleRangeMode}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onApplyRange={() => openRange(dateFrom, dateTo)}
            onStudentChange={handleStudentChange}
          />
        </section>

        <button
          type="button"
          className="app-recap-filter-trigger"
          aria-expanded={filtersOpen}
          aria-controls="recap-filter-sheet"
          onClick={() => setFiltersOpen(true)}
        >
          <Funnel size={17} aria-hidden="true" /> Filter
          {(studentFilter || rangeMode !== "current") ? <span>{Number(Boolean(studentFilter)) + Number(rangeMode !== "current")}</span> : null}
        </button>

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
              <div className="app-recap-session-list">
                {paginatedRows.map((row) => (
                  <button type="button" className="app-recap-session-row" key={row.id} onClick={() => setSelectedSession(row)}>
                    <span className="app-recap-session-date">{row.d}</span>
                    <span className="app-recap-session-person"><strong>{row.m}</strong><small>{row.time} · {row.h} jam</small></span>
                    <span className="app-recap-session-amount">{row.t}</span>
                    <CaretRight size={18} aria-hidden="true" />
                  </button>
                ))}
              </div>
              {totalPages > 1 ? (
                <nav className="app-recap-pagination" aria-label="Halaman sesi">
                  <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Sebelumnya</button>
                  <span>Halaman {page} dari {totalPages}</span>
                  <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Berikutnya</button>
                </nav>
              ) : null}
            </>
          )}
        </section>
      </main>

      {filtersOpen ? (
        <div className="app-recap-sheet-scrim" onMouseDown={() => setFiltersOpen(false)}>
          <section className="app-recap-filter-sheet" id="recap-filter-sheet" role="dialog" aria-modal="true" aria-label="Filter rekap" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <strong>Filter rekap</strong>
              <button type="button" aria-label="Tutup filter" onClick={() => setFiltersOpen(false)}><X size={20} aria-hidden="true" /></button>
            </header>
            <RecapFilterControls
              rangeMode={rangeMode}
              dateFrom={dateFrom}
              dateTo={dateTo}
              students={summary.students}
              studentFilter={studentFilter}
              onRangeMode={handleRangeMode}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onApplyRange={() => openRange(dateFrom, dateTo)}
              onStudentChange={handleStudentChange}
            />
          </section>
        </div>
      ) : null}

      {selectedSession ? (
        <div className="app-session-detail-scrim" onMouseDown={() => setSelectedSession(null)}>
          <aside className="app-session-detail" role="dialog" aria-modal="true" aria-label={`Detail sesi ${selectedSession.m}`} onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><p>Detail sesi</p><h2>{selectedSession.m}</h2></div>
              <button type="button" aria-label="Tutup detail sesi" onClick={() => setSelectedSession(null)}><X size={20} aria-hidden="true" /></button>
            </header>
            <dl>
              <div><dt>Tanggal dan waktu</dt><dd>{selectedSession.d} · {selectedSession.time}</dd></div>
              <div><dt>Mode</dt><dd>{selectedSession.mode}</dd></div>
              <div><dt>Lokasi</dt><dd>{selectedSession.location}</dd></div>
              <div><dt>{selectedSession.rateLabel}</dt><dd>{selectedSession.rate}</dd></div>
              <div><dt>Total sesi</dt><dd>{selectedSession.t}</dd></div>
            </dl>
            <section className="app-session-detail-note"><h3>Catatan sesi</h3><p>{selectedSession.note}</p></section>
          </aside>
        </div>
      ) : null}

      <PaywallDialog open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}
