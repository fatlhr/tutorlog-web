import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, DeviceMobile } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { checkQuota } from "@/lib/data/quota";
import { fetchRecentSessions, fetchRekapDataByRange } from "@/lib/data/rekap";
import HomeUpgradePrompt from "@/components/HomeUpgradePrompt";

export const metadata: Metadata = {
  title: "TutorLog — Beranda",
  description: "Ringkasan sesi dan pekerjaan tutor bulan ini.",
};

function monthRange(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${year}-${String(month).padStart(2, "0")}-01`,
    to: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? "";
  const name = email.split("@")[0] || "Tutor";
  const now = new Date();
  const period = monthRange(now);
  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(now);

  const [monthResult, recentResult, quotaResult] = await Promise.allSettled([
    fetchRekapDataByRange(period.from, period.to),
    fetchRecentSessions(3),
    checkQuota(),
  ]);

  const monthData = monthResult.status === "fulfilled" ? monthResult.value : null;
  const recentSessions = recentResult.status === "fulfilled" ? recentResult.value : [];
  const quota = quotaResult.status === "fulfilled" ? quotaResult.value : null;
  const hasSessions = recentSessions.length > 0 || (monthData?.summary.totalSesi ?? 0) > 0;
  const isPaid = Boolean(quota && (quota.pdfExportUnlimited || quota.plan !== "free"));
  const freeQuotaExhausted = Boolean(quota && quota.pdfExportCount30d >= 1 && quota.csvExportCount30d >= 1);

  return (
    <main className="app-main app-home-main" id="main-content">
      <header className="app-home-heading">
        <div>
          <p className="app-home-period">{monthLabel}</p>
          <h1>Halo, {name}</h1>
          <p>Lihat catatan mengajarmu sebelum lanjut ke rekap atau invoice.</p>
        </div>
      </header>

      {monthData ? (
        <section className="app-home-summary" aria-label={`Ringkasan ${monthLabel}`}>
          <div>
            <span>Sesi</span>
            <strong>{monthData.summary.totalSesi}</strong>
          </div>
          <div>
            <span>Total jam</span>
            <strong>{monthData.summary.totalJam}</strong>
          </div>
          <div>
            <span>Perkiraan pendapatan</span>
            <strong>{monthData.summary.totalPendapatan}</strong>
          </div>
        </section>
      ) : (
        <div className="app-home-load-error">Ringkasan bulan ini belum dapat dimuat.</div>
      )}

      {hasSessions ? (
        <>
          <section className="app-home-recent" aria-labelledby="recent-sessions-title">
            <div className="app-home-section-heading">
              <div>
                <p>Aktivitas terbaru</p>
                <h2 id="recent-sessions-title">Sesi terbaru</h2>
              </div>
              <Link href="/app/rekap">Lihat semua <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>

            <div className="app-home-session-list">
              {recentSessions.map((session) => (
                <div className="app-home-session-row" key={session.id}>
                  <div>
                    <strong>{session.m}</strong>
                    <span>{session.d} · {session.s}</span>
                  </div>
                  <div>
                    <strong>{session.t}</strong>
                    <span>{session.h} jam</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="app-home-next-action">
            <div>
              <p>Berikutnya</p>
              <h2>Buka rekap bulan ini.</h2>
              <span>Periksa sesi, jam, dan pendapatan sebelum membuat invoice.</span>
            </div>
            <Link href={`/app/rekap?from=${period.from}&to=${period.to}`}>Buka rekap <ArrowRight size={17} aria-hidden="true" /></Link>
          </section>

          {!isPaid && quota ? <HomeUpgradePrompt exhausted={freeQuotaExhausted} /> : null}
        </>
      ) : (
        <section className="app-home-onboarding">
          <DeviceMobile size={30} aria-hidden="true" />
          <div>
            <p>Belum ada sesi</p>
            <h2>Catat sesi pertama dari aplikasi mobile.</h2>
            <span>Setelah sesi disimpan, ringkasan dan rekapnya akan muncul di sini.</span>
          </div>
          <a href="https://play.google.com/store/apps/details?id=com.tutorlog.app" target="_blank" rel="noopener noreferrer">Buka aplikasi</a>
        </section>
      )}
    </main>
  );
}
