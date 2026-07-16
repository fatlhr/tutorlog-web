import "server-only";

import type {
  AccessState,
  AccessSummary,
  EntitlementType,
} from "@/lib/billing/contracts";
import { createClient } from "@/lib/supabase/server";

function asStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asAccessState(value: unknown): AccessState {
  return value === "plus_active" || value === "plus_expired" ? value : "free";
}

function asEntitlementType(value: unknown): EntitlementType {
  return value === "term" || value === "lifetime" ? value : null;
}

export async function getAccessSummary(): Promise<AccessSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_billing_access_status");

  if (error) {
    throw new Error("Failed to load billing access status");
  }

  const payload = (data ?? {}) as Record<string, unknown>;
  const entitlementType = asEntitlementType(payload.entitlement_type);

  return {
    state: asAccessState(payload.state),
    entitlementType,
    isLifetime: entitlementType === "lifetime" && payload.is_lifetime === true,
    activeFrom: asStringOrNull(payload.active_from),
    activeUntil: asStringOrNull(payload.active_until),
  };
}
