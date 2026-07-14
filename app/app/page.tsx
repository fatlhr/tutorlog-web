import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  BellRinging,
  CalendarBlank,
  DeviceMobile,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { checkQuota } from "@/lib/data/quota";
import { fetchRecentSessions, fetchRekapDataByRange } from "@/lib/data/rekap";
import HomeUpgradePrompt from "@/components/HomeUpgradePrompt";
import NamePromptDialog from "@/components/NamePromptDialog";
import { Button } from "@/components/app-ui/controls";
import { DataRow } from "@/components/app-ui/data-row";
import { RouteCanvas, PageMain } from "@/components/app-ui/route-canvas";
import { EmptyState, ErrorState } from "@/components/app-ui/states";
import type { SummaryItem } from "@/components/app-ui/types";
import {
  PageHeader,
  Section,
  SectionHeading,
  SummaryBand,
  Surface,
} from "@/components/app-ui/structure";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "TutorLog - Beranda",
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
  const rawName = user?.user_metadata?.full_name?.toString().trim() ?? "";
  const hasName = Boolean(rawName);
  const name = hasName ? rawName : (email.split("@")[0] || "Tutor");
  const now = new Date();
  const monthFormatter = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  });
  const period = monthRange(now);
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousPeriod = monthRange(previousMonthDate);
  const monthLabel = monthFormatter.format(now);
  const previousMonthLabel = monthFormatter.format(previousMonthDate);

  const [monthResult, recentResult, quotaResult, previousResult] = await Promise.allSettled([
    fetchRekapDataByRange(period.from, period.to),
    fetchRecentSessions(3),
    checkQuota(),
    fetchRekapDataByRange(previousPeriod.from, previousPeriod.to),
  ]);

  const monthData = monthResult.status === "fulfilled" ? monthResult.value : null;
  const recentSessions = recentResult.status === "fulfilled" ? recentResult.value : [];
  const quota = quotaResult.status === "fulfilled" ? quotaResult.value : null;
  const previousData = previousResult.status === "fulfilled" ? previousResult.value : null;
  const previousLoadError = previousResult.status === "rejected";
  const monthLoadError = monthResult.status === "rejected";
  const recentLoadError = recentResult.status === "rejected";
  const hasSessions = recentSessions.length > 0 || (monthData?.summary.totalSesi ?? 0) > 0;
  const isPaid = Boolean(quota && (quota.pdfExportUnlimited || quota.plan !== "free"));
  const freeQuotaExhausted = Boolean(quota && quota.pdfExportCount30d >= 1 && quota.csvExportCount30d >= 1);
  const summaryItems: SummaryItem[] = monthData ? [
    { label: "Sesi selesai", value: monthData.summary.totalSesi },
    { label: "Waktu mengajar", value: monthData.summary.totalJam },
    { label: "Estimasi pendapatan", value: monthData.summary.totalPendapatan },
  ] : [];

  return (
    <>
      <NamePromptDialog hasName={hasName} />
      <RouteCanvas route="home">
      <PageMain>
        <PageHeader
          route="home"
          eyebrow={monthLabel}
          title={`Halo, ${name}`}
          description="Lihat catatan mengajarmu sebelum lanjut ke rekap atau invoice."
        />

        {monthData ? (
          <SummaryBand
            label={`Ringkasan ${monthLabel}`}
            tone="home"
            items={summaryItems}
          />
        ) : (
          <ErrorState
            scope="inline"
            title="Ringkasan belum dapat dimuat"
            body="Data sesi tidak berubah. Coba buka Beranda lagi beberapa saat lagi."
          />
        )}

        {hasSessions ? (
          <Section labelledBy="recent-sessions-title">
            <div className={styles.workspaceHeading}>
              <SectionHeading
                headingId="recent-sessions-title"
                title="Sesi terbaru"
                description="Tiga sesi terakhir yang tercatat dari aplikasi."
                action={(
                  <Button
                    href="/app/rekap"
                    variant="quiet"
                    size="compact"
                    trailingIcon={<ArrowRight aria-hidden="true" />}
                  >
                    Lihat semua
                  </Button>
                )}
              />
            </div>

            <div className={styles.workspace}>
              {recentLoadError ? (
                <ErrorState
                  scope="section"
                  title="Sesi terbaru belum dapat dimuat"
                  body="Ringkasan bulan ini tetap dapat digunakan."
                />
              ) : (
                <Surface padding="none" labelledBy="recent-sessions-title">
                  {recentSessions.map((session) => (
                    <DataRow
                      key={session.id}
                      label={`${session.m}, ${session.d}, ${session.h} jam, ${session.t}`}
                      tone="home"
                      leading={(
                        <time
                          className={styles.sessionDate}
                          dateTime={session.rawDate}
                          aria-hidden="true"
                        >
                          {session.d}
                        </time>
                      )}
                      title={(
                        <>
                          <span className={styles.sessionA11y}>
                            {session.m}, {session.d},{" "}
                            {session.s === String.fromCharCode(8212) ? "Tanpa detail" : session.s},{" "}
                            {session.h} jam, {session.t}
                          </span>
                          <span className={styles.sessionName} aria-hidden="true">
                            {session.m}
                          </span>
                        </>
                      )}
                      metadata={(
                        <span className={styles.sessionMetadata} aria-hidden="true">
                          {session.s === String.fromCharCode(8212) ? "Tanpa detail" : session.s} · {session.h} jam
                        </span>
                      )}
                      trailing={(
                        <>
                          <span className={styles.sessionAmount} aria-hidden="true">{session.t}</span>
                          <span className={styles.sessionDuration} aria-hidden="true">{session.h} jam</span>
                        </>
                      )}
                    />
                  ))}
                </Surface>
              )}

              <aside className={styles.workspaceAside} aria-label="Langkah berikutnya">
                <Surface
                  as="section"
                  variant="contextual"
                  padding="compact"
                  tone="home"
                  labelledBy="home-next-action-title"
                >
                  <div className={styles.contextualAction}>
                    <span className={styles.contextualIcon} aria-hidden="true">
                      <CalendarBlank size={20} />
                    </span>
                    <div className={styles.contextualCopy}>
                      <h2 id="home-next-action-title">Buka rekap bulan ini</h2>
                      <p>Periksa sesi, jam, dan pendapatan sebelum membuat invoice.</p>
                    </div>
                    <div className={styles.contextualButton}>
                      <Button
                        href={`/app/rekap?from=${period.from}&to=${period.to}`}
                        size="compact"
                        trailingIcon={<ArrowRight aria-hidden="true" />}
                      >
                        Buka rekap
                      </Button>
                    </div>
                  </div>
                </Surface>

                {!isPaid && quota ? <HomeUpgradePrompt exhausted={freeQuotaExhausted} /> : null}
              </aside>
            </div>
          </Section>
        ) : monthLoadError || recentLoadError ? (
          <ErrorState
            scope="page"
            title="Beranda belum dapat dimuat"
            body="Periksa koneksi, lalu buka halaman ini lagi. Data sesi tidak berubah."
          />
        ) : (
          <EmptyState
            context="home"
            title="Catat sesi pertama dari aplikasi mobile"
            body="Setelah sesi disimpan, ringkasan dan rekapnya akan muncul di sini."
            visual={(
              <span className={styles.emptyVisual}>
                <Image src="/tutorlog-logo.png" alt="" width={34} height={34} />
                <DeviceMobile size={18} weight="bold" />
              </span>
            )}
            action={(
              <Button
                href="https://play.google.com/store/apps/details?id=com.tutorlog.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buka aplikasi
              </Button>
            )}
          />
        )}

        <section className={styles.closingRail} aria-label="Arsip dan pembaruan TutorLog">
          <article className={styles.archiveRail} aria-labelledby="previous-month-title">
            <header className={styles.railHeader}>
              <div>
                <p>Arsip bulan lalu</p>
                <h2 id="previous-month-title">{previousMonthLabel}</h2>
              </div>
              <Button
                href={`/app/rekap?from=${previousPeriod.from}&to=${previousPeriod.to}`}
                aria-label={`Buka rekap ${previousMonthLabel}`}
                variant="quiet"
                size="compact"
                trailingIcon={<ArrowRight aria-hidden="true" />}
              >
                <span className={styles.archiveActionLabel}>Buka rekap</span>
              </Button>
            </header>

            {previousData && previousData.summary.totalSesi > 0 ? (
              <dl className={styles.archiveMetrics}>
                <div>
                  <dt>Sesi selesai</dt>
                  <dd>{previousData.summary.totalSesi}</dd>
                </div>
                <div>
                  <dt>Waktu mengajar</dt>
                  <dd>{previousData.summary.totalJam}</dd>
                </div>
                <div>
                  <dt>Estimasi pendapatan</dt>
                  <dd>{previousData.summary.totalPendapatan}</dd>
                </div>
              </dl>
            ) : previousLoadError ? (
              <p className={styles.archiveMessage}>Arsip bulan lalu belum dapat dimuat.</p>
            ) : (
              <p className={styles.archiveMessage}>Belum ada sesi selesai pada {previousMonthLabel}.</p>
            )}
          </article>

          <aside className={styles.roadmapRail} aria-labelledby="roadmap-preview-title">
            <BellRinging size={24} weight="duotone" aria-hidden="true" />
            <div>
              <p>Sedang disiapkan</p>
              <h2 id="roadmap-preview-title">Pengingat sebelum sesi</h2>
              <span>Kami sedang menyiapkan pengingat sebelum sesi untuk melengkapi alur harian di aplikasi mobile.</span>
            </div>
          </aside>
        </section>
      </PageMain>
    </RouteCanvas>
    </>
  );
}
