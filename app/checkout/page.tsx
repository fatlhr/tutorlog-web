import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutPanel } from "@/components/billing/checkout-panel";
import { isPackageCode } from "@/lib/billing/contracts";
import { getAccessSummary } from "@/lib/billing/server/access";
import { requireUser } from "@/lib/billing/server/auth";
import { getCatalog, getQuote } from "@/lib/billing/server/catalog";

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

  let products: Awaited<ReturnType<typeof getCatalog>>;
  let access: Awaited<ReturnType<typeof getAccessSummary>>;
  try {
    [products, access] = await Promise.all([getCatalog(), getAccessSummary()]);
  } catch {
    redirect("/harga?reason=checkout-unavailable");
  }

  const product = products.find((item) => item.code === packageCode);
  if (!product || !product.available) {
    redirect("/harga?reason=package-unavailable");
  }
  if (access.isLifetime) {
    redirect("/harga?reason=lifetime-active");
  }

  let initialQuote: Awaited<ReturnType<typeof getQuote>>;
  try {
    initialQuote = await getQuote(packageCode, "qris");
  } catch {
    redirect("/harga?reason=checkout-unavailable");
  }

  return (
    <div style={flowLayout}>
      <CheckoutPanel product={product} initialQuote={initialQuote} />
    </div>
  );
}
