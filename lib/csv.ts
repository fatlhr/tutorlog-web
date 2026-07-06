export interface SessionRow {
  d: string;
  m: string;
  s: string;
  h: number;
  t: string;
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function sessionsToCSV(rows: SessionRow[]): string {
  const BOM = "\uFEFF";
  const headers = ["Tanggal", "Siswa", "Sesi", "Durasi (jam)", "Tagihan"];
  const csvRows = rows.map((r) =>
    [r.d, r.m, r.s, r.h.toFixed(1).replace(".", ","), r.t].map(escapeCSV).join(",")
  );
  return BOM + headers.join(",") + "\n" + csvRows.join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}