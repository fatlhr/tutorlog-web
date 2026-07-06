import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppTopBar from "@/components/AppTopBar";
import TabBar from "@/components/TabBar";

function displayNameOf(email: string, metaName?: unknown): string {
  if (typeof metaName === "string" && metaName.trim()) return metaName.trim();
  return email.split("@")[0];
}

function initialsOf(name: string): string {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "";
  const name = displayNameOf(email, user.user_metadata?.full_name ?? user.user_metadata?.name);
  const initials = initialsOf(name);

  return (
    <div className="app-shell-h" style={{ minHeight: "100svh" }}>
      <div className="vp-desktop">
        <AppTopBar name={name} initials={initials} />
      </div>
      {children}
      <TabBar />
    </div>
  );
}
