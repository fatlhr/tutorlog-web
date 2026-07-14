import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkQuota } from "@/lib/data/quota";
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

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const email = user.email ?? "";
  const metaName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  const name = displayName(email, metaName);
  const initials = initialsOf(name);
  const quota = await checkQuota();

  const isPlus = quota.pdfExportUnlimited || quota.plan !== "free";

  return (
    <ProfileContent
      email={email}
      name={name}
      initials={initials}
      isPlus={isPlus}
      activeUntil={quota.activeUntil}
    />
  );
}
