const WIB_OFFSET_HOURS = 7;
const MAX_SESSION_MINUTES = 24 * 60;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * @typedef {"sixty_minutes" | "ninety_minutes" | "flat" | "invalid"} BillingType
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

export function normalizeBillingType(value) {
  if (value === null || value === "hourly" || value === "sixty_minutes") return "sixty_minutes";
  if (value === "ninety_minutes") return "ninety_minutes";
  if (value === "flat") return "flat";
  return "invalid";
}

export function roundedBillableMinutes(durationMinutes, baseMinutes = 60) {
  if (!Number.isFinite(durationMinutes)) return 0;
  const normalized = Math.min(Math.max(Math.trunc(durationMinutes), 1), MAX_SESSION_MINUTES);
  return Math.max(baseMinutes, Math.floor((normalized + 15) / 30) * 30);
}

export function formatDurationMinutes(minutes) {
  const normalized = Math.max(0, Math.trunc(Number(minutes) || 0));
  if (normalized <= 120) return `${normalized} menit`;
  const hours = Math.floor(normalized / 60);
  const remainingMinutes = normalized % 60;
  return remainingMinutes === 0
    ? `${hours} jam`
    : `${hours} jam ${remainingMinutes} menit`;
}

export function formatBillingTypeLabel(billingType) {
  if (billingType === "sixty_minutes") return "Per 60 menit";
  if (billingType === "ninety_minutes") return "Per 90 menit";
  if (billingType === "flat") return "Flat";
  return "Billing tidak valid";
}

/** @param {SessionMetricInput} input */
export function getSessionMetrics({ clockInAt, clockOutAt, hourlyRate, billingType }) {
  const durationMilliseconds = validDurationMilliseconds(clockInAt, clockOutAt);
  const normalizedBillingType = /** @type {BillingType} */ (normalizeBillingType(billingType));
  const durationMinutes = durationMilliseconds === 0
    ? 0
    : Math.min(Math.max(Math.floor(durationMilliseconds / 60_000), 1), MAX_SESSION_MINUTES);
  const rate = Number.isFinite(hourlyRate) && (hourlyRate ?? 0) > 0
    ? Math.trunc(hourlyRate ?? 0)
    : 0;

  if (durationMinutes === 0 || normalizedBillingType === "invalid") {
    return {
      durationMinutes,
      billableMinutes: 0,
      amount: 0,
      billingType: normalizedBillingType,
      isValid: normalizedBillingType !== "invalid",
    };
  }

  if (normalizedBillingType === "flat") {
    return {
      durationMinutes,
      billableMinutes: durationMinutes,
      amount: rate,
      billingType: normalizedBillingType,
      isValid: true,
    };
  }

  const baseMinutes = normalizedBillingType === "ninety_minutes" ? 90 : 60;
  const billableMinutes = roundedBillableMinutes(durationMinutes, baseMinutes);
  const amount = normalizedBillingType === "ninety_minutes"
    ? Math.round((billableMinutes * rate) / 90)
    : (billableMinutes / 30) * Math.floor(rate / 2);

  return {
    durationMinutes,
    billableMinutes,
    amount,
    billingType: normalizedBillingType,
    isValid: true,
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

export function getWibMonthToDateRange(date) {
  const wibDate = new Date(date.getTime() + (WIB_OFFSET_HOURS * 3_600_000));
  const year = wibDate.getUTCFullYear();
  const month = wibDate.getUTCMonth() + 1;
  const day = wibDate.getUTCDate();

  return {
    from: formatDateOnly(year, month, 1),
    to: formatDateOnly(year, month, day),
    year,
    month,
  };
}
