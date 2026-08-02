import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import {
  formatDurationMinutes,
  getSessionMetrics,
  toWibDateRange,
} from "@/lib/data/session-metrics.mjs";

export interface SessionItem {
  id: string;
  d: string;
  rawDate: string;
  m: string;
  s: string;
  durationMinutes: number;
  durationLabel: string;
  t: string;
  rawAmount: number;
  isBillingValid: boolean;
  time: string;
  mode: string;
  location: string;
  rate: string;
  note: string;
}

export interface RekapSummary {
  totalSesi: number;
  totalDurationMinutes: number;
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

export async function fetchRekapDataByRange(
  from: string,
  to: string,
): Promise<RekapData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return emptyResult("", "");
  }

  const { startISO, endExclusiveISO } = toWibDateRange(from, to);

  const { data: rows, error } = await supabase
    .from("sessions")
    .select("id, clock_in_at, clock_out_at, student_name_snapshot, education_level_snapshot, hourly_rate_snapshot, billing_type_snapshot, teaching_mode, clock_in_latitude, clock_in_longitude, session_learning_notes(tutor_note)")
    .eq("tutor_id", user.id)
    .eq("status", "completed")
    .gte("clock_in_at", startISO)
    .lt("clock_in_at", endExclusiveISO)
    .order("clock_in_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch rekap data:", error);
    throw new Error("REKAP_FETCH_FAILED");
  }

  const sessions = buildSessions(rows ?? []);
  return buildResult(sessions, from, to);
}

export async function fetchRecentSessions(limit = 3): Promise<SessionItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: rows, error } = await supabase
    .from("sessions")
    .select("id, clock_in_at, clock_out_at, student_name_snapshot, education_level_snapshot, hourly_rate_snapshot, billing_type_snapshot, teaching_mode, clock_in_latitude, clock_in_longitude, session_learning_notes(tutor_note)")
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
    summary: { totalSesi: 0, totalDurationMinutes: 0, totalPendapatan: "Rp 0", totalPendapatanRaw: 0, totalMurid: 0, students: [] },
    month: from,
    monthLabel: rangeLabel(from, to),
  };
}

function rangeLabel(from: string, to: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const s = new Date(from + "T00:00:00");
  const e = new Date(to + "T00:00:00");
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "";
  return `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()} - ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
}

function buildSessions(rows: Record<string, unknown>[]): SessionItem[] {
  return rows.map((row) => {
    const clockIn = row.clock_in_at as string;
    const clockOut = (row.clock_out_at as string) ?? null;
    const rate = (row.hourly_rate_snapshot as number) ?? null;
    const billingType = (row.billing_type_snapshot as string) ?? null;
    const metrics = getSessionMetrics({
      clockInAt: clockIn,
      clockOutAt: clockOut,
      hourlyRate: rate,
      billingType,
    });
    const studentName = (row.student_name_snapshot as string) ?? "Tanpa Nama";
    const educationLevel = (row.education_level_snapshot as string) ?? "";
    const teachingMode = (row.teaching_mode as string) ?? "";
    const hasLocation = typeof row.clock_in_latitude === "number" && typeof row.clock_in_longitude === "number";
    const nestedNotes = row.session_learning_notes;
    const noteRecord = Array.isArray(nestedNotes) ? nestedNotes[0] : nestedNotes;
    const note = noteRecord && typeof noteRecord === "object" && "tutor_note" in noteRecord
      ? (noteRecord as { tutor_note?: unknown }).tutor_note
      : null;

    let subject = educationLevel;
    if (teachingMode && subject) subject += ` · ${teachingMode}`;
    else if (teachingMode) subject = teachingMode;

    return {
      id: row.id as string,
      d: formatDate(clockIn),
      rawDate: clockIn,
      m: studentName,
      s: subject || "Belum diisi",
      durationMinutes: metrics.billableMinutes,
      durationLabel: formatDurationMinutes(metrics.billableMinutes),
      t: formatCurrency(metrics.amount),
      rawAmount: metrics.amount,
      isBillingValid: metrics.isValid,
      time: formatTimeRange(clockIn, clockOut),
      mode: teachingMode === "online" ? "Online" : "Tatap muka",
      location: hasLocation ? "Lokasi tersimpan di aplikasi" : "Lokasi tidak tercatat",
      rate: formatCurrency(rate ?? 0),
      note: typeof note === "string" && note.trim() ? note.trim() : "Belum ada catatan sesi",
    };
  });
}

function formatTimeRange(clockIn: string, clockOut: string | null): string {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const start = formatter.format(new Date(clockIn)).replace(".", ":");
  if (!clockOut) return `${start} - selesai`;
  return `${start} - ${formatter.format(new Date(clockOut)).replace(".", ":")}`;
}

function buildResult(sessions: SessionItem[], from: string, to: string): RekapData {
  const totalSesi = sessions.length;
  const totalDurationMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPendapatanRaw = sessions.reduce((sum, session) => sum + session.rawAmount, 0);

  const students = [...new Set(sessions.map((s) => s.m))];

  return {
    sessions,
    summary: {
      totalSesi,
      totalDurationMinutes,
      totalPendapatan: formatCurrency(totalPendapatanRaw),
      totalPendapatanRaw,
      totalMurid: students.length,
      students,
    },
    month: from,
    monthLabel: rangeLabel(from, to),
  };
}
