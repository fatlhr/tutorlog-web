import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL(
  "../supabase/migrations/202608240001_lynk_webhook_flow.sql",
  import.meta.url,
);
const contractsUrl = new URL("../lib/billing/contracts.ts", import.meta.url);
const paymentsUrl = new URL("../lib/billing/server/payments.ts", import.meta.url);
const latestPaymentUrl = new URL(
  "../components/billing/latest-payment-card.tsx",
  import.meta.url,
);

const [sql, contractsSource, paymentsSource, latestPaymentSource] = await Promise.all([
  readFile(migrationUrl, "utf8"),
  readFile(contractsUrl, "utf8"),
  readFile(paymentsUrl, "utf8"),
  readFile(latestPaymentUrl, "utf8"),
]);

assert.match(sql, /create table public\.billing_lynk_webhook_inbox/i);
assert.match(sql, /provider text not null[\s\S]*check \(provider = 'lynk'\)/i);
assert.match(sql, /grand_total integer not null/i);
assert.match(sql, /payload jsonb not null/i);
assert.match(sql, /user_id uuid[\s\S]*purchase_id uuid[\s\S]*payment_id uuid[\s\S]*entitlement_grant_id uuid/i);
assert.match(
  sql,
  /purchase_id uuid references public\.billing_purchases\(id\)\s+on delete set null/i,
);
assert.match(
  sql,
  /payment_id uuid references public\.billing_payments\(id\)\s+on delete set null/i,
);
assert.match(
  sql,
  /entitlement_grant_id uuid references public\.billing_entitlement_grants\(id\)\s+on delete set null/i,
);
assert.match(
  sql,
  /create unique index billing_lynk_webhook_inbox_event_key_unique[\s\S]*\(provider, event_key\)/i,
);
assert.match(
  sql,
  /create unique index billing_lynk_webhook_inbox_reference_unique[\s\S]*\(provider, provider_reference\)[\s\S]*where provider_reference is not null/i,
);
assert.match(sql, /enable row level security/i);
assert.match(
  sql,
  /revoke all on table public\.billing_lynk_webhook_inbox from public, anon, authenticated/i,
);
assert.match(sql, /grant all on table public\.billing_lynk_webhook_inbox to service_role/i);

assert.match(sql, /drop constraint if exists billing_payments_method_check/i);
assert.match(sql, /check \(method in \('qris', 'va', 'external'\)\)/i);

const rpc = sql.match(
  /create function public\.process_lynk_payment_received\([\s\S]*?\n\$\$;/i,
)?.[0];
assert.ok(rpc, "process_lynk_payment_received RPC must exist");
assert.match(rpc, /p_event_key text/i);
assert.match(rpc, /p_provider_reference text/i);
assert.match(rpc, /p_customer_email text/i);
assert.match(rpc, /p_product_code text/i);
assert.match(rpc, /p_product_amount integer/i);
assert.match(rpc, /p_grand_total integer/i);
assert.match(rpc, /p_occurred_at timestamptz/i);
assert.match(rpc, /p_payload jsonb/i);
assert.match(rpc, /p_review_reason text/i);
assert.match(
  rpc,
  /p_provider_reference is not null\s+and \(\s*nullif\(btrim\(p_provider_reference\), ''\) is null\s+or length\(p_provider_reference\) > 512\s*\)/i,
);
assert.match(rpc, /pg_advisory_xact_lock/i);
assert.match(
  rpc,
  /if p_provider_reference is not null then[\s\S]*?lynk-reference:[\s\S]*?end if;/i,
);
assert.match(rpc, /insert into public\.billing_lynk_webhook_inbox/i);
assert.match(rpc, /from auth\.users/i);
assert.match(rpc, /user_not_found/i);
assert.match(rpc, /user_ambiguous/i);
assert.match(rpc, /from public\.billing_products[\s\S]*join public\.billing_prices/i);
assert.match(rpc, /unknown_product/i);
assert.match(rpc, /amount_mismatch/i);
assert.match(rpc, /insert into public\.billing_purchases/i);
assert.match(rpc, /insert into public\.billing_payments/i);
assert.match(rpc, /'lynk'[\s\S]*'external'[\s\S]*'pending'/i);
assert.match(rpc, /provider_reported_amount/i);
assert.match(rpc, /perform public\.apply_billing_paid_event/i);
assert.match(rpc, /from public\.billing_entitlement_grants/i);
assert.match(rpc, /processing_error/i);
assert.match(rpc, /'status', 'processed'/i);
assert.match(rpc, /'status', 'duplicate'/i);
assert.match(rpc, /'status', 'needs_review'/i);
assert.match(
  rpc,
  /if p_provider_reference is not null then[\s\S]*?and inbox\.provider_reference = p_provider_reference[\s\S]*?end if;/i,
);

const inboxInsertIndex = rpc.indexOf("insert into public.billing_lynk_webhook_inbox");
const userLookupIndex = rpc.indexOf("from auth.users");
assert.ok(inboxInsertIndex >= 0 && inboxInsertIndex < userLookupIndex);
const unsupportedOrderReviewIndex = rpc.indexOf("v_review_reason := 'unsupported_order'");
const paymentInsertIndex = rpc.indexOf("insert into public.billing_payments");
assert.ok(
  unsupportedOrderReviewIndex >= 0 &&
    unsupportedOrderReviewIndex < paymentInsertIndex,
  "nullable provider references must be reviewed before payment insertion",
);

assert.match(
  sql,
  /revoke all on function public\.process_lynk_payment_received\([\s\S]*from public, anon, authenticated/i,
);
assert.match(
  sql,
  /grant execute on function public\.process_lynk_payment_received\([\s\S]*to service_role/i,
);
assert.doesNotMatch(sql, /merchant[_ ]?key|service_role_key|buyer@example/i);

assert.match(contractsSource, /StoredPaymentMethod = PaymentMethod \| "external"/);
assert.match(contractsSource, /PaymentProviderName = "ipaymu" \| "duitku" \| "lynk"/);
assert.match(paymentsSource, /row\.provider !== "lynk"/);
assert.match(latestPaymentSource, /external: "Lynk\.id"/);

console.log("Lynk migration contract passed");
