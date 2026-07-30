const WIB_OFFSET_HOURS = 7;
const MAX_SESSION_MINUTES = 24 * 60;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * @typedef {"hourly" | "flat"} BillingType
 * @typedef {{
 *   clockInAt: string,
 *   clockOutAt: string | null,
 *   hourlyRate: number | null,
 *   billingType: string | null,
 * }} SessionMetricInput
 */

function validDurationMilliseconds(clockInAt, clockOutAt) {
  if (!clockOutAt) return 0;
  const start = new Date(clockInAt).getTime();
  const end = new Date(clockOutAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return end - start;
}

export function roundedBillableMinutes(actualMinutes) {
  if (!Number.isFinite(actualMinutes)) return 0;
  const normalized = Math.min(Math.max(Math.trunc(actualMinutes), 1), MAX_SESSION_MINUTES);
  if (normalized <= 60) return 60;
  return Math.round(normalized / 30) * 30;
}

/** @param {SessionMetricInput} input */
export function getSessionMetrics({
  clockInAt,
  clockOutAt,
  hourlyRate,
  billingType,
}) {
  const durationMilliseconds = validDurationMilliseconds(clockInAt, clockOutAt);
  const normalizedBillingType = /** @type {BillingType} */ (
    billingType === "flat" ? "flat" : "hourly"
  );

  if (durationMilliseconds === 0) {
    return {
      actualMinutes: 0,
      actualHours: 0,
      billableMinutes: 0,
      amount: 0,
      billingType: normalizedBillingType,
    };
  }

  const actualMinutes = Math.floor(durationMilliseconds / 60_000);
  const actualHours = Math.round((durationMilliseconds / 3_600_000) * 10) / 10;
  const rate = Number.isFinite(hourlyRate) && (hourlyRate ?? 0) > 0
    ? Math.trunc(hourlyRate ?? 0)
    : 0;

  if (normalizedBillingType === "flat") {
    return {
      actualMinutes,
      actualHours,
      billableMinutes: 0,
      amount: rate,
      billingType: normalizedBillingType,
    };
  }

  const billableMinutes = roundedBillableMinutes(actualMinutes);
  return {
    actualMinutes,
    actualHours,
    billableMinutes,
    amount: (billableMinutes / 30) * Math.trunc(rate / 2),
    billingType: normalizedBillingType,
  };
}

function parseDateOnly(value) {
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new RangeError("INVALID_DATE_RANGE");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    throw new RangeError("INVALID_DATE_RANGE");
  }

  return { year, month, day };
}

function wibMidnightUtc({ year, month, day }, dayOffset = 0) {
  return new Date(
    Date.UTC(year, month - 1, day + dayOffset, -WIB_OFFSET_HOURS),
  );
}

export function toWibDateRange(from, to) {
  const start = parseDateOnly(from);
  const end = parseDateOnly(to);
  const startDate = wibMidnightUtc(start);
  const endExclusiveDate = wibMidnightUtc(end, 1);
  if (endExclusiveDate <= startDate) throw new RangeError("INVALID_DATE_RANGE");

  return {
    startISO: startDate.toISOString(),
    endExclusiveISO: endExclusiveDate.toISOString(),
  };
}

function formatDateOnly(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getWibMonthRange(date, monthOffset = 0) {
  const wibDate = new Date(date.getTime() + (WIB_OFFSET_HOURS * 3_600_000));
  const targetMonth = new Date(Date.UTC(
    wibDate.getUTCFullYear(),
    wibDate.getUTCMonth() + monthOffset,
    1,
  ));
  const year = targetMonth.getUTCFullYear();
  const month = targetMonth.getUTCMonth() + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    from: formatDateOnly(year, month, 1),
    to: formatDateOnly(year, month, lastDay),
    year,
    month,
  };
}
