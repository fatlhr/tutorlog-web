import { createClient } from "@/lib/supabase/server";

export interface SessionItem {
  id: string;
  d: string;
  rawDate: string;
  m: string;
  s: string;
  h: number;
  t: string;
}

export interface RekapSummary {
  totalSesi: number;
  totalJam: number;
  totalPendapatan: string;
  totalPendapatanRaw: number;
  totalMurid: number;
  students: string[];
}

export interface RekapData {
  sessions: SessionItem[];
  summary: RekapSummary;
  month: string;
  monthLabel: string;
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const jt = amount / 1_000_000;
    return jt % 1 === 0 ? `Rp ${jt.toFixed(0)}jt` : `Rp ${jt.toFixed(1)}jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function monthLabel(year: number, month: number): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${months[month - 1]} ${year}`;
}

function computeDurationHours(clockIn: string, clockOut: string | null): number {
  if (!clockOut) return 0;
  const start = new Date(clockIn).getTime();
  const end = new Date(clockOut).getTime();
  if (end <= start) return 0;
  return Math.round(((end - start) / 36e5) * 10) / 10;
}

function computeBilling(
  durationHours: number,
  hourlyRate: number | null,
  billingType: string | null,
): number {
  if (billingType === "flat") {
    return hourlyRate ?? 0;
  }
  return Math.round(durationHours * (hourlyRate ?? 0));
}

export async function fetchRekapData(
  year: number,
  month: number,
): Promise<RekapData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      sessions: [],
      summary: { totalSesi: 0, totalJam: 0, totalPendapatan: "Rp 0", totalPendapatanRaw: 0, totalMurid: 0, students: [] },
      month: `${year}-${String(month).padStart(2, "0")}`,
      monthLabel: monthLabel(year, month),
    };
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const endDate = new Date(Date.UTC(year, month, 1)).toISOString();

  const { data: rows, error } = await supabase
    .from("sessions")
    .select("id, clock_in_at, clock_out_at, student_name_snapshot, education_level_snapshot, hourly_rate_snapshot, billing_type_snapshot, teaching_mode")
    .eq("tutor_id", user.id)
    .eq("status", "completed")
    .gte("clock_in_at", startDate)
    .lt("clock_in_at", endDate)
    .order("clock_in_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch rekap data:", error);
    return {
      sessions: [],
      summary: { totalSesi: 0, totalJam: 0, totalPendapatan: "Rp 0", totalPendapatanRaw: 0, totalMurid: 0, students: [] },
      month: `${year}-${String(month).padStart(2, "0")}`,
      monthLabel: monthLabel(year, month),
    };
  }

  const sessions: SessionItem[] = (rows ?? []).map((row: Record<string, unknown>) => {
    const clockIn = row.clock_in_at as string;
    const clockOut = (row.clock_out_at as string) ?? null;
    const hours = computeDurationHours(clockIn, clockOut);
    const rate = (row.hourly_rate_snapshot as number) ?? null;
    const billingType = (row.billing_type_snapshot as string) ?? null;
    const amount = computeBilling(hours, rate, billingType);
    const studentName = (row.student_name_snapshot as string) ?? "Tanpa Nama";
    const educationLevel = (row.education_level_snapshot as string) ?? "";
    const teachingMode = (row.teaching_mode as string) ?? "";

    let subject = educationLevel;
    if (teachingMode && subject) subject += ` · ${teachingMode}`;
    else if (teachingMode) subject = teachingMode;

    return {
      id: row.id as string,
      d: formatDate(clockIn),
      rawDate: clockIn,
      m: studentName,
      s: subject || "—",
      h: hours,
      t: formatCurrency(amount),
    };
  });

  const totalSesi = sessions.length;
  const totalJam = sessions.reduce((sum, s) => sum + s.h, 0);
  const totalPendapatanRaw = sessions.reduce((sum, s) => {
    const rate = (rows?.[sessions.indexOf(s)]?.hourly_rate_snapshot as number) ?? null;
    const billingType = (rows?.[sessions.indexOf(s)]?.billing_type_snapshot as string) ?? null;
    return sum + computeBilling(s.h, rate, billingType);
  }, 0);

  const students = [...new Set(sessions.map((s) => s.m))];

  return {
    sessions,
    summary: {
      totalSesi,
      totalJam: Math.round(totalJam * 10) / 10,
      totalPendapatan: formatCurrency(totalPendapatanRaw),
      totalPendapatanRaw,
      totalMurid: students.length,
      students,
    },
    month: `${year}-${String(month).padStart(2, "0")}`,
    monthLabel: monthLabel(year, month),
  };
}