import "server-only";

import type {
  CheckoutQuote,
  PackageCode,
  PaymentMethod,
  ProductSummary,
} from "@/lib/billing/contracts";
import { isPackageCode } from "@/lib/billing/contracts";
import { BillingError } from "@/lib/billing/errors";
import { createAdminClient } from "@/lib/supabase/admin";

const CATALOG_ORDER: readonly PackageCode[] = [
  "free",
  "plus_30d",
  "plus_12m",
  "plus_lifetime",
];

interface CatalogRow {
  code: unknown;
  name: string;
  description: string;
  duration_kind: ProductSummary["durationKind"];
  duration_value: number | null;
  featured: boolean;
  available_from: string | null;
  available_until: string | null;
  billing_prices: Array<{ id: string; amount: number; currency: string }>;
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "qris" || value === "va";
}

export function isPaymentProviderEnabled(): boolean {
  return process.env.BILLING_PAYMENT_PROVIDER_ENABLED === "true";
}

export function assertPaymentProviderEnabled(): void {
  if (!isPaymentProviderEnabled()) {
    throw new BillingError(
      "PAYMENT_PROVIDER_NOT_READY",
      "Payment provider is not ready",
    );
  }
}

function isWithinAvailability(row: CatalogRow): boolean {
  const now = Date.now();
  const startsAt = row.available_from ? Date.parse(row.available_from) : null;
  const endsAt = row.available_until ? Date.parse(row.available_until) : null;
  return (startsAt === null || startsAt <= now) && (endsAt === null || endsAt > now);
}

function toProductSummary(row: CatalogRow): ProductSummary {
  const price = row.billing_prices[0];
  if (
    !isPackageCode(row.code)
    || !price
    || price.currency !== "IDR"
    || !Number.isSafeInteger(price.amount)
  ) {
    throw new BillingError("PROVIDER_RESPONSE_INVALID", "Catalog price is invalid");
  }

  return {
    code: row.code,
    name: row.name,
    description: row.description,
    priceId: price.id,
    amount: price.amount,
    currency: "IDR",
    durationKind: row.duration_kind,
    durationValue: row.duration_value,
    featured: row.featured,
    available: isWithinAvailability(row),
  };
}

export async function getCatalog(): Promise<ProductSummary[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("billing_products")
    .select(`
      code,
      name,
      description,
      duration_kind,
      duration_value,
      featured,
      available_from,
      available_until,
      billing_prices!inner(id, amount, currency)
    `)
    .eq("active", true)
    .eq("billing_prices.active", true);

  if (error || !data) throw new Error("Failed to load billing catalog");

  return (data as unknown as CatalogRow[])
    .map(toProductSummary)
    .sort((left, right) => CATALOG_ORDER.indexOf(left.code) - CATALOG_ORDER.indexOf(right.code));
}

async function getPaidProduct(packageCode: PackageCode): Promise<ProductSummary> {
  if (packageCode === "free") {
    throw new BillingError("PACKAGE_UNAVAILABLE", "Free is catalog-only");
  }

  const product = (await getCatalog()).find((item) => item.code === packageCode);
  if (!product) throw new BillingError("PACKAGE_NOT_FOUND", "Package not found");
  if (!product.available) throw new BillingError("PACKAGE_UNAVAILABLE", "Package unavailable");
  return product;
}

export async function getQuote(
  packageCode: PackageCode,
  method: PaymentMethod,
): Promise<CheckoutQuote> {
  assertPaymentProviderEnabled();
  if (method === "va") {
    throw new BillingError(
      "PAYMENT_PROVIDER_NOT_READY",
      "VA fee evidence is unavailable",
    );
  }

  const product = await getPaidProduct(packageCode);
  let channelFee = 0;
  if (method === "qris") channelFee = 0;

  return {
    package: product,
    method,
    baseAmount: product.amount,
    channelFee,
    totalAmount: product.amount + channelFee,
    currency: "IDR",
    expiresAt: null,
  };
}
