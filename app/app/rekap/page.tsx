import type { Metadata } from "next";
import { fetchRekapDataByRange, type RekapData } from "@/lib/data/rekap";
import { getWibMonthToDateRange } from "@/lib/data/session-metrics.mjs";
import RekapContent from "@/components/RekapContent";

export const metadata: Metadata = {
  title: "TutorLog - Rekap",
  description: "Rekap sesi mengajar kamu.",
};

interface RekapPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function RekapPage({ searchParams }: RekapPageProps) {
  const params = await searchParams;
  const defaultRange = getWibMonthToDateRange(new Date());
  const from = params.from ?? defaultRange.from;
  const to = params.to ?? defaultRange.to;

  let rekapData: RekapData | null = null;
  let loadError = false;

  try {
    rekapData = await fetchRekapDataByRange(from, to);
  } catch {
    loadError = true;
  }

  return (
    <RekapContent
      rekapData={rekapData}
      from={from}
      to={to}
      wibToday={defaultRange.to}
      loadError={loadError}
    />
  );
}
