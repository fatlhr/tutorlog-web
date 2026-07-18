import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutPanel } from "@/components/billing/checkout-panel";
import {
  isPackageCode,
  type ProductSummary,
} from "@/lib/billing/contracts";
import {
  createDisplayQuote,
  FALLBACK_BILLING_CATALOG,
} from "@/lib/billing/fallback-catalog";
import { getAccessSummary } from "@/lib/billing/server/access";
import { requireUser } from "@/lib/billing/server/auth";
import {
  getCatalog,
  getQuote,
  isPaymentProviderEnabled,
} from "@/lib/billing/server/catalog";

export const metadata: Metadata = {
  title: "TutorLog - Checkout",
  description: "Pilih metode dan periksa total pembayaran paket TutorLog.",
};

const flowLayout: CSSProperties = {
  boxSizing: "border-box",
  display: "grid",
  minHeight: "100svh",
  padding: "clamp(24px, 6vw, 72px)",
  placeItems: "center",
  background: "var(--tl-bg)",
};

const checkoutContentLayout: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "min(100%, 680px)",
};

const backLinkStyle: CSSProperties = {
  alignSelf: "flex-start",
  color: "var(--tl-ink)",
  fontSize: "0.9375rem",
  fontWeight: 600,
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string | string[] }>;
}) {
  await requireUser();

  const value = (await searchParams).package;
  const requestedPackage = typeof value === "string" ? value : undefined;
  if (!isPackageCode(requestedPackage)) {
    redirect("/harga?reason=invalid-package");
  }

  const packageCode = requestedPackage;
  if (packageCode === "free") {
    redirect("/harga?reason=free-package");
  }

  let access: Awaited<ReturnType<typeof getAccessSummary>>;
  try {
    access = await getAccessSummary();
  } catch {
    redirect("/harga?reason=checkout-unavailable");
  }

  let products: ProductSummary[] = [...FALLBACK_BILLING_CATALOG];
  let liveCatalogLoaded = false;
  try {
    products = await getCatalog();
    liveCatalogLoaded = true;
  } catch {}

  const product = products.find((item) => item.code === packageCode);
  if (!product || !product.available) {
    redirect("/harga?reason=package-unavailable");
  }
  if (access.isLifetime) {
    redirect("/harga?reason=lifetime-active");
  }

  let initialQuote = createDisplayQuote(product, "qris");
  let paymentReady = isPaymentProviderEnabled() && liveCatalogLoaded;
  if (paymentReady) {
    try {
      initialQuote = await getQuote(packageCode, "qris");
    } catch {
      paymentReady = false;
    }
  }

  return (
    <div style={flowLayout}>
      <div style={checkoutContentLayout}>
        <Link href="/harga" style={backLinkStyle}>
          ← Kembali ke harga
        </Link>
        <CheckoutPanel
          product={product}
          initialQuote={initialQuote}
          paymentReady={paymentReady}
        />
      </div>
    </div>
  );
}
