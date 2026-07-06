"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import TplKlasik from "@/components/invoice/TplKlasik";
import TplModern from "@/components/invoice/TplModern";
import TplMinimal from "@/components/invoice/TplMinimal";
import A4Page from "@/components/invoice/A4Page";

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

const IcChevD = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
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

const COLORS = ["#006C53", "#235C8F", "#805346", "#635880", "#8A5A00", "#161D1F"];
const TEMPLATES = ["klasik", "modern", "minimal"] as const;
type Template = (typeof TEMPLATES)[number];

export default function InvoicePage() {
  const [template, setTemplate] = useState<Template>("klasik");
  const [accent, setAccent] = useState("#006C53");
  const [zoom, setZoom] = useState(75);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("INV-2026/06-014");
  const [periodStart, setPeriodStart] = useState("2026-06-01");
  const [periodEnd, setPeriodEnd] = useState("2026-06-30");
  const [lembaga, setLembaga] = useState("Rina Novianti · Bimbel Privat");
  const [tutorName, setTutorName] = useState("Rina Novianti");
  const [tutorLocation, setTutorLocation] = useState("Jakarta Selatan");
  const [tutorContact, setTutorContact] = useState("rina@tutorlog.id · 0812-3456-7890");
  const [parentName, setParentName] = useState("Bpk. Ahmad Wijaya");
  const [studentInfo, setStudentInfo] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("BCA · 1234 5678 9012");
  const [bankName, setBankName] = useState("Rina Novianti");
  const [notes, setNotes] = useState("Terima kasih atas kepercayaannya. Pembayaran paling lambat 7 Juli 2026.");
  const [hasSaved, setHasSaved] = useState(() => {
    try {
      return localStorage.getItem("tutorlog-invoice-settings") !== null;
    } catch {
      return false;
    }
  });

  const periodLabel = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const s = new Date(periodStart + "T00:00:00");
    const e = new Date(periodEnd + "T00:00:00");
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "1 – 30 Juni 2026";
    const sy = s.getFullYear() === e.getFullYear() ? "" : ` ${s.getFullYear()}`;
    return `${s.getDate()} ${months[s.getMonth()]}${sy} – ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
  })();

  const handleSaveSettings = useCallback(() => {
    try {
      localStorage.setItem("tutorlog-invoice-settings", JSON.stringify({
        accent, bankAccount, bankName, lembaga,
        tutorName, tutorLocation, tutorContact,
      }));
      setHasSaved(true);
    } catch {
      // localStorage not available
    }
  }, [accent, bankAccount, bankName, lembaga, tutorName, tutorLocation, tutorContact]);

  const handleLoadSettings = useCallback(() => {
    try {
      const saved = localStorage.getItem("tutorlog-invoice-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.accent) setAccent(parsed.accent);
        if (parsed.bankAccount) setBankAccount(parsed.bankAccount);
        if (parsed.bankName) setBankName(parsed.bankName);
        if (parsed.lembaga) setLembaga(parsed.lembaga);
        if (parsed.tutorName) setTutorName(parsed.tutorName);
        if (parsed.tutorLocation) setTutorLocation(parsed.tutorLocation);
        if (parsed.tutorContact) setTutorContact(parsed.tutorContact);
      }
    } catch {
      // ignore
    }
  }, []);

  const renderPreview = () => (
    <div className="inv-preview-wrap" style={{ overflow: "auto" }}>
      <div className="inv-preview-toolbar">
        <div className="tw-title-md">Preview · {template.charAt(0).toUpperCase() + template.slice(1)}</div>
        <div className="zoom-ctl">
          <button type="button" onClick={() => setZoom(Math.max(40, zoom - 10))}><IcMinus /></button>
          <span className="z">{zoom}%</span>
          <button type="button" onClick={() => setZoom(Math.min(200, zoom + 10))}><IcPlus /></button>
        </div>
      </div>
      <div style={{ overflow: "auto", flex: 1 }} className="a4-preview">
        <div className="a4-stage" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
          <A4Page>
            {template === "klasik" && <TplKlasik acc={accent} />}
            {template === "modern" && <TplModern acc={accent} />}
            {template === "minimal" && <TplMinimal acc={accent} />}
          </A4Page>
        </div>
      </div>
    </div>
  );

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
        <main className="app-main" style={{ padding: "32px 40px 40px", position: "relative" }}>
          <div className="app-header">
            <div>
              <h1>Invoice Builder</h1>
              <div className="sub">Pilih murid & rentang tanggal — semua sesi akan otomatis dimasukkan.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn btn-secondary btn-sm">Simpan draft</button>
              <button type="button" className="btn btn-primary btn-sm">
                <IcLockSm />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          <div className="invoice-layout">
            <div className="inv-form" style={{ overflowY: "auto", paddingRight: 8 }}>

              {/* Section: Invoice */}
              <div className="inv-section">
                <h4 className="inv-section-title">Invoice</h4>

                <div className="field">
                  <div className="lbl">Nomor Invoice</div>
                  <input className="input" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} style={{ fontFamily: "var(--f-title)", fontWeight: 700 }} />
                </div>

                <div className="field">
                  <div className="lbl">Periode</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="input" style={{ flex: 1, minWidth: 0, cursor: "pointer" }} />
                    <span style={{ color: "var(--tw-text-3)", fontWeight: 700, flexShrink: 0 }}>—</span>
                    <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="input" style={{ flex: 1, minWidth: 0, cursor: "pointer" }} />
                  </div>
                  <div className="help" style={{ marginTop: 4 }}>{periodLabel}</div>
                </div>
              </div>

              <div className="divide"></div>

              {/* Section: Tutor & Murid */}
              <div className="inv-section-row">
                <div className="inv-section-col">
                  <h4 className="inv-section-title">Tutor</h4>

                  <div className="field">
                    <div className="lbl">Nama</div>
                    <input className="input" value={tutorName} onChange={(e) => setTutorName(e.target.value)} />
                  </div>

                  <div className="field">
                    <div className="lbl">Lembaga</div>
                    <input className="input" value={lembaga} onChange={(e) => setLembaga(e.target.value)} placeholder="Opsional" />
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
                    <div className="lbl">Nama Murid</div>
                    <div className="input" style={{ justifyContent: "space-between" }}>
                      <span>Bintang Wijaya</span>
                      <IcChevD />
                    </div>
                  </div>

                  <div className="field">
                    <div className="lbl">Ditagih Kepada</div>
                    <input className="input" value={parentName} onChange={(e) => setParentName(e.target.value)} />
                  </div>

                  <div className="field">
                    <div className="lbl">Tingkat Pendidikan</div>
                    <input className="input" value={studentInfo} onChange={(e) => setStudentInfo(e.target.value)} placeholder="Opsional" />
                  </div>

                  <div className="field">
                    <div className="lbl">Alamat</div>
                    <input className="input" value={studentAddress} onChange={(e) => setStudentAddress(e.target.value)} placeholder="Opsional" />
                  </div>
                </div>
              </div>

              <div className="divide"></div>

              {/* Section: Pembayaran */}
              <div className="inv-section">
                <h4 className="inv-section-title">Pembayaran</h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="field">
                    <div className="lbl">Bank</div>
                    <input className="input" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="BCA · 1234 5678 9012" />
                  </div>

                  <div className="field">
                    <div className="lbl">Nama Pemilik Rekening</div>
                    <input className="input" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="divide"></div>

              {/* Section: Catatan */}
              <div className="inv-section">
                <h4 className="inv-section-title">Catatan</h4>

                <div className="field">
                  <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ height: "auto", minHeight: 72, alignItems: "flex-start", paddingTop: 14, paddingBottom: 14, lineHeight: 1.5, resize: "vertical" }} />
                </div>
              </div>

              <div className="divide"></div>

              {/* Section: Tema */}
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

              {/* Pengaturan */}
              <div className="inv-section">
                <h4 className="inv-section-title">Pengaturan</h4>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleSaveSettings} style={{ flex: 1 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8" /></svg>
                    <span>Simpan Pengaturan</span>
                  </button>
                  {hasSaved && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleLoadSettings} style={{ flex: 1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg>
                      <span>Gunakan Tersimpan</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="divide"></div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPreviewOpen(true)}>
                  <IcEye />
                  <span>Lihat Preview</span>
                </button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }}>
                  <IcLockSm />
                  <span>Export PDF</span>
                  <IcDownload size={16} />
                </button>
              </div>
              <div className="tw-helper" style={{ textAlign: "center", marginTop: 4 }}>
                Fitur premium — perlu langganan aktif.
              </div>
            </div>

            {/* Preview panel — desktop */}
            <div className="inv-preview-col">
              {renderPreview()}
            </div>
          </div>
        </main>
      </div>

      {/* Preview Dialog */}
      {previewOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,.5)", display: "flex",
            alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Preview Invoice"
        >
          <div
            style={{
              background: "var(--tw-bg)", borderRadius: "var(--r-xxl)",
              maxWidth: 1000, width: "100%", maxHeight: "90vh",
              overflow: "auto", padding: 24,
              boxShadow: "0 24px 60px rgba(0,0,0,.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="tw-title-md">Preview Invoice</div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="btn btn-ghost btn-sm">Tutup</button>
            </div>
            {renderPreview()}
          </div>
        </div>
      )}
    </>
  );
}