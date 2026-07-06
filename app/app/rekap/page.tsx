import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TutorLog — Rekap",
  description: "Rekap sesi mengajar kamu.",
};

// Placeholder — full Rekap UI dibangun di Task 4.2.
export default function RekapPage() {
  return (
    <>
      {/* MOBILE */}
      <div className="vp-mobile">
        <div className="mob-page tw">
          <div className="mob-app-shell">
            <div className="mob-app-main">
              <div className="mob-app-hdr">
                <h1>Rekap Sesi</h1>
                <div className="sub">Segera hadir (Task 4.2)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="vp-desktop">
        <main className="app-main">
          <div className="app-header">
            <div>
              <h1>Rekap Sesi</h1>
              <div className="sub">Segera hadir (Task 4.2)</div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
