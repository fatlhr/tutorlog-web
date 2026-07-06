"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import TplKlasik, { type InvoiceData } from "@/components/invoice/TplKlasik";
import TplModern from "@/components/invoice/TplModern";
import TplMinimal from "@/components/invoice/TplMinimal";
import A4Page from "@/components/invoice/A4Page";
import PaywallDialog from "@/components/PaywallDialog";

const MonitorIcon = () => (
  <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8 M12 17v4" />
  </svg>
);

const IcMinus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
  </svg>
);

const IcPlus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14 M5 12h14" />
  </svg>
);

const IcLockSm = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 10V7a3 3 0 0 1 6 0v3 M4 10h10v7H4z" />
  </svg>
);

const IcDownload = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" />
  </svg>
);

const IcEye = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const Required = () => <span style={{ color: "var(--tw-error)" }}> *</span>;

const COLORS = ["#006C53", "#235C8F", "#805346", "#635880", "#8A5A00", "#161D1F"];
const TEMPLATES = ["klasik", "modern", "minimal"] as const;
type Template = (typeof TEMPLATES)[number];

const DUMMY_STUDENTS = [
  { id: "dummy-1", name: "Bintang Wijaya", hourlyRate: null, billingType: null, educationLevel: "Kelas 10 – SMA Al-Azhar", address: "Jl. Kemang Raya No. 42, Jakarta Selatan", parentName: "Bpk. Ahmad Wijaya" },
  { id: "dummy-2", name: "Kirana Putri", hourlyRate: null, billingType: null, educationLevel: "Kelas 8 – SMP Labschool", address: null, parentName: null },
  { id: "dummy-3", name: "Aditya Rahman", hourlyRate: null, billingType: null, educationLevel: null, address: null, parentName: null },
  { id: "dummy-4", name: "Meilani Sari", hourlyRate: null, billingType: null, educationLevel: null, address: null, parentName: null },
];

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
  subject: string;
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

  const [showMobileDialog, setShowMobileDialog] = useState(true);
  const [periodStart, setPeriodStart] = useState("2026-06-01");
  const [periodEnd, setPeriodEnd] = useState("2026-06-30");
  const [lembaga, setLembaga] = useState("");
  const [tutorName, setTutorName] = useState("Rina Novianti");
  const [tutorLocation, setTutorLocation] = useState("Jakarta Selatan");
  const [tutorContact, setTutorContact] = useState("rina@tutorlog.id · 0812-3456-7890");
  const [parentName, setParentName] = useState("Bpk. Ahmad Wijaya");
  const [studentName, setStudentName] = useState("Bintang Wijaya");
  const [studentInfo, setStudentInfo] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("BCA · 1234 5678 9012");
  const [bankName, setBankName] = useState("Rina Novianti");
  const [notes, setNotes] = useState("Terima kasih atas kepercayaannya. Pembayaran paling lambat 7 Juli 2026.");
  const [saveSettings, setSaveSettings] = useState(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [invoiceSessions, setInvoiceSessions] = useState<InvoiceSessionItem[]>([]);
  const [invoiceNo, setInvoiceNo] = useState(generateInvoiceNo());
  const [exporting, setExporting] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const periodLabel = (() => {
    const s = new Date(periodStart + "T00:00:00");
    const e = new Date(periodEnd + "T00:00:00");
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "1 – 30 Juni 2026";
    const sy = s.getFullYear() === e.getFullYear() ? "" : ` ${s.getFullYear()}`;
    return `${s.getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][s.getMonth()]}${sy} – ${e.getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][e.getMonth()]} ${e.getFullYear()}`;
  })();

  useEffect(() => {
    const doFetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setStudents(DUMMY_STUDENTS); return; }

        const { data, error } = await supabase
          .from("student_locations")
          .select("id, student_name, hourly_rate, billing_type, education_level, address, parent_name")
          .eq("tutor_id", user.id)
          .is("deleted_at", null)
          .order("student_name", { ascending: true });

        if (error || !data) { setStudents(DUMMY_STUDENTS); return; }

        const list: StudentOption[] = (data as Record<string, unknown>[]).map((row) => ({
          id: row.id as string,
          name: (row.student_name as string) ?? "Tanpa Nama",
          hourlyRate: (row.hourly_rate as number) ?? null,
          billingType: (row.billing_type as string) ?? null,
          educationLevel: (row.education_level as string) ?? null,
          address: (row.address as string) ?? null,
          parentName: (row.parent_name as string) ?? null,
        }));

        setStudents(list.length > 0 ? list : DUMMY_STUDENTS);
      } catch {
        setStudents(DUMMY_STUDENTS);
      }
    };
    doFetch();
  }, [supabase]);

  useEffect(() => {
    if (!studentName || !periodStart || !periodEnd) return;
    const doFetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setInvoiceSessions([]); return; }

        const startISO = new Date(periodStart + "T00:00:00").toISOString();
        const endISO = new Date(periodEnd + "T23:59:59.999").toISOString();

        const { data, error } = await supabase
          .from("sessions")
          .select("id, clock_in_at, clock_out_at, student_name_snapshot, education_level_snapshot, hourly_rate_snapshot, billing_type_snapshot, teaching_mode")
          .eq("tutor_id", user.id)
          .eq("status", "completed")
          .gte("clock_in_at", startISO)
          .lte("clock_in_at", endISO)
          .order("clock_in_at", { ascending: true });

        if (error || !data) { setInvoiceSessions([]); return; }

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
          const educationLevel = (row.education_level_snapshot as string) ?? "";
          const teachingMode = (row.teaching_mode as string) ?? "";

          let subject = educationLevel;
          if (teachingMode && subject) subject += ` · ${teachingMode}`;
          else if (teachingMode) subject = teachingMode;

          return { id: clockIn, clockIn, clockOut, subject: subject || "Sesi les", hours, rate, amount };
        });

        setInvoiceSessions(items);
      } catch {
        setInvoiceSessions([]);
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
          setIsPremium((result.pdf_export_unlimited as boolean) ?? false);
        }
      } catch { /* ignore */ }
    };
    doCheck();
  }, [supabase]);

  const handleExportPDF = useCallback(async () => {
    if (!isPremium) {
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
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [invoiceNo, isPremium]);

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

    const items = invoiceSessions.length > 0
      ? invoiceSessions.map((s) => ({
          date: formatMonthDay(new Date(s.clockIn)),
          desc: s.subject || "Sesi les",
          h: s.hours,
          rate: s.rate,
        }))
      : [
          { date: "03 Jun", desc: "Matematika · Trigonometri", h: 1.5, rate: 120000 },
          { date: "05 Jun", desc: "Matematika · Latihan Soal", h: 1.5, rate: 120000 },
          { date: "10 Jun", desc: "Fisika · Gerak Lurus", h: 2.0, rate: 130000 },
          { date: "12 Jun", desc: "Matematika · Trigonometri", h: 1.5, rate: 120000 },
          { date: "17 Jun", desc: "Fisika · Hukum Newton", h: 2.0, rate: 130000 },
          { date: "19 Jun", desc: "Matematika · Persiapan UH", h: 1.5, rate: 120000 },
          { date: "24 Jun", desc: "Fisika · Energi & Usaha", h: 2.0, rate: 130000 },
          { date: "26 Jun", desc: "Matematika · Review UH", h: 1.5, rate: 120000 },
        ];

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
          <div className="tw-title-md">Preview · {template.charAt(0).toUpperCase() + template.slice(1)}</div>
          <div className="zoom-ctl">
            <button type="button" onClick={() => setZ((v) => Math.max(40, v - 10))}><IcMinus /></button>
            <span className="z">{z}%</span>
            <button type="button" onClick={() => setZ((v) => Math.min(200, v + 10))}><IcPlus /></button>
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
        <h4 className="inv-section-title">Invoice</h4>

        <div className="field">
          <div className="lbl">Periode<Required /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="input" style={{ flex: 1, minWidth: 0, cursor: "pointer" }} />
            <span style={{ color: "var(--tw-text-3)", fontWeight: 700, flexShrink: 0 }}>—</span>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="input" style={{ flex: 1, minWidth: 0, cursor: "pointer" }} />
          </div>
          <div className="help" style={{ marginTop: 4 }}>{periodLabel}</div>
        </div>

        <div className="field">
          <div className="lbl">Nomor Invoice</div>
          <input className="input mono" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
        </div>

      </div>

      <div className="divide"></div>

      <div className="inv-section-row">
        <div className="inv-section-col">
          <h4 className="inv-section-title">Tutor</h4>

          <div className="field">
            <div className="lbl">Nama<Required /></div>
            <input className="input" value={tutorName} onChange={(e) => setTutorName(e.target.value)} />
          </div>

          <div className="field">
            <div className="lbl">Lembaga</div>
            <input className="input" value={lembaga} onChange={(e) => setLembaga(e.target.value)} placeholder="Nama bimbel atau jasa les" />
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

        <div className="inv-section-col">
          <h4 className="inv-section-title">Murid</h4>

          <div className="field">
            <div className="lbl">Nama Murid<Required /></div>
            <select className="input" value={studentName} onChange={(e) => handleStudentChange(e.target.value)} style={{ appearance: "none", cursor: "pointer", backgroundImage: "none" }}>
              {students.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <div className="lbl">Ditagih Kepada<Required /></div>
            <input className="input" value={parentName} onChange={(e) => setParentName(e.target.value)} />
          </div>

          <div className="field">
            <div className="lbl">Tingkat Pendidikan</div>
            <input className="input" value={studentInfo} onChange={(e) => setStudentInfo(e.target.value)} placeholder="Kelas 10 – SMA Al-Azhar" />
          </div>

          <div className="field">
            <div className="lbl">Alamat</div>
            <input className="input" value={studentAddress} onChange={(e) => setStudentAddress(e.target.value)} placeholder="Jl. Kemang Raya No. 42" />
          </div>

          {invoiceSessions.length > 0 && (
            <div className="field">
              <div className="lbl">Item Invoice</div>
              <div className="tw-helper" style={{ marginTop: 2 }}>
                {invoiceSessions.length} sesi otomatis dari {studentName} ({periodLabel})
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="divide"></div>

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

      <div className="divide"></div>

      <div className="inv-section">
        <h4 className="inv-section-title">Catatan</h4>

        <div className="field">
          <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ height: "auto", minHeight: 72, alignItems: "flex-start", paddingTop: 14, paddingBottom: 14, lineHeight: 1.5, resize: "vertical" }} />
        </div>
      </div>

      <div className="divide"></div>

      <div className="inv-section">
        <h4 className="inv-section-title">Tema</h4>

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

      <div className="divide"></div>

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
          Yang disimpan: profil tutor (nama, lembaga, lokasi, kontak), rekening
          pembayaran, dan tema (template + warna aksen) — tersimpan di perangkat
          ini dan terisi otomatis saat halaman dibuka lagi.
        </div>
      </div>

      <div className="divide"></div>

      <div className="inv-form-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setInvoiceNo(generateInvoiceNo()); setPreviewOpen(true); }}>
          <IcEye />
          <span>Lihat Preview</span>
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleExportPDF} disabled={exporting}>
          <IcLockSm />
          <span>{exporting ? "Mengekspor..." : "Export PDF"}</span>
          <IcDownload size={16} />
        </button>
      </div>
      <div className="tw-helper inv-premium-note" style={{ marginTop: 4 }}>
        Fitur premium — perlu langganan aktif.
      </div>
    </div>
  );

  const renderPreviewDialog = () => (
    previewOpen && (
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,.5)", display: "flex",
          alignItems: "center", justifyContent: "center",
          padding: 8,
        }}
        onClick={() => setPreviewOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Preview Invoice"
      >
        {renderPreview(true)}
      </div>
    )
  );

  return (
    <>
      {showMobileDialog && (
        <div className="vp-mobile">
          <div className="mob-page tw">
            <div className="mob-app-shell">
              <div className="mob-dialog-scrim">
                <div className="mob-dialog-card">
                  <div className="mob-dialog-icon"><MonitorIcon /></div>
                  <h2 className="mob-dialog-title">Buka di Desktop</h2>
                  <p className="mob-dialog-desc">Invoice Builder dirancang untuk layar lebar. Buka di laptop atau PC untuk pengalaman terbaik.</p>
                  <div className="mob-dialog-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%" }}
                      onClick={() => setShowMobileDialog(false)}
                    >
                      Tetap Lanjutkan
                    </button>
                    <Link href="/app" className="btn btn-ghost btn-sm" style={{ width: "100%" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5 M11 6l-6 6 6 6" /></svg>
                      <span>Kembali ke Home</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showMobileDialog && (
        <div className="vp-mobile">
          <div className="mob-page tw">
            <div className="mob-app-shell">
              <div className="mob-app-main" style={{ padding: "20px 16px 100px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h1 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 20, margin: 0 }}>Invoice Builder</h1>
                  <Link href="/app" className="btn btn-ghost btn-sm">← Home</Link>
                </div>
                {renderForm()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="vp-desktop">
        <main className="app-main" style={{ padding: "32px 40px 40px", position: "relative" }}>
          <div className="app-header">
            <div>
              <h1>Invoice Builder</h1>
              <div className="sub">Pilih murid & rentang tanggal — semua sesi akan otomatis dimasukkan.</div>
            </div>
          </div>

          <div className="inv-export-top">
              <button type="button" className="btn btn-primary btn-sm" onClick={handleExportPDF} disabled={exporting}>
                <IcLockSm />
                <span>{exporting ? "Mengekspor..." : "Export PDF"}</span>
                <IcDownload size={16} />
              </button>
            </div>
            <div className="invoice-layout">
            {renderForm()}
            <div className="inv-preview-col">
              {renderPreview()}
            </div>
          </div>
        </main>
      </div>

      {renderPreviewDialog()}

      <PaywallDialog open={paywallOpen} onClose={() => setPaywallOpen(false)} />

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