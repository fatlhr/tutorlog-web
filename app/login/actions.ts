"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { safeNextPath } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNextPath(formData.get("next"));
  const encodedNext = encodeURIComponent(next);

  if (!email || !email.includes("@")) {
    redirect(`/login?error=invalid-email&next=${encodedNext}`);
  }

  const headerList = await headers();
  const origin =
    headerList.get("origin") ??
    `${headerList.get("x-forwarded-proto") ?? "http"}://${headerList.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/login?error=send-failed&email=${encodeURIComponent(email)}&next=${encodedNext}`);
  }

  redirect(`/login/sent?email=${encodeURIComponent(email)}&next=${encodedNext}`);
}
