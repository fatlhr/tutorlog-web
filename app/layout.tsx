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
  metadataBase: new URL("https://tutorlog.id"),
  title: {
    default: "TutorLog - Kelola Les Lebih Mudah",
    template: "%s | TutorLog",
  },
  description: "TutorLog membantu tutor privat mencatat sesi, melihat rekap, dan membuat invoice.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "TutorLog - Catat Sesi, Rekap, dan Invoice Tutor Privat",
    description: "TutorLog membantu tutor privat mencatat sesi, melihat rekap, dan membuat invoice.",
    url: "https://tutorlog.id",
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
    title: "TutorLog - Catat Sesi, Rekap, dan Invoice Tutor Privat",
    description: "TutorLog membantu tutor privat mencatat sesi, melihat rekap, dan membuat invoice.",
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
