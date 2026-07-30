function normalizedName(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return (trimmed || "Tanpa Nama").toLocaleLowerCase("id-ID");
}

export function formatStudentDisplayName(value) {
  const trimmed = typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
  if (!trimmed) return "Tanpa Nama";

  return trimmed
    .toLocaleLowerCase("id-ID")
    .replace(
      /(^|[\s\-'’])(\p{L})/gu,
      (_, separator, letter) => `${separator}${letter.toLocaleUpperCase("id-ID")}`,
    );
}

export function buildInvoiceRecipientLines({
  studentName,
  educationLevel,
  address,
  parentContact,
}) {
  const name = formatStudentDisplayName(studentName);
  const education = typeof educationLevel === "string" ? educationLevel.trim() : "";
  const studentLabel = education ? `${name} (${education})` : name;
  const normalizedAddress = typeof address === "string" ? address.trim() : "";
  const normalizedContact = typeof parentContact === "string" ? parentContact.trim() : "";

  return [studentLabel, normalizedAddress, normalizedContact].filter(Boolean);
}

function educationLabel(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || "Tanpa tingkat";
}

export function sortInvoiceStudents(students) {
  return [...students].sort((left, right) => {
    const nameComparison = normalizedName(left.name).localeCompare(
      normalizedName(right.name),
      "id-ID",
    );
    if (nameComparison !== 0) return nameComparison;

    const educationComparison = educationLabel(left.educationLevel).localeCompare(
      educationLabel(right.educationLevel),
      "id-ID",
    );
    if (educationComparison !== 0) return educationComparison;
    return left.id.localeCompare(right.id);
  });
}

export function buildInvoiceStudentOptions(students) {
  const sorted = sortInvoiceStudents(students);
  const nameCounts = new Map();
  const detailCounts = new Map();

  for (const student of sorted) {
    const nameKey = normalizedName(student.name);
    const detailKey = `${nameKey}\u0000${educationLabel(student.educationLevel)}`;
    nameCounts.set(nameKey, (nameCounts.get(nameKey) ?? 0) + 1);
    detailCounts.set(detailKey, (detailCounts.get(detailKey) ?? 0) + 1);
  }

  const detailIndexes = new Map();
  return sorted.map((student) => {
    const name = formatStudentDisplayName(student.name);
    const nameKey = normalizedName(student.name);
    const education = typeof student.educationLevel === "string"
      ? student.educationLevel.trim()
      : "";
    const studentLabel = education ? `${name} (${education})` : name;
    if ((nameCounts.get(nameKey) ?? 0) === 1) {
      return { value: student.id, label: studentLabel };
    }

    const detailKey = `${nameKey}\u0000${educationLabel(student.educationLevel)}`;
    const duplicateDetailCount = detailCounts.get(detailKey) ?? 0;
    if (duplicateDetailCount === 1) {
      return { value: student.id, label: studentLabel };
    }

    const nextIndex = (detailIndexes.get(detailKey) ?? 0) + 1;
    detailIndexes.set(detailKey, nextIndex);
    return {
      value: student.id,
      label: `${studentLabel} · ${nextIndex}`,
    };
  });
}

export function resolveInvoiceStudentId(students, preferredId, legacyName) {
  const sorted = sortInvoiceStudents(students);
  if (preferredId && sorted.some((student) => student.id === preferredId)) {
    return preferredId;
  }

  if (legacyName) {
    const legacyKey = normalizedName(legacyName);
    const legacyMatch = sorted.find(
      (student) => normalizedName(student.name) === legacyKey,
    );
    if (legacyMatch) return legacyMatch.id;
  }

  return sorted[0]?.id ?? "";
}
