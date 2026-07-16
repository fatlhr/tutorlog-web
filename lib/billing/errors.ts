export type BillingErrorCode =
  | "AUTH_REQUIRED"
  | "PAYMENT_PROVIDER_NOT_READY"
  | "PACKAGE_NOT_FOUND"
  | "PACKAGE_UNAVAILABLE"
  | "PRICE_CHANGED"
  | "LIFETIME_ALREADY_ACTIVE"
  | "PURCHASE_NOT_FOUND"
  | "PAYMENT_NOT_FOUND"
  | "PAYMENT_NOT_CANCELABLE"
  | "INVALID_PAYMENT_TRANSITION"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_RESPONSE_INVALID"
  | "EXPORT_NOT_ALLOWED";

export class BillingError extends Error {
  public readonly code: BillingErrorCode;

  constructor(code: BillingErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "BillingError";
  }
}
