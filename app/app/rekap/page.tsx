import type { Metadata } from "next";
import { fetchRekapDataByRange, type RekapData } from "@/lib/data/rekap";
import RekapContent from "@/components/RekapContent";

export const metadata: Metadata = {
  title: "TutorLog — Rekap",
  description: "Rekap sesi mengajar kamu.",
};

interface RekapPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function RekapPage({ searchParams }: RekapPageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const from = params.from ?? `${year}-${String(month).padStart(2, "0")}-01`;
  const to = params.to ?? `${year}-${String(month).padStart(2, "0")}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;

  let rekapData: RekapData | null = null;
  let loadError = false;

  try {
    rekapData = await fetchRekapDataByRange(from, to);
  } catch {
    loadError = true;
  }

  return <RekapContent rekapData={rekapData} from={from} to={to} loadError={loadError} />;
}
