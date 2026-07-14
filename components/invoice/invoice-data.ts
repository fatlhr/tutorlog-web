export interface InvoiceData {
  no: string;
  date: string;
  due: string;
  period: string;
  lembaga?: string;
  from: { name: string; lines: string[] };
  to: { name: string; lines: string[] };
  bank: { bank: string; no: string; name: string };
  items: { date: string; desc: string; h: number; rate: number }[];
  notes: string;
}

export const sampleInvoiceData: InvoiceData = {
  no: "INV-2026/06-014",
  date: "30 Juni 2026",
  due: "7 Juli 2026",
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
    { date: "03 Jun", desc: "Matematika · Trigonometri", h: 1.5, rate: 120000 },
    { date: "05 Jun", desc: "Matematika · Latihan Soal", h: 1.5, rate: 120000 },
    { date: "10 Jun", desc: "Fisika · Gerak Lurus", h: 2.0, rate: 130000 },
    { date: "12 Jun", desc: "Matematika · Trigonometri", h: 1.5, rate: 120000 },
    { date: "17 Jun", desc: "Fisika · Hukum Newton", h: 2.0, rate: 130000 },
    { date: "19 Jun", desc: "Matematika · Persiapan UH", h: 1.5, rate: 120000 },
    { date: "24 Jun", desc: "Fisika · Energi & Usaha", h: 2.0, rate: 130000 },
    { date: "26 Jun", desc: "Matematika · Review UH", h: 1.5, rate: 120000 },
  ],
  notes: "Terima kasih atas kepercayaannya. Pembayaran dapat ditransfer ke rekening di bawah paling lambat 7 Juli 2026.",
};

export function formatIDR(value: number): string {
  return "Rp " + value.toLocaleString("id-ID");
}

export function getInvoiceTotals(items: InvoiceData["items"]) {
  return items.reduce(
    (totals, item) => ({
      hours: totals.hours + item.h,
      amount: totals.amount + item.h * item.rate,
    }),
    { hours: 0, amount: 0 },
  );
}

export function hasInvoiceDescriptions(items: InvoiceData["items"]): boolean {
  return items.some(({ desc }) => {
    const value = desc.trim();
    return value !== "" && value !== "-";
  });
}
