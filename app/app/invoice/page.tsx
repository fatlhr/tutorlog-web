"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CheckCircle, Desktop, DownloadSimple, Eye, LockKey, Minus, Plus } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import TplKlasik from "@/components/invoice/TplKlasik";
import type { InvoiceData } from "@/components/invoice/invoice-data";
import TplModern from "@/components/invoice/TplModern";
import TplMinimal from "@/components/invoice/TplMinimal";
import A4Page from "@/components/invoice/A4Page";
import PaywallDialog from "@/components/PaywallDialog";
import type { AccessState, PaywallReason } from "@/lib/data/quota-access";
import {
  Button,
  DateField,
  Field,
  IconButton,
  Select,
  Textarea,
  TextField,
} from "@/components/app-ui/controls";
import { Dialog } from "@/components/app-ui/overlays";
import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import { SectionHeading, Surface } from "@/components/app-ui/structure";

const COLORS = ["#006C53", "#235C8F", "#805346", "#635880", "#161D1F", "#C0392B", "#1A5276", "#7D3C98", "#B7950B"];
const TEMPLATES = ["klasik", "modern", "minimal"] as const;
const DRAFT_KEY = "tutorlog-invoice-draft:v1";
type Template = (typeof TEMPLATES)[number];

interface StudentOption {
  id: string;
  name: string;
  hourlyRate: number | null;
  billingType: string | null;
  educationLevel: string | null;
  address: string | null;
  parentName: string | null;
}

function getStudentRecipientName(student: StudentOption): string {
  const storedName = student.parentName?.trim();
  return storedName || `Orang tua/wali ${student.name}`;
}

interface InvoiceSessionItem {
  id: string;
  clockIn: string;
  clockOut: string | null;
  note: string;
  hours: number;
  rate: number;
  amount: number;
  billingType: "hourly" | "flat";
}

