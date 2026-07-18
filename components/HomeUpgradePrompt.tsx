import { Button } from "@/components/app-ui/controls";
import { FeedbackMessage } from "@/components/app-ui/structure";
import type { AccessState } from "@/lib/data/quota-access";

interface HomeUpgradePromptProps {
  accessState: AccessState;
  exhausted: boolean;
}

export default function HomeUpgradePrompt({ accessState, exhausted }: HomeUpgradePromptProps) {
  const expired = accessState === "plus_expired";
  const title = expired
    ? "Plus sudah kedaluwarsa."
    : exhausted
      ? "Batas export rekap gratis sudah digunakan."
      : "Export rekap gratis masih tersedia.";
  const body = expired
    ? "Perpanjang Plus untuk membuka invoice dan export rekap tanpa batas."
    : "Plus membuka invoice dan export rekap PDF/CSV tanpa batas.";

  return (
    <aside aria-label="TutorLog Plus" data-analytics-id="billing-dashboard-prompt">
      <FeedbackMessage
        status="warning"
        density="compact"
        title={title}
        body={body}
        action={(
          <Button href="/harga" variant="quiet" size="compact">
            {expired ? "Perpanjang Plus" : exhausted ? "Aktifkan Plus" : "Lihat Plus"}
          </Button>
        )}
      />
    </aside>
  );
}
