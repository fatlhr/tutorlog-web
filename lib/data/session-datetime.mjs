const WIB_TIME_ZONE = "Asia/Jakarta";

const SESSION_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: WIB_TIME_ZONE,
});

const SESSION_TIME_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: WIB_TIME_ZONE,
});

export function formatWibSessionDate(value) {
  return SESSION_DATE_FORMATTER.format(new Date(value));
}

export function formatWibSessionTimeRange(clockInAt, clockOutAt) {
  const start = SESSION_TIME_FORMATTER.format(new Date(clockInAt)).replace(".", ":");
  if (!clockOutAt) return `${start} - selesai`;
  const end = SESSION_TIME_FORMATTER.format(new Date(clockOutAt)).replace(".", ":");
  return `${start} - ${end}`;
}
