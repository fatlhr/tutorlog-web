import type { Metadata } from "next";
import { Courier_Prime, Source_Serif_4 } from "next/font/google";
import SkipLink from "@/components/SkipLink";
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
  metadataBase: new URL("https://web.tutorlog.id"),
  title: {
    default: "TutorLog — Kelola Les Lebih Mudah",
    template: "%s | TutorLog",
  },
  description: "Aplikasi untuk tutor privat mengelola jadwal, rekap sesi, dan tagihan murid.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "TutorLog — Kelola Les Lebih Mudah",
    description: "Aplikasi untuk tutor privat mengelola jadwal, rekap sesi, dan tagihan murid.",
    url: "https://web.tutorlog.id",
    siteName: "TutorLog",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "TutorLog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TutorLog — Kelola Les Lebih Mudah",
    description: "Aplikasi untuk tutor privat mengelola jadwal, rekap sesi, dan tagihan murid.",
    images: ["/icon.png"],
  },
  themeColor: "#006C53",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${courierPrime.variable} ${sourceSerif.variable}`}>
      <body>
        <SkipLink />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
