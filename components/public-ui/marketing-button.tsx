import { SpinnerGap } from "@phosphor-icons/react/dist/ssr";
import type { Ref } from "react";
import { ButtonPrimitive } from "@/components/ui/button-primitive";
import type { SharedButtonProps, SharedControlSize } from "@/components/ui/control-types";
import styles from "./public-controls.module.css";

export type MarketingButtonVariant = "primary" | "secondary" | "editorial";

export type MarketingButtonProps = SharedButtonProps & {
  variant?: MarketingButtonVariant;
  size?: SharedControlSize;
  buttonRef?: Ref<HTMLButtonElement>;
  linkRef?: Ref<HTMLAnchorElement>;
};

function marketingButtonClasses(
  variant: MarketingButtonVariant,
  size: SharedControlSize,
  block: boolean,
) {
  const visualClasses = variant === "editorial"
    ? ["tl-button", "tl-button-demo"]
    : size === "compact"
      ? ["tl-public-button", "tl-price-action"]
      : ["tl-button", `tl-button-${variant}`];

  if (size === "large") visualClasses.push("tl-auth-submit");

  return [styles.button, ...visualClasses, block ? styles.block : ""]
    .filter(Boolean)
    .join(" ");
}

export function MarketingButton(props: MarketingButtonProps) {
  const {
    variant = "primary",
    size = "default",
    block = false,
    buttonRef,
    linkRef,
  } = props;

  return (
    <ButtonPrimitive
      {...props}
      className={marketingButtonClasses(variant, size, block)}
      classes={{
        icon: styles.icon,
        loadingPlaceholder: styles.loadingPlaceholder,
        loadingContent: styles.loadingContent,
        loadingIndicator: styles.spinner,
      }}
      loadingIndicator={<SpinnerGap size={18} weight="bold" />}
      buttonRef={buttonRef}
      linkRef={linkRef}
    />
  );
}
