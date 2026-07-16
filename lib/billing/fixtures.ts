import type {
  AccessSummary,
  CheckoutQuote,
  ExportAuthorizationResult,
  LatestPaymentSummary,
  PaymentStatusView,
  ProductSummary,
} from "./contracts";

const products = [
  {
    code: "free",
    name: "Free",
    description: "Fitur dasar untuk mulai mencatat sesi.",
    priceId: null,
    amount: 0,
    currency: "IDR",
    durationKind: "free",
    durationValue: null,
    featured: false,
    available: true,
  },
  {
    code: "plus_30d",
    name: "Plus 30 Hari",
    description: "Akses seluruh fitur Plus selama 30 hari.",
    priceId: "price_test_plus_30d",
    amount: 19000,
    currency: "IDR",
    durationKind: "days",
    durationValue: 30,
    featured: false,
    available: true,
  },
  {
    code: "plus_12m",
    name: "Plus 12 Bulan",
    description: "Akses seluruh fitur Plus selama 12 bulan.",
    priceId: "price_test_plus_12m",
    amount: 149000,
    currency: "IDR",
    durationKind: "months",
    durationValue: 12,
    featured: true,
    available: true,
  },
  {
    code: "plus_lifetime",
    name: "Plus Selamanya",
    description: "Sekali bayar untuk akses Plus selamanya.",
    priceId: "price_test_plus_lifetime",
    amount: 299000,
    currency: "IDR",
    durationKind: "lifetime",
    durationValue: null,
    featured: false,
    available: true,
  },
] satisfies ProductSummary[];

const qrisQuote: CheckoutQuote = {
  package: products[1],
  method: "qris",
  baseAmount: 19000,
  channelFee: 1000,
  totalAmount: 20000,
  currency: "IDR",
  expiresAt: "2030-01-15T10:30:00.000Z",
};

const vaQuote: CheckoutQuote = {
  package: products[2],
  method: "va",
  baseAmount: 149000,
  channelFee: 4000,
  totalAmount: 153000,
  currency: "IDR",
  expiresAt: "2030-01-15T10:30:00.000Z",
};

function payment(
  id: string,
  state: PaymentStatusView["state"],
  overrides: Partial<PaymentStatusView> = {},
): PaymentStatusView {
  return {
    id,
    purchaseId: "PURCHASE-TEST-001",
    packageName: "Plus 12 Bulan",
    method: "qris",
    state,
    baseAmount: 149000,
    channelFee: 1000,
    totalAmount: 150000,
    currency: "IDR",
    safeReference: id,
    createdAt: "2030-01-15T10:00:00.000Z",
    paidAt: state === "paid" ? "2030-01-15T10:05:00.000Z" : null,
    provider: "ipaymu",
    expiresAt: "2030-01-15T10:30:00.000Z",
    redirectUrl: state === "pending" ? "https://example.test/pay/PAY-TEST-001" : null,
    instructions: ["Buka halaman pembayaran", "Selesaikan pembayaran sebelum batas waktu"],
    verificationDeadline: null,
    duplicateReview: false,
    ...overrides,
  };
}

const access = {
  free: {
    state: "free",
    entitlementType: null,
    isLifetime: false,
    activeFrom: null,
    activeUntil: null,
  },
  active: {
    state: "plus_active",
    entitlementType: "term",
    isLifetime: false,
    activeFrom: "2030-01-15T10:05:00.000Z",
    activeUntil: "2031-01-15T10:05:00.000Z",
  },
  expired: {
    state: "plus_expired",
    entitlementType: "term",
    isLifetime: false,
    activeFrom: "2028-01-15T10:05:00.000Z",
    activeUntil: "2029-01-15T10:05:00.000Z",
  },
  lifetime: {
    state: "plus_active",
    entitlementType: "lifetime",
    isLifetime: true,
    activeFrom: "2030-01-15T10:05:00.000Z",
    activeUntil: null,
  },
} satisfies Record<string, AccessSummary>;

const payments = {
  pending: payment("PAY-TEST-001", "pending"),
  verifying: payment("PAY-TEST-002", "pending", {
    redirectUrl: null,
    verificationDeadline: "2030-01-15T10:15:00.000Z",
  }),
  paid: payment("PAY-TEST-003", "paid"),
  expired: payment("PAY-TEST-004", "expired"),
  failed: payment("PAY-TEST-005", "failed"),
  canceled: payment("PAY-TEST-006", "canceled"),
  duplicateReview: payment("PAY-TEST-007", "paid", { duplicateReview: true }),
};

const latestPayment: LatestPaymentSummary = payments.paid;

const exports = {
  allowed: {
    allowed: true,
    authorizationId: "EXPORT-TEST-001",
    reason: null,
    used: 1,
    limit: 3,
  },
  blocked: {
    allowed: false,
    authorizationId: null,
    reason: "free-limit",
    used: 3,
    limit: 3,
  },
} satisfies Record<string, ExportAuthorizationResult>;

export const billingFixtures = {
  products,
  quotes: { qris: qrisQuote, va: vaQuote },
  access,
  payments,
  latestPayment,
  exports,
};
