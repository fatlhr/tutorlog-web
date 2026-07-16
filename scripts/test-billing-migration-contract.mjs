import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migrationPath = "supabase/migrations/202607160001_billing_foundation.sql";
const sql = readFileSync(migrationPath, "utf8");
const adminSource = readFileSync("lib/supabase/admin.ts", "utf8");

const tables = [
  "billing_products",
  "billing_prices",
  "billing_purchases",
  "billing_payments",
  "billing_provider_events",
  "billing_entitlement_grants",
  "billing_analytics_events",
];

function tableDefinition(table) {
  const startToken = `create table public.${table} (`;
  const start = sql.indexOf(startToken);
  assert.notEqual(start, -1, `missing table: ${table}`);

  const end = sql.indexOf("\n);", start);
  assert.notEqual(end, -1, `unterminated table: ${table}`);

  const remainder = sql.slice(start + startToken.length);
  const nextStatementOffset = remainder.search(/\n(?:create|alter|insert|revoke|grant)\s/i);
  const nextStatement = nextStatementOffset === -1
    ? -1
    : start + startToken.length + nextStatementOffset;
  assert.ok(nextStatement === -1 || end < nextStatement, `table assertion escaped definition: ${table}`);
  return sql.slice(start, end + 3);
}

const tableSql = Object.fromEntries(tables.map((table) => [table, tableDefinition(table)]));

for (const table of tables) {
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
    tableSql[table],
    /user_id uuid not null references auth\.users\(id\) on delete cascade/,
  );
}

assert.match(tableSql.billing_payments, /unique \(provider, provider_reference\)/);
assert.match(tableSql.billing_provider_events, /unique \(provider, provider_event_key\)/);
assert.match(
  tableSql.billing_entitlement_grants,
  /purchase_id uuid not null unique references public\.billing_purchases\(id\)/,
);
assert.match(tableSql.billing_prices, /unique \(id, product_id\)/);
assert.match(
  tableSql.billing_purchases,
  /foreign key \(price_id, product_id\) references public\.billing_prices\(id, product_id\)/,
);
assert.match(sql, /create unique index billing_prices_one_active_per_product[\s\S]*where active;/);

const triggerStatements = sql.match(/create trigger[\s\S]*?;/gi) ?? [];
assert.equal(
  triggerStatements.some((statement) => /on public\.billing_entitlement_grants/i.test(statement)),
  false,
  "entitlement grants must not block ownership cascades or later server recalculation",
);
assert.doesNotMatch(sql, /prevent_billing_entitlement_grant_mutation/i);

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

const policyStatements = sql.match(/create policy[\s\S]*?;/gi) ?? [];
for (const statement of policyStatements) {
  if (/on public\.billing_/i.test(statement)
    && !/to service_role/i.test(statement)) {
    assert.match(statement, /for select/i, `non-server billing policy must be read-only: ${statement}`);
  }
}

for (const table of ["billing_provider_events", "billing_analytics_events"]) {
  assert.equal(
    policyStatements.some(
      (statement) => new RegExp(`on public\\.${table}\\b`, "i").test(statement)
        && !/to service_role/i.test(statement),
    ),
    false,
    `${table} must not expose an end-user policy`,
  );
}

const tableGrantStatements = sql.match(/grant[\s\S]*?;/gi) ?? [];
for (const statement of tableGrantStatements) {
  if (/on(?: table)? public\.billing_/i.test(statement) && /to authenticated/i.test(statement)) {
    const privileges = statement.match(/^grant\s+([\s\S]*?)\s+on(?: table)?\s+/i)?.[1] ?? "";
    assert.doesNotMatch(
      privileges,
      /\b(?:all|insert|update|delete)\b/i,
      `authenticated billing table grant must be read-only: ${statement}`,
    );
  }
}

assert.doesNotMatch(sql, /grant select on table public\.billing_payments to authenticated/);
const safePaymentGrant = sql.match(
  /grant select \(([\s\S]*?)\)\s+on table public\.billing_payments to authenticated;/,
);
assert.ok(safePaymentGrant, "authenticated payment reads must use a safe column grant");
assert.match(safePaymentGrant[1], /safe_reference/);
assert.doesNotMatch(safePaymentGrant[1], /\bprovider\b|provider_reference|provider_reported_amount/);

const serviceRoleStatements = sql
  .split(";")
  .map((statement) => statement.trim())
  .filter((statement) => /service_role/i.test(statement));
assert.ok(serviceRoleStatements.length > 0, "service_role must receive explicit server grants");
for (const statement of serviceRoleStatements) {
  assert.match(
    statement,
    /^(grant\b|create policy\b)/i,
    `service_role is only allowed in grants or server policies: ${statement}`,
  );
}

assert.doesNotMatch(sql, /service_role_key|ipaymu_api_key|re_[A-Za-z0-9]/i);
for (const legacyObject of [
  "user_profiles",
  "user_entitlements",
  "user_feature_usage",
  "user_feature_usage_events",
  "get_user_access_status",
  "record_feature_usage_event",
]) {
  assert.doesNotMatch(
    sql,
    new RegExp(`\\b${legacyObject}\\b`, "i"),
    `migration must not reference legacy object: ${legacyObject}`,
  );
}

assert.match(adminSource, /^import "server-only";/);

console.log("billing migration contract valid");
