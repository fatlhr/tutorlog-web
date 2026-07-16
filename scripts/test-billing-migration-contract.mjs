import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migrationPath = "supabase/migrations/202607160001_billing_foundation.sql";
const sql = readFileSync(migrationPath, "utf8");
const functionsSql = readFileSync(
  "supabase/migrations/202607160002_billing_functions.sql",
  "utf8",
);
const purchaseFunctionsSql = readFileSync(
  "supabase/migrations/202607160003_billing_purchase_functions.sql",
  "utf8",
);
const adminSource = readFileSync("lib/supabase/admin.ts", "utf8");
const accessSource = readFileSync("lib/billing/server/access.ts", "utf8");
const exportsSource = readFileSync("lib/billing/server/exports.ts", "utf8");
const exportRouteSource = readFileSync("app/api/exports/authorize/route.ts", "utf8");

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
  /purchase_id uuid unique references public\.billing_purchases\(id\)/,
);
assert.match(
  tableSql.billing_entitlement_grants,
  /source text not null\s+check \(source in \('purchase', 'legacy_verified'\)\)/,
);
assert.match(tableSql.billing_entitlement_grants, /evidence_reference text/);
assert.match(
  tableSql.billing_entitlement_grants,
  /check \(\s*\(source = 'purchase'\s+and purchase_id is not null\s+and evidence_reference is null\)\s+or \(\s*source = 'legacy_verified'\s+and purchase_id is null\s+and nullif\(btrim\(evidence_reference\), ''\) is not null\s*\)\s*\)/,
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

for (const functionName of [
  "apply_billing_paid_event",
  "get_billing_access_status",
  "authorize_feature_export",
  "admin_grant_legacy_entitlement",
]) {
  assert.match(
    functionsSql,
    new RegExp(`create (?:or replace )?function public\\.${functionName}\\b`, "i"),
    `missing billing function: ${functionName}`,
  );
}

assert.match(
  functionsSql,
  /drop constraint user_entitlements_source_check[\s\S]*add constraint user_entitlements_source_check[\s\S]*'voucher'[\s\S]*'manual'[\s\S]*'billing'[\s\S]*'legacy_verified'/i,
);

const paidEventFunction = functionsSql.match(
  /create (?:or replace )?function public\.apply_billing_paid_event[\s\S]*?\n\$\$;/i,
)?.[0] ?? "";
const i3ReviewFailures = [];
assert.match(paidEventFunction, /from public\.billing_payments[\s\S]*for update/i);
assert.match(paidEventFunction, /from public\.billing_purchases[\s\S]*for update/i);
assert.match(paidEventFunction, /provider_reported_amount[\s\S]*total_amount_snapshot/i);
assert.match(paidEventFunction, /state = 'refunded'/i);
const paidUserLock = paidEventFunction.indexOf(
  "perform pg_advisory_xact_lock(hashtextextended('billing-entitlement:' || v_payment.user_id::text, 0));",
);
const paidCompatibilityRead = paidEventFunction.indexOf("from public.user_entitlements");
const paidGrantStateRead = paidEventFunction.indexOf("from public.billing_entitlement_grants");
const paidExistingResultRead = paidEventFunction.indexOf(
  "return public.billing_access_status_for_user(v_payment.user_id);",
);
if (paidUserLock === -1) {
  i3ReviewFailures.push("paid entitlement application requires a per-user transaction lock");
} else if (
  paidUserLock > paidCompatibilityRead
  || paidUserLock > paidGrantStateRead
  || paidUserLock > paidExistingResultRead
) {
  i3ReviewFailures.push("the per-user transaction lock must precede compatibility and grant state reads");
}
assert.match(paidEventFunction, /on conflict \(purchase_id\) do nothing/i);
assert.match(
  paidEventFunction,
  /on conflict \(purchase_id\) do nothing[\s\S]*returning id into v_grant_id;[\s\S]*if v_grant_id is null then[\s\S]*return public\.billing_access_status_for_user\(v_payment\.user_id\)/i,
  "a purchase that already issued its unique grant must not extend access again",
);
assert.match(paidEventFunction, /greatest\(p_paid_at, v_current_active_until\)/i);
assert.match(paidEventFunction, /interval '30 days'/i);
assert.match(paidEventFunction, /interval '12 months'/i);
assert.match(paidEventFunction, /'plus_lifetime'[\s\S]*'lifetime'/i);
assert.match(paidEventFunction, /update public\.billing_purchases[\s\S]*state = 'completed'/i);

const accessFunction = functionsSql.match(
  /create (?:or replace )?function public\.get_billing_access_status[\s\S]*?\n\$\$;/i,
)?.[0] ?? "";
const accessHelperFunction = functionsSql.match(
  /create (?:or replace )?function public\.billing_access_status_for_user[\s\S]*?\n\$\$;/i,
)?.[0] ?? "";
assert.match(accessFunction, /billing_access_status_for_user\(auth\.uid\(\)\)/i);
assert.match(accessHelperFunction, /billing_entitlement_grants/i);
assert.match(accessHelperFunction, /user_entitlements/i);
assert.match(accessHelperFunction, /'entitlement_type'/i);
assert.match(accessHelperFunction, /'is_lifetime'/i);
assert.match(accessHelperFunction, /'active_from'/i);
assert.match(accessHelperFunction, /'active_until'/i);

const authorizeFunction = functionsSql.match(
  /create (?:or replace )?function public\.authorize_feature_export[\s\S]*?\n\$\$;/i,
)?.[0] ?? "";
assert.match(authorizeFunction, /p_feature[\s\S]*recap_pdf[\s\S]*recap_csv[\s\S]*invoice_pdf/i);
const exportFeatureLock = authorizeFunction.indexOf(
  "perform pg_advisory_xact_lock(hashtextextended('billing-export:' || v_user_id::text || ':' || p_feature, 0));",
);
const exportAccessRead = authorizeFunction.indexOf(
  "v_access := public.billing_access_status_for_user(v_user_id);",
);
const exportUsageCount = authorizeFunction.indexOf("select count(*)::integer");
if (exportFeatureLock === -1) {
  i3ReviewFailures.push("export authorization requires a deterministic per-user/per-feature transaction lock");
} else if (exportFeatureLock > exportAccessRead || exportFeatureLock > exportUsageCount) {
  i3ReviewFailures.push("the per-feature transaction lock must precede access and usage reads");
}
if (/from public\.user_feature_usage[\s\S]*for update/i.test(authorizeFunction)) {
  i3ReviewFailures.push("different export features must not share one per-user row lock");
}
assert.match(authorizeFunction, /insert into public\.user_feature_usage_events/i);
assert.match(
  authorizeFunction,
  /if v_allowed then[\s\S]*insert into public\.user_feature_usage_events/i,
  "rejected export authorization must not insert a usage event",
);
assert.match(authorizeFunction, /feature_key[\s\S]*recap_export/i);
assert.match(authorizeFunction, /feature_key[\s\S]*invoice_export/i);
assert.match(authorizeFunction, /'authorization_id'/i);
assert.match(authorizeFunction, /'allowed'/i);
assert.match(authorizeFunction, /'reason'/i);
assert.match(authorizeFunction, /'used'/i);
assert.match(authorizeFunction, /'limit'/i);
if (!/returning id into v_authorization_id;[\s\S]*if v_limit is not null then\s+v_used := v_used \+ 1;\s+end if;/i.test(authorizeFunction)) {
  i3ReviewFailures.push("only limited Free recap returns the post-authorization usage count");
}
if ((authorizeFunction.match(/v_used := v_used \+ 1;/gi) ?? []).length !== 1) {
  i3ReviewFailures.push("unlimited Plus exports must preserve the observed pre-authorization count");
}
assert.deepEqual(i3ReviewFailures, [], "Task I3 review findings must remain fixed");

const adminGrantFunction = functionsSql.match(
  /create (?:or replace )?function public\.admin_grant_legacy_entitlement[\s\S]*?\n\$\$;/i,
)?.[0] ?? "";
assert.match(adminGrantFunction, /p_evidence_reference/i);
assert.match(adminGrantFunction, /source[\s\S]*legacy_verified/i);
assert.match(adminGrantFunction, /insert into public\.billing_entitlement_grants[\s\S]*insert into public\.user_entitlements/i);

assert.match(
  functionsSql,
  /revoke all on function public\.admin_grant_legacy_entitlement\([^;]+\) from public, anon, authenticated/i,
);
assert.match(
  functionsSql,
  /grant execute on function public\.admin_grant_legacy_entitlement\([^;]+\) to service_role/i,
);
assert.match(
  functionsSql,
  /grant execute on function public\.authorize_feature_export\(text\)\s+to authenticated/i,
);
assert.match(
  functionsSql,
  /revoke all on function public\.apply_billing_paid_event\(uuid, timestamptz\)\s+from public, anon, authenticated/i,
);
assert.match(
  functionsSql,
  /grant execute on function public\.apply_billing_paid_event\(uuid, timestamptz\)\s+to service_role/i,
);
assert.match(
  functionsSql,
  /revoke all on function public\.billing_access_status_for_user\(uuid\)\s+from public, anon, authenticated, service_role/i,
);
assert.doesNotMatch(functionsSql, /service_role_key|ipaymu_api_key/i);

assert.match(accessSource, /rpc\("get_billing_access_status"\)/);
assert.match(exportsSource, /rpc\("authorize_feature_export"/);
assert.equal(
  (exportsSource.match(/rpc\("authorize_feature_export"/g) ?? []).length,
  1,
  "authorizeExport must call the atomic authorization RPC exactly once",
);
assert.match(exportRouteSource, /export async function POST/);
assert.match(exportRouteSource, /recap_pdf[\s\S]*recap_csv[\s\S]*invoice_pdf/);
assert.match(exportRouteSource, /auth\.getUser\(\)/);

for (const column of [
  "provider_last_checked_at timestamptz",
  "provider_error_code text",
  "cancellation_requested_at timestamptz",
  "cancellation_error_code text",
]) {
  assert.match(
    purchaseFunctionsSql,
    new RegExp(`add column ${column}`, "i"),
    `missing Task I5 payment column: ${column}`,
  );
}

function taskI5Function(name) {
  const functionSql = purchaseFunctionsSql.match(
    new RegExp(`create (?:or replace )?function public\\.${name}\\b[\\s\\S]*?\\n\\$\\$;`, "i"),
  )?.[0] ?? "";
  assert.ok(functionSql, `missing Task I5 function: ${name}`);
  assert.match(functionSql, /security definer/i);
  assert.match(functionSql, /set search_path = ''/i);
  return functionSql;
}

const reservePurchaseFunction = taskI5Function("reserve_billing_purchase");
const reserveLock = reservePurchaseFunction.indexOf("pg_advisory_xact_lock");
const reserveProductRead = reservePurchaseFunction.indexOf("from public.billing_products");
assert.ok(reserveLock !== -1, "purchase reservation requires a transaction advisory lock");
assert.ok(
  reserveLock < reserveProductRead,
  "purchase reservation lock must precede catalog and pending-attempt reads",
);
assert.match(
  reservePurchaseFunction,
  /billing-purchase:[\s\S]*p_user_id[\s\S]*p_package_code[\s\S]*p_method/i,
);
assert.match(reservePurchaseFunction, /p_method not in \('qris', 'va'\)/i);
assert.match(reservePurchaseFunction, /product\.active[\s\S]*price\.active/i);
assert.match(reservePurchaseFunction, /available_from[\s\S]*available_until/i);
assert.match(
  reservePurchaseFunction,
  /payment\.state in \('created', 'pending'\)[\s\S]*payment\.method = p_method[\s\S]*payment\.expires_at is null[\s\S]*payment\.expires_at > now\(\)/i,
);
assert.match(reservePurchaseFunction, /order by payment\.created_at desc/i);
assert.match(reservePurchaseFunction, /for update/i);
assert.match(reservePurchaseFunction, /insert into public\.billing_purchases/i);
assert.match(reservePurchaseFunction, /insert into public\.billing_payments/i);
assert.match(reservePurchaseFunction, /'should_create_provider'/i);

const claimInquiryFunction = taskI5Function("claim_billing_payment_inquiry");
assert.match(claimInquiryFunction, /purchase\.user_id = p_user_id/i);
assert.match(claimInquiryFunction, /payment\.state = 'pending'/i);
assert.match(claimInquiryFunction, /provider_last_checked_at is null/i);
assert.match(
  claimInquiryFunction,
  /provider_last_checked_at <= now\(\) - interval '30 seconds'/i,
  "inquiry throttle must use an exact 30-second window",
);
assert.match(claimInquiryFunction, /for update/i);
assert.match(claimInquiryFunction, /provider_last_checked_at = now\(\)/i);

const supersedePaymentFunction = taskI5Function("supersede_billing_payment");
assert.match(supersedePaymentFunction, /payment\.user_id = p_user_id/i);
assert.match(supersedePaymentFunction, /payment\.state in \('created', 'pending'\)/i);
assert.match(supersedePaymentFunction, /for update/i);
assert.match(supersedePaymentFunction, /state = 'superseded'/i);
assert.match(supersedePaymentFunction, /cancellation_requested_at = now\(\)/i);

for (const signature of [
  "reserve_billing_purchase(uuid, text, text, integer)",
  "claim_billing_payment_inquiry(uuid, uuid)",
  "supersede_billing_payment(uuid, uuid)",
]) {
  const escaped = signature.replace(/[()]/g, "\\$&");
  assert.match(
    purchaseFunctionsSql,
    new RegExp(`revoke all on function public\\.${escaped}[\\s\\S]*from public, anon, authenticated`, "i"),
  );
  assert.match(
    purchaseFunctionsSql,
    new RegExp(`grant execute on function public\\.${escaped}[\\s\\S]*to service_role`, "i"),
  );
}

assert.doesNotMatch(purchaseFunctionsSql, /service_role_key|ipaymu_api_key/i);

console.log("billing migration contract valid");
