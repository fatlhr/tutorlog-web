"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle, Desktop, DownloadSimple, Eye, LockKey, Minus, Plus } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import TplKlasik, { type InvoiceData } from "@/components/invoice/TplKlasik";
import TplModern from "@/components/invoice/TplModern";
import TplMinimal from "@/components/invoice/TplMinimal";
import A4Page from "@/components/invoice/A4Page";
import PaywallDialog from "@/components/PaywallDialog";

const Required = () => <span style={{ color: "var(--tw-error)" }}> *</span>;

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

interface InvoiceSessionItem {
  id: string;
  clockIn: string;
  clockOut: string | null;
  note: string;
  hours: number;
  rate: number;
  amount: number;
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

  useLayoutEffect(() => {
    if (!previewOpen) return;
    const el = dialogStageRef.current;
    if (!el) return;
    let lastW = 0;
    const fit = () => {
      const w = el.clientWidth;
      if (w > 0 && Math.abs(w - lastW) > 8) {
        lastW = w;
        setDialogZoom(Math.max(40, Math.min(200, Math.floor(((w - 16) / 594) * 100))));
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
  const [quotaState, setQuotaState] = useState({ pdfExportUnlimited: false });
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);
  const [sessionsError, setSessionsError] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { setInvoiceNo(generateInvoiceNo()); }, []);

  const periodLabel = (() => {
    const s = new Date(periodStart + "T00:00:00");
    const e = new Date(periodEnd + "T00:00:00");
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Pilih periode";
    const sy = s.getFullYear() === e.getFullYear() ? "" : ` ${s.getFullYear()}`;
    return `${s.getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][s.getMonth()]}${sy} – ${e.getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][e.getMonth()]} ${e.getFullYear()}`;
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
    if (students.length === 0) {
      setStudentName("");
      setStudentInfo("");
      setStudentAddress("");
      setParentName("");
      return;
    }

    if (!students.some((student) => student.name === studentName)) {
      const firstStudent = students[0];
      setStudentName(firstStudent.name);
      setStudentInfo(firstStudent.educationLevel ?? "");
      setStudentAddress(firstStudent.address ?? "");
      setParentName(firstStudent.parentName ?? "");
    }
  }, [studentName, students]);

  useEffect(() => {
    if (!studentName || !periodStart || !periodEnd) {
      setInvoiceSessions([]);
      setSessionsError(false);
      return;
    }
    const doFetch = async () => {
      setSessionsLoading(true);
      setSessionsError(false);
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
          const billingType = (row.billing_type_snapshot as string) ?? null;
          const amount = billingType === "flat" ? (rate || 0) : Math.round(hours * rate);
          const relation = row.session_learning_notes;
          const noteRecord = Array.isArray(relation) ? relation[0] : relation;
          const note = typeof (noteRecord as Record<string, unknown> | null)?.tutor_note === "string"
            ? ((noteRecord as Record<string, unknown>).tutor_note as string).trim()
            : "";

          return { id: row.id as string, clockIn, clockOut, note: note || "Belum ada catatan sesi", hours, rate, amount };
        });

        setInvoiceSessions(items);
      } catch {
        setInvoiceSessions([]);
        setSessionsError(true);
      } finally {
        setSessionsLoading(false);
      }
    };
    doFetch();
  }, [studentName, periodStart, periodEnd, supabase]);

  useEffect(() => {
    const doCheck = async () => {
      try {
        const { data, error } = await supabase.rpc("get_user_access_status");
        if (!error && data) {
          const result = data as Record<string, unknown>;
          setQuotaState({
            pdfExportUnlimited: (result.pdf_export_unlimited as boolean) ?? false,
          });
        }
      } catch { /* ignore */ }
    };
    doCheck();
  }, [supabase]);

  const handleExportPDF = useCallback(async () => {
    if (!quotaState.pdfExportUnlimited) {
      setPaywallOpen(true);
      return;
    }
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

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice-${invoiceNo.replace("/", "-")}.pdf`);
      setExportSuccess(true);

      try {
        await supabase.rpc("record_feature_usage_event", {
          p_feature_key: "invoice_export",
          p_event_type: "success",
          p_metadata: { format: "pdf" },
        });
      } catch { /* non-blocking */ }
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [invoiceNo, quotaState.pdfExportUnlimited, supabase]);

  useEffect(() => {
    if (!exportSuccess) return;
    const timer = window.setTimeout(() => setExportSuccess(false), 3600);
    return () => window.clearTimeout(timer);
  }, [exportSuccess]);

  const handleStudentChange = (name: string) => {
    setStudentName(name);
    const found = students.find((s) => s.name === name);
    if (found) {
      if (found.educationLevel) setStudentInfo(found.educationLevel);
      if (found.address) setStudentAddress(found.address);
      if (found.parentName) setParentName(found.parentName);
    }
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
      if (typeof draft.studentName === "string") setStudentName(draft.studentName);
      if (typeof draft.invoiceNo === "string") setInvoiceNo(draft.invoiceNo);
      if (typeof draft.lembaga === "string") setLembaga(draft.lembaga);
      if (typeof draft.tutorName === "string") setTutorName(draft.tutorName);
      if (typeof draft.tutorLocation === "string") setTutorLocation(draft.tutorLocation);
      if (typeof draft.tutorContact === "string") setTutorContact(draft.tutorContact);
      if (typeof draft.parentName === "string") setParentName(draft.parentName);
      if (typeof draft.studentInfo === "string") setStudentInfo(draft.studentInfo);
      if (typeof draft.studentAddress === "string") setStudentAddress(draft.studentAddress);
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
        studentInfo,
        studentAddress,
        bankAccount,
        bankName,
        notes,
        accent,
        template,
      }));
    } catch { /* localStorage not available */ }
  }, [draftReady, periodStart, periodEnd, studentName, invoiceNo, lembaga, tutorName, tutorLocation, tutorContact, parentName, studentInfo, studentAddress, bankAccount, bankName, notes, accent, template]);

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
    const dueDate = new Date(periodEnd);
    dueDate.setDate(dueDate.getDate() + 7);

    const bankParts = bankAccount.split(" · ");
    const bankCode = bankParts[0] || bankAccount;
    const bankNo = bankParts[1] || bankAccount;

    const items = invoiceSessions.map((s) => ({
      date: formatMonthDay(new Date(s.clockIn)),
      desc: s.note,
      h: s.hours,
      rate: s.rate,
    }));

    return {
      no: invoiceNo,
      date: formatInvoiceDate(now),
      due: formatInvoiceDate(dueDate),
      period: periodLabel,
      lembaga: lembaga || undefined,
      from: {
        name: tutorName,
        lines: [
          lembaga || "Tutor Privat",
          tutorLocation,
          tutorContact,
        ].filter(Boolean),
      },
      to: {
        name: parentName,
        lines: [
          studentInfo ? `Orang tua ${studentName}` : studentName,
          studentInfo || "",
          studentAddress || "",
        ].filter(Boolean),
      },
      bank: { bank: bankCode, no: bankNo, name: bankName },
      items,
      notes,
    };
  };

  const renderPreview = (dialog = false) => {
    const z = dialog ? dialogZoom : zoom;
    const setZ = dialog ? setDialogZoom : setZoom;
    const invoiceData = buildInvoiceData();
    return (
      <div
        className={"inv-preview-wrap" + (dialog ? " inv-preview-dialog" : "")}
        style={{ overflow: "auto" }}
        onClick={dialog ? (e) => e.stopPropagation() : undefined}
      >
        {dialog && (
          <div className="inv-dialog-close">
            <button type="button" onClick={() => setPreviewOpen(false)} className="btn btn-ghost btn-sm">Tutup</button>
          </div>
        )}
        <div className="inv-preview-toolbar">
          <div className="tw-title-md">Periksa invoice · {template.charAt(0).toUpperCase() + template.slice(1)}</div>
          <div className="zoom-ctl">
            <button type="button" onClick={() => setZ((v) => Math.max(40, v - 10))} aria-label="Perkecil preview"><Minus size={14} /></button>
            <span className="z">{z}%</span>
            <button type="button" onClick={() => setZ((v) => Math.min(200, v + 10))} aria-label="Perbesar preview"><Plus size={14} /></button>
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
    <div className="inv-form" style={{ overflowY: "auto", paddingRight: 8 }}>

      <div className="inv-section">
        <h4 className="inv-section-title">Murid dan periode</h4>

        <div className="field">
          <div className="lbl">Nama murid<Required /></div>
          <select className="input" value={studentName} onChange={(e) => handleStudentChange(e.target.value)} style={{ appearance: "none", cursor: "pointer", backgroundImage: "none" }} disabled={studentsLoading || studentsError || students.length === 0}>
            {studentsLoading ? (
              <option value="">Memuat...</option>
            ) : studentsError ? (
              <option value="">Murid belum dapat dimuat</option>
            ) : students.length === 0 ? (
              <option value="">Belum ada murid</option>
            ) : (
              students.map((student) => (
                <option key={student.id} value={student.name}>{student.name}</option>
              ))
            )}
          </select>
        </div>

        <div className="field">
          <div className="lbl">Periode<Required /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="input" style={{ flex: 1, minWidth: 0, cursor: "pointer" }} />
            <span style={{ color: "var(--tw-text-3)", fontWeight: 700, flexShrink: 0 }}>sampai</span>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="input" style={{ flex: 1, minWidth: 0, cursor: "pointer" }} />
          </div>
          <div className="help" style={{ marginTop: 4 }}>{periodLabel}</div>
        </div>

        {sessionsLoading ? (
          <div className="inv-auto-sessions">Memuat sesi selesai untuk periode ini...</div>
        ) : sessionsError ? (
          <div className="inv-auto-sessions inv-auto-sessions-error">Sesi belum dapat dimuat. Coba muat ulang halaman.</div>
        ) : invoiceSessions.length > 0 ? (
          <div className="inv-auto-sessions">
            <strong>{invoiceSessions.length} sesi dimuat otomatis.</strong>
            <span>Semua sesi selesai pada periode ini dimasukkan otomatis ke preview.</span>
          </div>
        ) : studentName && periodStart && periodEnd ? (
          <div className="inv-auto-sessions">Belum ada sesi untuk {studentName} pada periode ini.</div>
        ) : null}

      </div>

      <div className="inv-section">
        <h4 className="inv-section-title">Pembayaran</h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <div className="lbl">Bank<Required /></div>
            <input className="input" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="BCA · 1234 5678 9012" />
          </div>

          <div className="field">
            <div className="lbl">Nama Pemilik Rekening<Required /></div>
            <input className="input" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="inv-section">
        <h4 className="inv-section-title">Tampilan invoice</h4>

        <div className="field">
          <div className="lbl">Template</div>
          <div className="template-picker">
            {TEMPLATES.map((t) => (
              <div key={t} className={"opt" + (template === t ? " on" : "")} onClick={() => setTemplate(t)}>
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
              </div>
            ))}
          </div>
        </div>

        <div className="field">
          <div className="lbl">Warna Aksen</div>
          <div className="color-picker">
            {COLORS.map((c) => (
              <span key={c} className={"sw" + (c === accent ? " on" : "")} style={{ background: c, color: c }} onClick={() => setAccent(c)} />
            ))}
          </div>
        </div>
      </div>

      <div className="inv-section-row">
        <div className="inv-section-col inv-tutor-details">
          <h4 className="inv-section-title">Detail tambahan</h4>

          <div className="field">
            <div className="lbl">Nama<Required /></div>
            <input className="input" value={tutorName} onChange={(e) => setTutorName(e.target.value)} />
          </div>

          <div className="field">
            <div className="lbl">Nama layanan atau brand (opsional)</div>
            <input className="input" value={lembaga} onChange={(e) => setLembaga(e.target.value)} placeholder="Contoh: Les Privat Rina" />
          </div>

          <div className="field">
            <div className="lbl">Lokasi</div>
            <input className="input" value={tutorLocation} onChange={(e) => setTutorLocation(e.target.value)} />
          </div>

          <div className="field">
            <div className="lbl">Kontak</div>
            <input className="input" value={tutorContact} onChange={(e) => setTutorContact(e.target.value)} />
          </div>
        </div>

        <div className="divide inv-section-divide"></div>

        <div className="inv-section-col inv-student-details">
          <h4 className="inv-section-title">Detail murid</h4>

          <div className="field">
            <div className="lbl">Tingkat Pendidikan</div>
            <input className="input" value={studentInfo} onChange={(e) => setStudentInfo(e.target.value)} placeholder="Kelas 10 – SMA Al-Azhar" />
          </div>

          <div className="field">
            <div className="lbl">Ditagih Kepada<Required /></div>
            <input className="input" value={parentName} onChange={(e) => setParentName(e.target.value)} />
          </div>

          <div className="field">
            <div className="lbl">Alamat</div>
            <input className="input" value={studentAddress} onChange={(e) => setStudentAddress(e.target.value)} placeholder="Jl. Kemang Raya No. 42" />
          </div>
        </div>
      </div>

      <div className="inv-section">
        <h4 className="inv-section-title">Catatan tambahan</h4>

        <div className="field">
          <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ height: "auto", minHeight: 72, alignItems: "flex-start", paddingTop: 14, paddingBottom: 14, lineHeight: 1.5, resize: "vertical" }} />
        </div>
      </div>

      <div className="inv-section">
        <h4 className="inv-section-title">Pengaturan</h4>

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
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setInvoiceNo(generateInvoiceNo()); setPreviewOpen(true); }}>
          <Eye size={16} />
          <span>Periksa invoice</span>
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleExportPDF} disabled={exporting || invoiceSessions.length === 0}>
          <LockKey size={14} />
          <span>{exporting ? "Menyiapkan..." : "Unduh PDF"}</span>
          <DownloadSimple size={16} />
        </button>
      </div>
      <div className="tw-helper inv-premium-note" style={{ marginTop: 4 }}>
        Unduh PDF tersedia untuk TutorLog Plus.
      </div>
    </div>
  );

  const renderPreviewDialog = () => (
    previewOpen && (
      <div
        className="inv-preview-scrim"
        onClick={() => setPreviewOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Periksa invoice"
      >
        {renderPreview(true)}
      </div>
    )
  );

  return (
    <>
      <div id="main-content">
        <main className={`app-invoice-mobile-handoff${mobileEditorOpen ? " app-invoice-mobile-handoff-hidden" : ""}`}>
          <Desktop size={34} aria-hidden="true" />
          <p>Invoice TutorLog</p>
          <h1>Buat invoice di laptop.</h1>
          <span>Editor dan preview A4 lebih nyaman diperiksa pada layar yang lebih lebar.</span>
          <div className="app-invoice-handoff-actions">
            <Link className="btn btn-primary" href="/app">Kembali ke Beranda</Link>
            <button type="button" className="btn btn-ghost" onClick={() => setMobileEditorOpen(true)}>Lanjutkan di sini</button>
          </div>
        </main>

        <main className={`app-main app-invoice-main${mobileEditorOpen ? " app-invoice-mobile-editor" : ""}`}>
          <header className="app-invoice-heading">
            <div>
              <p>Invoice</p>
              <h1>Buat invoice.</h1>
              <span>Pilih murid dan periode. Sesi yang tersimpan akan dimasukkan otomatis.</span>
            </div>
            <div className="inv-export-top">
              <button type="button" className="btn btn-primary btn-sm" onClick={handleExportPDF} disabled={exporting || invoiceSessions.length === 0}>
                <LockKey size={14} />
                <span>{exporting ? "Menyiapkan..." : "Unduh PDF"}</span>
                <DownloadSimple size={16} />
              </button>
            </div>
          </header>

          <div className="invoice-layout">
            {renderForm()}
            <div className="inv-preview-col">{renderPreview()}</div>
          </div>
        </main>
      </div>

      {renderPreviewDialog()}

      <PaywallDialog open={paywallOpen} onClose={() => setPaywallOpen(false)} variant="invoice" />

      {exportSuccess ? (
        <div className="app-success-toast" role="status">
          <CheckCircle size={20} weight="fill" aria-hidden="true" />
          <span>PDF invoice berhasil diunduh.</span>
        </div>
      ) : null}

      <div
        ref={exportRef}
        style={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          width: "794px",
          zIndex: -1,
        }}
      >
        <div style={{ width: "794px", aspectRatio: "1 / 1.4142", background: "#fff", padding: "42px", position: "relative", overflow: "hidden", fontFamily: "var(--f-body)", fontSize: "11px", color: "var(--tw-text)" }}>
          {template === "klasik" && <TplKlasik acc={accent} data={buildInvoiceData()} />}
          {template === "modern" && <TplModern acc={accent} data={buildInvoiceData()} />}
          {template === "minimal" && <TplMinimal acc={accent} data={buildInvoiceData()} />}
          <div style={{ position: "absolute", right: "20px", bottom: "16px", fontFamily: "var(--f-body)", fontStyle: "italic", fontSize: "9px", color: "var(--tw-text-3)", opacity: 0.6 }}>Generated by TutorLog</div>
        </div>
      </div>
    </>
  );
}
