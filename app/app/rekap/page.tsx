import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TutorLog — Rekap",
  description: "Rekap sesi mengajar kamu.",
};

// Placeholder — full Rekap UI dibangun di Task 4.2.
export default function RekapPage() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--f-title)",
        color: "var(--tw-text)",
      }}
    >
      <p>Rekap — segera hadir (Phase 4).</p>
    </main>
  );
}
