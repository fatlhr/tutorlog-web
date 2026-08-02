import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LatestPaymentSummary } from "@/lib/billing/contracts";
import { getAccessSummary } from "@/lib/billing/server/access";
import ProfileContent from "@/components/ProfileContent";

export const metadata: Metadata = {
  title: "TutorLog - Profil",
  description: "Profil dan pengaturan akun.",
};

function displayName(email: string, metaName?: unknown): string {
  if (typeof metaName === "string" && metaName.trim()) return metaName.trim();
  return email.split("@")[0];
}

function initialsOf(name: string): string {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

async function getLatestPayment(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<LatestPaymentSummary | null> {
  const { data: payment, error: paymentError } = await supabase
    .from("billing_payments")
    .select(`
      id,
      purchase_id,
      method,
      state,
      base_amount,
      channel_fee,
      total_amount,
      currency,
      safe_reference,
      paid_at,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError || !payment || payment.currency !== "IDR") {
    if (paymentError) console.error("Failed to load latest billing payment", paymentError);
    return null;
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from("billing_purchases")
    .select("product_name_snapshot")
    .eq("id", payment.purchase_id)
    .maybeSingle();

  if (purchaseError) {
    console.error("Failed to load latest billing purchase", purchaseError);
  }

  return {
    id: payment.id,
    packageName: purchase?.product_name_snapshot ?? "Paket Plus",
    method: payment.method,
    state: payment.state,
    baseAmount: payment.base_amount,
    channelFee: payment.channel_fee,
    totalAmount: payment.total_amount,
    currency: "IDR",
    safeReference: payment.safe_reference,
    createdAt: payment.created_at,
    paidAt: payment.paid_at,
  };
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const email = user.email ?? "";
  const metaName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  const name = displayName(email, metaName);
  const initials = initialsOf(name);
  const [access, latestPayment] = await Promise.all([
    getAccessSummary(),
    getLatestPayment(supabase),
  ]);

  return (
    <ProfileContent
      email={email}
      name={name}
      initials={initials}
      access={access}
      latestPayment={latestPayment}
    />
  );
}
