import type { Metadata } from "next";
import { fetchRekapData, type RekapData } from "@/lib/data/rekap";
import RekapContent from "@/components/RekapContent";

export const metadata: Metadata = {
  title: "TutorLog — Rekap",
  description: "Rekap sesi mengajar kamu.",
};

interface RekapPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function RekapPage({ searchParams }: RekapPageProps) {
  const params = await searchParams;
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  if (params.month) {
    const parts = params.month.split("-");
    if (parts.length === 2) {
      const py = parseInt(parts[0], 10);
      const pm = parseInt(parts[1], 10);
      if (!isNaN(py) && !isNaN(pm) && pm >= 1 && pm <= 12) {
        year = py;
        month = pm;
      }
    }
  }

  let rekapData: RekapData | null = null;

  try {
    rekapData = await fetchRekapData(year, month);
  } catch {
    // Data fetch failed — component will show dummy data (dev) or empty (prod)
  }

  return <RekapContent rekapData={rekapData} year={year} month={month} />;
}