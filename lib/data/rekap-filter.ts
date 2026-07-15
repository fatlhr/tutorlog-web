export type RekapRangeMode = "current" | "previous" | "custom";

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
