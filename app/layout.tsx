import type { Metadata } from "next";
import { Courier_Prime, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const courierPrime = Courier_Prime({
  variable: "--f-title",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--f-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TutorLog — Kelola Les Lebih Mudah",
  description: "Aplikasi untuk tutor privat mengelola jadwal, rekap sesi, dan tagihan murid.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${courierPrime.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
