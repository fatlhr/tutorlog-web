import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migrationPath = "supabase/migrations/202607160001_billing_foundation.sql";
const sql = readFileSync(migrationPath, "utf8");

const tables = [
  "billing_products",
  "billing_prices",
  "billing_purchases",
  "billing_payments",
  "billing_provider_events",
  "billing_entitlement_grants",
  "billing_analytics_events",
];

for (const table of tables) {
  assert.match(sql, new RegExp(`create table public\\.${table}`));
  assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
}

for (const table of [
  "billing_purchases",
  "billing_payments",
  "billing_provider_events",
  "billing_entitlement_grants",
  "billing_analytics_events",
]) {
  assert.match(
    sql,
    new RegExp(
      `create table public\\.${table}[\\s\\S]*?user_id uuid not null references auth\\.users\\(id\\) on delete cascade[\\s\\S]*?\\);`,
    ),
  );
}

assert.match(sql, /unique \(provider, provider_reference\)/);
assert.match(sql, /purchase_id uuid not null unique references public\.billing_purchases\(id\)/);
assert.match(sql, /create unique index billing_prices_one_active_per_product[\s\S]*where active;/);
assert.match(
  sql,
  /create trigger billing_entitlement_grants_immutable[\s\S]*before update or delete on public\.billing_entitlement_grants/,
);

for (const check of [
  "check (amount >= 0)",
  "check (channel_fee >= 0)",
  "check (total_amount = base_amount + channel_fee)",
  "check (duration_kind in ('free', 'days', 'months', 'lifetime'))",
  "check (state in ('created', 'pending', 'superseded', 'paid', 'expired', 'failed', 'canceled', 'refunded'))",
  "check ((entitlement_type = 'lifetime' and active_until is null) or entitlement_type = 'term')",
]) {
  assert.ok(sql.includes(check), `missing constraint: ${check}`);
}

assert.match(sql, /create index billing_payments_pending_lookup[\s\S]*where state in \('created', 'pending'\);/);
assert.match(sql, /create index billing_entitlement_grants_user_access_lookup[\s\S]*user_id, active_until/);

assert.match(sql, /'free'[\s\S]*?'free', null/);
assert.match(sql, /'plus_30d'[\s\S]*?'days', 30/);
assert.match(sql, /'plus_12m'[\s\S]*?'months', 12/);
assert.match(sql, /'plus_lifetime'[\s\S]*?'lifetime', null, true, true, null, null, null\)/);
assert.match(sql, /'free', 0, 'IDR', true/);
assert.match(sql, /'plus_30d', 19000, 'IDR', true/);
assert.match(sql, /'plus_12m', 149000, 'IDR', true/);
assert.match(sql, /'plus_lifetime', 249000, 'IDR', true/);

assert.match(sql, /create policy billing_products_read_active[\s\S]*to authenticated[\s\S]*using \(active\)/);
assert.match(sql, /create policy billing_prices_read_active[\s\S]*to authenticated[\s\S]*using\s*\(\s*active/);
assert.match(sql, /create policy billing_purchases_read_own[\s\S]*auth\.uid\(\) = user_id/);
assert.match(sql, /create policy billing_payments_read_own[\s\S]*auth\.uid\(\) = user_id/);
assert.match(sql, /create policy billing_entitlement_grants_read_own[\s\S]*auth\.uid\(\) = user_id/);
assert.doesNotMatch(sql, /create policy billing_provider_events_read/i);
assert.doesNotMatch(sql, /create policy billing_analytics_events_insert/i);
assert.match(sql, /create function public\.record_billing_analytics_event/);

assert.doesNotMatch(sql, /grant select on table public\.billing_payments to authenticated/);
const safePaymentGrant = sql.match(
  /grant select \(([\s\S]*?)\)\s+on table public\.billing_payments to authenticated;/,
);
assert.ok(safePaymentGrant, "authenticated payment reads must use a safe column grant");
assert.match(safePaymentGrant[1], /safe_reference/);
assert.doesNotMatch(safePaymentGrant[1], /provider_reference|provider_reported_amount/);

const serviceRoleLines = sql
  .split("\n")
  .filter((line) => /service_role/i.test(line));
assert.ok(serviceRoleLines.length > 0, "service_role must receive explicit server grants");
for (const line of serviceRoleLines) {
  assert.match(
    line.trim(),
    /^(grant\b|create policy\b)/i,
    `service_role is only allowed in grants or server policies: ${line.trim()}`,
  );
}

assert.doesNotMatch(sql, /service_role_key|ipaymu_api_key|re_[A-Za-z0-9]/i);
assert.doesNotMatch(sql, /user_profiles/i);
assert.doesNotMatch(
  sql,
  /(?:alter|create|drop|truncate)\s+(?:table|function)\s+(?:public\.)?(?:user_entitlements|user_feature_usage|user_feature_usage_events|get_user_access_status|record_feature_usage_event)\b/i,
);

console.log("billing migration contract valid");
