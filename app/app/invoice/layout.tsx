import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TutorLog — Invoice",
  description: "Buat invoice profesional untuk murid kamu.",
};

export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}