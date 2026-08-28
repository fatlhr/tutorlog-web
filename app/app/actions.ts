"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function updateName(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name || name.length > 100) {
    return { error: "Nama tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  if (error) {
    return { error: "Nama belum berhasil disimpan. Coba lagi." };
  }

  revalidatePath("/app", "layout");

  return { success: true };
}
