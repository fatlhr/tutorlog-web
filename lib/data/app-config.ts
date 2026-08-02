"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCommunityLink(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "community_link")
    .maybeSingle();

  if (!data?.value) return null;
  const value = data.value as Record<string, unknown>;
  const url = value?.telegram_url;
  return typeof url === "string" && url.trim() ? url.trim() : null;
}
