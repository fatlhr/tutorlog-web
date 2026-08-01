"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { CaretRight, FileCsv, FilePdf, Funnel } from "@phosphor-icons/react";
import { authorizeExport } from "@/lib/billing/client";
import { sessionsToCSV, downloadCSV } from "@/lib/csv";
import PaywallDialog from "@/components/PaywallDialog";
import { Button, DateField, Field } from "@/components/app-ui/controls";
import { DataRow } from "@/components/app-ui/data-row";
import { ChoiceGroup, SegmentedNavigation } from "@/components/app-ui/navigation";
import { BottomSheet, SidePanel } from "@/components/app-ui/overlays";
import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import { EmptyState, ErrorState } from "@/components/app-ui/states";
import {
  PageHeader,
  Section,
  SectionHeading,
  SummaryBand,
  Surface,
} from "@/components/app-ui/structure";
import type { ExportFormat, PaywallReason } from "@/lib/data/quota-access";
import {
  getAvailableStudentFilterOptions,
  getRekapPresetRange,
  hasUnappliedCustomRange,
  isValidRekapCustomRange,
  type RekapRangeMode,
} from "@/lib/data/rekap-filter";
import type { RekapData, SessionItem } from "@/lib/data/rekap";
import { formatCurrency } from "@/lib/format";

const PAGE_SIZE = 20;

type RangeMode = RekapRangeMode;

interface RekapContentProps {
  rekapData: RekapData | null;
  from: string;
  to: string;
  wibToday: string;
  loadError?: boolean;
}

function inferRangeMode(rangeFrom: string, rangeTo: string, wibToday: string): RangeMode {
  const current = getRekapPresetRange("current", wibToday);
  const previous = getRekapPresetRange("previous", wibToday);
  if (rangeFrom === current.from && rangeTo === current.to) return "current";
  if (rangeFrom === previous.from && rangeTo === previous.to) return "previous";
  return "custom";
}

interface RecapFilterControlsProps {
  rangeMode: RangeMode;
  dateFrom: string;
  dateTo: string;
  wibToday: string;
  filterError: string | null;
  students: string[];
  studentFilter: string | null;
  customRangePending: boolean;
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
  wibToday,
  filterError,
  students,
  studentFilter,
  customRangePending,
  onRangeMode,
  onDateFromChange,
  onDateToChange,
  onApplyRange,
  onStudentChange,
}: RecapFilterControlsProps) {
  const rangeItems = [
    { value: "current", label: "Bulan ini" },
    { value: "previous", label: "Bulan lalu" },
    { value: "custom", label: "Pilih tanggal" },
  ];
  const availableStudents = getAvailableStudentFilterOptions({ students, customRangePending });
  const studentOptions = [
    { value: "", label: "Semua murid" },
    ...availableStudents.map((student) => ({ value: student, label: student.split(" ")[0] })),
  ];

  return (
    <div className="app-recap-filter-stack">
      <SegmentedNavigation
        label="Periode"
        items={rangeItems}
        value={rangeMode}
        onChange={(value) => onRangeMode(value as RangeMode)}
        size="compact"
        tone="recap"
      />

      {rangeMode === "custom" ? (
        <div className="app-recap-custom-range">
          <Field controlId="recap-date-from" label="Tanggal mulai" density="compact">
            <DateField
              id="recap-date-from"
              value={dateFrom}
              max={wibToday}
              onChange={onDateFromChange}
            />
          </Field>
          <Field controlId="recap-date-to" label="Tanggal selesai" density="compact">
            <DateField
              id="recap-date-to"
              value={dateTo}
              max={wibToday}
              onChange={onDateToChange}
            />
          </Field>
          <Button type="button" size="compact" onClick={onApplyRange}>Terapkan</Button>
        </div>
      ) : null}

      {filterError ? <p className="app-export-error" role="alert">{filterError}</p> : null}

      {customRangePending ? (
        <div>
          <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Filter murid</p>
          <p className="tw-helper" style={{ margin: 0 }}>
            Terapkan rentang tanggal terlebih dahulu untuk melihat filter murid pada periode ini.
          </p>
        </div>
      ) : (
        <ChoiceGroup
          label="Filter murid"
          options={studentOptions}
          value={studentFilter ?? ""}
          onChange={(value) => onStudentChange(value || null)}
        />
      )}
    </div>
  );
}

