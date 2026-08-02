export interface FieldDescription {
  helperId?: string;
  errorId?: string;
  describedBy?: string;
  invalid: boolean;
}

export function getFieldDescription(
  controlId: string,
  helper?: string,
  error?: string,
  externalDescribedBy?: string,
): FieldDescription {
  const helperId = helper ? `${controlId}-helper` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [externalDescribedBy, helperId, errorId]
    .filter(Boolean)
    .join(" ") || undefined;

  return {
    helperId,
    errorId,
    describedBy,
    invalid: Boolean(error),
  };
}
