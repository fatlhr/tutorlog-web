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

export async function verifyEmailOtp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  const next = safeNextPath(formData.get("next"));
  const sentPage = `/login/sent?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`;

  if (!email || !/^\d{6}$/.test(token)) {
    redirect(`${sentPage}&error=invalid-code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });

  if (error) {
    const reason = error.status === 429 ? "rate-limited" : "invalid-code";
    redirect(`${sentPage}&error=${reason}`);
  }

  redirect(next);
}
