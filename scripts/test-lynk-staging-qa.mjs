// Signed negative-fixture QA runner for the deployed Lynk webhook route.
//
// Usage:
//   LYNK_MERCHANT_KEY=*** node scripts/test-lynk-staging-qa.mjs [target-url]
//
// target-url defaults to the staging worker's webhook endpoint. Every fixture
// uses a customer email on the reserved `.invalid` TLD (RFC 2606) and an
// event key prefixed `qa-`, so no real Supabase account can ever match and
// no entitlement can be granted, no matter what path the payload exercises.
// The merchant key is read from the environment and never logged or printed.

import { createHash, randomBytes } from "node:crypto";

const DEFAULT_TARGET_URL = "https://tutorlog-web-staging.fatlhr.workers.dev/api/webhooks/lynk";

const merchantKey = process.env.LYNK_MERCHANT_KEY;
if (!merchantKey) {
  console.error("LYNK_MERCHANT_KEY env var is required (not printed).");
  process.exit(1);
}

const targetUrl = process.argv[2] || process.env.LYNK_STAGING_URL || DEFAULT_TARGET_URL;

function qaId() {
  return `qa-${randomBytes(6).toString("hex")}`;
}

function signPayload(payload, key) {
  const { grandTotal } = payload.data.message_data.totals;
  const { refId } = payload.data.message_data;
  const messageId = payload.data.message_id;
  const signedInput = String(grandTotal) + refId + messageId + key;
  return createHash("sha256").update(signedInput, "utf8").digest("hex");
}

function buildPayload({ id, email, title, uuid, amount, grandTotal, totalPrice }) {
  return {
    event: "payment.received",
    data: {
      message_action: "SUCCESS",
      message_code: "0",
      message_id: id,
      message_data: {
        createdAt: new Date().toISOString(),
        customer: { email },
        items: [
          {
            addons: [],
            price: amount,
            qty: 1,
            title,
            uuid,
          },
        ],
        refId: id,
        totals: {
          discount: 0,
          grandTotal,
          totalAddon: 0,
          totalItem: 1,
          totalPrice,
          totalShipping: 0,
        },
      },
    },
  };
}

const fixtures = [
  {
    name: "unknown-email (valid product/amount, .invalid email)",
    payload: (id) => buildPayload({
      id,
      email: `${id}@example.invalid`,
      title: "TutorLog Plus — 30 Hari",
      uuid: "",
      amount: 19000,
      grandTotal: 19000,
      totalPrice: 19000,
    }),
  },
  {
    name: "unknown-product (title matches nothing in catalog)",
    payload: (id) => buildPayload({
      id,
      email: `${id}@example.invalid`,
      title: "Produk QA Tidak Dikenal",
      uuid: "",
      amount: 19000,
      grandTotal: 19000,
      totalPrice: 19000,
    }),
  },
  {
    name: "amount-mismatch (correct product, wrong price)",
    payload: (id) => buildPayload({
      id,
      email: `${id}@example.invalid`,
      title: "TutorLog Plus — 30 Hari",
      uuid: "",
      amount: 1,
      grandTotal: 1,
      totalPrice: 1,
    }),
  },
];

let failures = 0;

for (const fixture of fixtures) {
  const id = qaId();
  const payload = fixture.payload(id);
  const signature = signPayload(payload, merchantKey);

  let response;
  let body;
  try {
    response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-lynk-signature": signature,
      },
      body: JSON.stringify(payload),
    });
    body = await response.json().catch(() => null);
  } catch (error) {
    failures += 1;
    console.error(`[FAIL] ${fixture.name}: request error — ${error.message}`);
    continue;
  }

  const ok = response.status === 200 && body?.status === "review";
  if (ok) {
    console.log(`[PASS] ${fixture.name}: event_key=${id} -> HTTP ${response.status} ${JSON.stringify(body)}`);
  } else {
    failures += 1;
    console.error(`[FAIL] ${fixture.name}: event_key=${id} -> HTTP ${response.status} ${JSON.stringify(body)}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures}/${fixtures.length} fixture(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${fixtures.length} fixtures returned needs_review as expected.`);
console.log("Cross-check billing_lynk_webhook_inbox for the qa- event keys above to confirm review_reason and zero entitlement grants.");
