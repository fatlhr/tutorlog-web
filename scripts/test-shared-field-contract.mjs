import assert from "node:assert/strict";
import { getFieldDescription } from "../components/ui/field-contract.ts";

const complete = getFieldDescription(
  "login-email",
  "Gunakan email aplikasi.",
  "Email tidak valid.",
  "form-note",
);

assert.deepEqual(complete, {
  helperId: "login-email-helper",
  errorId: "login-email-error",
  describedBy: "form-note login-email-helper login-email-error",
  invalid: true,
});

const empty = getFieldDescription("student-name");
assert.deepEqual(empty, {
  helperId: undefined,
  errorId: undefined,
  describedBy: undefined,
  invalid: false,
});

console.log("shared field contract valid");
