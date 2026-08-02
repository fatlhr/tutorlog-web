import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import * as invoiceStudents from "../lib/invoice-students.mjs";

const {
  buildInvoiceRecipientLines,
  buildInvoiceStudentOptions,
  formatStudentDisplayName,
  resolveInvoiceStudentId,
} = invoiceStudents;

const students = [
  { id: "student-b", name: "aufa", educationLevel: "SMA" },
  { id: "student-a", name: "aufa", educationLevel: "SMA" },
  { id: "student-c", name: "aufa", educationLevel: "SMP" },
  { id: "student-d", name: "Bima", educationLevel: "SD" },
];

assert.deepEqual(buildInvoiceStudentOptions(students), [
  { value: "student-a", label: "Aufa (SMA) · 1" },
  { value: "student-b", label: "Aufa (SMA) · 2" },
  { value: "student-c", label: "Aufa (SMP)" },
  { value: "student-d", label: "Bima (SD)" },
]);

assert.deepEqual(
  buildInvoiceStudentOptions([
    { id: "student-e", name: "Citra", educationLevel: null },
  ]),
  [{ value: "student-e", label: "Citra" }],
  "A missing education level must not render empty parentheses",
);

assert.equal(
  typeof formatStudentDisplayName,
  "function",
  "Invoice student formatting must provide one shared display-only formatter",
);

for (const [rawName, expected] of [
  ["aufa", "Aufa"],
  ["aufa nur", "Aufa Nur"],
  ["SITI NUR", "Siti Nur"],
  ["  m. aufa  ", "M. Aufa"],
  ["siti-nur", "Siti-Nur"],
]) {
  assert.equal(
    formatStudentDisplayName(rawName),
    expected,
    `${rawName} must use a tidy student display name without changing identity`,
  );
}

assert.equal(
  typeof buildInvoiceRecipientLines,
  "function",
  "Invoice recipient formatting must provide one shared ordered-lines helper",
);
assert.deepEqual(
  buildInvoiceRecipientLines({
    studentName: "aufa nur",
    educationLevel: "Kelas 8",
    address: "  Jalan Sudirman  ",
    parentContact: " 0812-3456-7890 ",
  }),
  ["Aufa Nur (Kelas 8)", "Jalan Sudirman", "0812-3456-7890"],
);
assert.deepEqual(
  buildInvoiceRecipientLines({
    studentName: "aufa",
    educationLevel: " ",
    address: "",
    parentContact: "",
  }),
  ["Aufa"],
  "Empty recipient metadata must not leave empty parentheses or blank lines",
);

assert.equal(
  new Set(buildInvoiceStudentOptions(students).map((option) => option.value)).size,
  students.length,
  "every Select value and React key must be unique",
);

assert.equal(resolveInvoiceStudentId(students, "student-c", "aufa"), "student-c");
assert.equal(
  resolveInvoiceStudentId(students, "missing-id", "aufa"),
  "student-a",
  "legacy name-only drafts must resolve deterministically",
);

const invoiceSource = readFileSync(new URL("../app/app/invoice/page.tsx", import.meta.url), "utf8");

assert.match(invoiceSource, /const \[selectedStudentId, setSelectedStudentId\] = useState\(""\)/);
assert.match(invoiceSource, /\.eq\("student_location_id", selectedStudentId\)/);
assert.match(invoiceSource, /studentId:\s*selectedStudentId/);
assert.match(
  invoiceSource,
  /function getStudentRecipientName\(student: StudentOption\): string \{[\s\S]*formatStudentDisplayName\(student\.name\)[\s\S]*\}/,
  "The guardian fallback must display the selected student name in Title Case",
);
assert.match(
  invoiceSource,
  /interface InvoiceSessionItem \{[\s\S]*studentName: string;[\s\S]*\}/,
  "Invoice session items must retain the authoritative student name snapshot",
);
assert.match(
  invoiceSource,
  /const invoiceStudentName = formatStudentDisplayName\(\s*invoiceSessions\[0\]\?\.studentName\.trim\(\) \|\| studentName,?\s*\);[\s\S]*buildInvoiceRecipientLines\(\{\s*studentName: invoiceStudentName,/,
  "The Invoice document must prefer and format the session snapshot name",
);
assert.doesNotMatch(
  invoiceSource,
  /key=\{student\.name\}|value:\s*student\.name,\s*label:\s*student\.name/,
);
console.log("invoice student identity contract passed");