function SessionDetailContent({ session }: { session: SessionItem }) {
  return (
    <div className="app-session-detail-content">
      <dl>
        <div><dt>Tanggal dan waktu</dt><dd>{session.d} · {session.time}</dd></div>
        <div><dt>Mode</dt><dd>{session.mode}</dd></div>
        <div><dt>Lokasi</dt><dd>{session.location}</dd></div>
        <div><dt>{session.rateLabel}</dt><dd>{session.rate}</dd></div>
        <div><dt>Total sesi</dt><dd>{session.t}</dd></div>
      </dl>
      <section className="app-session-detail-note"><h3>Catatan sesi</h3><p>{session.note}</p></section>
    </div>
  );
}

const SessionRow = memo(function SessionRow({
  row,
  onSelectSession,
}: {
  row: SessionItem;
  onSelectSession: (row: SessionItem) => void;
}) {
  const handleClick = useCallback(() => onSelectSession(row), [onSelectSession, row]);
  return (
    <DataRow
      label={`${row.m}, ${row.d}, ${row.time}, ${row.h} jam, ${row.t}`}
      density="compact"
      tone="recap"
      leading={<span className="app-recap-row-date">{row.d}</span>}
      title={row.m}
      metadata={`${row.time} · ${row.h} jam`}
      trailing={(
        <span className="app-recap-row-trailing">
          <strong>{row.t}</strong>
          <CaretRight size={18} aria-hidden="true" />
        </span>
      )}
      onActivate={handleClick}
    />
  );
});

function SessionDetailOverlay({
  session,
  onClose,
}: {
  session: SessionItem;
  onClose: () => void;
}) {
  const [overlayKind, setOverlayKind] = useState<"sidePanel" | "bottomSheet">("sidePanel");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setOverlayKind(mq.matches ? "sidePanel" : "bottomSheet");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (overlayKind === "sidePanel") {
    return (
      <SidePanel
        open
        onOpenChange={(open) => { if (!open) onClose(); }}
        title={`Detail sesi ${session.m}`}
      >
        <SessionDetailContent session={session} />
      </SidePanel>
    );
  }

  return (
    <BottomSheet
      open
      onOpenChange={(open) => { if (!open) onClose(); }}
      title={`Detail sesi ${session.m}`}
      height="tall"
    >
      <SessionDetailContent session={session} />
    </BottomSheet>
  );
}

