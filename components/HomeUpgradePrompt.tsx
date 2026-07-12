import Link from "next/link";

interface HomeUpgradePromptProps {
  exhausted: boolean;
}

export default function HomeUpgradePrompt({ exhausted }: HomeUpgradePromptProps) {
  return (
    <aside className="home-upgrade-prompt">
      <div>
        <strong>{exhausted ? "Batas unduhan gratis bulan ini sudah digunakan." : "Unduhan gratis masih tersedia bulan ini."}</strong>
        <span>Plus membuka unduhan rekap dan invoice tanpa batas.</span>
      </div>
      <Link href="/harga">{exhausted ? "Aktifkan Plus" : "Lihat Plus"}</Link>
    </aside>
  );
}
