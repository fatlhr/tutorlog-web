import assert from "node:assert/strict";
import {
  PACKAGE_CODES,
  PAYMENT_STATES,
  assertPaymentTransition,
  isPackageCode,
} from "../lib/billing/contracts.ts";
import { BillingError } from "../lib/billing/errors.ts";

assert.deepEqual(PACKAGE_CODES, ["free", "plus_30d", "plus_12m", "plus_lifetime"]);
assert.equal(isPackageCode("plus_12m"), true);
assert.equal(isPackageCode("founding_lifetime"), false);
assert.ok(PAYMENT_STATES.includes("superseded"));
assert.doesNotThrow(() => assertPaymentTransition("pending", "paid"));
assert.doesNotThrow(() => assertPaymentTransition("superseded", "paid"));
assert.throws(() => assertPaymentTransition("paid", "pending"), BillingError);

console.log("billing contract valid");
