import assert from "node:assert/strict";
import {
  clearInvoiceFormCache,
  getInvoiceDraft,
  getInvoiceSettings,
  resolveInvoiceTutorName,
  saveInvoiceDraft,
  saveInvoiceSettings,
} from "../lib/invoice-form-cache.ts";

function createStorage(throws = false) {
  const values = new Map();
  return {
    getItem(key) {
      if (throws) throw new Error("storage unavailable");
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      if (throws) throw new Error("storage unavailable");
      values.set(key, value);
    },
    removeItem(key) {
      if (throws) throw new Error("storage unavailable");
      values.delete(key);
    },
    has(key) {
      return values.has(key);
    },
  };
}

const localStorage = createStorage();
const sessionStorage = createStorage();
const draft = { tutorName: "Fatih", bankName: "BCA" };
const settings = { tutorName: "Fatih", template: "klasik" };

saveInvoiceDraft(sessionStorage, draft);
assert.deepEqual(getInvoiceDraft(sessionStorage), draft);
assert.equal(localStorage.has("tutorlog-invoice-draft:v1"), false);

saveInvoiceSettings(localStorage, settings);
assert.deepEqual(getInvoiceSettings(localStorage), settings);
assert.equal(sessionStorage.has("tutorlog-invoice-settings"), false);

clearInvoiceFormCache({ localStorage, sessionStorage });
assert.equal(getInvoiceDraft(sessionStorage), null);
assert.equal(getInvoiceSettings(localStorage), null);

assert.doesNotThrow(() => {
  clearInvoiceFormCache({
    localStorage: createStorage(true),
    sessionStorage: createStorage(true),
  });
});

assert.equal(
  resolveInvoiceTutorName({
    draft: { tutorName: "Draft Tutor" },
    settings: { tutorName: "Saved Tutor" },
    accountName: "Account Tutor",
    email: "fatih@example.com",
  }),
  "Draft Tutor",
);

assert.equal(
  resolveInvoiceTutorName({
    draft: null,
    settings: { tutorName: "Saved Tutor" },
    accountName: "Account Tutor",
    email: "fatih@example.com",
  }),
  "Saved Tutor",
);

assert.equal(
  resolveInvoiceTutorName({
    draft: null,
    settings: null,
    accountName: "Account Tutor",
    email: "fatih@example.com",
  }),
  "Account Tutor",
);

assert.equal(
  resolveInvoiceTutorName({
    draft: null,
    settings: null,
    accountName: "",
    email: "fatih@example.com",
  }),
  "fatih",
);

console.log("invoice form cache contract valid");