function formatDateLabel(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatInvoiceDate(d: Date): string {
  return formatDateLabel(d);
}

function formatMonthDay(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]}`;
}

function generateInvoiceNo(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `INV-${yy}${mm}-${seq}`;
}

function currentMonthPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return {
    from: `${year}-${String(month).padStart(2, "0")}-01`,
    to: `${year}-${String(month).padStart(2, "0")}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`,
  };
}

export default function InvoicePage() {
  const supabase = createClient();

  const [template, setTemplate] = useState<Template>("klasik");
  const [accent, setAccent] = useState("#006C53");
  const [zoom, setZoom] = useState(75);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dialogZoom, setDialogZoom] = useState(75);
  const dialogStageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useLayoutEffect(() => {
    if (!previewOpen) return;
    const el = dialogStageRef.current;
    if (!el) return;
    let lastW = 0;
    const fit = () => {
      const w = el.clientWidth;
      if (w > 0 && Math.abs(w - lastW) > 8) {
        lastW = w;
        setDialogZoom(Math.max(40, Math.min(200, Math.floor(((w - 16) / 794) * 100))));
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewOpen]);

  const [periodStart, setPeriodStart] = useState(() => currentMonthPeriod().from);
  const [periodEnd, setPeriodEnd] = useState(() => currentMonthPeriod().to);
  const [lembaga, setLembaga] = useState("");
  const [tutorName, setTutorName] = useState("");
  const [tutorLocation, setTutorLocation] = useState("");
  const [tutorContact, setTutorContact] = useState("");
  const [parentName, setParentName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentInfo, setStudentInfo] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [notes, setNotes] = useState("");
  const [saveSettings, setSaveSettings] = useState(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [invoiceSessions, setInvoiceSessions] = useState<InvoiceSessionItem[]>([]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<PaywallReason>("invoice-locked");
  const [accessState, setAccessState] = useState<AccessState>("free");
  const [quotaReady, setQuotaReady] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);
  const [sessionsError, setSessionsError] = useState(false);
  const [loadedSessionsQueryKey, setLoadedSessionsQueryKey] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const sessionsRequestSequence = useRef(0);
  const restoredDraftStudentNameRef = useRef<string | null>(null);
  const restoredDraftHasStudentAddressRef = useRef(false);
  const currentSessionsQueryKey = JSON.stringify([studentName, periodStart, periodEnd]);
  const invoiceDownloadLocked = quotaReady && accessState !== "plus_active";
  const invoiceActionsDisabled =
    sessionsLoading ||
    sessionsError ||
    invoiceSessions.length === 0 ||
    loadedSessionsQueryKey !== currentSessionsQueryKey;

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { setInvoiceNo(generateInvoiceNo()); }, []);

  const periodLabel = (() => {
    const s = new Date(periodStart + "T00:00:00");
    const e = new Date(periodEnd + "T00:00:00");
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Pilih periode";
    const sy = s.getFullYear() === e.getFullYear() ? "" : ` ${s.getFullYear()}`;
    return `${s.getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][s.getMonth()]}${sy} - ${e.getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][e.getMonth()]} ${e.getFullYear()}`;
  })();

  useEffect(() => {
    const doFetch = async () => {
      setStudentsLoading(true);
      setStudentsError(false);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("AUTH_REQUIRED");

        const { data, error } = await supabase
          .from("student_locations")
          .select("id, student_name, hourly_rate, billing_type, education_level")
          .eq("tutor_id", user.id)
          .is("deleted_at", null)
          .order("student_name", { ascending: true });

        if (error || !data) throw error ?? new Error("STUDENTS_FETCH_FAILED");

        const list: StudentOption[] = (data as Record<string, unknown>[]).map((row) => ({
          id: row.id as string,
          name: (row.student_name as string) ?? "Tanpa Nama",
          hourlyRate: (row.hourly_rate as number) ?? null,
          billingType: (row.billing_type as string) ?? null,
          educationLevel: (row.education_level as string) ?? null,
          address: null,
          parentName: null,
        }));

        setStudents(list);
      } catch {
        setStudents([]);
        setStudentsError(true);
      } finally {
        setStudentsLoading(false);
      }
    };
    doFetch();
  }, [supabase]);

  useEffect(() => {
    if (studentsLoading) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;

      if (students.length === 0) {
        setStudentName("");
        setStudentInfo("");
        setStudentAddress("");
        setParentName("");
        return;
      }

      const selectedStudent = students.find((student) => student.name === studentName);
      if (!selectedStudent) {
        const firstStudent = students[0];
        setStudentName(firstStudent.name);
        setStudentInfo(firstStudent.educationLevel ?? "");
        setStudentAddress(firstStudent.address ?? "");
        setParentName(getStudentRecipientName(firstStudent));
        return;
      }

      setStudentInfo(selectedStudent.educationLevel ?? "");
      const shouldPreserveDraftStudentAddress =
        restoredDraftStudentNameRef.current === selectedStudent.name &&
        restoredDraftHasStudentAddressRef.current;
      setStudentAddress((current) =>
        shouldPreserveDraftStudentAddress ? current : current || selectedStudent.address || ""
      );
      setParentName((current) => current.trim() || getStudentRecipientName(selectedStudent));
    });

    return () => {
      cancelled = true;
    };
  }, [studentName, students, studentsLoading]);

  useEffect(() => {
    const requestQueryKey = currentSessionsQueryKey;
    const requestSequence = ++sessionsRequestSequence.current;
    let cancelled = false;
    const ownsLatestRequest = () =>
      !cancelled && sessionsRequestSequence.current === requestSequence;

    if (!studentName || !periodStart || !periodEnd) {
      queueMicrotask(() => {
        if (cancelled) return;
        setInvoiceSessions([]);
        setSessionsError(false);
        setSessionsLoading(false);
        setLoadedSessionsQueryKey(null);
      });
      return () => {
        cancelled = true;
      };
    }
    const doFetch = async () => {
      setSessionsLoading(true);
      setSessionsError(false);
      setLoadedSessionsQueryKey(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("AUTH_REQUIRED");

        const startISO = new Date(periodStart + "T00:00:00").toISOString();
        const endISO = new Date(periodEnd + "T23:59:59.999").toISOString();

        const { data, error } = await supabase
          .from("sessions")
          .select("id, clock_in_at, clock_out_at, student_name_snapshot, hourly_rate_snapshot, billing_type_snapshot, session_learning_notes(tutor_note)")
          .eq("tutor_id", user.id)
          .eq("status", "completed")
          .gte("clock_in_at", startISO)
          .lte("clock_in_at", endISO)
          .order("clock_in_at", { ascending: true });

        if (error || !data) throw error ?? new Error("SESSIONS_FETCH_FAILED");

        const filtered = (data as Record<string, unknown>[]).filter((row) =>
          (row.student_name_snapshot as string) === studentName
        );

        const items: InvoiceSessionItem[] = filtered.map((row) => {
          const clockIn = row.clock_in_at as string;
          const clockOut = (row.clock_out_at as string) ?? null;
          const startTime = new Date(clockIn).getTime();
          const endTime = clockOut ? new Date(clockOut).getTime() : 0;
          const hours = endTime > startTime ? Math.round(((endTime - startTime) / 36e5) * 10) / 10 : 0;
          const rate = (row.hourly_rate_snapshot as number) ?? 0;
          const billingType: InvoiceSessionItem["billingType"] = row.billing_type_snapshot === "flat"
            ? "flat"
            : "hourly";
          const amount = billingType === "flat" ? (rate || 0) : Math.round(hours * rate);
          const relation = row.session_learning_notes;
          const noteRecord = Array.isArray(relation) ? relation[0] : relation;
          const note = typeof (noteRecord as Record<string, unknown> | null)?.tutor_note === "string"
            ? ((noteRecord as Record<string, unknown>).tutor_note as string).trim()
            : "";

          return { id: row.id as string, clockIn, clockOut, note: note || "-", hours, rate, amount, billingType };
        });

        if (!ownsLatestRequest()) return;
        setInvoiceSessions(items);
        setLoadedSessionsQueryKey(requestQueryKey);
      } catch {
        if (!ownsLatestRequest()) return;
        setInvoiceSessions([]);
        setSessionsError(true);
        setLoadedSessionsQueryKey(null);
      } finally {
        if (ownsLatestRequest()) {
          setSessionsLoading(false);
        }
      }
    };
    doFetch();
    return () => {
      cancelled = true;
    };
  }, [currentSessionsQueryKey, studentName, periodStart, periodEnd, supabase]);

  useEffect(() => {
    const access = document.querySelector<HTMLElement>(".app-shell-h")?.dataset.access;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setAccessState(access === "plus-active" ? "plus_active" : access === "plus-expired" ? "plus_expired" : "free");
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setQuotaReady(true);
  }, []);

  useEffect(() => {
    if (mobileEditorOpen) window.scrollTo(0, 0);
  }, [mobileEditorOpen]);

  const validateInvoiceForm = useCallback(() => {
    const fieldsValid = formRef.current?.reportValidity() ?? false;
    return fieldsValid && !invoiceActionsDisabled;
  }, [invoiceActionsDisabled]);

  const handleExportPDF = useCallback(async () => {
    if (accessState !== "plus_active") {
      setPaywallReason(accessState === "plus_expired" ? "expired" : "invoice-locked");
      setPaywallOpen(true);
      return;
    }
    if (!validateInvoiceForm()) return;
    setExporting(true);
    try {
      const container = exportRef.current;
      if (!container) return;

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.88);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = 210;
      const pageHeight = 297;
      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST");

      pdf.save(`Invoice-${invoiceNo.replace("/", "-")}.pdf`);
      setExportSuccess(true);

      void supabase.rpc("record_feature_usage_event", {
        p_feature_key: "invoice_export",
        p_event_type: "success",
        p_metadata: { format: "pdf" },
      }).then(
        () => undefined,
        () => undefined,
      );
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [accessState, invoiceNo, supabase, validateInvoiceForm]);

  useEffect(() => {
    if (!exportSuccess) return;
    const timer = window.setTimeout(() => setExportSuccess(false), 3600);
    return () => window.clearTimeout(timer);
  }, [exportSuccess]);

  const handleStudentChange = (name: string) => {
    restoredDraftStudentNameRef.current = null;
    restoredDraftHasStudentAddressRef.current = false;
    setStudentName(name);
    const found = students.find((student) => student.name === name);

    if (!found) {
      setStudentInfo("");
      setStudentAddress("");
      setParentName("");
      return;
    }

    setStudentInfo(found.educationLevel ?? "");
    setStudentAddress(found.address ?? "");
    setParentName(getStudentRecipientName(found));
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tutorlog-invoice-settings");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed.accent) setAccent(parsed.accent);
      if (TEMPLATES.includes(parsed.template)) setTemplate(parsed.template);
      if (parsed.bankAccount) setBankAccount(parsed.bankAccount);
      if (parsed.bankName) setBankName(parsed.bankName);
      if (parsed.lembaga) setLembaga(parsed.lembaga);
      if (parsed.tutorName) setTutorName(parsed.tutorName);
      if (parsed.tutorLocation) setTutorLocation(parsed.tutorLocation);
      if (parsed.tutorContact) setTutorContact(parsed.tutorContact);
      setSaveSettings(true);
    } catch { /* ignore */ }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (!savedDraft) return;
      const draft = JSON.parse(savedDraft) as Record<string, unknown>;
      if (typeof draft.periodStart === "string") setPeriodStart(draft.periodStart);
      if (typeof draft.periodEnd === "string") setPeriodEnd(draft.periodEnd);
      if (typeof draft.studentName === "string") {
        restoredDraftStudentNameRef.current = draft.studentName;
        setStudentName(draft.studentName);
      }
      if (typeof draft.invoiceNo === "string") setInvoiceNo(draft.invoiceNo);
      if (typeof draft.lembaga === "string") setLembaga(draft.lembaga);
      if (typeof draft.tutorName === "string") setTutorName(draft.tutorName);
      if (typeof draft.tutorLocation === "string") setTutorLocation(draft.tutorLocation);
      if (typeof draft.tutorContact === "string") setTutorContact(draft.tutorContact);
      if (typeof draft.parentName === "string") setParentName(draft.parentName);
      if (typeof draft.studentAddress === "string") {
        restoredDraftHasStudentAddressRef.current = true;
        setStudentAddress(draft.studentAddress);
      }
      if (typeof draft.bankAccount === "string") setBankAccount(draft.bankAccount);
      if (typeof draft.bankName === "string") setBankName(draft.bankName);
      if (typeof draft.notes === "string") setNotes(draft.notes);
      if (typeof draft.accent === "string") setAccent(draft.accent);
      if (typeof draft.template === "string" && TEMPLATES.includes(draft.template as Template)) setTemplate(draft.template as Template);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    } finally {
      setDraftReady(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!draftReady) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        periodStart,
        periodEnd,
        studentName,
        invoiceNo,
        lembaga,
        tutorName,
        tutorLocation,
        tutorContact,
        parentName,
        studentAddress,
        bankAccount,
        bankName,
        notes,
        accent,
        template,
      }));
    } catch { /* localStorage not available */ }
  }, [draftReady, periodStart, periodEnd, studentName, invoiceNo, lembaga, tutorName, tutorLocation, tutorContact, parentName, studentAddress, bankAccount, bankName, notes, accent, template]);

  useEffect(() => {
    if (!saveSettings) return;
    try {
      localStorage.setItem("tutorlog-invoice-settings", JSON.stringify({
        accent, template, bankAccount, bankName, lembaga,
        tutorName, tutorLocation, tutorContact,
      }));
    } catch { /* localStorage not available */ }
  }, [saveSettings, accent, template, bankAccount, bankName, lembaga, tutorName, tutorLocation, tutorContact]);

  const handleToggleSave = (checked: boolean) => {
    setSaveSettings(checked);
    if (!checked) {
      try { localStorage.removeItem("tutorlog-invoice-settings"); } catch { /* ignore */ }
    }
  };

  const buildInvoiceData = (): InvoiceData => {
    const now = new Date();
    const [bankCode = "", bankNo = ""] = bankAccount.split(/\s*(?:·|-)\s*/, 2);

    const items = invoiceSessions.map((session) => ({
      date: formatMonthDay(new Date(session.clockIn)),
      desc: session.note,
      h: session.hours,
      rate: session.rate,
      amount: session.amount,
      billingType: session.billingType,
    }));

    return {
      no: invoiceNo,
      date: formatInvoiceDate(now),
      period: periodLabel,
      lembaga: lembaga || undefined,
      from: {
        name: tutorName,
        lines: [
          "Tutor Privat",
          tutorLocation,
          tutorContact,
        ].filter(Boolean),
      },
      to: {
        name: parentName,
        lines: [
          `Murid: ${studentName}`,
          studentInfo,
          studentAddress,
        ].filter(Boolean),
      },
      bank: { bank: bankCode, no: bankNo, name: bankName },
      items,
      notes,
    };
  };

  const handlePreview = () => {
    if (!validateInvoiceForm()) return;
    setInvoiceNo(generateInvoiceNo());
    setPreviewOpen(true);
  };

  const renderPreview = (dialog = false) => {
    const z = dialog ? dialogZoom : zoom;
    const setZ = dialog ? setDialogZoom : setZoom;
    const invoiceData = buildInvoiceData();
    return (
      <div
        className={"inv-preview-wrap" + (dialog ? " inv-preview-dialog" : "")}
        style={{ overflow: "auto" }}
      >
        <div className="inv-preview-toolbar">
          <div className="tw-title-md">{dialog ? "Tampilan" : "Periksa invoice"} · {template.charAt(0).toUpperCase() + template.slice(1)}</div>
          <div className="zoom-ctl">
            <IconButton
              label="Perkecil preview"
              icon={<Minus size={14} />}
              variant="quiet"
              size="compact"
              onClick={() => setZ((v) => Math.max(40, v - 10))}
            />
            <span className="z">{z}%</span>
            <IconButton
              label="Perbesar preview"
              icon={<Plus size={14} />}
              variant="quiet"
              size="compact"
              onClick={() => setZ((v) => Math.min(200, v + 10))}
            />
          </div>
        </div>
        <div style={{ overflow: "auto", flex: 1 }} className="a4-preview" ref={dialog ? dialogStageRef : undefined}>
          <div className="a4-stage" style={{ zoom: z / 100 }}>
            <A4Page>
              {template === "klasik" && <TplKlasik acc={accent} data={invoiceData} />}
              {template === "modern" && <TplModern acc={accent} data={invoiceData} />}
              {template === "minimal" && <TplMinimal acc={accent} data={invoiceData} />}
            </A4Page>
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <Surface padding="compact">
      <form
        id="invoice-form"
        ref={formRef}
        className="inv-form"
        onSubmit={(event) => event.preventDefault()}
      >

      <div className="inv-section">
        <SectionHeading level="h2" size="compact" title="Murid dan periode" />

        <Field controlId="invoice-student" label="Nama murid" required>
          <Select
            id="invoice-student"
            value={studentName}
            onChange={handleStudentChange}
            disabled={studentsLoading || studentsError || students.length === 0}
            options={studentsLoading
              ? [{ value: "", label: "Memuat..." }]
              : studentsError
                ? [{ value: "", label: "Murid belum dapat dimuat" }]
                : students.length === 0
                  ? [{ value: "", label: "Belum ada murid" }]
                  : students.map((student) => ({ value: student.name, label: student.name }))}
          />
        </Field>

        <p className="inv-student-meta" aria-live="polite">
          {`Tingkat pendidikan: ${studentInfo || "Belum tersedia"}`}
        </p>

        <div className="inv-period-fields">
          <Field controlId="invoice-period-start" label="Periode" required>
            <DateField
              id="invoice-period-start"
              value={periodStart}
              max={periodEnd || undefined}
              onChange={setPeriodStart}
            />
          </Field>
          <Field controlId="invoice-period-end" label="Sampai" required>
            <DateField
              id="invoice-period-end"
              value={periodEnd}
              min={periodStart || undefined}
              onChange={setPeriodEnd}
            />
          </Field>
        </div>

        {sessionsLoading ? (
          <div className="inv-auto-sessions" aria-live="polite">Memuat sesi selesai untuk periode ini...</div>
        ) : sessionsError ? (
          <div className="inv-auto-sessions inv-auto-sessions-error" aria-live="polite">Sesi belum dapat dimuat. Coba muat ulang halaman.</div>
        ) : invoiceSessions.length > 0 ? (
          <div className="inv-auto-sessions" aria-live="polite">
            Semua sesi selesai pada periode yang dipilih akan dimasukkan otomatis ke preview invoice.
          </div>
        ) : studentName && periodStart && periodEnd ? (
          <div className="inv-auto-sessions inv-auto-sessions-error" aria-live="polite">
            Pilih periode yang memiliki minimal satu sesi selesai.
          </div>
        ) : null}

      </div>

      <div className="inv-section">
        <SectionHeading level="h2" size="compact" title="Pembayaran" />

        <div className="inv-payment-fields">
          <Field controlId="invoice-bank-account" label="Bank" required>
            <TextField id="invoice-bank-account" value={bankAccount} onChange={setBankAccount} placeholder="BCA - 1234 5678 9012" />
          </Field>

          <Field controlId="invoice-bank-name" label="Nama Pemilik Rekening" required>
            <TextField id="invoice-bank-name" value={bankName} onChange={setBankName} placeholder="Contoh: Rina Novianti" />
          </Field>
        </div>
      </div>

      <div className="inv-section">
        <SectionHeading level="h2" size="compact" title="Tampilan invoice" />

        <div className="inv-choice-field">
          <div className="inv-choice-label">Template</div>
          <div className="template-picker">
            {TEMPLATES.map((t) => (
              <button
                type="button"
                key={t}
                className={"opt" + (template === t ? " on" : "")}
                aria-pressed={template === t}
                onClick={() => setTemplate(t)}
              >
                <div className="preview" style={{ background: t === "klasik" ? `linear-gradient(${accent} 22%, #fff 22%)` : "#fff" }}>
                  {t === "modern" && <div style={{ height: 3, background: accent, marginBottom: 4 }}></div>}
                  {t === "minimal" && <div style={{ borderBottom: `1px solid ${accent}`, paddingBottom: 3, fontFamily: "var(--f-title)", fontSize: 8, fontWeight: 700 }}>INVOICE</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
                    <div style={{ height: 2, background: "#eee", width: "80%" }}></div>
                    <div style={{ height: 2, background: "#eee", width: "90%" }}></div>
                    <div style={{ height: 2, background: "#eee", width: "70%" }}></div>
                    <div style={{ height: 2, background: "#eee", width: "85%" }}></div>
                  </div>
                  <div style={{ marginTop: "auto", height: 4, background: accent, width: "40%", alignSelf: "flex-end" }}></div>
                </div>
                <span className="nm">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="inv-choice-field">
          <div className="inv-choice-label">Warna Aksen</div>
          <div className="color-picker">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                className={"sw" + (c === accent ? " on" : "")}
                style={{ background: c, color: c }}
                aria-label={`Pilih warna ${c}`}
                aria-pressed={c === accent}
                onClick={() => setAccent(c)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="inv-section">
        <SectionHeading level="h2" size="compact" title="Profil tutor" />

        <Field controlId="invoice-tutor-name" label="Nama" required>
          <TextField id="invoice-tutor-name" value={tutorName} onChange={setTutorName} placeholder="Contoh: Nama tutor" />
        </Field>

        <Field controlId="invoice-service-name" label="Nama layanan atau brand (opsional)">
          <TextField id="invoice-service-name" value={lembaga} onChange={setLembaga} placeholder="Contoh: Les Privat Rina" />
        </Field>

        <Field controlId="invoice-tutor-location" label="Lokasi">
          <TextField id="invoice-tutor-location" value={tutorLocation} onChange={setTutorLocation} placeholder="Contoh: Jakarta Selatan" />
        </Field>

        <Field controlId="invoice-tutor-contact" label="Kontak">
          <TextField id="invoice-tutor-contact" value={tutorContact} onChange={setTutorContact} placeholder="Contoh: 0812-3456-7890" />
        </Field>
      </div>

      <div className="inv-section">
        <SectionHeading level="h2" size="compact" title="Penerima invoice" />

        <Field controlId="invoice-parent-name" label="Ditagih Kepada" required>
          <TextField id="invoice-parent-name" value={parentName} onChange={setParentName} placeholder="Contoh: Orang tua/wali murid" />
        </Field>

        <Field controlId="invoice-student-address" label="Alamat">
          <TextField id="invoice-student-address" value={studentAddress} onChange={setStudentAddress} placeholder="Jalan Sudirman" />
        </Field>
      </div>

      <div className="inv-section">
        <SectionHeading level="h2" size="compact" title="Catatan tambahan" />

        <Field controlId="invoice-notes" label="Catatan tambahan" labelVisuallyHidden>
          <Textarea
            id="invoice-notes"
            value={notes}
            onChange={setNotes}
            placeholder="Contoh: Bulan ini pembelajaran berfokus pada persiapan ujian dan penguatan materi."
          />
        </Field>
      </div>

      <div className="inv-section">
        <SectionHeading level="h2" size="compact" title="Pengaturan" />

        <label className="inv-save-check">
          <input
            type="checkbox"
            checked={saveSettings}
            onChange={(e) => handleToggleSave(e.target.checked)}
          />
          <span>Simpan pengaturan untuk invoice berikutnya</span>
        </label>

        <div className="tw-helper" style={{ marginTop: -4 }}>
          Yang disimpan: profil tutor, nama layanan, rekening pembayaran, dan
          tampilan invoice. Data tersimpan di perangkat ini dan terisi otomatis
          saat halaman dibuka lagi.
        </div>
      </div>

      <div className="inv-form-actions">
        <Button
          type="button"
          variant="quiet"
          size="compact"
          leadingIcon={<Eye size={16} aria-hidden="true" />}
          disabled={invoiceActionsDisabled}
          onClick={handlePreview}
        >
          Periksa invoice
        </Button>
        <Button
          type="button"
          size="compact"
          leadingIcon={invoiceDownloadLocked ? <LockKey size={14} aria-hidden="true" /> : undefined}
          trailingIcon={<DownloadSimple size={16} aria-hidden="true" />}
          loading={exporting}
          disabled={invoiceActionsDisabled}
          onClick={handleExportPDF}
        >
          Unduh PDF
        </Button>
      </div>
      {invoiceDownloadLocked ? (
        <div className="tw-helper inv-premium-note" style={{ marginTop: 4 }}>
          Unduh PDF invoice tersedia untuk Plus aktif.
        </div>
      ) : null}
      </form>
    </Surface>
  );

  const renderPreviewDialog = () => (
    <Dialog
      open={previewOpen}
      onOpenChange={setPreviewOpen}
      title="Periksa invoice"
      size="preview"
    >
      {renderPreview(true)}
    </Dialog>
  );

  return (
    <>
      <div>
        <section
          className={`app-invoice-mobile-handoff${mobileEditorOpen ? " app-invoice-mobile-handoff-hidden" : ""}`}
          aria-labelledby="invoice-mobile-handoff-title"
        >
          <Desktop size={34} aria-hidden="true" />
          <p>Invoice TutorLog</p>
          <h1 id="invoice-mobile-handoff-title">Buat invoice di laptop.</h1>
          <span>Editor dan preview A4 lebih nyaman diperiksa pada layar yang lebih lebar.</span>
          <div className="app-invoice-handoff-actions">
            <Button href="/app" size="large" block>Kembali ke Beranda</Button>
            <button
              type="button"
              className="app-invoice-continue"
              onClick={() => setMobileEditorOpen(true)}
            >
              Lanjutkan di sini
            </button>
          </div>
        </section>

        <div className={`app-invoice-route${mobileEditorOpen ? " app-invoice-route-open" : ""}`}>
          <RouteCanvas route="invoice">
            <PageMain>
              <section
                className={`app-invoice-main${mobileEditorOpen ? " app-invoice-mobile-editor" : ""}`}
                aria-labelledby="invoice-page-title"
              >
                <header className="app-invoice-heading">
                  <div>
                    <p>Invoice</p>
                    <h1 id="invoice-page-title">Buat invoice.</h1>
                    <span>Pilih murid dan periode untuk menyiapkan invoice.</span>
                  </div>
              <div className="inv-export-top">
                <Button
                  type="button"
                  size="compact"
                  leadingIcon={invoiceDownloadLocked ? <LockKey size={14} aria-hidden="true" /> : undefined}
                  trailingIcon={<DownloadSimple size={16} aria-hidden="true" />}
                  loading={exporting}
                  disabled={invoiceActionsDisabled}
                  onClick={handleExportPDF}
                >
                  Unduh PDF
                </Button>
              </div>
                </header>

                <div className="invoice-layout">
                  {renderForm()}
                  <div className="inv-preview-col">
                    <Surface variant="preview" padding="compact">
                      {renderPreview()}
                    </Surface>
                  </div>
                </div>
              </section>
            </PageMain>
          </RouteCanvas>
        </div>
      </div>

      {renderPreviewDialog()}

      <PaywallDialog
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        variant="invoice"
        reason={paywallReason}
      />

      {exportSuccess ? (
        <div className="app-success-toast" role="status">
          <CheckCircle size={20} weight="fill" aria-hidden="true" />
          <span>PDF invoice berhasil diunduh.</span>
        </div>
      ) : null}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          width: "794px",
          zIndex: -1,
        }}
      >
        <A4Page pageRef={exportRef}>
          {template === "klasik" && <TplKlasik acc={accent} data={buildInvoiceData()} />}
          {template === "modern" && <TplModern acc={accent} data={buildInvoiceData()} />}
          {template === "minimal" && <TplMinimal acc={accent} data={buildInvoiceData()} />}
        </A4Page>
      </div>
    </>
  );
}
