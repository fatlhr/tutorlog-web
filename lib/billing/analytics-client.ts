const BILLING_ANALYTICS_EVENT_NAMES = [
  "pricing_viewed",
  "package_selected",
  "paywall_opened",
  "checkout_started",
  "payment_method_selected",
  "payment_pending",
  "payment_paid",
  "payment_expired",
  "payment_failed",
  "entitlement_activated",
  "export_allowed",
  "export_blocked",
] as const;

const ALLOWED_EVENT_NAMES = new Set<string>(BILLING_ANALYTICS_EVENT_NAMES);

const ALLOWED_PROPERTY_NAMES = new Set([
  "feature",
  "packageCode",
  "paymentMethod",
  "paymentState",
  "paywallReason",
  "requestId",
  "surface",
]);

export type BillingAnalyticsEventName =
  (typeof BILLING_ANALYTICS_EVENT_NAMES)[number];

export interface BillingAnalyticsProperties {
  feature?: string;
  packageCode?: string;
  paymentMethod?: string;
  paymentState?: string;
  paywallReason?: string;
  requestId?: string;
  surface?: string;
}

function safeProperties(
  properties: BillingAnalyticsProperties,
): BillingAnalyticsProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => (
      ALLOWED_PROPERTY_NAMES.has(key)
      && typeof value === "string"
      && value.length <= 120
    )),
  );
}

export function trackBillingEvent(
  eventName: string,
  properties: BillingAnalyticsProperties = {},
): void {
  if (!ALLOWED_EVENT_NAMES.has(eventName)) return;

  try {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventName,
        properties: safeProperties(properties),
      }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Analytics is intentionally best-effort and never blocks product flow.
  }
}
