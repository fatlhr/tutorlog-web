import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

export interface SessionItem {
  id: string;
  d: string;
  rawDate: string;
  m: string;
  s: string;
  h: number;
  t: string;
  rawAmount: number;
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
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

export async function fetchRekapDataByRange(
  from: string,
  to: string,
): Promise<RekapData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return emptyResult("", "");
  }

  const fromISO = new Date(from + "T00:00:00").toISOString();
  const toISO = new Date(to + "T23:59:59.999").toISOString();

  const { data: rows, error } = await supabase
    .from("sessions")
    .select("id, clock_in_at, clock_out_at, student_name_snapshot, education_level_snapshot, hourly_rate_snapshot, billing_type_snapshot, teaching_mode")
    .eq("tutor_id", user.id)
    .eq("status", "completed")
    .gte("clock_in_at", fromISO)
    .lte("clock_in_at", toISO)
    .order("clock_in_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch rekap data:", error);
    throw new Error("REKAP_FETCH_FAILED");
  }

  const sessions = buildSessions(rows ?? []);
  return buildResult(sessions, rows ?? [], from, to);
}

export async function fetchRecentSessions(limit = 3): Promise<SessionItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: rows, error } = await supabase
    .from("sessions")
    .select("id, clock_in_at, clock_out_at, student_name_snapshot, education_level_snapshot, hourly_rate_snapshot, billing_type_snapshot, teaching_mode")
    .eq("tutor_id", user.id)
    .eq("status", "completed")
    .order("clock_in_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch recent sessions:", error);
    throw new Error("RECENT_SESSIONS_FETCH_FAILED");
  }

  return buildSessions(rows ?? []);
}

function emptyResult(from: string, to: string): RekapData {
  return {
    sessions: [],
    summary: { totalSesi: 0, totalJam: 0, totalPendapatan: "Rp 0", totalPendapatanRaw: 0, totalMurid: 0, students: [] },
    month: from,
    monthLabel: rangeLabel(from, to),
  };
}

function rangeLabel(from: string, to: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const s = new Date(from + "T00:00:00");
  const e = new Date(to + "T00:00:00");
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "";
  return `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()} – ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
}

function buildSessions(rows: Record<string, unknown>[]): SessionItem[] {
  return rows.map((row) => {
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
      rawAmount: amount,
    };
  });
}

function buildResult(sessions: SessionItem[], rows: Record<string, unknown>[], from: string, to: string): RekapData {
  const totalSesi = sessions.length;
  const totalJam = sessions.reduce((sum, s) => sum + s.h, 0);
  const totalPendapatanRaw = sessions.reduce((sum, s) => {
    const idx = sessions.indexOf(s);
    const rate = (rows[idx]?.hourly_rate_snapshot as number) ?? null;
    const billingType = (rows[idx]?.billing_type_snapshot as string) ?? null;
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
    month: from,
    monthLabel: rangeLabel(from, to),
  };
}
