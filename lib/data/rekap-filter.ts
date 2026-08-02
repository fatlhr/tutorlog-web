export type RekapRangeMode = "current" | "previous" | "custom";

export interface RekapDateRange {
  from: string;
  to: string;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateOnly(value: string) {
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new RangeError("INVALID_REKAP_DATE");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError("INVALID_REKAP_DATE");
  }

  return { year, month, day, time: date.getTime() };
}

function formatDateOnly(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getRekapPresetRange(
  mode: "current" | "previous",
  wibToday: string,
): RekapDateRange {
  const today = parseDateOnly(wibToday);

  if (mode === "current") {
    return {
      from: formatDateOnly(today.year, today.month, 1),
      to: wibToday,
    };
  }

  const previousMonth = new Date(Date.UTC(today.year, today.month - 2, 1));
  const year = previousMonth.getUTCFullYear();
  const month = previousMonth.getUTCMonth() + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    from: formatDateOnly(year, month, 1),
    to: formatDateOnly(year, month, lastDay),
  };
}

export function isValidRekapCustomRange(
  from: string,
  to: string,
  wibToday: string,
) {
  try {
    const start = parseDateOnly(from);
    const end = parseDateOnly(to);
    const today = parseDateOnly(wibToday);
    return start.time <= end.time && end.time <= today.time;
  } catch {
    return false;
  }
}

export function hasUnappliedCustomRange({
  rangeMode,
  appliedRangeMode,
  dateFrom,
  dateTo,
  appliedFrom,
  appliedTo,
}: {
  rangeMode: RekapRangeMode;
  appliedRangeMode: RekapRangeMode;
  dateFrom: string;
  dateTo: string;
  appliedFrom: string;
  appliedTo: string;
}) {
  return (
    rangeMode === "custom" &&
    (appliedRangeMode !== "custom" || dateFrom !== appliedFrom || dateTo !== appliedTo)
  );
}

export function getAvailableStudentFilterOptions({
  students,
  customRangePending,
}: {
  students: string[];
  customRangePending: boolean;
}) {
  if (customRangePending) return [];
  return students;
}
