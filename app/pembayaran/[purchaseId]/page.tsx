import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentStatusPanel } from "@/components/billing/payment-status-panel";
import { BillingError } from "@/lib/billing/errors";
import { requireUser } from "@/lib/billing/server/auth";
import {
  getPurchaseStatus,
  isUuid,
} from "@/lib/billing/server/payments";

export const metadata: Metadata = {
  title: "TutorLog - Status Pembayaran",
  description: "Periksa status pembayaran TutorLog.",
};

const flowLayout: CSSProperties = {
  boxSizing: "border-box",
  display: "grid",
  minHeight: "100svh",
  padding: "clamp(24px, 6vw, 72px)",
  placeItems: "center",
  background: "var(--tl-bg)",
};

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const { user } = await requireUser();
  const { purchaseId } = await params;
  if (!isUuid(purchaseId)) notFound();

  let purchase: Awaited<ReturnType<typeof getPurchaseStatus>>;
  try {
    purchase = await getPurchaseStatus(user.id, purchaseId);
  } catch (error) {
    if (error instanceof BillingError && error.code === "PURCHASE_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return (
    <div style={flowLayout}>
      <PaymentStatusPanel initialPurchase={purchase} />
    </div>
  );
}
