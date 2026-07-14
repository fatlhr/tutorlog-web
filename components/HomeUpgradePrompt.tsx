import { Button } from "@/components/app-ui/controls";
import { FeedbackMessage } from "@/components/app-ui/structure";

interface HomeUpgradePromptProps {
  exhausted: boolean;
}

export default function HomeUpgradePrompt({ exhausted }: HomeUpgradePromptProps) {
  return (
    <aside aria-label="TutorLog Plus">
      <FeedbackMessage
        status="warning"
        density="compact"
        title={exhausted ? "Batas unduhan gratis bulan ini sudah digunakan." : "Unduhan gratis masih tersedia bulan ini."}
        body="Plus membuka unduhan rekap dan invoice tanpa batas."
        action={(
          <Button href="/harga" variant="quiet" size="compact">
            {exhausted ? "Aktifkan Plus" : "Lihat Plus"}
          </Button>
        )}
      />
    </aside>
  );
}
