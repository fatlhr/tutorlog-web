const LOCAL_ORIGIN = "https://tutorlog.local";

export function safeNextPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/app";

  try {
    const url = new URL(value, LOCAL_ORIGIN);
    if (url.origin !== LOCAL_ORIGIN) return "/app";

    const allowed = url.pathname === "/app"
      || url.pathname.startsWith("/app/")
      || url.pathname === "/checkout"
      || url.pathname.startsWith("/pembayaran/");

    return allowed ? `${url.pathname}${url.search}` : "/app";
  } catch {
    return "/app";
  }
}
