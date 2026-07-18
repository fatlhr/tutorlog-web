import type {
  CheckoutQuote,
  PaymentMethod,
  ProductSummary,
} from "@/lib/billing/contracts";

export const FALLBACK_BILLING_CATALOG = [
  {
    code: "free",
    name: "TutorLog Free",
    description: "Fitur inti TutorLog dengan batas penggunaan gratis.",
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
    description: "Akses penuh TutorLog Plus selama 30 hari.",
    priceId: null,
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
    description: "Akses penuh TutorLog Plus selama 12 bulan.",
    priceId: null,
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
    description: "Akses penuh TutorLog Plus tanpa batas waktu.",
    priceId: null,
    amount: 249000,
    currency: "IDR",
    durationKind: "lifetime",
    durationValue: null,
    featured: true,
    available: true,
  },
] as const satisfies readonly ProductSummary[];

export function createDisplayQuote(
  product: ProductSummary,
  method: PaymentMethod,
): CheckoutQuote {
  return {
    package: product,
    method,
    baseAmount: product.amount,
    channelFee: 0,
    totalAmount: product.amount,
    currency: "IDR",
    expiresAt: null,
  };
}
