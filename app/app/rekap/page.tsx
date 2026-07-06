import type { Metadata } from "next";
import RekapContent from "@/components/RekapContent";

export const metadata: Metadata = {
  title: "TutorLog — Rekap",
  description: "Rekap sesi mengajar kamu.",
};

export default function RekapPage() {
  return <RekapContent />;
}