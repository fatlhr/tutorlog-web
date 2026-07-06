import type { Metadata } from "next";
import { fetchRekapData, type RekapData } from "@/lib/data/rekap";
import RekapContent from "@/components/RekapContent";

export const metadata: Metadata = {
  title: "TutorLog — Rekap",
  description: "Rekap sesi mengajar kamu.",
};

export default async function RekapPage() {
  const now = new Date();
  let rekapData: RekapData | null = null;

  try {
    rekapData = await fetchRekapData(now.getFullYear(), now.getMonth() + 1);
  } catch {
    // Data fetch failed — component will show dummy data
  }

  return <RekapContent rekapData={rekapData} />;
}