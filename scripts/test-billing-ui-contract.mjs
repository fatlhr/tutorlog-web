import assert from "node:assert/strict";

import {
  accessLabel,
  annualSavings,
  formatIdr,
  paymentStatusCopy,
  productPeriodLabel,
} from "../lib/billing/ui-model.ts";
import { billingFixtures } from "../lib/billing/fixtures.ts";

assert.equal(formatIdr(149000), "Rp149.000");
assert.equal(productPeriodLabel(billingFixtures.products[1]), "30 hari");
assert.equal(productPeriodLabel(billingFixtures.products[2]), "12 bulan");
assert.equal(productPeriodLabel(billingFixtures.products[3]), "selamanya");
assert.equal(annualSavings(billingFixtures.products), 79000);
assert.equal(accessLabel(billingFixtures.access.lifetime), "Plus Selamanya");
assert.equal(
  paymentStatusCopy(billingFixtures.payments.verifying).title,
  "Memverifikasi pembayaran",
);
assert.equal(paymentStatusCopy(billingFixtures.payments.paid).title, "Plus sudah aktif");

console.log("billing UI contract valid");
