export type InvoiceBillingType = "sixty_minutes" | "ninety_minutes" | "flat" | "invalid";

export interface InvoiceItem {
  date: string;
  desc: string;
  durationMinutes: number;
  rate: number;
  amount: number;
  billingType: InvoiceBillingType;
}

export interface InvoiceData {
  date: string;
  period: string;
  lembaga?: string;
  from: { name: string; lines: string[] };
  to: { name: string; lines: string[] };
  bank: { bank: string; no: string; name: string };
  items: InvoiceItem[];
  notes: string;
}

export interface InvoicePageLayout {
  items: InvoiceItem[];
  showHeader: boolean;
  showTable: boolean;
  showTail: boolean;
}

export const sampleInvoiceData: InvoiceData = {
  date: "30 Juni 2026",
  period: "1 - 30 Juni 2026",
  from: {
    name: "Rina Novianti",
    lines: ["Guru Matematika & Fisika", "Jakarta Selatan", "rina@tutorlog.id · 0812-3456-7890"],
  },
  to: {
    name: "Bpk. Ahmad Wijaya",
    lines: ["Orang tua Bintang Wijaya", "Kelas 10, SMA Al-Azhar", "Jl. Kemang Raya No. 42, Jakarta Selatan"],
  },
  bank: { bank: "BCA", no: "1234 5678 9012", name: "Rina Novianti" },
  items: [
    { date: "03 Jun", desc: "Matematika · Trigonometri", durationMinutes: 90, rate: 120000, amount: 180000, billingType: "sixty_minutes" },
    { date: "05 Jun", desc: "Matematika · Latihan Soal", durationMinutes: 90, rate: 120000, amount: 180000, billingType: "sixty_minutes" },
    { date: "10 Jun", desc: "Fisika · Gerak Lurus", durationMinutes: 120, rate: 130000, amount: 260000, billingType: "sixty_minutes" },
    { date: "12 Jun", desc: "Matematika · Trigonometri", durationMinutes: 90, rate: 120000, amount: 120000, billingType: "flat" },
    { date: "17 Jun", desc: "Fisika · Hukum Newton", durationMinutes: 120, rate: 130000, amount: 260000, billingType: "sixty_minutes" },
    { date: "19 Jun", desc: "Matematika · Persiapan UH", durationMinutes: 90, rate: 120000, amount: 180000, billingType: "sixty_minutes" },
    { date: "24 Jun", desc: "Fisika · Energi & Usaha", durationMinutes: 120, rate: 130000, amount: 260000, billingType: "sixty_minutes" },
    { date: "26 Jun", desc: "Matematika · Review UH", durationMinutes: 90, rate: 120000, amount: 180000, billingType: "sixty_minutes" },
  ],
  notes: "Terima kasih atas kepercayaannya. Pembayaran dapat ditransfer ke rekening di bawah paling lambat 7 Juli 2026.",
};

export function formatIDR(value: number): string {
  return "Rp " + value.toLocaleString("id-ID");
}

export function getInvoiceTotals(items: InvoiceData["items"]) {
  return items.reduce(
    (totals, item) => ({
      durationMinutes: totals.durationMinutes + item.durationMinutes,
      amount: totals.amount + item.amount,
    }),
    { durationMinutes: 0, amount: 0 },
  );
}

export function hasInvoiceDescriptions(items: InvoiceData["items"]): boolean {
  return items.some(({ desc }) => {
    const value = desc.trim();
    return value !== "" && value !== "-";
  });
}

export function hasInvoiceRateColumn(items: InvoiceData["items"]): boolean {
  return items.some(({ billingType }) => billingType !== "flat");
}

export function getInvoiceRateColumnLabel(items: InvoiceData["items"]): string {
  const labels = [...new Set(items.flatMap(({ billingType }) => {
    if (billingType === "sixty_minutes") return ["60 menit"];
    if (billingType === "ninety_minutes") return ["90 menit"];
    return [];
  }))];

  return labels.length > 0 ? labels.join(" / ") : "sesi";
}
