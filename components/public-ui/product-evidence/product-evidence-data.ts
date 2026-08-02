import type { InvoiceData } from "@/components/invoice/invoice-data";
import { getInvoiceTotals } from "@/components/invoice/invoice-data";

export const publicProductInvoiceData: InvoiceData = {
  date: "30 Juni 2026",
  period: "1-30 Juni 2026",
  from: {
    name: "Rina Novianti",
    lines: ["Tutor Matematika dan Fisika", "Jakarta Selatan", "rina@tutorlog.id - 0812 3456 7890"],
  },
  to: {
    name: "Bpk. Ahmad Wijaya",
    lines: ["Wali murid Bintang Wijaya", "Kelas 10 SMA Al-Azhar"],
  },
  bank: { bank: "BCA", no: "1234 5678 9012", name: "Rina Novianti" },
  items: [
    { date: "03 Jun", desc: "Matematika - Trigonometri", durationMinutes: 90, rate: 120000, amount: 180000, billingType: "sixty_minutes" },
    { date: "10 Jun", desc: "Fisika - Gerak Lurus", durationMinutes: 120, rate: 130000, amount: 260000, billingType: "sixty_minutes" },
    { date: "17 Jun", desc: "Matematika - Latihan Soal", durationMinutes: 90, rate: 120000, amount: 120000, billingType: "flat" },
  ],
  notes: "Terima kasih atas kepercayaannya. Pembayaran dapat ditransfer paling lambat 7 Juli 2026.",
};

const totals = getInvoiceTotals(publicProductInvoiceData.items);
const firstSession = publicProductInvoiceData.items[0];

export const publicSessionEvidence = {
  studentName: "Bintang",
  date: firstSession.date,
  timeRange: "18.00 - 19.30",
  duration: "90 menit",
  amount: firstSession.amount,
  status: "Tersimpan" as const,
};

export const publicRecapEvidence = {
  period: "Juni 2026" as const,
  sessionCount: publicProductInvoiceData.items.length,
  durationLabel: "5 jam",
  amount: totals.amount,
};
