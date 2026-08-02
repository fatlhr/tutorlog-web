"use client";

import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useFormStatus } from "react-dom";
import { MarketingButton } from "@/components/public-ui/marketing-button";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <MarketingButton
      type="submit"
      size="large"
      block
      leadingIcon={<PaperPlaneTilt size={18} weight="fill" />}
      loading={pending}
      loadingLabel="Mengirim tautan..."
    >
      Kirim tautan masuk
    </MarketingButton>
  );
}