export default function RekapContent({
  rekapData,
  from,
  to,
  wibToday,
  loadError = false,
}: RekapContentProps) {
  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<PaywallReason>("free-limit");
  const [paywallUsage, setPaywallUsage] = useState<Partial<Record<ExportFormat, { used: number; limit: number }>>>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const handleSessionClick = useCallback((row: SessionItem) => {
    setSelectedSession(row);
  }, []);
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState(from);
  const [dateTo, setDateTo] = useState(to);
  const appliedRangeMode = useMemo(
    () => inferRangeMode(from, to, wibToday),
    [from, to, wibToday],
  );
  const [rangeMode, setRangeMode] = useState<RangeMode>(
    () => inferRangeMode(from, to, wibToday),
  );

  const allRows = useMemo(() => rekapData?.sessions ?? [], [rekapData]);
  const rows = useMemo(
    () => studentFilter ? allRows.filter((row) => row.m === studentFilter) : allRows,
    [allRows, studentFilter],
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = useMemo(
    () => rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [safePage, rows],
  );
  const summary = useMemo(() => rekapData?.summary ?? {
    totalSesi: 0,
    totalJam: 0,
    totalPendapatan: "Rp 0",
    totalPendapatanRaw: 0,
    totalMurid: 0,
    students: [],
  }, [rekapData]);
  const customRangePending = hasUnappliedCustomRange({
    rangeMode,
    appliedRangeMode,
    dateFrom,
    dateTo,
    appliedFrom: from,
    appliedTo: to,
  });
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
    setFilterError(null);
    setPage(1);
    setStudentFilter(null);
    if (mode === "custom") return;
    const range = getRekapPresetRange(mode, wibToday);
    setDateFrom(range.from);
    setDateTo(range.to);
    openRange(range.from, range.to);
  }, [openRange, wibToday]);

  const handleDateFromChange = useCallback((value: string) => {
    setDateFrom(value);
    setFilterError(null);
    setStudentFilter(null);
    setPage(1);
  }, []);

  const handleDateToChange = useCallback((value: string) => {
    setDateTo(value);
    setFilterError(null);
    setStudentFilter(null);
    setPage(1);
  }, []);

  const handleApplyRange = useCallback(() => {
    if (!isValidRekapCustomRange(dateFrom, dateTo, wibToday)) {
      setFilterError("Pilih rentang tanggal yang valid hingga hari ini.");
      return;
    }

    setFilterError(null);
    openRange(dateFrom, dateTo);
  }, [dateFrom, dateTo, openRange, wibToday]);

  const handleStudentChange = useCallback((student: string | null) => {
    setStudentFilter(student);
    setPage(1);
  }, []);

  const handleExportCSV = useCallback(async () => {
    setCsvLoading(true);
    setExportError(null);
    try {
      const decision = await authorizeExport("recap_csv");
      if (!decision.allowed) {
        setPaywallReason(decision.reason ?? "free-limit");
        setPaywallUsage(
          decision.used !== null && decision.limit !== null
            ? { csv: { used: decision.used, limit: decision.limit } }
            : undefined,
        );
        setPaywallOpen(true);
        return;
      }
      const csv = sessionsToCSV(rows.map(({ d, m, s, h, t }) => ({ d, m, s, h, t })));
      downloadCSV(csv, "rekap-sesi.csv");
    } catch {
      setExportError("CSV belum berhasil diunduh. Coba lagi.");
    } finally {
      setCsvLoading(false);
    }
  }, [rows]);

  const handleExportPDF = useCallback(async () => {
    setPdfLoading(true);
    setExportError(null);
    try {
      const decision = await authorizeExport("recap_pdf");
      if (!decision.allowed) {
        setPaywallReason(decision.reason ?? "free-limit");
        setPaywallUsage(
          decision.used !== null && decision.limit !== null
            ? { pdf: { used: decision.used, limit: decision.limit } }
            : undefined,
        );
        setPaywallOpen(true);
        return;
      }
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
    } catch {
      setExportError("PDF belum berhasil diunduh. Coba lagi.");
    } finally {
      setPdfLoading(false);
    }
  }, [dateFrom, dateTo, filteredSummary, rekapData, rows]);

  return (
    <>
      <RouteCanvas route="recap">
        <PageMain>
          <PageHeader
            route="recap"
            eyebrow="Rekap sesi"
            title="Periksa sesi mengajarmu."
            description={rekapData?.monthLabel || "Pilih periode yang ingin dilihat."}
            actions={[
              <Button
                key="csv"
                type="button"
                variant="secondary"
                size="compact"
                leadingIcon={<FileCsv size={18} aria-hidden="true" />}
                loading={csvLoading}
                disabled={loadError || rows.length === 0}
                onClick={handleExportCSV}
              >
                Unduh CSV
              </Button>,
              <Button
                key="pdf"
                type="button"
                variant="secondary"
                size="compact"
                leadingIcon={<FilePdf size={18} aria-hidden="true" />}
                loading={pdfLoading}
                disabled={loadError || rows.length === 0}
                onClick={handleExportPDF}
              >
                Unduh PDF
              </Button>,
            ]}
          />

          {exportError ? <p className="app-export-error" role="alert">{exportError}</p> : null}

          <section className="app-recap-controls app-recap-controls-desktop" aria-label="Filter rekap">
            <RecapFilterControls
              rangeMode={rangeMode}
              dateFrom={dateFrom}
              dateTo={dateTo}
              wibToday={wibToday}
              filterError={filterError}
              students={summary.students}
              studentFilter={studentFilter}
              customRangePending={customRangePending}
              onRangeMode={handleRangeMode}
              onDateFromChange={handleDateFromChange}
              onDateToChange={handleDateToChange}
              onApplyRange={handleApplyRange}
              onStudentChange={handleStudentChange}
            />
          </section>

          <div className="app-recap-filter-trigger">
            <Button
              type="button"
              variant="secondary"
              size="compact"
              leadingIcon={<Funnel size={17} aria-hidden="true" />}
              aria-expanded={filtersOpen}
              aria-controls="recap-filter-sheet"
              onClick={() => setFiltersOpen(true)}
            >
              Filter{(studentFilter || rangeMode !== "current") ? ` (${Number(Boolean(studentFilter)) + Number(rangeMode !== "current")})` : ""}
            </Button>
          </div>

          <SummaryBand
            label="Ringkasan periode"
            density="compact"
            tone="recap"
            items={[
              { label: "Sesi selesai", value: filteredSummary.totalSesi },
              { label: "Waktu mengajar", value: filteredSummary.totalJam },
              { label: "Estimasi pendapatan", value: filteredSummary.totalPendapatan },
            ]}
          />

          <Section labelledBy="recap-list-title">
            <SectionHeading
              headingId="recap-list-title"
              title="Daftar sesi"
              description={`${rows.length} sesi`}
            />

            {loadError ? (
              <ErrorState
                scope="section"
                title="Rekap belum dapat dimuat"
                body="Data sesi tidak berubah. Coba buka rekap ini lagi."
                retry={<Button type="button" variant="secondary" onClick={() => window.location.reload()}>Coba lagi</Button>}
              />
            ) : rows.length === 0 ? (
              <EmptyState
                context="recap"
                title="Belum ada sesi pada periode ini"
                body="Ubah periode atau filter murid untuk memeriksa sesi lain."
              />
            ) : (
              <>
                <Surface padding="none" labelledBy="recap-list-title">
                  {paginatedRows.map((row) => (
                    <SessionRow
                      key={row.id}
                      row={row}
                      onSelectSession={handleSessionClick}
                    />
                  ))}
                </Surface>
                {totalPages > 1 ? (
                  <nav className="app-recap-pagination" aria-label="Halaman sesi">
                    <Button type="button" variant="quiet" size="compact" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>Sebelumnya</Button>
                    <span>Halaman {safePage} dari {totalPages}</span>
                    <Button type="button" variant="quiet" size="compact" disabled={safePage >= totalPages} onClick={() => setPage((current) => Math.min(current + 1, totalPages))}>Berikutnya</Button>
                  </nav>
                ) : null}
              </>
            )}
          </Section>
        </PageMain>
      </RouteCanvas>

      <BottomSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filter rekap"
        height="tall"
      >
        <div className="app-recap-filter-content" id="recap-filter-sheet">
            <RecapFilterControls
              rangeMode={rangeMode}
              dateFrom={dateFrom}
              dateTo={dateTo}
              wibToday={wibToday}
              filterError={filterError}
              students={summary.students}
              studentFilter={studentFilter}
              customRangePending={customRangePending}
              onRangeMode={handleRangeMode}
              onDateFromChange={handleDateFromChange}
              onDateToChange={handleDateToChange}
              onApplyRange={handleApplyRange}
              onStudentChange={handleStudentChange}
            />
        </div>
      </BottomSheet>

      {selectedSession ? (
        <SessionDetailOverlay
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      ) : null}

      <PaywallDialog
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason={paywallReason}
        quotaUsage={paywallUsage}
      />
    </>
  );
}
