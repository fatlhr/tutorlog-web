import { BillingError } from "./errors";

export const PACKAGE_CODES = ["free", "plus_30d", "plus_12m", "plus_lifetime"] as const;
export type PackageCode = (typeof PACKAGE_CODES)[number];

export const ACCESS_STATES = ["free", "plus_active", "plus_expired"] as const;
export type AccessState = (typeof ACCESS_STATES)[number];
export type EntitlementType = "term" | "lifetime" | null;

export const PAYMENT_STATES = [
  "created", "pending", "superseded", "paid", "expired", "failed", "canceled", "refunded",
] as const;
export type PaymentState = (typeof PAYMENT_STATES)[number];
export type PaymentMethod = "qris" | "va";

export interface ProductSummary {
  code: PackageCode;
  name: string;
  description: string;
  priceId: string | null;
  amount: number;
  currency: "IDR";
  durationKind: "free" | "days" | "months" | "lifetime";
  durationValue: number | null;
  featured: boolean;
  available: boolean;
}

export interface CheckoutQuote {
  package: ProductSummary;
  method: PaymentMethod;
  baseAmount: number;
  channelFee: number;
  totalAmount: number;
  currency: "IDR";
  expiresAt: string | null;
}

export interface AccessSummary {
  state: AccessState;
  entitlementType: EntitlementType;
  isLifetime: boolean;
  activeFrom: string | null;
  activeUntil: string | null;
}

export interface LatestPaymentSummary {
  id: string;
  packageName: string;
  method: PaymentMethod;
  state: PaymentState;
  baseAmount: number;
  channelFee: number;
  totalAmount: number;
  currency: "IDR";
  safeReference: string;
  createdAt: string;
  paidAt: string | null;
}

export interface PurchaseSummary {
  id: string;
  packageCode: PackageCode;
  packageName: string;
  state: "open" | "completed" | "canceled" | "refunded";
  payment: PaymentStatusView | null;
}

export interface PaymentStatusView extends LatestPaymentSummary {
  purchaseId: string;
  provider: "ipaymu" | "duitku";
  expiresAt: string | null;
  redirectUrl: string | null;
  instructions: string[];
  verificationDeadline: string | null;
  duplicateReview: boolean;
}

export interface ExportAuthorizationResult {
  allowed: boolean;
  authorizationId: string | null;
  reason: "free-limit" | "expired" | "invoice-locked" | null;
  used: number | null;
  limit: number | null;
}

export function isPackageCode(value: unknown): value is PackageCode {
  return typeof value === "string" && PACKAGE_CODES.includes(value as PackageCode);
}

const transitions: Record<PaymentState, readonly PaymentState[]> = {
  created: ["pending", "superseded", "failed", "canceled"],
  pending: ["superseded", "paid", "expired", "failed", "canceled"],
  superseded: ["paid", "expired", "canceled"],
  paid: ["refunded"],
  expired: ["paid"],
  failed: ["paid"],
  canceled: ["paid"],
  refunded: [],
};

export function assertPaymentTransition(from: PaymentState, to: PaymentState): void {
  if (!transitions[from].includes(to)) {
    throw new BillingError(
      "INVALID_PAYMENT_TRANSITION",
      `Invalid payment transition: ${from} -> ${to}`,
    );
  }
}
