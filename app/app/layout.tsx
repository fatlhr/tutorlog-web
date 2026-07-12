import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { checkQuota } from "@/lib/data/quota";
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
  const quota = await checkQuota();
  const isPlus = quota.pdfExportUnlimited || quota.plan !== "free";

  return (
    <div className="app-shell-h" style={{ minHeight: "100svh" }}>
      <AppTopBar name={name} initials={initials} isPlus={isPlus} />
      {children}

      <footer className="app-shell-footer">
        <span>© 2026 TutorLog</span>
        <div>
          <Link href="/privacy">Privasi</Link>
          <Link href="/terms">Syarat</Link>
          <Link href="/kontak">Kontak</Link>
        </div>
      </footer>

      <TabBar />
    </div>
  );
}
