import type {
  CheckoutQuote,
  PaymentMethod,
  ProductSummary,
} from "@/lib/billing/contracts";

export const FALLBACK_BILLING_CATALOG = [
  {
    code: "free",
    name: "Paket Free",
    description: "Catat sesi, periksa rekap, dan susun draft invoice dengan batas ekspor gratis.",
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
    name: "Plus 30 hari",
    description: "Ekspor rekap tanpa batas dan unduh PDF invoice selama 30 hari.",
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
    name: "Plus 12 bulan",
    description: "Ekspor rekap tanpa batas dan unduh PDF invoice selama 12 bulan.",
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
    name: "Plus selamanya",
    description: "Ekspor rekap tanpa batas dan unduh PDF invoice selamanya.",
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
